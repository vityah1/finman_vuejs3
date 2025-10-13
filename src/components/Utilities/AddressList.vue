<template>
	<div class="address-list">
		<div class="mb-4">
			<Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-3">
				<template #item="{ item }">
					<router-link v-if="item.route" :to="item.route" class="p-menuitem-link">
						<span class="p-menuitem-text">{{ item.label }}</span>
					</router-link>
					<span v-else class="p-menuitem-text">{{ item.label }}</span>
				</template>
			</Breadcrumb>
			<div class="flex justify-content-between align-items-center">
				<h2><i class="fas fa-map-marker-alt mr-2"></i>Адреси</h2>
				<Button label="Додати адресу" icon="pi pi-plus" @click="showAddModal = true" />
			</div>
		</div>

		<div v-if="isLoading" class="text-center">
			<ProgressSpinner />
		</div>

		<div v-else-if="addresses.length === 0" class="text-center">
			<Card>
				<template #content>
					<i class="fas fa-home fa-3x text-muted mb-3"></i>
					<h5>Адрес ще не додано</h5>
					<p class="text-muted">Почніть з додавання вашої першої адреси</p>
					<Button label="Додати першу адресу" icon="pi pi-plus" @click="showAddModal = true" />
				</template>
			</Card>
		</div>

		<div v-else class="grid">
			<div v-for="address in addresses" :key="address.id" class="col-12 md:col-6">
				<Card class="address-card">
					<template #title>
						<div class="flex justify-content-between align-items-start">
							<span>{{ address.name }}</span>
							<div class="flex gap-2">
								<Button icon="pi pi-pencil" @click="editAddress(address)" title="Редагувати" outlined size="small" />
								<Button icon="pi pi-trash" @click="confirmDelete(address)" title="Видалити" outlined severity="danger" size="small" />
							</div>
						</div>
					</template>
					<template #content>
						<p class="text-muted mb-3">
							<i class="fas fa-map-marker-alt mr-2"></i>{{ address.address }}
						</p>

						<div v-if="address.description" class="mb-3">
							<small class="text-muted">{{ address.description }}</small>
						</div>

						<div class="grid text-center mb-3">
							<div class="col-6">
								<div class="border-right-1 surface-border">
									<h6 class="m-0">{{ getServicesCount(address.id) }}</h6>
									<small class="text-muted">Служб</small>
								</div>
							</div>
							<div class="col-6">
								<h6 class="m-0">{{ getLastReadingDate(address.id) }}</h6>
								<small class="text-muted">Останні показники</small>
							</div>
						</div>

						<div class="flex gap-2">
							<Button
								label="Служби"
								icon="pi pi-cog"
								outlined
								size="small"
								class="flex-1"
								@click="$router.push({ name: 'utilities_services', params: { addressId: address.id } })"
							/>
							<Button
								label="Показники"
								icon="pi pi-chart-line"
								outlined
								severity="success"
								size="small"
								class="flex-1"
								@click="$router.push({ name: 'utilities_readings', params: { addressId: address.id } })"
							/>
						</div>
					</template>
				</Card>
			</div>
		</div>

		<!-- Add/Edit Address Dialog -->
		<Dialog
			v-model:visible="showAddModal"
			:header="editingAddress ? 'Редагувати адресу' : 'Додати нову адресу'"
			:modal="true"
			:style="{ width: '700px' }"
			@hide="closeModal"
		>
			<form @submit.prevent="saveAddress">
				<div class="formgrid grid">
					<div class="field col-12 md:col-4">
						<label for="addressName">Назва <span style="color: var(--red-500)">*</span></label>
					</div>
					<div class="field col-12 md:col-8">
						<InputText
							id="addressName"
							v-model="addressForm.name"
							required
							placeholder="Наприклад: Квартира, Дача, Офіс"
						/>
					</div>
				</div>

				<div class="formgrid grid">
					<div class="field col-12 md:col-4">
						<label for="addressFull">Повна адреса <span style="color: var(--red-500)">*</span></label>
					</div>
					<div class="field col-12 md:col-8">
						<Textarea
							id="addressFull"
							v-model="addressForm.address"
							required
							placeholder="Повна адреса з індексом"
							rows="3"
							cols="50"
							auto-resize
						/>
					</div>
				</div>

				<div class="formgrid grid">
					<div class="field col-12 md:col-4">
						<label for="addressDescription">Опис</label>
					</div>
					<div class="field col-12 md:col-8">
						<Textarea
							id="addressDescription"
							v-model="addressForm.description"
							placeholder="Додаткова інформація про адресу"
							rows="3"
							cols="50"
							auto-resize
						/>
					</div>
				</div>

				<div class="formgrid grid">
					<div class="field col-12 md:col-4"></div>
					<div class="field col-12 md:col-8">
						<div class="field-checkbox">
							<Checkbox
								id="addressActive"
								v-model="addressForm.is_active"
								:binary="true"
							/>
							<label for="addressActive">Активна адреса</label>
						</div>
					</div>
				</div>
			</form>

			<template #footer>
				<Button label="Скасувати" icon="pi pi-times" @click="closeModal" text />
				<Button
					:label="isSaving ? 'Збереження...' : 'Зберегти'"
					icon="pi pi-check"
					@click="saveAddress"
					:disabled="isSaving"
					:loading="isSaving"
				/>
			</template>
		</Dialog>

		<!-- Delete Confirmation Dialog -->
		<Dialog
			v-model:visible="showDeleteModal"
			header="Підтвердити видалення"
			:modal="true"
			:style="{ width: '500px' }"
		>
			<div class="confirmation-content">
				<p class="mb-3">Ви дійсно хочете видалити адресу "<strong>{{ addressToDelete?.name }}</strong>"?</p>
				<Message severity="warn" :closable="false">
					Ця дія також видалить всі пов'язані служби, тарифи та показники!
				</Message>
			</div>

			<template #footer>
				<Button label="Скасувати" icon="pi pi-times" @click="showDeleteModal = false" text />
				<Button
					:label="isDeleting ? 'Видалення...' : 'Видалити'"
					icon="pi pi-trash"
					@click="deleteAddress"
					severity="danger"
					:disabled="isDeleting"
					:loading="isDeleting"
				/>
			</template>
		</Dialog>
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
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Checkbox from 'primevue/checkbox';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import Breadcrumb from 'primevue/breadcrumb';
import Card from 'primevue/card';

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
	components: {
		Dialog,
		Button,
		InputText,
		Textarea,
		Card,
		Checkbox,
		Message,
		ProgressSpinner,
		Breadcrumb
	},
	setup() {
		// Breadcrumb
		const breadcrumbHome = { icon: 'pi pi-home', route: { name: 'utilities' } };
		const breadcrumbItems = ref([
			{ label: 'Адреси' }
		]);

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
			// Використовуємо період (наприклад 2025-04), а не дату показника
			const [year, month] = lastReading.period.split('-');
			const date = new Date(parseInt(year), parseInt(month) - 1);
			// Форматуємо як "квітень 2025"
			return date.toLocaleDateString('uk-UA', { year: 'numeric', month: 'long' });
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
			deleteAddress,
			breadcrumbHome,
			breadcrumbItems
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
