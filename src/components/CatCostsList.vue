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
    <h4>Cat Costs List</h4>
    <!-- <ul class="list-group"> -->
    <div
      class="row"
      :class="{ active: index == currentIndex }"
      v-for="(cat, index) in catcosts"
      :key="index"
      @click="getCat(cat.cat)"
    >
      <div class="col-4">{{ cat.cat }}</div>
      <div class="col-2">{{ cat.suma }} грн</div>
      <div class="col-2">{{ cat.cnt }}</div>
    </div>
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
      currentCat: null,
      currentIndex: -1,
      q: "",
    };
  },
  methods: {
    retrieveCatCosts() {
      CostDataService.getCatCosts()
        .then((response) => {
          this.catcosts = response.data;
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },

    refreshList() {
      this.retrieveCatCosts();
      this.currentCat = null;
      this.currentIndex = -1;
    },
  },
  mounted() {
    this.retrieveCatCosts();
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