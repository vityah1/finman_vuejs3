<template>
  <div class="container">
    <header class="jumbotron">
      <h3>
        <strong>{{ currentUser.login }}</strong> [{{ currentUser.user_id }}] Profile
      </h3>
    </header>

    <Form @submit="editUser" :validation-schema="schema">

        <div class="form-group">
          <Field name="user_id" type="hidden" v-model="currentUser.user_id" />
        </div>

        <div class="form-group">
          <label for="login">Username</label>
          <Field name="login" type="text" class="form-control" v-model="currentUser.login"/>
          <ErrorMessage name="login" class="error-feedback" />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <Field name="password" type="password" class="form-control" />
          <ErrorMessage name="password" class="error-feedback" />
        </div>

        <div class="form-group">
          <label for="fullname">Full name</label>
          <Field name="fullname" type="text" class="form-control" v-model="currentUser.fullname" />
          <ErrorMessage name="fullname" class="error-feedback" />
        </div>

        <div class="form-group">
          <label for="phone">Phone</label>
          <Field name="phone" type="text" class="form-control" v-model="currentUser.phone"/>
          <ErrorMessage name="phone" class="error-feedback" />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <Field name="email" type="text" class="form-control" v-model="currentUser.email"/>
          <ErrorMessage name="email" class="error-feedback" />
        </div>

        <div class="form-group">
          <button class="btn btn-primary btn-block" :disabled="loading">
            <span v-show="loading" class="spinner-border spinner-border-sm"></span>
            Edit
          </button>
        </div>
    </Form>
    <div v-if="message" class="alert" :class="successful ? 'alert-success' : 'alert-danger'">
      {{ message }}
    </div>
  </div>
</template>

<script>
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";

export default {
  name: "UserProfile",
  components: {
    Form,
    Field,
    ErrorMessage,
  },

  data() {
    const schema = yup.object().shape({
      user_id: yup
        .string(),
      login: yup
        .string()
        .required("Username is required!")
        .min(3, "Must be at least 3 characters!")
        .max(20, "Must be maximum 20 characters!"),
      email: yup
        .string()
        .required("Email is required!")
        .email("Email is invalid!")
        .max(50, "Must be maximum 50 characters!"),
      password: yup
        .string()
        .required("Password is required!")
        .min(6, "Must be at least 6 characters!")
        .max(40, "Must be maximum 40 characters!"),
      fullname: yup
        .string(),
      phone: yup
        .string(),
    });
    return {
      successful: false,
      loading: false,
      message: "",
      schema,
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
  },
  mounted() {
    if (!this.currentUser) {
      this.$router.push({ name: "login" });
    }
  },
  methods: {
    editUser(user) {
      this.message = "";
      this.successful = false;
      this.loading = true;
      console.log('user_id: ' + user.user_id)

      this.$store.dispatch("auth/edit", user).then(
        (data) => {
          this.message = data.message;
          this.successful = true;
          this.loading = false;
        },
        (error) => {
          this.message =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();
          this.successful = false;
          this.loading = false;
        }
      );
    }
  }
};
</script>