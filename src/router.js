import { createRouter, createWebHistory } from "vue-router";

const routes = [
	{
		path: "/",
		name: "home",
		component: () => import("./components/AboutPage"),
	},
	{
		path: "/about",
		name: "about",
		component: () => import("./components/AboutPage"),
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
	},
	{
		path: "/category",
		name: "category",
		component: () => import("./components/User/UserCategory.vue"),
	},
	{
		path: "/mono/user/token",
		name: "mono_user_token",
		component: () => import("./components/User/Mono/MonoSettings.vue"),
	},
	{
		path: "/mono/payments",
		name: "mono_payments",
		component: () => import("./components/Banks/Mono.vue"),
	},
	{
		path: "/revolut/import",
		name: "revolut",
		component: () => import("./components/Banks/BankForm.vue"),
		meta: { bankName: "revolut" },
	},
	{
		path: "/wise/import",
		name: "wise",
		component: () => import("./components/Banks/BankForm.vue"),
		meta: { bankName: "wise" },
	},
	{
		path: "/p24/import",
		name: "p24",
		component: () => import("./components/Banks/BankForm.vue"),
		meta: { bankName: "p24" },
	},
	{
		path: "/mono/users",
		name: "mono_users",
		component: () => import("./components/User/Mono/MonoUsers.vue"),
	},
	{
		path: "/payments/:year/:month/:category_id",
		name: "payments",
		component: () => import("./components/Payments/PmtYearMonCat.vue"),
	},
	{
		path: "/payments/:year/:month/pivot",
		name: "pivot_payments",
		component: () => import("./components/Payments/PivotData.vue"),
	},
	{
		path: "/payments/:year/:month/pivot7",
		name: "pivot_payments_7",
		component: () => import("./components/Payments/PivotData7.vue"),
	},
	{
		path: "/payments/years",
		name: "payments_years",
		component: () => import("./components/Payments/Pmt.vue"),
	},
	{
		path: "/payments/years/:year",
		name: "payments_year",
		component: () => import("./components/Payments/PmtYear.vue"),
	},
	{
		path: "/payments/:year/:month",
		name: "payments_year_month",
		component: () => import("./components/Payments/PmtYearMon.vue"),
	},
	{
		path: "/join-group/:code",
		name: "join-group",
		component: () => import("./components/User/JoinGroupPage.vue"),
		meta: { requiresAuth: true },
	},
];

const router = createRouter({
	base: "/",
	history: createWebHistory(process.env.BASE_URL),
	routes,
});

// Додаємо навігаційний захист
router.beforeEach((to, from, next) => {
	const loggedIn = localStorage.getItem("user");
	const authRequired = to.matched.some(record => record.meta.requiresAuth);

	if (authRequired && !loggedIn) {
		return next("/login");
	}
	next();
});

export default router;
