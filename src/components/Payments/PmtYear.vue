<template>
	<div class="container">
		<div class="row">
			<div class="col-auto">
				<span>Year:</span>
			</div>
			<div class="col-auto">
				<div class="input-group mb-3">
					<select
						class="form-control"
						placeholder="year"
						v-model="year"
						id="year"
						name="year"
						@change="retrieveMonths(year)"
					>
						<option v-for="(y, index) in years" :value="y" :key="index">
							{{ y }}
						</option>
					</select>
				</div>
			</div>
				<div class="col-auto">
					<span class="text-danger me-3">{{ total.toLocaleString() }} {{ selectedCurrency || "UAH" }}</span>
					<span class="text-muted">[{{ total_cnt }}]</span>
				</div>
		</div>

		<!--<div class="row">-->
		<!--	<div class="col text-right h4">-->
		<!--		Total amount:-->
		<!--		<span class="text-danger">{{ total.toLocaleString() }} {{ selectedCurrency || "UAH" }}</span>-->
		<!--		<span class="text-muted">[{{ total_cnt }}]</span>-->
		<!--	</div>-->
		<!--</div>-->
		<div class="row">
			<div class="col-md-8">
				<b-table-simple hover small caption-top responsive class="table-sm">
					<!--      <caption>Table Head</caption>-->
					<colgroup>
						<col />
						<col />
						<col />
					</colgroup>
					<b-thead head-variant="dark">
						<b-tr>
							<b-th class="px-2">Month</b-th>
							<b-th class="px-2">Amount</b-th>
							<b-th class="px-2">Count</b-th>
						</b-tr>
					</b-thead>
					<b-tbody v-if="(payments_in_year.length > 0)">
						<b-tr v-for="(month, index) in payments_in_year" :key="index">
							<b-td class="px-2">
								<router-link
									class="col-4"
									:to="{ name: 'payments_year_month', params: { year: year, month: month.month} }"
								>
									[{{ month.month }}] {{ getMonthName(month.month) }}
								</router-link>
							</b-td>
							<b-td class="px-2">{{ month.amount.toLocaleString() }}</b-td>
							<b-td class="px-2">{{ month.cnt }}</b-td>
						</b-tr>
					</b-tbody>
					<b-tfoot>
						<b-tr>
							<b-td collspan="3"></b-td>
						</b-tr>
					</b-tfoot>
				</b-table-simple>
				<div v-if="(payments_in_year.length == 0)">Data loading...</div>
			</div>
		</div>
	</div>
</template>

<script>
import PaymentService from "../../services/PaymentService";
import store from "@/store";

export default {
	name: "PaymentsInYear",
	data() {
		return {
			payments_in_year: [],
			year: this.$route.params.year,
			total: 0,
			total_cnt: 0,
			years: this.getArrayOfYears(2014),
			users: [],
			selectedCurrency: store.state.sprs.selectedCurrency || "UAH",
		};
	},
	methods: {
		getMonthName(monthNumber) {
			const date = new Date();
			date.setMonth(monthNumber - 1);
			return date.toLocaleString(this.$store.state.locale || "default", { month: "long" });
		},
		getArrayOfYears: function(startYear) {
			const currentYear = new Date().getFullYear();
			return Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
		},
		async retrieveMonths(year) {
			PaymentService.getPaymentsInYear(year, { currency: store.state.sprs.selectedCurrency || "UAH" })
				.then((response) => {
					this.payments_in_year = response.data;
					console.log(response.data);
					let total = 0;
					let total_cnt = 0;
					this.payments_in_year.forEach((val) => {
						total += Number(val.amount);
						total_cnt += 1;
						//or if you pass float numbers , use parseFloat()
					});
					this.total = total;
					this.total_cnt = total_cnt;
					console.log(total);
				})
				.catch((e) => {
					console.log(e);
				});
		},
	},
	mounted() {
		this.retrieveMonths(this.$route.params.year);
	},
	watch: {
    // Якщо блок watch відсутній, створіть його
    '$store.state.sprs.selectedCurrency'() {
        this.retrieveMonths(this.year);
    }
}
};
</script>

<style>
.list {
	text-align: left;
	max-width: 750px;
	margin: auto;
}
</style>