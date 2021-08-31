import http from "../http-common";

// var optionAxios = {
//     headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//     }
// }

class CostDataService {
    getAll({ sort, period, cat } = {}) {
        if (sort == '') { sort = 1; }
        return http.get("/costs?sort=" + sort + "&period=" + period + "&cat=" + cat);
    }

    getCatCosts({ year = '', month = '' } = {}) {
        console.log(`getCatCosts => year: ${year}, month: ${month}`)
        return http.get("/catcosts?year=" + year + "&month=" + month);
    }

    cats() {
        return http.get("/cats");
    }

    getYears() {
        return http.get("/years");
    }

    getMonths(year) {
        return http.get("/months/" + year);
    }

    subcats(cat) {
        return http.get("/subcats?cat=" + cat);
    }

    get(id) {
        return http.get(`/costs/${id}`);
    }

    create(data) {
        return http.post("/costs", data);
    }

    update(id, data) {
        return http.put(`/costs/${id}`, data);
    }

    delete(id) {
        return http.delete(`/costs/${id}`);
    }

    // deleteAll() {
    //     return http.delete(`/costs`);
    // }

    FindCost({ q = '', sort = 3, cat = '', year = '', month = '' } = {}) {
        return http.get(`/costs?q=${q}&sort=${sort}&cat=${cat}&year=${year}&month=${month}`);
    }
}

export default new CostDataService();