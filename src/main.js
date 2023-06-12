import {createApp } from 'vue'
import App from './App.vue'
import store from "./store";
import router from './router'
import moment from 'moment'

import BootstrapVueNext from "bootstrap-vue-next";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";

import { FontAwesomeIcon } from './plugins/font-awesome'
import AlertComponent from './components/AlertComponent'

const app = createApp(App)
app.config.globalProperties.$moment = moment
app.use(BootstrapVueNext)
// app.use(AlertComponent)
// app.component('alert-component', AlertComponent);

app.use(router).use(store)
    .component('alert-component', AlertComponent)
    .component("font-awesome-icon", FontAwesomeIcon)


// app.created: {
//         get_sources() {
//           this.$store.dispatch("sprs/get_sources");
//         }
//       }

async function FetchDataFromApi() {
    try {
await store.dispatch("sprs/get_sources");
await store.dispatch("sprs/get_currencies");
await store.dispatch("sprs/get_categories");
app.mount('#app')
    }
    catch(error) {
        console.error(error);
    }
}

FetchDataFromApi();
// app.mount('#app')
