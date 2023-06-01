<template>
  <div class="container">
    <div class="row">
      <div class="col-3">
        <span>Year:</span>
      </div>
      <div class="col-3">
        <div class="input-group mb-3">
          <select
            class="form-control"
            placeholder="year"
            v-model="year"
            id="year"
            name="year"
            @change="retrieveMonths(year)"
          >
            <option v-for="(y, index) in years" :value="y" :key="index">
              {{ y }}
            </option>
          </select>
          &nbsp;
          <!-- <select
          class="form-control"
          placeholder="user"
          v-model="user"
          id="user"
          name="user"
          @change="retrieveMonths(year)"
        >
          <option v-for="(u, index) in users" :value="u" :key="index">
            {{ u }}
          </option>
        </select> -->

        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-1 text-small">UAH</div>
      <div class="col-4 h4 text-danger">
        {{ total.toLocaleString() }}
      </div>
      <div class="col-4">{{ total_cnt }}</div>
    </div>
    <b-table-simple hover small caption-top responsive>
      <caption>Table Head</caption>
      <colgroup>
    <col />
    <col />
    <col />
  </colgroup>      
      <b-thead head-variant="dark">
    <b-tr>
      <b-th>Month</b-th>
      <b-th>Amount</b-th>
      <b-th>Count</b-th>
    </b-tr>
    </b-thead>
    <b-tbody v-if="(months.length > 0)">
    <b-tr v-for="(month, index) in months" :key="index">
      <b-td>
      <router-link
        class="col-4"
        :to="{ name: 'payments_period', query: { year: year, month: month.month} }"
      >
        {{ month.month }}
      </router-link>
    </b-td>
  <b-td>{{ month.amount.toLocaleString() }}</b-td>
<b-td>{{ month.cnt }}</b-td>
  </b-tr>
    </b-tbody>
    <b-tfoot><b-tr><b-td collspan="3"></b-td></b-tr></b-tfoot>
    </b-table-simple>
    <div v-if="(months.length == 0)">Data loading...</div>
</div>
</template>

<script>
import PaymentService from "../services/PaymentService";
// import moment from "moment";

export default {
  name: "PaymentsByYear",
  data() {
    return {
      months: [],
      year: this.$route.params.year,
      total: 0,
      total_cnt: 0,
      years: Array.from({ length: 10 }, (x, i) => i + 2014),
      users: []      
    };
  },
  methods: {
    async retrieveMonths(year) {
      PaymentService.getPaymentsByYear(year)
        .then((response) => {
          this.months = response.data;
          console.log(response.data);
          let total = 0;
          let total_cnt = 0;
          this.months.forEach((val) => {
            total += Number(val.amount);
            total_cnt += 1;
            //or if you pass float numbers , use parseFloat()
          });
          this.total = total;
          this.total_cnt = total_cnt;
          console.log(total);
        })
        .catch((e) => {
          console.log(e);
        });
    },
  },
  mounted() {
    this.retrieveMonths(this.$route.params.year);
  },
};
</script>

<style>
.list {
  text-align: left;
  max-width: 750px;
  margin: auto;
}
</style>