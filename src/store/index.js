import { createStore } from "vuex";
import { auth } from "./auth.module";
import { sprs } from "./sprs.module";

const store = createStore({
    modules: {
        auth,
        sprs,
    },
    state: {
        buttonClicked: false,
      },
      mutations: {
        setButtonClicked(state, value) {
          state.buttonClicked = value;
        },
      },
});

export default store;