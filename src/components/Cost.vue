<template>
  <div v-if="currentCost" class="edit-form">
    <!-- <div class="edit-form"> -->
    <h4>Edit Cost</h4>
    <form>
      <div class="form-group">
        <label for="cat">date</label>
        <input
          type="date"
          class="form-control"
          id="rdate"
          v-model="currentCost.rdate"
        />
      </div>
      <div class="form-group">
        <label for="cat">Cat</label>
        <select
          v-model="currentCost.cat"
          class="form-control"
          id="cat"
          name="cat"
          @change="pullSubCats(currentCost.cat)"
        >
          <option
            v-for="cat in catsOptions"
            :value="cat.name"
            :key="cat.id"
            :selected="cat.name === currentCost.cat"
          >
            {{ cat.name }}
            <!-- <span v-if="cat.sub_cat">[{{ cat.sub_cat }}]</span> -->
          </option>
        </select>

        <!-- <input
          type="text"
          class="form-control"
          id="cat"
          v-model="currentCost.cat"
        /> -->
      </div>

      <div class="form-group">
        <label for="cat">Sub Cat</label>
        <select
          v-if="
            subcatsOptions.some((e) => e.name == currentCost.sub_cat) ||
            currentCost.sub_cat == ''
          "
          class="form-control"
          id="sub_cat"
          name="sub_cat"
          v-model="currentCost.sub_cat"
        >
          <option value=""></option>
          <option
            v-for="sub_cat in subcatsOptions"
            :value="sub_cat.name"
            :key="sub_cat.id"
            :selected="sub_cat.name === currentCost.sub_cat"
          >
            {{ sub_cat.name }}
          </option>
        </select>

        <input
          :load="
            log(
              'input -> subcatsOptions.includes(currentCost.sub_cat): ' +
                Object.values(subcatsOptions).includes(currentCost.sub_cat) +
                ', subcatsOptions.some(e=>e.id==currentCost.sub_cat):' +
                subcatsOptions.some((e) => e.name == currentCost.sub_cat) +
                ', subcatsOptions.map(a=>a.id).includes(currentCost.sub_cat):' +
                subcatsOptions
                  .map((a) => a.name)
                  .includes(currentCost.sub_cat) +
                ', subcatsOptions: ' +
                Object.values(subcatsOptions).toString() +
                ', currentCost.sub_cat: ' +
                currentCost.sub_cat +
                ', subcatsOptions.map((a)=>a.id):' +
                subcatsOptions.map((a) => a[a.name])
            )
          "
          v-if="
            !(
              subcatsOptions.some((e) => e.name == currentCost.sub_cat) ||
              currentCost.sub_cat == ''
            )
          "
          type="text"
          class="form-control"
          id="sub_cat"
          v-model="currentCost.sub_cat"
        />
      </div>
      <div class="form-group">
        <label for="mydesc">Description</label>
        <input
          type="text"
          class="form-control"
          id="mydesc"
          v-model="currentCost.mydesc"
        />
      </div>

      <div class="form-group">
        <label><strong>Value:</strong></label>
        <input
          type="text"
          class="form-control"
          id="suma"
          v-model="currentCost.suma"
        />
      </div>
    </form>

    <!-- <button
      class="badge badge-primary mr-2"
      v-if="currentCost.suma"
      @click="updatePublished(false)"
    >
      UnPublish
    </button> -->
    <!-- <button
      v-else
      class="badge badge-primary mr-2"
      @click="updatePublished(true)"
    >
      Publish
    </button> -->
    <p></p>
    <button class="btn btn-danger mr-2" @click="deleteCost">Delete</button>
    &nbsp;&nbsp;
    <button type="submit" class="btn btn-success" @click="updateCost">
      Update
    </button>
    <p>{{ message }}</p>
  </div>

  <div v-else>
    <br />
    <p>Please click on a Cost...</p>
  </div>
</template>

<script>
import CostDataService from "../services/CostDataService";
import moment from "moment";

export default {
  name: "cost",
  data() {
    return {
      currentCost: null,
      message: "",
      catsOptions: [],
      subcatsOptions: [],
    };
  },
  methods: {
    async pullCats() {
      console.log("exec pullCats");
      CostDataService.cats()
        .then((response) => {
          this.catsOptions = response.data;
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },
    async pullSubCats(cat) {
      // var cat = this.cat.val();
      console.log("exec pullSubCats");
      CostDataService.subcats(cat)
        .then((response) => {
          this.subcatsOptions = response.data;
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },
    async getCost(id) {
      CostDataService.get(id)
        .then((response) => {
          response.data[0]["rdate"] = moment(response.data[0]["rdate"]).format(
            "YYYY-MM-DD"
          );
          this.currentCost = response.data[0];
          this.pullCats();
          this.pullSubCats(this.currentCost.cat);
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },

    updateCost() {
      CostDataService.update(this.currentCost.id, this.currentCost)
        .then((response) => {
          console.log(response.data);
          this.message = response.data;
        })
        .catch((e) => {
          console.log(e);
        });
    },

    deleteCost() {
      CostDataService.delete(this.currentCost.id)
        .then((response) => {
          console.log(response.data);
          this.$router.push({ name: "costs" });
        })
        .catch((e) => {
          console.log(e);
        });
    },
    log(item) {
      console.log(item);
    },
    elExists(arr, val) {
      return arr.some(function (el) {
        console.log(el.name);
        return el.name === val;
      });
    },
  },
  mounted() {
    this.message = "";
    this.getCost(this.$route.params.id);
    // this.pullCats();

    // console.log(
    //   "currentCost.cat: " +
    //     this.currentCost.cat +
    //     ", catsOptions[currentCost.cat]: " +
    //     this.catsOptions[currentCost.cat]
    // );
    // this.pullSubCats(this.catsOptions[this.currentCost.cat]);
  },
};
</script>

<style>
.edit-form {
  max-width: 300px;
  margin: auto;
}
</style>