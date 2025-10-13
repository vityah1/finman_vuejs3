<template>
	<div class="add-reading">
		<alert-component ref="myAlert"></alert-component>

		<div class="mb-4">
			<Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-3">
				<template #item="{ item }">
					<router-link v-if="item.route" :to="item.route" class="p-menuitem-link">
						<span class="p-menuitem-text">{{ item.label }}</span>
					</router-link>
					<span v-else class="p-menuitem-text">{{ item.label }}</span>
				</template>
			</Breadcrumb>
			<h2><i class="fas fa-plus mr-2"></i>{{ isEditing ? 'Редагувати' : 'Додати' }} показники лічильників</h2>
			<p class="text-muted">{{ isEditing ? 'Редагуйте' : 'Внесіть поточні' }} показники ваших лічильників</p>
		</div>

		<div class="grid">
			<div class="col-12 lg:col-8">
				<Card>
					<template #title>
						<i class="fas fa-edit mr-2"></i>{{ isEditing ? 'Редагування' : 'Форма внесення' }} показників
					</template>
					<template #content>
						<form @submit.prevent="saveReading">
								<div class="formgrid grid">
									<div class="field col-12 md:col-2">
										<label for="addressSelect">Адреса <span style="color: var(--red-500)">*</span></label>
									</div>
									<div class="field col-12 md:col-4">
										<Dropdown
											id="addressSelect"
											v-model="readingForm.address_id"
											:options="addresses"
											optionLabel="name"
											optionValue="id"
											placeholder="Оберіть адресу"
											required
											@change="onAddressChange"
										>
											<template #option="slotProps">
												<div>{{ slotProps.option.name }} - {{ slotProps.option.address }}</div>
											</template>
										</Dropdown>
									</div>
									<div class="field col-12 md:col-2">
										<label for="serviceSelect">Служба <span style="color: var(--red-500)">*</span></label>
									</div>
									<div class="field col-12 md:col-4">
										<Dropdown
											id="serviceSelect"
											v-model="readingForm.service_id"
											:options="filteredServices"
											optionLabel="name"
											optionValue="id"
											placeholder="Оберіть службу"
											required
											:disabled="!readingForm.address_id"
											@change="onServiceChange"
										>
											<template #option="slotProps">
												<div>{{ slotProps.option.name }} ({{ slotProps.option.unit }})</div>
											</template>
										</Dropdown>
									</div>
								</div>

								<div class="formgrid grid">
									<div class="field col-12 md:col-2">
										<label for="period">Період <span style="color: var(--red-500)">*</span></label>
									</div>
									<div class="field col-12 md:col-4">
										<PeriodSelector v-model="readingForm.period" />
										<small class="block text-color-secondary">До 15 - попередній</small>
									</div>
									<div class="field col-12 md:col-2">
										<label for="readingDate">Дата зняття</label>
									</div>
									<div class="field col-12 md:col-4">
										<Calendar
											id="readingDate"
											v-model="readingForm.reading_date"
											dateFormat="yy-mm-dd"
										/>
									</div>
								</div>

								<div class="formgrid grid" v-if="!isMultiTariffService && !(availableTariffs.length > 1 && availableTariffs.every(t => t.calculation_method === 'fixed'))">
									<div class="field col-12 md:col-2">
										<label for="tariffSelect">Тариф <span style="color: var(--red-500)">*</span></label>
									</div>
									<div class="field col-12 md:col-10">
										<Dropdown
											v-if="!selectedService?.has_shared_meter"
											id="tariffSelect"
											v-model="readingForm.tariff_id"
											:options="availableTariffs"
											optionLabel="name"
											optionValue="id"
											placeholder="Оберіть тариф"
											required
											:disabled="!readingForm.service_id"
										>
											<template #option="slotProps">
												<div>{{ slotProps.option.name }} - {{ formatRate(slotProps.option.rate) }} {{ slotProps.option.currency }}</div>
											</template>
										</Dropdown>
										<Message v-else severity="info" :closable="false">
											Для цієї служби будуть автоматично розраховані суми за всіма тарифами:
											<ul class="m-0 mt-2">
												<li v-for="tariff in availableTariffs" :key="tariff.id">
													{{ tariff.name }} - {{ formatRate(tariff.rate) }} {{ tariff.currency }}/{{ selectedService?.unit }}
												</li>
											</ul>
										</Message>
									</div>
								</div>

								<div class="formgrid grid" v-if="hasFixedPaymentTariff && !selectedService?.has_shared_meter && availableTariffs.length === 1">
									<div class="field col-12 md:col-2">
										<label for="paymentAmount">Сума до сплати <span style="color: var(--red-500)">*</span></label>
									</div>
									<div class="field col-12 md:col-10">
										<InputNumber
											id="paymentAmount"
											v-model="readingForm.amount"
											mode="decimal"
											:minFractionDigits="2"
											:maxFractionDigits="2"
											:suffix="' ' + (selectedTariff?.currency || 'UAH')"
											required
										/>
										<small class="block text-color-secondary">Введіть суму згідно квитанції</small>
									</div>
								</div>

								<div v-else-if="selectedService?.has_shared_meter && !isEditing">
									<!-- Для служб зі спільним показником (звичайних) -->
									<Message severity="info" :closable="false" class="mb-3">
										<strong>Спільний показник для всіх тарифів</strong>
										<p class="m-0 mt-2">
											Ця служба використовує один показник для розрахунку тарифів споживання.
											Введіть поточний показник, і система автоматично розрахує суми за всіма тарифами (включаючи фіксовані платежі).
										</p>
									</Message>

									<div class="formgrid grid">
										<div class="field col-12 md:col-2">
											<label for="currentReading">Поточний показник <span style="color: var(--red-500)">*</span></label>
										</div>
										<div class="field col-12 md:col-4">
											<InputNumber
												id="currentReading"
												v-model="readingForm.current_reading"
												:suffix="' ' + (selectedService?.unit || '')"
												:min="0"
												:minFractionDigits="0"
												:maxFractionDigits="3"
												required
												:class="{ 'p-invalid': (!readingForm.current_reading || readingForm.current_reading <= 0) && formSubmitted }"
												@input="calculateConsumption"
											/>
											<small v-if="(!readingForm.current_reading || readingForm.current_reading <= 0) && formSubmitted" class="p-error">
												Введіть коректний поточний показник (більше 0)
											</small>
										</div>
										<div class="field col-12 md:col-2">
											<label for="previousReading">Попередній показник</label>
										</div>
										<div class="field col-12 md:col-4">
											<InputNumber
												id="previousReading"
												v-model="readingForm.previous_reading"
												:suffix="' ' + (selectedService?.unit || '')"
												:minFractionDigits="0"
												:maxFractionDigits="3"
												:placeholder="lastReadingHint"
												readonly
												@input="calculateConsumption"
											/>
											<small class="block text-color-secondary">
												{{ lastReadingHint ? `Останній: ${lastReadingHint}` : 'Автоматично' }}
											</small>
										</div>
									</div>
								</div>


								<div v-else-if="availableTariffs.length > 1 && availableTariffs.every(t => t.calculation_method === 'fixed')">
									<!-- Для служб з декількома фіксованими тарифами (квартплата) -->
									<h6 class="mb-3">Суми за тарифами</h6>

									<div class="formgrid grid">
										<div class="field col-12 md:col-6" v-for="tariff in availableTariffs" :key="tariff.id">
											<Panel :header="tariff.name" class="mb-3">
												<template #header>
													<strong>{{ tariff.name }}</strong>
													<small class="ml-2 text-color-secondary">({{ tariff.tariff_type === 'subscription' ? 'абонплата' : 'змінна сума' }})</small>
												</template>

												<div class="field">
													<label>Сума <span style="color: var(--red-500)">*</span></label>
													<InputNumber
														v-model="tariffAmounts[tariff.id]"
														mode="decimal"
														:minFractionDigits="2"
														:maxFractionDigits="2"
														suffix=" грн"
														:readonly="tariff.tariff_type === 'subscription'"
														required
													/>
													<small v-if="tariff.tariff_type === 'subscription'" class="block text-color-secondary mt-1">
														Автоматично з тарифу: {{ formatCurrency(tariff.rate) }}
													</small>
													<small v-else class="block text-color-secondary mt-1">
														Введіть суму вручну
													</small>
												</div>
											</Panel>
										</div>
									</div>
								</div>

								<div v-else-if="isMultiTariffService">
									<!-- Для електрики - декілька показників -->
									<h6 class="mb-3">Показники лічильника</h6>

									<div class="formgrid grid">
										<div class="field col-12 md:col-6" v-for="tariffGroup in groupedTariffs" :key="tariffGroup.type">
											<Panel :header="getTariffTypeLabel(tariffGroup.type)" class="mb-3">
												<div class="field">
													<label>Поточний показник</label>
													<InputNumber
														:modelValue="getMultiReadingValue(tariffGroup.type, 'current_reading')"
														@update:modelValue="setMultiReadingValue(tariffGroup.type, 'current_reading', $event); calculateMultiConsumption(tariffGroup.type)"
														:suffix="' ' + (selectedService?.unit || '')"
														:minFractionDigits="0"
														:maxFractionDigits="3"
													/>
												</div>

												<div class="field">
													<label>Попередній показник</label>
													<InputNumber
														:modelValue="getMultiReadingValue(tariffGroup.type, 'previous_reading')"
														@update:modelValue="setMultiReadingValue(tariffGroup.type, 'previous_reading', $event); calculateMultiConsumption(tariffGroup.type)"
														:suffix="' ' + (selectedService?.unit || '')"
														:minFractionDigits="0"
														:maxFractionDigits="3"
														readonly
													/>
												</div>

												<small class="text-color-secondary">
													Споживання: {{ getMultiReadingValue(tariffGroup.type, 'consumption') }} {{ selectedService?.unit }}
												</small>
											</Panel>
										</div>
									</div>
								</div>

								<div v-else>
									<!-- Стандартний варіант -->
									<div class="formgrid grid">
										<div class="field col-12 md:col-2">
											<label for="currentReading">Поточний показник <span style="color: var(--red-500)">*</span></label>
										</div>
										<div class="field col-12 md:col-4">
											<InputNumber
												id="currentReading"
												v-model="readingForm.current_reading"
												:suffix="' ' + (selectedService?.unit || '')"
												:minFractionDigits="0"
												:maxFractionDigits="3"
												required
												@input="calculateConsumption"
											/>
										</div>
										<div class="field col-12 md:col-2">
											<label for="previousReading">Попередній показник</label>
										</div>
										<div class="field col-12 md:col-4">
											<InputNumber
												id="previousReading"
												v-model="readingForm.previous_reading"
												:suffix="' ' + (selectedService?.unit || '')"
												:minFractionDigits="0"
												:maxFractionDigits="3"
												:placeholder="lastReadingHint"
												readonly
												@input="calculateConsumption"
											/>
											<small class="block text-color-secondary">
												{{ lastReadingHint ? `Останній: ${lastReadingHint}` : 'Автоматично' }}
											</small>
										</div>
									</div>
								</div>

								<div class="formgrid grid">
									<div class="field col-12 md:col-2">
										<label for="notes">Примітки</label>
									</div>
									<div class="field col-12 md:col-10">
										<Textarea
											id="notes"
											v-model="readingForm.notes"
											rows="3"
											cols="50"
											placeholder="Додаткова інформація про показники"
											auto-resize
										/>
									</div>
									<div class="field col-12 md:col-4"></div>
								</div>

								<div class="formgrid grid">
									<div class="field col-12 md:col-2"></div>
									<div class="field col-12 md:col-10">
										<div class="field-checkbox">
											<Checkbox
												id="isPaid"
												v-model="readingForm.is_paid"
												:binary="true"
											/>
											<label for="isPaid">Показники оплачені</label>
										</div>
									</div>
								</div>

								<div class="flex justify-content-between">
									<Button
										type="button"
										label="Назад"
										icon="pi pi-arrow-left"
										severity="secondary"
										@click="goBack"
									/>

									<div class="flex gap-2">
										<Button
											v-if="isEditing"
											type="button"
											:label="isDeleting ? 'Видалення...' : 'Видалити'"
											icon="pi pi-trash"
											severity="danger"
											@click="promptDeleteReading"
											:disabled="isDeleting"
											:loading="isDeleting"
										/>
										<Button
											type="submit"
											:label="isSaving ? 'Збереження...' : (isEditing ? 'Оновити' : 'Зберегти')"
											icon="pi pi-save"
											:disabled="isSaving"
											:loading="isSaving"
										/>
									</div>
								</div>
							</form>
						</template>
					</Card>
				</div>

				<div class="col-12 lg:col-4">
					<Card>
						<template #title>
							<i class="fas fa-calculator mr-2"></i>Розрахунок
						</template>
						<template #content>
							<div v-if="!calculationData.consumption && !selectedService?.has_shared_meter" class="text-center text-muted">
								<i class="fas fa-info-circle fa-2x mb-3"></i>
								<p>Заповніть показники для автоматичного розрахунку</p>
							</div>
							<div v-else-if="selectedService?.has_shared_meter && readingForm.current_reading">
								<div class="mb-3" v-if="availableTariffs.length <= 1">
									<h6>Споживання</h6>
									<div class="h4 text-primary">
										{{ calculationData.consumption || (readingForm.current_reading - (readingForm.previous_reading || 0)) }} 
										<small class="text-muted">{{ selectedService?.unit }}</small>
									</div>
								</div>
								<div class="mb-3" v-else>
									<h6>Споживання</h6>
									<div class="small text-muted">По тарифах:</div>
									<div v-for="tariff in availableTariffs" :key="tariff.id" class="flex justify-content-between">
										<span>{{ tariff.name }}:</span>
										<span class="text-primary font-bold">
											{{ getTariffConsumption(tariff) }} 
											<small class="text-muted">{{ selectedService?.unit }}</small>
										</span>
									</div>
								</div>

								<div class="mb-3">
									<h6>Розрахунок за тарифами:</h6>
									<table class="table table-sm">
										<tbody>
											<tr v-for="tariff in availableTariffs" :key="tariff.id">
												<td>{{ tariff.name }}</td>
												<td class="text-right">
													<span v-if="tariff.tariff_type !== 'subscription'">
														{{ formatRate(tariff.rate) }} × {{ getTariffConsumption(tariff) }}
													</span>
													<span v-else>
														Фіксовано
													</span>
												</td>
												<td class="text-right font-bold">
													{{ formatCurrency(calculateTariffAmount(tariff)) }}
												</td>
											</tr>
										</tbody>
										<tfoot>
											<tr class="font-bold">
												<td colspan="2">Всього до сплати:</td>
												<td class="text-right text-success h5">{{ formatCurrency(calculateTotalAmount()) }}</td>
											</tr>
										</tfoot>
									</table>
								</div>
							</div>
							<div v-else-if="!selectedService?.has_shared_meter && calculationData.consumption">
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
										<small class="text-muted block">за {{ selectedService?.unit }}</small>
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
						</template>
					</Card>

					<Card class="mt-3">
						<template #title>
							<i class="fas fa-history mr-2"></i>Останні показники
						</template>
						<template #content>
							<div v-if="recentReadings.length === 0" class="text-center text-muted">
								<i class="fas fa-clock fa-2x mb-3"></i>
								<p>Історія показників порожня</p>
							</div>
							<div v-else>
								<div v-for="reading in recentReadings" :key="`${reading.service_id}-${reading.period}`"
									 class="mb-2 p-2 bg-light rounded">
									<div class="flex justify-content-between">
										<div>
											<strong>{{ getServiceName(reading.service_id) }}</strong>
											<small class="text-muted block">{{ formatPeriod(reading.period) }}</small>
										</div>
										<div class="text-right">
											<div>{{ reading.current_reading }}</div>
											<small class="text-muted">{{ formatCurrency(reading.amount) }}</small>
										</div>
									</div>
								</div>
							</div>
						</template>
					</Card>

					<Card class="mt-3">
						<template #title>
							<i class="fas fa-lightbulb mr-2"></i>Поради
						</template>
						<template #content>
							<ul class="list-unstyled small">
								<li class="mb-2">
									<i class="fas fa-check text-success mr-2"></i>
									Знімайте показники в один і той же день місяця
								</li>
								<li class="mb-2">
									<i class="fas fa-check text-success mr-2"></i>
									Перевіряйте правильність введених даних
								</li>
								<li class="mb-2">
									<i class="fas fa-check text-success mr-2"></i>
									Фотографуйте лічильники для підтвердження
								</li>
								<li class="mb-2">
									<i class="fas fa-check text-success mr-2"></i>
									Ведіть регулярний облік споживання
								</li>
							</ul>
						</template>
					</Card>
				</div>
			</div>

		<!-- Модальне вікно підтвердження видалення -->
		<Dialog
			v-model:visible="showDeleteConfirmModal"
			header="Підтвердження дії"
			:modal="true"
			:style="{ width: '450px' }"
		>
			<p>Ви впевнені, що хочете видалити цей показник?</p>
			<p class="text-muted small">Цю дію не можна буде скасувати.</p>

			<template #footer>
				<Button label="Ні" icon="pi pi-times" @click="showDeleteConfirmModal = false" text />
				<Button label="Так, видалити" icon="pi pi-check" @click="handleDeleteConfirm" severity="danger" />
			</template>
		</Dialog>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PeriodSelector from './PeriodSelector.vue';
import AlertComponent from '../AlertComponent.vue';
import { 
	useGetAddressesApiUtilitiesAddressesGet,
	useGetServicesApiUtilitiesServicesGet,
	useGetTariffsApiUtilitiesTariffsGet,
	useGetReadingsApiUtilitiesReadingsGet,
	useGetReadingApiUtilitiesReadingsReadingIdGet,
	useCreateReadingApiUtilitiesReadingsPost,
	useUpdateReadingApiUtilitiesReadingsReadingIdPatch,
	useDeleteReadingApiUtilitiesReadingsReadingIdDelete,
	useCreateTariffApiUtilitiesTariffsPost,
	useGetGroupedReadingsEndpointApiUtilitiesGroupedReadingsGet
} from '@/api/utilities/utilities';
import type { UtilityReadingCreate, UtilityReadingUpdate, UtilityReadingResponse, UtilityTariffResponse } from '@/api/model';

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
	service_group?: string;
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

import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import InputNumber from 'primevue/inputnumber';
import Message from 'primevue/message';
import Panel from 'primevue/panel';
import Textarea from 'primevue/textarea';
import Checkbox from 'primevue/checkbox';
import Breadcrumb from 'primevue/breadcrumb';
import Card from 'primevue/card';

export default defineComponent({
	name: 'AddReading',
	components: {
		PeriodSelector,
		AlertComponent,
		Dialog,
		Button,
		Dropdown,
		Calendar,
		InputNumber,
		Message,
		Panel,
		Textarea,
		Checkbox,
		Breadcrumb,
		Card
	},
	setup() {
		const route = useRoute();
		const router = useRouter();

		// Reactive state
		const isSaving = ref(false);
		const myAlert = ref(null);
		const isDeleting = ref(false);
    const showDeleteConfirmModal = ref(false);
		const lastReadingHint = ref('');
		const formSubmitted = ref(false);
		const editReadingId = computed(() => route.query.editReadingId ? parseInt(route.query.editReadingId as string) : null);
		const isEditing = computed(() => editReadingId.value !== null);

		// Функція для автовизначення періоду на основі поточної дати
		const getDefaultPeriod = (): string => {
			const now = new Date();
			const currentDay = now.getDate();
			
			// Якщо до 15 числа - попередній місяць, інакше поточний
			if (currentDay <= 15) {
				// Створюємо дату попереднього місяця
				const prevMonth = new Date(now);
				prevMonth.setMonth(prevMonth.getMonth() - 1);
				return prevMonth.toISOString().slice(0, 7);
			} else {
				return now.toISOString().slice(0, 7);
			}
		};

		// Form data
		const readingForm = reactive({
			address_id: parseInt(route.query.addressId as string) || 0,
			service_id: parseInt(route.query.serviceId as string) || 0,
			period: route.query.period as string || getDefaultPeriod(),
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

		// Tariff amounts for fixed amount services (like квартплата)
		const tariffAmounts = ref<Record<number, number>>({});

		// API calls
		const { data: addressesData } = useGetAddressesApiUtilitiesAddressesGet();
		const { data: servicesData } = useGetServicesApiUtilitiesServicesGet();
		const { data: tariffsData } = useGetTariffsApiUtilitiesTariffsGet();
		const { data: readingsData } = useGetReadingsApiUtilitiesReadingsGet(
			computed(() => ({
				address_id: readingForm.address_id || undefined
				// Не передаємо period щоб отримати всі показники для пошуку попереднього
			})),
			{
				query: {
					enabled: computed(() => !!readingForm.address_id)
				}
			}
		);

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
			
			// Filter services by address
			let availableServices = services.value.filter(service => service.address_id === readingForm.address_id);
			
			// If not editing, filter out services that already have readings for this period
			if (!isEditing.value && readingForm.period) {
				const existingReadings = readings.value || [];
				const servicesWithReadings = new Set(
					existingReadings
						.filter(reading => reading.period === readingForm.period)
						.map(reading => reading.service_id)
				);
				
				availableServices = availableServices.filter(service => 
					!servicesWithReadings.has(service.id)
				);
			}
			
			return availableServices;
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
		
		// Service type detection based on service and tariff attributes
		const hasFixedPaymentTariff = computed(() => {
			if (!readingForm.service_id) return false;
			return availableTariffs.value.some(tariff => 
				tariff.calculation_method === 'fixed'
			);
		});

		// Safe computed properties for multiReadingForm
		const getMultiReadingValue = (type: string, field: string) => {
			return multiReadingForm[type] ? multiReadingForm[type][field] : 0;
		};

		const setMultiReadingValue = (type: string, field: string, value: any) => {
			if (!multiReadingForm[type]) {
				multiReadingForm[type] = {
					current_reading: 0,
					previous_reading: 0,
					consumption: 0,
					tariff_id: 0
				};
			}
			multiReadingForm[type][field] = value;
		};
		
		const isMultiTariffService = computed(() => {
			if (!readingForm.service_id) return false;
			// Служба з різними типами тарифів що потребують окремих показників (день/ніч)
			const tariffTypes = new Set(availableTariffs.value.map(t => t.tariff_type).filter(t => t));
			const hasMultipleMeterTypes = tariffTypes.size > 1 && availableTariffs.value.some(t => t.calculation_method === 'standard');
			return hasMultipleMeterTypes && !selectedService.value?.has_shared_meter;
		});

		// Service with multiple fixed tariffs (like квартплата with different components)
		const isFixedAmountService = computed(() => {
			if (!readingForm.service_id || selectedService.value?.has_shared_meter) return false;
			// Служба має декілька тарифів з фіксованими сумами
			return availableTariffs.value.length > 1 && 
				   availableTariffs.value.every(t => t.calculation_method === 'fixed');
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
		
		// Helper function to determine if tariff requires manual input
		const requiresManualInput = (tariff: TariffData): boolean => {
			// Fixed tariffs with tariff_type === 'subscription' don't require manual input (auto-filled from tariff.rate)
			if (tariff.calculation_method === 'fixed' && tariff.tariff_type === 'subscription') {
				return false;
			}
			// Fixed tariffs with tariff_type !== 'subscription' require manual input
			if (tariff.calculation_method === 'fixed' && tariff.tariff_type !== 'subscription') {
				return true;
			}
			// Non-fixed tariffs don't require manual input (calculated automatically)
			return false;
		};

		// Check if shared meter service has fixed amount tariffs that need manual input
		const hasSharedMeterWithFixedAmounts = computed(() => {
			if (!selectedService.value?.has_shared_meter) return false;
			
			// Check if service has any tariffs with fixed calculation method
			return availableTariffs.value.some(tariff => tariff.calculation_method === 'fixed');
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
			if (isMultiTariffService.value) {
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
				
				// Calculate costs for multi-tariff service after setting tariffs
				calculateTotalCost();
			} else if (hasFixedPaymentTariff.value && availableTariffs.value.length === 0) {
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
			// Для служб зі спільним лічильником виключаємо показники з фіксованих тарифів
			const serviceReadings = readings.value
				.filter(reading => {
					// Basic filters
					if (reading.service_id !== readingForm.service_id) return false;
					if (reading.period >= readingForm.period) return false;
					if (reading.current_reading <= 0) return false;

					// For shared meter services, exclude readings from fixed tariffs
					if (selectedService.value?.has_shared_meter && reading.tariff_id) {
						const readingTariff = tariffs.value.find(t => t.id === reading.tariff_id);
						if (readingTariff?.calculation_method === 'fixed') {
							return false;
						}
					}

					return true;
				})
				.sort((a, b) => b.period.localeCompare(a.period));

			if (isMultiTariffService.value) {
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
			} else if (selectedService.value?.has_shared_meter) {
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
			
			if (isMultiTariffService.value) {
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
			console.log('DEBUG: saveReading function called!');
			formSubmitted.value = true;
			
			// Валідація для спільного лічільника (але не для служб з фіксованими сумами)
			if (selectedService.value?.has_shared_meter && (!readingForm.current_reading || readingForm.current_reading <= 0)) {
				if (myAlert.value) {
					myAlert.value.showAlert('danger', 'Введіть коректний поточний показник (більше 0)');
				}
				return;
			}

			// Валідація для служб з фіксованими сумами
			if (isFixedAmountService.value) {
				const hasValidAmounts = availableTariffs.value.some(tariff => 
					(tariffAmounts.value[tariff.id] || 0) > 0
				);
				if (!hasValidAmounts) {
					if (myAlert.value) {
						myAlert.value.showAlert('danger', 'Введіть суми для тарифів');
					}
					return;
				}
			}
			
			isSaving.value = true;
			
			console.log('DEBUG: Starting saveReading with:', {
				hasFixedPaymentTariff: hasFixedPaymentTariff.value,
				isMultiTariffService: isMultiTariffService.value,
				'selectedService?.has_shared_meter': selectedService.value?.has_shared_meter,
				isEditing: isEditing.value,
				current_reading: readingForm.current_reading,
				service_id: readingForm.service_id
			});
			
			try {
				// Валідація: перевіряємо, чи поточний показник не менший за попередній
				if (!hasFixedPaymentTariff.value && readingForm.previous_reading && 
					readingForm.current_reading < readingForm.previous_reading) {
					if (myAlert.value) {
						myAlert.value.showAlert('danger', 'Помилка: поточний показник не може бути меншим за попередній');
					}
					isSaving.value = false;
					return;
				}
				
				console.log('DEBUG: Checking conditions:');
				console.log('- selectedService?.has_shared_meter:', selectedService.value?.has_shared_meter);
				console.log('- isEditing:', isEditing.value);
				console.log('- hasFixedPaymentTariff:', hasFixedPaymentTariff.value);
				console.log('- isMultiTariffService:', isMultiTariffService.value);
				
				if (selectedService.value?.has_shared_meter && !isEditing.value) {
					// For services with shared meter - backend creates readings for all tariffs
					console.log('DEBUG: Saving shared meter service');
					
					const readingData: UtilityReadingCreate = {
						address_id: readingForm.address_id,
						service_id: readingForm.service_id,
						period: readingForm.period,
						current_reading: readingForm.current_reading,
						previous_reading: readingForm.previous_reading || undefined,
						tariff_id: availableTariffs.value[0]?.id, // Backend ignores this for shared meter
						reading_date: readingForm.reading_date || undefined,
						is_paid: readingForm.is_paid || undefined,
						notes: readingForm.notes || undefined
					};
					
					await createReadingMutation.mutateAsync({
						data: readingData
					});
				} else if (isFixedAmountService.value && !isEditing.value) {
					console.log('DEBUG: Saving fixed amount service (квартплата)');
					
					// Create separate readings for each tariff with respective amounts
					for (const tariff of availableTariffs.value) {
						const amount = tariffAmounts.value[tariff.id] || 0;
						
						if (amount > 0) {
							const readingData: UtilityReadingCreate = {
								address_id: readingForm.address_id,
								service_id: readingForm.service_id,
								period: readingForm.period,
								current_reading: amount,  // Store amount as current_reading for fixed tariffs
								previous_reading: 0,
								tariff_id: tariff.id,
								reading_date: readingForm.reading_date || undefined,
								is_paid: readingForm.is_paid || undefined,
								notes: readingForm.notes || undefined
							};
							
							await createReadingMutation.mutateAsync({
								data: readingData
							});
						}
					}
				} else if (hasFixedPaymentTariff.value && !selectedService.value?.has_shared_meter && !isEditing.value) {
					console.log('DEBUG: Going to FIXED PAYMENT block');
					// Для фіксованих платежів (квартплата, сміття) БЕЗ спільного лічільника
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
				} else if (isMultiTariffService.value && !isEditing.value) {
					console.log('DEBUG: Going to MULTI TARIFF block');
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
				} else if (isEditing.value && selectedService.value?.has_shared_meter) {
					// Update existing readings for shared meter with fixed amounts (квартплата з освітленням)
					console.log('DEBUG: Updating shared meter with fixed amounts reading');
					
					// Get all readings for this service and period from recentReadings
					// This data is already loaded when editing form is opened
					const allReadings = recentReadings.value.filter((r: any) => r.service_id === readingForm.service_id) as UtilityReadingResponse[];
					
					console.log('All readings to update:', allReadings);
					
					// Update each reading with new period, date, and amounts
					for (const reading of allReadings) {
						if (!reading.id || !reading.tariff) {
							console.log('Skipping reading without ID or tariff:', reading);
							continue;
						}
						
						const tariff = reading.tariff;
						let amount: number = 0;
						let previousReading: number = 0;
						
						if (tariff.calculation_method === 'standard') {
							// For standard tariffs, use meter readings
							amount = readingForm.current_reading;
							previousReading = readingForm.previous_reading || 0;
						} else if (tariff.calculation_method === 'fixed') {
							// For subscription tariffs, use tariff.rate automatically
							if (tariff.tariff_type === 'subscription') {
								amount = tariff.rate;
							} else {
								// For non-subscription fixed tariffs, use manually entered amount
								const amountFieldName = `tariff_${tariff.id}_amount` as keyof typeof readingForm;
								amount = readingForm[amountFieldName] as number || 0;
							}
							previousReading = 0;
						}
						
						const updateData: UtilityReadingUpdate = {
							period: readingForm.period,
							current_reading: amount,
							previous_reading: previousReading || undefined,
							tariff_id: tariff.id,
							reading_date: readingForm.reading_date || undefined,
							is_paid: readingForm.is_paid || undefined,
							notes: readingForm.notes || undefined
						};

						console.log(`Updating reading ${reading.id} for tariff ${tariff.name}:`, updateData);
						
						await updateReadingMutation.mutateAsync({
							readingId: reading.id,
							data: updateData
						});
					}
				} else if (isEditing.value && editReadingId.value) {
					// Update existing reading (standard)
					const updateData: UtilityReadingUpdate = {
						period: readingForm.period,
						current_reading: hasFixedPaymentTariff.value ? (readingForm.amount || 0) : readingForm.current_reading,
						previous_reading: hasFixedPaymentTariff.value ? 0 : (readingForm.previous_reading || undefined),
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
					console.log('DEBUG: Going to STANDARD block');
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

				// Показуємо успішне повідомлення
				if (myAlert.value) {
					myAlert.value.showAlert('success', isEditing.value ? 'Показник успішно оновлено!' : 'Показник успішно збережено!');
				}

				// Navigate back to reading list after short delay
				setTimeout(() => {
					router.push({ 
						name: 'utilities_readings', 
						params: { addressId: readingForm.address_id } 
					});
				}, 1500);
			} catch (error: any) {
				console.error('Помилка збереження показника:', error);
				
				// Показуємо помилку користувачу
				let errorMessage = 'Невідома помилка при збереженні показника';
				
				if (error?.response?.data?.detail) {
					if (typeof error.response.data.detail === 'string') {
						errorMessage = error.response.data.detail;
					} else if (Array.isArray(error.response.data.detail)) {
						errorMessage = error.response.data.detail.map((e: any) => e.msg || e.message || e).join(', ');
					}
				} else if (error?.response?.data?.message) {
					errorMessage = error.response.data.message;
				} else if (error?.message) {
					errorMessage = error.message;
				}
				
				if (myAlert.value) {
					myAlert.value.showAlert('danger', `Помилка збереження: ${errorMessage}`);
				}
			} finally {
				isSaving.value = false;
			}
		};
		
		// Get consumption for specific tariff
		const getTariffConsumption = (tariff: TariffData): number => {
			// For fixed tariffs in shared meter services, the "consumption" is actually the amount entered
			if (selectedService.value?.has_shared_meter && tariff.calculation_method === 'fixed') {
				const amountFieldName = `tariff_${tariff.id}_amount` as keyof typeof readingForm;
				const enteredValue = readingForm[amountFieldName] as number;
				if (enteredValue !== undefined && enteredValue !== null) {
					return enteredValue;
				}
			}
			
			// For standard tariffs, use actual consumption calculation
			return calculationData.consumption || (readingForm.current_reading - (readingForm.previous_reading || 0));
		};

		// Calculate amount for single tariff
		const calculateTariffAmount = (tariff: TariffData): number => {
			// For shared meter services, handle different calculation methods
			if (selectedService.value?.has_shared_meter) {
				if (tariff.calculation_method === 'fixed') {
					// Fixed tariffs use their rate directly
					return tariff.rate;
				} else {
					// Standard tariffs use consumption * rate
					return getTariffConsumption(tariff) * tariff.rate;
				}
			}
			
			// Fallback to global calculation
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
			if (!selectedService.value?.has_shared_meter) return calculationData.cost;
			
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

		// Load shared meter tariff amounts for editing
		const loadSharedMeterTariffAmounts = (serviceId: number, period: string) => {
			console.log('loadSharedMeterTariffAmounts called with:', { serviceId, period });
			sharedMeterLoadParams.value = { serviceId, period };
		};

		// Create a reactive ref for loading shared meter data
		const sharedMeterLoadParams = ref<{serviceId: number, period: string} | null>(null);
		
		// Query for loading shared meter tariff amounts
		const { data: sharedMeterData } = useGetGroupedReadingsEndpointApiUtilitiesGroupedReadingsGet(
			computed(() => ({
				address_id: readingForm.address_id,
				period: sharedMeterLoadParams.value?.period || '',
				service_id: sharedMeterLoadParams.value?.serviceId || 0
			})),
			{ query: { enabled: computed(() => !!sharedMeterLoadParams.value) } }
		);
		
		// Watch for shared meter data and populate form
		watch(sharedMeterData, (data) => {
			console.log('sharedMeterData watcher triggered:', data, 'params:', sharedMeterLoadParams.value);
			if (data?.data && sharedMeterLoadParams.value) {
				const groupedData = data.data;
				console.log('Grouped data received:', groupedData);
				
				// Find the service group or individual service
				let readings: any[] = [];
				if (groupedData.service_groups) {
					console.log('Checking service_groups:', groupedData.service_groups);
					const serviceGroup = groupedData.service_groups.find((g: any) => 
						g.readings.some((r: any) => r.service_id === sharedMeterLoadParams.value?.serviceId)
					);
					if (serviceGroup) {
						readings = serviceGroup.readings;
						console.log('Found service group readings:', readings);
					}
				}
				if (readings.length === 0 && groupedData.services) {
					console.log('Checking individual services:', groupedData.services);
					const service = groupedData.services.find((s: any) => s.service_id === sharedMeterLoadParams.value?.serviceId);
					if (service) {
						readings = service.readings;
						console.log('Found individual service readings:', readings);
					}
				}
				
				console.log('All readings found:', readings);
				
				// Populate tariff amounts in form
				readings.forEach((reading: any, index: number) => {
					console.log(`Processing reading ${index}:`, reading);
					console.log('Tariff object:', reading.tariff);
					
					// Get the actual tariff ID from the tariff object
					const tariffId = reading.tariff?.id;
					console.log(`Using tariff ID: ${tariffId}`);
					
					if (tariffId) {
						const fieldName = `tariff_${tariffId}_amount`;
						console.log(`Setting ${fieldName} = ${reading.amount}`);
						readingForm[fieldName] = reading.amount || 0;
					} else {
						console.log('No tariff ID found in reading.tariff:', reading.tariff);
					}
				});
				
				console.log('readingForm after population:', readingForm);
				
				// Reset the trigger
				sharedMeterLoadParams.value = null;
			}
		});

    const promptDeleteReading = () => {
      showDeleteConfirmModal.value = true;
    };

    const handleDeleteConfirm = async () => {
      if (!editReadingId.value) {
        return;
      }
      isDeleting.value = true;
      try {
        await deleteReadingMutation.mutateAsync({
          readingId: editReadingId.value
        });
        goBack();
      } catch (error) {
        console.error('Error deleting reading:', error);
        if (myAlert.value) {
          myAlert.value.showAlert('danger', 'Помилка при видаленні показника');
        }
      } finally {
        isDeleting.value = false;
      }
    };

		// Watchers
		watch([() => readingForm.current_reading, () => readingForm.previous_reading], 
			calculateConsumption
		);
		
		// Debug watcher for current_reading
		watch(() => readingForm.current_reading, (newVal, oldVal) => {
			console.log('DEBUG: current_reading changed from', oldVal, 'to', newVal);
		});

		// Watch tariff changes
		watch(() => readingForm.tariff_id, () => {
			if (!isEditing.value && readingForm.service_id && !selectedService.value?.has_shared_meter) {
				findLastReading();
			}
			
			// Для фіксованих тарифів автоматично заповнюємо суму
			// Але тільки для не-subscription тарифів, оскільки subscription автоматично заповнюються
			if (selectedTariff.value?.calculation_method === 'fixed' && 
				selectedTariff.value?.tariff_type !== 'subscription' && !isEditing.value) {
				readingForm.amount = selectedTariff.value.rate;
			}
			
			calculateConsumption();
		});


		// Watch for service changes to initialize tariff amounts
		watch(() => readingForm.service_id, (newServiceId) => {
			if (newServiceId && isFixedAmountService.value) {
				// Initialize tariff amounts for fixed amount services
				availableTariffs.value.forEach(tariff => {
					if (tariff.tariff_type === 'subscription') {
						// Auto-fill subscription fees from tariff rate
						tariffAmounts.value[tariff.id] = tariff.rate;
					} else {
						// Initialize empty for manual input
						tariffAmounts.value[tariff.id] = 0;
					}
				});
			}
		});

		// Watch multiReadingForm for electricity calculations
		watch(() => multiReadingForm, () => {
			if (isMultiTariffService.value) {
				calculateTotalCost();
			}
		}, { deep: true });

		// Watch for tariff changes in multiReadingForm
		watch(() => groupedTariffs.value, () => {
			if (isMultiTariffService.value) {
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
				readingForm.current_reading = reading.current_reading !== null && reading.current_reading !== undefined ? reading.current_reading : 0;
				readingForm.previous_reading = reading.previous_reading !== null && reading.previous_reading !== undefined ? reading.previous_reading : 0;
				readingForm.tariff_id = reading.tariff_id || 0;
				readingForm.reading_date = reading.reading_date ? reading.reading_date.slice(0, 10) : new Date().toISOString().slice(0, 10);
				readingForm.is_paid = reading.is_paid || false;
				readingForm.notes = reading.notes || '';
				
				// For fixed payment services, amount field should be filled
				if (reading.service && hasFixedPaymentTariff.value) {
					readingForm.amount = reading.current_reading || 0;
				}
				
				// For shared meter services with fixed amounts, load amounts for all tariffs
				if (reading.service && reading.service.has_shared_meter) {
					console.log('Loading shared meter tariff amounts for service:', reading.service_id, 'period:', reading.period);
					// Load all readings for this service and period to populate tariff amounts
					loadSharedMeterTariffAmounts(reading.service_id, reading.period);
				}
				
				// Перевірка, чи це мульти-тарифна служба або служба з multiple readings
				if (reading.reading_type && (isMultiTariffService.value || reading.service?.service_group === 'electricity')) {
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
						multiReadingForm[readingType].current_reading = reading.current_reading !== null && reading.current_reading !== undefined ? reading.current_reading : 0;
						multiReadingForm[readingType].previous_reading = reading.previous_reading !== null && reading.previous_reading !== undefined ? reading.previous_reading : 0;
						multiReadingForm[readingType].consumption = reading.consumption || 0;
						multiReadingForm[readingType].tariff_id = reading.tariff_id || 0;
					}
					
					// Recalculate after loading data
					setTimeout(() => {
						if (isMultiTariffService.value) {
							calculateTotalCost();
						} else if (selectedService.value?.has_shared_meter) {
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

		// Breadcrumb
		const breadcrumbHome = { icon: 'pi pi-home', route: { name: 'utilities' } };
		const breadcrumbItems = computed(() => [
			{ label: 'Комунальні', route: { name: 'utilities' } },
			{ label: 'Адреси', route: { name: 'utilities_addresses' } },
			{ label: isEditing.value ? 'Редагувати показники' : 'Додати показники' }
		]);

		return {
			// Data
			readingForm,
			multiReadingForm,
			calculationData,
			tariffAmounts,
			isSaving,
			isDeleting,
			myAlert,
			isEditing,
			editReadingId,
			lastReadingHint,
			formSubmitted,
      showDeleteConfirmModal,
			addresses,
			filteredServices,
			selectedService,
			availableTariffs,
			selectedTariff,
			recentReadings,
			hasFixedPaymentTariff,
			isMultiTariffService,
			isFixedAmountService,
			groupedTariffs,
			hasSharedMeterWithFixedAmounts,
			breadcrumbHome,
			breadcrumbItems,

			// Methods
			getDefaultPeriod,
			formatRate,
			formatCurrency,
			formatPeriod,
			getServiceName,
			getTariffTypeLabel,
			getMultiReadingValue,
			getTariffConsumption,
			setMultiReadingValue,
			requiresManualInput,
			onAddressChange,
			onServiceChange,
			findLastReading,
			calculateConsumption,
			calculateMultiConsumption,
			calculateTotalCost,
			calculateTariffAmount,
			calculateTotalAmount,
			saveReading,
			promptDeleteReading,
      handleDeleteConfirm,
			goBack,
			loadSharedMeterTariffAmounts
		};
	}
});
</script>

<style scoped>
.bg-light {
	background-color: var(--surface-100);
}
</style>