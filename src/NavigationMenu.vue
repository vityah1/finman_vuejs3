<template>
	<b-navbar toggleable="lg">
		<b-navbar-brand>
			<div v-if="currentUser" class="d-flex align-items-center">
				<select v-model="selectedCurrency" class="form-control form-control-sm me-2">
					<option value="USD">USD</option>
					<option value="EUR">EUR</option>
					<option value="UAH">UAH</option>
				</select>
				<button class="btn btn-sm custom-button" @click.prevent="GoToAddPayment()">
					<i class="fas fa-plus" style="color: #555;"></i>
				</button>
				<PivotSelect v-if="showPivotSelect" :year="year" :month="month" :monoUserId="mono_user_id" />
			</div>
		</b-navbar-brand>


		<b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

		<b-collapse id="nav-collapse" is-nav>
			<b-navbar-nav>
				<b-nav-item>
					<router-link :to="{ path: '/' }" class="nav-link">
						<i class="fas fa-home"></i>
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
					<router-link
						:to="{ name: 'payments', params: {action: 'last', year: currentYear, month: currentMonth, category_id: '_' }}"
						class="nav-link">
						Last
					</router-link>
				</b-nav-item>
				<b-nav-item v-if="currentUser">
					<router-link :to="{ name: 'payments_years' }" class="nav-link">
						Years
					</router-link>
				</b-nav-item>

				<b-nav-item-dropdown v-if="currentUser" text="Banks">
					<template #button-content>
						<i class="fas fa-university"></i> Banks
					</template>
					<b-dropdown-item>
						<router-link :to="{ name: 'mono_payments' }" class="nav-link">
							<i class="fas fa-paw"></i> Mono
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
					<b-dropdown-item>
						<router-link :to="{ name: 'p24' }" class="nav-link">
							<i class="fas fa-uah-sign"></i> P24
						</router-link>
					</b-dropdown-item>
				</b-nav-item-dropdown>

				<b-nav-item-dropdown text="User">
					<template #button-content>
						<i class="fas fa-user"></i> User
					</template>
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
					<b-dropdown-divider v-if="currentUser"></b-dropdown-divider>
					<b-dropdown-item v-if="currentUser">
						<router-link :to="{ name: 'mono_user_token' }" class="nav-link">
							<i class="fas fa-paw"></i> Mono: tokens
						</router-link>
					</b-dropdown-item>
					<b-dropdown-item v-if="currentUser">
						<router-link :to="{ name: 'mono_users' }" class="nav-link">
							<i class="fas fa-paw"></i> Mono: users
						</router-link>
						</b-dropdown-item>
						<b-dropdown-divider></b-dropdown-divider>
					<b-dropdown-item v-if="currentUser">
						<router-link :to="{ name: 'config' }" class="nav-link">
							<i class="fas fa-cog"></i> Settings
						</router-link>
					</b-dropdown-item>
					<b-dropdown-item v-if="currentUser">
						<router-link :to="{ name: 'category' }" class="nav-link">
							<i class="fas fa-cog"></i> Categories
						</router-link>
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
</template>

<script>
import PivotSelect from "@/components/PivotSelect.vue";

export default {
	name: "NavigationMenu",
	components: {
		PivotSelect
	},
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
				return this.$store.state.sprs.selectedCurrency;
			},
			set(value) {
				this.$store.dispatch("sprs/updateSelectedCurrency", value);
			},
		},
		showPivotSelect() {
			return this.year && this.month;
		},
	},
	data() {
		return {
			year: null,
			month: null,
			mono_user_id: null,
		};
	},
	watch: {
		"$route.params.year": {
			handler(newYear) {
				this.year = newYear;
			},
			immediate: true,
		},
		"$route.params.month": {
			handler(newMonth) {
				this.month = newMonth;
			},
			immediate: true,
		},
		"$route.params.mono_user_id": {
			handler(newMonoUserId) {
				this.mono_user_id = newMonoUserId;
			},
			immediate: true,
		},
	},
	methods: {
		logOut() {
			this.$store.dispatch("auth/logout");
			this.$router.push({ name: "login" });
		},
		GoToAddPayment() {
			const currentPath = this.$route.path;
			const pattern = /^\/payments\/\d{4}\/\d{1,2}\/\d+/;
			const isMatchingRoute = pattern.test(currentPath);
			if (isMatchingRoute) {
				this.$store.commit("setButtonClicked", true);
			} else {
				this.$router.push({
					name: "payments",
					params: {
						year: this.currentYear,
						month: this.currentMonth,
						category_id: this.category_id
					},
					query: {
						action: "add"
					}
				});
			}
		},
	},
};
</script>

<style scoped>
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
