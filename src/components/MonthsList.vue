<template>
  <div class="container">
    <div class="row">
      <div class="col-3">
        <span>Months List [{{ year }}] y</span>
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
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-2 h4 text-success">Всього:</div>
      <div class="col-2 h4 text-danger">{{ total.toLocaleString() }}</div>
      <div class="col-2">{{ total_cnt }}</div>
    </div>
    <div class="row bg-info">
      <div class="col-2">Місяць</div>
      <div class="col-2">Сума</div>
      <div class="col-2">К-сть</div>
    </div>

    <div class="row" v-for="(month, index) in months" :key="index">
      <router-link
        class="col-2"
        :to="{ name: 'catcosts', query: { year: year, month: month.month } }"
      >
        {{ month.month }}
      </router-link>
      <div class="col-2">{{ month.suma.toLocaleString() }}</div>
      <div class="col-2">{{ month.cnt }}</div>
    </div>
  </div>
</template>

<script>
import CostDataService from "../services/CostDataService";
// import moment from "moment";

export default {
  name: "months-list",
  data() {
    return {
      months: [],
      year: this.$route.params.year,
      total: 0,
      total_cnt: 0,
      years: Array.from({ length: 8 }, (x, i) => i + 2014),
    };
  },
  methods: {
    retrieveMonths(year) {
      CostDataService.getMonths(year)
        // CostDataService.getAll({sort:sort})
        .then((response) => {
          this.months = response.data;
          console.log(response.data);
          let total = 0;
          let total_cnt = 0;
          this.months.forEach((val) => {
            total += Number(val.suma);
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