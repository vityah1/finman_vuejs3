<template>
  <div class="container">
    <header class="jumbotron">
      <h3>Mono</h3>
    </header> 
    <div>
      This api server webhook: <br><span class="">{{this_api_webhook}}</span>
      <hr>
      Current user webhook: <br>
      <input type="text" v-model="webhook" class="form-control mw-100"> 
      <input type="button" @click="save_webhook" value = "Set webhook" class="btn btn-primary">
      <hr>
      User info:
      {{jsonResponse.name}}
      <table class="table ">
    <thead>
      <tr>
        <th>Type</th>
        <th>Card</th>
        <th>Balance, UAH</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in filteredData" :key="item.id">
        <td>{{ item.type }}</td>
        <td>{{ item.maskedPan }}</td>
        <td>{{ item.balance/100 }}</td>
        <!-- <td>{{ item.currencyCode}}</td> -->
      </tr>
    </tbody>
  </table>

    <br>
    <!-- {{ JSON.stringify(jsonResponse, null, 2) }} -->
    </div>
    {{ content }}
  </div>
</template>

<script>
import Mono from "../services/Mono";

export default {
  name: "MonoSettings",
  data() {
    return {
      jsonResponse: {},
      webhook: '',
      content: '',
      this_api_webhook: '',
      filteredData: [],
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
  //   filteredData() {
  //   // Apply the condition to filter the data
  //   return this.jsonResponse.accounts.filter(item => item.currencyCode == 980);
  // }
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
        const accounts = this.jsonResponse.accounts;
        console.log('accounts: ', accounts)
        this.filteredData = accounts.filter(
          item => item.currencyCode > 25 && (
            item.type == 'black' || item.type == 'white'));

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