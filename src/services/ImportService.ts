import authHeader from './auth-header';
import { importBankStatementApiImportPost } from '../api/default/default';
import type { BodyImportBankStatementApiImportPost } from '../api/model';
import axios from '../axios-config';

// Центральний обробник помилок
const handleRequestError = (error: any, message: string) => {
    console.error(message, error.response?.data || error.message);
    throw error;
};

// Інтерфейси для типізації даних
interface UploadFileParams {
  file: File;
  action: string;
  bank: string;
}

class ImportService {
    /**
     * Завантаження файлу банківської виписки
     * @param file Файл для завантаження
     * @param action Дія (import або show)
     * @param bank Тип банку (revolut, wise, p24 тощо)
     */
    UploadFile(file: File, action: string, bank: string) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('action', action);
        formData.append('mode', bank);
        
        // З Formdata не можна створити типізований об'єкт для API,
        // але ми можемо передати FormData безпосередньо як data
        return importBankStatementApiImportPost(formData as any, {
            headers: {
                ...authHeader(),
                'Content-Type': 'multipart/form-data'
            }
        }).catch(error => handleRequestError(error, 'Помилка завантаження файлу:'));
    }
}

export default new ImportService();
