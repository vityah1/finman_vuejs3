import https from "../http-common";
import authHeader from './auth-header';

class PaymentService {

    getAbout() {
        return https.get('/about');
    }

    getPaymentsPeriod({ year = '', month = '', user = '' } = {}) {
        return https.get("/payments/period?year=" + year + "&month=" + month + "&user=" + user, { headers: authHeader()});
    }

    categories(mode) {
        let categories_mode = ''
        if (mode == 'main') {categories_mode = '/main';}
        else if (mode == 'child') {categories_mode = '/child';}
        return https.get("/categories" + categories_mode, { headers: authHeader()});
    }

    getPaymentsYears() {
        return https.get("/payments/years", { headers: authHeader()});
    }

    getPaymentsByYear(year) {
        return https.get("/payments/years/" + year , { headers: authHeader()});
    }

    getPayment(id) {
        return https.get(`/payments/${id}`, { headers: authHeader()});
    }

    addPayment(data) {
        return https.post("/payments", data, { headers: authHeader()});
    }

    updatePayment(id, data) {
        return https.patch(`/payments/${id}`, data, { headers: authHeader()});
    }

    deletePayment(id) {
        return https.delete(`/payments/${id}`, { headers: authHeader()});
    }

    getPayments({ q = '', sort = 3, category_id = '', year = '', month = '', user = '' } = {}) {
        return https.get(`/payments?q=${q}&sort=${sort}&category_id=${category_id}&year=${year}&month=${month}&user=${user}`, { headers: authHeader()});
    }
}

export default new PaymentService();