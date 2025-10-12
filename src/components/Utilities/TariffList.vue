<template>
	<div class="tariff-list">
		<div class="container-fluid">
			<div class="row mb-4">
				<div class="col-sm-6">
					<nav aria-label="breadcrumb">
						<ol class="breadcrumb">
							<li class="breadcrumb-item">
								<router-link :to="{ name: 'utilities' }">Комунальні</router-link>
							</li>
							<li class="breadcrumb-item">
								<router-link :to="{ name: 'utilities_addresses' }">Адреси</router-link>
							</li>
							<li class="breadcrumb-item">
								<router-link :to="getServicesRoute()">Служби</router-link>
							</li>
							<li class="breadcrumb-item active">Тарифи</li>
						</ol>
					</nav>
					<h2><i class="fas fa-money-bill me-2"></i>Тарифи</h2>
				</div>
				<div class="col-sm-6 text-end">
					<Button
						label="Назад до служб"
						icon="pi pi-arrow-left"
						severity="secondary"
						class="me-2"
						@click="$router.push(getServicesRoute())"
					/>
					<Button label="Додати тариф" icon="pi pi-plus" @click="showAddModal = true" />
				</div>
			</div>

			<div v-if="isLoading" class="text-center">
				<ProgressSpinner />
			</div>

			<div v-else-if="tariffs.length === 0" class="text-center">
				<div class="card">
					<div class="card-body">
						<i class="fas fa-money-bill fa-3x text-muted mb-3"></i>
						<h5>Тарифів ще не додано</h5>
						<p class="text-muted">Додайте тарифи для розрахунку вартості</p>
						<Button label="Додати перший тариф" icon="pi pi-plus" @click="showAddModal = true" />
					</div>
				</div>
			</div>

			<div v-else>
				<div class="table-responsive">
					<table class="table table-hover">
						<thead>
							<tr>
								<th>Назва</th>
								<th>Тип</th>
								<th>Ставка</th>
								<th>Валюта</th>
								<th>Група</th>
								<th>Джерело</th>
								<th>Період дії</th>
								<th>Статус</th>
								<th>Дії</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="tariff in tariffs" :key="tariff.id">
								<td>
									<strong>{{ tariff.name }}</strong>
								</td>
								<td>
									<span v-if="tariff.tariff_type" class="badge bg-info">{{ getTariffTypeLabel(tariff.tariff_type) }}</span>
									<span v-else class="text-muted">-</span>
								</td>
								<td>
									<strong>{{ formatRate(tariff.rate) }}</strong>
									<span v-if="tariff.calculation_method === 'percentage' && tariff.percentage_of" 
										  class="text-muted d-block">
										<small>({{ tariff.percentage_of }}% від основного)</small>
									</span>
								</td>
								<td>{{ tariff.currency || 'UAH' }}</td>
								<td>
									<span v-if="tariff.group_code" class="badge bg-secondary">{{ tariff.group_code }}</span>
									<span v-else class="text-muted">-</span>
								</td>
								<td>
									<span v-if="tariff.source === 'import'" class="badge bg-warning">Імпорт</span>
									<span v-else class="badge bg-primary">Інтерфейс</span>
								</td>
								<td>
									<small class="text-muted d-block">
										з {{ formatDate(tariff.valid_from) }}
									</small>
									<small v-if="tariff.valid_to" class="text-muted d-block">
										до {{ formatDate(tariff.valid_to) }}
									</small>
									<small v-else class="text-muted d-block">безстроково</small>
								</td>
								<td>
									<span v-if="tariff.is_active" class="badge bg-success">Активний</span>
									<span v-else class="badge bg-secondary">Неактивний</span>
								</td>
								<td>
									<div class="flex gap-2">
										<Button icon="pi pi-pencil" @click="editTariff(tariff)" outlined size="small" />
										<Button icon="pi pi-trash" @click="confirmDelete(tariff)" outlined severity="danger" size="small" />
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- Add/Edit Tariff Dialog -->
		<Dialog
			v-model:visible="showAddModal"
			:header="editingTariff ? 'Редагувати тариф' : 'Додати новий тариф'"
			:modal="true"
			:style="{ width: '650px' }"
			@hide="closeModal"
		>
			<form @submit.prevent="saveTariff">
				<div class="mb-3">
					<label for="tariffName" class="form-label">Назва тарифу <span class="text-danger">*</span></label>
					<InputText
						id="tariffName"
						v-model="tariffForm.name"
						required
						placeholder="Наприклад: Денний тариф, Нічний тариф"
						class="w-full"
					/>
				</div>
				<div class="row">
					<div class="col-md-12">
						<div class="mb-3">
							<label for="tariffRate" class="form-label">Ставка <span class="text-danger">*</span></label>
							<InputNumber
								id="tariffRate"
								v-model="tariffForm.rate"
								required
								:minFractionDigits="2"
								:maxFractionDigits="2"
								placeholder="0.00"
								class="w-full"
							/>
						</div>
					</div>
				</div>
				<div class="row">
					<div class="col-md-12">
						<div class="mb-3">
							<label for="tariffCurrency" class="form-label">Валюта</label>
							<Dropdown
								id="tariffCurrency"
								v-model="tariffForm.currency"
								:options="['UAH', 'USD', 'EUR']"
								class="w-full"
							/>
						</div>
					</div>
				</div>
				<div class="row">
					<div class="col-md-6">
						<div class="mb-3">
							<label for="validFrom" class="form-label">Дійсний з <span class="text-danger">*</span></label>
							<Calendar
								id="validFrom"
								v-model="tariffForm.valid_from"
								dateFormat="yy-mm-dd"
								required
								class="w-full"
							/>
						</div>
					</div>
					<div class="col-md-6">
						<div class="mb-3">
							<label for="validTo" class="form-label">Дійсний до</label>
							<Calendar
								id="validTo"
								v-model="tariffForm.valid_to"
								dateFormat="yy-mm-dd"
								class="w-full"
							/>
							<small class="text-muted">Залиште порожнім для безстрокового тарифу</small>
						</div>
					</div>
				</div>
				<div class="flex align-items-center mb-3">
					<Checkbox
						id="tariffActive"
						v-model="tariffForm.is_active"
						:binary="true"
					/>
					<label for="tariffActive" class="ml-2">Активний тариф</label>
				</div>

				<!-- Розширені налаштування -->
				<hr class="my-3">
				<h6>Розширені налаштування</h6>

				<div class="row">
					<div class="col-md-6">
						<div class="mb-3">
							<label for="tariffType" class="form-label">Тип тарифу</label>
							<Dropdown
								id="tariffType"
								v-model="tariffForm.tariff_type"
								:options="tariffTypeOptions"
								optionLabel="label"
								optionValue="value"
								placeholder="Стандартний"
								class="w-full"
							/>
						</div>
					</div>
					<div class="col-md-6">
						<div class="mb-3">
							<label for="groupCode" class="form-label">Код групи</label>
							<InputText
								id="groupCode"
								v-model="tariffForm.group_code"
								placeholder="Наприклад: water_2025"
								class="w-full"
							/>
							<small class="text-muted">Для групування пов'язаних тарифів</small>
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-md-6">
						<div class="mb-3">
							<label for="calculationMethod" class="form-label">Метод розрахунку</label>
							<Dropdown
								id="calculationMethod"
								v-model="tariffForm.calculation_method"
								:options="calculationMethodOptions"
								optionLabel="label"
								optionValue="value"
								class="w-full"
							/>
						</div>
					</div>
					<div class="col-md-6" v-if="tariffForm.calculation_method === 'percentage'">
						<div class="mb-3">
							<label for="percentageOf" class="form-label">Відсоток</label>
							<InputNumber
								id="percentageOf"
								v-model="tariffForm.percentage_of"
								:minFractionDigits="2"
								:maxFractionDigits="2"
								placeholder="80"
								class="w-full"
							/>
							<small class="text-muted">Відсоток від основного тарифу</small>
						</div>
					</div>
				</div>
			</form>

			<template #footer>
				<Button label="Скасувати" icon="pi pi-times" @click="closeModal" text />
				<Button
					:label="isSaving ? 'Збереження...' : 'Зберегти'"
					icon="pi pi-check"
					@click="saveTariff"
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
			:style="{ width: '450px' }"
		>
			<p>Ви дійсно хочете видалити тариф "<strong>{{ tariffToDelete?.name }}</strong>"?</p>
			<Message severity="warn" :closable="false">
				<i class="fas fa-exclamation-triangle me-2"></i>
				Ця дія може вплинути на розрахунки показників!
			</Message>

			<template #footer>
				<Button label="Скасувати" icon="pi pi-times" @click="showDeleteModal = false" text />
				<Button
					:label="isDeleting ? 'Видалення...' : 'Видалити'"
					icon="pi pi-trash"
					@click="deleteTariff"
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
import { useRoute } from 'vue-router';
import {
	useGetTariffsApiUtilitiesTariffsGet,
	useGetServiceApiUtilitiesServicesServiceIdGet,
	useCreateTariffApiUtilitiesTariffsPost,
	useUpdateTariffApiUtilitiesTariffsTariffIdPatch,
	useDeleteTariffApiUtilitiesTariffsTariffIdDelete
} from '@/api/utilities/utilities';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Checkbox from 'primevue/checkbox';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';

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
	source?: string;
}

export default defineComponent({
	name: 'TariffList',
	components: {
		Dialog,
		Button,
		InputText,
		InputNumber,
		Dropdown,
		Calendar,
		Checkbox,
		Message,
		ProgressSpinner
	},
	setup() {
		const route = useRoute();
		const serviceId = computed(() => parseInt(route.params.serviceId as string));

		// Reactive state
		const showAddModal = ref(false);
		const showDeleteModal = ref(false);
		const editingTariff = ref<TariffData | null>(null);
		const tariffToDelete = ref<TariffData | null>(null);
		const isSaving = ref(false);
		const isDeleting = ref(false);

		// Dropdown options
		const tariffTypeOptions = ref([
			{ label: 'Стандартний', value: '' },
			{ label: 'Споживання', value: 'consumption' },
			{ label: 'Водовідведення', value: 'drainage' },
			{ label: 'Абонплата', value: 'subscription' },
			{ label: 'Денний', value: 'day' },
			{ label: 'Нічний', value: 'night' },
			{ label: 'Квартплата', value: 'apartment' },
			{ label: 'Фіксований', value: 'fixed' }
		]);

		const calculationMethodOptions = ref([
			{ label: 'Стандартний', value: 'standard' },
			{ label: 'Відсоток від основного', value: 'percentage' },
			{ label: 'Фіксована сума', value: 'fixed' }
		]);

		// Form data
		const tariffForm = reactive({
			name: '',
			rate: 0,
			currency: 'UAH',
			valid_from: '',
			valid_to: '',
			is_active: true,
			// Нові поля
			tariff_type: '',
			group_code: '',
			calculation_method: 'standard',
			percentage_of: null as number | null,
			source: 'interface'
		});

		// Mock data for now
		const { data: tariffsData, isLoading } = useGetTariffsApiUtilitiesTariffsGet({
			service_id: serviceId.value
		});

		const { data: serviceDataResponse } = useGetServiceApiUtilitiesServicesServiceIdGet(serviceId);

		// Mutations
		const createTariffMutation = useCreateTariffApiUtilitiesTariffsPost();
		const updateTariffMutation = useUpdateTariffApiUtilitiesTariffsTariffIdPatch();
		const deleteTariffMutation = useDeleteTariffApiUtilitiesTariffsTariffIdDelete();

		const tariffs = computed(() => (tariffsData.value?.data as TariffData[]) || []);
		const serviceData = computed(() => serviceDataResponse.value?.data as any);

		// Methods
		const formatRate = (rate: number): string => {
			return new Intl.NumberFormat('uk-UA', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 4
			}).format(rate);
		};

		const formatDate = (dateString: string): string => {
			return new Date(dateString).toLocaleDateString('uk-UA');
		};
		
		const getTariffTypeLabel = (type: string): string => {
			const types: Record<string, string> = {
				consumption: 'Споживання',
				drainage: 'Водовідведення',
				subscription: 'Абонплата',
				day: 'Денний',
				night: 'Нічний',
				apartment: 'Квартплата',
				fixed: 'Фіксований',
				standard: 'Стандартний'
			};
			return types[type] || type;
		};

		const resetForm = () => {
			tariffForm.name = '';
			tariffForm.rate = 0;
			tariffForm.currency = 'UAH';
			tariffForm.valid_from = '';
			tariffForm.valid_to = '';
			tariffForm.is_active = true;
			// Скидання нових полів
			tariffForm.tariff_type = '';
			tariffForm.group_code = '';
			tariffForm.calculation_method = 'standard';
			tariffForm.percentage_of = null;
			tariffForm.source = 'interface';
			editingTariff.value = null;
		};

		const editTariff = (tariff: TariffData) => {
			editingTariff.value = tariff;
			tariffForm.name = tariff.name;
			tariffForm.rate = tariff.rate;
			tariffForm.currency = tariff.currency;
			tariffForm.valid_from = tariff.valid_from;
			tariffForm.valid_to = tariff.valid_to || '';
			tariffForm.is_active = tariff.is_active;
			// Заповнення нових полів
			tariffForm.tariff_type = tariff.tariff_type || '';
			tariffForm.group_code = tariff.group_code || '';
			tariffForm.calculation_method = tariff.calculation_method || 'standard';
			tariffForm.percentage_of = tariff.percentage_of || null;
			tariffForm.source = tariff.source || 'interface';
			showAddModal.value = true;
		};

		const closeModal = () => {
			showAddModal.value = false;
			resetForm();
		};

		const saveTariff = async () => {
			isSaving.value = true;
			
			try {
				const tariffData = {
					service_id: serviceId.value,
					name: tariffForm.name,
					rate: tariffForm.rate,
					currency: tariffForm.currency,
					valid_from: tariffForm.valid_from,
					valid_to: tariffForm.valid_to || undefined,
					is_active: tariffForm.is_active,
					// Нові поля
					tariff_type: tariffForm.tariff_type || undefined,
					group_code: tariffForm.group_code || undefined,
					calculation_method: tariffForm.calculation_method,
					percentage_of: tariffForm.percentage_of || undefined,
					source: tariffForm.source
				};

				if (editingTariff.value) {
					// Update existing tariff
					await updateTariffMutation.mutateAsync({
						tariffId: editingTariff.value.id,
						data: tariffData
					});
				} else {
					// Create new tariff
					await createTariffMutation.mutateAsync({
						data: tariffData
					});
				}
				
				closeModal();
			} catch (error) {
				console.error('Помилка збереження тарифу:', error);
			} finally {
				isSaving.value = false;
			}
		};

		const confirmDelete = (tariff: TariffData) => {
			tariffToDelete.value = tariff;
			showDeleteModal.value = true;
		};

		const deleteTariff = async () => {
			if (!tariffToDelete.value) return;

			isDeleting.value = true;
			
			try {
				await deleteTariffMutation.mutateAsync({
					tariffId: tariffToDelete.value.id
				});
				
				showDeleteModal.value = false;
				tariffToDelete.value = null;
			} catch (error) {
				console.error('Помилка видалення тарифу:', error);
			} finally {
				isDeleting.value = false;
			}
		};

		const getServicesRoute = () => {
			const addressId = serviceData.value?.address_id;
			if (addressId) {
				return { name: 'utilities_services', params: { addressId } };
			}
			return { name: 'utilities_addresses' };
		};

		return {
			// Data
			tariffs,
			serviceData,
			isLoading,
			showAddModal,
			showDeleteModal,
			editingTariff,
			tariffToDelete,
			tariffForm,
			isSaving,
			isDeleting,
			tariffTypeOptions,
			calculationMethodOptions,

			// Methods
			formatRate,
			formatDate,
			getTariffTypeLabel,
			editTariff,
			closeModal,
			saveTariff,
			confirmDelete,
			deleteTariff,
			getServicesRoute
		};
	}
});
</script>

<style scoped>
.tariff-list {
	padding: 20px 0;
}

.breadcrumb {
	background: none;
	padding: 0;
}

.modal {
	background: rgba(0,0,0,0.5);
}

.card {
	border: none;
	box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>
