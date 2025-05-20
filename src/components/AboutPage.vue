<script lang="ts">
import { defineComponent } from 'vue';
import PaymentService from "../services/PaymentService";
import AuthService from "../services/auth.service";
import type { AxiosResponse } from 'axios';
import { useStore } from 'vuex';

interface AboutResponse {
  data: string;
}

export default defineComponent({
  name: "AboutPage",
  data() {
    return {
      htmlContent: "",
      content: "",
    };
  },
  setup() {
    const store = useStore();
    return { store };
  },
  async mounted() {
    // Перевіряємо стан авторизації, якщо користувач авторизований
    const isLoggedIn = this.store.state.auth.status.loggedIn;
    
    if (isLoggedIn) {
      try {
        // Виконуємо валідацію токена
        const isValid = await AuthService.validateToken();
        if (!isValid) {
          console.log("Токен виявився недійсним при завантаженні головної сторінки");
        } else {
          console.log("Токен підтверджено як валідний");
        }
      } catch (error) {
        console.error("Помилка при валідації токена:", error);
      }
    }
    
    // Отримуємо дані про сторінку
    PaymentService.getAbout().then(
      (response: AxiosResponse<AboutResponse>) => {
        this.htmlContent = response.data.data;
        console.log(this.htmlContent);
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
});
</script>

<template>
  <div class="container">
    <header class="jumbotron">
      <h3>About</h3>
    </header>
    <div v-html="htmlContent"></div>
    {{ content }}
  </div>
</template>
