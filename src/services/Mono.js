import https from "../http-common";
import authHeader from './auth-header';


class Mono {

    getWebhook(username) {
        return https.get('/mono/webhook/' + username, { headers: authHeader() });
    }


    setWebhook(data) {
        return https.put("/mono/webhook", data, { headers: authHeader() });
    }

}

export default new Mono();