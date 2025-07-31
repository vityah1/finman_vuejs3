import type { AxiosError } from 'axios';
import type { HTTPValidationError, ValidationError } from '@/api/model';

/**
 * Централізована утиліта для обробки помилок API
 */

/**
 * Отримує зрозуміле повідомлення про помилку з AxiosError
 * @param error - помилка Axios
 * @param defaultMessage - повідомлення за замовчуванням
 * @returns зрозуміле повідомлення про помилку
 */
export function getErrorMessage(error: AxiosError<HTTPValidationError | any>, defaultMessage: string = "Виникла помилка"): string {
    // Перевіряємо тип помилки мережі
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        return "Сервер недоступний. Перевірте підключення до інтернету або спробуйте пізніше.";
    }

    // Перевіряємо timeout помилки
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return "Час очікування відповіді від сервера вичерпано. Спробуйте ще раз.";
    }

    // Перевіряємо, чи є відповідь від сервера
    if (error.response?.data) {
        const responseData = error.response.data;
        const status = error.response.status;

        // Спочатку перевіряємо наявність detail, навіть для помилок 5xx
        // Якщо є поле detail як рядок (загальні помилки API)
        if (typeof responseData.detail === 'string') {
            return responseData.detail;
        }

        // Обробка помилок авторизації
        if (status === 401) {
            return "Сесія закінчилася. Будь ласка, увійдіть в систему знову.";
        }

        if (status === 403) {
            return "У вас немає прав для виконання цієї дії.";
        }

        // Обробка помилок сервера (тільки якщо немає detail)
        if (status >= 500) {
            return "Помилка сервера. Спробуйте пізніше або зверніться до адміністратора.";
        }

        // Якщо є поле detail як масив ValidationError (помилки валідації)
        if (Array.isArray(responseData.detail) && responseData.detail.length > 0) {
            const firstError = responseData.detail[0] as ValidationError;
            if (firstError.msg) {
                return firstError.msg;
            }
        }

        // Якщо є поле message (деякі API можуть використовувати це поле)
        if (responseData.message) {
            return responseData.message;
        }

        // Якщо є поле error
        if (responseData.error) {
            return responseData.error;
        }
    }

    // Обробка помилок без відповіді від сервера
    if (!error.response) {
        if (error.request) {
            return "Не вдалося з'єднатися з сервером. Перевірте підключення до інтернету.";
        }
        return "Помилка налаштування запиту.";
    }

    // Fallback до повідомлення за замовчуванням
    return defaultMessage;
}

/**
 * Показує зрозуміле повідомлення про помилку в консолі (для розробки)
 * @param error - помилка
 * @param context - контекст, де виникла помилка
 */
export function logError(error: any, context: string = "Unknown"): void {
    const userMessage = getErrorMessage(error);
    console.group(`🚨 Помилка в ${context}`);
    console.log("Повідомлення для користувача:", userMessage);
    console.log("Технічні деталі:", error);
    if (error.response) {
        console.log("Статус:", error.response.status);
        console.log("Дані відповіді:", error.response.data);
    }
    console.groupEnd();
}

/**
 * Перевіряє, чи є помилка мережевою
 * @param error - помилка
 * @returns true, якщо це мережева помилка
 */
export function isNetworkError(error: AxiosError): boolean {
    return error.code === 'ERR_NETWORK' || 
           error.message === 'Network Error' || 
           !error.response;
}

/**
 * Перевіряє, чи є помилка помилкою авторизації
 * @param error - помилка
 * @returns true, якщо це помилка авторизації
 */
export function isAuthError(error: AxiosError): boolean {
    return error.response?.status === 401 || error.response?.status === 403;
}

/**
 * Перевіряє, чи є помилка помилкою сервера
 * @param error - помилка
 * @returns true, якщо це помилка сервера (5xx)
 */
export function isServerError(error: AxiosError): boolean {
    return (error.response?.status ?? 0) >= 500;
}
