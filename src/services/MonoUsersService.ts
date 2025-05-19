import {
    getUserMonoUsersInfoApiUsersUserIdMonoInfoGet,
    getMonoUserInfoApiMonoUsersMonoUserIdInfoGet,
    setWebhookApiMonoUsersMonoUserIdWebhookPut,
    monoWebhookTestHandlerApiMonoUsersMonoUserIdWebhookGet,
    monoWebhookHandlerApiMonoUsersMonoUserIdWebhookPost,
    getMonoDataPmtsApiMonoPaymentsPost
} from "@/api/mono/mono";

import {
    getMonoUsersApiMonoUsersGet,
    getMonoUserApiMonoUsersMonoUserIdGet,
    addMonoUserApiMonoUsersPost,
    editMonoUserApiMonoUsersMonoUserIdPatch,
    deleteMonoUserApiMonoUsersMonoUserIdDelete
} from "@/api/mono-users/mono-users";

class MonoUsersService {

    getMonoUsers(): Promise<any> {
        return getMonoUsersApiMonoUsersGet()
            .catch(error => {
                console.error('Помилка отримання списку користувачів Monobank:', error.response?.data || error.message);
                throw error;
            });
    }

    getMonoUser(id: number | string): Promise<any> {
        // Перетворюємо id на number, як очікує API функція
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        return getMonoUserApiMonoUsersMonoUserIdGet(numericId)
            .catch(error => {
                console.error(`Помилка отримання інформації про користувача Monobank ${id}:`, error.response?.data || error.message);
                throw error;
            });
    }

    addMonoUser(data: any): Promise<any> {
        return addMonoUserApiMonoUsersPost(data)
            .catch(error => {
                console.error('Помилка додавання користувача Monobank:', error.response?.data || error.message);
                throw error;
            });
    }

    updateMonoUser(id: number | string, data: any): Promise<any> {
        // Перетворюємо id на number, як очікує API функція
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        return editMonoUserApiMonoUsersMonoUserIdPatch(numericId, data)
            .catch(error => {
                console.error(`Помилка оновлення користувача Monobank ${id}:`, error.response?.data || error.message);
                throw error;
            });
    }

    deleteMonoUser(id: number | string): Promise<any> {
        // Перетворюємо id на number, як очікує API функція
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        return deleteMonoUserApiMonoUsersMonoUserIdDelete(numericId)
            .catch(error => {
                console.error(`Помилка видалення користувача Monobank ${id}:`, error.response?.data || error.message);
                throw error;
            });
    }

    async getUserMonoUsersInfo(userId: number): Promise<any> {
        return getUserMonoUsersInfoApiUsersUserIdMonoInfoGet(userId)
            .catch(error => {
                console.error(`Помилка отримання інформації про користувача Monobank ${userId}:`, error.response?.data || error.message);
                throw error;
            });
    }

    async getMonoUserInfo(monoUserId: number): Promise<any> {
        return getMonoUserInfoApiMonoUsersMonoUserIdInfoGet(monoUserId)
            .catch(error => {
                console.error(`Помилка отримання інформації про користувача Monobank ${monoUserId}:`, error.response?.data || error.message);
                throw error;
            });
    }

    async setWebhook(monoUserId: number, data: any): Promise<any> {
        return setWebhookApiMonoUsersMonoUserIdWebhookPut(monoUserId, data)
            .catch(error => {
                console.error(`Помилка встановлення вебхука для користувача Monobank ${monoUserId}:`, error.response?.data || error.message);
                throw error;
            });
    }

    async testWebhook(monoUserId: number): Promise<any> {
        return monoWebhookTestHandlerApiMonoUsersMonoUserIdWebhookGet(monoUserId)
            .catch(error => {
                console.error(`Помилка тестування вебхука для користувача Monobank ${monoUserId}:`, error.response?.data || error.message);
                throw error;
            });
    }

    async handleWebhook(monoUserId: number, data: any): Promise<any> {
        return monoWebhookHandlerApiMonoUsersMonoUserIdWebhookPost(monoUserId, data)
            .catch(error => {
                console.error(`Помилка обробки вебхука для користувача Monobank ${monoUserId}:`, error.response?.data || error.message);
                throw error;
            });
    }

    async processPayments(data: any): Promise<any> {
        return getMonoDataPmtsApiMonoPaymentsPost(data)
            .catch(error => {
                console.error('Помилка обробки платежів Monobank:', error.response?.data || error.message);
                throw error;
            });
    }
}

export default new MonoUsersService();