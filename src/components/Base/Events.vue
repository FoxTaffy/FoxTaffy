<template>
  <!-- Мероприятия - компактная версия для главной страницы -->
  <div class="section events-section">
    <h2 class="section-title">Мероприятия</h2>
    <p class="section-description">События, которые я посетил и планирую посетить. Присоединяйтесь!</p>
    
    <!-- Таблетки для переключения между предстоящими и прошедшими -->
    <div class="events-tabs">
      <div class="tabs-container">
        <div 
          class="tab" 
          :class="{ 'active': activeTab === 'upcoming' }" 
          @click="activeTab = 'upcoming'"
        >
          <i class="fas fa-calendar-alt"></i>
          <span>Предстоящие</span>
          <span v-if="stats.upcoming > 0" class="tab-count">({{ stats.upcoming }})</span>
        </div>
        <div 
          class="tab" 
          :class="{ 'active': activeTab === 'past' }" 
          @click="activeTab = 'past'"
        >
          <i class="fas fa-history"></i>
          <span>Прошедшие</span>
          <span v-if="stats.completed > 0" class="tab-count">({{ stats.completed }})</span>
        </div>
      </div>
    </div>
    
    <!-- Загрузка -->
    <div v-if="loading" class="events-loading">
      <div class="loading-spinner"></div>
      <p>Загружаем мероприятия...</p>
    </div>
    
    <!-- Ошибка загрузки -->
    <div v-else-if="error" class="events-error">
      <i class="fas fa-exclamation-triangle"></i>
      <p>Ошибка загрузки мероприятий: {{ error }}</p>
      <button @click="loadEvents" class="retry-btn">Попробовать снова</button>
    </div>
    
    <!-- Контейнер для списка мероприятий -->
    <div v-else class="events-container">
      <!-- Предстоящие мероприятия -->
      <div class="events-list" v-show="activeTab === 'upcoming'">
        <div v-if="upcomingEvents.length === 0" class="no-events">
          <i class="fas fa-calendar-plus"></i>
          <p>Пока нет запланированных мероприятий</p>
        </div>
        <div 
          v-else
          v-for="event in upcomingEvents.slice(0, maxDisplayed)" 
          :key="event.id" 
          class="event-card upcoming"
          @click="goToEventDetail(event.slug)"
        >
          <div class="event-banner" :style="{ backgroundImage: getBannerImage(event.banner_url) }">
            <div class="event-overlay"></div>
            <div class="event-date">
              <span class="month">{{ getMonthShort(event.event_date) }}</span>
              <span class="day">{{ getDayOfMonth(event.event_date) }}</span>
              <span class="year">{{ getYear(event.event_date) }}</span>
            </div>
            <div class="event-badges">
              <span class="event-status">{{ getStatusText(event.attendance_status) }}</span>
              <span v-if="event.is_featured" class="event-badge featured">⭐ Избранное</span>
              <span v-if="event.my_rating" class="event-badge rating">
                {{ '★'.repeat(event.my_rating) }}
              </span>
            </div>
          </div>
          
          <div class="event-content">
            <h3 class="event-name">{{ event.name }}</h3>
            <div class="event-meta">
              <div class="event-location">
                <i class="fas fa-map-marker-alt"></i>
                <span>{{ event.city || event.location }}</span>
              </div>
              <div v-if="event.attendees_count" class="event-attendees">
                <i class="fas fa-users"></i>
                <span>{{ event.attendees_count }} участников</span>
              </div>
            </div>
            <p class="event-description">{{ event.short_description || event.description }}</p>
            
            <!-- Прогресс подготовки -->
            <div v-if="event.preparation_progress < 100" class="event-progress">
              <div class="progress-info">
                <span>До события: {{ getDaysUntil(event.event_date) }}</span>
                <span>{{ Math.round(event.preparation_progress) }}%</span>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: event.preparation_progress + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Прошедшие мероприятия -->
      <div class="events-list" v-show="activeTab === 'past'">
        <div v-if="pastEvents.length === 0" class="no-events">
          <i class="fas fa-calendar-check"></i>
          <p>Пока нет завершённых мероприятий</p>
        </div>
        <div 
          v-else
          v-for="event in pastEvents.slice(0, maxDisplayed)" 
          :key="event.id" 
          class="event-card past"
          @click="goToEventDetail(event.slug)"
        >
          <div class="event-banner" :style="{ backgroundImage: getBannerImage(event.banner_url) }">
            <div class="event-overlay"></div>
            <div class="event-date">
              <span class="month">{{ getMonthShort(event.event_date) }}</span>
              <span class="day">{{ getDayOfMonth(event.event_date) }}</span>
              <span class="year">{{ getYear(event.event_date) }}</span>
            </div>
            <div class="event-badges">
              <span class="event-status completed">Завершено</span>
              <span v-if="event.my_rating" class="event-badge rating">
                {{ '★'.repeat(event.my_rating) }}
              </span>
              <span v-if="event.photos_count > 0" class="event-badge photos">
                <i class="fas fa-camera"></i> {{ event.photos_count }}
              </span>
            </div>
          </div>
          
          <div class="event-content">
            <h3 class="event-name">{{ event.name }}</h3>
            <div class="event-meta">
              <div class="event-location">
                <i class="fas fa-map-marker-alt"></i>
                <span>{{ event.city || event.location }}</span>
              </div>
              <div v-if="event.attendees_count" class="event-attendees">
                <i class="fas fa-users"></i>
                <span>{{ event.attendees_count }} участников</span>
              </div>
            </div>
            <p class="event-description">{{ event.short_description || event.description }}</p>
            
            <!-- Статистика после события -->
            <div class="event-stats">
              <div v-if="event.purchases_total > 0" class="stat-item">
                <i class="fas fa-shopping-bag"></i>
                <span>{{ event.purchases_total }} покупок</span>
              </div>
              <div v-if="event.total_spent > 0" class="stat-item">
                <i class="fas fa-ruble-sign"></i>
                <span>{{ formatMoney(event.total_spent) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Кнопка "Ещё" для перехода на полную страницу -->
      <div class="events-more" v-if="hasMoreEvents">
        <button @click="goToEventsPage" class="more-button">
          <span>Посмотреть все мероприятия</span>
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { furryApi } from '../../config/supabase.js'

export default {
  name: 'EventsSection',
  
  data() {
    return {
      // Состояние
      activeTab: 'upcoming',
      loading: true,
      error: null,
      
      // Данные
      upcomingEvents: [],
      pastEvents: [],
      stats: {
        total: 0,
        upcoming: 0,
        completed: 0
      },
      
      // Настройки отображения
      maxDisplayed: 4 // Максимум событий на главной странице
    }
  },
  
  computed: {
    hasMoreEvents() {
      const currentEvents = this.activeTab === 'upcoming' ? this.upcomingEvents : this.pastEvents
      return currentEvents.length > this.maxDisplayed
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
        // Загружаем предстоящие и прошедшие мероприятия
        const [upcoming, past, stats] = await Promise.all([
          furryApi.getEvents({ status: 'upcoming', limit: 10, sort: 'date_asc' }),
          furryApi.getEvents({ status: 'completed', limit: 10, sort: 'date_desc' }),
          furryApi.getEventsStats()
        ])
        
        this.upcomingEvents = upcoming
        this.pastEvents = past
        this.stats = stats
        
        console.log('✅ События загружены:', { 
          upcoming: upcoming.length, 
          past: past.length,
          stats 
        })
        
      } catch (error) {
        console.error('❌ Ошибка загрузки событий:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    
    // Навигация
    goToEventsPage() {
      this.$router.push('/events')
    },
    
    goToEventDetail(slug) {
      this.$router.push(`/events/${slug}`)
    },
    
    // Форматирование данных
    getBannerImage(bannerUrl) {
      if (!bannerUrl) {
        return 'url(https://via.placeholder.com/400x200/1a1a1a/ff7b25?text=🎪)'
      }
      return `url(${bannerUrl})`
    },
    
    getStatusText(status) {
      const statusMap = {
        'planning': 'Планирую',
        'registered': 'Зарегистрирован',
        'attended': 'Посетил',
        'missed': 'Пропустил',
        'cancelled': 'Отменено'
      }
      return statusMap[status] || status
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
    
    getDaysUntil(dateString) {
      const eventDate = new Date(dateString)
      const now = new Date()
      const diffTime = eventDate - now
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return "Прошло"
      if (diffDays === 0) return "Сегодня"
      if (diffDays === 1) return "Завтра"
      if (diffDays < 7) return `${diffDays} дня`
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} недель`
      return `${Math.ceil(diffDays / 30)} месяцев`
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
/* Основные стили секции */
.events-section {
  padding: 3rem 0;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(34, 34, 34, 0.9));
  border-radius: 1.2rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
}

.events-section::before {
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

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
}

.section-description {
  text-align: center;
  color: var(--text-muted);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto 2rem;
  position: relative;
  z-index: 1;
}

/* Стили табов */
.events-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
}

.tabs-container {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2rem;
  padding: 0.4rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
}

.tab {
  padding: 0.8rem 1.5rem;
  cursor: pointer;
  border-radius: 1.5rem;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  color: var(--text-muted);
  user-select: none;
  white-space: nowrap;
}

.tab i {
  font-size: 0.9rem;
}

.tab-count {
  font-size: 0.85rem;
  opacity: 0.8;
}

.tab:hover:not(.active) {
  color: var(--text-light);
  background: rgba(255, 255, 255, 0.05);
}

.tab.active {
  background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
  color: #fff;
  box-shadow: 0 5px 15px rgba(255, 123, 37, 0.3);
}

/* Состояния загрузки */
.events-loading, .events-error, .no-events {
  text-align: center;
  padding: 3rem 1rem;
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.events-error i {
  font-size: 2rem;
  color: var(--accent-orange);
  margin-bottom: 1rem;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.8rem 1.5rem;
  background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
  border: none;
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  transition: transform 0.2s;
}

.retry-btn:hover {
  transform: translateY(-2px);
}

.no-events i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

/* Контейнер мероприятий */
.events-container {
  position: relative;
  z-index: 1;
}

.events-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  padding: 0 1rem;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Карточки мероприятий */
.event-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.event-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
  border-color: rgba(255, 123, 37, 0.3);
}

.event-card.upcoming {
  border-color: rgba(255, 123, 37, 0.2);
  background: rgba(255, 123, 37, 0.05);
}

.event-card.past {
  border-color: rgba(76, 175, 80, 0.2);
  background: rgba(76, 175, 80, 0.05);
}

.event-banner {
  height: 160px;
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
  padding: 0.5rem;
  text-align: center;
  min-width: 60px;
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
  font-size: 1.5rem;
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
  padding: 0.3rem 0.8rem;
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

.event-badge.featured {
  background: rgba(255, 215, 0, 0.9);
  color: #1a1a1a;
}

.event-badge.rating {
  background: rgba(255, 123, 37, 0.9);
  color: white;
}

.event-badge.photos {
  background: rgba(76, 175, 80, 0.9);
  color: white;
}

/* Контент карточки */
.event-content {
  padding: 1.5rem;
}

.event-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 0.8rem;
  line-height: 1.3;
}

.event-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.event-location, .event-attendees {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.event-location i, .event-attendees i {
  color: var(--accent-orange);
}

.event-description {
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Прогресс подготовки */
.event-progress {
  margin-top: 1rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-orange), var(--accent-green));
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* Статистика после события */
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
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.stat-item i {
  color: var(--accent-green);
}

/* Кнопка "Ещё" */
.events-more {
  text-align: center;
  margin-top: 2rem;
  padding: 0 1rem;
}

.more-button {
  padding: 1rem 2rem;
  background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
  border: none;
  border-radius: 2rem;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  box-shadow: 0 5px 15px rgba(255, 123, 37, 0.3);
}

.more-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 123, 37, 0.4);
}

.more-button i {
  transition: transform 0.3s ease;
}

.more-button:hover i {
  transform: translateX(5px);
}

/* Адаптивность */
@media (max-width: 768px) {
  .events-list {
    grid-template-columns: 1fr;
    padding: 0;
  }
  
  .event-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .event-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .tabs-container {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .tab {
    justify-content: center;
  }
}
</style>