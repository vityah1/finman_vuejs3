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
        console.log('Ініціалізація додатку: перевірка авторизації...');
        const isAuthenticated = await store.dispatch("auth/checkAuth");

        // Завантажуємо довідники тільки якщо користувач авторизований
        if (isAuthenticated) {
            console.log('Користувач авторизований, завантажуємо довідники...');
            try {
                await Promise.all([
                    store.dispatch("sprs/get_sources"),
                    store.dispatch("sprs/get_currencies"),
                    store.dispatch("sprs/get_categories")
                ]);
                console.log('Довідники успішно завантажено');
            } catch (sprsError) {
                logError(sprsError, "Loading reference data");
                console.warn('Помилка завантаження довідників (не критично):', getErrorMessage(sprsError, "Помилка завантаження довідників"));
            }
        } else {
            console.log('Користувач не авторизований або токен протух');
        }
        
        // Завжди монтуємо додаток
        console.log('Монтування додатку...');
        app.mount('#app');
        console.log('Додаток успішно змонтовано');
    }
    catch(error) {
        logError(error, "Main app initialization");
        console.error('Критична помилка ініціалізації додатку:', getErrorMessage(error, "Помилка ініціалізації додатку"));
        
        // Навіть при критичній помилці намагаємося змонтувати додаток
        // щоб уникнути білого екрану
        try {
            app.mount('#app');
            console.log('Додаток змонтовано в режимі відновлення після помилки');
        } catch (mountError) {
            logError(mountError, "App mount after error");
            console.error('КРИТИЧНА ПОМИЛКА: Неможливо змонтувати додаток:', mountError);
            // Показуємо хоча б базове повідомлення про помилку
            document.getElementById('app')!.innerHTML = `
                <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
                    <h2>Помилка завантаження додатку</h2>
                    <p>Спробуйте оновити сторінку або очистити кеш браузера</p>
                    <button onclick="location.reload()">Оновити сторінку</button>
                </div>
            `;
        }
    }
}

fetchDataFromApi()
