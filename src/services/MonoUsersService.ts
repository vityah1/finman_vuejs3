import {
    getUserMonoUsersInfoApiUsersUserIdMonoInfoGet,
    getMonoUserInfoApiMonoUsersMonoUserIdInfoGet,
    setWebhookApiMonoUsersMonoUserIdWebhookPut,
    monoWebhookTestHandlerApiMonoUsersMonoUserIdWebhookGet,
    monoWebhookHandlerApiMonoUsersMonoUserIdWebhookPost,
    getMonoDataPmtsApiMonoPaymentsPost
} from '../api/mono/mono';

import authHeader from './auth-header';

class MonoUsersService {

    async getUserMonoUsersInfo(userId: number): Promise<any> {
        return getUserMonoUsersInfoApiUsersUserIdMonoInfoGet(userId, { headers: authHeader() })
            .catch(error => {
                console.error(`Помилка отримання інформації про користувача Monobank ${userId}:`, error.response?.data || error.message);
                throw error;
            });
    }

    async getMonoUserInfo(monoUserId: number): Promise<any> {
        return getMonoUserInfoApiMonoUsersMonoUserIdInfoGet(monoUserId, { headers: authHeader() })
            .catch(error => {
                console.error(`Помилка отримання інформації про користувача Monobank ${monoUserId}:`, error.response?.data || error.message);
                throw error;
            });
    }

    async setWebhook(monoUserId: number, data: any): Promise<any> {
        return setWebhookApiMonoUsersMonoUserIdWebhookPut(monoUserId, data, { headers: authHeader() })
            .catch(error => {
                console.error(`Помилка встановлення вебхука для користувача Monobank ${monoUserId}:`, error.response?.data || error.message);
                throw error;
            });
    }

    async testWebhook(monoUserId: number): Promise<any> {
        return monoWebhookTestHandlerApiMonoUsersMonoUserIdWebhookGet(monoUserId, { headers: authHeader() })
            .catch(error => {
                console.error(`Помилка тестування вебхука для користувача Monobank ${monoUserId}:`, error.response?.data || error.message);
                throw error;
            });
    }

    async handleWebhook(monoUserId: number, data: any): Promise<any> {
        return monoWebhookHandlerApiMonoUsersMonoUserIdWebhookPost(monoUserId, data, { headers: authHeader() })
            .catch(error => {
                console.error(`Помилка обробки вебхука для користувача Monobank ${monoUserId}:`, error.response?.data || error.message);
                throw error;
            });
    }

    async processPayments(data: any): Promise<any> {
        return getMonoDataPmtsApiMonoPaymentsPost(data, { headers: authHeader() })
            .catch(error => {
                console.error('Помилка обробки платежів Monobank:', error.response?.data || error.message);
                throw error;
            });
    }
}

export default new MonoUsersService();