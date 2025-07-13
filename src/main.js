import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import './Base.css'

const app = createApp(App)

// Добавляем директиву для анимации при скролле
app.directive('scroll-animation', {
  mounted: function (el) {
    el.style.opacity = '1'
    el.style.transform = 'translateY(0)'
    // Убираем transition, чтобы не было эффекта анимации вообще
    el.style.transition = 'none'
  }
})

// Глобальные свойства для компонентов галереи
app.config.globalProperties.$galleryConfig = {
  // Настройки для галереи Fox Taffy
  characterColors: {
    'Основной оранжевый': '#FF7B25',
    'Основной зеленый': '#4CAF50',
    'Белый мех': '#FFFFFF',
    'Кремовый мех': '#FFF8E7',
    'Темно-оранжевый': '#D35400',
    'Черный': '#1A1A1A',
    'Темно-зеленый': '#2E7D32'
  },
  // Конфигурация хранилища
  storage: {
    baseUrl: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/',
    region: 'ru-7',
    bucket: '621.s3.ru-7.storage.selcloud.ru'
  },
  // Секретный код для активации админ-панели
  adminCode: 'FoxTaffy621'
}
import { SpeedInsights } from "@vercel/speed-insights/vue"
// Добавление FontAwesome для иконок (если используется в галерее)
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faSearch, faImage, faHeart, faEye, faTimes, faTrashAlt, faDownload, 
  faShareAlt, faPencilAlt, faChevronLeft, faChevronRight, faPlus,
  faCalendarAlt, faMapMarkerAlt, faUsers, faBell, faPaintBrush, 
  faPalette, faDollarSign, faGift, faUser, faUserCircle, faBaby, 
  faDesktop, faPen, faSave, faCloudUploadAlt, faTimesCircle, faCheckCircle,
  faTag, faStar, faChevronUp, faChevronDown, faExclamationTriangle,
  faSliders, faList, faTh, faSearchPlus, faArrowRight, faSyncAlt
} from '@fortawesome/free-solid-svg-icons'
import { 
  faInstagram, faTelegram, faVk, faDiscord, faGithub, faTwitch,
  faTiktok, faSteam 
} from '@fortawesome/free-brands-svg-icons'

// Добавляем используемые иконки в библиотеку
library.add(
  faSearch, faImage, faHeart, faEye, faTimes, faTrashAlt, faDownload, 
  faShareAlt, faPencilAlt, faChevronLeft, faChevronRight, faPlus,
  faCalendarAlt, faMapMarkerAlt, faUsers, faBell, faPaintBrush, 
  faPalette, faDollarSign, faGift, faUser, faUserCircle, faBaby, 
  faDesktop, faPen, faSave, faCloudUploadAlt, faTimesCircle, faCheckCircle,
  faTag, faStar, faChevronUp, faChevronDown, faExclamationTriangle,
  faSliders, faList, faTh, faSearchPlus, faArrowRight, faSyncAlt,
  faInstagram, faTelegram, faVk, faDiscord, faGithub, faTwitch,
  faTiktok, faSteam
)

// Регистрируем FontAwesome компонент глобально
app.component('font-awesome-icon', FontAwesomeIcon)

// Инициализация функционала лайков и просмотров
if (!localStorage.getItem('foxTaffy_liked_artworks')) {
  localStorage.setItem('foxTaffy_liked_artworks', JSON.stringify([]));
}

// Инициализируем предпочтения отображения
if (!localStorage.getItem('foxTaffy_gallery_view')) {
  localStorage.setItem('foxTaffy_gallery_view', 'grid');
}

app.use(router)
app.mount('#app')