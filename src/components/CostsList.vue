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
    <h4>Costs List</h4>
    <div class="row bg-info">
      <div class="col-1" @click="retrieveCosts(1)">Дата</div>
      <div class="col-4" @click="retrieveCosts(2)">Розділ</div>
      <div class="col-4">Опис</div>
      <div class="col-2" @click="retrieveCosts(3)">Сума</div>
    </div>

    <div
      class="row"
      :class="{ active: index == currentIndex }"
      v-for="(cost, index) in costs"
      :key="index"
    >
      <router-link class="col-1" :to="'/costs/' + cost.id">
        {{ $moment(cost.rdate).format("DD.MMM") }}
      </router-link>
      <div class="col-4">{{ cost.sub_cat }}</div>
      <div class="col-4">{{ cost.mydesc }}</div>
      <div class="col-2">{{ cost.suma }} грн</div>
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
      currentCost: null,
      currentIndex: -1,
      q: "",
    };
  },
  methods: {
    retrieveCosts(sort) {
      CostDataService.getAll(sort)
        .then((response) => {
          this.costs = response.data;
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },

    refreshList() {
      this.retrieveCosts(3);
      this.currentCost = null;
      this.currentIndex = -1;
    },

    setActiveCost(cost, index) {
      this.currentCost = cost;
      this.currentIndex = cost ? index : -1;
    },

    searchCost() {
      CostDataService.FindCost(this.q)
        .then((response) => {
          this.costs = response.data;
          this.setActiveCost(null);
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },
  },
  mounted() {
    this.retrieveCosts(3);
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