<template>
	<div class="service-list">
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
							<li class="breadcrumb-item active">{{ currentAddress?.name || 'Служби' }}</li>
						</ol>
					</nav>
					<h2><i class="fas fa-cogs me-2"></i>Комунальні служби</h2>
					<p v-if="currentAddress" class="text-muted">
						<i class="fas fa-map-marker-alt me-2"></i>{{ currentAddress.address }}
					</p>
				</div>
				<div class="col-sm-4 text-end">
					<button class="btn btn-primary" @click="showAddModal = true" :disabled="!currentAddress">
						<i class="fas fa-plus me-2"></i>Додати службу
					</button>
				</div>
			</div>

			<div v-if="isLoading" class="text-center">
				<div class="spinner-border" role="status">
					<span class="visually-hidden">Завантаження...</span>
				</div>
			</div>

			<div v-else-if="!currentAddress" class="text-center">
				<div class="alert alert-warning">
					<i class="fas fa-exclamation-triangle me-2"></i>
					Адресу не знайдено
				</div>
			</div>

			<div v-else-if="services.length === 0" class="text-center">
				<div class="card">
					<div class="card-body">
						<i class="fas fa-cogs fa-3x text-muted mb-3"></i>
						<h5>Служб ще не додано</h5>
						<p class="text-muted">Додайте комунальні служби для цієї адреси</p>
						<button class="btn btn-primary" @click="showAddModal = true">
							<i class="fas fa-plus me-2"></i>Додати першу службу
						</button>
					</div>
				</div>
			</div>

			<div v-else class="row">
				<div v-for="service in services" :key="service.id" class="col-lg-6 col-xl-4 mb-3">
					<div class="card service-card">
						<div class="card-body">
							<div class="d-flex justify-content-between align-items-start mb-2">
								<h5 class="card-title mb-0">{{ service.name }}</h5>
								<div class="btn-group btn-group-sm">
									<button class="btn btn-outline-primary" @click="editService(service)" title="Редагувати">
										<i class="fas fa-edit"></i>
									</button>
									<router-link :to="{ name: 'utilities_tariffs', params: { serviceId: service.id } }" 
												class="btn btn-outline-info" title="Тарифи">
										<i class="fas fa-money-bill"></i>
									</router-link>
									<button class="btn btn-outline-danger" @click="confirmDelete(service)" title="Видалити">
										<i class="fas fa-trash"></i>
									</button>
								</div>
							</div>
							
							<div class="mb-3">
								<small class="text-muted d-block">
									<i class="fas fa-ruler me-1"></i>Одиниця: {{ service.unit }}
								</small>
								<small v-if="service.meter_number" class="text-muted d-block">
									<i class="fas fa-barcode me-1"></i>Лічильник: {{ service.meter_number }}
								</small>
								<small v-if="service.has_shared_meter" class="text-muted d-block">
									<i class="fas fa-link me-1"></i>Спільний показник для групи тарифів
								</small>
								<small v-if="service.description" class="text-muted d-block">
									{{ service.description }}
								</small>
							</div>

							<div class="row text-center mb-3">
								<div class="col-6">
									<div class="border-end">
										<h6 class="mb-0">{{ getTariffsCount(service.id) }}</h6>
										<small class="text-muted">Тарифів</small>
									</div>
								</div>
								<div class="col-6">
									<h6 class="mb-0">{{ getLastReading(service.id) }}</h6>
									<small class="text-muted">Останній показник</small>
								</div>
							</div>

							<div class="d-grid gap-2 d-md-flex">
								<router-link :to="{ name: 'utilities_tariffs', params: { serviceId: service.id } }" 
											class="btn btn-sm btn-outline-primary flex-fill">
									<i class="fas fa-money-bill me-1"></i>Тарифи
								</router-link>
								<button class="btn btn-sm btn-outline-success flex-fill" 
										@click="addReading(service)">
									<i class="fas fa-plus me-1"></i>Показник
								</button>
							</div>

							<div v-if="!service.is_active" class="mt-2">
								<span class="badge bg-secondary">Неактивна</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Add/Edit Service Modal -->
		<div class="modal fade" :class="{ show: showAddModal }" 
			 :style="{ display: showAddModal ? 'block' : 'none' }" 
			 @click.self="closeModal">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">
							{{ editingService ? 'Редагувати службу' : 'Додати нову службу' }}
						</h5>
						<button type="button" class="btn-close" @click="closeModal"></button>
					</div>
					<div class="modal-body">
						<form @submit.prevent="saveService">
							<div class="mb-3">
								<label for="serviceName" class="form-label">Назва служби <span class="text-danger">*</span></label>
								<input type="text" class="form-control" id="serviceName" 
									   v-model="serviceForm.name" required 
									   placeholder="Наприклад: Електроенергія, Газ, Вода">
							</div>
							<div class="mb-3">
								<label for="serviceUnit" class="form-label">Одиниця виміру <span class="text-danger">*</span></label>
								<input type="text" class="form-control" id="serviceUnit" 
									   v-model="serviceForm.unit" required 
									   placeholder="Наприклад: кВт·год, м³, Гкал">
							</div>
							<div class="mb-3">
								<label for="meterNumber" class="form-label">Номер лічильника</label>
								<input type="text" class="form-control" id="meterNumber" 
									   v-model="serviceForm.meter_number" 
									   placeholder="Серійний номер лічильника">
							</div>
							<div class="mb-3">
								<label for="serviceDescription" class="form-label">Опис</label>
								<textarea class="form-control" id="serviceDescription" rows="2"
										  v-model="serviceForm.description"
										  placeholder="Додаткова інформація про службу"></textarea>
							</div>
							<div class="form-check">
								<input class="form-check-input" type="checkbox" id="serviceActive" 
									   v-model="serviceForm.is_active">
								<label class="form-check-label" for="serviceActive">
									Активна служба
								</label>
							</div>
							<div class="form-check mt-2">
								<input class="form-check-input" type="checkbox" id="sharedMeter" 
									   v-model="serviceForm.has_shared_meter">
								<label class="form-check-label" for="sharedMeter">
									Спільний показник для групи тарифів
								</label>
								<small class="form-text text-muted d-block">
									Якщо позначено, один показник буде використовуватися для розрахунку декількох тарифів (наприклад, розхід та злив води)
								</small>
							</div>
						</form>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" @click="closeModal">Скасувати</button>
						<button type="button" class="btn btn-primary" @click="saveService" :disabled="isSaving">
							{{ isSaving ? 'Збереження...' : 'Зберегти' }}
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Delete Confirmation Modal -->
		<div class="modal fade" :class="{ show: showDeleteModal }" 
			 :style="{ display: showDeleteModal ? 'block' : 'none' }" 
			 @click.self="showDeleteModal = false">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">Підтвердити видалення</h5>
						<button type="button" class="btn-close" @click="showDeleteModal = false"></button>
					</div>
					<div class="modal-body">
						<p>Ви дійсно хочете видалити службу "<strong>{{ serviceToDelete?.name }}</strong>"?</p>
						<p class="text-warning">
							<i class="fas fa-exclamation-triangle me-2"></i>
							Ця дія також видалить всі пов'язані тарифи та показники!
						</p>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Скасувати</button>
						<button type="button" class="btn btn-danger" @click="deleteService" :disabled="isDeleting">
							{{ isDeleting ? 'Видалення...' : 'Видалити' }}
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Modal backdrop -->
		<div v-if="showAddModal || showDeleteModal" class="modal-backdrop fade show"></div>
	</div>
</template>
<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
	useGetAddressApiUtilitiesAddressesAddressIdGet,
	useGetServicesApiUtilitiesServicesGet,
	useCreateServiceApiUtilitiesServicesPost,
	useUpdateServiceApiUtilitiesServicesServiceIdPatch,
	useDeleteServiceApiUtilitiesServicesServiceIdDelete,
	useGetTariffsApiUtilitiesTariffsGet,
	useGetReadingsApiUtilitiesReadingsGet
} from '@/api/utilities/utilities';
import type { UtilityServiceCreate, UtilityServiceUpdate } from '@/api/model';

interface AddressData {
	id: number;
	name: string;
	address: string;
}

interface ServiceData {
	id: number;
	name: string;
	description?: string;
	unit: string;
	meter_number?: string;
	address_id: number;
	is_active: boolean;
	has_shared_meter?: boolean;
}

interface TariffData {
	id: number;
	service_id: number;
	name: string;
	rate: number;
}

interface ReadingData {
	service_id: number;
	current_reading: number;
	period: string;
}

export default defineComponent({
	name: 'ServiceList',
	setup() {
		const route = useRoute();
		const router = useRouter();
		
		const addressId = computed(() => parseInt(route.params.addressId as string));

		// Reactive state
		const showAddModal = ref(false);
		const showDeleteModal = ref(false);
		const editingService = ref<ServiceData | null>(null);
		const serviceToDelete = ref<ServiceData | null>(null);
		const isSaving = ref(false);
		const isDeleting = ref(false);

		// Form data
		const serviceForm = reactive({
			name: '',
			description: '',
			unit: '',
			meter_number: '',
			is_active: true,
			has_shared_meter: false
		});

		// API calls
		const { data: addressData } = useGetAddressApiUtilitiesAddressesAddressIdGet(addressId);
		const { data: servicesData, isLoading, refetch: refetchServices } = useGetServicesApiUtilitiesServicesGet({
			address_id: addressId.value
		});
		const { data: tariffsData } = useGetTariffsApiUtilitiesTariffsGet();
		const { data: readingsData } = useGetReadingsApiUtilitiesReadingsGet({
			address_id: addressId.value
		});

		const createServiceMutation = useCreateServiceApiUtilitiesServicesPost();
		const updateServiceMutation = useUpdateServiceApiUtilitiesServicesServiceIdPatch();
		const deleteServiceMutation = useDeleteServiceApiUtilitiesServicesServiceIdDelete();

		// Computed properties
		const currentAddress = computed(() => {
			return addressData.value?.data as AddressData;
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

		// Methods
		const getTariffsCount = (serviceId: number): number => {
			return tariffs.value.filter(tariff => tariff.service_id === serviceId).length;
		};

		const getLastReading = (serviceId: number): string => {
			const serviceReadings = readings.value
				.filter(reading => reading.service_id === serviceId)
				.sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime());

			if (serviceReadings.length === 0) return 'Немає';
			
			return serviceReadings[0].current_reading.toString();
		};

		const resetForm = () => {
			serviceForm.name = '';
			serviceForm.description = '';
			serviceForm.unit = '';
			serviceForm.meter_number = '';
			serviceForm.is_active = true;
			serviceForm.has_shared_meter = false;
			editingService.value = null;
		};

		const editService = (service: ServiceData) => {
			editingService.value = service;
			serviceForm.name = service.name;
			serviceForm.description = service.description || '';
			serviceForm.unit = service.unit;
			serviceForm.meter_number = service.meter_number || '';
			serviceForm.is_active = service.is_active;
			serviceForm.has_shared_meter = service.has_shared_meter || false;
			showAddModal.value = true;
		};

		const closeModal = () => {
			showAddModal.value = false;
			resetForm();
		};

		const saveService = async () => {
			isSaving.value = true;
			
			try {
				const serviceData = {
					address_id: addressId.value,
					name: serviceForm.name,
					description: serviceForm.description || undefined,
					unit: serviceForm.unit,
					meter_number: serviceForm.meter_number || undefined,
					is_active: serviceForm.is_active,
					has_shared_meter: serviceForm.has_shared_meter
				};

				if (editingService.value) {
					// Update existing service
					await updateServiceMutation.mutateAsync({
						serviceId: editingService.value.id,
						data: serviceData as UtilityServiceUpdate
					});
				} else {
					// Create new service
					await createServiceMutation.mutateAsync({
						data: serviceData as UtilityServiceCreate
					});
				}

				await refetchServices();
				closeModal();
			} catch (error) {
				console.error('Помилка збереження служби:', error);
			} finally {
				isSaving.value = false;
			}
		};

		const confirmDelete = (service: ServiceData) => {
			serviceToDelete.value = service;
			showDeleteModal.value = true;
		};

		const deleteService = async () => {
			if (!serviceToDelete.value) return;

			isDeleting.value = true;
			
			try {
				await deleteServiceMutation.mutateAsync({
					serviceId: serviceToDelete.value.id
				});

				await refetchServices();
				showDeleteModal.value = false;
				serviceToDelete.value = null;
			} catch (error) {
				console.error('Помилка видалення служби:', error);
			} finally {
				isDeleting.value = false;
			}
		};

		const addReading = (service: ServiceData) => {
			router.push({
				name: 'utilities_add_reading',
				query: {
					addressId: addressId.value,
					serviceId: service.id
				}
			});
		};

		return {
			// Data
			currentAddress,
			services,
			isLoading,
			showAddModal,
			showDeleteModal,
			editingService,
			serviceToDelete,
			serviceForm,
			isSaving,
			isDeleting,

			// Methods
			getTariffsCount,
			getLastReading,
			editService,
			closeModal,
			saveService,
			confirmDelete,
			deleteService,
			addReading
		};
	}
});
</script>

<style scoped>
.service-list {
	padding: 20px 0;
}

.service-card {
	transition: transform 0.2s, box-shadow 0.2s;
	border: none;
	box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.service-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.breadcrumb {
	background: none;
	padding: 0;
}

.modal {
	background: rgba(0,0,0,0.5);
}

.border-end {
	border-right: 1px solid #dee2e6 !important;
}

@media (max-width: 768px) {
	.d-md-flex {
		flex-direction: column;
	}
}
</style>
