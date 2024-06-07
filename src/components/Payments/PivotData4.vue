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
        <ag-grid-vue
          class="ag-theme-alpine"
          style="width: 100%; height: 500px;"
          :columnDefs="columnDefs"
          :rowData="payments"
          :defaultColDef="defaultColDef"
          :pivotMode="true"
          :pivotColumnGroupTotals="pivotColumnGroupTotals"
          :pivotRowTotals="pivotRowTotals"
          :groupDefaultExpanded="groupDefaultExpanded"
          @grid-ready="onGridReady"
        ></ag-grid-vue>
        <div v-if="payments.length === 0">Data loading...</div>
      </div>
    </div>
  </div>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue3';
import PaymentService from "../../services/PaymentService";
import store from "../../store";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-enterprise';

export default {
	name: "PivotData",
	components: {
		AgGridVue
	},
	data() {
		return {
			payments: [],
			categories: [],
			sources: [],
			currencies: [],
			columnDefs: [
				{ field: 'category_name', rowGroup: true, hide: true },
				{ field: 'mydesc' },
				{ field: 'source', pivot: true },
				{
					field: 'amount',
					aggFunc: 'sum',
					valueFormatter: params => params.value ? params.value.toFixed(2) : ''
				}
			],
			defaultColDef: {
				sortable: true,
				filter: true,
				resizable: true,
			},
			pivotColumnGroupTotals: 'before',
			pivotRowTotals: 'before',
			groupDefaultExpanded: 1, // Розгрупувати всі категорії за замовчуванням
			gridApi: null,
			gridColumnApi: null,
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
			if (this.gridApi) {
				this.gridApi.setRowData(this.payments);
			}
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
		onGridReady(params) {
			this.gridApi = params.api;
			this.gridColumnApi = params.columnApi;
			this.gridApi.setRowData(this.payments);
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
				if (this.gridApi) {
					this.gridApi.setRowData(this.payments);
				}
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
