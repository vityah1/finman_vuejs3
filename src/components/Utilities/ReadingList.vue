<template>
	<div class="reading-list">
		<div v-if="!addressId || addressId === 0">
			<Message severity="warn" :closable="false">
				Невірна адреса. Будь ласка, оберіть адресу зі списку.
				<Button
					label="Перейти до адрес"
					size="small"
					class="ml-3"
					@click="$router.push({ name: 'utilities_addresses' })"
				/>
			</Message>
		</div>
		<div v-else>
			<div class="mb-4">
				<Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-3">
					<template #item="{ item }">
						<router-link v-if="item.route" :to="item.route" class="p-menuitem-link">
							<span class="p-menuitem-text">{{ item.label }}</span>
						</router-link>
						<span v-else class="p-menuitem-text">{{ item.label }}</span>
					</template>
				</Breadcrumb>
				<div class="flex justify-content-between align-items-center mb-2">
					<h2><i class="pi pi-chart-line mr-2"></i>Показники лічильників</h2>
					<Button
						label="Додати показники"
						icon="pi pi-plus"
						@click="$router.push({ name: 'utilities_add_reading', query: { addressId: addressId } })"
					/>
				</div>
				<p v-if="currentAddress" class="text-muted">
					<i class="pi pi-map-marker mr-2"></i>{{ currentAddress.address }}
				</p>
			</div>

			<!-- Filters -->
			<Card class="mb-3 filters-card">
				<template #content>
					<div class="flex flex-wrap gap-3 align-items-end">
						<div class="filter-field">
							<label for="periodFilter" class="filter-label">Період</label>
							<MonthSelector v-model="selectedPeriod" />
						</div>
						<div class="filter-field">
							<label for="serviceFilter" class="filter-label">Служба</label>
							<Dropdown
								id="serviceFilter"
								v-model="selectedService"
								:options="services"
								optionLabel="name"
								optionValue="id"
								placeholder="Всі служби"
								showClear
								class="filter-dropdown"
							/>
						</div>
						<Button
							label="Скинути"
							icon="pi pi-times"
							outlined
							severity="secondary"
							@click="resetFilters"
							class="reset-button"
						/>
					</div>
				</template>
			</Card>

			<div v-if="isLoading" class="text-center">
				<ProgressSpinner />
			</div>

			<div v-else-if="filteredReadings.length === 0" class="text-center">
				<Card>
					<template #content>
						<i class="pi pi-chart-line fa-3x text-muted mb-3"></i>
						<h5>Показників не знайдено</h5>
						<p class="text-muted">
							{{ hasFilters ? 'Спробуйте змінити фільтри' : 'Додайте перші показники лічильників' }}
						</p>
						<Button
							label="Додати показники"
							icon="pi pi-plus"
							@click="$router.push({ name: 'utilities_add_reading', query: { addressId: addressId } })"
						/>
					</template>
				</Card>
			</div>

			<div v-else>
				<!-- Grouped view always -->
				<GroupedReadings
					:addressId="addressId"
					:period="selectedPeriod || currentPeriod"
					:serviceFilter="selectedService"
				/>
			</div>
		</div>
	</div>
</template><script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
	useGetAddressApiUtilitiesAddressesAddressIdGet,
	useGetServicesApiUtilitiesServicesGet,
	useGetReadingsApiUtilitiesReadingsGet,
	useUpdateReadingApiUtilitiesReadingsReadingIdPatch,
	useGetTariffsApiUtilitiesTariffsGet,
	useGetLatestPeriodWithReadingsEndpointApiUtilitiesReadingsLatestPeriodAddressIdGet
} from '@/api/utilities/utilities';
import GroupedReadings from './GroupedReadings.vue';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Dropdown from 'primevue/dropdown';
import Message from 'primevue/message';
import Breadcrumb from 'primevue/breadcrumb';
import MonthSelector from './MonthSelector.vue';
import Card from 'primevue/card';

interface AddressData {
	id: number;
	name: string;
	address: string;
}

interface ServiceData {
	id: number;
	name: string;
	unit: string;
}

interface ReadingData {
	id?: number;
	service_id: number;
	period: string;
	current_reading: number;
	previous_reading?: number;
	consumption?: number;
	amount?: number;
	is_paid: boolean;
	tariff_id?: number;
	reading_date?: string;
	calculation_details?: string;
}

interface TariffData {
	id: number;
	name: string;
}

export default defineComponent({
	name: 'ReadingList',
	components: {
		GroupedReadings,
		MonthSelector,
		Button,
		ProgressSpinner,
		Dropdown,
		Message,
		Breadcrumb,
		Card
	},
	setup() {
		const route = useRoute();
		const router = useRouter();
		const addressId = computed(() => {
			const id = route.params.addressId;
			const parsedId = id ? parseInt(id as string) : 0;
			console.log('AddressId from route:', id, 'Parsed:', parsedId);
			return parsedId;
		});

		// Filters
		const selectedPeriod = ref('');
		const selectedService = ref('');
		const currentPage = ref(1);
		const itemsPerPage = 20;

		// UI state
		const expandedReadings = ref(new Set<number>());
		const viewMode = ref<'list' | 'grouped'>('grouped'); // За замовчуванням групований вигляд
		const currentPeriod = computed(() => new Date().toISOString().slice(0, 7));

		// Breadcrumb
		const breadcrumbHome = { icon: 'pi pi-home', route: '/' };
		const breadcrumbItems = computed(() => [
			{ label: 'Комунальні' },
			{ label: 'Адреси', route: { name: 'utilities_addresses' } },
			{ label: currentAddress.value?.name || 'Показники' }
		]);

		// API calls - only call if addressId is valid
		const { data: addressData } = useGetAddressApiUtilitiesAddressesAddressIdGet(
			addressId,
			{ query: { enabled: computed(() => addressId.value > 0) } }
		);
		const { data: servicesData } = useGetServicesApiUtilitiesServicesGet(
			computed(() => addressId.value > 0 ? { address_id: addressId.value } : {}),
			{ query: { enabled: computed(() => addressId.value > 0) } }
		);
		
		// Отримуємо останній період з показниками
		const { data: latestPeriodData } = useGetLatestPeriodWithReadingsEndpointApiUtilitiesReadingsLatestPeriodAddressIdGet(
			addressId,
			{ query: { enabled: computed(() => addressId.value > 0 && !selectedPeriod.value) } }
		);
		
		// Автоматично встановлюємо останній період
		watch(latestPeriodData, (data) => {
			console.log('Latest period data:', data);
			if (data?.data && typeof data.data === 'object' && 'period' in data.data) {
				const periodValue = (data.data as { period: string }).period;
				if (periodValue) {
					selectedPeriod.value = periodValue;
				}
			}
		}, { immediate: true });
		
		const { data: readingsData, isLoading } = useGetReadingsApiUtilitiesReadingsGet(
			computed(() => addressId.value > 0 ? { 
				address_id: addressId.value,
				period: selectedPeriod.value || undefined 
			} : {}),
			{ 
				query: { 
					enabled: computed(() => addressId.value > 0),
					refetchOnMount: true,
					staleTime: 0
				} 
			}
		);
		const { data: tariffsData } = useGetTariffsApiUtilitiesTariffsGet();

		// Computed properties
		const currentAddress = computed(() => addressData.value?.data as AddressData);
		const services = computed(() => (servicesData.value?.data as ServiceData[]) || []);
		const readings = computed(() => {
			const data = readingsData.value?.data;
			console.log('Raw readings data from API:', readingsData.value);
			console.log('Extracted readings data:', data);
			
			if (Array.isArray(data)) {
				return data as ReadingData[];
			} else if (data && typeof data === 'object') {
				// Якщо дані обгорнуті в об'єкт
				console.log('Data is object, trying to extract array');
				return (data as any).items || (data as any).results || [];
			}
			return [];
		});
		const tariffs = computed(() => (tariffsData.value?.data as TariffData[]) || []);

		const filteredReadings = computed(() => {
			let filtered = readings.value;

			if (selectedPeriod.value) {
				filtered = filtered.filter(r => r.period === selectedPeriod.value);
			}
			if (selectedService.value) {
				filtered = filtered.filter(r => r.service_id === parseInt(selectedService.value));
			}

			return filtered.sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime());
		});

		const paginatedReadings = computed(() => {
			if (!filteredReadings.value || filteredReadings.value.length === 0) {
				return [];
			}
			const start = (currentPage.value - 1) * itemsPerPage;
			return filteredReadings.value.slice(start, start + itemsPerPage);
		});

		const totalPages = computed(() => Math.ceil((filteredReadings.value?.length || 0) / itemsPerPage));
		const totalReadings = computed(() => filteredReadings.value?.length || 0);
		const paidReadings = computed(() => filteredReadings.value?.filter(r => r?.is_paid).length || 0);
		const unpaidReadings = computed(() => filteredReadings.value?.filter(r => !r?.is_paid).length || 0);
		const totalCost = computed(() => {
			if (!filteredReadings.value || filteredReadings.value.length === 0) return 0;
			return filteredReadings.value.reduce((sum, r) => sum + (r?.amount || 0), 0);
		});

		const hasFilters = computed(() => 
			selectedPeriod.value || selectedService.value
		);

		const visiblePages = computed(() => {
			const pages = [];
			const maxVisible = 5;
			let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
			let end = Math.min(totalPages.value, start + maxVisible - 1);
			
			if (end - start + 1 < maxVisible) {
				start = Math.max(1, end - maxVisible + 1);
			}
			
			for (let i = start; i <= end; i++) {
				pages.push(i);
			}
			return pages;
		});

		// Methods
		const formatPeriod = (period: string): string => {
			const [year, month] = period.split('-');
			const date = new Date(parseInt(year), parseInt(month) - 1);
			return date.toLocaleDateString('uk-UA', { year: 'numeric', month: 'long' });
		};

		const formatCurrency = (amount: number): string => {
			return new Intl.NumberFormat('uk-UA', {
				style: 'currency',
				currency: 'UAH'
			}).format(amount);
		};

		const getServiceName = (serviceId: number): string => {
			const service = services.value.find(s => s.id === serviceId);
			return service?.name || 'Невідома служба';
		};

		const getServiceUnit = (serviceId: number): string => {
			const service = services.value.find(s => s.id === serviceId);
			return service?.unit || '';
		};

		const getTariffName = (tariffId?: number): string => {
			if (!tariffId) return '-';
			const tariff = tariffs.value.find(t => t.id === tariffId);
			return tariff?.name || `Тариф #${tariffId}`;
		};

		const resetFilters = () => {
			selectedPeriod.value = '';
			selectedService.value = '';
			currentPage.value = 1;
		};

		const markAsPaid = async (reading: ReadingData) => {
			// TODO: Implement mark as paid functionality
			console.log('Mark as paid:', reading);
		};

		const editReading = (reading: ReadingData) => {
			if (!reading?.id) {
				console.error('Reading has no id:', reading);
				return;
			}
			// Перенаправляємо на форму додавання показників з параметрами для редагування
			router.push({
				name: 'utilities_add_reading',
				query: {
					addressId: addressId.value,
					serviceId: reading.service_id,
					editReadingId: reading.id,
					period: reading.period
				}
			});
		};

		const confirmDelete = (reading: ReadingData) => {
			// TODO: Implement delete functionality
			console.log('Delete reading:', reading);
		};

		const getPreviousReading = (reading: ReadingData | undefined): number | null => {
			if (!reading) return null;
			
			// Спочатку перевіряємо, чи є попередній показник в самому об'єкті
			if (reading.previous_reading !== undefined && reading.previous_reading !== null) {
				return reading.previous_reading;
			}

			// Шукаємо попередній показник в історії для тієї ж служби
			const serviceReadings = readings.value
				.filter(r => r && r.service_id === reading.service_id && r.period < reading.period)
				.sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime());

			return serviceReadings.length > 0 ? serviceReadings[0].current_reading : null;
		};
		
		const formatRate = (rate: number): string => {
			return new Intl.NumberFormat('uk-UA', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 4
			}).format(rate);
		};
		
		const formatDate = (dateString?: string): string => {
			if (!dateString) return '-';
			return new Date(dateString).toLocaleDateString('uk-UA');
		};
		
		const toggleDetails = (readingId: number | undefined) => {
			if (!readingId) return;
			
			if (expandedReadings.value.has(readingId)) {
				expandedReadings.value.delete(readingId);
			} else {
				expandedReadings.value.add(readingId);
			}
		};
		
		const getCalculationDetails = (reading: ReadingData) => {
			if (!reading || !reading.calculation_details) return null;
			try {
				return JSON.parse(reading.calculation_details);
			} catch (e) {
				console.error('Error parsing calculation details:', e);
				return null;
			}
		};

		return {
			// Data
			addressId,
			currentAddress,
			services,
			readings,
			filteredReadings,
			paginatedReadings,
			isLoading,
			selectedPeriod,
			selectedService,
			currentPage,
			totalPages,
			totalReadings,
			paidReadings,
			unpaidReadings,
			totalCost,
			hasFilters,
			visiblePages,
			expandedReadings,
			viewMode,
			currentPeriod,

			// Methods
			formatPeriod,
			formatCurrency,
			formatRate,
			formatDate,
			getServiceName,
			getServiceUnit,
			getTariffName,
			resetFilters,
			markAsPaid,
			editReading,
			confirmDelete,
			getPreviousReading,
			toggleDetails,
			getCalculationDetails,
			breadcrumbHome,
			breadcrumbItems
		};
	}
});
</script>

<style scoped>
.reading-list {
	padding: 20px 0;
}

.breadcrumb {
	background: none;
	padding: 0;
}

.card {
	border: none;
	box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.table-success {
	background-color: rgba(25, 135, 84, 0.1) !important;
}

.pagination .page-link {
	color: #0d6efd;
}

.pagination .page-item.active .page-link {
	background-color: #0d6efd;
	border-color: #0d6efd;
}

/* Filters styling */
.filters-card :deep(.p-card-content) {
	padding: 1rem;
}

.filter-field {
	flex: 0 0 auto;
	min-width: 200px;
}

.filter-label {
	display: block;
	font-weight: 600;
	font-size: 0.875rem;
	color: #2c3e50;
	margin-bottom: 0.5rem;
}

.filter-dropdown {
	min-width: 200px;
}

.reset-button {
	margin-top: auto;
}

@media (max-width: 768px) {
	.filter-field {
		flex: 1 1 100%;
		min-width: 100%;
	}

	.filter-dropdown {
		width: 100%;
	}

	.reset-button {
		width: 100%;
	}
}
</style>
