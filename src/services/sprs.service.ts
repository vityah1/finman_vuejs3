import { 
    getDictApiSprsDictionaryGet
} from '../api/sprs/sprs';

// Центральний обробник помилок
const handleRequestError = (error: any, message: string) => {
    console.error(message, error.response?.data || error.message);
    throw error;
};

// Інтерфейси для типізації
interface Currency {
    id: number;
    code: string;
    name: string;
    symbol: string;
    [key: string]: any;
}

interface Source {
    id: number;
    name: string;
    [key: string]: any;
}

interface TypePayment {
    id: number;
    name: string;
    [key: string]: any;
}

class SprsService {
    get_currencies() {
        return getDictApiSprsDictionaryGet('currency')
            .then(response => {
                if (response.data) {
                    localStorage.setItem('currencies', JSON.stringify(response.data));
                }
                return response.data;
            })
            .catch(error => handleRequestError(error, 'Помилка отримання валют:'));
    }

    get_sources() {
        return getDictApiSprsDictionaryGet('source')
            .then(response => {
                if (response.data) {
                    localStorage.setItem('sources', JSON.stringify(response.data));
                }
                return response.data;
            })
            .catch(error => handleRequestError(error, 'Помилка отримання джерел:'));
    }

    get_type_payments() {
        return getDictApiSprsDictionaryGet('type_payment')
            .then(response => {
                if (response.data) {
                    localStorage.setItem('type_payment', JSON.stringify(response.data));
                }
                return response.data;
            })
            .catch(error => handleRequestError(error, 'Помилка отримання типів платежів:'));
    }
}

export default new SprsService();
