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
        if (data.import_mode === 'import')
        {
            return https.post("/mono/payments", data, { headers: authHeader() });
        }
        else if (data.import_mode === 'show')
        {
            return https.get("/mono/payments", {params: data, headers: authHeader() });
        }
        else if (data.import_mode === 'sync')
        {
            return https.patch("/mono/payments", data, {headers: authHeader() });
        }        
    }  

}

export default new Mono();