import { createStore } from "vuex";
import { auth } from "./auth.module";
import { sprs } from "./sprs.module";

const store = createStore({
    modules: {
        auth,
        sprs,
    },
});

export default store;