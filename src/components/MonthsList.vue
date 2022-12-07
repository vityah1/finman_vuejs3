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
            @change="retrieveMonths(year, user)"
          >
            <option v-for="(y, index) in years" :value="y" :key="index">
              {{ y }}
            </option>
          </select>

          <select
          class="form-control"
          placeholder="user"
          v-model="user"
          id="user"
          name="user"
          @change="retrieveMonths(year, user)"
        >
          <option v-for="(u, index) in users" :value="u" :key="index">
            {{ u }}
          </option>
        </select>

        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-1 text-small">грн</div>
      <div class="col-4 h4 text-danger">
        {{ total.toLocaleString() }}
      </div>
      <div class="col-4">{{ total_cnt }}</div>
    </div>
    <div class="row bg-info">
      <div class="col-4">Місяць</div>
      <div class="col-4">Сума</div>
      <div class="col-4">К-сть</div>
    </div>

    <div class="row" v-for="(month, index) in months" :key="index">
      <router-link
        class="col-4"
        :to="{ name: 'catcosts', query: { year: year, month: month.month , user: user} }"
      >
        {{ month.month }}
      </router-link>
      <div class="col-4">{{ month.suma.toLocaleString() }}</div>
      <div class="col-4">{{ month.cnt }}</div>
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
      years: Array.from({ length: 9 }, (x, i) => i + 2014),
      user: this.$route.query.user || 'all',
      users: ['all', 'vik', 'tanya']      
    };
  },
  methods: {
    retrieveMonths(year, user) {
      CostDataService.getMonths(year, user)
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
    this.retrieveMonths(this.$route.params.year, this.$route.params.user);
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