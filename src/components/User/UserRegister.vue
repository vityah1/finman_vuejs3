<template>
  <div class="col-md-12">
    <div class="card card-container">
      <!-- <img
        id="profile-img"
        src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
        class="profile-img-card"
      /> -->
      <Form @submit="handleRegister" :validation-schema="schema">
        <div v-if="!successful">
          <div class="form-group">
            <label for="login">Ім'я користувача</label>
            <Field name="login" type="text" class="form-control" />
            <ErrorMessage name="login" class="error-feedback" />
          </div>

          <div class="form-group">
            <label for="password">Пароль</label>
            <Field name="password" type="password" class="form-control" />
            <ErrorMessage name="password" class="error-feedback" />
          </div>

          <div class="form-group">
          <label for="fullname">Повне ім'я</label>
          <Field name="fullname" type="text" class="form-control" />
          <ErrorMessage name="fullname" class="error-feedback" />
        </div>

        <div class="form-group">
          <label for="phone">Телефон</label>
          <Field name="phone" type="text" class="form-control" />
          <ErrorMessage name="phone" class="error-feedback" />
        </div>  

        <div class="form-group">
          <label for="email">Електронна пошта</label>
          <Field name="email" type="text" class="form-control" />
          <ErrorMessage name="email" class="error-feedback" />
        </div>  

          <div class="form-group">
            <button class="btn btn-primary btn-block" :disabled="loading">
              <span
                v-show="loading"
                class="spinner-border spinner-border-sm"
              ></span>
              Реєстрація
            </button>
          </div>
        </div>
      </Form>

      <div
        v-if="message"
        class="alert"
        :class="successful ? 'alert-success' : 'alert-danger'"
      >
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script>
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";

export default {
  name: "UserRegister",
  components: {
    Form,
    Field,
    ErrorMessage,
  },
  data() {
    const schema = yup.object().shape({
      login: yup
        .string()
        .required("Ім'я користувача обов'язкове!")
        .min(3, "Має бути не менше 3 символів!")
        .max(20, "Має бути не більше 20 символів!"),
      email: yup
        .string()
        .required("Електронна пошта обов'язкова!")
        .email("Невірний формат електронної пошти!")
        .max(50, "Має бути не більше 50 символів!"),
      password: yup
        .string()
        .required("Пароль обов'язковий!")
        .min(6, "Має бути не менше 6 символів!")
        .max(40, "Має бути не більше 40 символів!"),
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
    loggedIn() {
      return this.$store.state.auth.status.loggedIn;
    },
  },
  mounted() {
    if (this.loggedIn) {
      this.$router.push({name:"profile"});
    }
  },
  methods: {
    handleRegister(user) {
      this.message = "";
      this.successful = false;
      this.loading = true;

      this.$store.dispatch("auth/register", user).then(
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
    },
  },
};
</script>

<style scoped>
</style>