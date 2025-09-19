<template>
  <!-- Мероприятия -->
  <div class="section">
    <h2 class="section-title">Мероприятия</h2>
    <p class="section-description">События, которые я посетил и планирую посетить. Присоединяйтесь!</p>
    
    <div class="events-container">
      <!-- Состояния загрузки -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Загружаем мероприятия...</p>
      </div>
      
      <div v-else-if="error" class="error-container">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button @click="loadEvents" class="retry-btn">
          <i class="fas fa-redo"></i>
          Попробовать снова
        </button>
      </div>
      
      <!-- Основной контент -->
      <div v-else>
        <!-- Статистика в кратком виде -->
        <div class="events-stats">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon completed">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.completed }}+</div>
                <div class="stat-label">Посещённых</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon upcoming">
                <i class="fas fa-calendar-plus"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.upcoming }}</div>
                <div class="stat-label">Планируемых</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon total">
                <i class="fas fa-calendar-alt"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.totalSpent ? formatMoney(stats.totalSpent) : stats.total }}</div>
                <div class="stat-label">{{ stats.totalSpent ? 'Потрачено' : 'Всего событий' }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Карточки последних событий -->
        <div class="events-grid">
          <div 
            v-for="event in displayedEvents" 
            :key="event.id"
            class="event-card" 
            :class="getEventCardClass(event)"
            @click="goToEventDetail(event)"
          >
            <div class="card-shine"></div>
            
            <!-- Изображение -->
            <div class="event-image">
              <img 
                :src="getEventImage(event)" 
                :alt="event.name"
                @error="handleImageError"
              >
              
              <!-- Бейдж статуса -->
              <div class="event-status-badge" :class="getStatusBadgeClass(event)">
                <i :class="getStatusIcon(event)"></i>
                <span>{{ getStatusText(event) }}</span>
              </div>
              
              <!-- Дата в углу (для предстоящих) -->
              <div v-if="!isEventCompleted(event)" class="event-date-badge">
                <div class="date-month">{{ getMonthShort(event.event_date) }}</div>
                <div class="date-day">{{ getDay(event.event_date) }}</div>
              </div>
            </div>
            
            <!-- Содержимое карточки -->
            <div class="event-content">
              <!-- Заголовок и мета-информация -->
              <div class="event-header">
                <h3 class="event-title">{{ event.name }}</h3>
                <div class="event-subtitle" v-if="event.subtitle">{{ event.subtitle }}</div>
              </div>
              
              <!-- Основная информация -->
              <div class="event-meta">
                <div class="meta-item">
                  <i class="fas fa-calendar-alt"></i>
                  <span>{{ formatEventDate(event.event_date) }}</span>
                </div>
                <div class="meta-item">
                  <i class="fas fa-map-marker-alt"></i>
                  <span>{{ event.city || event.location || 'Уточняется' }}</span>
                </div>
                <div v-if="event.attendees_count" class="meta-item">
                  <i class="fas fa-users"></i>
                  <span>{{ event.attendees_count }}+ участников</span>
                </div>
              </div>
              
              <!-- Описание -->
              <p class="event-description">
                {{ truncateDescription(event.short_description || event.description || 'Подробности скоро...') }}
              </p>
              
              <!-- Рейтинг (для завершённых событий) -->
              <div v-if="event.my_rating && isEventCompleted(event)" class="event-rating">
                <div class="rating-stars">
                  <i 
                    v-for="star in 5" 
                    :key="star"
                    class="fas fa-star"
                    :class="{ active: star <= event.my_rating }"
                  ></i>
                </div>
                <span class="rating-text">{{ event.my_rating }}/5</span>
              </div>
              
              <!-- Дополнительная информация -->
              <div class="event-extras" v-if="event.total_spent || event.photos_count">
                <div v-if="event.total_spent" class="extra-item spent">
                  <i class="fas fa-ruble-sign"></i>
                  <span>{{ formatMoney(event.total_spent) }}</span>
                </div>
                <div v-if="event.photos_count" class="extra-item photos">
                  <i class="fas fa-camera"></i>
                  <span>{{ event.photos_count }} фото</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Кнопка "Смотреть все" -->
        <div class="events-footer">
          <button class="view-all-btn" @click="goToAllEvents">
            <div class="btn-content">
              <div class="btn-icon">
                <i class="fas fa-calendar-week"></i>
              </div>
              <div class="btn-text">
                <div class="btn-title">Все мероприятия</div>
                <div class="btn-subtitle">Полный список с фильтрами и поиском</div>
              </div>
              <div class="btn-arrow">
                <i class="fas fa-arrow-right"></i>
              </div>
            </div>
            <div class="btn-shine"></div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { furryApi } from '@/config/supabase.js'

export default {
  name: 'EventsSection',
  
  data() {
    return {
      loading: true,
      error: null,
      
      // Данные из API
      events: [],
      stats: {
        upcoming: 0,
        completed: 0,
        total: 0,
        totalSpent: 0
      }
    }
  },
  
  computed: {
    // Отображаем 2-3 самых интересных события
    displayedEvents() {
      if (this.events.length === 0) return this.getFallbackEvents()
      
      // Получаем по одному самому свежему из каждой категории
      const completed = this.events.filter(e => this.isEventCompleted(e))
        .sort((a, b) => new Date(b.event_date) - new Date(a.event_date))
        .slice(0, 2) // Последние 2 завершённых
      
      const upcoming = this.events.filter(e => !this.isEventCompleted(e))
        .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
        .slice(0, 1) // Ближайшее предстоящее
      
      return [...upcoming, ...completed].slice(0, 3)
    }
  },
  
  async mounted() {
    await this.loadEvents()
  },
  
  methods: {
    // =================== API МЕТОДЫ ===================
    async loadEvents() {
      try {
        this.loading = true
        this.error = null
        
        console.log('🎪 Events: Загружаем данные мероприятий...')
        
        // Параллельно загружаем события и статистику
        const [eventsData, statsData] = await Promise.allSettled([
          furryApi.getEvents({ 
            status: 'all', 
            featured: true, // Только избранные для главной страницы
            limit: 10,
            sort: 'date_desc'
          }),
          furryApi.getEventsStats()
        ])
        
        // Обрабатываем события
        if (eventsData.status === 'fulfilled') {
          this.events = eventsData.value || []
          console.log(`✅ Events: Загружено ${this.events.length} событий`)
        } else {
          console.warn('⚠️ Events: Не удалось загрузить события:', eventsData.reason)
          this.events = []
        }
        
        // Обрабатываем статистику
        if (statsData.status === 'fulfilled') {
          this.stats = { ...this.stats, ...statsData.value }
          console.log('✅ Events: Статистика загружена:', this.stats)
        } else {
          console.warn('⚠️ Events: Не удалось загрузить статистику:', statsData.reason)
          // Вычисляем статистику из загруженных событий
          this.calculateStatsFromEvents()
        }
        
        // Если нет событий, используем fallback
        if (this.events.length === 0) {
          console.log('🧪 Events: Используем fallback данные')
          this.loadFallbackData()
        }
        
      } catch (error) {
        console.error('❌ Events: Критическая ошибка:', error)
        this.error = 'Не удалось загрузить мероприятия'
        this.loadFallbackData()
        
      } finally {
        this.loading = false
      }
    },
    
    // Вычисляем статистику из текущих событий
    calculateStatsFromEvents() {
      const now = new Date()
      this.stats = {
        upcoming: this.events.filter(e => new Date(e.event_date) >= now).length,
        completed: this.events.filter(e => new Date(e.event_date) < now).length,
        total: this.events.length,
        totalSpent: this.events.reduce((sum, e) => sum + (e.total_spent || 0), 0)
      }
    },
    
    // =================== FALLBACK ДАННЫЕ ===================
    getFallbackEvents() {
      return [
        {
          id: 'fb-1',
          slug: 'any-furry-fest-5',
          name: 'Any Furry Fest V',
          subtitle: 'Крупнейший фурри-фестиваль России',
          event_date: '2024-08-17',
          city: 'Москва',
          location: 'Парк-отель "Воздвиженское"',
          short_description: 'Невероятный трёхдневный фестиваль с множеством активностей, выставками артистов и незабываемой атмосферой фурри-сообщества.',
          my_rating: 5,
          total_spent: 8500,
          attendees_count: 400,
          photos_count: 47,
          is_featured: true,
          banner_url: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/events/aff5_banner.jpg',
          event_type: 'convention',
          attendance_status: 'attended'
        },
        {
          id: 'fb-2',
          slug: 'foxwood-2000s',
          name: 'FoxWood: Back to 2000s',
          subtitle: 'Ретро-мероприятие в лесной тематике',
          event_date: '2024-09-08',
          city: 'Ленинградская область',
          location: 'Загородный клуб "Бор"',
          short_description: 'Уникальная концепция: лесная тематика смешанная с ностальгией по нулевым. Атмосферное мероприятие на природе.',
          my_rating: 5,
          total_spent: 7500,
          attendees_count: 160,
          photos_count: 32,
          is_featured: true,
          banner_url: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/events/foxwood_banner.jpg',
          event_type: 'convention',
          attendance_status: 'attended'
        },
        {
          id: 'fb-3',
          slug: 'summer-meetup-2025',
          name: 'Summer Furry Meetup',
          subtitle: 'Летняя встреча сообщества',
          event_date: '2025-07-15',
          city: 'Санкт-Петербург',
          location: 'Парк 300-летия',
          short_description: 'Предстоящая летняя встреча фурри-сообщества с активностями на свежем воздухе и фотосессией.',
          attendees_count: 50,
          is_featured: true,
          banner_url: 'https://via.placeholder.com/400x250/4caf50/ffffff?text=Summer+Meetup',
          event_type: 'meetup',
          attendance_status: 'planning'
        }
      ]
    },
    
    loadFallbackData() {
      this.events = this.getFallbackEvents()
      this.stats = {
        upcoming: 1,
        completed: 2,
        total: 3,
        totalSpent: 16000
      }
    },
    
    // =================== УТИЛИТЫ ===================
    isEventCompleted(event) {
      return new Date(event.event_date) < new Date()
    },
    
    getEventCardClass(event) {
      const classes = []
      
      if (this.isEventCompleted(event)) {
        classes.push('completed')
        if (event.my_rating >= 4) classes.push('high-rating')
      } else {
        classes.push('upcoming')
      }
      
      return classes.join(' ')
    },
    
    getStatusBadgeClass(event) {
      return this.isEventCompleted(event) ? 'completed' : 'upcoming'
    },
    
    getStatusIcon(event) {
      return this.isEventCompleted(event) ? 'fas fa-check-circle' : 'fas fa-calendar-plus'
    },
    
    getStatusText(event) {
      if (this.isEventCompleted(event)) {
        return event.attendance_status === 'attended' ? 'Посетил' : 'Завершено'
      }
      return 'Скоро'
    },
    
    // =================== ФОРМАТИРОВАНИЕ ===================
    getEventImage(event) {
      if (event.banner_url) return event.banner_url
      if (event.image_url) return event.image_url  
      if (event.meta_image) return event.meta_image
      
      // Генерируем placeholder в зависимости от типа события
      const color = this.isEventCompleted(event) ? 'ff7b25' : '4caf50'
      return `https://via.placeholder.com/400x250/${color}/ffffff?text=${encodeURIComponent(event.name)}`
    },
    
    handleImageError(e) {
      e.target.src = 'https://via.placeholder.com/400x250/2a2a2a/ff7b25?text=Event+Image'
    },
    
    formatEventDate(dateString) {
      if (!dateString) return 'Дата уточняется'
      
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('ru-RU', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric'
        })
      } catch {
        return 'Дата уточняется'
      }
    },
    
    getMonthShort(dateString) {
      const months = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК']
      return months[new Date(dateString).getMonth()]
    },
    
    getDay(dateString) {
      return new Date(dateString).getDate()
    },
    
    formatMoney(amount) {
      if (!amount) return '0 ₽'
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
      }).format(amount)
    },
    
    truncateDescription(text, maxLength = 120) {
      if (!text) return 'Подробности скоро...'
      return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
    },
    
    // =================== НАВИГАЦИЯ ===================
    goToEventDetail(event) {
      if (event.slug) {
        this.$router.push(`/events/${event.slug}`)
      } else {
        console.warn('⚠️ Нет slug для мероприятия:', event)
        this.goToAllEvents()
      }
    },
    
    goToAllEvents() {
      this.$router.push('/events')
    }
  }
}
</script>

<style scoped>
/* Используем те же CSS переменные, что и в остальном проекте */

/* ===== ОСНОВНОЙ КОНТЕЙНЕР ===== */
.events-container {
  max-width: 100%;
}

.section-description {
  text-align: center;
  color: var(--text-muted);
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
}

/* ===== СОСТОЯНИЯ ЗАГРУЗКИ ===== */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  text-align: center;
  color: var(--text-muted);
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.error-container i {
  font-size: 2rem;
  color: var(--accent-orange);
}

/* ===== СТАТИСТИКА ===== */
.events-stats {
  margin-bottom: 2.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 1.2rem;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-3px);
}

.stat-icon {
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1.2rem;
  color: white;
  flex-shrink: 0;
}

.stat-icon.completed {
  background: linear-gradient(135deg, var(--accent-orange), #e6691f);
}

.stat-icon.upcoming {
  background: linear-gradient(135deg, var(--accent-green), #45a049);
}

.stat-icon.total {
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-light);
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
}

/* ===== СЕТКА КАРТОЧЕК ===== */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 2.5rem;
}

/* ===== КАРТОЧКИ СОБЫТИЙ ===== */
.event-card {
  background: var(--card-bg);
  border-radius: 1rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  display: flex;
  flex-direction: column;
}

.event-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 123, 37, 0.4);
}

/* Стили по статусу события */
.event-card.completed {
  border-left: 4px solid var(--accent-orange);
}

.event-card.upcoming {
  border-left: 4px solid var(--accent-green);
}

.event-card.high-rating {
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
}

/* Эффект блеска при hover */
.card-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.6s ease;
  z-index: 1;
  pointer-events: none;
}

.event-card:hover .card-shine {
  left: 100%;
}

/* ===== ИЗОБРАЖЕНИЯ СОБЫТИЙ ===== */
.event-image {
  position: relative;
  height: 220px;
  overflow: hidden;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.event-card:hover .event-image img {
  transform: scale(1.1);
}

/* Бейдж статуса */
.event-status-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.85rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 2;
}

.event-status-badge.completed {
  background: rgba(255, 123, 37, 0.9);
  color: white;
}

.event-status-badge.upcoming {
  background: rgba(76, 175, 80, 0.9);
  color: white;
}

/* Дата в углу (для предстоящих событий) */
.event-date-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.5rem;
  border-radius: 0.5rem;
  text-align: center;
  backdrop-filter: blur(10px);
  min-width: 50px;
}

.date-month {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--accent-green);
}

.date-day {
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1;
}

/* ===== СОДЕРЖИМОЕ КАРТОЧКИ ===== */
.event-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-header {
  margin-bottom: 0.5rem;
}

.event-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 0.3rem;
  line-height: 1.3;
}

.event-subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* Мета-информация */
.event-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.meta-item i {
  color: var(--accent-orange);
  width: 16px;
  text-align: center;
}

/* Описание */
.event-description {
  color: #c0c0c0;
  font-size: 0.95rem;
  line-height: 1.5;
  flex: 1;
}

/* Рейтинг */
.event-rating {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.rating-stars {
  display: flex;
  gap: 0.2rem;
}

.rating-stars i {
  color: rgba(255, 255, 255, 0.2);
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.rating-stars i.active {
  color: #ffc107;
}

.rating-text {
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 600;
}

/* Дополнительная информация */
.event-extras {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: auto;
}

.extra-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
  border-radius: 1rem;
}

.extra-item.spent {
  background: rgba(76, 175, 80, 0.1);
  color: var(--accent-green);
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.extra-item.photos {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

/* ===== КНОПКА "СМОТРЕТЬ ВСЕ" ===== */
.events-footer {
  text-align: center;
  margin-top: 1rem;
}

.view-all-btn {
  background: linear-gradient(135deg, var(--accent-orange), #ff9550);
  border: none;
  border-radius: 1rem;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 400px;
  padding: 0;
}

.view-all-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(255, 123, 37, 0.3);
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem 1.5rem;
  position: relative;
  z-index: 2;
}

.btn-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.btn-text {
  flex: 1;
  text-align: left;
  color: white;
}

.btn-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.2rem;
}

.btn-subtitle {
  font-size: 0.85rem;
  opacity: 0.9;
}

.btn-arrow {
  color: white;
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.view-all-btn:hover .btn-arrow {
  transform: translateX(5px);
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s ease;
}

.view-all-btn:hover .btn-shine {
  left: 100%;
}

/* ===== АДАПТИВНОСТЬ ===== */
@media (max-width: 768px) {
  .events-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-item {
    padding: 1rem;
  }
  
  .event-content {
    padding: 1.2rem;
  }
  
  .event-title {
    font-size: 1.2rem;
  }
  
  .btn-content {
    padding: 1rem 1.2rem;
  }
  
  .btn-title {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .events-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .event-image {
    height: 180px;
  }
  
  .section-description {
    font-size: 1rem;
  }
}
</style>