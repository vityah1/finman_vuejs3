import http from "../http-common";

class CostDataService {
    getAll() {
        return http.get("/costs");
    }

    cats() {
        return http.get("/cats");
    }

    subcats(cat) {
        return http.get("/subcats?="+cat);
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