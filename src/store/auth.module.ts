import AuthService from "../services/auth.service";
import type { LoginModel, UserCreate, UserUpdate } from "@/api/model";

// Інтерфейси для типізації
interface User {
  id: number;
  username?: string;
  email?: string;
  accessToken: string;
  login: string;
  fullname?: string;
  phone?: string;
  [key: string]: any;
}

// Інтерфейс для редагування користувача
interface UserEdit extends UserUpdate {
  user_id: number | string;
}

interface AuthState {
  status: {
    loggedIn: boolean;
  };
  user: User | null;
}

// Початковий стан
const user = localStorage.getItem("user");
const initialState: AuthState = user
  ? { status: { loggedIn: true }, user: JSON.parse(user) }
  : { status: { loggedIn: false }, user: null };

export const auth = {
  namespaced: true,
  state: initialState,
  actions: {
    async checkAuth({ commit, state }: any) {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        console.log("checkAuth: користувач відсутній в localStorage");
        commit("logout");
        return false;
      }
      
      try {
        const user = JSON.parse(userStr);
        if (!user || !user.accessToken) {
          console.log("checkAuth: відсутній токен доступу");
          commit("logout");
          return false;
        }
        
        console.log("checkAuth: перевіряємо валідність токену через API...");
        // Виконуємо перевірку валідності токену через запит до API
        try {
          // Використовуємо API для перевірки валідності токена
          const isValid = await AuthService.validateToken();
          if (!isValid) {
            console.log("checkAuth: токен недійсний");
            commit("logout");
            return false;
          }
          
          console.log("checkAuth: токен валідний, користувач авторизований");
          // Якщо токен валідний, встановлюємо користувача в state
          commit("loginSuccess", user);
          return true;
        } catch (apiError: any) {
          console.error("checkAuth: помилка валідації токену:", apiError?.response?.status || apiError.message);
          
          // Якщо це помилка 401/403 - токен точно протух
          if (apiError?.response?.status === 401 || apiError?.response?.status === 403) {
            console.log("checkAuth: токен протух (401/403), виконуємо logout");
          } else {
            console.log("checkAuth: інша помилка API, можливо проблеми з мережею");
          }
          
          commit("logout");
          return false;
        }
      } catch (error) {
        console.error("checkAuth: критична помилка при перевірці авторизації:", error);
        commit("logout");
        return false;
      }
    },
    async login({ commit }: any, credentials: LoginModel) {
      try {
        const user = await AuthService.login(credentials);
        commit("loginSuccess", user);
        return Promise.resolve(user);
      } catch (error: any) {
        commit("loginFailure");
        console.error("Помилка при спробі входу:", error.response?.data || error.message);
        return Promise.reject(error);
      }
    },
    logout({ commit }: any) {
      try {
        AuthService.logout();
        commit("logout");
      } catch (error) {
        console.error("Помилка при виході:", error);
      }
    },
    async register({ commit }: any, userData: UserCreate) {
      try {
        const response = await AuthService.register(userData);
        commit("registerSuccess");
        return Promise.resolve(response);
      } catch (error: any) {
        commit("registerFailure");
        console.error("Помилка при реєстрації:", error.response?.data || error.message);
        return Promise.reject(error);
      }
    },
    async edit({ commit }: any, user: UserEdit) {
      try {
        const response = await AuthService.edit(user);
        // Оновлюємо локальне сховище та стан
        localStorage.setItem("user", JSON.stringify(response));
        commit("editSuccess", response);
        return response;
      } catch (error: any) {
        commit("editFailure");
        console.error("Помилка при редагуванні профілю:", error.response?.data || error.message);
        return Promise.reject(error);
      }
    },
  },
  mutations: {
    loginSuccess(state: AuthState, user: User) {
      state.status.loggedIn = true;
      state.user = user;
    },
    loginFailure(state: AuthState) {
      state.status.loggedIn = false;
      state.user = null;
    },
    logout(state: AuthState) {
      state.status.loggedIn = false;
      state.user = null;
    },
    registerSuccess(state: AuthState) {
      state.status.loggedIn = false;
    },
    registerFailure(state: AuthState) {
      state.status.loggedIn = false;
    },
    editSuccess(state: AuthState, user: User) {
      state.status.loggedIn = true;
      state.user = user;
    },
    editFailure(state: AuthState) {
      state.status.loggedIn = true;
      state.user = null;
    },
  },
};
