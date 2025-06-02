<template>
	<div class="tariff-list">
		<div class="container-fluid">
			<div class="row mb-4">
				<div class="col-sm-8">
					<h2><i class="fas fa-money-bill me-2"></i>Тарифи</h2>
				</div>
				<div class="col-sm-4 text-end">
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
								<th>Ставка</th>
								<th>Абонплата</th>
								<th>Валюта</th>
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
									<strong>{{ formatRate(tariff.rate) }}</strong>
								</td>
								<td>
									<span v-if="tariff.subscription_fee">{{ formatRate(tariff.subscription_fee) }}</span>
									<span v-else class="text-muted">-</span>
								</td>
								<td>{{ tariff.currency || 'UAH' }}</td>
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
								<div class="col-md-6">
									<div class="mb-3">
										<label for="tariffRate" class="form-label">Ставка <span class="text-danger">*</span></label>
										<input type="number" step="0.01" class="form-control" id="tariffRate" 
											   v-model="tariffForm.rate" required 
											   placeholder="0.00">
									</div>
								</div>
								<div class="col-md-6">
									<div class="mb-3">
										<label for="subscriptionFee" class="form-label">Абонплата</label>
										<input type="number" step="0.01" class="form-control" id="subscriptionFee" 
											   v-model="tariffForm.subscription_fee" 
											   placeholder="0.00">
										<small class="form-text text-muted">Фіксована щомісячна плата (опціонально)</small>
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
import { defineComponent, ref, reactive, computed } from 'vue';
import { useRoute } from 'vue-router';

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
		const isLoading = ref(false);

		// Form data
		const tariffForm = reactive({
			name: '',
			rate: 0,
			subscription_fee: 0,
			currency: 'UAH',
			valid_from: '',
			valid_to: '',
			is_active: true
		});

		// Mock data for now
		const tariffs = computed(() => [] as TariffData[]);

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

		const resetForm = () => {
			tariffForm.name = '';
			tariffForm.rate = 0;
			tariffForm.subscription_fee = 0;
			tariffForm.currency = 'UAH';
			tariffForm.valid_from = '';
			tariffForm.valid_to = '';
			tariffForm.is_active = true;
			editingTariff.value = null;
		};

		const editTariff = (tariff: TariffData) => {
			editingTariff.value = tariff;
			tariffForm.name = tariff.name;
			tariffForm.rate = tariff.rate;
			tariffForm.subscription_fee = tariff.subscription_fee || 0;
			tariffForm.currency = tariff.currency;
			tariffForm.valid_from = tariff.valid_from;
			tariffForm.valid_to = tariff.valid_to || '';
			tariffForm.is_active = tariff.is_active;
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
					subscription_fee: tariffForm.subscription_fee || null,
					currency: tariffForm.currency,
					valid_from: tariffForm.valid_from,
					valid_to: tariffForm.valid_to || undefined,
					is_active: tariffForm.is_active
				};

				// TODO: Implement save logic with real API
				console.log('Save tariff:', tariffData);
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
				// TODO: Implement delete logic
				console.log('Delete tariff:', tariffToDelete.value);
				showDeleteModal.value = false;
				tariffToDelete.value = null;
			} catch (error) {
				console.error('Помилка видалення тарифу:', error);
			} finally {
				isDeleting.value = false;
			}
		};

		return {
			// Data
			tariffs,
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
			editTariff,
			closeModal,
			saveTariff,
			confirmDelete,
			deleteTariff
		};
	}
});
</script>

<style scoped>
.tariff-list {
	padding: 20px 0;
}

.modal {
	background: rgba(0,0,0,0.5);
}

.card {
	border: none;
	box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>
