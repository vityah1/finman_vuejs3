<template>
	<div class="container">
		<alert-component ref="myAlert"></alert-component>

		<div class="row">
			<div class="col-1">
				<router-link :to="{
					name: 'payments_year_month',
					params: { year: $route.params.year, month: $route.params.month },
				}"><i class="fas fa-angle-double-left"></i></router-link>
			</div>
			<div class="col">
				<span v-if="this.$route.params.year" class="text-primary">{{ this.$route.params.year }}-</span>
				<span v-if="this.$route.params.month" class="text-primary">{{ this.$route.params.month }}</span>
				<span v-if="this.$route.query.user">[{{ this.$route.query.user }}]</span>
			</div>
		</div>

		<div class="row">
			<div class="col-md-8">
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

export default {
	name: "PivotData",
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
		"$route.path": function(newPath, oldPath) {
			console.log("Change route.path to", newPath, " from: ", oldPath);
			this.getPayments();
		},
		"$store.state.buttonClicked": function(newAction, oldAction) {
			console.log("Change buttonClicked to", newAction, " from: ", oldAction);
			if (newAction) {
				this.openFormAddPayment();
				this.$store.commit("setButtonClicked", false);
			}
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
	},
	async mounted() {
		if (!this.currentUser) {
			this.$router.push({ name: "login" });
		}
		this.categories = this.$store.state.sprs.categories;
		this.currencies = this.$store.state.sprs.currencies;
		this.sources = this.$store.state.sprs.sources;
		this.action = this.$route.query.action;
		console.log("this.action : ", this.action);
		await this.getPaymentData();
		if (this.action === "add") {
			this.openFormAddPayment();
		}


	},
};
</script>
