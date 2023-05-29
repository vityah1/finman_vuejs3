import https from "../http-common";
// import axios from 'axios';
import authHeader from './auth-header';

// var optionAxios = {
//     headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//     }
// }

class CostDataService {



    getAbout() {
        return https.get('/about');
    }

    getAll({ sort, period, category_id } = {}) {
        if (sort == '') { sort = 1; }
        return https.get("/payments?sort=" + sort + "&period=" + period + "&category_id=" + category_id, { headers: authHeader()});
    }

    getCatCosts({ year = '', month = '', user = '' } = {}) {
        console.log(`getCatCosts => year: ${year}, month: ${month}, user: ${user}`)
        return https.get("/payments/period?year=" + year + "&month=" + month + "&user=" + user, { headers: authHeader()});
    }

    cats() {
        return https.get("/categories", { headers: authHeader()});
    }

    getYears() {
        return https.get("/payments/years", { headers: authHeader()});
    }

    getMonths(year, user) {
        return https.get("payments/years/" + year + '?user=' + user, { headers: authHeader()});
    }

    subcats(category_id = '') {
        return https.get("/categories/childs?category_id" + category_id, { headers: authHeader()});
    }

    get(id) {
        return https.get(`/payments/${id}`, { headers: authHeader()});
    }

    create(data) {
        return https.post("/payments", data, { headers: authHeader()});
    }

    update(id, data) {
        return https.put(`/payments/${id}`, data, { headers: authHeader()});
    }

    delete(id) {
        return https.delete(`/payments/${id}`, { headers: authHeader()});
    }

    // deleteAll() {
    //     return https.delete(`/payments`);
    // }

    showCost({ q = '', sort = 3, category_id = '', year = '', month = '', user = '' } = {}) {
        return https.get(`/payments?q=${q}&sort=${sort}&category_id=${category_id}&year=${year}&month=${month}&user=${user}`, { headers: authHeader()});
    }
}

export default new CostDataService();