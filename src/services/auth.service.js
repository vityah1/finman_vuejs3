import axios from 'axios';

// const API_URL = 'http://localhost:5000/api/auth';
// const API_URL = 'https://kt.if.ua/finman_api/api/auth';
// const API_URL = 'https://site--main--b4xj54d6jsp4.code.run/api';
const API_URL = process.env.VUE_APP_API_ENDPOINT;
console.log('API_URL:' +  API_URL);

class AuthService {
    login(user) {
        return axios
            .post(API_URL + '/auth/signin', {
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
        return axios.post(API_URL + '/auth/signup', {
            username: user.username,
            password: user.password,
            phone: user.phone,
            email: user.email,
            fullname: user.fullname,
        });
    }

    edit(user) {
        console.log('user_id: ', user.user_id, 'user.fullname: ', user.fullname)
        return axios.patch(API_URL + '/users/' + user.user_id, {
            username: user.username,
            password: user.password,
            phone: user.phone,
            email: user.email,
            fullname: user.fullname,
        });
    }    
}

export default new AuthService();