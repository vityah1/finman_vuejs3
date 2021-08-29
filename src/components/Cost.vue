<template>
  <div v-if="currentCost" class="edit-form">
    <!-- <div class="edit-form"> -->
    <h4>Edit Cost</h4>
    <form>
      <div class="form-group">
        <label for="cat">date</label>
        <input
          type="text"
          class="form-control"
          id="rdate"
          v-model="currentCost.rdate"
        />
      </div>
      <div class="form-group">
        <label for="cat">Cat</label>
        <input
          type="text"
          class="form-control"
          id="cat"
          v-model="currentCost.cat"
        />
      </div>

      <div class="form-group">
        <label for="cat">Sub Cat</label>
        <input
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
    };
  },
  methods: {
    getCost(id) {
      CostDataService.get(id)
        .then((response) => {
          response.data[0]["rdate"] = moment(response.data[0]["rdate"]).format(
            "DD.MM.YYYY"
          );
          this.currentCost = response.data[0];
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
          this.message = "The cost was updated successfully!";
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
  },
  mounted() {
    this.message = "";
    this.getCost(this.$route.params.id);
  },
};
</script>

<style>
.edit-form {
  max-width: 300px;
  margin: auto;
}
</style>