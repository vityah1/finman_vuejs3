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
        <div id="plotly-chart" ref="chartContainer" style="width: 100%; height: 1000px; margin-top: 20px;"></div>
        <div v-if="payments.length === 0">Data loading...</div>
      </div>
    </div>
  </div>
</template>

<script>
import Plotly from 'plotly.js-dist';
import PaymentService from "../../services/PaymentService";
import store from "../../store";

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
      this.$nextTick(() => {
        this.createPlotlyChart();
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
    createPlotlyChart() {
      const chartContainer = this.$refs.chartContainer;
      if (chartContainer) {
        const categories = [...new Set(this.payments.map(payment => payment.category_name))];
        const categoryData = categories.map(category => {
          return this.payments
            .filter(payment => payment.category_name === category)
            .reduce((sum, payment) => sum + payment.amount, 0);
        });

        // Sort categories and data by value from largest to smallest
        const sortedData = categories.map((category, index) => ({
          category,
          amount: categoryData[index]
        })).sort((b, a) => b.amount - a.amount);

        const sortedCategories = sortedData.map(data => data.category);
        const sortedAmounts = sortedData.map(data => data.amount);

        const data = [{
          x: sortedAmounts,
          y: sortedCategories,
          type: 'bar',
          orientation: 'h',
          marker: {
            color: sortedCategories.map((_, index) => `rgba(${(index * 47) % 255}, ${(index * 87) % 255}, ${(index * 137) % 255}, 0.6)`)
          },
          text: sortedAmounts.map((amount, index) => `${sortedCategories[index]} (${amount.toFixed(2)})`),
          textposition: 'auto',
          hoverinfo: 'x+y+text'
        }];

        const layout = {
          title: 'Total Amount by Category',
          xaxis: {
            automargin: true,
            ticks: '',
            showticklabels: false,
          },
          yaxis: {
            automargin: true,
            tickangle: 0,
            ticks: '',
            showticklabels: false,
          },
          margin: {
            l: 0, // Збільшення лівого відступу для більшого простору для тексту
            r: 50,
            t: 50,
            b: 50
          },
          bargap: 0.2, // зменшення відстані між стовпчиками
        };

        Plotly.newPlot(chartContainer, data, layout);
        console.log('Plotly chart created successfully.');
      } else {
        console.error('Chart container is not available');
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
          this.createPlotlyChart();
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
#chart-container {
  width: 100%;
  height: 1000px;
  margin-top: 20px;
}
</style>
