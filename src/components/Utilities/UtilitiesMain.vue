<template>
	<div class="utilities-main">
		<div class="container-fluid">
			<div class="row mb-4">
				<div class="col-12">
					<h2><i class="fas fa-home mr-2"></i>Комунальні послуги</h2>
					<p class="text-muted">Управління адресами, службами та показниками лічильників</p>
				</div>
			</div>

			<div class="row mb-4">
				<div class="col-lg-3 col-md-6 mb-3">
					<div class="card stats-card text-center">
						<div class="card-body">
							<i class="fas fa-map-marker-alt fa-2x text-primary mb-2"></i>
							<h5 class="card-title">{{ addressesCount }}</h5>
							<p class="card-text">Адрес</p>
							<Button
								label="Переглянути"
								outlined
								size="small"
								@click="$router.push({ name: 'utilities_addresses' })"
							/>
						</div>
					</div>
				</div>

				<div class="col-lg-3 col-md-6 mb-3">
					<div class="card stats-card text-center">
						<div class="card-body">
							<i class="fas fa-cogs fa-2x text-success mb-2"></i>
							<h5 class="card-title">{{ servicesCount }}</h5>
							<p class="card-text">Служб</p>
						</div>
					</div>
				</div>

				<div class="col-lg-3 col-md-6 mb-3">
					<div class="card stats-card text-center">
						<div class="card-body">
							<i class="fas fa-calculator fa-2x text-warning mb-2"></i>
							<h5 class="card-title">{{ currentMonthCost }}</h5>
							<p class="card-text">За поточний місяць</p>
						</div>
					</div>
				</div>

				<div class="col-lg-3 col-md-6 mb-3">
					<div class="card stats-card text-center">
						<div class="card-body">
							<i class="fas fa-plus fa-2x text-info mb-2"></i>
							<h5 class="card-title">Додати</h5>
							<p class="card-text">Показники</p>
							<Button
								label="Внести"
								outlined
								severity="info"
								size="small"
								@click="$router.push({ name: 'utilities_add_reading' })"
							/>
						</div>
					</div>
				</div>
			</div>

			<div class="row">
				<div class="col-lg-8">
					<div class="card">
						<div class="card-header">
							<h5 class="m-0"><i class="fas fa-chart-line mr-2"></i>Останні показники</h5>
						</div>
						<div class="card-body">
							<div v-if="isLoadingReadings" class="text-center">
								<ProgressSpinner />
							</div>
							<div v-else-if="latestReadings.length === 0" class="text-center text-muted">
								<i class="fas fa-info-circle mr-2"></i>Показники ще не додані
							</div>
							<div v-else class="table-responsive">
								<table class="table table-hover">
									<thead>
										<tr>
											<th>Адреса</th>
											<th>Служба</th>
											<th>Період</th>
											<th>Показник</th>
											<th>Споживання</th>
											<th>Вартість</th>
										</tr>
									</thead>
									<tbody>
										<tr v-for="reading in latestReadings" :key="`${reading.address_id}-${reading.service_id}-${reading.period}`">
											<td>{{ getAddressName(reading.address_id) }}</td>
											<td>{{ getServiceName(reading.service_id) }}</td>
											<td>{{ formatPeriod(reading.period) }}</td>
											<td>{{ reading.current_reading }}</td>
											<td>{{ reading.consumption || '-' }}</td>
											<td>{{ formatCurrency(reading.amount) }}</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>

				<div class="col-lg-4">
					<div class="card">
						<div class="card-header">
							<h5 class="m-0"><i class="fas fa-list mr-2"></i>Швидкі дії</h5>
						</div>
						<div class="card-body">
							<div class="flex flex-column gap-2">
								<Button
									label="Керувати адресами"
									icon="pi pi-map-marker"
									outlined
									@click="$router.push({ name: 'utilities_addresses' })"
								/>
								<Button
									label="Додати показники"
									icon="pi pi-plus"
									outlined
									severity="success"
									@click="$router.push({ name: 'utilities_add_reading' })"
								/>
								<Button
									label="Експортувати дані"
									icon="pi pi-download"
									outlined
									severity="info"
									@click="exportData"
								/>
							</div>

							<hr>

							<h6><i class="fas fa-info-circle mr-2"></i>Підказки</h6>
							<ul class="list-unstyled small text-muted">
								<li><i class="fas fa-lightbulb mr-1"></i>Регулярно вносьте показники</li>
								<li><i class="fas fa-chart-line mr-1"></i>Аналізуйте споживання</li>
								<li><i class="fas fa-money-bill mr-1"></i>Відстежуйте витрати</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import {
	useGetAddressesApiUtilitiesAddressesGet,
	useGetServicesApiUtilitiesServicesGet,
	useGetReadingsApiUtilitiesReadingsGet
} from '@/api/utilities/utilities';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';

interface ReadingData {
	address_id: number;
	service_id: number;
	period: string;
	current_reading: number;
	consumption?: number;
	amount?: number;
}

interface AddressData {
	id: number;
	name: string;
	address: string;
}

interface ServiceData {
	id: number;
	name: string;
	address_id: number;
}

export default defineComponent({
	name: 'UtilitiesMain',
	components: {
		Button,
		ProgressSpinner
	},
	setup() {
		const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM format

		// API calls
		const { data: addressesData, isLoading: isLoadingAddresses } = useGetAddressesApiUtilitiesAddressesGet();
		const { data: servicesData, isLoading: isLoadingServices } = useGetServicesApiUtilitiesServicesGet();
		const { data: readingsData, isLoading: isLoadingReadings } = useGetReadingsApiUtilitiesReadingsGet({
			period: currentPeriod
		});

		// Computed properties
		const addresses = computed(() => {
			return (addressesData.value?.data as AddressData[]) || [];
		});

		const services = computed(() => {
			return (servicesData.value?.data as ServiceData[]) || [];
		});

		const latestReadings = computed(() => {
			return (readingsData.value?.data as ReadingData[]) || [];
		});

		const addressesCount = computed(() => addresses.value.length);
		const servicesCount = computed(() => services.value.length);

		const currentMonthCost = computed(() => {
			const totalCost = latestReadings.value.reduce((sum, reading) => {
				return sum + (reading.amount || 0);
			}, 0);
			return formatCurrency(totalCost);
		});

		// Methods
		const getAddressName = (addressId: number): string => {
			const address = addresses.value.find(addr => addr.id === addressId);
			return address?.name || 'Невідома адреса';
		};

		const getServiceName = (serviceId: number): string => {
			const service = services.value.find(serv => serv.id === serviceId);
			return service?.name || 'Невідома служба';
		};

		const formatPeriod = (period: string): string => {
			const [year, month] = period.split('-');
			const date = new Date(parseInt(year), parseInt(month) - 1);
			return date.toLocaleDateString('uk-UA', { year: 'numeric', month: 'long' });
		};

		const formatCurrency = (amount?: number): string => {
			if (amount === undefined || amount === null) return '-';
			return new Intl.NumberFormat('uk-UA', {
				style: 'currency',
				currency: 'UAH'
			}).format(amount);
		};

		const exportData = () => {
			// TODO: Implement data export functionality
			console.log('Export data functionality will be implemented');
		};

		return {
			// Data
			isLoadingReadings,
			latestReadings,
			addressesCount,
			servicesCount,
			currentMonthCost,
			
			// Methods
			getAddressName,
			getServiceName,
			formatPeriod,
			formatCurrency,
			exportData
		};
	}
});
</script>

<style scoped>
.utilities-main {
	padding: 20px 0;
}

.stats-card {
	transition: transform 0.2s;
	border: none;
	box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stats-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.card {
	border: none;
	box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.table th {
	border-top: none;
	font-weight: 600;
	color: #495057;
}

.table td {
	vertical-align: middle;
}
</style>
