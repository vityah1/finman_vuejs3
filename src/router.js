import { createWebHistory, createRouter } from "vue-router";


const routes = [
    {
        path: "/config",
        name: "config",
        component: () => import("./components/Config")
    },    
    {
        path: "/mono/users/token",
        name: "mono_user_token",
        component: () => import("./components/Mono")
    }, 
    {
        path: "/mono/payments",
        name: "mono_payments",
        component: () => import("./components/MonoPayments")
    }, 
    {
        path: "/mono/users",
        name: "mono_users",
        component: () => import("./components/MonoUsers")
    },        
    {
        path: "/payments",
        // alias: "payments",
        name: "payments",
        component: () => import("./components/Payments")
    }, {
        path: "/payments/last",
        // alias: "payments",
        name: "payments_last",
        component: () => import("./components/Payments?category_name=last")
    },
    {
        path: "/payments/:id",
        name: "payment",
        component: () => import("./components/Payments")
    },    
    {
        path: "/payments/years",
        // alias: "years",
        name: "payments_years",
        component: () => import("./components/PaymentsYears")
    },
    {
        path: "/payments/years/:year",
        alias: "/payments/years/:year",
        name: "payments_months",
        component: () => import("./components/PaymentsByYear")
    },
    {
        path: "/payments/period",
        // alias: "/catpayments",
        name: "payments_period",
        component: () => import("./components/PaymentPeriod")
    },
    {
        path: "/payment/add",
        name: "payments_add",
        component: () => import("./components/AddPayment")
    },
    {
        path: "/about",
        name: "about",
        // lazy-loaded
        component: () => import("./components/About"),
    },

    {
        path: "/login",
        name: "login",
        // component: Login,
        component: () => import("./components/Login"),
    },
    {
        path: "/register",
        name: "register",
        // component: Register,
        component: () => import("./components/Register"),
    },
    {
        path: "/profile",
        name: "profile",
        // lazy-loaded
        component: () => import("./components/Profile"),
    },

];

const router = createRouter({
    base: "/finman",
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

export default router;