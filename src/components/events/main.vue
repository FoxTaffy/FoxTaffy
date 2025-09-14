<template>
    <div class="events-main-page">
      <!-- Хедер страницы -->
      <div class="page-header">
        <div class="container">
          <div class="header-content">
            <div class="header-text">
              <h1 class="page-title">Все мероприятия</h1>
              <p class="page-subtitle">
                Полная коллекция конвентов, встреч и мероприятий, которые я посетил
              </p>
            </div>
            <div class="header-stats" v-if="stats.total > 0">
              <div class="stat-card">
                <div class="stat-number">{{ stats.total }}</div>
                <div class="stat-label">Всего событий</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ stats.completed }}</div>
                <div class="stat-label">Посещено</div>
              </div>
              <div class="stat-card" v-if="stats.totalSpent > 0">
                <div class="stat-number">{{ formatMoney(stats.totalSpent) }}</div>
                <div class="stat-label">Потрачено</div>
              </div>
            </div>
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
                placeholder="Поиск по названию или локации..."
                @input="debouncedSearch"
              >
              <button v-if="searchQuery" @click="clearSearch" class="clear-search">
                <i class="fas fa-times"></i>
              </button>
            </div>
  
            <!-- Фильтры -->
            <div class="filter-tabs">
              <button 
                v-for="filter in statusFilters" 
                :key="filter.key"
                :class="['filter-tab', { active: activeStatusFilter === filter.key }]"
                @click="activeStatusFilter = filter.key"
              >
                <i :class="filter.icon"></i>
                <span>{{ filter.label }}</span>
                <span v-if="filter.count > 0" class="filter-count">({{ filter.count }})</span>
              </button>
            </div>
  
            <!-- Сортировка -->
            <div class="sort-selector">
              <select v-model="sortBy" @change="loadEvents">
                <option value="date_desc">Сначала новые</option>
                <option value="date_asc">Сначала старые</option>
                <option value="name">По названию</option>
                <option value="rating">По рейтингу</option>
              </select>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Основной контент -->
      <div class="events-content">
        <div class="container">
          <!-- Загрузка -->
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Загружаем мероприятия...</p>
          </div>
  
          <!-- Ошибка -->
          <div v-else-if="error" class="error-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Ошибка загрузки</h3>
            <p>{{ error }}</p>
            <button @click="loadEvents" class="retry-btn">Попробовать снова</button>
          </div>
  
          <!-- Пустой результат -->
          <div v-else-if="filteredEvents.length === 0" class="empty-state">
            <i class="fas fa-calendar-times"></i>
            <h3>Мероприятия не найдены</h3>
            <p v-if="searchQuery">По запросу "{{ searchQuery }}" ничего не найдено</p>
            <p v-else>В этой категории пока нет мероприятий</p>
            <button v-if="searchQuery || activeStatusFilter !== 'all'" @click="resetFilters" class="reset-filters-btn">
              Сбросить фильтры
            </button>
          </div>
  
          <!-- Список мероприятий -->
          <div v-else class="events-grid">
            <div 
              v-for="event in paginatedEvents" 
              :key="event.id"
              class="event-card"
              :class="[getEventStatusClass(event)]"
              @click="goToEventDetail(event.slug)"
            >
              <!-- Баннер события -->
              <div class="event-banner" :style="{ backgroundImage: getBannerImage(event.banner_url) }">
                <div class="event-overlay"></div>
                
                <!-- Дата -->
                <div class="event-date">
                  <span class="month">{{ getMonthShort(event.event_date) }}</span>
                  <span class="day">{{ getDayOfMonth(event.event_date) }}</span>
                  <span class="year">{{ getYear(event.event_date) }}</span>
                </div>
                
                <!-- Бейджи -->
                <div class="event-badges">
                  <span class="event-status" :class="getEventStatusClass(event)">
                    {{ getStatusText(event.computed_status || event.status) }}
                  </span>
                  <span v-if="event.is_featured" class="event-badge featured">
                    ⭐ Избранное
                  </span>
                  <span v-if="event.my_rating" class="event-badge rating">
                    {{ '★'.repeat(event.my_rating) }}
                  </span>
                </div>
  
                <!-- Прогресс (только для предстоящих) -->
                <div v-if="isUpcoming(event) && event.preparation_progress < 100" class="event-progress-overlay">
                  <div class="progress-bar-mini">
                    <div class="progress-fill-mini" :style="{ width: event.preparation_progress + '%' }"></div>
                  </div>
                  <span class="progress-text">{{ Math.round(event.preparation_progress) }}%</span>
                </div>
              </div>
  
              <!-- Контент -->
              <div class="event-content">
                <h3 class="event-name">{{ event.name }}</h3>
                
                <!-- Метаинформация -->
                <div class="event-meta">
                  <div class="meta-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>{{ event.city || event.location }}</span>
                  </div>
                  <div v-if="event.event_type" class="meta-item">
                    <i :class="getEventTypeIcon(event.event_type)"></i>
                    <span>{{ getEventTypeText(event.event_type) }}</span>
                  </div>
                  <div v-if="event.attendees_count" class="meta-item">
                    <i class="fas fa-users"></i>
                    <span>{{ event.attendees_count }} участников</span>
                  </div>
                </div>
  
                <!-- Описание -->
                <p class="event-description">
                  {{ event.short_description || event.description }}
                </p>
  
                <!-- Статистика -->
                <div class="event-stats">
                  <div v-if="event.photos_count > 0" class="stat-item">
                    <i class="fas fa-camera"></i>
                    <span>{{ event.photos_count }} фото</span>
                  </div>
                  <div v-if="event.purchases_total > 0" class="stat-item">
                    <i class="fas fa-shopping-bag"></i>
                    <span>{{ event.purchases_total }} покупок</span>
                  </div>
                  <div v-if="event.total_spent > 0" class="stat-item">
                    <i class="fas fa-ruble-sign"></i>
                    <span>{{ formatMoney(event.total_spent) }}</span>
                  </div>
                </div>
  
                <!-- Футер карточки -->
                <div class="event-footer">
                  <div class="event-date-text">
                    {{ formatEventDate(event.event_date) }}
                  </div>
                  <div class="event-action">
                    <span>Подробнее</span>
                    <i class="fas fa-arrow-right"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Пагинация -->
          <div v-if="totalPages > 1" class="pagination">
            <button 
              @click="currentPage = 1"
              :disabled="currentPage === 1"
              class="pagination-btn"
            >
              <i class="fas fa-angle-double-left"></i>
            </button>
            <button 
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="pagination-btn"
            >
              <i class="fas fa-angle-left"></i>
            </button>
            
            <div class="pagination-info">
              {{ currentPage }} из {{ totalPages }}
            </div>
            
            <button 
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="pagination-btn"
            >
              <i class="fas fa-angle-right"></i>
            </button>
            <button 
              @click="currentPage = totalPages"
              :disabled="currentPage === totalPages"
              class="pagination-btn"
            >
              <i class="fas fa-angle-double-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { furryApi } from '../../config/supabase.js'
  
  export default {
    name: 'EventsMainPage',
    
    data() {
      return {
        // Данные
        events: [],
        stats: {
          total: 0,
          upcoming: 0,
          completed: 0,
          totalSpent: 0
        },
        
        // Состояние
        loading: true,
        error: null,
        
        // Фильтры
        searchQuery: '',
        activeStatusFilter: 'all',
        sortBy: 'date_desc',
        
        // Пагинация
        currentPage: 1,
        eventsPerPage: 12,
        
        // Таймер для debounce поиска
        searchTimeout: null
      }
    },
    
    computed: {
      statusFilters() {
        return [
          { key: 'all', label: 'Все', icon: 'fas fa-calendar', count: this.stats.total },
          { key: 'upcoming', label: 'Предстоящие', icon: 'fas fa-calendar-alt', count: this.stats.upcoming },
          { key: 'completed', label: 'Завершённые', icon: 'fas fa-calendar-check', count: this.stats.completed }
        ]
      },
      
      filteredEvents() {
        let filtered = [...this.events]
        
        // Фильтр по статусу
        if (this.activeStatusFilter !== 'all') {
          if (this.activeStatusFilter === 'upcoming') {
            filtered = filtered.filter(event => this.isUpcoming(event))
          } else if (this.activeStatusFilter === 'completed') {
            filtered = filtered.filter(event => !this.isUpcoming(event))
          }
        }
        
        // Поиск
        if (this.searchQuery.trim()) {
          const query = this.searchQuery.toLowerCase()
          filtered = filtered.filter(event =>
            event.name.toLowerCase().includes(query) ||
            event.location.toLowerCase().includes(query) ||
            event.city?.toLowerCase().includes(query) ||
            event.description?.toLowerCase().includes(query)
          )
        }
        
        return filtered
      },
      
      paginatedEvents() {
        const start = (this.currentPage - 1) * this.eventsPerPage
        const end = start + this.eventsPerPage
        return this.filteredEvents.slice(start, end)
      },
      
      totalPages() {
        return Math.ceil(this.filteredEvents.length / this.eventsPerPage)
      }
    },
    
    watch: {
      activeStatusFilter() {
        this.currentPage = 1
      },
      
      searchQuery() {
        this.currentPage = 1
      },
      
      currentPage() {
        // Скролл в начало при смене страницы
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    
    async mounted() {
      await this.loadEvents()
    },
    
    methods: {
      async loadEvents() {
        this.loading = true
        this.error = null
        
        try {
          // Загружаем все мероприятия и статистику
          const [allEvents, eventStats] = await Promise.all([
            furryApi.getEvents({ status: 'all', limit: 100, sort: this.sortBy }),
            furryApi.getEventsStats()
          ])
          
          this.events = allEvents
          this.stats = eventStats
          
          console.log('✅ Все мероприятия загружены:', {
            total: allEvents.length,
            stats: eventStats
          })
          
        } catch (error) {
          console.error('❌ Ошибка загрузки мероприятий:', error)
          this.error = error.message
        } finally {
          this.loading = false
        }
      },
      
      // Поиск с задержкой
      debouncedSearch() {
        clearTimeout(this.searchTimeout)
        this.searchTimeout = setTimeout(() => {
          // Поиск выполняется автоматически через computed
        }, 300)
      },
      
      clearSearch() {
        this.searchQuery = ''
      },
      
      resetFilters() {
        this.searchQuery = ''
        this.activeStatusFilter = 'all'
        this.currentPage = 1
      },
      
      // Навигация
      goToEventDetail(slug) {
        this.$router.push(`/events/${slug}`)
      },
      
      // Утилиты для дат и статусов
      isUpcoming(event) {
        return new Date(event.event_date) > new Date()
      },
      
      getEventStatusClass(event) {
        if (this.isUpcoming(event)) return 'upcoming'
        return 'completed'
      },
      
      getStatusText(status) {
        const statusMap = {
          'upcoming': 'Предстоящее',
          'ongoing': 'Идёт сейчас',
          'completed': 'Завершено',
          'cancelled': 'Отменено'
        }
        return statusMap[status] || status
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
        return typeTexts[type] || type
      },
      
      // Форматирование
      getBannerImage(bannerUrl) {
        if (!bannerUrl) {
          return 'url(https://via.placeholder.com/400x200/1a1a1a/ff7b25?text=🎪)'
        }
        return `url(${bannerUrl})`
      },
      
      getMonthShort(dateString) {
        const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 
                       'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
        return months[new Date(dateString).getMonth()]
      },
      
      getDayOfMonth(dateString) {
        return new Date(dateString).getDate()
      },
      
      getYear(dateString) {
        return new Date(dateString).getFullYear()
      },
      
      formatEventDate(dateString) {
        return new Date(dateString).toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        })
      },
      
      formatMoney(amount) {
        return new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          minimumFractionDigits: 0
        }).format(amount)
      }
    }
  }
  </script>
  
  <style scoped>
  .events-main-page {
    min-height: 100vh;
    background: var(--bg-primary);
    padding-top: 2rem;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  /* Хедер страницы */
  .page-header {
    background: linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(34, 34, 34, 0.9));
    border-radius: 1.5rem;
    margin-bottom: 2rem;
    overflow: hidden;
    position: relative;
  }
  
  .page-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(255, 123, 37, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(76, 175, 80, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 3rem 2rem;
    position: relative;
    z-index: 1;
  }
  
  .page-title {
    font-size: 3rem;
    font-weight: 800;
    background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
  }
  
  .page-subtitle {
    font-size: 1.2rem;
    color: var(--text-muted);
    max-width: 500px;
  }
  
  .header-stats {
    display: flex;
    gap: 1.5rem;
  }
  
  .stat-card {
    text-align: center;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 1rem;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    min-width: 100px;
  }
  
  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: var(--accent-orange);
    line-height: 1;
  }
  
  .stat-label {
    font-size: 0.9rem;
    color: var(--text-muted);
    margin-top: 0.3rem;
  }
  
  /* Фильтры */
  .filters-section {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 1rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .filters-container {
    display: flex;
    gap: 1.5rem;
    align-items: center;
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
    padding: 0.8rem 1rem 0.8rem 2.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
    color: var(--text-light);
    font-size: 1rem;
    transition: all 0.3s ease;
  }
  
  .search-box input:focus {
    outline: none;
    border-color: var(--accent-orange);
    background: rgba(255, 255, 255, 0.08);
  }
  
  .clear-search {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 0.3rem;
    border-radius: 0.3rem;
    transition: all 0.2s ease;
  }
  
  .clear-search:hover {
    color: var(--accent-orange);
    background: rgba(255, 255, 255, 0.05);
  }
  
  .filter-tabs {
    display: flex;
    gap: 0.5rem;
  }
  
  .filter-tab {
    padding: 0.8rem 1.2rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    white-space: nowrap;
  }
  
  .filter-tab:hover {
    background: rgba(255, 255, 255, 0.08);
    color: var(--text-light);
  }
  
  .filter-tab.active {
    background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
    border-color: transparent;
    color: white;
  }
  
  .filter-count {
    font-size: 0.8rem;
    opacity: 0.8;
  }
  
  .sort-selector select {
    padding: 0.8rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
    color: var(--text-light);
    cursor: pointer;
    min-width: 150px;
  }
  
  /* Состояния */
  .loading-state, .error-state, .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: var(--text-muted);
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 123, 37, 0.3);
    border-top: 3px solid var(--accent-orange);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }
  
  .error-state i, .empty-state i {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: var(--accent-orange);
  }
  
  .retry-btn, .reset-filters-btn {
    margin-top: 1rem;
    padding: 0.8rem 1.5rem;
    background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
    border: none;
    border-radius: 0.5rem;
    color: white;
    cursor: pointer;
    transition: transform 0.2s;
  }
  
  .retry-btn:hover, .reset-filters-btn:hover {
    transform: translateY(-2px);
  }
  
  /* Сетка мероприятий */
  .events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }
  
  .event-card {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 1.2rem;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    height: fit-content;
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
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7));
  }
  
  .event-date {
    position: absolute;
    top: 1rem;
    left: 1rem;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 0.8rem;
    padding: 0.8rem;
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
  
  .event-status.upcoming {
    background: rgba(255, 123, 37, 0.9);
    color: white;
  }
  
  .event-status.completed {
    background: rgba(76, 175, 80, 0.9);
    color: white;
  }
  
  .event-badge.featured {
    background: rgba(255, 215, 0, 0.9);
    color: #1a1a1a;
  }
  
  .event-badge.rating {
    background: rgba(255, 123, 37, 0.9);
    color: white;
  }
  
  .event-progress-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.8);
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }
  
  .progress-bar-mini {
    flex: 1;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    overflow: hidden;
  }
  
  .progress-fill-mini {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-orange), var(--accent-green));
    border-radius: 2px;
    transition: width 0.3s ease;
  }
  
  .progress-text {
    font-size: 0.8rem;
    color: white;
    font-weight: 600;
  }
  
  /* Контент карточки */
  .event-content {
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
  }
  
  .event-description {
    color: var(--text-muted);
    font-size: 0.95rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .event-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .stat-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    color: var(--text-muted);
  }
  
  .stat-item i {
    color: var(--accent-green);
  }
  
  .event-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .event-date-text {
    font-size: 0.85rem;
    color: var(--text-muted);
  }
  
  .event-action {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--accent-orange);
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.3s ease;
  }
  
  .event-card:hover .event-action {
    gap: 0.8rem;
  }
  
  .event-card:hover .event-action i {
    transform: translateX(3px);
  }
  
  /* Пагинация */
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 3rem;
  }
  
  .pagination-btn {
    padding: 0.8rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
    color: var(--text-light);
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 40px;
  }
  
  .pagination-btn:hover:not(:disabled) {
    background: rgba(255, 123, 37, 0.2);
    border-color: var(--accent-orange);
  }
  
  .pagination-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  .pagination-info {
    padding: 0.8rem 1.2rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.5rem;
    color: var(--text-light);
    font-weight: 600;
  }
  
  /* Адаптивность */
  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      text-align: center;
      gap: 2rem;
    }
    
    .header-stats {
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .filters-container {
      flex-direction: column;
      align-items: stretch;
    }
    
    .search-box {
      min-width: 100%;
    }
    
    .filter-tabs {
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .events-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    
    .event-meta {
      flex-direction: column;
    }
    
    .event-stats {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  </style>