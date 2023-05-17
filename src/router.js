import { createWebHistory, createRouter } from "vue-router";

// import Login from "./components/Login.vue";
// import Register from "./components/Register.vue";
// lazy-loaded
// const Profile = () => import("./components/Profile.vue")
// const BoardAdmin = () => import("./components/BoardAdmin.vue")
// const BoardModerator = () => import("./components/BoardModerator.vue")
// const BoardUser = () => import("./components/BoardUser.vue")


const routes = [
    {
        path: "/show_token",
        name: "show_token",
        component: () => import("./components/Mono")
    }, 
    {
        path: "/mono_payments",
        name: "mono_payments",
        component: () => import("./components/MonoPayments")
    },    
    {
        path: "/costs",
        // alias: "costs",
        name: "costs",
        component: () => import("./components/CostsList")
    }, {
        path: "/last",
        // alias: "costs",
        name: "last",
        component: () => import("./components/CostsList?cat=last")
    },
    {
        path: "/years",
        // alias: "years",
        name: "years",
        component: () => import("./components/YearsList")
    },
    {
        path: "/month",
        alias: "/months/:year",
        name: "months",
        component: () => import("./components/MonthsList")
    },
    {
        path: "/catcosts",
        // alias: "/catcosts",
        name: "catcosts",
        component: () => import("./components/CatCostsList")
    },
    {
        path: "/costs/:id",
        name: "cost-detail",
        component: () => import("./components/CostsList")
    },
    {
        path: "/add",
        name: "add",
        component: () => import("./components/AddCost")
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
    // {
    //     path: "/admin",
    //     name: "admin",
    //     // lazy-loaded
    //     component: BoardAdmin,
    // },
    // {
    //     path: "/mod",
    //     name: "moderator",
    //     // lazy-loaded
    //     component: BoardModerator,
    // },
    // {
    //     path: "/user",
    //     name: "user",
    //     // lazy-loaded
    //     component: BoardUser,
    // },

];

const router = createRouter({
    base: "/finman",
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

export default router;