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
					<router-link :to="getServicesRoute()" class="btn btn-secondary me-2">
						<i class="fas fa-arrow-left me-2"></i>Назад до служб
					</router-link>
					<button class="btn btn-primary" @click="showAddModal = true">
						<i class="fas fa-plus me-2"></i>Додати тариф
					</button>
				</div>
			</div>

			<div v-if="isLoading" class="text-center">
				<div class="spinner-border" role="status">
					<span class="visually-hidden">Завантаження...</span>
				</div>
			</div>

			<div v-else-if="tariffs.length === 0" class="text-center">
				<div class="card">
					<div class="card-body">
						<i class="fas fa-money-bill fa-3x text-muted mb-3"></i>
						<h5>Тарифів ще не додано</h5>
						<p class="text-muted">Додайте тарифи для розрахунку вартості</p>
						<button class="btn btn-primary" @click="showAddModal = true">
							<i class="fas fa-plus me-2"></i>Додати перший тариф
						</button>
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
									<div class="btn-group btn-group-sm">
										<button class="btn btn-outline-primary" @click="editTariff(tariff)">
											<i class="fas fa-edit"></i>
										</button>
										<button class="btn btn-outline-danger" @click="confirmDelete(tariff)">
											<i class="fas fa-trash"></i>
										</button>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- Add/Edit Tariff Modal -->
		<div class="modal fade" :class="{ show: showAddModal }" 
			 :style="{ display: showAddModal ? 'block' : 'none' }" 
			 @click.self="closeModal">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">
							{{ editingTariff ? 'Редагувати тариф' : 'Додати новий тариф' }}
						</h5>
						<button type="button" class="btn-close" @click="closeModal"></button>
					</div>
					<div class="modal-body">
						<form @submit.prevent="saveTariff">
							<div class="mb-3">
								<label for="tariffName" class="form-label">Назва тарифу <span class="text-danger">*</span></label>
								<input type="text" class="form-control" id="tariffName" 
									   v-model="tariffForm.name" required 
									   placeholder="Наприклад: Денний тариф, Нічний тариф">
							</div>
							<div class="row">
								<div class="col-md-12">
									<div class="mb-3">
										<label for="tariffRate" class="form-label">Ставка <span class="text-danger">*</span></label>
										<input type="number" step="0.01" class="form-control" id="tariffRate" 
											   v-model="tariffForm.rate" required 
											   placeholder="0.00">
									</div>
								</div>
							</div>
							<div class="row">
								<div class="col-md-12">
									<div class="mb-3">
										<label for="tariffCurrency" class="form-label">Валюта</label>
										<select class="form-control" id="tariffCurrency" v-model="tariffForm.currency">
											<option value="UAH">UAH</option>
											<option value="USD">USD</option>
											<option value="EUR">EUR</option>
										</select>
									</div>
								</div>
							</div>
							<div class="row">
								<div class="col-md-6">
									<div class="mb-3">
										<label for="validFrom" class="form-label">Дійсний з <span class="text-danger">*</span></label>
										<input type="date" class="form-control" id="validFrom" 
											   v-model="tariffForm.valid_from" required>
									</div>
								</div>
								<div class="col-md-6">
									<div class="mb-3">
										<label for="validTo" class="form-label">Дійсний до</label>
										<input type="date" class="form-control" id="validTo" 
											   v-model="tariffForm.valid_to">
										<small class="form-text text-muted">Залиште порожнім для безстрокового тарифу</small>
									</div>
								</div>
							</div>
							<div class="form-check">
								<input class="form-check-input" type="checkbox" id="tariffActive" 
									   v-model="tariffForm.is_active">
								<label class="form-check-label" for="tariffActive">
									Активний тариф
								</label>
							</div>
							
							<!-- Розширені налаштування -->
							<hr class="my-3">
							<h6>Розширені налаштування</h6>
							
							<div class="row">
								<div class="col-md-6">
									<div class="mb-3">
										<label for="tariffType" class="form-label">Тип тарифу</label>
										<select class="form-control" id="tariffType" v-model="tariffForm.tariff_type">
											<option value="">Стандартний</option>
											<option value="consumption">Споживання</option>
											<option value="drainage">Водовідведення</option>
											<option value="subscription">Абонплата</option>
											<option value="day">Денний</option>
											<option value="night">Нічний</option>
											<option value="apartment">Квартплата</option>
											<option value="fixed">Фіксований</option>
										</select>
									</div>
								</div>
								<div class="col-md-6">
									<div class="mb-3">
										<label for="groupCode" class="form-label">Код групи</label>
										<input type="text" class="form-control" id="groupCode" 
											   v-model="tariffForm.group_code"
											   placeholder="Наприклад: water_2025">
										<small class="form-text text-muted">Для групування пов'язаних тарифів</small>
									</div>
								</div>
							</div>
							
							<div class="row">
								<div class="col-md-6">
									<div class="mb-3">
										<label for="calculationMethod" class="form-label">Метод розрахунку</label>
										<select class="form-control" id="calculationMethod" v-model="tariffForm.calculation_method">
											<option value="standard">Стандартний</option>
											<option value="percentage">Відсоток від основного</option>
											<option value="fixed">Фіксована сума</option>
										</select>
									</div>
								</div>
								<div class="col-md-6" v-if="tariffForm.calculation_method === 'percentage'">
									<div class="mb-3">
										<label for="percentageOf" class="form-label">Відсоток</label>
										<input type="number" step="0.01" class="form-control" id="percentageOf" 
											   v-model="tariffForm.percentage_of"
											   placeholder="80">
										<small class="form-text text-muted">Відсоток від основного тарифу</small>
									</div>
								</div>
							</div>
						</form>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" @click="closeModal">Скасувати</button>
						<button type="button" class="btn btn-primary" @click="saveTariff" :disabled="isSaving">
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
						<p>Ви дійсно хочете видалити тариф "<strong>{{ tariffToDelete?.name }}</strong>"?</p>
						<p class="text-warning">
							<i class="fas fa-exclamation-triangle me-2"></i>
							Ця дія може вплинути на розрахунки показників!
						</p>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Скасувати</button>
						<button type="button" class="btn btn-danger" @click="deleteTariff" :disabled="isDeleting">
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
import { useRoute } from 'vue-router';
import { 
	useGetTariffsApiUtilitiesTariffsGet,
	useGetServiceApiUtilitiesServicesServiceIdGet,
	useCreateTariffApiUtilitiesTariffsPost,
	useUpdateTariffApiUtilitiesTariffsTariffIdPatch,
	useDeleteTariffApiUtilitiesTariffsTariffIdDelete
} from '@/api/utilities/utilities';

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
