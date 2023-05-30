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
import PaymentService from "../services/PaymentService";

export default {
  name: "About",
  data() {
    return {
      htmlContent: "",
    };
  },
  mounted() {
    PaymentService.getAbout().then(
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