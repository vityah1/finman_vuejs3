<template>
  <div class="container">
    <header class="jumbotron">
      <h3>Mono payments:</h3>
    </header>
    <div>
      <lable for="start_date">Start date: </lable><br>
      <input type="text" v-model="start_date" class="form-control"><br>
      <lable for="end_date">End date: </lable><br>
      <input type="text" v-model="end_date" class="form-control"><br>

      <lable for="mono_user_id" class="form-check-label">Mono user: </lable><br>
      <select v-model="mono_user_id" class="form-select">
        <option value="">All</option>
        <option 
        v-for="mono_user in mono_users" :key="mono_user.id"
        :value="mono_user.id"
        >{{mono_user.name}}</option>
        </select>
      
      <lable for="mode" class="form-check-label">Please select action: </lable><br>
      <select v-model="mode" class="form-select">
        <option value="show" selected>show</option>
        <option value="import">import</option>
        <option value="sync">sync</option>
        </select>
        <br><br>
      <input type="button" @click="getMonoPayments" value="Get payments" class="btn btn-primary">
      <hr>
      <p v-if="HTMLResponse">
        Payments info:
      </p>
      <p v-html="HTMLResponse"></p>
      <br>

    </div>
    {{ content }}
  </div>
</template>

<script>
import MonoService from "../services/MonoService";
import MonoUsersService from '../services/MonoUsersService';

export default {
  name: "MonoPayments",
  data() {
    return {
      HTMLResponse: '',
      content: '',
      start_date: '',
      end_date: '',
      mode: 'show',
      mono_users: [],
      mono_user_id: '',
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
  },
  mounted() {
    this.getMonoUsers();
  },
  methods: {
    async getMonoPayments() {
      var data = {
        user: this.currentUser.id,
        start_date: this.start_date,
        end_date: this.end_date,
        mode: this.mode,
        mono_user_id: this.mono_user_id,
      };
      console.log(data);
      MonoService.getMonoPayments(data)
        .then((response) => {
          this.HTMLResponse = response.data;
        })
        .catch((e) => {
          console.log(e);
          this.content = e;
        });
    },
    async getMonoUsers() {
      MonoUsersService.getMonoUsers()
      .then((response) => {this.mono_users = response.data;})
      .catch((e) => {
          console.log(e);
          this.content = e;
        });
    },     
  },
};
</script>