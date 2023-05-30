import https from "../http-common";
import authHeader from './auth-header';

class ConfigService {

    getConfigTypes () {
        return https.get(`/config/config_types`);
    }

    getUserConfig() {
        return https.get("/users/config", { headers: authHeader()});
    }

    addConfig(data) {
        return https.post("/users/config", data, { headers: authHeader()});
    }

    getConfig(id) {
        return https.get(`/config/${id}`, { headers: authHeader()});
    }

    updateConfig(id, data) {
        return https.patch(`/config/${id}`, data, { headers: authHeader()});
    }

    deleteConfig(id) {
        return https.delete(`/config/${id}`, { headers: authHeader()});
    }
}

export default new ConfigService();