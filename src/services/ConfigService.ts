import {
    getConfigTypesApiConfigConfigTypesGet,
    getUserConfigApiUsersConfigGet,
    addConfigApiUsersConfigPost,
    getConfigApiConfigConfigIdGet,
    editConfigApiConfigConfigIdPatch,
    deleteConfigApiConfigConfigIdDelete
} from "@/api/config/config";
import type { ConfigCreate, ConfigUpdate } from '../api/model';

class ConfigService {

    getConfigTypes(): Promise<any> {
        return getConfigTypesApiConfigConfigTypesGet()
            .catch(error => {
                console.error('Помилка отримання типів конфігурації:', error.response?.data || error.message);
                throw error;
            });
    }

    getUserConfig(): Promise<any> {
        return getUserConfigApiUsersConfigGet()
            .catch(error => {
                console.error('Помилка отримання конфігурації користувача:', error.response?.data || error.message);
                throw error;
            });
    }

    addConfig(data: any): Promise<any> {
        // Виділяємо поля, які очікує API
        const configData: ConfigCreate = {
            type_data: data.type_data,
            value_data: data.value_data,
            add_value: data.add_value?.toString() || null
        };

        return addConfigApiUsersConfigPost(configData)
            .catch(error => {
                console.error('Помилка додавання конфігурації:', error.response?.data || error.message);
                throw error;
            });
    }

    getConfig(id: number): Promise<any> {
        return getConfigApiConfigConfigIdGet(id)
            .catch(error => {
                console.error(`Помилка отримання конфігурації ${id}:`, error.response?.data || error.message);
                throw error;
            });
    }

    updateConfig(id: number | undefined, data: any): Promise<any> {
        if (id === undefined) {
            // Використовуємо метод addConfig для створення нової конфігурації
            return this.addConfig(data)
                .catch(error => {
                    console.error('Помилка створення конфігурації:', error.response?.data || error.message);
                    throw error;
                });
        } else {
            // Виділяємо поля, які очікує API
            const configData: ConfigUpdate = {
                type_data: data.type_data,
                value_data: data.value_data,
                add_value: data.add_value?.toString() || null
            };

            return editConfigApiConfigConfigIdPatch(id, configData)
                .catch(error => {
                    console.error(`Помилка оновлення конфігурації ${id}:`, error.response?.data || error.message);
                    throw error;
                });
        }
    }

    deleteConfig(id: number): Promise<any> {
        return deleteConfigApiConfigConfigIdDelete(id)
            .catch(error => {
                console.error(`Помилка видалення конфігурації ${id}:`, error.response?.data || error.message);
                throw error;
            });
    }
}

export default new ConfigService();