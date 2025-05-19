import { QueryClient, MutationCache, QueryCache } from '@tanstack/vue-query';
import store from './store';
import router from './router';

// Створюємо кастомний mutation cache для обробки помилок
const mutationCache = new MutationCache({
  onError: (error) => {
    const axiosError = error as any;
    const status = axiosError?.response?.status;
    
    if (status === 401 || status === 403) {
      console.log('Токен авторизації недійсний або протух');
      handleAuthError();
    }
  },
});

// Створюємо кастомний query cache для обробки помилок
const queryCache = new QueryCache({
  onError: (error) => {
    const axiosError = error as any;
    const status = axiosError?.response?.status;
    
    if (status === 401 || status === 403) {
      console.log('Токен авторизації недійсний або протух');
      handleAuthError();
    }
  },
});

// Функція для обробки помилок авторизації
function handleAuthError() {
  // Виконуємо logout у store
  store.dispatch('auth/logout');
  
  // Перенаправляємо на сторінку входу, зберігаючи intended URL
  const currentPath = router.currentRoute.value.fullPath;
  if (currentPath !== '/login' && currentPath !== '/register') {
    router.push({
      name: 'login',
      query: { returnUrl: currentPath }
    });
  }
}

// Створюємо query client з кастомними caches
export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Не повторюємо запити при помилках авторизації
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        // Повторюємо інші запити максимум 1 раз
        return failureCount < 1;
      },
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Не повторюємо мутації при помилках авторизації
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        // Повторюємо інші мутації максимум 1 раз
        return failureCount < 1;
      },
    },
  },
});
