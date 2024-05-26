<template>
	<div class="row">
		<div class="col-md-8">
			<div class="input-group mb-3">
				<div class="col-auto">
					<select
						class="form-control w-auto"
						v-model="year"
						id="year"
						name="year"
						@change="getPaymentsPeriod({year: year, month: month, mono_user_id: mono_user_id})"
					>
						<option v-for="(y, index) in years" :value="y" :key="index"
								:selected="y === this.$route.params.year">
							{{ y }}
						</option>
					</select>
				</div>
				&nbsp;
				<div class="col-auto">
					<select
						class="form-control w-auto"
						v-model="month"
						id="month"
						name="month"
						@change="getPaymentsPeriod({year: year, month: month, mono_user_id: mono_user_id})"
					>
						<option v-for="m in months" :value="m.number" :key="m.number"
								:selected="m.number === this.$route.params.month">
							[{{ m.number }}] {{ m.name }}
						</option>
					</select>
				</div>
				&nbsp;
				<div class="col-auto">
					<select
						class="form-control w-auto"
						v-model="mono_user_id"
						id="mono_user"
						name="mono_user"
						@change="getPaymentsPeriod({year: year, month: month, mono_user_id: mono_user_id})"
					>
						<option value="">All</option>
						<option
							v-for="mono_user in mono_users" :key="mono_user.id"
							:value="mono_user.id"
						>{{ mono_user.name }}
						</option>
					</select>
					&nbsp;
				</div>
			</div>

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
			months: [
				{ number: 1, name: "Січень" },
				{ number: 2, name: "Лютий" },
				{ number: 3, name: "Березень" },
				{ number: 4, name: "Квітень" },
				{ number: 5, name: "Травень" },
				{ number: 6, name: "Червень" },
				{ number: 7, name: "Липень" },
				{ number: 8, name: "Серпень" },
				{ number: 9, name: "Вересень" },
				{ number: 10, name: "Жовтень" },
				{ number: 11, name: "Листопад" },
				{ number: 12, name: "Грудень" },
			],
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
			PaymentService.getPaymentsYears({ currency: store.state.sprs.selectedCurrency || "UAH", "grouped": true })
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