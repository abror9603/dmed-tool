import './assets/styles/tailwind.css'

import { createApp } from 'vue'
import { MotionPlugin } from '@vueuse/motion'
import App from './App.vue'

const app = createApp(App)

// Sun'iy intellektli va interaktiv animatsiyalar uchun MotionPlugin-ni ulash
app.use(MotionPlugin)

app.mount('#app')
