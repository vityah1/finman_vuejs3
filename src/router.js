import { createWebHistory, createRouter } from "vue-router";

const routes = [
    {
        path: "/",
        alias: "/costs",
        name: "costs",
        component: () => import("./components/CostsList")
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