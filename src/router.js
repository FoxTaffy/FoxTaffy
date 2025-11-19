import { createRouter, createWebHistory } from 'vue-router'

// Объект для хранения позиций скролла для каждого маршрута
const scrollPositions = {}

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
      title: 'Админ-панель | Fox Taffy',
      description: 'Панель управления галереей',
      requiresAuth: false // Авторизация происходит внутри компонента
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
      title: 'Все мероприятия | FoxTaffy.fun',
      description: 'Полная коллекция конвентов, встреч и мероприятий, которые посетил Fox Taffy'
    }
  },

  // Админ-панель мероприятий
  {
    path: '/events/admin',
    name: 'EventsAdmin',
    component: () => import('./components/events/admin.vue'),
    meta: {
      title: 'Админ мероприятий | FoxTaffy.fun',
      description: 'Панель управления мероприятиями',
      requiresAuth: false // Авторизация внутри компонента
    }
  },

  // ===============================================
  // 🎪 СТАТИЧЕСКИЕ МАРШРУТЫ МЕРОПРИЯТИЙ
  // (Конкретные компоненты для каждого события)
  // ===============================================
  
  {
    path: '/events/furmarket',
    name: 'FurMarket',
    component: () => import('./components/events/FurMarket.vue'),
    meta: {
      title: 'FurMarket | Мероприятия Fox Taffy',
      description: 'Отчёт Fox Taffy с маркета фурри-товаров FurMarket'
    }
  },
  {
    path: '/events/skyfurrburg',
    name: 'SkyFurrBurg',
    component: () => import('./components/events/sfb.vue'),
    meta: {
      title: 'SkyFurrBurg | Мероприятия Fox Taffy',
      description: 'Отчёт Fox Taffy с конвента SkyFurrBurg'
    }
  },
  {
    path: '/events/furrmarket4',
    name: 'FurrMarket4',
    component: () => import('./components/events/FurrMarket4.vue'),
    meta: {
      title: 'FurrMarket 4 | Мероприятия Fox Taffy',
      description: 'Отчёт Fox Taffy с четвёртого FurrMarket'
    }
  },
  {
    path: '/events/tourfurr',
    name: 'TourFurr',
    component: () => import('./components/events/TourFurr.vue'),
    meta: {
      title: 'TourFurr | Мероприятия Fox Taffy',
      description: 'Отчёт Fox Taffy с фурри-пикника TourFurr'
    }
  },
  {
    path: '/events/aff5',
    name: 'AnyFurryFest5',
    component: () => import('./components/events/AFF5.vue'),
    meta: {
      title: 'Any Furry Fest V | Мероприятия Fox Taffy',
      description: 'Отчёт Fox Taffy с пятого Any Furry Fest'
    }
  },
  {
    path: '/events/sillycon',
    name: 'Sillycon',
    component: () => import('./components/events/sillycon.vue'),
    meta: {
      title: 'Тупикон | Мероприятия Fox Taffy',
      description: 'Отчёт Fox Taffy с конвента Тупикон'
    }
  },
  {
    path: '/events/fff',
    name: 'FFF',
    component: () => import('./components/events/FFF.vue'),
    meta: {
      title: 'FFF | Мероприятия Fox Taffy',
      description: 'Отчёт Fox Taffy с летнего фурри-феста FFF'
    }
  },
  {
    path: '/events/foxwood',
    name: 'FoxWood2000s',
    component: () => import('./components/events/FW2000.vue'),
    meta: {
      title: 'FoxWood 2000s | Мероприятия Fox Taffy',
      description: 'Отчёт Fox Taffy с ретро-мероприятия FoxWood 2000s'
    }
  },

  // ===============================================
  // 🎪 ДИНАМИЧЕСКИЙ МАРШРУТ ДЛЯ НОВЫХ МЕРОПРИЯТИЙ
  // (Размещаем ПОСЛЕ статических для избежания конфликтов)
  // ===============================================
  
  {
    path: '/events/:slug',
    name: 'EventDetail',
    component: () => import('./components/events/EventDetailPage.vue'),
    meta: {
      title: 'Мероприятие | FoxTaffy.fun',
      description: 'Подробная информация о мероприятии'
    },
    beforeEnter: (to, from, next) => {
      const slug = to.params.slug
      
      // Список статических маршрутов, которые НЕ должны обрабатываться динамически
      const staticRoutes = [
        'admin',
        'furmarket',
        'skyfurrburg',
        'furrmarket4',
        'tourfurr',
        'aff5',
        'sillycon',
        'fff',
        'foxwood'
      ]
      
      // Если это статический маршрут, показываем 404
      if (staticRoutes.includes(slug)) {
        console.warn(`Статический маршрут ${slug} обрабатывается динамически - перенаправляем на 404`)
        next({ name: 'NotFound' })
        return
      }
      
      // Проверяем, что slug содержит только разрешённые символы
      if (!/^[a-z0-9-]+$/i.test(slug)) {
        console.warn(`Недопустимый slug: ${slug}`)
        next({ name: 'Events' })
        return
      }
      
      console.log(`✅ Динамический маршрут для мероприятия: ${slug}`)
      next()
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
      title: 'Страница не найдена | FoxTaffy.fun',
      description: 'Запрашиваемая страница не существует'
    }
  },

  // Перенаправление всех остальных маршрутов на 404 - ДОЛЖЕН БЫТЬ ПОСЛЕДНИМ
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

// ===============================================
// 🛠️ СОЗДАНИЕ РОУТЕРА С КОНФИГУРАЦИЕЙ
// ===============================================

const router = createRouter({
  history: createWebHistory(),
  routes,
  
  // ===============================================
  // 📜 УПРАВЛЕНИЕ СКРОЛЛОМ
  // ===============================================
  scrollBehavior(to, from, savedPosition) {
    // Если есть сохранённая позиция (браузер назад/вперёд)
    if (savedPosition) {
      return savedPosition
    }
    
    // Если есть якорь в URL (#section)
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 80 // Отступ для фиксированной шапки
      }
    }
    
    // Для новых страниц прокручиваем вверх
    return { top: 0, behavior: 'smooth' }
  }
})

// ===============================================
// 🔒 НАВИГАЦИОННЫЕ ГВАРДИИ
// ===============================================

// Глобальный guard перед навигацией
router.beforeEach((to, from, next) => {
  // Сохраняем позицию скролла текущей страницы
  if (from.name) {
    scrollPositions[from.name] = window.pageYOffset
  }
  
  // Логирование навигации в режиме разработки
  if (import.meta.env.DEV) {
    console.log(`🧭 Навигация: ${from.path || '/'} → ${to.path}`)
  }
  
  // Проверка доступа к админ-страницам (если требуется)
  if (to.meta.requiresAuth) {
    // Здесь можно добавить логику проверки авторизации
    // Пока пропускаем все запросы
  }
  
  next()
})

// Guard после навигации для обновления мета-тегов
router.afterEach((to, from) => {
  // Обновляем заголовок страницы
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  // Обновляем description
  if (to.meta.description) {
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', to.meta.description)
    }
  }
  
  // Обновляем Open Graph теги
  if (to.meta.title) {
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute('content', to.meta.title)
    }
    
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')
    if (twitterTitle) {
      twitterTitle.setAttribute('content', to.meta.title)
    }
  }
  
  if (to.meta.description) {
    const ogDescription = document.querySelector('meta[property="og:description"]')
    if (ogDescription) {
      ogDescription.setAttribute('content', to.meta.description)
    }
    
    const twitterDescription = document.querySelector('meta[name="twitter:description"]')
    if (twitterDescription) {
      twitterDescription.setAttribute('content', to.meta.description)
    }
  }
  
  // Обновляем канонический URL
  const canonical = document.querySelector('link[rel="canonical"]')
  if (canonical) {
    canonical.setAttribute('href', `https://foxtaffy.fun${to.path}`)
  }
  
  // Логирование в режиме разработки
  if (import.meta.env.DEV) {
    console.log(`✅ Навигация завершена: ${to.path}`)
    if (to.meta.title) console.log(`📄 Заголовок: ${to.meta.title}`)
  }
})

// ===============================================
// 🚨 ОБРАБОТКА ОШИБОК РОУТЕРА
// ===============================================

router.onError((error) => {
  console.error('❌ Ошибка роутера:', error)
  
  // В режиме разработки показываем подробную ошибку
  if (import.meta.env.DEV) {
    console.error('Стек ошибки:', error.stack)
  }
  
  // В продакшене перенаправляем на главную
  if (import.meta.env.PROD) {
    router.push('/')
  }
})

// ===============================================
// 📤 ЭКСПОРТ РОУТЕРА
// ===============================================

export default router

// ===============================================
// 🔧 ДОПОЛНИТЕЛЬНЫЕ УТИЛИТЫ
// ===============================================

/**
 * Программная навигация с обработкой ошибок
 * @param {string} path - Путь для навигации
 * @param {Object} options - Дополнительные опции
 */
export const navigateTo = (path, options = {}) => {
  return router.push({ path, ...options }).catch(error => {
    // Игнорируем ошибки дублированной навигации
    if (error.name !== 'NavigationDuplicated') {
      console.error('Ошибка навигации:', error)
    }
  })
}

/**
 * Проверка текущего маршрута
 * @param {string} routeName - Название маршрута
 * @returns {boolean}
 */
export const isCurrentRoute = (routeName) => {
  return router.currentRoute.value.name === routeName
}

/**
 * Получение параметров текущего маршрута
 * @returns {Object}
 */
export const getCurrentParams = () => {
  return router.currentRoute.value.params
}

/**
 * Создание безопасной ссылки на мероприятие
 * @param {string} slug - Идентификатор мероприятия
 * @returns {string}
 */
export const createEventLink = (slug) => {
  if (!slug) return '/events'
  
  // Очищаем slug от недопустимых символов
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').trim()
  
  return `/events/${cleanSlug}`
}

console.log('✅ Роутер FoxTaffy.fun инициализирован!')
console.log(`📍 Всего маршрутов: ${routes.length}`)
console.log('🎪 Система мероприятий: ИСПРАВЛЕНА и готова к работе!')