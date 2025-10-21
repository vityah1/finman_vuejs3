<template>
	<div class="tariff-list">
		<div class="header-section">
			<Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="breadcrumb-custom">
				<template #item="{ item }">
					<router-link v-if="item.route" :to="item.route" class="p-menuitem-link">
						<span class="p-menuitem-text">{{ item.label }}</span>
					</router-link>
					<span v-else class="p-menuitem-text">{{ item.label }}</span>
				</template>
			</Breadcrumb>
			<div class="flex justify-content-between align-items-center title-row">
				<h2 class="page-title"><i class="pi pi-money-bill mr-2"></i>Тарифи</h2>
				<div class="flex gap-2 action-buttons">
					<Button
						label="Назад"
						icon="pi pi-arrow-left"
						severity="secondary"
						size="small"
						class="back-btn"
						@click="$router.push(getServicesRoute())"
					/>
					<Button label="Додати тариф" icon="pi pi-plus" size="small" class="add-btn" @click="showAddModal = true" />
				</div>
			</div>
		</div>

		<div v-if="isLoading" class="text-center">
			<ProgressSpinner />
		</div>

		<div v-else-if="tariffs.length === 0" class="text-center">
			<Card>
				<template #content>
					<i class="pi pi-money-bill fa-3x text-muted mb-3"></i>
					<h5>Тарифів ще не додано</h5>
					<p class="text-muted">Додайте тарифи для розрахунку вартості</p>
					<Button label="Додати перший тариф" icon="pi pi-plus" @click="showAddModal = true" />
				</template>
			</Card>
		</div>

		<div v-else>
				<!-- Desktop table -->
				<div class="table-responsive desktop-table">
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
									<Tag v-if="tariff.tariff_type" severity="info" :value="getTariffTypeLabel(tariff.tariff_type)" />
									<span v-else class="text-muted">-</span>
								</td>
								<td>
									<strong>{{ formatRate(tariff.rate) }}</strong>
									<span v-if="tariff.calculation_method === 'percentage' && tariff.percentage_of"
										  class="text-muted block">
										<small>({{ tariff.percentage_of }}% від основного)</small>
									</span>
								</td>
								<td>{{ tariff.currency || 'UAH' }}</td>
								<td>
									<Tag v-if="tariff.group_code" severity="secondary" :value="tariff.group_code" />
									<span v-else class="text-muted">-</span>
								</td>
								<td>
									<Tag v-if="tariff.source === 'import'" severity="warning" value="Імпорт" />
									<Tag v-else severity="primary" value="Інтерфейс" />
								</td>
								<td>
									<small class="text-muted block">
										з {{ formatDate(tariff.valid_from) }}
									</small>
									<small v-if="tariff.valid_to" class="text-muted block">
										до {{ formatDate(tariff.valid_to) }}
									</small>
									<small v-else class="text-muted block">безстроково</small>
								</td>
								<td>
									<Tag v-if="tariff.is_active" severity="success" value="Активний" />
									<Tag v-else severity="secondary" value="Неактивний" />
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

				<!-- Mobile card view -->
				<div class="mobile-cards">
					<div v-for="tariff in tariffs" :key="tariff.id" class="tariff-card">
						<div class="tariff-card-header">
							<div class="tariff-name">{{ tariff.name }}</div>
							<Tag v-if="tariff.is_active" severity="success" value="Активний" />
							<Tag v-else severity="secondary" value="Неактивний" />
						</div>
						<div class="tariff-card-body">
							<div class="tariff-info-row">
								<span class="info-label">Ставка:</span>
								<span class="info-value rate">{{ formatRate(tariff.rate) }} {{ tariff.currency || 'UAH' }}</span>
							</div>
							<div class="tariff-info-row" v-if="tariff.tariff_type">
								<span class="info-label">Тип:</span>
								<Tag severity="info" :value="getTariffTypeLabel(tariff.tariff_type)" />
							</div>
							<div class="tariff-info-row" v-if="tariff.group_code">
								<span class="info-label">Група:</span>
								<Tag severity="secondary" :value="tariff.group_code" />
							</div>
							<div class="tariff-info-row">
								<span class="info-label">Період:</span>
								<span class="info-value period">
									{{ formatDate(tariff.valid_from) }}
									<span v-if="tariff.valid_to"> - {{ formatDate(tariff.valid_to) }}</span>
									<span v-else> - безстроковий</span>
								</span>
							</div>
							<div class="tariff-info-row" v-if="tariff.calculation_method === 'percentage' && tariff.percentage_of">
								<span class="info-label">Розрахунок:</span>
								<span class="info-value">{{ tariff.percentage_of }}% від основного</span>
							</div>
						</div>
						<div class="tariff-card-footer">
							<Button icon="pi pi-pencil" label="Редагувати" @click="editTariff(tariff)" outlined size="small" class="flex-1" />
							<Button icon="pi pi-trash" @click="confirmDelete(tariff)" outlined severity="danger" size="small" />
						</div>
					</div>
				</div>
			</div>

		<!-- Add/Edit Tariff Dialog -->
		<Dialog
			v-model:visible="showAddModal"
			:header="editingTariff ? 'Редагувати тариф' : 'Додати новий тариф'"
			:modal="true"
			class="tariff-dialog"
			@hide="closeModal"
		>
			<form @submit.prevent="saveTariff">
				<div class="formgrid grid">
					<div class="field col-12 md:col-4">
						<label for="tariffName">Назва тарифу <span style="color: var(--red-500)">*</span></label>
					</div>
					<div class="field col-12 md:col-8">
						<InputText
							id="tariffName"
							v-model="tariffForm.name"
							required
							placeholder="Наприклад: Денний тариф, Нічний тариф"
							class="w-full"
						/>
					</div>
				</div>

				<div class="formgrid grid">
					<div class="field col-12 md:col-4">
						<label for="tariffRate">Ставка <span style="color: var(--red-500)">*</span></label>
					</div>
					<div class="field col-12 md:col-4">
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
					<div class="field col-12 md:col-4">
						<Dropdown
							id="tariffCurrency"
							v-model="tariffForm.currency"
							:options="['UAH', 'USD', 'EUR']"
							placeholder="Валюта"
							class="w-full"
						/>
					</div>
				</div>

				<div class="formgrid grid">
					<div class="field col-12 md:col-4">
						<label for="validFrom">Дійсний з <span style="color: var(--red-500)">*</span></label>
					</div>
					<div class="field col-12 md:col-4">
						<Calendar
							id="validFrom"
							v-model="tariffForm.valid_from"
							dateFormat="yy-mm-dd"
							required
							class="w-full"
						/>
					</div>
					<div class="field col-12 md:col-4">
						<Calendar
							id="validTo"
							v-model="tariffForm.valid_to"
							dateFormat="yy-mm-dd"
							placeholder="Дійсний до"
							class="w-full"
						/>
						<small class="block text-color-secondary">Порожнє = безстроковий</small>
					</div>
				</div>

				<div class="formgrid grid">
					<div class="field col-12 md:col-4"></div>
					<div class="field col-12 md:col-8">
						<div class="field-checkbox">
							<Checkbox
								id="tariffActive"
								v-model="tariffForm.is_active"
								:binary="true"
							/>
							<label for="tariffActive">Активний тариф</label>
						</div>
					</div>
				</div>

				<!-- Розширені налаштування -->
				<div class="divider my-4">
					<span class="text-color-secondary font-semibold">Розширені налаштування</span>
				</div>

				<div class="formgrid grid">
					<div class="field col-12 md:col-4">
						<label for="tariffType">Тип тарифу</label>
					</div>
					<div class="field col-12 md:col-8">
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

				<div class="formgrid grid">
					<div class="field col-12 md:col-4">
						<label for="groupCode">Код групи</label>
					</div>
					<div class="field col-12 md:col-8">
						<InputText
							id="groupCode"
							v-model="tariffForm.group_code"
							placeholder="Наприклад: water_2025"
							class="w-full"
						/>
						<small class="block text-color-secondary">Для групування пов'язаних тарифів</small>
					</div>
				</div>

				<div class="formgrid grid">
					<div class="field col-12 md:col-4">
						<label for="calculationMethod">Метод розрахунку</label>
					</div>
					<div class="field col-12 md:col-8">
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

				<div class="formgrid grid" v-if="tariffForm.calculation_method === 'percentage'">
					<div class="field col-12 md:col-4">
						<label for="percentageOf">Відсоток</label>
					</div>
					<div class="field col-12 md:col-8">
						<InputNumber
							id="percentageOf"
							v-model="tariffForm.percentage_of"
							:minFractionDigits="2"
							:maxFractionDigits="2"
							placeholder="80"
							class="w-full"
						/>
						<small class="block text-color-secondary">Відсоток від основного тарифу</small>
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
			class="confirm-dialog"
		>
			<div class="confirmation-content">
				<p class="mb-3">Ви дійсно хочете видалити тариф "<strong>{{ tariffToDelete?.name }}</strong>"?</p>
				<Message severity="warn" :closable="false">
					Ця дія може вплинути на розрахунки показників!
				</Message>
			</div>

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
import { useRoute, useRouter } from 'vue-router';
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
import Tag from 'primevue/tag';
import Breadcrumb from 'primevue/breadcrumb';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Checkbox from 'primevue/checkbox';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import Card from 'primevue/card';

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
		ProgressSpinner,
		Tag,
		Breadcrumb,
		Card
	},
	setup() {
		const route = useRoute();
		const router = useRouter();
		const serviceId = computed(() => parseInt(route.params.serviceId as string));
		const addressId = computed(() => route.params.addressId ? parseInt(route.params.addressId as string) : null);

		// Breadcrumb
		const breadcrumbHome = { icon: 'pi pi-home', route: '/' };
		const breadcrumbItems = computed(() => [
			{ label: 'Комунальні' },
			{ label: 'Адреси', route: { name: 'utilities_addresses' } },
			{ label: 'Служби', route: addressId.value ? { name: 'utilities_services', params: { addressId: addressId.value } } : null },
			{ label: 'Тарифи' }
		]);

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
			addressId,
			breadcrumbHome,
			breadcrumbItems,

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
	padding: 0;
}

/* Header section */
.header-section {
	margin-bottom: 0.75rem;
}

.breadcrumb-custom {
	background: none;
	padding: 0;
	margin-bottom: 0.5rem;
}

.title-row {
	margin-bottom: 0;
}

.page-title {
	margin: 0;
	font-size: 1.5rem;
}

.modal {
	background: rgba(0,0,0,0.5);
}

.card {
	border: none;
	box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.table-responsive {
	margin-bottom: 1rem;
}

/* Mobile cards - hidden on desktop */
.mobile-cards {
	display: none;
}

/* Dialog styles */
.tariff-dialog :deep(.p-dialog) {
	width: 800px;
	max-width: 95vw;
}

.confirm-dialog :deep(.p-dialog) {
	width: 500px;
	max-width: 95vw;
}

/* Mobile optimization */
@media (max-width: 768px) {
	.header-section {
		margin-bottom: 0.5rem;
	}

	.breadcrumb-custom {
		margin-bottom: 0.375rem;
	}

	.breadcrumb-custom :deep(.p-breadcrumb) {
		padding: 0.25rem 0;
		font-size: 0.8rem;
	}

	.page-title {
		font-size: 1.125rem;
	}

	.action-buttons {
		flex-direction: row;
		gap: 0.375rem;
	}

	.back-btn {
		font-size: 0.8rem;
		padding: 0.375rem 0.75rem;
	}

	.back-btn :deep(.p-button-label) {
		display: none;
	}

	.back-btn :deep(.p-button-icon) {
		margin: 0;
	}

	.add-btn {
		font-size: 0.8rem;
		padding: 0.375rem 0.75rem;
	}

	.add-btn :deep(.p-button-label) {
		display: none;
	}

	.add-btn :deep(.p-button-icon) {
		margin: 0;
	}

	/* Hide desktop table, show mobile cards */
	.desktop-table {
		display: none;
	}

	.mobile-cards {
		display: block;
	}

	/* Tariff cards */
	.tariff-card {
		background: var(--surface-card);
		border: 1px solid var(--surface-border);
		border-radius: 0.375rem;
		padding: 0.75rem;
		margin-bottom: 0.5rem;
	}

	.tariff-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--surface-border);
	}

	.tariff-name {
		font-weight: 600;
		font-size: 1rem;
		flex: 1;
	}

	.tariff-card-body {
		margin-bottom: 0.75rem;
	}

	.tariff-info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.375rem 0;
		gap: 0.5rem;
	}

	.info-label {
		color: var(--text-color-secondary);
		font-size: 0.875rem;
		flex-shrink: 0;
	}

	.info-value {
		font-weight: 500;
		text-align: right;
	}

	.info-value.rate {
		font-weight: 700;
		font-size: 1.125rem;
		color: var(--primary-color);
	}

	.info-value.period {
		font-size: 0.875rem;
	}

	.tariff-card-footer {
		display: flex;
		gap: 0.5rem;
		padding-top: 0.5rem;
		border-top: 1px solid var(--surface-border);
	}

	.tariff-card-footer .flex-1 :deep(.p-button-label) {
		display: inline;
	}

	/* Dialog forms */
	.tariff-dialog :deep(.p-dialog) {
		width: 95vw;
	}

	.tariff-dialog :deep(.p-dialog-content) {
		padding: 0.5rem;
	}

	.tariff-dialog .formgrid {
		margin: 0;
	}

	.tariff-dialog .field {
		padding: 0.25rem 0;
	}

	.tariff-dialog .field label {
		font-size: 0.875rem;
		margin-bottom: 0.25rem;
	}

	.tariff-dialog .divider {
		margin: 0.75rem 0;
	}

	.confirm-dialog :deep(.p-dialog) {
		width: 90vw;
	}

	.confirm-dialog :deep(.p-dialog-content) {
		padding: 0.5rem;
	}
}
</style>
