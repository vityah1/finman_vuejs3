<template>
  <div class="col-md-12">
    <div class="card card-container">
      <Form @submit="handleRegister" :validation-schema="schema" class="p-fluid">
        <div v-if="!successful">
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
                toggleMask
              />
              <small v-if="errorMessage" class="p-error">{{ errorMessage }}</small>
            </Field>
          </div>

          <div class="field">
            <label for="fullname">Повне ім'я</label>
            <Field name="fullname" type="text" v-slot="{ field, errorMessage }">
              <InputText
                v-bind="field"
                id="fullname"
                :class="{ 'p-invalid': errorMessage }"
                placeholder="Введіть повне ім'я"
              />
              <small v-if="errorMessage" class="p-error">{{ errorMessage }}</small>
            </Field>
          </div>

          <div class="field">
            <label for="phone">Телефон</label>
            <Field name="phone" type="text" v-slot="{ field, errorMessage }">
              <InputText
                v-bind="field"
                id="phone"
                :class="{ 'p-invalid': errorMessage }"
                placeholder="Введіть номер телефону"
              />
              <small v-if="errorMessage" class="p-error">{{ errorMessage }}</small>
            </Field>
          </div>

          <div class="field">
            <label for="email">Електронна пошта</label>
            <Field name="email" type="text" v-slot="{ field, errorMessage }">
              <InputText
                v-bind="field"
                id="email"
                :class="{ 'p-invalid': errorMessage }"
                placeholder="Введіть email"
              />
              <small v-if="errorMessage" class="p-error">{{ errorMessage }}</small>
            </Field>
          </div>

          <div class="field">
            <Button
              label="Реєстрація"
              type="submit"
              class="w-full"
              :disabled="loading"
              :loading="loading"
            />
          </div>
        </div>
      </Form>

      <Message v-if="message" :severity="successful ? 'success' : 'error'" :closable="false">
        {{ message }}
      </Message>
    </div>
  </div>
</template>

<script>
import { Form, Field } from "vee-validate";
import * as yup from "yup";
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Message from 'primevue/message';

export default {
  name: "UserRegister",
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