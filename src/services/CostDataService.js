import http from "../http-common";
// import axios from 'axios';
import authHeader from './auth-header';

// var optionAxios = {
//     headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//     }
// }

class CostDataService {



    getAbout() {
        return http.get('/about');
    }

    getAll({ sort, period, cat } = {}) {
        if (sort == '') { sort = 1; }
        return http.get("/costs?sort=" + sort + "&period=" + period + "&cat=" + cat, { headers: authHeader() });
    }

    getCatCosts({ year = '', month = '' } = {}) {
        console.log(`getCatCosts => year: ${year}, month: ${month}`)
        return http.get("/catcosts?year=" + year + "&month=" + month, { headers: authHeader() });
    }

    cats() {
        return http.get("/cats");
    }

    getYears() {
        return http.get("/years", { headers: authHeader() });
    }

    getMonths(year) {
        return http.get("/months/" + year, { headers: authHeader() });
    }

    subcats(cat) {
        return http.get("/subcats?cat=" + cat);
    }

    get(id) {
        return http.get(`/costs/${id}`, { headers: authHeader() });
    }

    create(data) {
        return http.post("/costs", data, { headers: authHeader() });
    }

    update(id, data) {
        return http.put(`/costs/${id}`, data, { headers: authHeader() });
    }

    delete(id) {
        return http.delete(`/costs/${id}`, { headers: authHeader() });
    }

    // deleteAll() {
    //     return http.delete(`/costs`);
    // }

    showCost({ q = '', sort = 3, cat = '', year = '', month = '' } = {}) {
        return http.get(`/costs?q=${q}&sort=${sort}&cat=${cat}&year=${year}&month=${month}`, { headers: authHeader() });
    }
}

export default new CostDataService();