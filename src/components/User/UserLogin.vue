<template>
  <div class="col-md-12">
    <div class="card card-container">
      <!-- <img
        id="profile-img"
        src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
        class="profile-img-card"
      /> -->
      <Form @submit="handleLogin" :validation-schema="schema">
        <div class="form-group">
          <label for="login">Username</label>
          <Field name="login" type="text" class="form-control" />
          <ErrorMessage name="login" class="error-feedback" />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <Field name="password" type="password" class="form-control" />
          <ErrorMessage name="password" class="error-feedback" />
        </div>

        <div class="form-group">
          <button
            class="btn btn-primary btn-block clsMenu"
            :disabled="loading"
            data-bs-toggle="collapse"
            data-bs-target=".navbar-collapse.show"
          >
            <span
              v-show="loading"
              class="spinner-border spinner-border-sm"
            ></span>
            <span>Login</span>
          </button>
        </div>

        <div class="form-group">
          <div v-if="message" class="alert alert-danger" role="alert">
            {{ message }}
          </div>
        </div>
      </Form>
    </div>
  </div>
</template>

<script>
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import PaymentService from "../../services/PaymentService";
import { refreshAllData } from "../../query-client";

export default {
  name: "UserLogin",
  components: {
    Form,
    Field,
    ErrorMessage,
  },
  data() {
    const schema = yup.object().shape({
      login: yup.string().required("Username is required!"),
      password: yup.string().required("Password is required!"),
    });

    return {
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
  created() {
    if (this.loggedIn) {
      // Перенаправляємо або на returnUrl, або на профіль
      const returnUrl = this.$route.query.returnUrl || '/profile';
      this.$router.push(returnUrl);
    }
  },
  methods: {
    loadInitialData() {
      // Завантажуємо довідники
      this.$store.dispatch("sprs/get_sources");
      this.$store.dispatch("sprs/get_currencies");
      this.$store.dispatch("sprs/get_categories");
      
      // Завантажуємо роки з платежами
      // Це критично важливо після авторизації, щоб дані були доступні в інтерфейсі
      PaymentService.getPaymentsYears({currency: this.$store.state.sprs.selectedCurrency || "UAH"})
        .then(() => {
          console.log("Роки платежів успішно отримано після авторизації");
        })
        .catch(error => {
          console.error("Помилка завантаження років платежів після авторизації:", error);
        });
        
      // Оновлюємо всі кеші запитів
      refreshAllData()
        .then(() => {
          console.log("Всі кеші запитів оновлено після авторизації");
        })
        .catch(error => {
          console.error("Помилка оновлення кешів запитів:", error);
        });
    },
    handleLogin(credentials) {
      this.loading = true;

      this.$store.dispatch("auth/login", credentials).then(
        () => {
          // Після успішної авторизації завантажуємо необхідні дані
          this.loadInitialData();
          
          // Перенаправляємо на сторінку, з якої прийшли, або на профіль
          const returnUrl = this.$route.query.returnUrl || '/profile';
          this.$router.push(returnUrl);
        },
        (error) => {
          this.loading = false;
          this.message =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();
        }
      );
    },
  },
};
</script>

<style scoped>
label {
  display: block;
  margin-top: 10px;
}

.card-container.card {
  max-width: 350px !important;
  padding: 40px 40px;
}

.card {
  background-color: #f7f7f7;
  padding: 20px 25px 30px;
  margin: 0 auto 25px;
  margin-top: 50px;
  -moz-border-radius: 2px;
  -webkit-border-radius: 2px;
  border-radius: 2px;
  -moz-box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
  -webkit-box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
}

.profile-img-card {
  width: 96px;
  height: 96px;
  margin: 0 auto 10px;
  display: block;
  -moz-border-radius: 50%;
  -webkit-border-radius: 50%;
  border-radius: 50%;
}

.error-feedback {
  color: red;
}
</style>