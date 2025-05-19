import axios from 'axios';

// Отримуємо базовий URL
const API_BASE = process.env.VUE_APP_API_ENDPOINT;

// Прибираємо завершальний /api, якщо він є
// Це дозволить уникнути дублювання /api в URL
const API_URL = API_BASE?.endsWith('/api') ? API_BASE.slice(0, -4) : API_BASE;

console.log('axios-config original API_URL:', API_BASE);
console.log('axios-config adjusted API_URL:', API_URL);

// Встановлюємо базовий URL для всіх axios запитів
axios.defaults.baseURL = API_URL;

// Додаємо request interceptor для автоматичного додавання токену авторизації
axios.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.accessToken) {
          config.headers.Authorization = `Bearer ${user.accessToken}`;
        }
      } catch (error) {
        console.error('Помилка парсингу даних користувача:', error);
        // Якщо не можемо парсити, краще видалити невалідні дані
        localStorage.removeItem('user');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axios;
