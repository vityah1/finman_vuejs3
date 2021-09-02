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
        path: "/",
        alias: "/costs",
        name: "costs",
        component: () => import("./components/CostsList")
    },
    {
        path: "/",
        alias: "/years",
        name: "years",
        component: () => import("./components/YearsList")
    },
    {
        path: "/",
        alias: "/months/:year",
        name: "months",
        component: () => import("./components/MonthsList")
    },
    {
        path: "/",
        alias: "/catcosts",
        name: "catcosts",
        component: () => import("./components/CatCostsList")
    },
    {
        path: "/costs/:id",
        name: "cost-details",
        component: () => import("./components/Cost")
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
    history: createWebHistory(),
    routes,
});

export default router;