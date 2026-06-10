import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './css/page.css'

gsap.registerPlugin(ScrollTrigger)

const app = createApp(App)

app.provide('$gsap', gsap)
app.provide('$ScrollTrigger', ScrollTrigger)

app.use(router).mount('#app')