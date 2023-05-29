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
        <select
          class="form-control"
          placeholder="user"
          v-model="user"
          id="user"
          name="user"
        >
          <option v-for="(u, index) in users" :value="u" :key="index">
            {{ u }}
          </option>
        </select>
&nbsp;
        <div class="input-group-append">
          <button
            class="btn btn-outline-secondary"
            type="button"
            @click="retrieveCatCosts(year, month, user)"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="container">
    <!-- <h4>Cat Costs List [{{ year }}-{{ month }}]</h4> -->
    <!-- <ul class="list-group"> -->
    <div class="row">
      <div class="col-4 h4 text-success">Всього:</div>
      <div class="col-4 h4 text-danger">{{ total.toLocaleString() }}</div>
      <div class="col-4">{{ total_cnt }}</div>
    </div>
    <router-link
      class="row"
      v-for="(cat, index) in catcosts"
      :key="index"
      :to="{ name: 'payments', query: { category_id: cat.category_id, year: year, month: month, user: user } }"
    >
      <div class="col-4">{{ cat.name }}</div>
      <div class="col-4">{{ cat.amount.toLocaleString() }}</div>
      <div class="col-4">{{ cat.cnt }}</div>
    </router-link>
  </div>
</template>

<script>
import CostDataService from "../services/CostDataService";
// import moment from "moment";

export default {
  name: "cat-costs-list",
  data() {
    return {
      catcosts: [],
      q: "",
      year: this.$route.query.year || new Date().getFullYear(),
      month: this.$route.query.month || new Date().getMonth() + 1,
      // set list of years
      years: [],
      // set list of months
      months: Array.from({ length: 12 }, (x, i) => i + 1),
      total: 0,
      total_cnt: 0,
      user: this.$route.query.user || 'all',
      users: ['all', 'vik', 'tanya']
    };
  },
  methods: {
    retrieveCatCosts(year, month, user) {
      // year=this.year
      // month=this.month
      console.log(
        `retrieveCatCosts => year: ${this.year}, month: ${this.month}, user: ${this.user}`
      );
      CostDataService.getCatCosts({ year: year, month: month, user: user })
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
    getCat(cat) {
      CostDataService.getAll({ cat: cat })
        .then((response) => {
          this.catcosts = response.data;
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },
    retrieveYears() {
      CostDataService.getYears()
        .then((response) => {
          let filteredYears = response.data.filter(obj => obj.year > 1900);
          this.years = filteredYears.map(obj => obj.year);
          console.log(`retrieveYears => years => ${this.years}`);
        })
        .catch((e) => {
          console.log(e);
        });
    },    
    refreshList() {
      this.retrieveCatCosts();
    },
  },
  mounted() {
    let year = this.$route.query.year || new Date().getFullYear();
    let month = this.$route.query.month || new Date().getMonth() + 1;
    let user = this.$route.query.user || 'all';
    this.retrieveYears();
    this.retrieveCatCosts(year, month, user);
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