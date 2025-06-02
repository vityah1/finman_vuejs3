<template>
	<div class="add-reading">
		<div class="container-fluid">
			<div class="row mb-4">
				<div class="col-12">
					<nav aria-label="breadcrumb">
						<ol class="breadcrumb">
							<li class="breadcrumb-item">
								<router-link :to="{ name: 'utilities' }">Комунальні</router-link>
							</li>
							<li class="breadcrumb-item">
								<router-link :to="{ name: 'utilities_addresses' }">Адреси</router-link>
							</li>
							<li class="breadcrumb-item active">Додати показники</li>
						</ol>
					</nav>
					<h2><i class="fas fa-plus me-2"></i>{{ isEditing ? 'Редагувати' : 'Додати' }} показники лічильників</h2>
					<p class="text-muted">{{ isEditing ? 'Редагуйте' : 'Внесіть поточні' }} показники ваших лічильників</p>
				</div>
			</div>

			<div class="row">
				<div class="col-lg-8">
					<div class="card">
						<div class="card-header">
							<h5 class="mb-0"><i class="fas fa-edit me-2"></i>{{ isEditing ? 'Редагування' : 'Форма внесення' }} показників</h5>
						</div>
						<div class="card-body">
							<form @submit.prevent="saveReading">
								<div class="row">
									<div class="col-md-6">
										<div class="mb-3">
											<label for="addressSelect" class="form-label">Адреса <span class="text-danger">*</span></label>
											<select class="form-control" id="addressSelect" v-model="readingForm.address_id" 
													required @change="onAddressChange">
												<option value="">Оберіть адресу</option>
												<option v-for="address in addresses" :key="address.id" :value="address.id">
													{{ address.name }} - {{ address.address }}
												</option>
											</select>
										</div>
									</div>
									<div class="col-md-6">
										<div class="mb-3">
											<label for="serviceSelect" class="form-label">Служба <span class="text-danger">*</span></label>
											<select class="form-control" id="serviceSelect" v-model="readingForm.service_id" 
													required @change="onServiceChange" :disabled="!readingForm.address_id">
												<option value="">Оберіть службу</option>
												<option v-for="service in filteredServices" :key="service.id" :value="service.id">
													{{ service.name }} ({{ service.unit }})
												</option>
											</select>
										</div>
									</div>
								</div>

								<div class="row">
									<div class="col-md-4">
										<div class="mb-3">
											<label for="period" class="form-label">Період <span class="text-danger">*</span></label>
											<input type="month" class="form-control" id="period" 
												   v-model="readingForm.period" required>
										</div>
									</div>
									<div class="col-md-4">
										<div class="mb-3">
											<label for="readingDate" class="form-label">Дата зняття</label>
											<input type="date" class="form-control" id="readingDate" 
												   v-model="readingForm.reading_date">
										</div>
									</div>
									<div class="col-md-4">
										<div class="mb-3">
											<label for="tariffSelect" class="form-label">Тариф <span class="text-danger">*</span></label>
											<select class="form-control" id="tariffSelect" v-model="readingForm.tariff_id" 
													required :disabled="!readingForm.service_id">
												<option value="">Оберіть тариф</option>
												<option v-for="tariff in availableTariffs" :key="tariff.id" :value="tariff.id">
													{{ tariff.name }} - {{ formatRate(tariff.rate) }} {{ tariff.currency }}
													<span v-if="tariff.subscription_fee"> + {{ formatRate(tariff.subscription_fee) }} абон.</span>
												</option>
											</select>
										</div>
									</div>
								</div>

								<div class="row">
									<div class="col-md-6">
										<div class="mb-3">
											<label for="currentReading" class="form-label">Поточний показник <span class="text-danger">*</span></label>
											<div class="input-group">
												<input type="number" step="0.001" class="form-control" id="currentReading" 
													   v-model="readingForm.current_reading" required 
													   @input="calculateConsumption">
												<span v-if="selectedService" class="input-group-text">{{ selectedService.unit }}</span>
											</div>
										</div>
									</div>
									<div class="col-md-6">
										<div class="mb-3">
											<label for="previousReading" class="form-label">Попередній показник</label>
											<div class="input-group">
												<input type="number" step="0.001" class="form-control" id="previousReading" 
													   v-model="readingForm.previous_reading" 
													   @input="calculateConsumption" 
													   :placeholder="lastReadingHint">
												<span v-if="selectedService" class="input-group-text">{{ selectedService.unit }}</span>
											</div>
											<small class="form-text text-muted">
												{{ lastReadingHint ? `Останній показник: ${lastReadingHint}` : 'Автоматично підставиться останній показник' }}
											</small>
										</div>
									</div>
								</div>

								<div class="row">
									<div class="col-md-12">
										<div class="mb-3">
											<label for="notes" class="form-label">Примітки</label>
											<textarea class="form-control" id="notes" rows="2" 
													  v-model="readingForm.notes"
													  placeholder="Додаткова інформація про показники"></textarea>
										</div>
									</div>
								</div>

								<div class="form-check mb-3">
									<input class="form-check-input" type="checkbox" id="isPaid" v-model="readingForm.is_paid">
									<label class="form-check-label" for="isPaid">
										Показники оплачені
									</label>
								</div>

								<div class="d-flex justify-content-between">
									<router-link :to="{ name: 'utilities' }" class="btn btn-secondary">
										<i class="fas fa-arrow-left me-2"></i>Назад
									</router-link>
									<button type="submit" class="btn btn-primary" :disabled="isSaving">
										<i class="fas fa-save me-2"></i>{{ isSaving ? 'Збереження...' : (isEditing ? 'Оновити' : 'Зберегти') }}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>

				<div class="col-lg-4">
					<div class="card">
						<div class="card-header">
							<h5 class="mb-0"><i class="fas fa-calculator me-2"></i>Розрахунок</h5>
						</div>
						<div class="card-body">
							<div v-if="!calculationData.consumption" class="text-center text-muted">
								<i class="fas fa-info-circle fa-2x mb-3"></i>
								<p>Заповніть показники для автоматичного розрахунку</p>
							</div>
							<div v-else>
								<div class="mb-3">
									<h6>Споживання</h6>
									<div class="h4 text-primary">
										{{ calculationData.consumption }} 
										<small class="text-muted">{{ selectedService?.unit }}</small>
									</div>
								</div>

								<div class="mb-3">
									<h6>Тариф</h6>
									<div v-if="selectedTariff">
										{{ selectedTariff.name }}<br>
										<strong>{{ formatRate(selectedTariff.rate) }} {{ selectedTariff.currency }}</strong>
										<small class="text-muted d-block">за {{ selectedService?.unit }}</small>
										<div v-if="selectedTariff.subscription_fee" class="mt-1">
											<small class="text-info">
												+ {{ formatRate(selectedTariff.subscription_fee) }} {{ selectedTariff.currency }} абонплата
											</small>
										</div>
									</div>
									<div v-else class="text-muted">Тариф не обрано</div>
								</div>

								<div class="mb-3">
									<h6>До сплати</h6>
									<div class="h4 text-success">
										{{ formatCurrency(calculationData.cost) }}
									</div>
								</div>

								<hr>

								<div class="small text-muted">
									<strong>Формула:</strong><br>
									<span v-if="selectedTariff?.subscription_fee">
										{{ calculationData.consumption }} × {{ formatRate(selectedTariff?.rate || 0) }} + {{ formatRate(selectedTariff?.subscription_fee || 0) }} (абонплата) = {{ formatCurrency(calculationData.cost) }}
									</span>
									<span v-else>
										{{ calculationData.consumption }} × {{ formatRate(selectedTariff?.rate || 0) }} = {{ formatCurrency(calculationData.cost) }}
									</span>
								</div>
							</div>
						</div>
					</div>

					<div class="card mt-3">
						<div class="card-header">
							<h5 class="mb-0"><i class="fas fa-history me-2"></i>Останні показники</h5>
						</div>
						<div class="card-body">
							<div v-if="recentReadings.length === 0" class="text-center text-muted">
								<i class="fas fa-clock fa-2x mb-3"></i>
								<p>Історія показників порожня</p>
							</div>
							<div v-else>
								<div v-for="reading in recentReadings" :key="`${reading.service_id}-${reading.period}`" 
									 class="mb-2 p-2 bg-light rounded">
									<div class="d-flex justify-content-between">
										<div>
											<strong>{{ getServiceName(reading.service_id) }}</strong>
											<small class="text-muted d-block">{{ formatPeriod(reading.period) }}</small>
										</div>
										<div class="text-end">
											<div>{{ reading.current_reading }}</div>
											<small class="text-muted">{{ formatCurrency(reading.amount) }}</small>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div class="card mt-3">
						<div class="card-header">
							<h5 class="mb-0"><i class="fas fa-lightbulb me-2"></i>Поради</h5>
						</div>
						<div class="card-body">
							<ul class="list-unstyled small">
								<li class="mb-2">
									<i class="fas fa-check text-success me-2"></i>
									Знімайте показники в один і той же день місяця
								</li>
								<li class="mb-2">
									<i class="fas fa-check text-success me-2"></i>
									Перевіряйте правильність введених даних
								</li>
								<li class="mb-2">
									<i class="fas fa-check text-success me-2"></i>
									Фотографуйте лічильники для підтвердження
								</li>
								<li class="mb-2">
									<i class="fas fa-check text-success me-2"></i>
									Ведіть регулярний облік споживання
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
	useGetAddressesApiUtilitiesAddressesGet,
	useGetServicesApiUtilitiesServicesGet,
	useGetTariffsApiUtilitiesTariffsGet,
	useGetReadingsApiUtilitiesReadingsGet,
	useGetReadingApiUtilitiesReadingsReadingIdGet,
	useCreateReadingApiUtilitiesReadingsPost,
	useUpdateReadingApiUtilitiesReadingsReadingIdPatch
} from '@/api/utilities/utilities';
import type { UtilityReadingCreate, UtilityReadingUpdate } from '@/api/model';

interface AddressData {
	id: number;
	name: string;
	address: string;
}

interface ServiceData {
	id: number;
	name: string;
	unit: string;
	address_id: number;
}

interface TariffData {
	id: number;
	service_id: number;
	name: string;
	rate: number;
	subscription_fee?: number | null;
	currency: string;
	valid_from: string;
	valid_to?: string;
	is_active: boolean;
}

interface ReadingData {
	service_id: number;
	period: string;
	current_reading: number;
	amount?: number;
}

export default defineComponent({
	name: 'AddReading',
	setup() {
		const route = useRoute();
		const router = useRouter();

		// Reactive state
		const isSaving = ref(false);
		const lastReadingHint = ref('');
		const editReadingId = computed(() => route.query.editReadingId ? parseInt(route.query.editReadingId as string) : null);
		const isEditing = computed(() => editReadingId.value !== null);

		// Form data
		const readingForm = reactive({
			address_id: parseInt(route.query.addressId as string) || 0,
			service_id: parseInt(route.query.serviceId as string) || 0,
			period: route.query.period as string || new Date().toISOString().slice(0, 7),
			current_reading: 0,
			previous_reading: 0,
			tariff_id: 0,
			reading_date: new Date().toISOString().slice(0, 10),
			is_paid: false,
			notes: ''
		});

		// Calculation data
		const calculationData = reactive({
			consumption: 0,
			cost: 0
		});

		// API calls
		const { data: addressesData } = useGetAddressesApiUtilitiesAddressesGet();
		const { data: servicesData } = useGetServicesApiUtilitiesServicesGet();
		const { data: tariffsData } = useGetTariffsApiUtilitiesTariffsGet();
		const { data: readingsData } = useGetReadingsApiUtilitiesReadingsGet();

		// Edit reading data
		const { data: editingReadingData } = useGetReadingApiUtilitiesReadingsReadingIdGet(
			editReadingId,
			{ query: { enabled: isEditing } }
		);

		const createReadingMutation = useCreateReadingApiUtilitiesReadingsPost();
		const updateReadingMutation = useUpdateReadingApiUtilitiesReadingsReadingIdPatch();

		// Computed properties
		const addresses = computed(() => {
			return (addressesData.value?.data as AddressData[]) || [];
		});

		const services = computed(() => {
			return (servicesData.value?.data as ServiceData[]) || [];
		});

		const tariffs = computed(() => {
			return (tariffsData.value?.data as TariffData[]) || [];
		});

		const readings = computed(() => {
			return (readingsData.value?.data as ReadingData[]) || [];
		});

		const filteredServices = computed(() => {
			if (!readingForm.address_id) return [];
			return services.value.filter(service => service.address_id === readingForm.address_id);
		});

		const selectedService = computed(() => {
			return services.value.find(service => service.id === readingForm.service_id);
		});

		const availableTariffs = computed(() => {
			if (!readingForm.service_id) return [];
			
			const serviceTariffs = tariffs.value.filter(tariff => 
				tariff.service_id === readingForm.service_id && tariff.is_active
			);

			// Filter tariffs that are valid for the selected period
			const periodDate = new Date(readingForm.period + '-01');
			return serviceTariffs.filter(tariff => {
				const validFrom = new Date(tariff.valid_from);
				const validTo = tariff.valid_to ? new Date(tariff.valid_to) : null;
				
				return validFrom <= periodDate && (!validTo || validTo >= periodDate);
			});
		});

		const selectedTariff = computed(() => {
			return tariffs.value.find(tariff => tariff.id === readingForm.tariff_id);
		});

		const recentReadings = computed(() => {
			return readings.value
				.filter(reading => reading.service_id === readingForm.service_id)
				.sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime())
				.slice(0, 5);
		});

		// Methods
		const formatRate = (rate: number): string => {
			return new Intl.NumberFormat('uk-UA', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 4
			}).format(rate);
		};

		const formatCurrency = (amount: number): string => {
			return new Intl.NumberFormat('uk-UA', {
				style: 'currency',
				currency: 'UAH'
			}).format(amount);
		};

		const formatPeriod = (period: string): string => {
			const [year, month] = period.split('-');
			const date = new Date(parseInt(year), parseInt(month) - 1);
			return date.toLocaleDateString('uk-UA', { year: 'numeric', month: 'long' });
		};

		const getServiceName = (serviceId: number): string => {
			const service = services.value.find(s => s.id === serviceId);
			return service?.name || 'Невідома служба';
		};

		const onAddressChange = () => {
			readingForm.service_id = 0;
			readingForm.tariff_id = 0;
			calculationData.consumption = 0;
			calculationData.cost = 0;
		};

		const onServiceChange = () => {
			readingForm.tariff_id = 0;
			
			// Auto-select the current tariff
			if (availableTariffs.value.length === 1) {
				readingForm.tariff_id = availableTariffs.value[0].id;
			}

			// Get last reading for this service
			const lastReading = readings.value
				.filter(reading => reading.service_id === readingForm.service_id)
				.sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime())[0];

			if (lastReading) {
				readingForm.previous_reading = lastReading.current_reading;
				lastReadingHint.value = lastReading.current_reading.toString();
			} else {
				readingForm.previous_reading = 0;
				lastReadingHint.value = '';
			}

			calculateConsumption();
		};

		const calculateConsumption = () => {
			if (readingForm.current_reading && readingForm.previous_reading) {
				calculationData.consumption = readingForm.current_reading - readingForm.previous_reading;
				
				if (selectedTariff.value && calculationData.consumption > 0) {
					// Розрахунок: споживання × ставка + абонплата
					const consumptionCost = calculationData.consumption * selectedTariff.value.rate;
					const subscriptionFee = selectedTariff.value.subscription_fee || 0;
					calculationData.cost = consumptionCost + subscriptionFee;
				} else {
					calculationData.cost = 0;
				}
			} else {
				calculationData.consumption = 0;
				calculationData.cost = 0;
			}
		};

		const saveReading = async () => {
			isSaving.value = true;
			
			try {
				if (isEditing.value && editReadingId.value) {
					// Update existing reading
					const updateData: UtilityReadingUpdate = {
						current_reading: readingForm.current_reading,
						previous_reading: readingForm.previous_reading || undefined,
						tariff_id: readingForm.tariff_id,
						reading_date: readingForm.reading_date || undefined,
						is_paid: readingForm.is_paid || undefined,
						notes: readingForm.notes || undefined
					};

					await updateReadingMutation.mutateAsync({
						readingId: editReadingId.value,
						data: updateData
					});
				} else {
					// Create new reading
					const readingData: UtilityReadingCreate = {
						address_id: readingForm.address_id,
						service_id: readingForm.service_id,
						period: readingForm.period,
						current_reading: readingForm.current_reading,
						previous_reading: readingForm.previous_reading || undefined,
						tariff_id: readingForm.tariff_id,
						reading_date: readingForm.reading_date || undefined,
						is_paid: readingForm.is_paid || undefined,
						notes: readingForm.notes || undefined
					};

					await createReadingMutation.mutateAsync({
						data: readingData
					});
				}

				// Navigate back to utilities main page
				router.push({ name: 'utilities' });
			} catch (error) {
				console.error('Помилка збереження показника:', error);
				// TODO: Show error message to user
			} finally {
				isSaving.value = false;
			}
		};

		// Watchers
		watch([() => readingForm.current_reading, () => readingForm.previous_reading, () => readingForm.tariff_id], 
			calculateConsumption
		);

		// Watch for editing data
		watch(editingReadingData, (data) => {
			if (data?.data && isEditing.value) {
				const reading = data.data as any;
				readingForm.address_id = reading.address_id;
				readingForm.service_id = reading.service_id;
				readingForm.period = reading.period;
				readingForm.current_reading = reading.current_reading;
				readingForm.previous_reading = reading.previous_reading || 0;
				readingForm.tariff_id = reading.tariff_id;
				readingForm.reading_date = reading.reading_date ? reading.reading_date.slice(0, 10) : new Date().toISOString().slice(0, 10);
				readingForm.is_paid = reading.is_paid || false;
				readingForm.notes = reading.notes || '';
				
				// Recalculate consumption
				calculateConsumption();
			}
		}, { immediate: true });

		// Initialize form with query parameters
		onMounted(() => {
			if (readingForm.address_id && availableTariffs.value.length === 1) {
				readingForm.tariff_id = availableTariffs.value[0].id;
			}
		});

		return {
			// Data
			readingForm,
			calculationData,
			isSaving,
			isEditing,
			lastReadingHint,
			addresses,
			filteredServices,
			selectedService,
			availableTariffs,
			selectedTariff,
			recentReadings,

			// Methods
			formatRate,
			formatCurrency,
			formatPeriod,
			getServiceName,
			onAddressChange,
			onServiceChange,
			calculateConsumption,
			saveReading
		};
	}
});
</script>

<style scoped>
.add-reading {
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

.bg-light {
	background-color: #f8f9fa !important;
}

.input-group-text {
	background-color: #e9ecef;
	border-color: #ced4da;
}

.form-control:focus {
	border-color: #0d6efd;
	box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.btn-primary {
	background-color: #0d6efd;
	border-color: #0d6efd;
}

.text-primary {
	color: #0d6efd !important;
}

.text-success {
	color: #198754 !important;
}
</style>
