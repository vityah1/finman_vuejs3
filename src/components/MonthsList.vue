<template>
  <div class="container">
    <h4>Months List for {{ year }} year</h4>
    <div class="row bg-info">
      <div class="col-2">Місяць</div>
      <div class="col-2">Сума</div>
      <div class="col-2">К-сть</div>
    </div>

    <div class="row" v-for="(month, index) in months" :key="index">
      <router-link
        class="col-2"
        :to="'/catcosts?year=' + year + '&month=' + month.month"
      >
        {{ month.month }}
      </router-link>
      <div class="col-2">{{ month.suma }}</div>
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
    };
  },
  methods: {
    retrieveMonths(year) {
      CostDataService.getMonths(year)
        // CostDataService.getAll({sort:sort})
        .then((response) => {
          this.months = response.data;
          console.log(response.data);
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