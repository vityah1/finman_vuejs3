<script lang="ts">
import { defineComponent } from 'vue';
import PaymentService from "../services/PaymentService";
import type { AxiosResponse } from 'axios';

interface AboutResponse {
  data: string;
}

export default defineComponent({
  name: "AboutPage",
  data() {
    return {
      htmlContent: "",
      content: "",
    };
  },
  mounted() {
    PaymentService.getAbout().then(
      (response: AxiosResponse<AboutResponse>) => {
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
});
</script>

<template>
  <div class="container">
    <header class="jumbotron">
      <h3>About</h3>
    </header>
    <div v-html="htmlContent"></div>
    {{ content }}
  </div>
</template>
