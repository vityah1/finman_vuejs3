import https from "../http-common";
import authHeader from './auth-header';

class CategoryService {

    getCategories() {
        return https.get("/categories", { headers: authHeader()})
                .then(response => {
                if (response.data) {
                    localStorage.setItem('categories', JSON.stringify(response.data));
                }
                return response.data;
            });
    }

    addCategory(data) {
        return https.post("/categories", data, { headers: authHeader()});
    }

    getCategory(id) {
        return https.get(`/categories/${id}`, { headers: authHeader()});
    }

    updateCategory(id, data) {
        return https.patch(`/categories/${id}`, data, { headers: authHeader()});
    }

    deleteCategory(id) {
        return https.delete(`/categories/${id}`, { headers: authHeader()});
    }
}

export default new CategoryService();