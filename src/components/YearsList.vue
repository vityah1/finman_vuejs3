<template>
  <div class="container">
    <div class="row">
      <div class="col-6">
        <h4>Years List</h4>
      </div>
    </div>
    <div class="row bg-info">
      <div class="col-2">Рік</div>
      <div class="col-2">Сума</div>
      <div class="col-2">К-сть</div>
    </div>

    <div class="row" v-for="(year, index) in years" :key="index">
      <router-link class="col-2" :to="'/months/' + year.year">
        {{ year.year }}
      </router-link>
      <div class="col-2">{{ year.suma.toLocaleString() }}</div>
      <div class="col-2">{{ year.cnt }}</div>
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