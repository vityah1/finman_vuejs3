<template>
  <div class="list row">
    <div class="col-md-8">
      <div class="input-group mb-3">
        <input
          type="text"
          class="form-control"
          placeholder="Search by Cat"
          v-model="cat"
        />
        <div class="input-group-append">
          <button
            class="btn btn-outline-secondary"
            type="button"
            @click="searchCat"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="container">
    <h4>Costs List</h4>
    <!-- <ul class="list-group"> -->
    <div
      class="row"
      :class="{ active: index == currentIndex }"
      v-for="(cost, index) in costs"
      :key="index"
      @click="setActiveCost(cost, index)"
    >
      <div class="col-1" v-b-modal.modal-1>
        {{ $moment(cost.rdate).format("DD.MMM") }}
      </div>
      <div class="col-2">{{ cost.sub_cat }}</div>
      <div class="col-1">{{ cost.desc }}</div>
      <div class="col-1">{{ cost.suma }} грн</div>
    </div>
    <!-- </ul> -->

    <!-- <button class="m-3 btn btn-sm btn-danger" @click="removeAllCosts">
        Remove All
      </button> -->
  </div>
  <div class="row">
    <div class="col-md-6">
      <div v-if="currentCost">
        <b-modal id="modal-1" title="BootstrapVue">
          <p class="my-4">Hello from modal!</p>

          <h4>Cost</h4>
          <div>
            <label><strong>Date:</strong></label> {{ currentCost.rdate }}
          </div>
          <div>
            <label><strong>Cat:</strong></label> {{ currentCost.cat }}
          </div>
          <div>
            <label><strong>Sub_Cat:</strong></label> {{ currentCost.sub_cat }}
          </div>
          <div>
            <label><strong>Description:</strong></label>
            {{ currentCost.desc }}
          </div>
          <div>
            <label><strong>Value:</strong></label>
            {{ $moment(currentCost.suma).format("DD.MM.YYYY") }}
          </div>

          <router-link
            :to="'/costs/' + currentCost.id"
            class="badge badge-warning"
            >Edit</router-link
          >
        </b-modal>
      </div>

      <div v-else>
        <br />
        <p>Please click on a Cost...</p>
      </div>
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
      cat: "",
    };
  },
  //   ,computed: { moment: () => moment }
  //   filter: {
  //     dtfilter(value) {
  //       if (value) {
  //         return moment(String(value)).format("MM/DD/YYYY hh:mm");
  //       }
  //     },
  //   },
  methods: {
    // formatDate(date) {
    //   return moment(date).format("DD.MM.YYYY")
    // },
    retrieveCosts() {
      CostDataService.getAll()
        .then((response) => {
          this.costs = response.data;
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },

    refreshList() {
      this.retrieveCosts();
      this.currentCost = null;
      this.currentIndex = -1;
    },

    setActiveCost(cost, index) {
      this.currentCost = cost;
      this.currentIndex = cost ? index : -1;
    },

    removeAllCosts() {
      CostDataService.deleteAll()
        .then((response) => {
          console.log(response.data);
          this.refreshList();
        })
        .catch((e) => {
          console.log(e);
        });
    },

    searchCat() {
      CostDataService.findByCat(this.cat)
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