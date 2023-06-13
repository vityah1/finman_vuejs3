import https from "../http-common";
import authHeader from './auth-header';

class RevolutService {

    UploadFile(file, action) {
        console.log(action)
        const formData = new FormData();
        formData.append('file', file);
        formData.append('action', action);
        const headers = {
            'Content-Type': 'multipart/form-data',
          }        
            return https.post("/revolut/import", formData, { headers: {...authHeader(), ...headers}});
        }
    }

export default new RevolutService();