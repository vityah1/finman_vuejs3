import AuthService from "../services/auth.service";

const user = JSON.parse(localStorage.getItem("user"));
const initialState = user
	? { status: { loggedIn: true }, user }
	: { status: { loggedIn: false }, user: null };

export const auth = {
	namespaced: true,
	state: initialState,
	actions: {
		login({ commit }, user) {
			return AuthService.login(user).then(
				user => {
					commit("loginSuccess", user);
					return Promise.resolve(user);
				},
				error => {
					commit("loginFailure");
					return Promise.reject(error);
				},
			);
		},
		logout({ commit }) {
			try {
				localStorage.removeItem("user");
				commit("logout");
			} catch (error) {
				console.error("Logout error:", error);
			}
		},
		register({ commit }, user) {
			return AuthService.register(user).then(
				response => {
					commit("registerSuccess");
					return Promise.resolve(response.data);
				},
				error => {
					commit("registerFailure");
					return Promise.reject(error);
				},
			);
		},
		edit({ commit }, user) {
			return AuthService.edit(user).then(
				response => {
					// Оновлюємо локальне сховище та стан
					localStorage.setItem("user", JSON.stringify(response.data));
					commit("editSuccess", response.data);
					return response.data;
				},
				error => {
					commit("editFailure");
					return Promise.reject(error);
				},
			);
		},
	},
	mutations: {
		loginSuccess(state, user) {
			state.status.loggedIn = true;
			state.user = user;
		},
		loginFailure(state) {
			state.status.loggedIn = false;
			state.user = null;
		},
		logout(state) {
			state.status.loggedIn = false;
			state.user = null;
		},
		registerSuccess(state) {
			state.status.loggedIn = false;
		},
		registerFailure(state) {
			state.status.loggedIn = false;
		},
		editSuccess(state, user) {
			state.status.loggedIn = true;
			state.user = user;
		},
		editFailure(state) {
			state.status.loggedIn = true;
			state.user = null;
		},
	},
};