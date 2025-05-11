import { createStore } from "vuex";
import { auth } from "./auth.module";
import { sprs } from "./sprs.module";

interface RootState {
  buttonClicked: boolean;
}

const store = createStore<RootState>({
  modules: {
    auth,
    sprs,
  },
  state: {
    buttonClicked: false,
  },
  mutations: {
    setButtonClicked(state, value: boolean) {
      state.buttonClicked = value;
    },
  },
});

export default store;
