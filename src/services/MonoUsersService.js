import https from "../http-common";
import authHeader from './auth-header';

class MonoUsersService {

    getMonoUsers() {
        return https.get("/mono/users", { headers: authHeader()});
    }

    addMonoUser(data) {
        return https.post("/mono/users", data, { headers: authHeader()});
    }

    getMonoUser(id) {
        return https.get(`/mono/users/${id}`, { headers: authHeader()});
    }

    updateMonoUser(id, data) {
        return https.patch(`/mono/users/${id}`, data, { headers: authHeader()});
    }

    deleteMonoUser(id) {
        return https.delete(`/mono/users/${id}`, { headers: authHeader()});
    }
}

export default new MonoUsersService();