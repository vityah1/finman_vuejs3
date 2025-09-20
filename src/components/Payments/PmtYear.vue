<template>
	<div>
		<PCard>
			<template #content>
				<!-- Year selector header -->
				<PCard>
					<template #header>
						<div style="padding: 1rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
							<div style="display: flex; align-items: center; gap: 0.5rem;">
								<i class="pi pi-calendar" style="font-size: 1.5rem; color: var(--primary-color);"></i>
								<label for="year-dropdown" style="font-weight: 600; margin: 0;">Рік:</label>
								<Dropdown
									id="year-dropdown"
									v-model="year"
									:options="years"
									@change="retrieveMonths(year)"
									placeholder="Оберіть рік"
									style="min-width: 120px;"
								/>
							</div>
							<div style="display: flex; align-items: center; gap: 0.5rem;">
								<div style="display: flex; align-items: center; gap: 0.25rem;">
									<i class="pi pi-calculator" style="color: var(--primary-color);"></i>
									<span style="font-weight: 700; font-size: 1.4rem; color: var(--primary-color);">{{ total.toLocaleString() }}</span>
									<span style="color: var(--text-color-secondary); font-size: 1rem;">{{ selectedCurrency || "UAH" }}</span>
								</div>
								<PTag :value="total_cnt + ' операцій'" severity="info" style="font-weight: 600;" />
							</div>
						</div>
					</template>

					<template #content>
						<!-- Months table with PrimeVue DataTable -->
						<DataTable
							:value="payments_in_year"
							:loading="loading"
							@row-click="navigateToMonth"
							dataKey="month"
							:paginator="false"
							showGridlines
							stripedRows
						>
							<template #empty>
								<div style="text-align: center; padding: 2rem;">
									<i class="pi pi-inbox" style="font-size: 3rem; color: var(--text-color-secondary); margin-bottom: 1rem; display: block;"></i>
									<span style="color: var(--text-color-secondary);">Немає даних за цей рік</span>
								</div>
							</template>
							<template #loading>
								<div style="text-align: center; padding: 2rem;">
									<i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: var(--primary-color); margin-bottom: 1rem; display: block;"></i>
									<span style="color: var(--text-color-secondary);">Завантаження даних...</span>
								</div>
							</template>

							<Column field="month" header="Місяць" style="width: 40%;">
								<template #body="slotProps">
									<div style="display: flex; align-items: center; gap: 0.5rem;">
										<i class="pi pi-calendar" style="color: var(--primary-color);"></i>
										<span style="font-weight: 600; text-transform: capitalize;">{{ getMonthName(slotProps.data.month) }}</span>
									</div>
								</template>
							</Column>

							<Column field="amount" header="Сума" style="width: 45%; text-align: right;">
								<template #body="slotProps">
									<div style="display: flex; align-items: center; justify-content: flex-end; gap: 0.25rem;">
										<span style="font-weight: 600; font-size: 1.1rem; color: var(--green-500);">{{ slotProps.data.amount.toLocaleString() }}</span>
										<span style="color: var(--text-color-secondary); font-size: 0.9rem;">{{ selectedCurrency || "UAH" }}</span>
									</div>
								</template>
							</Column>

							<Column field="cnt" header="К-ть" style="width: 15%; text-align: center;">
								<template #body="slotProps">
									<PTag :value="slotProps.data.cnt" severity="info" />
								</template>
							</Column>

							<!-- Enhanced footer with better styling -->
							<template #footer>
								<PCard>
									<template #content>
										<div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0;">
											<div style="display: flex; align-items: center; gap: 0.5rem;">
												<i class="pi pi-chart-bar" style="color: var(--primary-color); font-size: 1.2rem;"></i>
												<span style="font-weight: 600; font-size: 1.2rem;">Загальна сума за рік:</span>
											</div>
											<div style="display: flex; align-items: center; gap: 1rem;">
												<div style="display: flex; align-items: center; gap: 0.25rem;">
													<span style="font-weight: 700; font-size: 1.4rem; color: var(--primary-color);">{{ total.toLocaleString() }}</span>
													<span style="color: var(--text-color-secondary); font-size: 1rem;">{{ selectedCurrency || "UAH" }}</span>
												</div>
												<div style="display: flex; align-items: center; gap: 0.25rem;">
													<span style="color: var(--text-color-secondary);">Операцій:</span>
													<PTag :value="total_cnt" severity="success" style="font-weight: 600;" />
												</div>
											</div>
										</div>
									</template>
								</PCard>
							</template>
						</DataTable>

					</template>
				</PCard>
			</template>
		</PCard>
	</div>
</template>

<script>
import PaymentService from "../../services/PaymentService";
import store from "@/store";
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Dropdown from 'primevue/dropdown';

export default {
	name: "PaymentsInYear",
	components: {
		DataTable,
		Column,
		PCard: Card,
		PTag: Tag,
		Dropdown
	},
	data() {
		return {
			payments_in_year: [],
			year: parseInt(this.$route.params.year) || new Date().getFullYear(),
			total: 0,
			total_cnt: 0,
			years: this.getArrayOfYears(2014),
			users: [],
			selectedCurrency: store.state.sprs.selectedCurrency || "UAH",
			loading: false
		};
	},
	methods: {
		getMonthName(monthNumber) {
			const date = new Date();
			date.setMonth(monthNumber - 1);
			return date.toLocaleString('uk-UA', { month: 'long' });
		},
		getArrayOfYears: function(startYear) {
			const currentYear = new Date().getFullYear();
			return Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
		},
		navigateToMonth(event) {
			const month = event.data;
			this.$router.push({
				name: 'payments_year_month',
				params: { year: this.year, month: month.month }
			});
		},
		async retrieveMonths(year) {
			this.loading = true;
			PaymentService.getPaymentsInYear(year, { currency: store.state.sprs.selectedCurrency || "UAH" })
				.then((response) => {
					this.payments_in_year = response.data;
					let total = 0;
					let total_cnt = 0;
					this.payments_in_year.forEach((val) => {
						total += Number(val.amount);
						total_cnt += Number(val.cnt);
					});
					this.total = total;
					this.total_cnt = total_cnt;
					this.loading = false;
				})
				.catch((e) => {
					console.error(e);
					this.loading = false;
				});
		},
	},
	mounted() {
		this.retrieveMonths(this.$route.params.year);
	},
	watch: {
    '$store.state.sprs.selectedCurrency'(newCurrency) {
        this.selectedCurrency = newCurrency;
        this.retrieveMonths(this.year);
    }
}
};
</script>

<style scoped>
/* NO CUSTOM STYLES - USING PURE PRIMEVUE DEFAULTS */
</style>