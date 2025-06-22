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
					<div class="d-flex justify-content-between align-items-center">
						<h5 class="mb-0">Загальна сума за період {{ groupedData.period }}:</h5>
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
						<span v-if="group.has_shared_meter" class="badge bg-info ms-2">
							<i class="fas fa-link me-1"></i>Спільний показник
						</span>
					</h5>
				</div>
				<div class="card-body">
					<!-- Спільний показник для групи (показуємо один раз) -->
					<div v-if="group.has_shared_meter && group.readings.length > 0" class="alert alert-info mb-3">
						<strong>Спільний показник:</strong> 
						{{ getSharedMeterReading(group) }}
						<span v-if="getSharedMeterPreviousReading(group)" class="text-muted">
							(попередній: {{ getSharedMeterPreviousReading(group) }})
						</span>
					</div>
					<!-- Деталізація за службами/тарифами -->
					<div class="table-responsive mb-3">
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
										<span v-if="!group.has_shared_meter">
											{{ reading.current_reading }}
											<span class="text-muted small d-block" v-if="reading.previous_reading">
												(попер. {{ reading.previous_reading }})
											</span>
										</span>
										<span v-else class="text-muted">-</span>
									</td>
									<td class="text-end">
										<span v-if="reading.tariff_type === 'subscription'">-</span>
										<span v-else>{{ reading.consumption || 0 }}</span>
									</td>
									<td class="text-end">
										<span v-if="reading.tariff">
											{{ formatRate(reading.tariff.rate) }}
											<span class="text-muted small d-block" v-if="reading.tariff_type === 'consumption'">
												грн/{{ getServiceUnit(reading.service_id) }}
											</span>
										</span>
									</td>
									<td class="text-end">{{ formatCurrency(reading.amount) }}</td>
									<td class="text-center">
										<button class="btn btn-sm btn-outline-primary" 
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
					<div class="table-responsive">
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
										<span v-if="isFixedPaymentService(reading.service_name)">
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
										<span v-if="reading.tariff_type === 'subscription' || isFixedPaymentService(reading.service_name)">-</span>
										<span v-else>{{ reading.consumption || 0 }} {{ service.unit }}</span>
									</td>
									<td class="text-end">
										<span v-if="isFixedPaymentService(reading.service_name)">
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
										<button class="btn btn-sm btn-outline-primary" 
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
		}
	},
	setup(props) {
		const router = useRouter();
		const { addressId, period } = toRefs(props);
		
		// Use current period if not provided
		const effectivePeriod = computed(() => period.value || new Date().toISOString().slice(0, 7));
		// Fetch grouped readings
		const { data: groupedDataResponse, isLoading: loading, error } = useGetGroupedReadingsEndpointApiUtilitiesGroupedReadingsGet(
			computed(() => ({
				address_id: addressId.value,
				period: effectivePeriod.value
			})),
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
		
		// Check if service is fixed payment (rent, garbage, etc.)
		const isFixedPaymentService = (serviceName: string): boolean => {
			const name = serviceName.toLowerCase();
			const fixedServices = ['квартплата', 'сміття', 'rent', 'garbage', 'інтернет', 'internet', 'домофон'];
			return fixedServices.some(service => name.includes(service));
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
			if (!group.readings || group.readings.length === 0) return 'Немає даних';
			
			// Знаходимо показник що не є абонплатою
			const meterReading = group.readings.find((r: any) => 
				r.current_reading > 0 && r.tariff_type !== 'subscription'
			);
			
			return meterReading?.current_reading || group.readings[0]?.current_reading || 'Немає даних';
		};
		
		// Get shared meter previous reading
		const getSharedMeterPreviousReading = (group: any): number | null => {
			if (!group.readings || group.readings.length === 0) return null;
			
			// Знаходимо показник що не є абонплатою
			const meterReading = group.readings.find((r: any) => 
				r.current_reading > 0 && r.tariff_type !== 'subscription'
			);
			
			return meterReading?.previous_reading || group.readings[0]?.previous_reading || null;
		};
		
		return {
			loading,
			error,
			groupedData,
			totalAmount,
			formatCurrency,
			formatRate,
			isFixedPaymentService,
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
