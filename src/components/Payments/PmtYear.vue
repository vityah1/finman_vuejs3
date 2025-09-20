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
				<b-table-simple hover small caption-top responsive class="months-table">
					<!--      <caption>Table Head</caption>-->
					<colgroup>
						<col style="width: 40%;" />
						<col style="width: 40%;" />
						<col style="width: 20%;" />
					</colgroup>
					<b-thead head-variant="dark">
						<b-tr>
							<b-th class="text-center">Month</b-th>
							<b-th class="text-end">Amount</b-th>
							<b-th class="text-center">Count</b-th>
						</b-tr>
					</b-thead>
					<b-tbody v-if="(payments_in_year.length > 0)">
						<b-tr v-for="(month, index) in payments_in_year" :key="index">
							<b-td class="text-center">
								<router-link
									class="month-link fw-bold"
									:to="{ name: 'payments_year_month', params: { year: year, month: month.month} }"
								>
									{{ getMonthName(month.month) }}
								</router-link>
							</b-td>
							<b-td class="text-end amount-cell">{{ month.amount.toLocaleString() }} {{ selectedCurrency || "UAH" }}</b-td>
							<b-td class="text-center">{{ month.cnt }}</b-td>
						</b-tr>
					</b-tbody>
					<b-tfoot>
						<b-tr>
							<b-td colspan="3"></b-td>
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
    '$store.state.sprs.selectedCurrency'(newCurrency) {
        this.selectedCurrency = newCurrency;
        this.retrieveMonths(this.year);
    }
}
};
</script>

<style scoped>
.list {
	text-align: left;
	max-width: 750px;
	margin: auto;
}

.months-table {
	margin-top: 20px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	border-radius: 8px;
	overflow: hidden;
}

.month-link {
	text-decoration: none;
	color: #007bff;
	font-size: 1.05em;
	transition: color 0.2s ease;
	text-transform: capitalize;
}

.month-link:hover {
	color: #0056b3;
	text-decoration: underline;
}

.amount-cell {
	font-family: 'Courier New', monospace;
	font-weight: 600;
	color: #28a745;
	font-size: 1.05em;
}

.months-table tbody tr:hover {
	background-color: #f8f9fa;
}

.months-table th {
	font-weight: 600;
	border-bottom: 2px solid #495057;
	padding: 10px 8px;
}

.months-table td {
	padding: 12px 8px;
	vertical-align: middle;
}

/* Style for year selector */
#year {
	font-weight: 600;
	min-width: 100px;
}

/* Style for totals */
.text-danger {
	font-weight: bold;
	font-size: 1.1em;
}

.text-muted {
	font-size: 0.95em;
}
</style>