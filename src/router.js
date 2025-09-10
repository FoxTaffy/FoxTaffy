import { createRouter, createWebHistory } from 'vue-router'

// Объект для хранения позиций скролла для каждого маршрута
const scrollPositions = {}

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./components/HomeView.vue')
  },
  {
    path: '/taffy',
    name: 'Taffy',
    component: () => import('./components/Taffy.vue')
  },
  {
    path: '/gallery',
    name: 'Gallery',
    component: () => import('./components/Gallery/Gallery.vue')
  },
  {
    path: '/felix',
    name: 'Felix',
    component: () => import('./components/Felix.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('./components/AdminPanel.vue'),
    meta: {
      title: 'Админ-панель Fox Taffy',
      requiresAuth: false // Авторизация происходит внутри компонента
    }
  },
  {
    path: '/events/furmarket',
    name: 'FurMarket',
    component: () => import('./components/events/FurMarket.vue')
  },
    {
    path: '/events/SkyFurrBurg',
    name: 'SkyFurrBurg',
    component: () => import('./components/events/sfb.vue')
  },
  {
    path: '/events/FurrMarket4',
    name: 'FurrMarket 4',
    component: () => import('./components/events/FurrMarket4.vue')
  },
  {
    path: '/events/TourFurr',
    name: 'TourFurr',
    component: () => import('./components/events/TourFurr.vue')
  },
  {
    path: '/events/aff5',
    name: 'Any Furry Fest V',
    component: () => import('./components/events/AFF5.vue')
  },
  {
    path: '/events/sillycon',
    name: 'Тупикон',
    component: () => import('./components/events/sillycon.vue')
  },
  {
    path: '/events/fff',
    name: 'FFF',
    component: () => import('./components/events/FFF.vue')
  },
  {
    path: '/events/foxwood',
    name: 'FoxWood 2000s',
    component: () => import('./components/events/FW2000.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/components/Error404.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Если есть сохраненная позиция (используется при навигации назад/вперед)
    if (savedPosition) {
      return savedPosition
    } 
    // Если у нас есть сохраненная позиция для маршрута "to"
    else if (scrollPositions[to.path]) {
      return scrollPositions[to.path]
    }
    // Если это переход на якорь на странице
    else if (to.hash) {
      return { el: to.hash }
    } 
    // По умолчанию: прокрутка в начало
    else {
      return { top: 0, left: 0 }
    }
  }
})

// Глобальный хук для сохранения позиции скролла
router.beforeEach((to, from, next) => {
  // Сохраняем позицию скролла при покидании страницы
  if (from.path) {
    scrollPositions[from.path] = {
      top: window.pageYOffset,
      left: window.pageXOffset
    }
  }
  
  // Обновляем заголовок страницы для админки
  if (to.meta && to.meta.title) {
    document.title = to.meta.title
  } else if (to.name === 'Admin') {
    document.title = 'Админ-панель Fox Taffy'
  } else {
    document.title = 'Fox Taffy'
  }
  
  next()
})

export default router