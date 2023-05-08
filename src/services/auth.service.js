import axios from 'axios';

// const API_URL = 'http://localhost:5000/api/auth';
// const API_URL = 'https://kt.if.ua/finman_api/api/auth';
// const API_URL = 'https://site--main--b4xj54d6jsp4.code.run/api';
const API_URL = process.env.VUE_APP_API_ENDPOINT;
console.log('API_URL:' +  API_URL);

class AuthService {
    login(user) {
        return axios
            .post(API_URL + '/signin', {
                username: user.username,
                password: user.password
            })
            .then(response => {
                if (response.data.accessToken) {
                    localStorage.setItem('user', JSON.stringify(response.data));
                }

                return response.data;
            });
    }

    logout() {
        localStorage.removeItem('user');
    }

    register(user) {
        return axios.post(API_URL + '/signup', {
            username: user.username,
            email: user.email,
            password: user.password
        });
    }
}

export default new AuthService();