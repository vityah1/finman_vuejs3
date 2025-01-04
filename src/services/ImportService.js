import https from "../http-common";
import authHeader from './auth-header';

class ImportService {

    UploadFile(file, action, bank) {
        console.log(action)
        const formData = new FormData();
        formData.append('file', file);
        formData.append('action', action);
        const headers = {
            'Content-Type': 'multipart/form-data',
          }
            return https.post(`/${bank}/import`, formData, { headers: {...authHeader(), ...headers}});
        }
    }

export default new ImportService();