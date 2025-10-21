<template>
	<div class="grouped-readings">
		<div v-if="loading" class="text-center p-4">
			<ProgressSpinner />
		</div>
		<Message v-else-if="error" severity="error" :closable="false">
			<i class="pi pi-exclamation-triangle mr-2"></i>
			Помилка при завантаженні даних: {{ error.message }}
			<pre v-if="error.response?.data">{{ JSON.stringify(error.response.data, null, 2) }}</pre>
		</Message>
		<Message v-else-if="groupedData && (!groupedData.service_groups || groupedData.service_groups.length === 0) && (!groupedData.services || groupedData.services.length === 0)" severity="warn" :closable="false">
			<i class="pi pi-exclamation-triangle mr-2"></i>
			Немає показників за обраний період ({{ period }}).
			<br>
			<small class="text-muted">Останні показники доступні за {{ formatPeriod(groupedData.period) }}</small>
		</Message>
		<div v-else-if="groupedData">
			<!-- Загальна сума (показуємо вгорі) -->
			<Card class="mb-3 total-summary-card">
				<template #content>
					<div class="flex justify-content-between align-items-center">
						<div class="total-label">Загальна сума за період:</div>
						<div class="total-amount">{{ formatCurrency(totalAmount) }}</div>
					</div>
				</template>
			</Card>
			
			<!-- Групи служб (електрика, вода) -->
			<div v-if="filteredGroupedData.service_groups && filteredGroupedData.service_groups.length > 0">
				<Card v-for="group in filteredGroupedData.service_groups" :key="group.group_name" class="mb-4 mobile-compact-card">
					<template #title>
						<div class="title-main">
							<i class="pi pi-th-large"></i>
							<span>{{ getGroupTitle(group.group_name) }}</span>
							<!-- Показники в заголовку для спільного лічильника -->
							<span v-if="group?.has_shared_meter && group.readings.length > 0" class="title-meter-display">
								{{ getSharedMeterReading(group) }}<span v-if="getSharedMeterPreviousReading(group)"> - {{ getSharedMeterPreviousReading(group) }} = <strong>{{ typeof getSharedMeterReading(group) === 'number' ? (getSharedMeterReading(group) - (getSharedMeterPreviousReading(group) || 0)) : 0 }}</strong></span>
							</span>
						</div>
					</template>
					<template #content>
					<!-- Деталізація за службами/тарифами -->
					<div class="table-responsive desktop-view">
						<table class="table table-sm readings-table">
							<thead>
								<tr>
									<th>Тариф</th>
									<th v-if="!group?.has_shared_meter" class="text-right">Показник</th>
									<th class="text-right">Ціна</th>
									<th class="text-right">Сума</th>
									<th class="text-center" style="width: 50px;">Дії</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="reading in group.readings as ExtendedGroupedReadingItem[]" :key="reading.id">
									<td class="tariff-name">
										{{ reading.tariff_name || reading.service_name }}
									</td>
									<td v-if="!group?.has_shared_meter" class="text-right">
										<span v-if="reading.tariff_type === 'subscription' || reading.tariff?.calculation_method === 'fixed'">
											-
										</span>
										<span v-else class="meter-inline">
											<span class="current-reading">{{ reading.current_reading }}</span>
											<span v-if="reading.previous_reading" class="reading-diff">
												- {{ reading.previous_reading }} = <strong>{{ reading.consumption || 0 }}</strong>
											</span>
										</span>
									</td>
									<td class="text-right">
										<span v-if="reading.tariff_type === 'subscription'" class="subscription-label">
											Абонплата
										</span>
										<span v-else-if="reading.tariff" class="tariff-rate">
											{{ formatRate(reading.tariff.rate) }} грн/{{ getServiceUnit(reading.service_id) }}
										</span>
									</td>
									<td class="text-right amount-cell">{{ formatCurrency(reading.amount) }}</td>
									<td class="text-center">
										<Button
											v-if="!group?.has_shared_meter || (group?.readings && group.readings.indexOf(reading) === 0)"
											icon="pi pi-pencil"
											@click="editReading(reading.id)"
											title="Редагувати"
											outlined
											size="small"
										/>
									</td>
								</tr>
								<tr class="total-row">
									<td :colspan="group?.has_shared_meter ? 2 : 3" class="text-right total-label">Загальна сума:</td>
									<td class="text-right total-value">{{ formatCurrency(group.total_amount) }}</td>
									<td></td>
								</tr>
							</tbody>
						</table>
					</div>

					<!-- Мобільна версія - компактний список -->
					<div class="mobile-view">
						<!-- Компактний список тарифів -->
						<div class="mobile-tariff-list">
							<div v-for="reading in group.readings as ExtendedGroupedReadingItem[]" :key="reading.id" class="mobile-tariff-item">
								<div class="tariff-header">
									<div class="tariff-info">
										<!-- Назва тарифу з ціною -->
										<div class="tariff-name">
											{{ reading.tariff_name || reading.service_name }}
											<span v-if="reading.tariff && reading.tariff_type !== 'subscription'" class="price-inline">
												• {{ formatRate(reading.tariff.rate) }} грн/{{ getServiceUnit(reading.service_id) }}
											</span>
										</div>
										<!-- Показники ТІЛЬКИ для standard тарифів БЕЗ спільного лічильника -->
										<div v-if="!group?.has_shared_meter && group.readings.length > 1 && reading.tariff?.calculation_method === 'standard' && reading.current_reading" class="tariff-subtitle meter-readings">
											{{ reading.current_reading }}<span v-if="reading.previous_reading"> - {{ reading.previous_reading }} = <strong>{{ reading.consumption || 0 }}</strong></span>
										</div>
										<!-- Для абонплати -->
										<div v-else-if="reading.tariff_type === 'subscription'" class="tariff-subtitle">Абонплата</div>
										<!-- Для фіксованих та manual -->
										<div v-else-if="reading.tariff?.calculation_method === 'fixed'" class="tariff-subtitle">Фіксована сума</div>
									</div>
									<div class="tariff-amount">{{ formatCurrency(reading.amount) }}</div>
									<!-- Кнопка редагування: для спільного лічильника тільки на першому елементі -->
									<Button
										v-if="!group?.has_shared_meter || (group?.readings && group.readings.indexOf(reading) === 0)"
										icon="pi pi-pencil"
										@click="editReading(reading.id)"
										title="Редагувати"
										text
										size="small"
										class="edit-btn-mobile"
									/>
								</div>
							</div>
						</div>

						<!-- Підсумок для групи на мобільному -->
						<div class="mobile-group-total">
							<span>Загальна сума по групі:</span>
							<strong>{{ formatCurrency(group.total_amount) }}</strong>
						</div>
					</div>
				</template>
				</Card>
			</div>
			
			<!-- Окремі служби без груп -->
			<Card v-for="service in filteredGroupedData.services" :key="service.service_id" class="mb-4 mobile-compact-card">
				<template #title>
					<div class="title-main">
						<i class="pi pi-gauge"></i>
						<span>{{ service.service_name }}</span>
						<!-- Показники в заголовку якщо 1 тариф -->
						<span v-if="service.readings.length === 1 && service.readings[0].current_reading && service.readings[0].tariff_type !== 'subscription'" class="title-meter-display">
							{{ service.readings[0].current_reading }}<span v-if="service.readings[0].previous_reading"> - {{ service.readings[0].previous_reading }} = <strong>{{ service.readings[0].consumption || 0 }}</strong></span>
						</span>
					</div>
				</template>
				<template #content>
					<!-- Десктопна версія таблиці -->
					<div class="table-responsive desktop-view">
						<table class="table table-sm readings-table">
							<thead>
								<tr>
									<th>Тариф</th>
									<th class="text-right">Показник</th>
									<th class="text-right">Споживання</th>
									<th class="text-right">Ціна</th>
									<th class="text-right">Сума</th>
									<th class="text-center" style="width: 50px;">Дії</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="reading in service.readings as ExtendedGroupedReadingItem[]" :key="reading.id">
									<td class="tariff-name">{{ reading.tariff_name || 'Без тарифу' }}</td>
									<td class="text-right">
										<span v-if="reading.tariff_type === 'subscription' || reading.tariff?.calculation_method === 'fixed'">
											-
										</span>
										<span v-else class="meter-inline">
											<span class="current-reading">{{ reading.current_reading }}</span>
											<span v-if="reading.previous_reading" class="reading-diff">
												- {{ reading.previous_reading }} = <strong>{{ reading.consumption || 0 }}</strong>
											</span>
										</span>
									</td>
									<td class="text-right">
										<span v-if="reading.tariff_type === 'subscription' || reading.tariff?.calculation_method === 'fixed'">-</span>
										<span v-else class="consumption-value">{{ reading.consumption || 0 }}</span>
									</td>
									<td class="text-right">
										<span v-if="reading.tariff_type === 'subscription'" class="subscription-label">
											Абонплата
										</span>
										<span v-else-if="reading.tariff?.calculation_method === 'fixed'" class="subscription-label">
											Фіксована сума
										</span>
										<span v-else-if="reading.tariff" class="tariff-rate">
											{{ formatRate(reading.tariff.rate) }} грн/{{ getServiceUnit(reading.service_id) }}
										</span>
									</td>
									<td class="text-right amount-cell">{{ formatCurrency(reading.amount) }}</td>
									<td class="text-center">
										<Button
											icon="pi pi-pencil"
											@click="editReading(reading.id)"
											title="Редагувати"
											outlined
											size="small"
										/>
									</td>
								</tr>
								<tr class="total-row">
									<td colspan="5" class="text-right total-label">Загальна сума:</td>
									<td class="text-right total-value">{{ formatCurrency(service.total_amount) }}</td>
									<td></td>
								</tr>
							</tbody>
						</table>
					</div>

					<!-- Мобільна версія - компактний список -->
					<div class="mobile-view">
						<!-- Компактний список тарифів -->
						<div class="mobile-tariff-list">
							<div v-for="reading in service.readings as ExtendedGroupedReadingItem[]" :key="reading.id" class="mobile-tariff-item">
								<div class="tariff-header">
									<div class="tariff-info">
										<!-- Назва тарифу з ціною -->
										<div class="tariff-name">
											{{ reading.tariff_name || 'Без тарифу' }}
											<span v-if="reading.tariff && reading.tariff_type !== 'subscription'" class="price-inline">
												• {{ formatRate(reading.tariff.rate) }} грн/{{ service.unit }}
											</span>
										</div>
										<!-- Показники ТІЛЬКИ для standard тарифів (якщо >1 тарифу) -->
										<div v-if="service.readings.length > 1 && reading.tariff?.calculation_method === 'standard' && reading.current_reading" class="tariff-subtitle meter-readings">
											{{ reading.current_reading }}<span v-if="reading.previous_reading"> - {{ reading.previous_reading }} = <strong>{{ reading.consumption || 0 }}</strong></span>
										</div>
										<!-- Для абонплати -->
										<div v-else-if="reading.tariff_type === 'subscription'" class="tariff-subtitle">Абонплата</div>
										<!-- Для фіксованих та manual -->
										<div v-else-if="reading.tariff?.calculation_method === 'fixed'" class="tariff-subtitle">Фіксована сума</div>
									</div>
									<div class="tariff-amount">{{ formatCurrency(reading.amount) }}</div>
									<Button
										icon="pi pi-pencil"
										@click="editReading(reading.id)"
										title="Редагувати"
										text
										size="small"
										class="edit-btn-mobile"
									/>
								</div>
							</div>
						</div>

						<!-- Підсумок для служби на мобільному -->
						<div class="mobile-group-total">
							<span>Всього:</span>
							<strong>{{ formatCurrency(service.total_amount) }}</strong>
						</div>
					</div>
				</template>
				</Card>
			</div>
		<Message v-else severity="info" :closable="false">
			<i class="pi pi-info-circle mr-2"></i>
			Немає даних для відображення за вибраний період.
		</Message>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, toRefs, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useGetGroupedReadingsEndpointApiUtilitiesGroupedReadingsGet } from '@/api/utilities/utilities';
import type { GroupedReadingsResponse } from '@/api/model/groupedReadingsResponse';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Card from 'primevue/card';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import Divider from 'primevue/divider';

// Розширюємо тип для включення service_id
interface ExtendedGroupedReadingItem {
	id?: number;
	service_id?: number;
	service_name: string;
	tariff_name?: string;
	tariff_type?: string;
	current_reading: number;
	previous_reading?: number;
	consumption?: number;
	amount?: number;
	tariff?: { rate: number };
	is_paid?: boolean;
	period?: string;
	reading_date?: string;
}

export default defineComponent({
	name: 'GroupedReadings',
	components: {
		Button,
		ProgressSpinner,
		Card,
		Message,
		Tag,
		Divider
	},
	props: {
		addressId: {
			type: Number,
			required: true
		},
		period: {
			type: String,
			required: true
		},
		serviceFilter: {
			type: String,
			default: ''
		}
	},
	setup(props) {
		const router = useRouter();
		const { addressId, period, serviceFilter } = toRefs(props);
		
		// Use current period if not provided
		const effectivePeriod = computed(() => period.value || new Date().toISOString().slice(0, 7));
		// Fetch grouped readings
		const { data: groupedDataResponse, isLoading: loading, error } = useGetGroupedReadingsEndpointApiUtilitiesGroupedReadingsGet(
			computed(() => {
				const params: any = {
					address_id: addressId.value,
					period: effectivePeriod.value
				};
				if (serviceFilter.value) {
					params.service_id = parseInt(serviceFilter.value);
				}
				return params;
			}),
			{
				query: {
					enabled: computed(() => !!addressId.value),
					refetchOnMount: true,
					staleTime: 0
				}
			}
		);
		
		const groupedData = computed(() => groupedDataResponse.value?.data as GroupedReadingsResponse | undefined);
		
		// Backend already filters data, use it directly
		const filteredGroupedData = computed(() => groupedData.value);
		
		// Watch for errors
		watchEffect(() => {
			if (error.value) {
				console.error('Error fetching grouped readings:', error.value);
			}
		});
		
		// Calculate total amount
		const totalAmount = computed(() => {
			if (!filteredGroupedData.value) return 0;
			
			let total = 0;
			// Сума по групах
			filteredGroupedData.value.service_groups.forEach(group => {
				total += group.total_amount;
			});
			// Сума по окремих службах
			filteredGroupedData.value.services.forEach(service => {
				total += service.total_amount;
			});
			
			return total;
		});
		
		// Format currency
		const formatCurrency = (amount: number): string => {
			return new Intl.NumberFormat('uk-UA', {
				style: 'currency',
				currency: 'UAH'
			}).format(amount);
		};
		
		// Format rate
		const formatRate = (rate: number): string => {
			return new Intl.NumberFormat('uk-UA', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 4
			}).format(rate);
		};
		
		
		// Get group title
		const getGroupTitle = (groupName: string): string => {
			const titles: Record<string, string> = {
				'water': 'Вода',
				'electricity': 'Електроенергія',
				'gas': 'Газ',
				'heating': 'Опалення'
			};
			return titles[groupName] || groupName;
		};
		
		// Edit reading
		const editReading = (readingId: number | undefined) => {
			if (!readingId) return;
			router.push({
				name: 'utilities_add_reading',
				query: { 
					addressId: props.addressId,
					editReadingId: readingId
				}
			});
		};
		
		// Get service unit
		const getServiceUnit = (serviceId?: number): string => {
			if (!serviceId || !filteredGroupedData.value) return '';
			
			// Знаходимо показник по service_id
			let reading: ExtendedGroupedReadingItem | undefined;
			
			// Шукаємо в групах
			for (const group of filteredGroupedData.value.service_groups) {
				reading = (group.readings as ExtendedGroupedReadingItem[])
					.find(r => r.service_id === serviceId);
				if (reading) break;
			}
			
			// Якщо не знайшли в групах, шукаємо в окремих службах
			if (!reading) {
				for (const service of filteredGroupedData.value.services) {
					reading = (service.readings as ExtendedGroupedReadingItem[])
						.find(r => r.service_id === serviceId);
					if (reading) break;
				}
			}
			
			if (reading?.service_name?.includes('Вода')) return 'м³';
			if (reading?.service_name?.includes('Газ')) return 'м³';
			if (reading?.service_name?.includes('Електрика')) return 'кВт·год';
			return '';
		};
		
		// Format period
		const formatPeriod = (period: string): string => {
			if (!period) return '';
			const [year, month] = period.split('-');
			const date = new Date(parseInt(year), parseInt(month) - 1);
			return date.toLocaleDateString('uk-UA', { year: 'numeric', month: 'long' });
		};
		
		// Get shared meter reading (not subscription)
		const getSharedMeterReading = (group: any): number | string => {
			if (!group.readings || group.readings.length === 0) {
				return 'Немає даних';
			}
			
			// Знаходимо показник що не є абонплатою та має валідний current_reading
			const meterReading = group.readings.find((r: any) => 
				r.current_reading !== null && 
				r.current_reading !== undefined && 
				!isNaN(r.current_reading) && 
				r.tariff_type !== 'subscription'
			);
			
			if (meterReading && meterReading.current_reading !== null) {
				return Number(meterReading.current_reading);
			}
			
			// Fallback: шукаємо будь-який показник з валідним current_reading
			const anyReading = group.readings.find((r: any) => 
				r.current_reading !== null && 
				r.current_reading !== undefined && 
				!isNaN(r.current_reading)
			);
			
			return anyReading ? Number(anyReading.current_reading) : 'Немає даних';
		};
		
		// Get shared meter previous reading
		const getSharedMeterPreviousReading = (group: any): number | null => {
			if (!group.readings || group.readings.length === 0) return null;
			
			// Знаходимо показник що не є абонплатою та має валідний current_reading
			const meterReading = group.readings.find((r: any) => 
				r.current_reading !== null && 
				r.current_reading !== undefined && 
				!isNaN(r.current_reading) && 
				r.tariff_type !== 'subscription'
			);
			
			if (meterReading && meterReading.previous_reading !== null && meterReading.previous_reading !== undefined) {
				return Number(meterReading.previous_reading);
			}
			
			// Fallback: шукаємо будь-який показник з валідним previous_reading
			const anyReading = group.readings.find((r: any) => 
				r.previous_reading !== null && 
				r.previous_reading !== undefined && 
				!isNaN(r.previous_reading)
			);
			
			return anyReading ? Number(anyReading.previous_reading) : null;
		};
		
		return {
			loading,
			error,
			groupedData,
			filteredGroupedData,
			totalAmount,
			formatCurrency,
			formatRate,
			getGroupTitle,
			editReading,
			getServiceUnit,
			formatPeriod,
			getSharedMeterReading,
			getSharedMeterPreviousReading
		};
	}
});
</script>

<style scoped>
.grouped-readings {
	margin-top: 1rem;
}

/* Total summary card */
.total-summary-card {
	margin-bottom: 0.75rem;
}

.total-summary-card :deep(.p-card-content) {
	padding: 0.75rem;
}

.total-label {
	font-size: 0.95rem;
	font-weight: 600;
	color: #2c3e50;
}

.total-amount {
	font-size: 1.5rem;
	font-weight: 700;
	color: var(--primary-color);
}

/* Meter display in card title (for shared meters only) */
.meter-display {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.95rem;
	color: #495057;
}

.meter-display .current-reading {
	font-size: 1.5rem;
	font-weight: 700;
	color: var(--primary-color);
}

.meter-display .reading-diff {
	display: flex;
	align-items: center;
	gap: 0.25rem;
	font-size: 0.9rem;
	color: #6c757d;
}

.meter-display .reading-diff strong {
	font-size: 1.125rem;
	color: #2c3e50;
}

/* Meter display inline in table (for non-shared meters) */
.meter-inline {
	display: inline-flex;
	align-items: center;
	gap: 0.375rem;
	white-space: nowrap;
}

.meter-inline .current-reading {
	font-size: 1.125rem;
	font-weight: 700;
	color: var(--primary-color);
}

.meter-inline .reading-diff {
	font-size: 0.875rem;
	color: #6c757d;
}

.meter-inline .reading-diff strong {
	font-size: 1rem;
	color: #2c3e50;
}

/* Readings table */
.readings-table {
	margin-bottom: 0;
}

.readings-table td,
.readings-table th {
	padding: 0.375rem 0.5rem;
	vertical-align: middle;
	white-space: nowrap;
}

.readings-table thead th {
	padding-top: 0.25rem;
	padding-bottom: 0.375rem;
	font-weight: 600;
	color: #2c3e50;
	background-color: #f8f9fa;
	border-bottom: 2px solid #dee2e6;
}

.tariff-name {
	font-weight: 500;
	color: #2c3e50;
}

.consumption-value {
	font-weight: 600;
}

.tariff-rate {
	font-size: 0.9rem;
	color: #495057;
}

.subscription-label {
	font-size: 0.875rem;
	color: #6c757d;
	font-style: italic;
}

.amount-cell {
	font-weight: 600;
	color: #2c3e50;
}

/* Total row */
.total-row {
	border-top: 2px solid #dee2e6;
}

.total-row .total-label {
	font-weight: 600;
	color: #2c3e50;
	padding-top: 0.75rem;
	padding-bottom: 0.75rem;
}

.total-row .total-value {
	font-size: 1.125rem;
	font-weight: 700;
	color: var(--primary-color);
	padding-top: 0.75rem;
	padding-bottom: 0.75rem;
}

/* Responsive visibility */
.desktop-view {
	display: block;
}

.mobile-view {
	display: none;
}

/* Mobile title */
.title-main {
	display: flex;
	align-items: baseline;
	gap: 0.5rem;
	font-size: 1rem;
	flex-wrap: wrap;
}

.title-meter-display {
	font-size: 0.8rem;
	color: #495057;
	font-weight: 600;
}

.title-meter-display strong {
	font-size: 0.9rem;
	color: #2c3e50;
	font-weight: 700;
}

/* Mobile compact list styles */
.mobile-tariff-list {
	background: #f8f9fa;
	border-radius: 8px;
	overflow: hidden;
}

.mobile-tariff-item {
	padding: 0.375rem 0.5rem;
	border-bottom: 1px solid #e9ecef;
	background: white;
}

.mobile-tariff-item:last-child {
	border-bottom: none;
}

.tariff-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.375rem;
}

.tariff-info {
	flex: 1;
	min-width: 0;
}

.tariff-name {
	font-weight: 600;
	font-size: 0.875rem;
	color: #2c3e50;
	line-height: 1.3;
}

.tariff-name .price-inline {
	font-size: 0.75rem;
	color: #6c757d;
	font-weight: 400;
	margin-left: 0.25rem;
}

.tariff-subtitle {
	font-size: 0.7rem;
	color: #6c757d;
	line-height: 1.2;
	margin-top: 0.125rem;
}

.tariff-subtitle.meter-readings {
	font-size: 0.75rem;
	font-weight: 600;
	color: #495057;
}

.tariff-subtitle.meter-readings strong {
	font-weight: 700;
	color: #2c3e50;
}

.tariff-amount {
	font-weight: 700;
	font-size: 0.95rem;
	color: var(--primary-color);
	white-space: nowrap;
}

.tariff-details {
	font-size: 0.7rem;
	color: #6c757d;
	margin-top: 0.25rem;
	padding-top: 0.25rem;
	border-top: 1px dashed #dee2e6;
	line-height: 1.3;
	padding-left: 0; /* Вирівнювання по назві служби */
}

.tariff-details .meter-info {
	display: flex;
	align-items: center;
	gap: 0.375rem;
	margin-bottom: 0.125rem;
	font-size: 0.8rem;
}

.tariff-details .meter-info .current-reading {
	font-size: 1rem;
	font-weight: 700;
	color: var(--primary-color);
}

.tariff-details .meter-info .reading-diff {
	color: #6c757d;
	font-size: 0.75rem;
}

.tariff-details .meter-info .reading-diff strong {
	font-size: 0.85rem;
	color: #2c3e50;
}

.tariff-details .consumption-info {
	font-size: 0.7rem;
	color: #6c757d;
}

.mobile-group-total {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.75rem 1rem;
	margin-top: 0.5rem;
	background: #e8f5e9;
	border-radius: 6px;
	font-size: 0.95rem;
	color: #2c3e50;
}

.mobile-group-total strong {
	font-size: 1.125rem;
	color: #2e7d32;
}

.edit-btn-mobile {
	padding: 0.25rem;
	min-width: auto;
}

@media (max-width: 768px) {
	/* Hide desktop table on mobile */
	.desktop-view {
		display: none;
	}

	/* Show mobile cards on mobile */
	.mobile-view {
		display: block;
	}

	.grouped-readings {
		margin-top: 0.5rem;
	}

	/* Мінімальні відступи в картках на мобільному */
	.mobile-compact-card {
		margin-bottom: 0.75rem;
	}

	.mobile-compact-card :deep(.p-card-content) {
		padding: 0.5rem;
	}

	.mobile-compact-card :deep(.p-card-title) {
		padding: 0.5rem;
		font-size: 0.9rem;
	}

	/* Компактніша загальна сума */
	.total-summary-card {
		margin-bottom: 0.5rem;
	}

	.total-summary-card :deep(.p-card-content) {
		padding: 0.5rem;
	}

	.total-label {
		font-size: 0.8rem;
	}

	.total-amount {
		font-size: 1.125rem;
	}
}
</style>
