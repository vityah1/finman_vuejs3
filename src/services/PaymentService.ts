// Імпортуємо згенеровані Orval API хуки
import {
    paymentsForPeriodApiPaymentsPeriodGet,
    paymentsByYearsApiPaymentsYearsGet,
    paymentByMonthsApiPaymentsYearMonthsGet,
    aboutApiAboutGet
} from '../api/api/api';

// Імпортуємо функції для роботи з платежами
import {
    addPaymentApiPaymentsPost,
    updPaymentApiPaymentsPaymentIdPatch,
    delPaymentApiPaymentsPaymentIdDelete,
    changePaymentsCategoryApiPaymentsChangeCategoryPost,
    getPaymentApiPaymentsPaymentIdGet,
    bulkDeletePaymentsApiPaymentsBulkDeletePost,
    getPaymentsApiPaymentsGet
} from '../api/payments/payments';

// Для запитів, які ще не підтримуються Orval доведеться використовувати axios
import axios from '../axios-config';

// Імпортуємо хуки для категорій
import {
    getCategoriesApiCategoriesGet
} from '../api/categories/categories';

// Імпортуємо типи з API
import type {
    PaymentsForPeriodApiPaymentsPeriodGetParams,
    PaymentsByYearsApiPaymentsYearsGetParams,
    PaymentByMonthsApiPaymentsYearMonthsGetParams
} from '../api/model';

// Розширений інтерфейс для додаткових параметрів
interface PaymentParams {
    category_id?: number | string;
    [key: string]: any;
}

class PaymentService {
    getAbout() {
        return aboutApiAboutGet({
            
        }).catch(error => {
            console.error('Помилка отримання інформації About:', error.response?.data || error.message);
            throw error;
        });
    }

    getPaymentsPeriod(params: PaymentsForPeriodApiPaymentsPeriodGetParams) {
        return paymentsForPeriodApiPaymentsPeriodGet(params, {
            
        }).catch(error => {
            console.error('Помилка отримання платежів за період:', error.response?.data || error.message);
            throw error;
        });
    }

    categories(mode?: string) {
        return getCategoriesApiCategoriesGet({
            
        }).catch(error => {
            console.error('Помилка отримання категорій:', error.response?.data || error.message);
            throw error;
        });
    }

    getPaymentsYears(data: PaymentsByYearsApiPaymentsYearsGetParams) {
        return paymentsByYearsApiPaymentsYearsGet(data, {
            
        }).catch(error => {
            console.error('Помилка отримання платежів за роками:', error.response?.data || error.message);
            throw error;
        });
    }

    getPaymentsInYear(year: number | string, data: PaymentParams) {
        // Перетворюємо параметри до потрібного типу
        const params: PaymentByMonthsApiPaymentsYearMonthsGetParams = {
            currency: data.currency,
            mono_user_id: data.mono_user_id || null
        };

        return paymentByMonthsApiPaymentsYearMonthsGet(Number(year), params, {
            
        }).catch(error => {
            console.error(`Помилка отримання платежів за рік ${year}:`, error.response?.data || error.message);
            throw error;
        });
    }

    getPayment(id: number | string) {
        return getPaymentApiPaymentsPaymentIdGet(Number(id), {
            
        }).catch(error => {
            console.error(`Помилка отримання платежу ${id}:`, error.response?.data || error.message);
            throw error;
        });
    }

    addPayment(data: any) {
        return addPaymentApiPaymentsPost(data, {
            
        }).catch(error => {
            console.error('Помилка додавання платежу:', error.response?.data || error.message);
            throw error;
        });
    }

    updatePayment(id: number, data: any) {
        return updPaymentApiPaymentsPaymentIdPatch(id, data, {
            
        }).catch(error => {
            console.error('Помилка оновлення платежу:', error.response?.data || error.message);
            throw error;
        });
    }

    deletePayment(id: number) {
        return delPaymentApiPaymentsPaymentIdDelete(id, {
            
        }).catch(error => {
            console.error('Помилка видалення платежу:', error.response?.data || error.message);
            throw error;
        });
    }

    getPayments(params: any) {
        return getPaymentsApiPaymentsGet(params, {
            
        }).catch(error => {
            console.error('Помилка отримання платежів:', error.response?.data || error.message);
            throw error;
        });
    }

    changePaymentsCategory(data: any) {
        return changePaymentsCategoryApiPaymentsChangeCategoryPost(data, {
            
        }).catch(error => {
            console.error('Помилка зміни категорії платежів:', error.response?.data || error.message);
            throw error;
        });
    }

    bulkDeletePayments(data: any) {
        return bulkDeletePaymentsApiPaymentsBulkDeletePost(data, {
            
        }).catch(error => {
            console.error('Помилка масового видалення платежів:', error.response?.data || error.message);
            throw error;
        });
    }
}

export default new PaymentService();
