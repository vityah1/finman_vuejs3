<template>
	<div class="reading-list">
		<div class="container-fluid">
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
					<input type="month" class="form-control" id="periodFilter" v-model="selectedPeriod">
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
				<div class="col-md-3">
					<label for="statusFilter" class="form-label">Статус оплати</label>
					<select class="form-control" id="statusFilter" v-model="selectedPaymentStatus">
						<option value="">Всі</option>
						<option value="paid">Оплачено</option>
						<option value="unpaid">Не оплачено</option>
					</select>
				</div>
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
				<!-- Summary cards -->
				<div class="row mb-4">
					<div class="col-lg-3 col-md-6 mb-3">
						<div class="card text-center">
							<div class="card-body">
								<i class="fas fa-calendar fa-2x text-primary mb-2"></i>
								<h5 class="card-title">{{ totalReadings }}</h5>
								<p class="card-text">Показників</p>
							</div>
						</div>
					</div>
					<div class="col-lg-3 col-md-6 mb-3">
						<div class="card text-center">
							<div class="card-body">
								<i class="fas fa-money-bill fa-2x text-success mb-2"></i>
								<h5 class="card-title">{{ formatCurrency(totalCost) }}</h5>
								<p class="card-text">Загальна вартість</p>
							</div>
						</div>
					</div>
					<div class="col-lg-3 col-md-6 mb-3">
						<div class="card text-center">
							<div class="card-body">
								<i class="fas fa-check fa-2x text-info mb-2"></i>
								<h5 class="card-title">{{ paidReadings }}</h5>
								<p class="card-text">Оплачено</p>
							</div>
						</div>
					</div>
					<div class="col-lg-3 col-md-6 mb-3">
						<div class="card text-center">
							<div class="card-body">
								<i class="fas fa-exclamation fa-2x text-warning mb-2"></i>
								<h5 class="card-title">{{ unpaidReadings }}</h5>
								<p class="card-text">До оплати</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Readings table -->
				<div class="card">
					<div class="card-header">
						<h5 class="mb-0"><i class="fas fa-table me-2"></i>Показники лічильників</h5>
					</div>
					<div class="card-body">
						<div class="table-responsive">
							<table class="table table-hover">
								<thead>
									<tr>
										<th>Період</th>
										<th>Служба</th>
										<th>Показник</th>
										<th>Споживання</th>
										<th>Тариф</th>
										<th>Вартість</th>
										<th>Оплата</th>
										<th>Дії</th>
									</tr>
								</thead>
								<tbody>
									<tr v-for="reading in paginatedReadings" :key="`${reading.service_id}-${reading.period}`"
										:class="{ 'table-success': reading.is_paid }">
										<td>{{ formatPeriod(reading.period) }}</td>
										<td>
											<strong>{{ getServiceName(reading.service_id) }}</strong>
											<small class="text-muted d-block">{{ getServiceUnit(reading.service_id) }}</small>
										</td>
										<td>
											<strong>{{ reading.current_reading }}</strong>
											<small v-if="reading.previous_reading" class="text-muted d-block">
												попередній: {{ reading.previous_reading }}
											</small>
										</td>
										<td>
											<span v-if="reading.consumption" class="badge bg-primary">
												{{ reading.consumption }}
											</span>
											<span v-else class="text-muted">-</span>
										</td>
										<td>
											<span v-if="reading.tariff_id">{{ getTariffName(reading.tariff_id) }}</span>
											<span v-else class="text-muted">Не вказано</span>
										</td>
										<td>
											<strong v-if="reading.amount">{{ formatCurrency(reading.amount) }}</strong>
											<span v-else class="text-muted">-</span>
										</td>
										<td>
											<span v-if="reading.is_paid" class="badge bg-success">
												<i class="fas fa-check me-1"></i>Оплачено
											</span>
											<button v-else class="btn btn-sm btn-outline-warning" 
													@click="markAsPaid(reading)">
												<i class="fas fa-money-bill me-1"></i>Оплатити
											</button>
										</td>
										<td>
											<div class="btn-group btn-group-sm">
												<button class="btn btn-outline-primary" @click="editReading(reading)">
													<i class="fas fa-edit"></i>
												</button>
												<button class="btn btn-outline-danger" @click="confirmDelete(reading)">
													<i class="fas fa-trash"></i>
												</button>
											</div>
										</td>
									</tr>
								</tbody>
							</table>
						</div>

						<!-- Pagination -->
						<nav v-if="totalPages > 1" aria-label="Навігація по сторінках">
							<ul class="pagination justify-content-center">
								<li class="page-item" :class="{ disabled: currentPage === 1 }">
									<button class="page-link" @click="currentPage = 1" :disabled="currentPage === 1">
										<i class="fas fa-angle-double-left"></i>
									</button>
								</li>
								<li class="page-item" :class="{ disabled: currentPage === 1 }">
									<button class="page-link" @click="currentPage -= 1" :disabled="currentPage === 1">
										<i class="fas fa-angle-left"></i>
									</button>
								</li>
								<li v-for="page in visiblePages" :key="page" 
									class="page-item" :class="{ active: page === currentPage }">
									<button class="page-link" @click="currentPage = page">{{ page }}</button>
								</li>
								<li class="page-item" :class="{ disabled: currentPage === totalPages }">
									<button class="page-link" @click="currentPage += 1" :disabled="currentPage === totalPages">
										<i class="fas fa-angle-right"></i>
									</button>
								</li>
								<li class="page-item" :class="{ disabled: currentPage === totalPages }">
									<button class="page-link" @click="currentPage = totalPages" :disabled="currentPage === totalPages">
										<i class="fas fa-angle-double-right"></i>
									</button>
								</li>
							</ul>
						</nav>
					</div>
				</div>
			</div>
		</div>
	</div>
</template><script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
	useGetAddressApiUtilitiesAddressesAddressIdGet,
	useGetServicesApiUtilitiesServicesGet,
	useGetReadingsApiUtilitiesReadingsGet,
	useUpdateReadingApiUtilitiesReadingsReadingIdPatch
} from '@/api/utilities/utilities';

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
	id: number;
	service_id: number;
	period: string;
	current_reading: number;
	previous_reading?: number;
	consumption?: number;
	amount?: number;
	is_paid: boolean;
	tariff_id?: number;
}

export default defineComponent({
	name: 'ReadingList',
	setup() {
		const route = useRoute();
		const router = useRouter();
		const addressId = computed(() => parseInt(route.params.addressId as string));

		// Filters
		const selectedPeriod = ref('');
		const selectedService = ref('');
		const selectedPaymentStatus = ref('');
		const currentPage = ref(1);
		const itemsPerPage = 20;

		// API calls
		const { data: addressData } = useGetAddressApiUtilitiesAddressesAddressIdGet(addressId);
		const { data: servicesData } = useGetServicesApiUtilitiesServicesGet({ address_id: addressId.value });
		const { data: readingsData, isLoading } = useGetReadingsApiUtilitiesReadingsGet({
			address_id: addressId.value
		});

		// Computed properties
		const currentAddress = computed(() => addressData.value?.data as AddressData);
		const services = computed(() => (servicesData.value?.data as ServiceData[]) || []);
		const readings = computed(() => (readingsData.value?.data as ReadingData[]) || []);

		const filteredReadings = computed(() => {
			let filtered = readings.value;

			if (selectedPeriod.value) {
				filtered = filtered.filter(r => r.period === selectedPeriod.value);
			}
			if (selectedService.value) {
				filtered = filtered.filter(r => r.service_id === parseInt(selectedService.value));
			}
			if (selectedPaymentStatus.value === 'paid') {
				filtered = filtered.filter(r => r.is_paid);
			} else if (selectedPaymentStatus.value === 'unpaid') {
				filtered = filtered.filter(r => !r.is_paid);
			}

			return filtered.sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime());
		});

		const paginatedReadings = computed(() => {
			const start = (currentPage.value - 1) * itemsPerPage;
			return filteredReadings.value.slice(start, start + itemsPerPage);
		});

		const totalPages = computed(() => Math.ceil(filteredReadings.value.length / itemsPerPage));
		const totalReadings = computed(() => filteredReadings.value.length);
		const paidReadings = computed(() => filteredReadings.value.filter(r => r.is_paid).length);
		const unpaidReadings = computed(() => filteredReadings.value.filter(r => !r.is_paid).length);
		const totalCost = computed(() => filteredReadings.value.reduce((sum, r) => sum + (r.amount || 0), 0));

		const hasFilters = computed(() => 
			selectedPeriod.value || selectedService.value || selectedPaymentStatus.value
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
			// TODO: Get tariff name from API
			return tariffId ? `Тариф #${tariffId}` : '-';
		};

		const resetFilters = () => {
			selectedPeriod.value = '';
			selectedService.value = '';
			selectedPaymentStatus.value = '';
			currentPage.value = 1;
		};

		const markAsPaid = async (reading: ReadingData) => {
			// TODO: Implement mark as paid functionality
			console.log('Mark as paid:', reading);
		};

		const editReading = (reading: ReadingData) => {
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
			selectedPaymentStatus,
			currentPage,
			totalPages,
			totalReadings,
			paidReadings,
			unpaidReadings,
			totalCost,
			hasFilters,
			visiblePages,

			// Methods
			formatPeriod,
			formatCurrency,
			getServiceName,
			getServiceUnit,
			getTariffName,
			resetFilters,
			markAsPaid,
			editReading,
			confirmDelete
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
