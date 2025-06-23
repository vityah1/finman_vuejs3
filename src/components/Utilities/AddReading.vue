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
											<PeriodSelector v-model="readingForm.period" />
										</div>
									</div>
									<div class="col-md-4">
										<div class="mb-3">
											<label for="readingDate" class="form-label">Дата зняття</label>
											<input type="date" class="form-control" id="readingDate" 
												   v-model="readingForm.reading_date">
										</div>
									</div>
									<div class="col-md-4" v-if="!isElectricityService">
										<div class="mb-3">
											<label for="tariffSelect" class="form-label">Тариф <span class="text-danger">*</span></label>
											<select v-if="!isSharedMeterService" class="form-control" id="tariffSelect" v-model="readingForm.tariff_id" 
													required :disabled="!readingForm.service_id">
												<option value="">Оберіть тариф</option>
												<option v-for="tariff in availableTariffs" :key="tariff.id" :value="tariff.id">
													{{ tariff.name }} - {{ formatRate(tariff.rate) }} {{ tariff.currency }}
												</option>
											</select>
											<div v-else class="alert alert-info p-2 mb-0">
												<small>
													<i class="fas fa-info-circle me-1"></i>
													Для цієї служби будуть автоматично розраховані суми за всіма тарифами:
													<ul class="mb-0 mt-1">
														<li v-for="tariff in availableTariffs" :key="tariff.id">
															{{ tariff.name }} - {{ formatRate(tariff.rate) }} {{ tariff.currency }}/{{ selectedService?.unit }}
														</li>
													</ul>
												</small>
											</div>
										</div>
									</div>
								</div>

								<div class="row" v-if="isFixedPaymentService">
									<!-- Для фіксованих платежів (квартплата, сміття) -->
									<div class="col-md-6">
										<div class="mb-3">
											<label for="paymentAmount" class="form-label">Сума до сплати <span class="text-danger">*</span></label>
											<div class="input-group">
												<input type="number" step="0.01" class="form-control" id="paymentAmount" 
													   v-model="readingForm.amount" required>
												<span class="input-group-text">{{ selectedTariff?.currency || 'UAH' }}</span>
											</div>
											<small class="form-text text-muted">
												Введіть суму згідно квитанції
											</small>
										</div>
									</div>
								</div>

								<div class="row" v-else-if="isSharedMeterService">
									<!-- Для служб зі спільним показником -->
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
													   :placeholder="lastReadingHint"
													   readonly>
												<span v-if="selectedService" class="input-group-text">{{ selectedService.unit }}</span>
											</div>
											<small class="form-text text-muted">
												{{ lastReadingHint ? `Останній показник: ${lastReadingHint}` : 'Автоматично підставиться останній показник' }}
											</small>
										</div>
									</div>
								</div>

								<div class="row" v-else-if="isElectricityService">
									<!-- Для електрики - декілька показників -->
									<div class="col-12">
										<h6 class="mb-3">Показники лічильника</h6>
									</div>
									<div class="col-md-6" v-for="tariffGroup in groupedTariffs" :key="tariffGroup.type">
										<div class="card mb-3">
											<div class="card-header">
												<strong>{{ getTariffTypeLabel(tariffGroup.type) }}</strong>
											</div>
											<div class="card-body">
												<div class="mb-3">
													<label class="form-label">Поточний показник</label>
													<div class="input-group">
														<input type="number" step="0.001" class="form-control" 
															   v-model="multiReadingForm[tariffGroup.type].current_reading" 
															   @input="calculateMultiConsumption(tariffGroup.type)">
														<span class="input-group-text">{{ selectedService?.unit }}</span>
													</div>
												</div>
												<div class="mb-3">
													<label class="form-label">Попередній показник</label>
													<div class="input-group">
														<input type="number" step="0.001" class="form-control" 
															   v-model="multiReadingForm[tariffGroup.type].previous_reading" 
															   @input="calculateMultiConsumption(tariffGroup.type)"
															   readonly>
														<span class="input-group-text">{{ selectedService?.unit }}</span>
													</div>
												</div>
												<div class="text-muted">
													<small>Споживання: {{ multiReadingForm[tariffGroup.type].consumption || 0 }} {{ selectedService?.unit }}</small>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div class="row" v-else>
									<!-- Стандартний варіант -->
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
													   :placeholder="lastReadingHint"
													   readonly>
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
									<button type="button" class="btn btn-secondary" @click="goBack">
										<i class="fas fa-arrow-left me-2"></i>Назад
									</button>

									<div>
										<button v-if="isEditing" type="button" class="btn btn-danger me-2" @click="deleteReading" :disabled="isDeleting">
											<i class="fas fa-trash me-2"></i>{{ isDeleting ? 'Видалення...' : 'Видалити' }}
										</button>
										<button type="submit" class="btn btn-primary" :disabled="isSaving">
											<i class="fas fa-save me-2"></i>{{ isSaving ? 'Збереження...' : (isEditing ? 'Оновити' : 'Зберегти') }}
										</button>
									</div>
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
							<div v-if="!calculationData.consumption && !isSharedMeterService" class="text-center text-muted">
								<i class="fas fa-info-circle fa-2x mb-3"></i>
								<p>Заповніть показники для автоматичного розрахунку</p>
							</div>
							<div v-else-if="isSharedMeterService && readingForm.current_reading">
								<div class="mb-3">
									<h6>Споживання</h6>
									<div class="h4 text-primary">
										{{ calculationData.consumption || (readingForm.current_reading - (readingForm.previous_reading || 0)) }} 
										<small class="text-muted">{{ selectedService?.unit }}</small>
									</div>
								</div>

								<div class="mb-3">
									<h6>Розрахунок за тарифами:</h6>
									<table class="table table-sm">
										<tbody>
											<tr v-for="tariff in availableTariffs" :key="tariff.id">
												<td>{{ tariff.name }}</td>
												<td class="text-end">
													<span v-if="tariff.tariff_type !== 'subscription'">
														{{ formatRate(tariff.rate) }} × {{ calculationData.consumption || (readingForm.current_reading - (readingForm.previous_reading || 0)) }}
													</span>
													<span v-else>
														Фіксовано
													</span>
												</td>
												<td class="text-end fw-bold">
													{{ formatCurrency(calculateTariffAmount(tariff)) }}
												</td>
											</tr>
										</tbody>
										<tfoot>
											<tr class="fw-bold">
												<td colspan="2">Всього до сплати:</td>
												<td class="text-end text-success h5">{{ formatCurrency(calculateTotalAmount()) }}</td>
											</tr>
										</tfoot>
									</table>
								</div>
							</div>
							<div v-else-if="!isSharedMeterService && calculationData.consumption">
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
									{{ calculationData.consumption }} × {{ formatRate(selectedTariff?.rate || 0) }} = {{ formatCurrency(calculationData.cost) }}
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
import PeriodSelector from './PeriodSelector.vue';
import { 
	useGetAddressesApiUtilitiesAddressesGet,
	useGetServicesApiUtilitiesServicesGet,
	useGetTariffsApiUtilitiesTariffsGet,
	useGetReadingsApiUtilitiesReadingsGet,
	useGetReadingApiUtilitiesReadingsReadingIdGet,
	useCreateReadingApiUtilitiesReadingsPost,
	useUpdateReadingApiUtilitiesReadingsReadingIdPatch,
	useDeleteReadingApiUtilitiesReadingsReadingIdDelete,
	useCreateTariffApiUtilitiesTariffsPost
} from '@/api/utilities/utilities';
import type { UtilityReadingCreate, UtilityReadingUpdate, UtilityTariffResponse } from '@/api/model';

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
	has_shared_meter?: boolean;
}

interface TariffData {
	id: number;
	service_id: number;
	name: string;
	rate: number;
	currency: string;
	valid_from: string;
	valid_to?: string;
	is_active: boolean;
	// Нові поля
	tariff_type?: string;
	group_code?: string;
	calculation_method?: string;
	percentage_of?: number;
}

interface ReadingData {
	service_id: number;
	period: string;
	current_reading: number;
	tariff_id?: number;
	amount?: number;
}

export default defineComponent({
	name: 'AddReading',
	components: {
		PeriodSelector
	},
	setup() {
		const route = useRoute();
		const router = useRouter();

		// Reactive state
		const isSaving = ref(false);
		const isDeleting = ref(false);
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
			notes: '',
			amount: 0  // Для фіксованих платежів
		});
		
		// Multi reading form for electricity (day/night)
		const multiReadingForm = reactive<Record<string, any>>({
			day: {
				current_reading: 0,
				previous_reading: 0,
				consumption: 0,
				tariff_id: 0
			},
			night: {
				current_reading: 0,
				previous_reading: 0,
				consumption: 0,
				tariff_id: 0
			}
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
			editReadingId.value || 0,
			{ query: { enabled: isEditing.value } }
		);

		const createReadingMutation = useCreateReadingApiUtilitiesReadingsPost();
		const updateReadingMutation = useUpdateReadingApiUtilitiesReadingsReadingIdPatch();
		const deleteReadingMutation = useDeleteReadingApiUtilitiesReadingsReadingIdDelete();
		const createTariffMutation = useCreateTariffApiUtilitiesTariffsPost();

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
		
		// Service type detection based on has_shared_meter flag
		const isSharedMeterService = computed(() => {
			return selectedService.value?.has_shared_meter === true;
		});
		
		const isElectricityService = computed(() => {
			if (!selectedService.value) return false;
			const name = selectedService.value.name.toLowerCase();
			return name.includes('електр') || name.includes('electric');
		});
		
		// Визначення фіксованих платежів (квартплата, сміття)
		const isFixedPaymentService = computed(() => {
			if (!selectedService.value) return false;
			const name = selectedService.value.name.toLowerCase();
			const fixedServices = ['квартплата', 'сміття', 'rent', 'garbage'];
			return fixedServices.some(service => name.includes(service));
		});
		
		// Grouped tariffs for multi-tariff services
		const groupedTariffs = computed(() => {
			if (!readingForm.service_id) return [];
			
			const serviceTariffs = availableTariffs.value;
			const groups: Record<string, TariffData[]> = {};
			
			serviceTariffs.forEach(tariff => {
				const type = tariff.tariff_type || 'standard';
				if (!groups[type]) {
					groups[type] = [];
				}
				groups[type].push(tariff);
			});
			
			// Return as array for v-for
			return Object.entries(groups).map(([type, tariffs]) => ({
				type,
				tariffs,
				mainTariff: tariffs[0] // Assume first tariff is main
			}));
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
		
		const getTariffTypeLabel = (type: string): string => {
			const types: Record<string, string> = {
				consumption: 'Споживання',
				drainage: 'Водовідведення',
				day: 'Денний тариф',
				night: 'Нічний тариф',
				standard: 'Стандартний'
			};
			return types[type] || type;
		};

		const onAddressChange = () => {
			readingForm.service_id = 0;
			readingForm.tariff_id = 0;
			calculationData.consumption = 0;
			calculationData.cost = 0;
		};

		// Create default tariff for fixed payment services (rent, garbage, etc.)
		const createDefaultTariffForFixedPayment = async () => {
			if (!selectedService.value) return;
			
			try {
				const defaultTariff = {
					service_id: selectedService.value.id,
					name: 'Стандартний тариф',
					rate: 1, // For fixed payments, rate is always 1
					currency: 'UAH',
					valid_from: new Date().toISOString(),
					is_active: true,
					calculation_method: 'fixed'
				};
				
				const result = await createTariffMutation.mutateAsync({
					data: defaultTariff
				});
				
				// Auto-select the newly created tariff
				const tariffData = result.data as UtilityTariffResponse;
				if (tariffData?.id) {
					readingForm.tariff_id = tariffData.id;
				}
			} catch (error) {
				console.error('Помилка створення тарифу для фіксованого платежу:', error);
			}
		};

		const onServiceChange = async () => {
			readingForm.tariff_id = 0;
			
			// Reset multi-reading form
			Object.keys(multiReadingForm).forEach(key => {
				delete multiReadingForm[key];
			});
			// Re-initialize default types
			multiReadingForm['day'] = {
				current_reading: 0,
				previous_reading: 0,
				consumption: 0,
				tariff_id: 0
			};
			multiReadingForm['night'] = {
				current_reading: 0,
				previous_reading: 0,
				consumption: 0,
				tariff_id: 0
			};
			
			// Auto-select tariffs based on service type
			if (isElectricityService.value) {
				// For electricity, assign tariffs to corresponding types
				groupedTariffs.value.forEach(group => {
					// Initialize multiReadingForm for this type if not exists
					if (!multiReadingForm[group.type]) {
						multiReadingForm[group.type] = {
							current_reading: 0,
							previous_reading: 0,
							consumption: 0,
							tariff_id: 0
						};
					}
					if (group.mainTariff && multiReadingForm[group.type]) {
						multiReadingForm[group.type].tariff_id = group.mainTariff.id;
					}
				});
				
				// Calculate costs for electricity after setting tariffs
				calculateTotalCost();
			} else if (isFixedPaymentService.value && availableTariffs.value.length === 0) {
				// For fixed payment services without tariffs, create default tariff
				await createDefaultTariffForFixedPayment();
			} else if (availableTariffs.value.length === 1) {
				// Auto-select the current tariff for single tariff services
				readingForm.tariff_id = availableTariffs.value[0].id;
			}

			// Get last reading for this service
			if (!isEditing.value && readingForm.service_id) {
				findLastReading();
			}

			calculateConsumption();
		};

		// Новий метод для пошуку попереднього показника
		const findLastReading = () => {
			if (!readingForm.service_id) return;

			// Фільтруємо показники для поточної служби та періоду меншого за поточний
			// Виключаємо показники з нульовим current_reading (наприклад, абонплата)
			const serviceReadings = readings.value
				.filter(reading => 
					reading.service_id === readingForm.service_id &&
					reading.period < readingForm.period &&
					reading.current_reading > 0  // Тільки показники з реальними даними
				)
				.sort((a, b) => b.period.localeCompare(a.period));

			if (isElectricityService.value) {
				// Для електрики шукаємо по типах
				groupedTariffs.value.forEach(group => {
					const typeReadings = serviceReadings.filter(r => {
						// Шукаємо показники для конкретного типу тарифу
						const readingTariff = tariffs.value.find(t => t.id === r.tariff_id);
						return readingTariff?.tariff_type === group.type;
					});

					if (typeReadings.length > 0 && multiReadingForm[group.type]) {
						multiReadingForm[group.type].previous_reading = typeReadings[0].current_reading;
					}
				});
			} else if (isSharedMeterService.value) {
				// Для служб зі спільним лічильником просто беремо останній показник
				if (serviceReadings.length > 0) {
					readingForm.previous_reading = serviceReadings[0].current_reading;
					lastReadingHint.value = `${serviceReadings[0].current_reading} (${serviceReadings[0].period})`;
				} else {
					readingForm.previous_reading = 0;
					lastReadingHint.value = 'Перший показник';
				}
			} else {
				// Для звичайних служб шукаємо по тарифу
				if (readingForm.tariff_id) {
					const tariffReadings = serviceReadings.filter(r => r.tariff_id === readingForm.tariff_id);
					if (tariffReadings.length > 0) {
						readingForm.previous_reading = tariffReadings[0].current_reading;
						lastReadingHint.value = `${tariffReadings[0].current_reading} (${tariffReadings[0].period})`;
					} else {
						// Якщо немає показників для цього тарифу, беремо будь-який останній
						if (serviceReadings.length > 0) {
							readingForm.previous_reading = serviceReadings[0].current_reading;
							lastReadingHint.value = `${serviceReadings[0].current_reading} (${serviceReadings[0].period})`;
						} else {
							readingForm.previous_reading = 0;
							lastReadingHint.value = 'Перший показник';
						}
					}
				} else if (serviceReadings.length > 0) {
					readingForm.previous_reading = serviceReadings[0].current_reading;
					lastReadingHint.value = `${serviceReadings[0].current_reading} (${serviceReadings[0].period})`;
				} else {
					readingForm.previous_reading = 0;
					lastReadingHint.value = 'Перший показник';
				}
			}
		};

		const calculateConsumption = () => {
			if (readingForm.current_reading && readingForm.previous_reading) {
				calculationData.consumption = readingForm.current_reading - readingForm.previous_reading;
				
				if (selectedTariff.value && calculationData.consumption > 0) {
					// Розрахунок: споживання × ставка + абонплата
					const consumptionCost = calculationData.consumption * selectedTariff.value.rate;
					calculationData.cost = consumptionCost;
				} else {
					calculationData.cost = 0;
				}
			} else if (readingForm.current_reading > 0) {
				// Якщо немає попереднього показника
				calculationData.consumption = readingForm.current_reading;
				if (selectedTariff.value && calculationData.consumption > 0) {
					const consumptionCost = calculationData.consumption * selectedTariff.value.rate;
					calculationData.cost = consumptionCost;
				} else {
					calculationData.cost = 0;
				}
			} else {
				calculationData.consumption = 0;
				calculationData.cost = 0;
			}
		};
		
		const calculateMultiConsumption = (type: string) => {
			// Initialize if not exists
			if (!multiReadingForm[type]) {
				multiReadingForm[type] = {
					current_reading: 0,
					previous_reading: 0,
					consumption: 0,
					tariff_id: 0
				};
			}
			
			const reading = multiReadingForm[type];
			if (reading && reading.current_reading && reading.previous_reading) {
				reading.consumption = reading.current_reading - reading.previous_reading;
			} else {
				reading.consumption = 0;
			}
			
			// Recalculate total cost immediately
			calculateTotalCost();
		};
		
		const calculateTotalCost = () => {
			let totalCost = 0;
			
			if (isElectricityService.value) {
				// Sum costs from all reading types
				groupedTariffs.value.forEach(group => {
					const reading = multiReadingForm[group.type];
					const tariff = group.mainTariff;
					
					if (reading && tariff && reading.consumption > 0) {
						totalCost += reading.consumption * tariff.rate;
					}
				});
			}
			
			calculationData.cost = totalCost;
		};

		const saveReading = async () => {
			isSaving.value = true;
			
			try {
				if (isFixedPaymentService.value && !isEditing.value) {
					// Для фіксованих платежів (квартплата, сміття)
					const readingData: UtilityReadingCreate = {
						address_id: readingForm.address_id,
						service_id: readingForm.service_id,
						period: readingForm.period,
						current_reading: readingForm.amount || 0,  // Для фіксованих платежів = сума
						previous_reading: 0,
						tariff_id: readingForm.tariff_id,
						reading_date: readingForm.reading_date || undefined,
						is_paid: readingForm.is_paid || undefined,
						notes: readingForm.notes || undefined
					};
					
					await createReadingMutation.mutateAsync({
						data: readingData
					});
				} else if (isElectricityService.value && !isEditing.value) {
					// For electricity service - create reading for each tariff type (day/night)
					for (const [readingType, formData] of Object.entries(multiReadingForm)) {
						if (formData.tariff_id === 0) continue; // Skip if no tariff selected
						
						const readingData: UtilityReadingCreate = {
							address_id: readingForm.address_id,
							service_id: readingForm.service_id,
							period: readingForm.period,
							current_reading: formData.current_reading,
							previous_reading: formData.previous_reading || undefined,
							tariff_id: formData.tariff_id,
							reading_date: readingForm.reading_date || undefined,
							is_paid: readingForm.is_paid || undefined,
							notes: readingForm.notes || undefined,
							reading_type: readingType
						};
						
						await createReadingMutation.mutateAsync({
							data: readingData
						});
					}
				} else if (isSharedMeterService.value && !isEditing.value) {
					// For services with shared meter (water, gas) - create ONE reading with main tariff
					// The backend will handle all tariff calculations automatically
					const mainTariff = availableTariffs.value.find(t => t.calculation_method === 'standard') || availableTariffs.value[0];
					
					if (!mainTariff) {
						throw new Error('No tariff found for shared meter service');
					}
					
					const readingData: UtilityReadingCreate = {
						address_id: readingForm.address_id,
						service_id: readingForm.service_id,
						period: readingForm.period,
						current_reading: readingForm.current_reading,
						previous_reading: readingForm.previous_reading || undefined,
						tariff_id: mainTariff.id, // Use main tariff, backend will calculate all
						reading_date: readingForm.reading_date || undefined,
						is_paid: readingForm.is_paid || undefined,
						notes: readingForm.notes || undefined
					};
					
					await createReadingMutation.mutateAsync({
						data: readingData
					});
					
				} else if (isEditing.value && editReadingId.value) {
					// Update existing reading
					const updateData: UtilityReadingUpdate = {
						period: readingForm.period,
						current_reading: isFixedPaymentService.value ? (readingForm.amount || 0) : readingForm.current_reading,
						previous_reading: isFixedPaymentService.value ? 0 : (readingForm.previous_reading || undefined),
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
					// Create new reading (standard)
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

				// Navigate back to reading list
				router.push({ 
					name: 'utilities_readings', 
					params: { addressId: readingForm.address_id } 
				});
			} catch (error) {
				console.error('Помилка збереження показника:', error);
				// TODO: Show error message to user
			} finally {
				isSaving.value = false;
			}
		};
		
		// Calculate amount for single tariff
		const calculateTariffAmount = (tariff: TariffData): number => {
			const consumption = calculationData.consumption || 
				(readingForm.current_reading - (readingForm.previous_reading || 0));
			
			if (tariff.tariff_type === 'subscription') {
				return tariff.rate; // Абонплата - фіксована сума
			} else {
				return consumption * tariff.rate;
			}
		};
		
		// Calculate total amount for shared meter services
		const calculateTotalAmount = (): number => {
			if (!isSharedMeterService.value) return calculationData.cost;
			
			let total = 0;
			availableTariffs.value.forEach(tariff => {
				total += calculateTariffAmount(tariff);
			});
			return total;
		};

		const goBack = () => {
			if (readingForm.address_id) {
				router.push({ 
					name: 'utilities_readings', 
					params: { addressId: readingForm.address_id } 
				});
			} else {
				router.push({ name: 'utilities' });
			}
		};

		const deleteReading = async () => {
			if (!editReadingId.value) {
				return;
			}
			
			if (!confirm('Ви впевнені, що хочете видалити цей показник?')) {
				return;
			}
			
			isDeleting.value = true;
			
			try {
				await deleteReadingMutation.mutateAsync({
					readingId: editReadingId.value
				});
				
				// Повертаємось назад після успішного видалення
				goBack();
			} catch (error) {
				console.error('Error deleting reading:', error);
				alert('Помилка при видаленні показника');
			} finally {
				isDeleting.value = false;
			}
		};

		// Watchers
		watch([() => readingForm.current_reading, () => readingForm.previous_reading], 
			calculateConsumption
		);

		// Watch tariff changes
		watch(() => readingForm.tariff_id, () => {
			if (!isEditing.value && readingForm.service_id && !isSharedMeterService.value) {
				findLastReading();
			}
			calculateConsumption();
		});

		// Watch multiReadingForm for electricity calculations
		watch(() => multiReadingForm, () => {
			if (isElectricityService.value) {
				calculateTotalCost();
			}
		}, { deep: true });

		// Watch for tariff changes in multiReadingForm
		watch(() => groupedTariffs.value, () => {
			if (isElectricityService.value) {
				calculateTotalCost();
			}
		}, { deep: true });

		// Watch for editing data
		watch(editingReadingData, (data) => {
			if (data?.data && isEditing.value) {
				const reading = data.data as any;
				console.log('Editing reading data:', reading);
				
				// Перевірка на наявність reading
				if (!reading) {
					console.error('Reading data is undefined');
					return;
				}
				
				// Безпечне присвоєння значень
				readingForm.address_id = reading.address_id || 0;
				readingForm.service_id = reading.service_id || 0;
				readingForm.period = reading.period || '';
				readingForm.current_reading = reading.current_reading || 0;
				readingForm.previous_reading = reading.previous_reading || 0;
				readingForm.tariff_id = reading.tariff_id || 0;
				readingForm.reading_date = reading.reading_date ? reading.reading_date.slice(0, 10) : new Date().toISOString().slice(0, 10);
				readingForm.is_paid = reading.is_paid || false;
				readingForm.notes = reading.notes || '';
				
				// For fixed payment services, amount field should be filled
				if (reading.service && isFixedPaymentService.value) {
					readingForm.amount = reading.current_reading || 0;
				}
				
				// Перевірка, чи це електрика або служба з multiple readings
				if (reading.reading_type && (isElectricityService.value || reading.service?.service_group === 'electricity')) {
					// Для електрики потрібна спеціальна обробка
					const readingType = reading.reading_type;
					// Initialize multiReadingForm for this type if not exists
					if (!multiReadingForm[readingType]) {
						multiReadingForm[readingType] = {
							current_reading: 0,
							previous_reading: 0,
							consumption: 0,
							tariff_id: 0
						};
					}
					if (multiReadingForm[readingType]) {
						multiReadingForm[readingType].current_reading = reading.current_reading || 0;
						multiReadingForm[readingType].previous_reading = reading.previous_reading || 0;
						multiReadingForm[readingType].consumption = reading.consumption || 0;
						multiReadingForm[readingType].tariff_id = reading.tariff_id || 0;
					}
					
					// Recalculate after loading data
					setTimeout(() => {
						if (isElectricityService.value) {
							calculateTotalCost();
						} else if (isSharedMeterService.value) {
							calculateConsumption();
						}
					}, 100);
				}
				
				// Set hint for previous reading in editing mode
				if (reading.previous_reading) {
					lastReadingHint.value = reading.previous_reading.toString();
				} else if (readingForm.service_id && reading.period) {
					// Find previous reading from history if not set
					const previousReading = readings.value
						.filter(r => r && r.service_id === readingForm.service_id && r.period < reading.period)
						.sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime())[0];
					
					if (previousReading && previousReading.current_reading) {
						readingForm.previous_reading = previousReading.current_reading;
						lastReadingHint.value = previousReading.current_reading.toString();
					}
				}
				
				// Recalculate consumption
				calculateConsumption();
			}
		}, { immediate: true });

		// Initialize form with query parameters
		onMounted(() => {
			if (readingForm.address_id && availableTariffs.value.length === 1) {
				readingForm.tariff_id = availableTariffs.value[0].id;
			}
			
			// Якщо вже вибрана служба, знайти попередній показник
			if (readingForm.service_id && !isEditing.value) {
				// Даємо час завантажитись даним
				setTimeout(() => {
					findLastReading();
				}, 500);
			}
		});

		return {
			// Data
			readingForm,
			multiReadingForm,
			calculationData,
			isSaving,
			isDeleting,
			isEditing,
			editReadingId,
			lastReadingHint,
			addresses,
			filteredServices,
			selectedService,
			availableTariffs,
			selectedTariff,
			recentReadings,
			isSharedMeterService,
			isElectricityService,
			isFixedPaymentService,
			groupedTariffs,

			// Methods
			formatRate,
			formatCurrency,
			formatPeriod,
			getServiceName,
			getTariffTypeLabel,
			onAddressChange,
			onServiceChange,
			findLastReading,
			calculateConsumption,
			calculateMultiConsumption,
			calculateTotalCost,
			calculateTariffAmount,
			calculateTotalAmount,
			saveReading,
			deleteReading,
			goBack
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
