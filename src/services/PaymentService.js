import https from "../http-common";
import authHeader from './auth-header';
// import store from '../store';

class PaymentService {

    getAbout() {
        return https.get('/about');
    }

    getPaymentsPeriod(params) {
        return https.get("/payments/period", {params, headers: authHeader()});
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

    getPaymentsInYear(year) {
        return https.get("/payments/years/" + year , { headers: authHeader()});
    }

    getPayment(id) {
        return https.get(`/payments/${id}`, { headers: authHeader()});
    }

    addPayment(data) {
        console.log('addPayment: ', data);
        return https.post("/payments", data, { headers: authHeader()});
    }

    updatePayment(id, data) {
        return https.patch(`/payments/${id}`, data, { headers: authHeader()});
    }

    deletePayment(id) {
        return https.delete(`/payments/${id}`, { headers: authHeader()});
    }

    getPayments(data) {
        // const selectedCurrency = store.state.sprs.selectedCurrency;
        // const params = {...data, currency: selectedCurrency};
        return https.get('/payments', {params: data, headers: authHeader()});
    }
}

export default new PaymentService();