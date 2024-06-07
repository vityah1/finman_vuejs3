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
      <div class="col-12">
        <div id="handsontable-container" ref="hotContainer"></div>
        <div v-if="payments.length === 0">Data loading...</div>
      </div>
    </div>
  </div>
</template>

<script>
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.css';
import PaymentService from "../../services/PaymentService";
import store from "../../store";

const LICENSE_KEY = 'non-commercial-and-evaluation';

export default {
	name: "PivotData",
	data() {
		return {
			payments: [],
			categories: [],
			sources: [],
			currencies: [],
			hot: null,
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
			this.$nextTick(() => {
				this.createHandsontable();
			});
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
		createHandsontable() {
			console.log('Creating Handsontable with data:', this.payments);
			if (this.hot) {
				this.hot.updateSettings({
					data: this.payments
				});
			} else {
				const container = this.$refs.hotContainer;
				if (container) {
					this.hot = new Handsontable(container, {
						data: this.payments,
						colHeaders: ['Category', 'Source', 'Description', 'Amount'],
						columns: [
							{ data: 'category_name' },
							{ data: 'source' },
							{ data: 'mydesc' },
							{ data: 'amount', type: 'numeric', numericFormat: { pattern: '0,0.00' } }
						],
						rowHeaders: true,
						filters: true,
						dropdownMenu: true,
						licenseKey: LICENSE_KEY,
					});
				}
			}
		},
		async getPaymentData() {
			console.log('Fetching payment data...');
			let data = {
				sort: this.$route.query.sort || "",
				year: this.$route.params.year || "",
				month: this.$route.params.month || "",
				q: this.$route.query.q || "",
				currency: store.state.sprs.selectedCurrency || "UAH",
			};
			console.log('Request data:', data);
			try {
				const response = await PaymentService.getPayments(data);
				console.log('Response data:', response.data);
				this.payments = JSON.parse(JSON.stringify(response.data)); // Make a deep copy of the data
				this.$nextTick(() => {
					this.createHandsontable();
				});
			} catch (e) {
				console.log('Error fetching payment data:', e);
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
		console.log('Mounted: Fetching payment data...');
		await this.getPaymentData();
	},
};
</script>

<style>
#handsontable-container {
	margin-bottom: 20px;
}
</style>
