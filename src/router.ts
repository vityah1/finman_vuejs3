import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
	{
		path: "/",
		name: "home",
		component: () => import("./components/AboutPage.vue"),
	},
	{
		path: "/about",
		name: "about",
		component: () => import("./components/AboutPage.vue"),
	},
	{
		path: "/login",
		name: "login",
		component: () => import("./components/User/UserLogin.vue"),
	},
	{
		path: "/register",
		name: "register",
		component: () => import("./components/User/UserRegister.vue"),
	},
	{
		path: "/profile",
		name: "profile",
		component: () => import("./components/User/UserProfile.vue"),
		meta: { requiresAuth: true }, // Додаємо мета-тег для авторизації
	},
	{
		path: "/config",
		name: "config",
		component: () => import("./components/User/ConfigUser.vue"),
		meta: { requiresAuth: true },
	},
	{
		path: "/category",
		name: "category",
		component: () => import("./components/User/UserCategory.vue"),
		meta: { requiresAuth: true },
	},
	{
		path: "/mono/user/token",
		name: "mono_user_token",
		component: () => import("./components/User/Mono/MonoSettings.vue"),
		meta: { requiresAuth: true },
	},
	{
		path: "/mono/payments",
		name: "mono_payments",
		component: () => import("./components/Banks/Mono.vue"),
		meta: { requiresAuth: true },
	},
	{
		path: "/api/import",
		name: "import",
		component: () => import("./components/Banks/BankForm.vue"),
		meta: { requiresAuth: true },
	},
	{
		path: "/mono/users",
		name: "mono_users",
		component: () => import("./components/User/Mono/MonoUsers.vue"),
		meta: { requiresAuth: true },
	},
	{
		path: "/payments/:year/:month/:category_id",
		name: "payments",
		component: () => import("./components/Payments/PmtYearMonCat.vue"),
		meta: { requiresAuth: true },
	},
	{
		path: "/payments/years",
		name: "payments_years",
		component: () => import("./components/Payments/Pmt.vue"),
		meta: { requiresAuth: true },
	},
	{
		path: "/payments/years/:year",
		name: "payments_year",
		component: () => import("./components/Payments/PmtYear.vue"),
		meta: { requiresAuth: true },
	},
	{
		path: "/payments/:year/:month",
		name: "payments_year_month",
		component: () => import("./components/Payments/PmtYearMon.vue"),
		meta: { requiresAuth: true },
	},
	{
		path: "/join-group/:code",
		name: "join-group",
		component: () => import("./components/User/JoinGroupPage.vue"),
		meta: { requiresAuth: true },
	},
];

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes,
});

// Додаємо навігаційний захист
router.beforeEach((to, from, next) => {
	const userStr = localStorage.getItem("user");
	let isLoggedIn = false;
	
	// Перевіряємо не тільки наявність user, а й валідність структури
	if (userStr) {
		try {
			const user = JSON.parse(userStr);
			isLoggedIn = user && user.accessToken;
			
			// Додаткова перевірка на валідність токена
			if (!isLoggedIn && to.matched.some(record => record.meta.requiresAuth)) {
				console.warn('Токен відсутній, але користувач намагається отримати доступ до захищеного маршруту');
			}
		} catch (error) {
			console.error('Невалідні дані користувача в localStorage:', error);
			// Видаляємо пошкоджені дані
			localStorage.removeItem("user");
			isLoggedIn = false;
		}
	}
	
	const authRequired = to.matched.some(record => record.meta.requiresAuth);
	
	// Якщо авторизація потрібна, але користувач не авторизований
	if (authRequired && !isLoggedIn) {
		console.log('Перенаправлення неавторизованого користувача на сторінку логіну');
		return next({
			name: 'login',
			query: { returnUrl: to.fullPath }
		});
	}
	
	// Якщо користувач авторизований і намагається зайти на login/register
	if (isLoggedIn && (to.name === 'login' || to.name === 'register')) {
		console.log('Авторизований користувач намагається зайти на сторінку логіну/реєстрації');
		return next('/');
	}
	
	next();
});

export default router;
