<template>
  <!-- Базова інформація профілю -->
  <div class="card mb-4">
    <div class="card-header">
      <h4 class="mb-0">Особиста інформація</h4>
    </div>
    <div class="card-body">
      <Form :validation-schema="schema" @submit="editUser">
        <div class="form-group">
          <label for="login">Логін</label>
          <Field v-model="currentUser.login" class="form-control" name="login" type="text" />
          <ErrorMessage class="error-feedback" name="login" />
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <Field class="form-control" name="password" type="password" />
          <ErrorMessage class="error-feedback" name="password" />
        </div>

        <div class="form-group">
          <label for="fullname">Повне ім'я</label>
          <Field v-model="currentUser.fullname" class="form-control" name="fullname" type="text" />
          <ErrorMessage class="error-feedback" name="fullname" />
        </div>

        <div class="form-group">
          <label for="phone">Телефон</label>
          <Field v-model="currentUser.phone" class="form-control" name="phone" type="text" />
          <ErrorMessage class="error-feedback" name="phone" />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <Field v-model="currentUser.email" class="form-control" name="email" type="text" />
          <ErrorMessage class="error-feedback" name="email" />
        </div>

        <div class="form-group">
          <Button
            label="Зберегти"
            type="submit"
            class="w-full"
            :disabled="loading"
            :loading="loading"
          />
        </div>
      </Form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { ErrorMessage, Field, Form } from "vee-validate";
import * as yup from "yup";
import type { UserUpdate } from '@/api/model';
import Button from 'primevue/button';

interface User {
  id: number;
  login: string;
  fullname?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

interface UserEdit extends UserUpdate {
  user_id: number | string;
}

export default defineComponent({
  name: 'UserPersonalInfo',
  components: {
    Form,
    Field,
    ErrorMessage,
    Button,
  },
  props: {
    currentUser: {
      type: Object as PropType<User>,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['user-updated', 'show-alert'],
  setup() {
    const schema = yup.object().shape({
      user_id: yup.string(),
      login: yup
        .string()
        .required("Логін обов'язковий!")
        .min(3, "Має бути не менше 3 символів!")
        .max(20, "Має бути не більше 20 символів!"),
      email: yup
        .string()
        .required("Email обов'язковий!")
        .email("Неправильний формат email!")
        .max(50, "Має бути не більше 50 символів!"),
      password: yup
        .string()
        .required("Пароль обов'язковий!")
        .min(6, "Має бути не менше 6 символів!")
        .max(40, "Має бути не більше 40 символів!"),
      fullname: yup.string(),
      phone: yup.string(),
    });

    return {
      schema
    };
  },
  data() {
    return {
      successful: false,
      message: ""
    };
  },
  methods: {
    editUser(user: UserEdit) {
      this.message = "";
      this.successful = false;

      // Використовуємо Vuex для оновлення користувача
      this.$store.dispatch("auth/edit", user).then(
        (data: any) => {
          this.message = data.message;
          this.successful = true;
          this.$emit('show-alert', 'success', data.message);
          this.$emit('user-updated');
        },
        (error: any) => {
          this.message =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();
          this.successful = false;
          this.$emit('show-alert', 'danger', this.message);
        },
      );
    }
  }
});
</script>

<style scoped>
.error-feedback {
  color: #dc3545;
  font-size: 0.875em;
}

.form-group {
  margin-bottom: 1rem;
}

.btn-block {
  width: 100%;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>
