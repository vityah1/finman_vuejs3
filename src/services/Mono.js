import https from "../http-common";
import authHeader from './auth-header';

class Mono {

    getWebhook(username) {
        return https.get('/mono/webhook/' + username, { headers: authHeader() });
    }


    setWebhook(data) {
        return https.put("/mono/webhook", data, { headers: authHeader() });
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