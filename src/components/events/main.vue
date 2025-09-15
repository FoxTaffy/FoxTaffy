<template>
  <div class="events-main-page">
    <!-- Шапка страницы -->
    <div class="page-header">
      <div class="container">
        <div class="header-content">
          <div class="header-text">
            <h1 class="page-title">Все мероприятия</h1>
            <p class="page-description">
              Полная коллекция конвентов, встреч и мероприятий, которые я посетил и планирую посетить.
              Здесь вы найдете подробные отчеты, фотографии и мои впечатления от каждого события.
            </p>
          </div>
          <div class="header-stats" v-if="stats.total > 0">
            <div class="stat-card">
              <div class="stat-number">{{ stats.total }}</div>
              <div class="stat-label">Всего</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ stats.completed }}</div>
              <div class="stat-label">Посещено</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ stats.upcoming }}</div>
              <div class="stat-label">Планируется</div>
            </div>
          </div>
        </div>
        
        <!-- Навигация назад -->
        <div class="page-navigation">
          <router-link to="/" class="back-button">
            <i class="fas fa-arrow-left"></i>
            <span>На главную</span>
          </router-link>
          <router-link to="/events/admin" class="admin-button" v-if="isAdminMode">
            <i class="fas fa-cog"></i>
            <span>Управление</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Фильтры и поиск -->
    <div class="filters-section">
      <div class="container">
        <div class="filters-container">
          <!-- Поиск -->
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Поиск мероприятий..."
              @input="debouncedSearch"
            >
            <button v-if="searchQuery" @click="clearSearch" class="clear-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <!-- Фильтры -->
          <div class="filter-tabs">
            <button 
              v-for="filter in filters" 
              :key="filter.key"
              class="filter-tab"
              :class="{ 'active': activeFilter === filter.key }"
              @click="setFilter(filter.key)"
            >
              <i :class="filter.icon"></i>
              <span>{{ filter.label }}</span>
              <span v-if="filter.count > 0" class="filter-count">({{ filter.count }})</span>
            </button>
          </div>
          
          <!-- Сортировка -->
          <div class="sort-select">
            <select v-model="sortBy" @change="applySorting">
              <option value="date_desc">Сначала новые</option>
              <option value="date_asc">Сначала старые</option>
              <option value="name_asc">По названию (А-Я)</option>
              <option value="rating_desc">По рейтингу</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Основной контент -->
    <div class="main-content">
      <div class="container">
        <!-- Загрузка -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Загружаем мероприятия...</p>
        </div>

        <!-- Ошибка -->
        <div v-else-if="error" class="error-container">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Проблема с загрузкой</h3>
          <p>{{ error }}</p>
          <button @click="loadEvents" class="retry-btn">
            <i class="fas fa-redo"></i>
            Попробовать снова
          </button>
          <p class="error-note">Показываем тестовые данные для демонстрации</p>
        </div>

        <!-- Пустой результат -->
        <div v-else-if="filteredEvents.length === 0" class="empty-container">
          <i class="fas fa-calendar-times"></i>
          <h3>Мероприятия не найдены</h3>
          <p v-if="searchQuery">
            По запросу "{{ searchQuery }}" ничего не найдено.
            <button @click="clearSearch" class="link-btn">Сбросить поиск</button>
          </p>
          <p v-else>Пока нет мероприятий в этой категории.</p>
        </div>

        <!-- Список мероприятий -->
        <div v-else class="events-grid">
          <div 
            v-for="event in paginatedEvents" 
            :key="event.id"
            class="event-card"
            :class="getEventCardClass(event)"
            @click="goToEvent(event)"
          >
            <!-- Баннер -->
            <div class="event-banner" :style="{ backgroundImage: getBannerImage(event.banner_url) }">
              <div class="event-overlay"></div>
              
              <!-- Дата -->
              <div class="event-date">
                <span class="month">{{ getMonthShort(event.event_date) }}</span>
                <span class="day">{{ getDayOfMonth(event.event_date) }}</span>
                <span class="year">{{ getYear(event.event_date) }}</span>
              </div>
              
              <!-- Статус и бейджи -->
              <div class="event-badges">
                <span class="event-status" :class="getStatusClass(event.computed_status)">
                  {{ getStatusText(event.computed_status) }}
                </span>
                <span v-if="event.my_rating" class="event-badge rating">
                  <i class="fas fa-star"></i>
                  {{ event.my_rating }}/5
                </span>
                <span v-if="event.photos_count > 0" class="event-badge photos">
                  <i class="fas fa-camera"></i>
                  {{ event.photos_count }}
                </span>
              </div>
            </div>
            
            <!-- Информация -->
            <div class="event-info">
              <h3 class="event-name">{{ event.name }}</h3>
              <div class="event-meta">
                <div class="meta-item">
                  <i class="fas fa-map-marker-alt"></i>
                  <span>{{ event.city || event.location }}</span>
                </div>
                <div v-if="event.event_type" class="meta-item">
                  <i :class="getEventTypeIcon(event.event_type)"></i>
                  <span>{{ getEventTypeText(event.event_type) }}</span>
                </div>
                <div v-if="event.expected_visitors" class="meta-item">
                  <i class="fas fa-users"></i>
                  <span>{{ event.expected_visitors }}+ участников</span>
                </div>
              </div>
              
              <!-- Статистика -->
              <div v-if="hasEventStats(event)" class="event-stats">
                <div v-if="event.total_spent > 0" class="stat-item">
                  <i class="fas fa-shopping-bag"></i>
                  <span>{{ formatMoney(event.total_spent) }}</span>
                </div>
                <div v-if="event.purchases_count > 0" class="stat-item">
                  <i class="fas fa-receipt"></i>
                  <span>{{ event.purchases_count }} покупок</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Пагинация -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
            class="page-btn"
          >
            <i class="fas fa-chevron-left"></i>
            Назад
          </button>
          
          <div class="page-numbers">
            <button 
              v-for="page in visiblePages" 
              :key="page"
              @click="goToPage(page)"
              class="page-btn"
              :class="{ 'active': page === currentPage }"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="page-btn"
          >
            Вперед
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { imageHelpers } from '@/utils/imageUtils'
import { furryApi } from '@/config/supabase.js'

export default {
  name: 'EventsMainPage',
  data() {
    return {
      // Данные
      allEvents: [],
      stats: { upcoming: 0, completed: 0, total: 0 },
      loading: false,
      error: null,
      
      // Фильтры и поиск
      searchQuery: '',
      activeFilter: 'all',
      sortBy: 'date_desc',
      
      // Пагинация
      currentPage: 1,
      eventsPerPage: 12,
      
      // Дебаунсинг поиска
      searchTimeout: null,
      
      // Админ режим
      isAdminMode: false
    }
  },
  
  computed: {
    filters() {
      return [
        { key: 'all', label: 'Все', icon: 'fas fa-calendar-alt', count: this.stats.total },
        { key: 'upcoming', label: 'Предстоящие', icon: 'fas fa-clock', count: this.stats.upcoming },
        { key: 'completed', label: 'Посещённые', icon: 'fas fa-check-circle', count: this.stats.completed },
        { key: 'convention', label: 'Конвенты', icon: 'fas fa-calendar-star', count: this.getTypeCount('convention') },
        { key: 'market', label: 'Маркеты', icon: 'fas fa-store', count: this.getTypeCount('market') }
      ]
    },
    
    filteredEvents() {
      let events = [...this.allEvents]
      
      // Фильтр по статусу
      if (this.activeFilter === 'upcoming') {
        events = events.filter(e => e.computed_status === 'upcoming' || e.computed_status === 'planning')
      } else if (this.activeFilter === 'completed') {
        events = events.filter(e => e.computed_status === 'completed' || e.computed_status === 'attended')
      } else if (this.activeFilter !== 'all') {
        events = events.filter(e => e.event_type === this.activeFilter)
      }
      
      // Поиск
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        events = events.filter(e => 
          e.name.toLowerCase().includes(query) ||
          (e.city && e.city.toLowerCase().includes(query)) ||
          (e.location && e.location.toLowerCase().includes(query))
        )
      }
      
      // Сортировка
      events.sort((a, b) => {
        switch (this.sortBy) {
          case 'date_asc':
            return new Date(a.event_date) - new Date(b.event_date)
          case 'date_desc':
            return new Date(b.event_date) - new Date(a.event_date)
          case 'name_asc':
            return a.name.localeCompare(b.name)
          case 'rating_desc':
            return (b.my_rating || 0) - (a.my_rating || 0)
          default:
            return new Date(b.event_date) - new Date(a.event_date)
        }
      })
      
      return events
    },
    
    totalPages() {
      return Math.ceil(this.filteredEvents.length / this.eventsPerPage)
    },
    
    paginatedEvents() {
      const start = (this.currentPage - 1) * this.eventsPerPage
      const end = start + this.eventsPerPage
      return this.filteredEvents.slice(start, end)
    },
    
    visiblePages() {
      const pages = []
      const totalPages = this.totalPages
      const current = this.currentPage
      
      // Показываем максимум 5 страниц
      let start = Math.max(1, current - 2)
      let end = Math.min(totalPages, start + 4)
      
      if (end - start < 4) {
        start = Math.max(1, end - 4)
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    }
  },
  
  async mounted() {
    // Проверяем админ права
    this.checkAdminMode()
    
    // Загружаем мероприятия
    await this.loadEvents()
    
    // Устанавливаем мета-теги
    this.updateMetaTags()
  },
  
  methods: {
    async loadEvents() {
      this.loading = true
      this.error = null
      
      try {
        console.log('🎪 Events/main: Загружаем все мероприятия...')
        
        const [events, stats] = await Promise.all([
          furryApi.getEvents({ status: 'all', limit: 100, sort: 'date_desc' }),
          furryApi.getEventsStats()
        ])
        
        this.allEvents = events || []
        this.stats = stats || { upcoming: 0, completed: 0, total: 0 }
        
        console.log('✅ Events/main: Все мероприятия загружены:', { 
          total: this.allEvents.length, 
          stats: this.stats 
        })
        
      } catch (error) {
        console.error('❌ Events/main: Ошибка загрузки мероприятий:', error)
        this.error = error.message || 'Проблема с подключением к API'
        
        // Fallback тестовые данные
        this.allEvents = [
          {
            id: '1',
            slug: 'any-furry-fest-5',
            name: 'Any Furry Fest V',
            event_date: '2024-08-17',
            city: 'Москва',
            location: 'Парк-отель "Воздвиженское"',
            event_type: 'convention',
            computed_status: 'completed',
            attendance_status: 'attended',
            my_rating: 5,
            photos_count: 47,
            total_spent: 8500,
            purchases_count: 12,
            expected_visitors: 400
          },
          {
            id: '2', 
            slug: 'furmarket-2024',
            name: 'FurMarket 2024',
            event_date: '2024-06-15',
            city: 'Санкт-Петербург',
            location: 'Ленэкспо',
            event_type: 'market',
            computed_status: 'completed',
            attendance_status: 'attended',
            my_rating: 4,
            photos_count: 25,
            total_spent: 3500,
            purchases_count: 8,
            expected_visitors: 200
          },
          {
            id: '3',
            slug: 'sky-furr-burg-2024',
            name: 'SkyFurrBurg 2024',
            event_date: '2024-09-20',
            city: 'Санкт-Петербург',
            location: 'ТРК "Континент"',
            event_type: 'convention', 
            computed_status: 'completed',
            attendance_status: 'attended',
            my_rating: 5,
            photos_count: 33,
            total_spent: 5200,
            purchases_count: 9,
            expected_visitors: 300
          },
          {
            id: '4',
            slug: 'any-furry-fest-6',
            name: 'Any Furry Fest VI',
            event_date: '2025-08-15',
            city: 'Москва',
            location: 'Парк-отель "Воздвиженское"',
            event_type: 'convention',
            computed_status: 'upcoming',
            attendance_status: 'planning',
            expected_visitors: 500
          }
        ]
        
        this.stats = { upcoming: 1, completed: 3, total: 4 }
        console.log('⚠️ Events/main: Используем fallback данные для демонстрации')
        
      } finally {
        this.loading = false
      }
    },
    
    // Фильтрация и поиск
    setFilter(filterKey) {
      this.activeFilter = filterKey
      this.currentPage = 1
    },
    
    debouncedSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1
      }, 300)
    },
    
    clearSearch() {
      this.searchQuery = ''
      this.currentPage = 1
    },
    
    applySorting() {
      this.currentPage = 1
    },
    
    // Пагинация
    goToPage(page) {
      this.currentPage = page
      this.scrollToTop()
    },
    
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
        this.scrollToTop()
      }
    },
    
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        this.scrollToTop()
      }
    },
    
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    
    // Навигация
    goToEvent(event) {
      if (event.slug) {
        this.$router.push(`/events/${event.slug}`)
      }
    },
    
    // Вспомогательные функции
    checkAdminMode() {
      // Простая проверка админ режима
      const adminCode = localStorage.getItem('fox_admin_code')
      this.isAdminMode = !!adminCode
    },
    
    getTypeCount(type) {
      return this.allEvents.filter(e => e.event_type === type).length
    },
    
    hasEventStats(event) {
      return event.total_spent > 0 || event.purchases_count > 0
    },
    
    // Форматирование
    getBannerImage(bannerUrl) {
      return imageHelpers.getEventBanner(bannerUrl)
    },
    
    getEventCardClass(event) {
      return {
        'upcoming': ['upcoming', 'planning', 'registered'].includes(event.computed_status),
        'completed': ['completed', 'attended'].includes(event.computed_status),
        'has-rating': event.my_rating > 0
      }
    },
    
    getStatusClass(status) {
      return {
        'upcoming': ['upcoming', 'planning', 'registered'].includes(status),
        'completed': ['completed', 'attended'].includes(status),
        'cancelled': status === 'cancelled'
      }
    },
    
    getStatusText(status) {
      const statusMap = {
        'upcoming': 'Предстоящее',
        'planning': 'Планирую',
        'registered': 'Зарегистрирован',
        'completed': 'Завершено',
        'attended': 'Посетил',
        'cancelled': 'Отменено',
        'missed': 'Пропустил'
      }
      return statusMap[status] || 'Планирую'
    },
    
    getEventTypeIcon(type) {
      const typeIcons = {
        'convention': 'fas fa-calendar-star',
        'meeting': 'fas fa-users',
        'party': 'fas fa-glass-cheers',
        'workshop': 'fas fa-chalkboard-teacher',
        'market': 'fas fa-store',
        'other': 'fas fa-calendar'
      }
      return typeIcons[type] || 'fas fa-calendar'
    },
    
    getEventTypeText(type) {
      const typeTexts = {
        'convention': 'Конвент',
        'meeting': 'Встреча',
        'party': 'Вечеринка',
        'workshop': 'Мастер-класс',
        'market': 'Маркет',
        'other': 'Мероприятие'
      }
      return typeTexts[type] || 'Мероприятие'
    },
    
    getMonthShort(dateString) {
      if (!dateString) return '---'
      const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 
                     'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
      return months[new Date(dateString).getMonth()]
    },
    
    getDayOfMonth(dateString) {
      if (!dateString) return '--'
      return new Date(dateString).getDate()
    },
    
    getYear(dateString) {
      if (!dateString) return '----'
      return new Date(dateString).getFullYear()
    },
    
    formatMoney(amount) {
      if (!amount) return '0 ₽'
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
      }).format(amount)
    },
    
    updateMetaTags() {
      document.title = 'Все мероприятия | FoxTaffy.fun'
      
      const description = 'Полная коллекция конвентов, встреч и мероприятий, которые посетил Fox Taffy. Подробные отчеты, фотографии и впечатления от каждого события.'
      
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', description)
      }
    }
  }
}
</script>

<style scoped>
/* ===== ОСНОВНЫЕ СТИЛИ ===== */
.events-main-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* ===== ШАПКА СТРАНИЦЫ ===== */
.page-header {
  background: linear-gradient(135deg, 
    rgba(26, 26, 26, 0.95) 0%, 
    rgba(255, 123, 37, 0.1) 50%, 
    rgba(26, 26, 26, 0.95) 100%
  );
  padding: 4rem 0 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 3rem;
  margin-bottom: 2rem;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--accent-orange), var(--accent-green));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-description {
  font-size: 1.2rem;
  line-height: 1.6;
  color: var(--text-muted);
  max-width: 600px;
}

.header-stats {
  display: flex;
  gap: 1.5rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  min-width: 100px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent-orange);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.page-navigation {
  display: flex;
  gap: 1rem;
}

.back-button, .admin-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: var(--text-light);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.back-button:hover, .admin-button:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.admin-button {
  background: rgba(255, 123, 37, 0.2);
  border-color: rgba(255, 123, 37, 0.3);
}

/* ===== ФИЛЬТРЫ ===== */
.filters-section {
  background: rgba(255, 255, 255, 0.02);
  padding: 2rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.filters-container {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: var(--text-light);
  font-size: 1rem;
}

.search-box input:focus {
  outline: none;
  border-color: var(--accent-orange);
  background: rgba(255, 255, 255, 0.08);
}

.clear-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
}

.clear-btn:hover {
  color: var(--text-light);
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.filter-tab:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-light);
}

.filter-tab.active {
  background: var(--accent-orange);
  color: white;
  border-color: var(--accent-orange);
}

.filter-count {
  font-size: 0.9rem;
  opacity: 0.8;
}

.sort-select select {
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: var(--text-light);
  font-size: 1rem;
  min-width: 200px;
}

.sort-select select:focus {
  outline: none;
  border-color: var(--accent-orange);
}

/* ===== ОСНОВНОЙ КОНТЕНТ ===== */
.main-content {
  padding: 3rem 0;
}

.loading-container, .error-container, .empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 123, 37, 0.2);
  border-top: 4px solid var(--accent-orange);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container i, .empty-container i {
  font-size: 4rem;
  color: var(--accent-orange);
  margin-bottom: 1rem;
}

.error-note {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--text-muted);
  font-style: italic;
}

.retry-btn, .link-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: var(--accent-orange);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.link-btn {
  background: none;
  color: var(--accent-orange);
  text-decoration: underline;
  padding: 0;
  margin-left: 0.5rem;
}

.retry-btn:hover, .link-btn:hover {
  transform: translateY(-2px);
}

/* ===== СЕТКА МЕРОПРИЯТИЙ ===== */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.event-card {
  background: var(--bg-card);
  border-radius: 1rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.event-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 123, 37, 0.3);
}

.event-card.upcoming {
  border-color: rgba(255, 123, 37, 0.2);
  background: rgba(255, 123, 37, 0.03);
}

.event-card.completed {
  border-color: rgba(76, 175, 80, 0.2);
  background: rgba(76, 175, 80, 0.03);
}

.event-banner {
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.event-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.7));
}

.event-date {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 0.5rem;
  padding: 0.75rem;
  text-align: center;
  min-width: 70px;
  backdrop-filter: blur(10px);
}

.event-date .month {
  display: block;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: var(--accent-orange);
  font-weight: 600;
}

.event-date .day {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.event-date .year {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.event-badges {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.event-status, .event-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
  white-space: nowrap;
}

.event-status {
  background: rgba(255, 123, 37, 0.9);
  color: white;
}

.event-status.completed {
  background: rgba(76, 175, 80, 0.9);
}

.event-status.cancelled {
  background: rgba(244, 67, 54, 0.9);
}

.event-badge {
  background: rgba(0, 0, 0, 0.8);
  color: white;
}

.event-badge.rating {
  background: rgba(255, 193, 7, 0.9);
  color: #1a1a1a;
}

.event-badge.photos {
  background: rgba(76, 175, 80, 0.9);
}

.event-info {
  padding: 1.5rem;
}

.event-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 1rem;
  line-height: 1.3;
}

.event-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.meta-item i {
  color: var(--accent-orange);
  width: 16px;
  flex-shrink: 0;
}

.event-stats {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.stat-item i {
  color: var(--accent-orange);
}

/* ===== ПАГИНАЦИЯ ===== */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 3rem;
}

.page-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.page-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.page-btn.active {
  background: var(--accent-orange);
  border-color: var(--accent-orange);
  color: white;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

/* ===== АДАПТИВНОСТЬ ===== */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 2rem;
  }
  
  .header-stats {
    align-self: stretch;
    justify-content: space-between;
  }
  
  .events-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .page-description {
    font-size: 1rem;
  }
  
  .filters-container {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .search-box {
    min-width: unset;
  }
  
  .filter-tabs {
    justify-content: center;
  }
  
  .sort-select select {
    min-width: unset;
    width: 100%;
  }
  
  .events-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .header-stats {
    flex-wrap: wrap;
  }
  
  .stat-card {
    flex: 1;
    min-width: 80px;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 2rem 0 1rem;
  }
  
  .main-content {
    padding: 2rem 0;
  }
  
  .event-banner {
    height: 150px;
  }
  
  .event-info {
    padding: 1rem;
  }
  
  .event-name {
    font-size: 1.2rem;
  }
  
  .pagination {
    flex-wrap: wrap;
  }
  
  .page-numbers {
    order: -1;
    width: 100%;
    justify-content: center;
    margin-bottom: 1rem;
  }
}
</style>