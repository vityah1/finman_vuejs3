<template>
	<div class="address-list">
		<div class="container-fluid">
			<div class="row mb-4">
				<div class="col-sm-6">
					<h2><i class="fas fa-map-marker-alt me-2"></i>Адреси</h2>
				</div>
				<div class="col-sm-6 text-end">
					<button class="btn btn-primary" @click="showAddModal = true">
						<i class="fas fa-plus me-2"></i>Додати адресу
					</button>
				</div>
			</div>

			<div v-if="isLoading" class="text-center">
				<div class="spinner-border" role="status">
					<span class="visually-hidden">Завантаження...</span>
				</div>
			</div>

			<div v-else-if="addresses.length === 0" class="text-center">
				<div class="card">
					<div class="card-body">
						<i class="fas fa-home fa-3x text-muted mb-3"></i>
						<h5>Адрес ще не додано</h5>
						<p class="text-muted">Почніть з додавання вашої першої адреси</p>
						<button class="btn btn-primary" @click="showAddModal = true">
							<i class="fas fa-plus me-2"></i>Додати першу адресу
						</button>
					</div>
				</div>
			</div>

			<div v-else class="row">
				<div v-for="address in addresses" :key="address.id" class="col-lg-6 col-xl-4 mb-3">
					<div class="card address-card">
						<div class="card-body">
							<div class="d-flex justify-content-between align-items-start mb-2">
								<h5 class="card-title mb-0">{{ address.name }}</h5>
								<div class="btn-group btn-group-sm">
									<button class="btn btn-outline-primary" @click="editAddress(address)" title="Редагувати">
										<i class="fas fa-edit"></i>
									</button>
									<button class="btn btn-outline-danger" @click="confirmDelete(address)" title="Видалити">
										<i class="fas fa-trash"></i>
									</button>
								</div>
							</div>
							
							<p class="card-text text-muted mb-3">
								<i class="fas fa-map-marker-alt me-2"></i>{{ address.address }}
							</p>
							
							<div v-if="address.description" class="mb-3">
								<small class="text-muted">{{ address.description }}</small>
							</div>

							<div class="row text-center">
								<div class="col-6">
									<div class="border-end">
										<h6 class="mb-0">{{ getServicesCount(address.id) }}</h6>
										<small class="text-muted">Служб</small>
									</div>
								</div>
								<div class="col-6">
									<h6 class="mb-0">{{ getLastReadingDate(address.id) }}</h6>
									<small class="text-muted">Останні показники</small>
								</div>
							</div>

							<div class="mt-3">
								<div class="d-grid gap-2 d-md-flex">
									<router-link :to="{ name: 'utilities_services', params: { addressId: address.id } }" 
												class="btn btn-sm btn-outline-primary flex-fill">
										<i class="fas fa-cogs me-1"></i>Служби
									</router-link>
									<router-link :to="{ name: 'utilities_readings', params: { addressId: address.id } }" 
												class="btn btn-sm btn-outline-success flex-fill">
										<i class="fas fa-chart-line me-1"></i>Показники
									</router-link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Add/Edit Address Modal -->
		<div class="modal fade" :class="{ show: showAddModal }" 
			 :style="{ display: showAddModal ? 'block' : 'none' }" 
			 @click.self="closeModal">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">
							{{ editingAddress ? 'Редагувати адресу' : 'Додати нову адресу' }}
						</h5>
						<button type="button" class="btn-close" @click="closeModal"></button>
					</div>
					<div class="modal-body">
						<form @submit.prevent="saveAddress">
							<div class="mb-3">
								<label for="addressName" class="form-label">Назва <span class="text-danger">*</span></label>
								<input type="text" class="form-control" id="addressName" 
									   v-model="addressForm.name" required 
									   placeholder="Наприклад: Квартира, Дача, Офіс">
							</div>
							<div class="mb-3">
								<label for="addressFull" class="form-label">Повна адреса <span class="text-danger">*</span></label>
								<textarea class="form-control" id="addressFull" rows="2"
										  v-model="addressForm.address" required
										  placeholder="Повна адреса з індексом"></textarea>
							</div>
							<div class="mb-3">
								<label for="addressDescription" class="form-label">Опис</label>
								<textarea class="form-control" id="addressDescription" rows="2"
										  v-model="addressForm.description"
										  placeholder="Додаткова інформація про адресу"></textarea>
							</div>
							<div class="form-check">
								<input class="form-check-input" type="checkbox" id="addressActive" 
									   v-model="addressForm.is_active">
								<label class="form-check-label" for="addressActive">
									Активна адреса
								</label>
							</div>
						</form>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" @click="closeModal">Скасувати</button>
						<button type="button" class="btn btn-primary" @click="saveAddress" :disabled="isSaving">
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
						<p>Ви дійсно хочете видалити адресу "<strong>{{ addressToDelete?.name }}</strong>"?</p>
						<p class="text-warning">
							<i class="fas fa-exclamation-triangle me-2"></i>
							Ця дія також видалить всі пов'язані служби, тарифи та показники!
						</p>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Скасувати</button>
						<button type="button" class="btn btn-danger" @click="deleteAddress" :disabled="isDeleting">
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
import { 
	useGetAddressesApiUtilitiesAddressesGet,
	useCreateAddressApiUtilitiesAddressesPost,
	useUpdateAddressApiUtilitiesAddressesAddressIdPatch,
	useDeleteAddressApiUtilitiesAddressesAddressIdDelete,
	useGetServicesApiUtilitiesServicesGet,
	useGetReadingsApiUtilitiesReadingsGet
} from '@/api/utilities/utilities';
import type { UtilityAddressCreate, UtilityAddressUpdate } from '@/api/model';

interface AddressData {
	id: number;
	name: string;
	address: string;
	description?: string;
	is_active: boolean;
}

interface ServiceData {
	id: number;
	name: string;
	address_id: number;
}

interface ReadingData {
	address_id: number;
	service_id: number;
	period: string;
	reading_date?: string;
}

export default defineComponent({
	name: 'AddressList',
	setup() {
		// Reactive state
		const showAddModal = ref(false);
		const showDeleteModal = ref(false);
		const editingAddress = ref<AddressData | null>(null);
		const addressToDelete = ref<AddressData | null>(null);
		const isSaving = ref(false);
		const isDeleting = ref(false);

		// Form data
		const addressForm = reactive({
			name: '',
			address: '',
			description: '',
			is_active: true
		});

		// API calls
		const { data: addressesData, isLoading, refetch: refetchAddresses } = useGetAddressesApiUtilitiesAddressesGet();
		const { data: servicesData } = useGetServicesApiUtilitiesServicesGet();
		const { data: readingsData } = useGetReadingsApiUtilitiesReadingsGet();

		const createAddressMutation = useCreateAddressApiUtilitiesAddressesPost();
		const updateAddressMutation = useUpdateAddressApiUtilitiesAddressesAddressIdPatch();
		const deleteAddressMutation = useDeleteAddressApiUtilitiesAddressesAddressIdDelete();

		// Computed properties
		const addresses = computed(() => {
			return (addressesData.value?.data as AddressData[]) || [];
		});

		const services = computed(() => {
			return (servicesData.value?.data as ServiceData[]) || [];
		});

		const readings = computed(() => {
			return (readingsData.value?.data as ReadingData[]) || [];
		});

		// Methods
		const getServicesCount = (addressId: number): number => {
			return services.value.filter(service => service.address_id === addressId).length;
		};

		const getLastReadingDate = (addressId: number): string => {
			const addressReadings = readings.value
				.filter(reading => reading.address_id === addressId)
				.sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime());

			if (addressReadings.length === 0) return 'Немає';

			const lastReading = addressReadings[0];
			const date = new Date(lastReading.reading_date || lastReading.period);
			return date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
		};

		const resetForm = () => {
			addressForm.name = '';
			addressForm.address = '';
			addressForm.description = '';
			addressForm.is_active = true;
			editingAddress.value = null;
		};

		const editAddress = (address: AddressData) => {
			editingAddress.value = address;
			addressForm.name = address.name;
			addressForm.address = address.address;
			addressForm.description = address.description || '';
			addressForm.is_active = address.is_active;
			showAddModal.value = true;
		};

		const closeModal = () => {
			showAddModal.value = false;
			resetForm();
		};

		const saveAddress = async () => {
			isSaving.value = true;
			
			try {
				const addressData = {
					name: addressForm.name,
					address: addressForm.address,
					description: addressForm.description || undefined,
					is_active: addressForm.is_active
				};

				if (editingAddress.value) {
					// Update existing address
					await updateAddressMutation.mutateAsync({
						addressId: editingAddress.value.id,
						data: addressData as UtilityAddressUpdate
					});
				} else {
					// Create new address
					await createAddressMutation.mutateAsync({
						data: addressData as UtilityAddressCreate
					});
				}

				await refetchAddresses();
				closeModal();
			} catch (error) {
				console.error('Помилка збереження адреси:', error);
				// TODO: Show error message to user
			} finally {
				isSaving.value = false;
			}
		};

		const confirmDelete = (address: AddressData) => {
			addressToDelete.value = address;
			showDeleteModal.value = true;
		};

		const deleteAddress = async () => {
			if (!addressToDelete.value) return;

			isDeleting.value = true;
			
			try {
				await deleteAddressMutation.mutateAsync({
					addressId: addressToDelete.value.id
				});

				await refetchAddresses();
				showDeleteModal.value = false;
				addressToDelete.value = null;
			} catch (error) {
				console.error('Помилка видалення адреси:', error);
				// TODO: Show error message to user
			} finally {
				isDeleting.value = false;
			}
		};

		return {
			// Data
			addresses,
			isLoading,
			showAddModal,
			showDeleteModal,
			editingAddress,
			addressToDelete,
			addressForm,
			isSaving,
			isDeleting,

			// Methods
			getServicesCount,
			getLastReadingDate,
			editAddress,
			closeModal,
			saveAddress,
			confirmDelete,
			deleteAddress
		};
	}
});
</script>

<style scoped>
.address-list {
	padding: 20px 0;
}

.address-card {
	transition: transform 0.2s, box-shadow 0.2s;
	border: none;
	box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.address-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
