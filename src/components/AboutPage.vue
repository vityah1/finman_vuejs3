<script lang="ts">
import { defineComponent } from 'vue';
import PaymentService from "../services/PaymentService";
import AuthService from "../services/auth.service";
import type { AxiosResponse } from 'axios';
import { useStore } from 'vuex';
import Card from 'primevue/card';

interface AboutResponse {
  data: string;
}

export default defineComponent({
  name: "AboutPage",
  components: {
    Card
  },
  data() {
    return {
      htmlContent: "",
      content: "",
      buildVersion: (window as any).APP_BUILD_VERSION || 'Unknown',
      buildTime: new Date().toLocaleString('uk-UA'),
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
  <div class="about-page">
    <h2 class="page-title"><i class="pi pi-info-circle mr-2"></i>Про програму</h2>
    <Card class="about-card">
      <template #content>
        <div v-html="htmlContent"></div>
        {{ content }}

        <div class="build-info">
          <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid #e0e0e0;" />
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <i class="pi pi-code" style="color: var(--primary-color);"></i>
              <strong>Версія білду:</strong>
              <span style="font-family: monospace; font-size: 0.875rem; background: #f5f5f5; padding: 0.25rem 0.5rem; border-radius: 4px;">
                {{ buildVersion }}
              </span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <i class="pi pi-calendar" style="color: var(--primary-color);"></i>
              <strong>Час завантаження:</strong>
              <span style="font-size: 0.875rem;">{{ buildTime }}</span>
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.about-page {
  padding: 0;
}

.page-title {
  margin-bottom: 0.75rem;
  font-size: 1.5rem;
}

/* Mobile optimization */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.125rem;
    margin-bottom: 0.5rem;
  }

  .about-card :deep(.p-card-content) {
    padding: 0.75rem;
  }

  .about-card :deep(.p-card-body) {
    padding: 0.5rem;
  }
}
</style>
