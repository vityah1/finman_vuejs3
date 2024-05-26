<template>
	<div class="list row">
		<div class="col-md-8">
			<div class="input-group mb-3">
				<select
					class="form-control"
					v-model="year"
					id="year"
					name="year"
				>
					<option v-for="(y, index) in years" :value="y" :key="index"
							:selected="y === this.$route.params.year">
						{{ y }}
					</option>
				</select>
				&nbsp;
				<select
					class="form-control"
					v-model="month"
					id="month"
					name="month"
				>
					<option v-for="(m, index) in months" :value="m" :key="index"
							:selected="m === this.$route.params.month">
						{{ m }}
					</option>
				</select>
				&nbsp;
				<select
					class="form-control"
					v-model="mono_user_id"
					id="mono_user"
					name="mono_user"
				>
					<option value="">All</option>
					<option
						v-for="mono_user in mono_users" :key="mono_user.id"
						:value="mono_user.id"
					>{{ mono_user.name }}
					</option>
				</select>
				&nbsp;

				<div class="input-group-append">
					<button
						class="btn btn-outline-secondary"
						type="button"
						@click="getPaymentsPeriod({year: year, month: month, mono_user_id: mono_user_id})"
					>
						Ok
					</button>
				</div>
			</div>
		</div>
	</div>
	<div class="container">
		<b-table-simple hover small caption-top responsive>
<!--			<caption>List expenses</caption>-->
			<colgroup>
				<col />
				<col />
				<col />
			</colgroup>
			<b-thead head-variant="dark">
				<b-tr>
					<b-th>Total:</b-th>
					<b-th>{{ total.toLocaleString() }}</b-th>
					<b-th>{{ total_cnt }}</b-th>
				</b-tr>
			</b-thead>
			<b-tbody>
				<b-tr
					v-for="(category, index) in catcosts"
					:key="index">
					<b-td>
						<router-link
							:to="{
        name: 'payments', 
        params: { action: 'show', year: year, month: month, category_id: category.category_id} 
        }"
						>
							{{ category.name }}
						</router-link>
					</b-td>
					<b-td>{{ category.amount.toLocaleString() }}</b-td>
					<b-td>{{ category.cnt }}</b-td>

				</b-tr>
			</b-tbody>
		</b-table-simple>
	</div>
</template>

<script>
import PaymentService from "../../services/PaymentService";
import MonoUsersService from "@/services/MonoUsersService";
import store from "@/store";

export default {
	name: "PaymentYearMonth",
	data() {
		return {
			catcosts: [],
			q: "",
			year: this.$route.params.year || new Date().getFullYear(),
			month: this.$route.params.month || new Date().getMonth() + 1,
			years: [],
			months: Array.from({ length: 12 }, (x, i) => i + 1),
			total: 0,
			total_cnt: 0,
			mono_users: [],
			mono_user_id: undefined,
		};
	},
	methods: {
		async getPaymentsPeriod(data) {
			data["currency"] = this.$store.state.sprs.selectedCurrency || "UAH";
			PaymentService.getPaymentsPeriod(data)
				.then((response) => {
					this.catcosts = response.data;
					console.log(response.data);
					let total = 0;
					let total_cnt = 0;
					this.catcosts.forEach((val) => {
						total += Number(val.amount);
						total_cnt += Number(val.cnt);
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
		async getPaymentsYears() {
			PaymentService.getPaymentsYears({currency: store.state.sprs.selectedCurrency || "UAH", "grouped": true})
				.then((response) => {
					let filteredYears = response.data.filter(obj => obj.year > 1900);
					this.years = filteredYears.map(obj => obj.year);
					console.log(`getPaymentsYears => years => ${this.years}`);
				})
				.catch((e) => {
					console.log(e);
				});
		},
		async getMonoUsers() {
			MonoUsersService.getMonoUsers()
				.then((response) => {
					this.mono_users = response.data;
					console.log(`mono_users => ${this.mono_users}`);
				})
				.catch((e) => {
					console.log(e);
				});
		},
	},
	mounted() {
		let data = {
			"year": this.$route.params.year || new Date().getFullYear(),
			"month": this.$route.params.month || new Date().getMonth() + 1,
			"currency": this.$store.state.sprs.selectedCurrency || "UAH",
		};
		this.getPaymentsYears();
		console.log("mounted: ", data);
		this.getPaymentsPeriod(data);
		this.getMonoUsers();
	},
};
</script>

<style>
.list {
	text-align: left;
	max-width: 750px;
	margin: auto;
}
</style>