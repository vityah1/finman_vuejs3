import { 
    userLoginApiAuthSigninPost, 
    createUserApiAuthSignupPost,
    editUserApiUsersUserIdPatch 
} from "@/api/auth/auth";
import authHeader from './auth-header';

const API_URL = process.env.VUE_APP_API_ENDPOINT;
console.log("auth service API_URL:" + API_URL);

// Інтерфейси для типізації
interface LoginCredentials {
    login: string;
    password: string;
}

interface UserRegistration {
    login: string;
    password: string;
    phone?: string;
    email?: string;
    fullname?: string;
}

interface UserEdit extends UserRegistration {
    user_id: number | string;
}

interface User {
    id: number;
    accessToken: string;
    [key: string]: any;
}

class AuthService {
    login(user: LoginCredentials) {
        return userLoginApiAuthSigninPost({
            login: user.login,
            password: user.password
        })
            .then(response => {
                // Типізуємо відповідь від сервера
                const data = response.data as User;
                if (data.accessToken) {
                    localStorage.setItem('user', JSON.stringify(data));
                } else {
                    throw new Error('No access token received');
                }
                return data;
            })
            .catch(error => {
                console.error('Помилка авторизації:', error.response?.data || error.message);
                throw error;
            });
    }

    logout() {
        localStorage.removeItem('user');
    }

    register(user: UserRegistration) {
        return createUserApiAuthSignupPost({
            login: user.login,
            password: user.password,
            phone: user.phone,
            email: user.email,
            fullname: user.fullname
        }, { headers: authHeader() })
            .catch(error => {
                console.error('Помилка реєстрації:', error.response?.data || error.message);
                throw error;
            });
    }

    edit(user: UserEdit) {
        console.log("user: ", user, "user_id: ", user.user_id, "user.fullname: ", user.fullname);
        
        // Перетворюємо user_id на number
        const userId = typeof user.user_id === 'string' ? parseInt(user.user_id, 10) : user.user_id;
        return editUserApiUsersUserIdPatch(userId, {
            login: user.login,
            password: user.password,
            phone: user.phone,
            email: user.email,
            fullname: user.fullname
        }, { headers: authHeader() })
            .catch(error => {
                console.error('Помилка редагування профілю:', error.response?.data || error.message);
                throw error;
            });
    }
}

export default new AuthService();
