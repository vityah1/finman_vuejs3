<script>
export default {
	name: "app",
	computed: {
		currentUser() {
			try {
				return this.$store.state.auth.user;
			} catch {
				this.logOut();
				return "";
			}
		},
		currentYear() {
			return new Date().getFullYear();
		},
		currentMonth() {
			const monthIndex = new Date().getMonth();
			const month = monthIndex + 1;
			return month;
		},
		category_id() {
			if (this.$route.params.category_id) {
				return this.$route.params.category_id;
			} else {
				return this.$store.state.sprs.categories[0].id;
			}
		},
		selectedCurrency: {
			get() {
				console.log(`computed => selectedCurrency => get => this.$store.state.selectedCurrenc=${this.$store.state.sprs.selectedCurrency}`)
				return this.$store.state.sprs.selectedCurrency;
			},
			set(value) {
				this.$store.dispatch("sprs/updateSelectedCurrency", value);
			},
		},
	},
	methods: {
		logOut() {
			this.$store.dispatch("auth/logout");
			this.$router.push({ name: "login" });
		},
		AppFindPayments(q) {
			this.$router.push({ name: "payments", query: { q: q } });
		},
		GoToAddPayment() {
			const currentPath = this.$route.path;
			console.log("Current Path:", currentPath);
			const pattern = /^\/payments\/\d{4}\/\d{1,2}\/\d+/;
			const isMatchingRoute = pattern.test(currentPath);
			console.log("Is matching route:", isMatchingRoute);
			if (isMatchingRoute) {
				this.$store.commit("setButtonClicked", true);
				console.log("ButtonClicked:", this.$store.state.buttonClicked);
			} else {
				this.$router.push({
					name: "payments", query: { action: "add" },
					params: { year: this.currentYear, month: this.currentMonth, category_id: this.category_id },
				});
			}
		},
	},
};
</script>

<template>
	<link crossorigin="anonymous" href="https://use.fontawesome.com/releases/v5.2.0/css/all.css" integrity="sha384-hWVjflwFxL6sNzntih27bfxkr27PmbbK/iSvJ+a4+0owXq79v+lsFkW54bOGbiDQ" rel="stylesheet">
	<div class="container">
		<b-navbar toggleable="lg">
			<b-navbar-brand>
				<div v-if="currentUser" class="d-flex align-items-center">
					<select v-model="selectedCurrency" class="form-control form-control-sm me-2">
						<option value="USD">USD</option>
						<option value="EUR">EUR</option>
						<option value="UAH">UAH</option>
					</select>
					<button class="btn btn-sm custom-button" @click.prevent="GoToAddPayment()">
						<i class="fas fa-plus" style="color: #555;"></i></button>
				</div>
			</b-navbar-brand>
			<b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

			<b-collapse id="nav-collapse" is-nav>
				<b-navbar-nav>
					<b-nav-item>
						<router-link :to="{ path: '/' }" class="nav-link">
							<i class="fas fa-home"></i> Home
						</router-link>
					</b-nav-item>
					<b-nav-item v-if="currentUser">
						<router-link
							:to="{ name: 'payments_year_month', params: { year: currentYear, month: currentMonth }}"
							class="nav-link">
							Current
						</router-link>
					</b-nav-item>
					<b-nav-item v-if="currentUser">
						<router-link :to="{ name: 'payments',
            params: {action: 'last', year: currentYear, month: currentMonth, category_id: '_'} }" class="nav-link">
							Last
						</router-link>
					</b-nav-item>
					<b-nav-item v-if="currentUser">
						<router-link :to="{ name: 'payments_years' }" class="nav-link">
							Years
						</router-link>
					</b-nav-item>

					<b-nav-item-dropdown v-if="currentUser" text="Banks">
						<b-dropdown-item>
							<router-link :to="{ name: 'mono_user_token' }" class="nav-link">
								<i class="fas fa-paw"></i> Show tokens
							</router-link>
						</b-dropdown-item>
						<b-dropdown-item>
							<router-link :to="{ name: 'mono_users' }" class="nav-link">
								<i class="fas fa-paw"></i> Mono users
							</router-link>
						</b-dropdown-item>
						<b-dropdown-item>
							<router-link :to="{ name: 'mono_payments' }" class="nav-link">
								<i class="fas fa-paw"></i> Mono payments
							</router-link>
						</b-dropdown-item>

						<b-dropdown-item>
							<router-link :to="{ name: 'revolut' }" class="nav-link">
								<i class="fas fa-euro-sign"></i> Revolut
							</router-link>
						</b-dropdown-item>

						<b-dropdown-item>
							<router-link :to="{ name: 'wise' }" class="nav-link">
								<i class="fas fa-euro-sign"></i> Wise
							</router-link>
						</b-dropdown-item>
					</b-nav-item-dropdown>

					<b-nav-item-dropdown text="User">
						<b-dropdown-item>
							<router-link :to="{ name: 'login' }" class="nav-link">
								<i class="fas fa-sign-in-alt"></i> Login
							</router-link>
						</b-dropdown-item>
						<b-dropdown-item>
							<router-link :to="{ name: 'register' }" class="nav-link">
								<i class="fas fa-user-plus"></i> SignUp
							</router-link>
						</b-dropdown-item>
						<b-dropdown-item v-if="currentUser">
							<b-nav-item>
								<router-link :to="{ name: 'config' }" class="nav-link">
									<i class="fas fa-cog"></i> Settings
								</router-link>
							</b-nav-item>
						</b-dropdown-item>
						<b-dropdown-item v-if="currentUser">
							<b-nav-item>
								<router-link :to="{ name: 'category' }" class="nav-link">
									<i class="fas fa-cog"></i> Categories
								</router-link>
							</b-nav-item>
						</b-dropdown-item>
						<b-dropdown-item v-if="currentUser">
							<a class="nav-link" @click.prevent="logOut">
								<i class="fas fa-sign-out-alt"></i> Logout
							</a>
						</b-dropdown-item>
					</b-nav-item-dropdown>
					<b-nav-item>
						<router-link :to="{ name: 'about' }" class="nav-link">About</router-link>
					</b-nav-item>
				</b-navbar-nav>
			</b-collapse>
		</b-navbar>
		<div>
			<router-view :key="$router.fullPath" />
		</div>
	</div>
</template>

<style>
.custom-button {
  background-color: #e7e7e7;
  border-color: #e7e7e7;
  color: #555;
}
.custom-button:hover {
  background-color: #d6d6d6;
  border-color: #d6d6d6;
}
</style>