<template>
  <div class="list row">
    <div class="col-md-8">
      <div class="input-group mb-3">
        <select
          class="form-control"
          placeholder="year"
          v-model="year"
          id="year"
          name="year"
        >
          <option v-for="(y, index) in years" :value="y" :key="index">
            {{ y }}
          </option>
        </select>
&nbsp;
        <select
          class="form-control"
          placeholder="month"
          v-model="month"
          id="month"
          name="month"
        >
          <option v-for="(m, index) in months" :value="m" :key="index">
            {{ m }}
          </option>
        </select>
&nbsp;
        <!-- <select
          class="form-control"
          placeholder="user"
          v-model="user"
          id="user"
          name="user"
        >
          <option v-for="(u, index) in users" :value="u" :key="index">
            {{ u }}
          </option>
        </select> -->
&nbsp;
        <div class="input-group-append">
          <button
            class="btn btn-outline-secondary"
            type="button"
            @click="getPaymentsPeriod({year: year, month: month})"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="container">
    <b-table-simple hover small caption-top responsive>
      <caption>Table Head</caption>
      <colgroup>
    <col />
    <col />
    <col />
  </colgroup>      
      <b-thead head-variant="dark">
    <b-tr>
      <b-th>Total:</b-th>
      <b-th>{{ total.toLocaleString() }}</b-th>
      <b-th>{{ total_cnt }}</b-th>
    </b-tr>
    </b-thead>
    <b-tbody>
      <b-tr
      v-for="(cat, index) in catcosts"
      :key="index">
      <b-td>
        <router-link 
      :to="{ name: 'payments', query: { category_id: cat.category_id, year: year, month: month} }"
      >
        {{ cat.name }}
      </router-link>
      </b-td>
      <b-td>{{ cat.amount.toLocaleString() }}</b-td>
      <b-td>{{ cat.cnt }}</b-td>
    
  </b-tr>
  </b-tbody>
  </b-table-simple>
  </div>
</template>

<script>
import PaymentService from "../services/PaymentService";
// import moment from "moment";

export default {
  name: "PaymentPeriod",
  data() {
    return {
      catcosts: [],
      q: "",
      year: this.$route.query.year || new Date().getFullYear(),
      month: this.$route.query.month || new Date().getMonth() + 1,
      years: [],
      months: Array.from({ length: 12 }, (x, i) => i + 1),
      total: 0,
      total_cnt: 0,
      users: []
    };
  },
  methods: {
    async getPaymentsPeriod(data) {
      PaymentService.getPaymentsPeriod(data)
        .then((response) => {
          this.catcosts = response.data;
          console.log(response.data);
          let total = 0;
          let total_cnt = 0;
          this.catcosts.forEach((val) => {
            total += Number(val.amount);
            total_cnt += Number(val.cnt);
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
    async getPaymentsYears() {
      PaymentService.getPaymentsYears()
        .then((response) => {
          let filteredYears = response.data.filter(obj => obj.year > 1900);
          this.years = filteredYears.map(obj => obj.year);
          console.log(`getPaymentsYears => years => ${this.years}`);
        })
        .catch((e) => {
          console.log(e);
        });
    },    
  },
  mounted() {
    let data = {
      'year': this.$route.query.year || new Date().getFullYear(),
      'month': this.$route.query.month || new Date().getMonth() + 1
    };
    this.getPaymentsYears();
    console.log('mounted: ', data)
    this.getPaymentsPeriod(data);
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