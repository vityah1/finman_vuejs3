import https from "../http-common";
import authHeader from './auth-header';

class MonoService {

    GetMonoUsersInfo(user_id) {
        return https.get('/users/' + user_id + '/mono/info/', { headers: authHeader() });
    }


    setWebhook(data) {
        return https.put("/mono/users/" + data.mono_user_id + "/webhook", data, { headers: authHeader() });
    }

    getMonoPayments(data) {
        console.log(data.import_mode)
        return https.post("/mono/payments", data, { headers: authHeader() });
    }

}

export default new MonoService();