<template>
  <div class="container">
    <div class="row bg-info">
      <div class="col-2">Рік</div>
      <div class="col-4">Сума</div>
      <div class="col-3">К-сть</div>
    </div>

    <div class="row" v-for="(year, index) in years" :key="index">
      <router-link
        class="col-2"
        :to="{ name: 'payments_months', params: { year: year.year } }"
      >
        {{ year.year }}
      </router-link>
      <div class="col-4">{{ year.amount.toLocaleString() }}</div>
      <div class="col-3">{{ year.cnt }}</div>
    </div>
  </div>
</template>

<script>
import CostDataService from "../services/CostDataService";
// import moment from "moment";

export default {
  name: "years-list",
  data() {
    return {
      years: [],
    };
  },
  methods: {
    retrieveYears() {
      CostDataService.getYears()
        // CostDataService.getAll({sort:sort})
        .then((response) => {
          this.years = response.data;
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },
  },
  mounted() {
    this.retrieveYears();
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