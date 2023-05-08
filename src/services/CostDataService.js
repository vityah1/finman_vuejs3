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

    getAll({ sort, period, cat } = {}) {
        if (sort == '') { sort = 1; }
        return https.get("/costs?sort=" + sort + "&period=" + period + "&cat=" + cat, { headers: authHeader() });
    }

    getCatCosts({ year = '', month = '', user = '' } = {}) {
        console.log(`getCatCosts => year: ${year}, month: ${month}, user: ${user}`)
        return https.get("/catcosts?year=" + year + "&month=" + month + "&user=" + user, { headers: authHeader() });
    }

    cats() {
        return https.get("/cats");
    }

    getYears() {
        return https.get("/years", { headers: authHeader() });
    }

    getMonths(year, user) {
        return https.get("/months/" + year + '?user=' + user, { headers: authHeader() });
    }

    subcats(cat = '') {
        return https.get("/subcats?cat=" + cat);
    }

    get(id) {
        return https.get(`/costs/${id}`, { headers: authHeader() });
    }

    create(data) {
        return https.post("/costs", data, { headers: authHeader() });
    }

    update(id, data) {
        return https.put(`/costs/${id}`, data, { headers: authHeader() });
    }

    delete(id) {
        return https.delete(`/costs/${id}`, { headers: authHeader() });
    }

    // deleteAll() {
    //     return https.delete(`/costs`);
    // }

    showCost({ q = '', sort = 3, cat = '', year = '', month = '', user = '' } = {}) {
        return https.get(`/costs?q=${q}&sort=${sort}&cat=${cat}&year=${year}&month=${month}&user=${user}`, { headers: authHeader() });
    }
}

export default new CostDataService();