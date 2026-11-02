import { createRouter, createWebHistory } from 'vue-router'
import { updateMetaTags, SITE_ORIGIN } from './utils/meta'

const routes = [
  // ===============================================
  // 🏠 ОСНОВНЫЕ СТРАНИЦЫ САЙТА
  // ===============================================
  {
    path: '/',
    name: 'Home',
    component: () => import('./components/HomeView.vue'),
    meta: {
      title: 'Fox Taffy - Фурри-энтузиаст и путешественник',
      description: 'Персональный сайт Fox Taffy - активного участника фурри-сообщества'
    }
  },
  {
    path: '/taffy',
    name: 'Taffy',
    component: () => import('./components/Taffy.vue'),
    meta: {
      title: 'История персонажа | Fox Taffy',
      description: 'Эволюция дизайна персонажа Fox Taffy с 2019 по 2025 год'
    }
  },
  {
    path: '/gallery',
    name: 'Gallery',
    component: () => import('./components/Gallery/Gallery.vue'),
    meta: {
      title: 'Галерея артов | Fox Taffy',
      description: 'Коллекция заказанных артов с персонажем Fox Taffy'
    }
  },
  {
    path: '/felix',
    name: 'Felix',
    component: () => import('./components/Felix.vue'),
    meta: {
      title: 'О Felix | Fox Taffy',
      description: 'Информация о партнере Fox Taffy'
    }
  },

  // ===============================================
  // ⚙️ АДМИН-ПАНЕЛИ
  // ===============================================
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('./components/AdminPanel.vue'),
    meta: {
      noindex: true,
      title: 'Админ-панель | Fox Taffy',
      description: 'Панель управления галереей'
    }
  },

  // ===============================================
  // 🎪 СИСТЕМА МЕРОПРИЯТИЙ - ИСПРАВЛЕННАЯ
  // ===============================================
  
  // Главная страница всех мероприятий
  {
    path: '/events',
    name: 'Events',
    component: () => import('./components/events/main.vue'),
    meta: {
      title: 'Все мероприятия | FoxTaffy.gay',
      description: 'Полная коллекция конвентов, встреч и мероприятий, которые посетил Fox Taffy'
    }
  },

  // Админ-панель мероприятий
  {
    path: '/events/admin',
    name: 'EventsAdmin',
    component: () => import('./components/events/admin.vue'),
    meta: {
      noindex: true,
      title: 'Админ мероприятий | FoxTaffy.gay',
      description: 'Панель управления мероприятиями'
    }
  },

  // ===============================================
  // 🎪 СТАТИЧЕСКИЙ МАРШРУТ ДЛЯ FOXWOOD
  // ===============================================

  {
    path: '/events/foxwood-2000s',
    name: 'FoxWood2000s',
    component: () => import('./components/events/FW2000.vue'),
    meta: {
      title: 'FoxWood: Back to 2000s | FoxTaffy.gay',
      description: 'Вечеринка FoxWood: Back to 2000s'
    }
  },

  // ===============================================
  // 🎪 ЕДИНЫЙ ДИНАМИЧЕСКИЙ МАРШРУТ ДЛЯ ВСЕХ МЕРОПРИЯТИЙ
  // Все мероприятия теперь используют EventDetailPage.vue
  // ===============================================

  {
    path: '/events/:slug([a-zA-Z0-9-]+)',
    name: 'EventDetail',
    component: () => import('./components/events/EventDetailPage.vue'),
    meta: {
      title: 'Мероприятие | FoxTaffy.gay',
      description: 'Подробная информация о мероприятии'
    }
  },

  // ===============================================
  // 📄 СЛУЖЕБНЫЕ СТРАНИЦЫ
  // ===============================================
  
  // 404 - ДОЛЖЕН БЫТЬ ПРЕДПОСЛЕДНИМ
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('./components/Error404.vue'),
    meta: {
      noindex: true,
      title: 'Страница не найдена | FoxTaffy.gay',
      description: 'Запрашиваемая страница не существует'
    }
  },

  // Перенаправление всех остальных маршрутов на 404 - ДОЛЖЕН БЫТЬ ПОСЛЕДНИМ
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 80 } // отступ под фиксированную шапку
    return { top: 0, behavior: 'smooth' }
  }
})

router.afterEach((to) => {
  updateMetaTags({
    title: to.meta.title,
    description: to.meta.description,
    url: `${SITE_ORIGIN}${to.path}`,
    noindex: to.meta.noindex
  })
})

router.onError((error) => {
  console.error('Ошибка роутера:', error)
  // Устаревший чанк после деплоя — самое частое: перезагрузка подтянет свежие хэши.
  if (/Failed to fetch dynamically imported module|Importing a module script failed/.test(error?.message)) {
    // Одна попытка на вкладку: если чанк недоступен постоянно, не уходим в цикл перезагрузок.
    try {
      if (sessionStorage.getItem('chunk-reload')) return
      sessionStorage.setItem('chunk-reload', '1')
    } catch { /* sessionStorage недоступен — просто перезагружаем */ }
    window.location.reload()
  }
})

export default router
