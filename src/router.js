import { createWebHistory, createRouter } from "vue-router";

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
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;