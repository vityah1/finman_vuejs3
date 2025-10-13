<template>
	<div class="service-list">
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
				<h2><i class="fas fa-cogs mr-2"></i>Комунальні служби</h2>
				<Button label="Додати службу" icon="pi pi-plus" @click="showAddModal = true" :disabled="!currentAddress" />
			</div>
			<p v-if="currentAddress" class="text-muted">
				<i class="fas fa-map-marker-alt mr-2"></i>{{ currentAddress.address }}
			</p>
		</div>

		<div v-if="isLoading" class="text-center">
			<ProgressSpinner />
		</div>

		<div v-else-if="!currentAddress" class="text-center">
			<Message severity="warn" :closable="false">
				<i class="fas fa-exclamation-triangle mr-2"></i>
				Адресу не знайдено
			</Message>
		</div>

		<div v-else-if="services.length === 0" class="text-center">
			<Card>
				<template #content>
					<i class="fas fa-cogs fa-3x text-muted mb-3"></i>
					<h5>Служб ще не додано</h5>
					<p class="text-muted">Додайте комунальні служби для цієї адреси</p>
					<Button label="Додати першу службу" icon="pi pi-plus" @click="showAddModal = true" />
				</template>
			</Card>
		</div>

		<div v-else class="grid">
			<div v-for="service in services" :key="service.id" class="col-12 md:col-6">
				<Card class="service-card">
					<template #title>
						<div class="flex justify-content-between align-items-start">
							<span>{{ service.name }}</span>
							<div class="flex gap-2">
								<Button icon="pi pi-pencil" @click="editService(service)" title="Редагувати" outlined size="small" />
								<Button
									icon="pi pi-dollar"
									@click="$router.push({ name: 'utilities_tariffs', params: { serviceId: service.id } })"
									title="Тарифи"
									outlined
									severity="info"
									size="small"
								/>
								<Button icon="pi pi-trash" @click="confirmDelete(service)" title="Видалити" outlined severity="danger" size="small" />
							</div>
						</div>
					</template>
					<template #content>
						<div class="mb-3">
							<small class="text-muted block">
								<i class="fas fa-ruler mr-1"></i>Одиниця: {{ service.unit }}
							</small>
							<small v-if="service.meter_number" class="text-muted block">
								<i class="fas fa-barcode mr-1"></i>Лічильник: {{ service.meter_number }}
							</small>
							<small v-if="service.has_shared_meter" class="text-muted block">
								<i class="fas fa-link mr-1"></i>Спільний показник для групи тарифів
							</small>
							<small v-if="service.description" class="text-muted block">
								{{ service.description }}
							</small>
						</div>

						<div class="grid text-center mb-3">
							<div class="col-6">
								<div class="border-right-1 surface-border">
									<h6 class="m-0">{{ getTariffsCount(service.id) }}</h6>
									<small class="text-muted">Тарифів</small>
								</div>
							</div>
							<div class="col-6">
								<h6 class="m-0">{{ getLastReading(service.id) }}</h6>
								<small class="text-muted">Останній показник</small>
							</div>
						</div>

						<div class="flex gap-2">
							<Button
								label="Тарифи"
								icon="pi pi-dollar"
								outlined
								size="small"
								class="flex-1"
								@click="$router.push({ name: 'utilities_tariffs', params: { serviceId: service.id } })"
							/>
							<Button
								label="Показник"
								icon="pi pi-plus"
								outlined
								severity="success"
								size="small"
								class="flex-1"
								@click="addReading(service)"
							/>
						</div>

						<div v-if="!service.is_active" class="mt-2">
							<Tag severity="secondary" value="Неактивна" />
						</div>
					</template>
				</Card>
			</div>
		</div>

		<!-- Add/Edit Service Dialog -->
		<Dialog
			v-model:visible="showAddModal"
			:header="editingService ? 'Редагувати службу' : 'Додати нову службу'"
			:modal="true"
			:style="{ width: '750px' }"
			@hide="closeModal"
		>
			<form @submit.prevent="saveService">
				<div class="formgrid grid">
					<div class="field col-12 md:col-4">
						<label for="serviceName">Назва служби <span style="color: var(--red-500)">*</span></label>
					</div>
					<div class="field col-12 md:col-8">
						<InputText
							id="serviceName"
							v-model="serviceForm.name"
							required
							placeholder="Наприклад: Електроенергія, Газ, Вода"
						/>
					</div>
				</div>

				<div class="formgrid grid">
					<div class="field col-12 md:col-4">
						<label for="serviceUnit">Одиниця виміру <span style="color: var(--red-500)">*</span></label>
					</div>
					<div class="field col-12 md:col-8">
						<InputText
							id="serviceUnit"
							v-model="serviceForm.unit"
							required
							placeholder="Наприклад: кВт·год, м³, Гкал"
						/>
					</div>
				</div>

				<div class="formgrid grid">
					<div class="field col-12 md:col-4">
						<label for="meterNumber">Номер лічильника</label>
					</div>
					<div class="field col-12 md:col-8">
						<InputText
							id="meterNumber"
							v-model="serviceForm.meter_number"
							placeholder="Серійний номер лічильника"
						/>
					</div>
				</div>

				<div class="formgrid grid">
					<div class="field col-12 md:col-4">
						<label for="serviceDescription">Опис</label>
					</div>
					<div class="field col-12 md:col-8">
						<Textarea
							id="serviceDescription"
							v-model="serviceForm.description"
							placeholder="Додаткова інформація про службу"
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
								id="serviceActive"
								v-model="serviceForm.is_active"
								:binary="true"
							/>
							<label for="serviceActive">Активна служба</label>
						</div>
					</div>
				</div>

				<div class="formgrid grid">
					<div class="field col-12 md:col-4"></div>
					<div class="field col-12 md:col-8">
						<div class="field-checkbox">
							<Checkbox
								id="sharedMeter"
								v-model="serviceForm.has_shared_meter"
								:binary="true"
							/>
							<label for="sharedMeter">Спільний показник для групи тарифів</label>
						</div>
						<small class="block text-color-secondary mt-1">
							Якщо позначено, один показник буде використовуватися для розрахунку декількох тарифів
						</small>
					</div>
				</div>
			</form>

			<template #footer>
				<Button label="Скасувати" icon="pi pi-times" @click="closeModal" text />
				<Button
					:label="isSaving ? 'Збереження...' : 'Зберегти'"
					icon="pi pi-check"
					@click="saveService"
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
				<p class="mb-3">Ви дійсно хочете видалити службу "<strong>{{ serviceToDelete?.name }}</strong>"?</p>
				<Message severity="warn" :closable="false">
					Ця дія також видалить всі пов'язані тарифи та показники!
				</Message>
			</div>

			<template #footer>
				<Button label="Скасувати" icon="pi pi-times" @click="showDeleteModal = false" text />
				<Button
					:label="isDeleting ? 'Видалення...' : 'Видалити'"
					icon="pi pi-trash"
					@click="deleteService"
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
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Checkbox from 'primevue/checkbox';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import Breadcrumb from 'primevue/breadcrumb';
import Card from 'primevue/card';
import Tag from 'primevue/tag';

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
	components: {
		Dialog,
		Button,
		InputText,
		Textarea,
		Checkbox,
		Message,
		ProgressSpinner,
		Breadcrumb,
		Card,
		Tag
	},
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

		// Breadcrumb
		const breadcrumbHome = { icon: 'pi pi-home', route: '/' };
		const breadcrumbItems = computed(() => [
			{ label: 'Комунальні' },
			{ label: 'Адреси', route: { name: 'utilities_addresses' } },
			{ label: currentAddress.value?.name || 'Служби' }
		]);

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
			breadcrumbHome,
			breadcrumbItems,

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
