import http from "../http-common";

// var optionAxios = {
//     headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//     }
// }

class CostDataService {
    getAll(sort) {
        if (sort == '') { sort = 1; }
        return http.get("/costs?sort=" + sort);
    }

    getCatCosts() {
        return http.get("/catcosts");
    }

    cats() {
        return http.get("/cats");
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

    FindCost(q) {
        return http.get(`/costs?q=${q}`);
    }
}

export default new CostDataService();