import axios from 'axios';
import { getErrorMessage, logError, isAuthError, isNetworkError } from '@/utils/errorHandler';

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
          // console.log('Added Authorization header:', `Bearer ${user.accessToken}`);
        } else {
          console.warn('Токен відсутній у даних користувача');
        }
      } catch (error) {
        console.error('Помилка парсингу даних користувача:', error);
        // Якщо не можемо парсити, краще видалити невалідні дані
        localStorage.removeItem('user');
      }
    } else {
      // console.log('Користувач не авторизований, токен не додано');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Додаємо response interceptor для обробки помилок
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Логуємо помилку з зрозумілим повідомленням
    logError(error, "Axios interceptor");

    if (isAuthError(error)) {
      console.error('Помилка авторизації:', error.response?.status, error.response?.data);

      // Логування URL, який викликав помилку
      console.error('URL запиту з помилкою авторизації:', error.config?.url);

      // Видаляємо токен, якщо він протух
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          JSON.parse(userStr);
          // Якщо у нас є дані користувача і виникла помилка авторизації,
          // це означає, що токен недійсний
          localStorage.removeItem('user');
          console.log('Токен видалено через помилку авторизації');

          // Перезавантажуємо сторінку, щоб примусово оновити стан додатку
          // Це гарантує, що користувач буде перенаправлений на /login
          console.log('Перезавантаження сторінки для оновлення стану авторизації...');
          setTimeout(() => {
            window.location.href = '/login';
          }, 500);
        } catch (e) {
          console.error('Помилка при обробці даних користувача:', e);
        }
      }

      // Додаткова діагностика
      console.error('Заголовки запиту:', error.config?.headers);
    } else if (isNetworkError(error)) {
      console.warn('Мережева помилка:', getErrorMessage(error));
    }

    return Promise.reject(error);
  }
);

export default axios;
