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
app.mount('#app')
