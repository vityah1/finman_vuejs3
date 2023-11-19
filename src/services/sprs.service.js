import axios from 'axios';

const API_URL = process.env.VUE_APP_API_ENDPOINT;
console.log('sprs service API_URL:' +  API_URL);

class SprsService {
    get_currencies() {
        return axios
            .get(API_URL + '/sprs/currency',)
            .then(response => {
                if (response.data) {
                    localStorage.setItem('currencies', JSON.stringify(response.data));
                }
                return response.data;
            });
    }

    get_sources() {
        return axios
            .get(API_URL + '/sprs/source',)
            .then(response => {
                if (response.data) {
                    localStorage.setItem('sources', JSON.stringify(response.data));
                }
                return response.data;
            });
    }

    get_type_payments() {
        return axios
            .get(API_URL + '/sprs/type_payment',)
            .then(response => {
                if (response.data) {
                    localStorage.setItem('type_payment', JSON.stringify(response.data));
                }
                return response.data;
            });
    } 
  
}

export default new SprsService();