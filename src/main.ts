import { createApp } from 'vue'
import App from './App.vue'
import store from "./store"
import router from './router'
import moment from 'moment'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { queryClient } from './query-client'
// Імпортуємо налаштований axios перш ніж використовувати його
import './axios-config'
import { getErrorMessage, logError } from '@/utils/errorHandler'

import BootstrapVueNext from "bootstrap-vue-next"
import "bootstrap/dist/css/bootstrap.css"
import "bootstrap-vue-next/dist/bootstrap-vue-next.css"

import AlertComponent from './components/AlertComponent.vue'

const app = createApp(App)

// Глобальний обробник помилок Vue
app.config.errorHandler = (error: any, instance: any, info: string) => {
  logError(error, `Vue Error Handler - ${info}`);
  console.error('Vue Error:', {
    error,
    instance,
    info,
    userMessage: getErrorMessage(error, "Виникла неочікувана помилка")
  });
};

// Обробник необроблених промісів
window.addEventListener('unhandledrejection', (event) => {
  logError(event.reason, "Unhandled Promise Rejection");
  console.error('Unhandled Promise Rejection:', {
    reason: event.reason,
    userMessage: getErrorMessage(event.reason, "Виникла помилка при обробці запиту")
  });
  // Не запобігаємо стандартній обробці, але логуємо
});

// Додаємо момент до глобальних властивостей з типізацією
app.config.globalProperties.$moment = moment
app.use(BootstrapVueNext)
app.use(VueQueryPlugin, {
  queryClient
})

app.use(router).use(store)
    .component('alert-component', AlertComponent)

async function fetchDataFromApi(): Promise<void> {
    try {
        // Перевіряємо авторизацію при завантаженні додатку
        const isAuthenticated = await store.dispatch("auth/checkAuth");

        // Завантажуємо довідники тільки якщо користувач авторизований
        if (isAuthenticated) {
            await store.dispatch("sprs/get_sources");
            await store.dispatch("sprs/get_currencies");
            await store.dispatch("sprs/get_categories");
        }
        app.mount('#app');
    }
    catch(error) {
        logError(error, "Main app initialization");
        console.error('Помилка завантаження початкових даних:', getErrorMessage(error, "Помилка ініціалізації додатку"));
        // Все одно монтуємо додаток, навіть якщо є помилки з довідниками
        app.mount('#app');
    }
}

fetchDataFromApi()
