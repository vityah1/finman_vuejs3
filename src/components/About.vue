<template>
  <div class="container">
    <header class="jumbotron">
      <h3>About</h3>
    </header>
    <div v-html="htmlContent"></div>
    {{ content }}
  </div>
</template>

<script>
import CostDataService from "../services/CostDataService";

export default {
  name: "About",
  data() {
    return {
      htmlContent: "",
    };
  },
  mounted() {
    CostDataService.getAbout().then(
      (response) => {
        this.htmlContent = response.data.data;
        console.log(this.htmlContent);
      },
      (error) => {
        this.content =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
      }
    );
  },
};
</script>