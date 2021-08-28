<template>
  <div class="submit-form">
    <div v-if="!submitted">
      <div class="form-group">
        <label for="title">Title</label>
        <input
          type="text"
          class="form-control"
          id="title"
          required
          v-model="cost.title"
          name="title"
        />
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <input
          class="form-control"
          id="description"
          required
          v-model="cost.description"
          name="description"
        />
      </div>

      <button @click="saveCost" class="btn btn-success">Submit</button>
    </div>

    <div v-else>
      <h4>You submitted successfully!</h4>
      <button class="btn btn-success" @click="newCost">Add</button>
    </div>
  </div>
</template>

<script>
import CostDataService from "../services/CostDataService";

export default {
  name: "add-cost",
  data() {
    return {
      cost: {
        id: null,
        cat: "",
        description: "",
        published: false,
      },
      submitted: false,
    };
  },
  methods: {
    saveCost() {
      var data = {
        title: this.tutorial.title,
        description: this.tutorial.description,
      };

      CostDataService.create(data)
        .then((response) => {
          this.cost.id = response.data.id;
          console.log(response.data);
          this.submitted = true;
        })
        .catch((e) => {
          console.log(e);
        });
    },

    newCost() {
      this.submitted = false;
      this.cost = {};
    },
  },
};
</script>

<style>
.submit-form {
  max-width: 300px;
  margin: auto;
}
</style>