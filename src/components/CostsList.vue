<template>
  <div class="list row">
    <div class="col-md-8">
      <div class="input-group mb-3">
        <input
          type="text"
          class="form-control"
          placeholder="Search"
          v-model="q"
        />
        <div class="input-group-append">
          <button
            class="btn btn-outline-secondary"
            type="button"
            @click="searchCost"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="container">
    <h4>
      Costs List
      <span v-if="this.$route.query.period"
        >[{{ this.$route.query.period }}]</span
      >
      <span v-if="this.$route.query.cat">[{{ this.$route.query.cat }}]</span>
      <span v-if="this.$route.query.year">[{{ this.$route.query.year }}]</span>
      <span v-if="this.$route.query.month"
        >[{{ this.$route.query.month }}]</span
      >
    </h4>
    <div class="row">
      <div class="col-4 h4 text-success">Всього:</div>
      <div class="col-2 h4 text-danger">{{ total }}</div>
      <div class="col-2">{{ total_cnt }}</div>
    </div>
    <div class="row bg-info">
      <div class="col-1" @click="sortCosts(1)">Дата</div>
      <div class="col-4" @click="sortCosts(2)">Розділ</div>
      <div class="col-4">Опис</div>
      <div class="col-2" @click="sortCosts(3)">Сума</div>
    </div>

    <div class="row" v-for="(cost, index) in costs" :key="index">
      <router-link class="col-1" :to="'/costs/' + cost.id">
        {{ $moment(cost.rdate).format("DD.MMM") }}
      </router-link>
      <div class="col-4">{{ cost.sub_cat }}</div>
      <div class="col-4">{{ cost.mydesc }}</div>
      <div class="col-2">{{ cost.suma }}</div>
    </div>
  </div>
</template>

<script>
import CostDataService from "../services/CostDataService";
// import moment from "moment";

export default {
  name: "costs-list",
  data() {
    return {
      costs: [],
      q: "",
      total: 0,
      total_cnt: 0,
    };
  },
  methods: {
    retrieveCosts() {
      let sort = this.$route.query.sort || "";
      let year = this.$route.query.year || "";
      let month = this.$route.query.month || "";
      let cat = this.$route.query.cat || "";

      CostDataService.FindCost({
        sort: sort,
        year: year,
        month: month,
        cat: cat,
      })
        // CostDataService.getAll({sort:sort})
        .then((response) => {
          this.costs = response.data;
          console.log(response.data);
          let total = 0;
          let total_cnt = 0;
          this.costs.forEach((val) => {
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

    refreshList() {
      this.retrieveCosts();
    },
    sortCosts(sort_table) {
      console.log(sort_table);
    },
    searchCost() {
      CostDataService.FindCost({ q: this.q })
        .then((response) => {
          this.costs = response.data;
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },
  },
  mounted() {
    this.retrieveCosts();
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