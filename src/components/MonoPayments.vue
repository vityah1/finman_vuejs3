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
      <lable for="import_mode" class="form-check-label">Import: </lable><br>
      <input type="checkbox" v-model="import_mode" class="form-check-input"><br><br>
      <input type="button" @click="get_payments" value="Get payments" class="btn btn-primary">
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
import Mono from "../services/Mono";

export default {
  name: "Mono",
  data() {
    return {
      HTMLResponse: '',
      content: '',
      start_date: '',
      end_date: '',
      import_mode: false
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
  },
  methods: {
    async get_payments() {
      var data = {
        user: this.currentUser.username,
        start_date: this.start_date,
        end_date: this.end_date,
        import_mode: this.import_mode,
      };
      console.log(data);
      Mono.getPayments(data)
        .then((response) => {
          this.HTMLResponse = response.data;
        })
        .catch((e) => {
          console.log(e);
          this.content = e;
        });
    }
  },
};
</script>