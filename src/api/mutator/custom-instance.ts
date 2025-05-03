import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import authHeader from '../../services/auth-header';

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = axios.CancelToken.source();
  const instance = axios.create({
    baseURL: process.env.VUE_APP_API_ENDPOINT,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader()
    },
    cancelToken: source.token,
  });

  // Додавання перехоплювачів для обробки помилок
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response && error.response.status === 401) {
        // Логіка для неавторизованих запитів
        localStorage.removeItem('user');
        // Перенаправлення на сторінку входу
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance.request<T>(config).then((response) => response.data);
}; 