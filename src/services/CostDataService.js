import http from "../http-common";

class CostDataService {
    getAll() {
        return http.get("/costs");
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

    deleteAll() {
        return http.delete(`/costs`);
    }

    findByCat(cat) {
        return http.get(`/costs?cat=${cat}`);
    }
}

export default new CostDataService();