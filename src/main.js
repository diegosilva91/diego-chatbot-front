import { createApp } from 'vue'
import App from './App.vue'
import mitt from 'mitt';
import { createPinia } from 'pinia'
const pinia = createPinia()
const app = createApp(App);
const emitter = mitt();
app.config.globalProperties.emitter = emitter;
app.use(pinia).mount('#app');