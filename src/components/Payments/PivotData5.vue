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
        <span v-if="$route.params.year" class="text-primary">{{ $route.params.year }}-</span>
        <span v-if="$route.params.month" class="text-primary">{{ $route.params.month }}</span>
        <span v-if="$route.query.user">[{{ $route.query.user }}]</span>
      </div>
    </div>

    <div class="row">
      <div class="col-md-8">
        <div id="pivot-container"></div>
        <div v-if="payments.length === 0">Data loading...</div>
      </div>
    </div>
  </div>
</template>

<script>
import PaymentService from "../../services/PaymentService";
import store from "../../store";
import "pivottable/dist/pivot.css"; // Імпорт стилів PivotTable.js
import $ from 'jquery'; // Імпорт jQuery
import 'jquery-ui/ui/widgets/sortable';
import 'pivottable'; // Імпорт PivotTable.js
// import Plotly from 'plotly.js-basic-dist'; // Імпорт Plotly.js

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
		"$route.query.action"(newAction) {
			if (newAction === "add") {
				this.openFormAddPayment();
			}
		},
		"$route.path"() {
			this.getPaymentData();
		},
		"$store.state.buttonClicked"(newAction) {
			if (newAction) {
				this.openFormAddPayment();
				this.$store.commit("setButtonClicked", false);
			}
		},
	},
	methods: {
		createPivotTable() {
			$("#pivot-container").pivotUI(this.payments, {
				renderers: $.extend($.pivotUtilities.renderers, $.pivotUtilities.plotly_renderers),
				rows: ["category_name"],
				cols: ["source"],
				vals: ["amount"],
				aggregatorName: "Sum",
				rendererName: "Horizontal Stacked Bar Chart" // Ви можете вибрати інший тип діаграми
			});
		},
		async getPaymentData() {
			let data = {
				sort: this.$route.query.sort || "",
				year: this.$route.params.year || "",
				month: this.$route.params.month || "",
				q: this.$route.query.q || "",
				currency: store.state.sprs.selectedCurrency || "UAH",
			};
			try {
				const response = await PaymentService.getPayments(data);
				this.payments = response.data;
				this.createPivotTable();
			} catch (e) {
				console.log(e);
			}
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
		await this.getPaymentData();
		if (this.action === "add") {
			this.openFormAddPayment();
		}
	},
};
</script>
