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
						Поточний
					</router-link>
				</b-nav-item>
				<b-nav-item v-if="currentUser">
					<router-link
						:to="{ name: 'payments', params: {action: 'last', year: currentYear, month: currentMonth, category_id: '_' }}"
						class="nav-link">
						Останні
					</router-link>
				</b-nav-item>
				<b-nav-item v-if="currentUser">
					<router-link :to="{ name: 'payments_years' }" class="nav-link" @click="refreshYears">
						Роки
					</router-link>
				</b-nav-item>

				<b-nav-item-dropdown v-if="currentUser" text="Банки">
					<template #button-content>
						<i class="fas fa-university"></i> Банки
					</template>
					<b-dropdown-item>
						<router-link :to="{ name: 'mono_payments' }" class="nav-link">
							<i class="fas fa-paw"></i> Mono
						</router-link>
					</b-dropdown-item>

					<b-dropdown-item>
						<router-link :to="{ name: 'import' }" class="nav-link">
							<i class="fas fa-file-import"></i> Імпорт
						</router-link>
					</b-dropdown-item>
				</b-nav-item-dropdown>

				<b-nav-item-dropdown v-if="currentUser" text="Комунальні">
					<template #button-content>
						<i class="fas fa-home"></i> Комунальні
					</template>
					<b-dropdown-item>
						<router-link :to="{ name: 'utilities' }" class="nav-link">
							<i class="fas fa-chart-line"></i> Головна
						</router-link>
					</b-dropdown-item>
					<b-dropdown-item>
						<router-link :to="{ name: 'utilities_addresses' }" class="nav-link">
							<i class="fas fa-map-marker-alt"></i> Адреси
						</router-link>
					</b-dropdown-item>
					<b-dropdown-item>
						<router-link :to="{ name: 'utilities_add_reading' }" class="nav-link">
							<i class="fas fa-plus"></i> Додати показники
						</router-link>
					</b-dropdown-item>
				</b-nav-item-dropdown>

				<b-nav-item-dropdown text="Користувач">
					<template #button-content>
						<i class="fas fa-user"></i> Користувач
					</template>

					<template v-if="!currentUser">
						<b-dropdown-item>
							<router-link :to="{ name: 'login' }" class="nav-link">
								<i class="fas fa-sign-in-alt"></i> Вхід
							</router-link>
						</b-dropdown-item>
						<b-dropdown-item>
							<router-link :to="{ name: 'register' }" class="nav-link">
								<i class="fas fa-user-plus"></i> Реєстрація
							</router-link>
						</b-dropdown-item>
					</template>

					<template v-else>
						<b-dropdown-item>
							<router-link :to="{ name: 'profile' }" class="nav-link">
								<i class="fas fa-user"></i> Профіль
							</router-link>
						</b-dropdown-item>

						<b-dropdown-divider></b-dropdown-divider>
						<b-dropdown-item v-if="currentUser">
							<router-link :to="{ name: 'mono_user_token' }" class="nav-link">
								<i class="fas fa-paw"></i> Mono: токени
							</router-link>
						</b-dropdown-item>
						<b-dropdown-item v-if="currentUser">
							<router-link :to="{ name: 'mono_users' }" class="nav-link">
								<i class="fas fa-paw"></i> Mono: користувачі
							</router-link>
						</b-dropdown-item>
						<b-dropdown-divider></b-dropdown-divider>
						<b-dropdown-item v-if="currentUser">
							<router-link :to="{ name: 'config' }" class="nav-link">
								<i class="fas fa-cog"></i> Налаштування
							</router-link>
						</b-dropdown-item>
						<b-dropdown-item v-if="currentUser">
							<router-link :to="{ name: 'category' }" class="nav-link">
								<i class="fas fa-cog"></i> Категорії
							</router-link>
						</b-dropdown-item>
						<b-dropdown-divider></b-dropdown-divider>
						<b-dropdown-item>
							<a class="nav-link" @click.prevent="logOut">
								<i class="fas fa-sign-out-alt"></i> Вихід
							</a>
						</b-dropdown-item>
					</template>
				</b-nav-item-dropdown>

				<b-nav-item>
					<router-link :to="{ name: 'about' }" class="nav-link">Про програму</router-link>
				</b-nav-item>
			</b-navbar-nav>
		</b-collapse>
	</b-navbar>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AuthService from "./services/auth.service";
import { refreshQueries } from "./query-client";

export default defineComponent({
	name: "NavigationMenu",
	components: {},
	computed: {
		currentUser() {
			try {
				return (this.$store as any).state.auth.user;
			} catch {
				this.logOut();
				return null;
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
				return (this.$store as any).state.sprs.categories?.[0]?.id;
			}
		},
		selectedCurrency: {
			get() {
				return (this.$store as any).state.sprs.selectedCurrency;
			},
			set(value) {
				this.$store.dispatch("sprs/updateSelectedCurrency", value);
			},
		},
	},
	data() {
		return {
			year: null as string | null,
			month: null as string | null,
			mono_user_id: null as string | null,
		};
	},
	async created() {
		// Виконуємо перевірку валідності токена при завантаженні
		if (this.currentUser) {
			try {
				const isValid = await AuthService.validateToken();
				if (!isValid) {
					console.log("Токен виявився недійсним при завантаженні меню навігації");
					this.logOut();
				} else {
					console.log("Токен підтверджено як валідний при завантаженні меню");
				}
			} catch (error) {
				console.error("Помилка при валідації токена:", error);
				this.logOut();
			}
		}
	},
	watch: {
		"$route.params.year": {
			handler(newYear: string) {
				this.year = newYear;
			},
			immediate: true,
		},
		"$route.params.month": {
			handler(newMonth: string) {
				this.month = newMonth;
			},
			immediate: true,
		},
		"$route.params.mono_user_id": {
			handler(newMonoUserId: string) {
				this.mono_user_id = newMonoUserId;
			},
			immediate: true,
		},
	},
	methods: {
		logOut() {
			try {
				this.$store.dispatch("auth/logout");
				this.$router.push({ name: "login" });
			} catch (error) {
				console.error("Помилка виходу:", error);
				this.$router.push({ name: "login" });
			}
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
						category_id: this.category_id,
					},
					query: {
						action: "add",
					},
				});
			}
		},
		refreshYears() {
			// Запускаємо оновлення років при кліку на посилання Years
			if (this.currentUser) {
				// Оновлюємо кеш запитів за роками
				refreshQueries(['api', 'payments', 'years'])
					.then(() => {
						console.log("Кеш років платежів успішно оновлено при навігації");
					})
					.catch(error => {
						console.error("Помилка оновлення кешу років при навігації:", error);
					});
				
				// Також робимо додатковий запит для оновлення даних у компоненті
				const PaymentService = require("./services/PaymentService").default;
				PaymentService.getPaymentsYears({currency: this.$store.state.sprs.selectedCurrency || "UAH"})
					.then(() => {
						console.log("Роки платежів успішно оновлено при навігації");
					})
					.catch(error => {
						console.error("Помилка оновлення років при навігації:", error);
					});
			}
		},
	},
});
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