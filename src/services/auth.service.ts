import { 
    userLoginApiAuthSigninPost, 
    createUserApiAuthSignupPost,
    editUserApiUsersUserIdPatch 
} from "@/api/auth/auth";
import type { LoginModel, UserCreate, UserUpdate } from "@/api/model";

// Інтерфейс для відповіді на логін (поширений з бекенду)
interface User {
    id: number;
    accessToken: string;
    login: string;
    email?: string;
    fullname?: string;
    phone?: string;
    [key: string]: any;
}

// Інтерфейс для редагування користувача з user_id
interface UserEdit extends UserUpdate {
    user_id: number | string;
}

class AuthService {
    async login(credentials: LoginModel): Promise<User> {
        try {
            const response = await userLoginApiAuthSigninPost(credentials);
            const data = response.data as User;
            
            if (data.accessToken) {
                localStorage.setItem('user', JSON.stringify(data));
                return data;
            } else {
                throw new Error('No access token received');
            }
        } catch (error) {
            console.error('Помилка авторизації:', error);
            throw error;
        }
    }

    logout(): void {
        localStorage.removeItem('user');
    }

    async register(userData: UserCreate): Promise<any> {
        try {
            const response = await createUserApiAuthSignupPost(userData);
            return response.data;
        } catch (error) {
            console.error('Помилка реєстрації:', error);
            throw error;
        }
    }

    async edit(user: UserEdit): Promise<any> {
        try {
            console.log("Editing user:", user, "user_id:", user.user_id);
            
            // Перетворюємо user_id на number
            const userId = typeof user.user_id === 'string' ? parseInt(user.user_id, 10) : user.user_id;
            
            // Створюємо об'єкт UserUpdate без user_id
            const updateData: UserUpdate = {
                login: user.login,
                password: user.password,
                phone: user.phone,
                email: user.email,
                fullname: user.fullname
            };
            
            const response = await editUserApiUsersUserIdPatch(userId, updateData);
            return response.data;
        } catch (error) {
            console.error('Помилка редагування профілю:', error);
            throw error;
        }
    }
}

export default new AuthService();
