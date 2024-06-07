<template>
	<div class="row">
		<div class="col-md-8">
			<selector-component
				@change="handleSelectChange"
			/>
			<b-table-simple caption-top hover responsive small>
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
					<b-tr v-for="(category, index) in catcosts" :key="index">
						<b-td>
							<router-link
								:to="{
                  name: 'payments',
                  params: { action: 'show', year: year, month: month, category_id: category.category_id }
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
import SelectorComponent from "../SelectorComponent.vue";
import PaymentService from "../../services/PaymentService";

export default {
	name: "PaymentYearMonth",
	components: {
		SelectorComponent,
	},
	data() {
		return {
			catcosts: [],
			q: "",
			year: this.$route.params.year || new Date().getFullYear(),
			month: this.$route.params.month || new Date().getMonth() + 1,
			total: 0,
			total_cnt: 0,
			mono_user_id: this.$route.params.mono_user_id || undefined,
			initialLoad: true,
		};
	},
	methods: {
		async getPaymentsPeriod(data) {
			data["currency"] = this.$store.state.sprs.selectedCurrency || "UAH";
			if (data.month === 99) {
				this.$router.push({ name: "payments_year", params: { year: data.year } });
				return;
			}
			PaymentService.getPaymentsPeriod(data)
				.then((response) => {
					this.catcosts = response.data;
					let total = 0;
					let total_cnt = 0;
					this.catcosts.forEach((val) => {
						total += Number(val.amount);
						total_cnt += Number(val.cnt);
					});
					this.total = total;
					this.total_cnt = total_cnt;
				})
				.catch((e) => {
					console.log(e);
				});
		},
		handleSelectChange({ year, month, mono_user_id }) {
			this.year = year;
			this.month = month;
			this.mono_user_id = mono_user_id;
			this.getPaymentsPeriod({ year: year, month: month, mono_user_id: mono_user_id });
			this.$router.push({
				name: "payments_year_month",
				params: { year: this.year, month: this.month, mono_user_id: this.mono_user_id },
			});
		},
	},
	mounted() {
		let data = {
			year: this.$route.params.year || new Date().getFullYear(),
			month: this.$route.params.month || new Date().getMonth() + 1,
			currency: this.$store.state.sprs.selectedCurrency || "UAH",
		};
		this.initialLoad = false;
		this.getPaymentsPeriod(data);
	},
};
</script>
