<template>
  <div class="container">
    <alert-component ref="myAlert"></alert-component>
    <b-table-simple hover small caption-top responsive class="years-table">
<!--      <caption>Table Head</caption>-->
      <colgroup>
    <col style="width: 20%;" />
    <col style="width: 50%;" />
    <col style="width: 30%;" />
  </colgroup>
      <b-thead head-variant="dark">
    <b-tr>
      <b-th class="text-center">Year</b-th>
      <b-th class="text-end">Amount</b-th>
      <b-th class="text-center">Count</b-th>
    </b-tr>
  </b-thead>
  <b-tbody v-if="(years.length > 0)">
    <b-tr v-for="(year, index) in years" :key="index">
      <b-td class="text-center">
      <router-link
        class="year-link fw-bold"
        :to="{ name: 'payments_year', params: { year: year.year } }"
        >
        {{ year.year }}
      </router-link>
    </b-td>
      <b-td class="text-end amount-cell">{{ year.amount.toLocaleString() }} {{ $store.state.sprs.selectedCurrency || "UAH" }}</b-td>
      <b-td class="text-center">{{ year.cnt }}</b-td>
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
import { getErrorMessage, logError } from '@/utils/errorHandler';

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
        // Перевіряємо чи користувач авторизований
        if (this.$store.state.auth.status?.loggedIn) {
          console.log('Завантажуємо роки платежів... (користувач авторизований)');
          const response = await PaymentService.getPaymentsYears({currency: store.state.sprs.selectedCurrency || "UAH"});
          this.years = response.data;
          console.log('Роки платежів завантажено:', response.data);
          // Debug output for checking data structure
          if (response.data && response.data.length > 0) {
            console.log('Перший елемент:', response.data[0]);
            console.log('Поле year першого елемента:', response.data[0].year);
          }
        } else {
          console.log('Користувач не авторизований, не завантажуємо роки платежів');
          this.years = [];
        }
      } catch (e) {
        logError(e, "Pmt retrieveYears");
        const errorMessage = getErrorMessage(e, "Помилка завантаження років платежів");
        if (this.$refs.myAlert) {
          this.$refs.myAlert.showAlert("danger", errorMessage);
        }
        this.years = [];
      }
    },
  },
  mounted() {
    this.retrieveYears();
  },
  created() {
    // Підписуємося на зміну стану авторизації
    this.$store.subscribe((mutation, state) => {
      // Якщо зміна стосується авторизації
      if (mutation.type === 'auth/loginSuccess') {
        console.log('Користувач авторизувався, оновлюємо список років');
        // Оновлюємо список років
        this.retrieveYears();
      }
    });
  },
	watch: {
    '$store.state.sprs.selectedCurrency'() {
      this.retrieveYears();
    }
  }
}
</script>

<style scoped>
.years-table {
  margin-top: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.year-link {
  text-decoration: none;
  color: #007bff;
  font-size: 1.1em;
  transition: color 0.2s ease;
}

.year-link:hover {
  color: #0056b3;
  text-decoration: underline;
}

.amount-cell {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #28a745;
  font-size: 1.05em;
}

.years-table tbody tr:hover {
  background-color: #f8f9fa;
}

.years-table th {
  font-weight: 600;
  border-bottom: 2px solid #495057;
}

.years-table td {
  padding: 12px 8px;
  vertical-align: middle;
}
</style>
