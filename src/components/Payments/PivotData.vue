<template>
    <alert-component ref="myAlert"></alert-component>

    <div class="row">
	<div class="col-md-8">
			<selector-component
				@change="handleSelectChange"
			/>
      <span> [WebDataRocks]</span>
    </div>

		<div class="row">
			<div class="col-12">
				<div id="pivot-container"></div>

				<div v-if="(payments.length === 0)">Data loading...</div>
			</div>
		</div>
	</div>
</template>

<script>
import PaymentService from "../../services/PaymentService";
import store from "../../store";
import "webdatarocks/webdatarocks.css";
import WebDataRocks from "webdatarocks";
import SelectorComponent from "@/components/SelectorComponent.vue";

export default {
	name: "PivotData",
	components: { SelectorComponent },
	data() {
		return {
			payments: [],
			categories: [],
			sources: [],
			currencies: [],
		};
	},
	created() {
	},
	computed: {
		currentUser() {
			return this.$store.state.auth.user;
		},
		selectedCurrency() {
			return store.state.sprs.selectedCurrency;
		},
	},
	watch: {
		payments() {
			this.createPivotTable();
		},
		"$route.query.action": function(newAction, oldAction) {
			console.log("oldAction: ", oldAction);
			if (newAction === "add") {
				this.openFormAddPayment();
			}
		},
    "$route.path"() {
      this.getPaymentData();
    },
	},
	methods: {
		createPivotTable() {
			if (this.pivotTable) {
				this.pivotTable.updateData({ data: this.payments });
			} else {
				this.pivotTable = new WebDataRocks({
					container: "#pivot-container",
					toolbar: true,
					report: {
						dataSource: {
							data: this.payments,
						},
						slice: {
							rows: [{ uniqueName: "category_name" }, { uniqueName: "mydesc" }],
							columns: [{ uniqueName: "source" }],
							measures: [
								{
									uniqueName: "amount",
									aggregation: "sum",
								},
							],
						},
					},
				});
			}
		},
		async getPaymentData() {
			console.log(`getPaymentData => store.state.sprs.selectedCurrency=${store.state.sprs.selectedCurrency}`);
			let data = {
				sort: this.$route.query.sort || "",
				year: this.$route.params.year || "",
				month: this.$route.params.month || "",
				q: this.$route.query.q || "",
				currency: store.state.sprs.selectedCurrency || "UAH",
			};
			console.log(data);
			PaymentService.getPayments(data)
				.then((response) => {
					this.payments = response.data;
					// this.createPivotTable();

				})
				.catch((e) => {
					console.log(e);
				});
		},
	handleSelectChange({ year, month, mono_user_id }) {
			this.$router.push({
				name: "pivot_payments",
				params: { year: year, month: month, mono_user_id: mono_user_id },
			});
		},
	},
	async mounted() {
		if (!this.currentUser) {
			this.$router.push({ name: "login" });
		}
		this.categories = this.$store.state.sprs.categories;
		this.currencies = this.$store.state.sprs.currencies;
		this.sources = this.$store.state.sprs.sources;
		await this.getPaymentData();
	},
};
</script>
