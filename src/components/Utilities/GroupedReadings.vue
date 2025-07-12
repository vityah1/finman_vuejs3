<template>
	<div class="grouped-readings">
		<div v-if="loading" class="text-center p-4">
			<div class="spinner-border text-primary" role="status">
				<span class="visually-hidden">Завантаження...</span>
			</div>
		</div>
		<div v-else-if="error" class="alert alert-danger">
			<i class="fas fa-exclamation-triangle me-2"></i>
			Помилка при завантаженні даних: {{ error.message }}
			<pre v-if="error.response?.data">{{ JSON.stringify(error.response.data, null, 2) }}</pre>
		</div>
		<div v-else-if="groupedData && (!groupedData.service_groups || groupedData.service_groups.length === 0) && (!groupedData.services || groupedData.services.length === 0)" class="alert alert-warning">
			<i class="fas fa-exclamation-triangle me-2"></i>
			Немає показників за обраний період ({{ period }}).
			<br>
			<small class="text-muted">Останні показники доступні за {{ formatPeriod(groupedData.period) }}</small>
		</div>
		<div v-else-if="groupedData">
			<!-- Загальна сума (показуємо вгорі) -->
			<div class="card mb-4">
				<div class="card-body">
					<!-- Десктопна версія -->
					<div class="d-flex justify-content-between align-items-center d-none d-md-flex">
						<h5 class="mb-0">Загальна сума за період {{ groupedData.period }}:</h5>
						<h4 class="mb-0 text-primary">{{ formatCurrency(totalAmount) }}</h4>
					</div>
					
					<!-- Мобільна версія - компактно -->
					<div class="text-center d-md-none">
						<div class="text-muted small">{{ groupedData.period }}</div>
						<h4 class="mb-0 text-primary">{{ formatCurrency(totalAmount) }}</h4>
					</div>
				</div>
			</div>
			
			<!-- Групи служб (електрика, вода) -->
			<div v-if="groupedData.service_groups && groupedData.service_groups.length > 0">
				<div v-for="group in groupedData.service_groups" :key="group.group_name" class="card mb-4">
				<div class="card-header">
					<h5 class="mb-0">
						<i class="fas fa-layer-group me-2"></i>
						{{ getGroupTitle(group.group_name) }}
						<span v-if="group?.has_shared_meter" class="badge bg-info ms-2">
							<i class="fas fa-link me-1"></i>Спільний показник
						</span>
					</h5>
				</div>
				<div class="card-body">
					<!-- Спільний показник для групи (показуємо один раз) -->
					<div v-if="group?.has_shared_meter && group.readings.length > 0" class="alert alert-info mb-3">
						<!-- Десктопна версія -->
						<div class="d-none d-md-block">
							<div class="d-flex justify-content-between align-items-center">
								<div>
									<strong><i class="fas fa-tachometer-alt me-2"></i>Спільний показник лічильника:</strong> 
									<span class="h5 ms-2">{{ getSharedMeterReading(group) }}</span>
									<span v-if="getSharedMeterPreviousReading(group)" class="text-muted ms-2">
										(попередній: {{ getSharedMeterPreviousReading(group) }})
									</span>
								</div>
								<div class="text-end">
									<small class="text-muted">Споживання:</small><br>
									<strong>{{ 
										typeof getSharedMeterReading(group) === 'number' 
											? (getSharedMeterReading(group) - (getSharedMeterPreviousReading(group) || 0)) 
											: 'Немає даних' 
									}}</strong>
								</div>
							</div>
							<hr class="my-2">
							<small class="text-muted">
								<i class="fas fa-info-circle me-1"></i>
								Один показник використовується для розрахунку всіх тарифів цієї групи
							</small>
						</div>
						
						<!-- Мобільна версія - компактна -->
						<div class="d-md-none text-center">
							<div class="mb-2">
								<i class="fas fa-tachometer-alt me-2"></i>
								<strong>Показник: {{ getSharedMeterReading(group) }}</strong>
								<span v-if="getSharedMeterPreviousReading(group)" class="text-muted ms-2">
									(було: {{ getSharedMeterPreviousReading(group) }})
								</span>
							</div>
							<small class="text-muted">
								Споживання: <strong>{{ 
									typeof getSharedMeterReading(group) === 'number' 
										? (getSharedMeterReading(group) - (getSharedMeterPreviousReading(group) || 0)) 
										: 'Немає даних' 
								}}</strong>
							</small>
						</div>
					</div>
					<!-- Деталізація за службами/тарифами -->
					<!-- Десктопна версія -->
					<div class="table-responsive mb-3 d-none d-md-block">
						<table class="table table-sm">
							<thead>
								<tr>
									<th>Служба/Тариф</th>
									<th class="text-end">Показник</th>
									<th class="text-end">Споживання</th>
									<th class="text-end">Тариф</th>
									<th class="text-end">Сума</th>
									<th class="text-center" style="width: 50px;">Дії</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="reading in group.readings as ExtendedGroupedReadingItem[]" :key="reading.id">
									<td>
										{{ reading.service_name }}
										<span v-if="reading.tariff_name" class="text-muted">
											<br><small>{{ reading.tariff_name }}</small>
										</span>
										<span v-if="reading.tariff_type === 'consumption' && reading.service_name.includes('Газ')" 
											  class="badge bg-info ms-2" 
											  :title="`Тариф діє з 01.02.2025`">
											<i class="fas fa-info-circle"></i>
										</span>
									</td>
									<td class="text-end">
										<span v-if="!group?.has_shared_meter">
											{{ reading.current_reading }}
											<span class="text-muted small d-block" v-if="reading.previous_reading">
												(попер. {{ reading.previous_reading }})
											</span>
										</span>
										<span v-else class="text-muted">
											<small>Спільний показник</small>
										</span>
									</td>
									<td class="text-end">
										<span v-if="reading.tariff_type === 'subscription'">-</span>
										<span v-else>{{ reading.consumption || 0 }}</span>
									</td>
									<td class="text-end">
										<span v-if="reading.tariff_type === 'subscription'">
											Абонплата
										</span>
										<span v-else-if="reading.tariff">
											{{ formatRate(reading.tariff.rate) }}
											<span class="text-muted small d-block" v-if="reading.tariff_type === 'consumption'">
												грн/{{ getServiceUnit(reading.service_id) }}
											</span>
										</span>
									</td>
									<td class="text-end">{{ formatCurrency(reading.amount) }}</td>
									<td class="text-center">
										<!-- Кнопка редагування тільки для першого запису спільного лічильника -->
										<button v-if="!group?.has_shared_meter || (group?.readings && group.readings.indexOf(reading) === 0)" 
												class="btn btn-sm btn-outline-primary" 
												@click="editReading(reading.id)"
												title="Редагувати">
											<i class="fas fa-edit"></i>
										</button>
									</td>
								</tr>
							</tbody>
							<tfoot>
								<tr class="fw-bold">
									<td colspan="5">Загальна сума по групі:</td>
									<td class="text-end text-primary">{{ formatCurrency(group.total_amount) }}</td>
								</tr>
							</tfoot>
						</table>
					</div>
					
					<!-- Мобільна версія - карточки -->
					<div class="d-md-none">
						<div v-for="reading in group.readings as ExtendedGroupedReadingItem[]" :key="reading.id" 
							 class="card mb-2">
							<div class="card-body p-3">
								<div class="d-flex justify-content-between align-items-start">
									<div class="flex-grow-1">
										<h6 class="card-title mb-1">{{ reading.service_name }}</h6>
										<small v-if="reading.tariff_name" class="text-muted">{{ reading.tariff_name }}</small>
									</div>
									<!-- Кнопка редагування тільки для першого запису спільного лічильника -->
									<button v-if="!group?.has_shared_meter || (group?.readings && group.readings.indexOf(reading) === 0)" 
											class="btn btn-sm btn-outline-primary ms-2" 
											@click="editReading(reading.id)"
											title="Редагувати">
										<i class="fas fa-edit"></i>
									</button>
								</div>
								
								<div class="row mt-2">
									<div class="col-6" v-if="!group?.has_shared_meter && reading.current_reading">
										<small class="text-muted">Останній показник:</small><br>
										<strong>{{ reading.current_reading }}</strong>
									</div>
									<div class="col-6 text-end">
										<small class="text-muted">Сума:</small><br>
										<strong class="text-success">{{ formatCurrency(reading.amount) }}</strong>
									</div>
								</div>
								
								<!-- Додаткова інформація при розгортанні -->
								<div v-if="reading.tariff_type !== 'subscription' && reading.consumption" class="mt-2 pt-2 border-top">
									<small class="text-muted">
										Споживання: <strong>{{ reading.consumption }}</strong> {{ getServiceUnit(reading.service_id) }}
										<span v-if="reading.tariff">
											• Тариф: <strong>{{ formatRate(reading.tariff.rate) }}</strong> грн/{{ getServiceUnit(reading.service_id) }}
										</span>
									</small>
								</div>
							</div>
						</div>
						
						<!-- Підсумок для групи на мобільному -->
						<div class="alert alert-success d-flex justify-content-between align-items-center">
							<strong>Загальна сума по групі:</strong>
							<span class="h5 mb-0 text-success">{{ formatCurrency(group.total_amount) }}</span>
						</div>
					</div>
				</div>
			</div>
			</div>
			
			<!-- Окремі служби без груп -->
			<div v-for="service in groupedData.services" :key="service.service_id" class="card mb-4">
				<div class="card-header">
					<h5 class="mb-0">
						<i class="fas fa-tachometer-alt me-2"></i>
						{{ service.service_name }}
					</h5>
				</div>
				<div class="card-body">
					<!-- Десктопна версія таблиці -->
					<div class="table-responsive d-none d-md-block">
						<table class="table table-sm">
							<thead>
								<tr>
									<th>Тариф</th>
									<th class="text-end">Показник</th>
									<th class="text-end">Споживання</th>
									<th class="text-end">Ставка</th>
									<th class="text-end">Сума</th>
									<th class="text-center" style="width: 50px;">Дії</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="reading in service.readings as ExtendedGroupedReadingItem[]" :key="reading.id">
									<td>{{ reading.tariff_name || 'Без тарифу' }}</td>
									<td class="text-end">
										<span v-if="reading.tariff?.calculation_method === 'fixed'">
											-
										</span>
										<span v-else>
											{{ reading.current_reading }}
											<span class="text-muted small d-block" v-if="reading.previous_reading">
												(попер. {{ reading.previous_reading }})
											</span>
										</span>
									</td>
									<td class="text-end">
										<span v-if="reading.tariff_type === 'subscription' || reading.tariff?.calculation_method === 'fixed'">-</span>
										<span v-else>{{ reading.consumption || 0 }} {{ service.unit }}</span>
									</td>
									<td class="text-end">
										<span v-if="reading.tariff_type === 'subscription'">
											Абонплата
										</span>
										<span v-else-if="reading.tariff?.calculation_method === 'fixed'">
											Фіксована сума
										</span>
										<span v-else-if="reading.tariff">
											{{ formatRate(reading.tariff.rate) }}
											<span class="text-muted small d-block" v-if="reading.tariff_type === 'consumption'">
												грн/{{ getServiceUnit(reading.service_id) }}
											</span>
										</span>
									</td>
									<td class="text-end">{{ formatCurrency(reading.amount) }}</td>
									<td class="text-center">
										<!-- Кнопка редагування тільки для першого запису спільного лічильника -->
										<button v-if="!group?.has_shared_meter || (group?.readings && group.readings.indexOf(reading) === 0)" 
												class="btn btn-sm btn-outline-primary" 
												@click="editReading(reading.id)"
												title="Редагувати">
											<i class="fas fa-edit"></i>
										</button>
									</td>
								</tr>
							</tbody>
							<tfoot>
								<tr class="fw-bold">
									<td colspan="5">Всього:</td>
									<td class="text-end text-primary">{{ formatCurrency(service.total_amount) }}</td>
								</tr>
							</tfoot>
						</table>
					</div>
					
					<!-- Мобільна версія - карточки -->
					<div class="d-md-none">
						<div v-for="reading in service.readings as ExtendedGroupedReadingItem[]" :key="reading.id" 
							 class="card mb-2">
							<div class="card-body p-3">
								<div class="d-flex justify-content-between align-items-start">
									<div class="flex-grow-1">
										<h6 class="card-title mb-1">{{ reading.tariff_name || 'Без тарифу' }}</h6>
										<small v-if="reading.tariff_type === 'subscription'" class="text-muted badge bg-secondary">Абонплата</small>
										<small v-else-if="reading.tariff?.calculation_method === 'fixed'" class="text-muted badge bg-info">Фіксована сума</small>
									</div>
									<!-- Кнопка редагування тільки для першого запису спільного лічильника -->
									<button v-if="!group?.has_shared_meter || (group?.readings && group.readings.indexOf(reading) === 0)" 
											class="btn btn-sm btn-outline-primary ms-2" 
											@click="editReading(reading.id)"
											title="Редагувати">
										<i class="fas fa-edit"></i>
									</button>
								</div>
								
								<div class="row mt-2">
									<div class="col-6" v-if="reading.tariff?.calculation_method !== 'fixed' && reading.current_reading">
										<small class="text-muted">Останній показник:</small><br>
										<strong>{{ reading.current_reading }}</strong>
									</div>
									<div class="col-6 text-end">
										<small class="text-muted">Сума:</small><br>
										<strong class="text-success">{{ formatCurrency(reading.amount) }}</strong>
									</div>
								</div>
								
								<!-- Додаткова інформація -->
								<div v-if="reading.tariff_type !== 'subscription' && reading.tariff?.calculation_method !== 'fixed' && reading.consumption" 
									 class="mt-2 pt-2 border-top">
									<small class="text-muted">
										Споживання: <strong>{{ reading.consumption }}</strong> {{ service.unit }}
										<span v-if="reading.tariff">
											• Тариф: <strong>{{ formatRate(reading.tariff.rate) }}</strong> грн/{{ service.unit }}
										</span>
									</small>
								</div>
							</div>
						</div>
						
						<!-- Підсумок для служби на мобільному -->
						<div class="alert alert-success d-flex justify-content-between align-items-center">
							<strong>Всього:</strong>
							<span class="h5 mb-0 text-success">{{ formatCurrency(service.total_amount) }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div v-else class="alert alert-info">
			<i class="fas fa-info-circle me-2"></i>
			Немає даних для відображення за вибраний період.
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, toRefs, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useGetGroupedReadingsEndpointApiUtilitiesGroupedReadingsGet } from '@/api/utilities/utilities';
import type { GroupedReadingsResponse } from '@/api/model/groupedReadingsResponse';

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
		
		// Watch for errors
		watchEffect(() => {
			if (error.value) {
				console.error('Error fetching grouped readings:', error.value);
				console.error('Error response:', (error.value as any)?.response?.data);
			}
		});
		
		// Calculate total amount
		const totalAmount = computed(() => {
			if (!groupedData.value) return 0;
			
			let total = 0;
			// Сума по групах
			groupedData.value.service_groups.forEach(group => {
				total += group.total_amount;
			});
			// Сума по окремих службах
			groupedData.value.services.forEach(service => {
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
			if (!serviceId || !groupedData.value) return '';
			
			// Знаходимо показник по service_id
			let reading: ExtendedGroupedReadingItem | undefined;
			
			// Шукаємо в групах
			for (const group of groupedData.value.service_groups) {
				reading = (group.readings as ExtendedGroupedReadingItem[])
					.find(r => r.service_id === serviceId);
				if (reading) break;
			}
			
			// Якщо не знайшли в групах, шукаємо в окремих службах
			if (!reading) {
				for (const service of groupedData.value.services) {
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
				console.log('getSharedMeterReading: немає показників', group);
				return 'Немає даних';
			}
			
			console.log('getSharedMeterReading: показники групи', group.readings);
			
			// Знаходимо показник що не є абонплатою та має валідний current_reading
			const meterReading = group.readings.find((r: any) => 
				r.current_reading !== null && 
				r.current_reading !== undefined && 
				!isNaN(r.current_reading) && 
				r.tariff_type !== 'subscription'
			);
			
			console.log('getSharedMeterReading: знайдений показник лічильника', meterReading);
			
			if (meterReading && meterReading.current_reading !== null) {
				return Number(meterReading.current_reading);
			}
			
			// Fallback: шукаємо будь-який показник з валідним current_reading
			const anyReading = group.readings.find((r: any) => 
				r.current_reading !== null && 
				r.current_reading !== undefined && 
				!isNaN(r.current_reading)
			);
			
			console.log('getSharedMeterReading: fallback показник', anyReading);
			
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

.card-header h5 {
	display: flex;
	align-items: center;
}

.table-sm td, .table-sm th {
	padding: 0.5rem;
}
</style>
