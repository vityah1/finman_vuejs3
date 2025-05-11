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

export default axios;
