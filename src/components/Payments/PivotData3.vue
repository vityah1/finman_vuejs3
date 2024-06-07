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
        <span v-if="category_name" class="text-small primary me-2">{{ category_name }}</span>
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
import Flexmonster from "flexmonster"; // Імпорт Flexmonster
import "flexmonster/flexmonster.css"; // Імпорт стилів Flexmonster

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
      if (this.pivotTable) {
        this.pivotTable.updateData({ data: this.payments });
      } else {
        this.pivotTable = new Flexmonster({
          container: "#pivot-container",
          toolbar: true,
          report: {
            dataSource: {
              data: this.payments
            },
            slice: {
              rows: [{ uniqueName: "category_name" }, { uniqueName: "mydesc" }],
              columns: [{ uniqueName: "source" }],
              measures: [
                {
                  uniqueName: "amount",
                  aggregation: "sum"
                }
              ]
            }
          }
        });
      }
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
