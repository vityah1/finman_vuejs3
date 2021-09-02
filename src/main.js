// import '@babel/polyfill'
// import 'mutationobserver-shim'
// import './plugins/bootstrap-vue'
import { createApp } from 'vue'
import App from './App.vue'
import store from "./store";
import router from './router'
import moment from 'moment'

// import 'bootstrap'

import 'bootstrap/dist/css/bootstrap.min.css'

import { FontAwesomeIcon } from './plugins/font-awesome'

// import Select2 from 'vue3-select2-component';
// import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'

// Import Bootstrap an BootstrapVue CSS files (order is important)
// import 'bootstrap/dist/css/bootstrap.css'
// import 'bootstrap-vue/dist/bootstrap-vue.css'


const app = createApp(App)

app.config.globalProperties.$moment = moment
// app.component('Select2', Select2)

// Make BootstrapVue available throughout your project
// app.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
// app.use(IconsPlugin)

// app.use(router).use(BootstrapVue).use(IconsPlugin).mount('#app')
app.use(router).use(store).component("font-awesome-icon", FontAwesomeIcon)
app.mount('#app')
import "bootstrap/dist/js/bootstrap.min.js"