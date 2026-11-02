import { createApp } from 'vue'
import { createHead } from '@vueuse/head'
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import App from './App.vue'
import router from './router'
import { updateMetaTags } from './utils/meta'
import { icons } from './config/icons'
import './style.css'
import './Base.css'

library.add(...icons)
// Авто-замена <i class="fas fa-..."> на SVG
dom.watch()

const app = createApp(App)

app.config.globalProperties.$updateMetaTags = updateMetaTags
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(router)
app.use(createHead())
app.mount('#app')
