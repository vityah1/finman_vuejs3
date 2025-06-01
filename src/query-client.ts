import { QueryClient, MutationCache, QueryCache } from '@tanstack/vue-query';
import store from './store';
import router from './router';
import { getErrorMessage, logError, isAuthError, isNetworkError } from '@/utils/errorHandler';

// Створюємо кастомний mutation cache для обробки помилок
const mutationCache = new MutationCache({
  onError: (error) => {
    const axiosError = error as any;

    // Логуємо помилку з зрозумілим повідомленням
    logError(axiosError, "Mutation error");

    if (isAuthError(axiosError)) {
      console.log('Токен авторизації недійсний або протух');
      handleAuthError();
    } else if (isNetworkError(axiosError)) {
      console.warn('Мережева помилка в мутації:', getErrorMessage(axiosError));
    }
  },
});

// Створюємо кастомний query cache для обробки помилок
const queryCache = new QueryCache({
  onError: (error) => {
    const axiosError = error as any;

    // Логуємо помилку з зрозумілим повідомленням
    logError(axiosError, "Query error");

    if (isAuthError(axiosError)) {
      console.log('Токен авторизації недійсний або протух');
      handleAuthError();
    } else if (isNetworkError(axiosError)) {
      console.warn('Мережева помилка в запиті:', getErrorMessage(axiosError));
    }
  },
});

// Функція для обробки помилок авторизації
function handleAuthError() {
  console.log('Обробка помилки авторизації: виконується logout та перенаправлення на login');

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
        if (isAuthError(error)) {
          return false;
        }
        // Не повторюємо мережеві помилки
        if (isNetworkError(error)) {
          return false;
        }
        // Повторюємо інші запити максимум 1 раз
        return failureCount < 1;
      },
      staleTime: 5 * 60 * 1000, // 5 хвилин (за замовчуванням)
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Не повторюємо мутації при помилках авторизації
        if (isAuthError(error)) {
          return false;
        }
        // Не повторюємо мережеві помилки
        if (isNetworkError(error)) {
          return false;
        }
        // Повторюємо інші мутації максимум 1 раз
        return failureCount < 1;
      },
      onSuccess: () => {
        // Після успішної мутації можна додати якісь дії
        // Наприклад, оновити кеш запитів
      }
    },
  },
});

// Функції для роботи з кешем
export const refreshQueries = (queryKey: string[]) => {
  return queryClient.invalidateQueries({ queryKey });
};

export const refreshAllData = async () => {
  // Оновлюємо всі основні запити в додатку
  const keysToRefresh = [
    ['api', 'payments', 'years'],
    ['api', 'categories'],
    ['api', 'sources'],
    ['api', 'currencies']
  ];

  for (const key of keysToRefresh) {
    await queryClient.invalidateQueries({ queryKey: key });
  }

  console.log('Всі основні кеші запитів оновлено');
};