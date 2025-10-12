<template>
  <!-- Базова інформація профілю -->
  <div class="card mb-4">
    <div class="card-header">
      <h4 class="mb-0">Особиста інформація</h4>
    </div>
    <div class="card-body">
      <Form :validation-schema="schema" @submit="editUser" style="max-width: 800px;">
        <div class="formgrid grid">
          <div class="field col-12 md:col-4">
            <label for="login">Логін</label>
          </div>
          <div class="field col-12 md:col-8">
            <Field v-model="currentUser.login" name="login" type="text" v-slot="{ field, errorMessage }">
              <InputText
                v-bind="field"
                id="login"
                :class="{ 'p-invalid': errorMessage }"
                placeholder="Введіть логін"
              />
              <small v-if="errorMessage" class="p-error">{{ errorMessage }}</small>
            </Field>
          </div>
        </div>

        <div class="formgrid grid">
          <div class="field col-12 md:col-4">
            <label for="password">Пароль</label>
          </div>
          <div class="field col-12 md:col-8">
            <Field name="password" type="password" v-slot="{ field, errorMessage }">
              <Password
                v-bind="field"
                id="password"
                :class="{ 'p-invalid': errorMessage }"
                placeholder="Залиште порожнім, щоб не змінювати"
                :feedback="false"
                toggleMask
              />
              <small v-if="errorMessage" class="p-error">{{ errorMessage }}</small>
            </Field>
          </div>
        </div>

        <div class="formgrid grid">
          <div class="field col-12 md:col-4">
            <label for="fullname">Повне ім'я</label>
          </div>
          <div class="field col-12 md:col-8">
            <Field v-model="currentUser.fullname" name="fullname" type="text" v-slot="{ field, errorMessage }">
              <InputText
                v-bind="field"
                id="fullname"
                :class="{ 'p-invalid': errorMessage }"
                placeholder="Введіть повне ім'я"
              />
              <small v-if="errorMessage" class="p-error">{{ errorMessage }}</small>
            </Field>
          </div>
        </div>

        <div class="formgrid grid">
          <div class="field col-12 md:col-4">
            <label for="phone">Телефон</label>
          </div>
          <div class="field col-12 md:col-8">
            <Field v-model="currentUser.phone" name="phone" type="text" v-slot="{ field, errorMessage }">
              <InputText
                v-bind="field"
                id="phone"
                :class="{ 'p-invalid': errorMessage }"
                placeholder="Введіть номер телефону"
              />
              <small v-if="errorMessage" class="p-error">{{ errorMessage }}</small>
            </Field>
          </div>
        </div>

        <div class="formgrid grid">
          <div class="field col-12 md:col-4">
            <label for="email">Email</label>
          </div>
          <div class="field col-12 md:col-8">
            <Field v-model="currentUser.email" name="email" type="text" v-slot="{ field, errorMessage }">
              <InputText
                v-bind="field"
                id="email"
                :class="{ 'p-invalid': errorMessage }"
                placeholder="Введіть email"
              />
              <small v-if="errorMessage" class="p-error">{{ errorMessage }}</small>
            </Field>
          </div>
        </div>

        <div class="formgrid grid">
          <div class="field col-12 md:col-4"></div>
          <div class="field col-12 md:col-8">
            <Button
              label="Зберегти"
              type="submit"
              :disabled="loading"
              :loading="loading"
            />
          </div>
        </div>
      </Form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Field, Form } from "vee-validate";
import * as yup from "yup";
import type { UserUpdate } from '@/api/model';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';

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
    Button,
    InputText,
    Password,
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
