<template>
  <div class="container">
    <h4>
      <span @click="this.$router.go(-1)">&lt;=</span> Costs List
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
      <div class="col-2 h4 text-danger">{{ total.toLocaleString() }}</div>
      <div class="col-2">{{ total_cnt }}</div>
    </div>
    <div class="row bg-info">
      <div class="col-2" @click="sortCosts(1)">Дата</div>
      <div class="col-4" @click="sortCosts(2)">Розділ</div>
      <div class="col-4">Опис</div>
      <div class="col-2" @click="sortCosts(3)">Сума</div>
    </div>

    <div class="row" v-for="(cost, index) in costs" :key="index">
      <div class="col-2">
        <router-link :to="'/costs/' + cost.id">
          {{ $moment(cost.rdate).format("DD.MMM") }}
        </router-link>
      </div>
      <div class="col-4">{{ cost.sub_cat }}</div>
      <div class="col-4">{{ cost.mydesc }}</div>
      <div class="col-2">{{ cost.suma.toLocaleString() }}</div>
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
      q: this.$route.query.q || "",
      total: 0,
      total_cnt: 0,
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
  },
  methods: {
    retrieveCosts() {
      let sort = this.$route.query.sort || "";
      let year = this.$route.query.year || "";
      let month = this.$route.query.month || "";
      let cat = this.$route.query.cat || "";
      let q = this.$route.query.q || "";
      console.log(q, year, month, cat, sort);
      CostDataService.showCost({
        sort: sort,
        year: year,
        month: month,
        cat: cat,
        q: q,
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
      CostDataService.showCost({ q: this.q })
        .then((response) => {
          this.costs = response.data;
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },
  },
  watch: {
    $route(to, from) {
      // react to route changes...
      if (to !== from) {
        location.reload();
      }
    },
  },
  mounted() {
    if (!this.currentUser) {
      this.$router.push("/login");
    }
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