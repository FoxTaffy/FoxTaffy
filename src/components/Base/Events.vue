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
          <!-- Баннер мероприятия -->
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
              <span class="event-status">{{ getStatusText(event.attendance_status) }}</span>
              <span v-if="getDaysUntil(event.event_date) <= 30" class="event-badge">
                {{ getDaysUntil(event.event_date) }} дн.
              </span>
            </div>
          </div>
          
          <!-- Контент карточки -->
          <div class="event-content">
            <h3 class="event-name">{{ event.name }}</h3>
            <div class="event-meta">
              <div class="event-location">
                <i class="fas fa-map-marker-alt"></i>
                <span>{{ event.city || event.location }}</span>
              </div>
              <div v-if="event.expected_visitors" class="event-attendees">
                <i class="fas fa-users"></i>
                <span>{{ event.expected_visitors }}+ участников</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Прошедшие мероприятия -->
      <div class="events-list" v-show="activeTab === 'past'">
        <div v-if="pastEvents.length === 0" class="no-events">
          <i class="fas fa-calendar-check"></i>
          <p>Пока нет посещённых мероприятий</p>
        </div>
        <div 
          v-else
          v-for="event in pastEvents.slice(0, maxDisplayed)" 
          :key="event.id" 
          class="event-card past"
          @click="goToEventDetail(event.slug)"
        >
          <!-- Баннер мероприятия -->
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
              <span class="event-status completed">{{ getStatusText(event.attendance_status) }}</span>
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
          
          <!-- Контент карточки -->
          <div class="event-content">
            <h3 class="event-name">{{ event.name }}</h3>
            <div class="event-meta">
              <div class="event-location">
                <i class="fas fa-map-marker-alt"></i>
                <span>{{ event.city || event.location }}</span>
              </div>
              <div v-if="event.total_spent > 0" class="event-spent">
                <i class="fas fa-shopping-bag"></i>
                <span>{{ formatMoney(event.total_spent) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Кнопка "Показать все" -->
      <div v-if="hasMoreEvents" class="show-more-container">
        <button @click="goToEventsPage" class="show-more-btn">
          <i class="fas fa-calendar-alt"></i>
          <span>Все мероприятия</span>
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { imageHelpers } from '@/utils/imageUtils'
import { furryApi } from '@/config/supabase.js'

export default {
  name: 'EventsSection',
  data() {
    return {
      activeTab: 'past', // По умолчанию показываем прошедшие
      maxDisplayed: 6, // Максимум карточек для отображения
      loading: false,
      error: null,
      
      // Данные мероприятий
      upcomingEvents: [],
      pastEvents: [],
      stats: {
        upcoming: 0,
        completed: 0,
        total: 0
      }
    }
  },
  
  computed: {
    hasMoreEvents() {
      const currentEvents = this.activeTab === 'upcoming' ? 
        this.upcomingEvents : this.pastEvents
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
        console.log('🎪 Base/Events: Загружаем мероприятия...')
        
        // Загружаем предстоящие и прошедшие мероприятия
        const [upcoming, past, stats] = await Promise.all([
          furryApi.getEvents({ status: 'upcoming', limit: 10, sort: 'date_asc' }),
          furryApi.getEvents({ status: 'completed', limit: 10, sort: 'date_desc' }),
          furryApi.getEventsStats()
        ])
        
        this.upcomingEvents = upcoming || []
        this.pastEvents = past || []
        this.stats = stats || { upcoming: 0, completed: 0, total: 0 }
        
        console.log('✅ Base/Events: События загружены:', { 
          upcoming: this.upcomingEvents.length, 
          past: this.pastEvents.length,
          stats: this.stats 
        })
        
      } catch (error) {
        console.error('❌ Base/Events: Ошибка загрузки событий:', error)
        this.error = error.message || 'Ошибка загрузки мероприятий'
        
        // Fallback данные для тестирования
        this.pastEvents = [
          {
            id: '1',
            slug: 'test-event-1',
            name: 'Тестовое мероприятие 1',
            event_date: '2024-06-15',
            city: 'Москва',
            location: 'Крокус Экспо',
            attendance_status: 'attended',
            my_rating: 5,
            photos_count: 25,
            total_spent: 5000
          },
          {
            id: '2', 
            slug: 'test-event-2',
            name: 'Тестовое мероприятие 2',
            event_date: '2024-08-20',
            city: 'Санкт-Петербург',
            location: 'Ленэкспо',
            attendance_status: 'attended',
            my_rating: 4,
            photos_count: 15,
            total_spent: 3000
          }
        ]
        
        this.stats = { upcoming: 0, completed: 2, total: 2 }
        console.log('⚠️ Используем fallback данные для тестирования')
        
      } finally {
        this.loading = false
      }
    },
    
    // Навигация
    goToEventsPage() {
      this.$router.push('/events')
    },
    
    goToEventDetail(slug) {
      if (!slug) {
        console.warn('Нет slug для мероприятия')
        return
      }
      
      // Безопасная навигация
      try {
        this.$router.push(`/events/${slug}`)
      } catch (error) {
        console.error('Ошибка навигации:', error)
        // Fallback на основную страницу событий
        this.$router.push('/events')
      }
    },
    
    // Форматирование данных
    getBannerImage(bannerUrl) {
      return imageHelpers.getEventBanner(bannerUrl)
    },
    
    getStatusText(status) {
      const statusMap = {
        'planning': 'Планирую',
        'registered': 'Зарегистрирован',
        'attended': 'Посетил',
        'missed': 'Пропустил',
        'cancelled': 'Отменено'
      }
      return statusMap[status] || 'Планирую'
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
    
    getDaysUntil(dateString) {
      if (!dateString) return 0
      const eventDate = new Date(dateString)
      const now = new Date()
      const diffTime = eventDate - now
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return Math.max(0, diffDays)
    },
    
    formatMoney(amount) {
      if (!amount) return '0 ₽'
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
/* ===== ОСНОВНЫЕ СТИЛИ ===== */
.events-section {
  padding: 4rem 0;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  color: var(--text-light);
}

.section-description {
  text-align: center;
  color: var(--text-muted);
  margin-bottom: 3rem;
  font-size: 1.1rem;
}

/* ===== ТАБЫ ===== */
.events-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
}

.tabs-container {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  padding: 0.5rem;
  gap: 0.5rem;
}

.tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  color: var(--text-muted);
}

.tab:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-light);
}

.tab.active {
  background: var(--accent-orange);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 123, 37, 0.3);
}

.tab-count {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* ===== СОСТОЯНИЯ ЗАГРУЗКИ ===== */
.events-loading, .events-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  text-align: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 123, 37, 0.2);
  border-top: 3px solid var(--accent-orange);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: var(--accent-orange);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #e6691f;
  transform: translateY(-2px);
}

/* ===== СПИСОК МЕРОПРИЯТИЙ ===== */
.events-container {
  max-width: 1200px;
  margin: 0 auto;
}

.events-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.no-events {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  text-align: center;
  color: var(--text-muted);
}

.no-events i {
  font-size: 3rem;
  color: var(--accent-orange);
}

/* ===== КАРТОЧКИ МЕРОПРИЯТИЙ ===== */
.event-card {
  background: var(--bg-card);
  border-radius: 1rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
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

.event-badge {
  background: rgba(0, 0, 0, 0.8);
  color: white;
}

.event-badge.rating {
  background: rgba(255, 123, 37, 0.9);
}

.event-badge.photos {
  background: rgba(76, 175, 80, 0.9);
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
  font-size: 0.9rem;
  color: var(--text-muted);
}

.event-location, .event-attendees, .event-spent {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.event-meta i {
  color: var(--accent-orange);
  width: 16px;
}

/* ===== КНОПКА "ПОКАЗАТЬ ВСЕ" ===== */
.show-more-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.show-more-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, var(--accent-orange), #e6691f);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 123, 37, 0.3);
}

.show-more-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 123, 37, 0.4);
}

.show-more-btn:active {
  transform: translateY(-1px);
}

/* ===== АДАПТИВНОСТЬ ===== */
@media (max-width: 768px) {
  .events-list {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .tabs-container {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }
  
  .tab {
    justify-content: center;
    padding: 1rem;
  }
  
  .event-card {
    margin: 0 1rem;
  }
}

@media (max-width: 480px) {
  .events-section {
    padding: 2rem 0;
  }
  
  .event-banner {
    height: 120px;
  }
  
  .event-content {
    padding: 1rem;
  }
  
  .event-name {
    font-size: 1.1rem;
  }
}
</style>