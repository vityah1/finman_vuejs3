<template>
  <div class="container">
    <header class="jumbotron">
      <h3>Mono</h3>
    </header> 
    <div>
      this api server webhook: {{this_api_webhook}}
      <hr>
      current user webhook: 
      <input type="text" v-model="webhook">
      <input type="button" @click="save_webhook" value = "Set webhook">
      <hr>
      user info:
      {{ JSON.stringify(jsonResponse, null, 2) }}
    <br>
    
    </div>
    {{ content }}
  </div>
</template>

<script>
import Mono from "../services/Mono";

export default {
  name: "Mono",
  data() {
    return {
      jsonResponse: {},
      webhook: '',
      content: '',
      this_api_webhook: '',
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
  },  
  methods: {
    async save_webhook() {
      var data = {
        user: this.currentUser.username,
        webhook: this.webhook       
      };
      console.log(data);
      Mono.setWebhook(data)
        .then((response) => {
          this.content = JSON.stringify(response.data, null, 2);
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  },
  mounted() {
    Mono.getWebhook(this.currentUser.username).then(
      (response) => {
        this.jsonResponse = response.data;
        // console.log(this.jsonResponse);
        this.webhook = response.data.webHookUrl;
        this.this_api_webhook = response.data.this_api_webhook;
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