import { aboutApiAboutGet } from '../api/api/api';

// Центральний обробник помилок
const handleRequestError = (error: any, message: string) => {
    console.error(message, error.response?.data || error.message);
    throw error;
};

/**
 * Сервіс для роботи з даними користувача
 */
class UserService {
    /**
     * Отримання публічного вмісту
     */
    getPublicContent() {
        return aboutApiAboutGet()
            .catch(error => handleRequestError(error, 'Помилка отримання публічного вмісту:'));
    }

    // Закоментовані методи, які можна реалізувати в майбутньому
    // getUserBoard() {
    //     return axios.get(API_URL + 'user');
    // }

    // getModeratorBoard() {
    //     return axios.get(API_URL + 'mod');
    // }

    // getAdminBoard() {
    //     return axios.get(API_URL + 'admin');
    // }
}

export default new UserService();
