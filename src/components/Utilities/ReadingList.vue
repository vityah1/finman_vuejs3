<template>
	<div class="reading-list">
		<div v-if="!addressId || addressId === 0" class="container-fluid">
			<div class="alert alert-warning">
				<i class="fas fa-exclamation-triangle me-2"></i>
				Невірна адреса. Будь ласка, оберіть адресу зі списку.
				<router-link :to="{ name: 'utilities_addresses' }" class="btn btn-sm btn-primary ms-3">
					Перейти до адрес
				</router-link>
			</div>
		</div>
		<div v-else class="container-fluid">
			<div class="row mb-4">
				<div class="col-sm-8">
					<nav aria-label="breadcrumb">
						<ol class="breadcrumb">
							<li class="breadcrumb-item">
								<router-link :to="{ name: 'utilities' }">Комунальні</router-link>
							</li>
							<li class="breadcrumb-item">
								<router-link :to="{ name: 'utilities_addresses' }">Адреси</router-link>
							</li>
							<li class="breadcrumb-item active">{{ currentAddress?.name || 'Показники' }}</li>
						</ol>
					</nav>
					<h2><i class="fas fa-chart-line me-2"></i>Показники лічильників</h2>
					<p v-if="currentAddress" class="text-muted">
						<i class="fas fa-map-marker-alt me-2"></i>{{ currentAddress.address }}
					</p>
				</div>
				<div class="col-sm-4 text-end">
					<router-link :to="{ name: 'utilities_add_reading', query: { addressId: addressId } }" 
								class="btn btn-primary">
						<i class="fas fa-plus me-2"></i>Додати показники
					</router-link>
				</div>
			</div>

			<!-- Filters -->
			<div class="row mb-4">
				<div class="col-md-3">
					<label for="periodFilter" class="form-label">Період</label>
					<MonthSelector v-model="selectedPeriod" />
				</div>
				<div class="col-md-3">
					<label for="serviceFilter" class="form-label">Служба</label>
					<select class="form-control" id="serviceFilter" v-model="selectedService">
						<option value="">Всі служби</option>
						<option v-for="service in services" :key="service.id" :value="service.id">
							{{ service.name }}
						</option>
					</select>
				</div>
				<div class="col-md-3"></div>
				<div class="col-md-3 d-flex align-items-end">
					<button class="btn btn-outline-secondary w-100" @click="resetFilters">
						<i class="fas fa-times me-2"></i>Скинути фільтри
					</button>
				</div>
			</div>

			<div v-if="isLoading" class="text-center">
				<div class="spinner-border" role="status">
					<span class="visually-hidden">Завантаження...</span>
				</div>
			</div>

			<div v-else-if="filteredReadings.length === 0" class="text-center">
				<div class="card">
					<div class="card-body">
						<i class="fas fa-chart-line fa-3x text-muted mb-3"></i>
						<h5>Показників не знайдено</h5>
						<p class="text-muted">
							{{ hasFilters ? 'Спробуйте змінити фільтри' : 'Додайте перші показники лічильників' }}
						</p>
						<router-link :to="{ name: 'utilities_add_reading', query: { addressId: addressId } }" 
									class="btn btn-primary">
							<i class="fas fa-plus me-2"></i>Додати показники
						</router-link>
					</div>
				</div>
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
import MonthSelector from './MonthSelector.vue';

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
		MonthSelector
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
			getCalculationDetails
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
</style>
