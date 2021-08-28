<template>
  <div v-if="currentCost" class="edit-form">
    <h4>Cost</h4>
    <form>
      <div class="form-group">
        <label for="title">Cat</label>
        <input
          type="text"
          class="form-control"
          id="title"
          v-model="currentCost.title"
        />
      </div>
      <div class="form-group">
        <label for="description">Description</label>
        <input
          type="text"
          class="form-control"
          id="description"
          v-model="currentCost.description"
        />
      </div>

      <div class="form-group">
        <label><strong>Status:</strong></label>
        {{ currentCost.published ? "Published" : "Pending" }}
      </div>
    </form>

    <button
      class="badge badge-primary mr-2"
      v-if="currentCost.published"
      @click="updatePublished(false)"
    >
      UnPublish
    </button>
    <button
      v-else
      class="badge badge-primary mr-2"
      @click="updatePublished(true)"
    >
      Publish
    </button>

    <button class="badge badge-danger mr-2" @click="deleteCost">Delete</button>

    <button type="submit" class="badge badge-success" @click="updateCost">
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
          this.currentCost = response.data;
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },

    updatePublished(status) {
      var data = {
        id: this.currentCost.id,
        title: this.currentCost.title,
        description: this.currentCost.description,
        published: status,
      };

      CostDataService.update(this.currentCost.id, data)
        .then((response) => {
          console.log(response.data);
          this.currentCost.published = status;
          this.message = "The status was updated successfully!";
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