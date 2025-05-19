import { 
    getUserMonoUsersInfoApiUsersUserIdMonoInfoGet,
    setWebhookApiMonoUsersMonoUserIdWebhookPut,
    getMonoDataPmtsApiMonoPaymentsPost 
} from '../api/mono/mono';
import type { MonoPaymentProcessRequest, MonoWebhookRequest } from '../api/model';

// Інтерфейси для типізації
interface WebhookData extends Partial<MonoWebhookRequest> {
    mono_user_id: string | number;
    [key: string]: any;
}

// Розширюємо інтерфейс для сумісності з API
interface MonoPaymentData extends Partial<MonoPaymentProcessRequest> {
    mode: string;
    [key: string]: any;
}

class MonoService {
    GetMonoUsersInfo(user_id: string | number) {
        // Перетворюємо user_id на number, як очікує API функція
        const numericUserId = typeof user_id === 'string' ? parseInt(user_id, 10) : user_id;
        return getUserMonoUsersInfoApiUsersUserIdMonoInfoGet(numericUserId)
            .catch(error => {
                console.error(`Помилка отримання інформації Mono для користувача ${user_id}:`, error.response?.data || error.message);
                throw error;
            });
    }

    setWebhook(data: WebhookData) {
        // Перетворюємо mono_user_id на number, як очікує API функція
        const numericUserId = typeof data.mono_user_id === 'string' ? parseInt(data.mono_user_id, 10) : data.mono_user_id;
        // Перетворюємо дані до формату, який очікує API
        const webhookData: MonoWebhookRequest = {
            webhook_url: data.webhook_url || ''
        };
        return setWebhookApiMonoUsersMonoUserIdWebhookPut(numericUserId, webhookData)
            .catch(error => {
                console.error(`Помилка встановлення webhook для користувача Mono ${data.mono_user_id}:`, error.response?.data || error.message);
                throw error;
            });
    }

    getMonoPayments(data: MonoPaymentData) {
        // Перетворюємо дані до формату, який очікує API
        const paymentData: MonoPaymentProcessRequest = {
            user_id: typeof data.user_id === 'string' ? parseInt(data.user_id, 10) : (data.user_id || 0),
            mono_user_id: typeof data.mono_user_id === 'string' ? parseInt(data.mono_user_id, 10) : (data.mono_user_id || 0),
            ...data
        };
        return getMonoDataPmtsApiMonoPaymentsPost(paymentData)
            .catch(error => {
                console.error('Помилка отримання платежів Mono:', error.response?.data || error.message);
                throw error;
            });
    }
}

export default new MonoService();
