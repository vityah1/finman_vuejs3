import { createWebHistory, createRouter } from "vue-router";


const routes = [
    {
        path: "/",
        name: "home",
        component: () => import("./components/AboutPage")
    },
    {
        path: "/about",
        name: "about",
        component: () => import("./components/AboutPage"),
    },
    {
        path: "/login",
        name: "login",
        // component: Login,
        component: () => import("./components/UserLogin"),
    },
    {
        path: "/register",
        name: "register",
        component: () => import("./components/UserRegister"),
    },
    {
        path: "/profile",
        name: "profile",
        component: () => import("./components/UserProfile"),
    },           
    {
        path: "/config",
        name: "config",
        component: () => import("./components/ConfigUser")
    },           
    {
        path: "/category",
        name: "category",
        component: () => import("./components/UserCategory")
    },    
    {
        path: "/mono/user/token",
        name: "mono_user_token",
        component: () => import("./components/MonoSettings")
    }, 
    {
        path: "/mono/payments",
        name: "mono_payments",
        component: () => import("./components/MonoPayments")
    },  
    {
        path: "/revolut/import",
        name: "revolut",
        component: () => import("./components/Revolut")
    },
    {
        path: "/wise/import",
        name: "wise",
        component: () => import("./components/Wise")
    },
    {
        path: "/mono/users",
        name: "mono_users",
        component: () => import("./components/MonoUsers")
    },        
    {
        path: "/payments/:year/:month/:category_id",
        name: "payments",
        component: () => import("./components/PaymentsDetail"),
    },   
    {
        path: "/payments/years",
        name: "payments_years",
        component: () => import("./components/PaymentsYears")
    },
    {
        path: "/payments/years/:year",
        name: "payments_months",
        component: () => import("./components/PaymentsInYear")
    },
    {
        path: "/payments/:year/:month",
        // alias: "/catpayments",
        name: "payments_year_month",
        component: () => import("./components/PaymentYearMonth")
    },
];

const router = createRouter({
    base: "/finman",
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

export default router;