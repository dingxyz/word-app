import {createApp} from 'vue'
import {createPinia} from 'pinia'
import persistedState from 'pinia-plugin-persistedstate';
import App from './App.vue'
import router from './router'
import {loadPlugins} from "@/plugins";
import './assets/main.css'
import 'virtual:windi.css'
import {registerGlobalComponents} from "@/components";
import {loadDirectives} from "@/directives";

const app = createApp(App)

loadPlugins(app)
loadDirectives(app)
registerGlobalComponents(app)

const pinia = createPinia();
pinia.use(persistedState);
app.use(pinia)
app.use(router)

app.mount('#app')
