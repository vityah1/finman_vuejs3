<template>
  <div class="col-md-12">
    <div class="card card-container">
      <Form @submit="handleLogin" :validation-schema="schema" class="p-fluid">
        <div class="field">
          <label for="login">Ім'я користувача</label>
          <Field name="login" type="text" v-slot="{ field, errorMessage }">
            <InputText
              v-bind="field"
              id="login"
              :class="{ 'p-invalid': errorMessage }"
              placeholder="Введіть ім'я користувача"
            />
            <small v-if="errorMessage" class="p-error">{{ errorMessage }}</small>
          </Field>
        </div>

        <div class="field">
          <label for="password">Пароль</label>
          <Field name="password" type="password" v-slot="{ field, errorMessage }">
            <Password
              v-bind="field"
              id="password"
              :class="{ 'p-invalid': errorMessage }"
              placeholder="Введіть пароль"
              :feedback="false"
              toggleMask
            />
            <small v-if="errorMessage" class="p-error">{{ errorMessage }}</small>
          </Field>
        </div>

        <div class="field">
          <Button
            label="Увійти"
            type="submit"
            class="w-full clsMenu"
            :disabled="loading"
            :loading="loading"
            data-bs-toggle="collapse"
            data-bs-target=".navbar-collapse.show"
          />
        </div>

        <Message v-if="message" severity="error" :closable="false">
          {{ message }}
        </Message>
      </Form>
    </div>
  </div>
</template>

<script>
import { Form, Field } from "vee-validate";
import * as yup from "yup";
import PaymentService from "../../services/PaymentService";
import { refreshAllData } from "../../query-client";
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Message from 'primevue/message';

export default {
  name: "UserLogin",
  components: {
    Form,
    Field,
    Button,
    InputText,
    Password,
    Message,
  },
  data() {
    const schema = yup.object().shape({
      login: yup.string().required("Ім'я користувача обов'язкове!"),
      password: yup.string().required("Пароль обов'язковий!"),
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
    async loadInitialData() {
      console.log("loadInitialData: завантаження початкових даних після авторизації...");
      
      try {
        // Завантажуємо довідники паралельно
        await Promise.all([
          this.$store.dispatch("sprs/get_sources").catch(error => {
            console.error("Помилка завантаження sources:", error);
          }),
          this.$store.dispatch("sprs/get_currencies").catch(error => {
            console.error("Помилка завантаження currencies:", error);
          }),
          this.$store.dispatch("sprs/get_categories").catch(error => {
            console.error("Помилка завантаження categories:", error);
          })
        ]);
        
        console.log("loadInitialData: довідники завантажено");
        
        // Завантажуємо роки з платежами
        // Це критично важливо після авторизації, щоб дані були доступні в інтерфейсі
        try {
          await PaymentService.getPaymentsYears({currency: this.$store.state.sprs.selectedCurrency || "UAH"});
          console.log("loadInitialData: роки платежів успішно отримано після авторизації");
        } catch (error) {
          console.error("loadInitialData: помилка завантаження років платежів після авторизації:", error);
        }
        
        // Оновлюємо всі кеші запитів
        try {
          await refreshAllData();
          console.log("loadInitialData: всі кеші запитів оновлено після авторизації");
        } catch (error) {
          console.error("loadInitialData: помилка оновлення кешів запитів:", error);
        }
        
        console.log("loadInitialData: завантаження початкових даних завершено");
      } catch (error) {
        console.error("loadInitialData: загальна помилка завантаження даних:", error);
      }
    },
    async handleLogin(credentials) {
      this.loading = true;
      this.message = "";

      try {
        console.log("handleLogin: виконуємо авторизацію...");
        await this.$store.dispatch("auth/login", credentials);
        
        console.log("handleLogin: авторизація успішна, завантажуємо дані...");
        // Після успішної авторизації завантажуємо необхідні дані
        await this.loadInitialData();
        
        console.log("handleLogin: перенаправляємо користувача...");
        // Перенаправляємо на сторінку, з якої прийшли, або на профіль
        const returnUrl = this.$route.query.returnUrl || '/profile';
        this.$router.push(returnUrl);
      } catch (error) {
        this.loading = false;
        console.error("handleLogin: помилка авторизації:", error);
        this.message =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
      }
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