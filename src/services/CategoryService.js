import https from "../http-common";
import authHeader from './auth-header';

class CategoryService {

    getCategories() {
        return https.get("/sprs/categories", { headers: authHeader()});
    }

    addCategory(data) {
        return https.post("/sprs/categories", data, { headers: authHeader()});
    }

    getCategory(id) {
        return https.get(`/sprs/categories/${id}`, { headers: authHeader()});
    }

    updateCategory(id, data) {
        return https.patch(`/sprs/categories/${id}`, data, { headers: authHeader()});
    }

    deleteCategory(id) {
        return https.delete(`/sprs/categories/${id}`, { headers: authHeader()});
    }
}

export default new CategoryService();