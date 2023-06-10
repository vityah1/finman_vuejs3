<template>
  <div class="container">
    <header class="jumbotron">
      <h3>Mono</h3>
    </header>
    <div v-for="mono_user in mono_users" :key="mono_user.mono_user_id">
      <div>
        This api server webhook: <br><span class="">{{ mono_user.this_api_webhook }}</span>
        <hr>
        Current user webhook: <br>
        <input type="text" v-model="mono_user.webHookUrl" class="form-control mw-100">
        <input type="button" @click="save_webhook(mono_user.mono_user_id, mono_user.webHookUrl)" value="Set webhook" class="btn btn-primary">
        <hr>
        User info:
        {{ mono_user.name }}
        <table class="table ">
          <thead>
            <tr>
              <th>Type</th>
              <th>Card</th>
              <th>Balance, UAH</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in mono_user.filteredData" :key="item.id">
              <td>{{ item.type }}</td>
              <td>{{ item.maskedPan }}</td>
              <td>{{ item.balance / 100 }}</td>
              <!-- <td>{{ item.currencyCode}}</td> -->
            </tr>
          </tbody>
        </table>

        <br>
        <!-- {{ JSON.stringify(jsonResponse, null, 2) }} -->
      </div>
    </div>
  </div>
</template>

<script>
import Mono from "../services/Mono";

export default {
  name: "MonoSettings",
  data() {
    return {
      mono_users: [],
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
  },
  methods: {
    async save_webhook(mono_user_id, webHookUrl) {
      var data = {
        mono_user_id: mono_user_id,
        webHookUrl: webHookUrl
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
    Mono.GetMonoUsersInfo(this.currentUser.id).then(
      (response) => {
        this.mono_users = response.data;
        console.log(this.jsonResponse);
        this.mono_users.forEach((element) => {
          element.filteredData = element.accounts.filter(
            item => item.currencyCode > 25 && (
              item.type == 'black' || item.type == 'white'));
        });
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