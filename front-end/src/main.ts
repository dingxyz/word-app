import './assets/main.css'
import 'virtual:windi.css'

import {createApp} from 'vue'
import {createPinia} from 'pinia'

import 'vant/lib/index.css';
import {ActionSheet, Button, CellGroup, Field, FloatingBubble, Form, Icon, Notify, Popup, SwipeCell} from 'vant';


import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(Popup);
app.use(Form);
app.use(Field);
app.use(CellGroup);
app.use(Icon);
app.use(SwipeCell);
app.use(Button);
app.use(FloatingBubble);
app.use(ActionSheet);
app.use(Notify);

app.mount('#app')
