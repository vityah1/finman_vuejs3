import {
    getConfigTypesApiConfigConfigTypesGet,
    getUserConfigApiUsersConfigGet,
    addConfigApiUsersConfigPost,
    getConfigApiConfigConfigIdGet,
    editConfigApiConfigConfigIdPatch,
    deleteConfigApiConfigConfigIdDelete
} from '../api/config/config';

import authHeader from './auth-header';

class ConfigService {

    getConfigTypes(): Promise<any> {
        return getConfigTypesApiConfigConfigTypesGet()
            .catch(error => {
                console.error('Помилка отримання типів конфігурації:', error.response?.data || error.message);
                throw error;
            });
    }

    getUserConfig(): Promise<any> {
        return getUserConfigApiUsersConfigGet({ headers: authHeader() })
            .catch(error => {
                console.error('Помилка отримання конфігурації користувача:', error.response?.data || error.message);
                throw error;
            });
    }

    addConfig(data: any): Promise<any> {
        return addConfigApiUsersConfigPost({
            headers: authHeader()
        }).catch(error => {
            console.error('Помилка додавання конфігурації:', error.response?.data || error.message);
            throw error;
        });
    }

    getConfig(id: number): Promise<any> {
        return getConfigApiConfigConfigIdGet(id, { headers: authHeader() })
            .catch(error => {
                console.error(`Помилка отримання конфігурації ${id}:`, error.response?.data || error.message);
                throw error;
            });
    }

    updateConfig(id: number | undefined, data: any): Promise<any> {
        if (id === undefined) {
            return addConfigApiUsersConfigPost({
                headers: authHeader()
            }).catch(error => {
                console.error('Помилка створення конфігурації:', error.response?.data || error.message);
                throw error;
            });
        } else {
            return editConfigApiConfigConfigIdPatch(id, {
                headers: authHeader()
            }).catch(error => {
                console.error(`Помилка оновлення конфігурації ${id}:`, error.response?.data || error.message);
                throw error;
            });
        }
    }

    deleteConfig(id: number): Promise<any> {
        return deleteConfigApiConfigConfigIdDelete(id, { headers: authHeader() })
            .catch(error => {
                console.error(`Помилка видалення конфігурації ${id}:`, error.response?.data || error.message);
                throw error;
            });
    }
}

export default new ConfigService();