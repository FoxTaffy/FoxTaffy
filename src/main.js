import { createApp } from 'vue'
import { SpeedInsights } from "@vercel/speed-insights/vue"
import App from './App.vue'
import router from './router'
import './style.css'
import './Base.css'

// Функции для управления метатегами
export function updateMetaTags(metaData) {
  // Обновляем title
  if (metaData.title) {
    document.title = metaData.title;
    updateMetaTag('og:title', metaData.title);
    updateMetaTag('twitter:title', metaData.title);
  }
  
  // Обновляем description
  if (metaData.description) {
    updateMetaTag('description', metaData.description);
    updateMetaTag('og:description', metaData.description);
    updateMetaTag('twitter:description', metaData.description);
  }
  
  // Обновляем изображение
  if (metaData.image) {
    updateMetaTag('og:image', metaData.image);
    updateMetaTag('twitter:image', metaData.image);
    updateMetaTag('vk:image', metaData.image);
  }
  
  // Обновляем URL
  if (metaData.url) {
    updateMetaTag('og:url', metaData.url);
    updateCanonicalLink(metaData.url);
  }
}

function updateMetaTag(property, content) {
  // Ищем метатег по name или property
  let meta = document.querySelector(`meta[name="${property}"]`) || 
             document.querySelector(`meta[property="${property}"]`);
  
  if (meta) {
    meta.setAttribute('content', content);
  } else {
    // Создаем новый метатег если не найден
    meta = document.createElement('meta');
    const isProperty = property.includes(':');
    meta.setAttribute(isProperty ? 'property' : 'name', property);
    meta.setAttribute('content', content);
    document.head.appendChild(meta);
  }
}

function updateCanonicalLink(url) {
  let canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute('href', url);
  } else {
    // Создаем canonical link если не найден
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', url);
    document.head.appendChild(canonical);
  }
}

// Инициализация приложения
const app = createApp(App)

// Добавление Vercel Speed Insights
app.component('SpeedInsights', SpeedInsights)

// Глобальная директива для анимации при скролле
app.directive('scroll-animation', {
  mounted: function (el) {
    el.style.opacity = '1'
    el.style.transform = 'translateY(0)'
    el.style.transition = 'none'
  }
})

// Глобальные настройки галереи и функции метатегов
app.config.globalProperties.$galleryConfig = {
  characterColors: {
    'Основной оранжевый': '#FF7B25',
    'Основной зеленый': '#4CAF50',
    'Белый мех': '#FFFFFF',
    'Кремовый мех': '#FFF8E7',
    'Темно-оранжевый': '#D35400',
    'Черный': '#1A1A1A',
    'Темно-зеленый': '#2E7D32'
  },
  adminCode: 'FoxTaffy621'
}

// Добавляем функции метатегов в глобальные свойства
app.config.globalProperties.$updateMetaTags = updateMetaTags

// Настройка FontAwesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Solid icons
import { 
  faSearch, faImage, faHeart, faEye, faTimes, faTrashAlt, faDownload, 
  faShareAlt, faPencilAlt, faChevronLeft, faChevronRight, faPlus,
  faCalendarAlt, faMapMarkerAlt, faUsers, faBell, faPaintBrush, 
  faPalette, faDollarSign, faGift, faUser, faUserCircle, faBaby, 
  faDesktop, faPen, faSave, faCloudUploadAlt, faTimesCircle, faCheckCircle,
  faTag, faStar, faChevronUp, faChevronDown, faExclamationTriangle,
  faSliders, faList, faTh, faSearchPlus, faArrowRight, faSyncAlt,
  faArrowLeft, faHome
} from '@fortawesome/free-solid-svg-icons'

// Brand icons
import { 
  faInstagram, faTelegram, faVk, faDiscord, faGithub, faTwitch,
  faTiktok, faSteam 
} from '@fortawesome/free-brands-svg-icons'

// Добавление иконок в библиотеку
library.add(
  faSearch, faImage, faHeart, faEye, faTimes, faTrashAlt, faDownload, 
  faShareAlt, faPencilAlt, faChevronLeft, faChevronRight, faPlus,
  faCalendarAlt, faMapMarkerAlt, faUsers, faBell, faPaintBrush, 
  faPalette, faDollarSign, faGift, faUser, faUserCircle, faBaby, 
  faDesktop, faPen, faSave, faCloudUploadAlt, faTimesCircle, faCheckCircle,
  faTag, faStar, faChevronUp, faChevronDown, faExclamationTriangle,
  faSliders, faList, faTh, faSearchPlus, faArrowRight, faSyncAlt,
  faArrowLeft, faHome,
  faInstagram, faTelegram, faVk, faDiscord, faGithub, faTwitch,
  faTiktok, faSteam
)

// Глобальная регистрация компонента иконок
app.component('font-awesome-icon', FontAwesomeIcon)

// Инициализация локального хранилища
const initializeLocalStorage = () => {
  if (!localStorage.getItem('foxTaffy_liked_artworks')) {
    localStorage.setItem('foxTaffy_liked_artworks', JSON.stringify([]))
  }
  if (!localStorage.getItem('foxTaffy_gallery_view')) {
    localStorage.setItem('foxTaffy_gallery_view', 'grid')
  }
}

initializeLocalStorage()

// Подключение роутера и монтирование приложения
app.use(router)
app.mount('#app')