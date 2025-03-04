import axios from "axios";

const API_URL = process.env.VUE_APP_API_ENDPOINT;
console.log("auth service API_URL:" + API_URL);

class AuthService {

	login(user) {
		return axios
			.post(API_URL + "/auth/signin", {
				login: user.login,
				password: user.password,
			})
			.then(response => {
				if (response.data.accessToken) {
					// Перевіряємо, що accessToken дійсно існує
					localStorage.setItem("user", JSON.stringify(response.data));
				} else {
					throw new Error("No access token received");
				}
				return response.data;
			});
	}

	logout() {
		localStorage.removeItem("user");
	}

	register(user) {
		return axios.post(API_URL + "/auth/signup", {
			login: user.login,
			password: user.password,
			phone: user.phone,
			email: user.email,
			fullname: user.fullname,
		});
	}

	edit(user) {
		console.log("user: ", user, "user_id: ", user.user_id, "user.fullname: ", user.fullname);
		return axios.patch(API_URL + "/users/" + user.user_id, {
			login: user.login,
			password: user.password,
			phone: user.phone,
			email: user.email,
			fullname: user.fullname,
		});
	}
}

export default new AuthService();