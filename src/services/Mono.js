import https from "../http-common";
import authHeader from './auth-header';

class Mono {

    GetMonoUsersInfo(user_id) {
        return https.get('/users/' + user_id + '/mono/info/', { headers: authHeader() });
    }


    setWebhook(data) {
        return https.put("/mono/users/" + data.mono_user_id + "/webhook", data, { headers: authHeader() });
    }

    getPayments(data) {
        console.log(data.import_mode)
        if (data.import_mode === true)
        {
            return https.post("/mono/payments", data, { headers: authHeader() });
        }
        else
        {
            return https.get("/mono/payments", {params: data, headers: authHeader() });
        }
    }  

}

export default new Mono();