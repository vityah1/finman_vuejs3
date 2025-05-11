import AuthService from "../services/auth.service";

// Інтерфейси для типізації
interface User {
  id: number;
  username?: string;
  email?: string;
  accessToken: string;
  [key: string]: any;
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
    login({ commit }: any, user: any) {
      return AuthService.login(user).then(
        (user: User) => {
          commit("loginSuccess", user);
          return Promise.resolve(user);
        },
        (error: any) => {
          commit("loginFailure");
          console.error("Помилка при спробі входу:", error.response?.data || error.message);
          return Promise.reject(error);
        },
      );
    },
    logout({ commit }: any) {
      try {
        AuthService.logout();
        commit("logout");
      } catch (error) {
        console.error("Помилка при виході:", error);
      }
    },
    register({ commit }: any, user: any) {
      return AuthService.register(user).then(
        (response: any) => {
          commit("registerSuccess");
          return Promise.resolve(response.data);
        },
        (error: any) => {
          commit("registerFailure");
          console.error("Помилка при реєстрації:", error.response?.data || error.message);
          return Promise.reject(error);
        },
      );
    },
    edit({ commit }: any, user: any) {
      return AuthService.edit(user).then(
        (response: any) => {
          // Оновлюємо локальне сховище та стан
          localStorage.setItem("user", JSON.stringify(response.data));
          commit("editSuccess", response.data);
          return response.data;
        },
        (error: any) => {
          commit("editFailure");
          console.error("Помилка при редагуванні профілю:", error.response?.data || error.message);
          return Promise.reject(error);
        },
      );
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
