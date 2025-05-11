<template>
  <div class="container">
    <b-table-simple hover small caption-top responsive>
<!--      <caption>Table Head</caption>-->
      <colgroup>
    <col />
    <col />
    <col />
  </colgroup>      
      <b-thead head-variant="dark">
    <b-tr>
      <b-th>Year</b-th>
      <b-th>Amount</b-th>
      <b-th>Count</b-th>
    </b-tr>
  </b-thead>
  <b-tbody v-if="(years.length > 0)">
    <b-tr v-for="(year, index) in years" :key="index">
      <b-td>
      <router-link 
        v-if="year.year" 
        class="col-2" 
        :to="{ name: 'payments_months', params: { year: year.year } }"
        >
        {{ year.year }}
      </router-link>
    </b-td>
      <b-td>{{ year.amount.toLocaleString() }}</b-td>
      <b-td>{{ year.cnt }}</b-td>
  </b-tr>
</b-tbody>
  <b-tfoot><b-tr><b-td colspan="3"></b-td></b-tr></b-tfoot>
  </b-table-simple>
  <div v-if="(years.length == 0)">Data loading...</div>
  </div>
</template>

<script>
import PaymentService from "../../services/PaymentService";
import store from "@/store";

/**
 * @typedef {Object} YearData
 * @property {number} year
 * @property {number} amount
 * @property {number} cnt
 */

export default {
  name: "PaymentsYear",
  data() {
    return {
      years: [],
    };
  },
  methods: {
    async retrieveYears() {
      try {
        const response = await PaymentService.getPaymentsYears({currency: store.state.sprs.selectedCurrency || "UAH"});
        this.years = response.data;
        console.log(response.data);
      } catch (e) {
        console.log(e);
      }
    },
  },
  mounted() {
    this.retrieveYears();
  },
	watch: {
    '$store.state.sprs.selectedCurrency'() {
      this.retrieveYears();
    }
  }
}
</script>
