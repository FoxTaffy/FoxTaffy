<template>
  <!-- Мероприятия -->
  <div class="section">
    <h2 class="section-title">Мероприятия</h2>
    <p class="section-description">События, которые я посетил и планирую посетить. Присоединяйтесь!</p>
    
    <div class="events-container">
      <!-- Загрузка -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Загружаем мероприятия...</p>
      </div>
      
      <!-- Ошибка -->
      <div v-else-if="error" class="error-container">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Ошибка загрузки: {{ error }}</p>
        <button @click="loadEvents" class="retry-btn">Попробовать снова</button>
      </div>
      
      <!-- Карточки событий -->
      <div v-else class="events-grid">
        <!-- Карточки реальных событий (первые 2) -->
        <div 
          v-for="event in displayedEvents" 
          :key="event.id"
          class="event-card"
          @click="goToEventDetail(event.slug)"
        >
          <div class="event-image">
            <img 
              :src="getEventImage(event)" 
              :alt="event.name"
              @error="handleImageError"
            >
            <div class="event-badge" :class="getEventBadgeClass(event)">
              <i :class="getEventBadgeIcon(event)"></i>
              <span>{{ getEventBadgeText(event) }}</span>
            </div>
          </div>
          <div class="event-content">
            <h3 class="event-name">{{ event.name }}</h3>
            <div class="event-meta">
              <div class="event-date">
                <i class="fas fa-calendar-alt"></i>
                <span>{{ formatEventDate(event.event_date) }}</span>
              </div>
              <div class="event-location">
                <i class="fas fa-map-marker-alt"></i>
                <span>{{ event.city || event.location }}</span>
              </div>
            </div>
            <p class="event-description">{{ event.short_description || event.description }}</p>
            
            <!-- Рейтинг для прошедших событий -->
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
            <div v-if="event.total_spent || event.expected_visitors" class="event-extra">
              <div v-if="event.total_spent" class="event-spent">
                <i class="fas fa-ruble-sign"></i>
                <span>{{ formatMoney(event.total_spent) }}</span>
              </div>
              <div v-if="event.expected_visitors" class="event-visitors">
                <i class="fas fa-users"></i>
                <span>{{ event.expected_visitors }}+ участников</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Карточка "Все события" (третья карточка) -->
        <div class="event-card all-events-card" @click="goToEventsPage">
          <div class="all-events-content">
            <div class="all-events-icon">
              <i class="fas fa-calendar-week"></i>
            </div>
            <h3 class="all-events-title">Все мероприятия</h3>
            <p class="all-events-description">Посмотрите полный список всех конвентов, которые я посетил</p>
            <div class="all-events-stats">
              <div class="stat-item">
                <span class="stat-number">{{ stats.completed }}+</span>
                <span class="stat-label">Посещённых</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ stats.upcoming }}+</span>
                <span class="stat-label">Планируемых</span>
              </div>
            </div>
            <div class="all-events-button">
              <span>Смотреть все</span>
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>
          <div class="card-shine"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// ✅ ИСПРАВЛЕННЫЙ ИМПОРТ
import { furryApi } from '@/config/supabase.js'

export default {
  name: 'EventsSection',
  data() {
    return {
      loading: false,
      error: null,
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
    // Получаем первые 2 события для отображения (1 будущее + 1 прошедшее или 2 любых)
    displayedEvents() {
      const events = []
      
      // Добавляем 1 будущее событие если есть
      if (this.upcomingEvents.length > 0) {
        events.push(this.upcomingEvents[0])
      }
      
      // Добавляем 1 прошедшее событие если есть
      if (this.pastEvents.length > 0) {
        events.push(this.pastEvents[0])
      }
      
      // Если событий меньше 2, добавляем из оставшихся
      if (events.length < 2) {
        const remainingUpcoming = this.upcomingEvents.slice(1)
        const remainingPast = this.pastEvents.slice(1)
        const remaining = [...remainingUpcoming, ...remainingPast]
        
        for (let i = 0; i < remaining.length && events.length < 2; i++) {
          events.push(remaining[i])
        }
      }
      
      return events
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
        console.log('🎪 Events.vue: Загружаем мероприятия...')
        
        // ✅ ИСПОЛЬЗУЕМ ПРАВИЛЬНЫЙ API
        const [upcoming, completed] = await Promise.all([
          furryApi.getEvents({ 
            status: 'upcoming', 
            limit: 5,
            sort: 'date_asc'
          }),
          furryApi.getEvents({ 
            status: 'completed', 
            limit: 5,
            sort: 'date_desc'
          })
        ])
        
        this.upcomingEvents = upcoming || []
        this.pastEvents = completed || []
        
        // Обновляем статистику
        this.stats = {
          upcoming: this.upcomingEvents.length,
          completed: this.pastEvents.length,
          total: this.upcomingEvents.length + this.pastEvents.length
        }
        
        console.log('✅ Events.vue: Загружено', {
          upcoming: this.upcomingEvents.length,
          completed: this.pastEvents.length
        })
        
      } catch (error) {
        console.error('❌ Events.vue: Ошибка загрузки:', error)
        this.error = error.message || 'Не удалось загрузить мероприятия'
        
        // Fallback статистика
        this.stats = { upcoming: 3, completed: 8, total: 11 }
        
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
        console.warn('⚠️ Нет slug для мероприятия')
        return
      }
      
      try {
        this.$router.push(`/events/${slug}`)
      } catch (error) {
        console.error('❌ Ошибка навигации:', error)
        this.$router.push('/events')
      }
    },
    
    // Форматирование и утилиты
    getEventImage(event) {
      if (event.banner_url) return event.banner_url
      if (event.image_url) return event.image_url
      return `https://via.placeholder.com/300x200?text=${encodeURIComponent(event.name)}`
    },
    
    handleImageError(e) {
      e.target.src = 'https://via.placeholder.com/300x200?text=Event+Image'
    },
    
    isEventCompleted(event) {
      return new Date(event.event_date) < new Date()
    },
    
    getEventBadgeClass(event) {
      if (this.isEventCompleted(event)) {
        return 'completed'
      } else {
        return 'upcoming'
      }
    },
    
    getEventBadgeIcon(event) {
      if (this.isEventCompleted(event)) {
        return 'fas fa-check-circle'
      } else {
        return 'fas fa-calendar-plus'
      }
    },
    
    getEventBadgeText(event) {
      if (this.isEventCompleted(event)) {
        return 'Посетил'
      } else {
        return 'Скоро'
      }
    },
    
    formatEventDate(dateString) {
      if (!dateString) return 'Дата уточняется'
      
      try {
        const date = new Date(dateString)
        const options = { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric'
        }
        return date.toLocaleDateString('ru-RU', options)
      } catch (error) {
        return 'Дата уточняется'
      }
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
/* ===== ОСНОВНОЙ КОНТЕЙНЕР ===== */
.events-container {
  max-width: 100%;
}

.section-description {
  text-align: center;
  color: var(--text-muted);
  margin-bottom: 2rem;
  font-size: 1.1rem;
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

/* ===== СЕТКА КАРТОЧЕК ===== */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
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
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 123, 37, 0.3);
}

/* ===== ИЗОБРАЖЕНИЯ СОБЫТИЙ ===== */
.event-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.event-card:hover .event-image img {
  transform: scale(1.1);
}

.event-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.9rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.event-badge.upcoming {
  background: rgba(255, 123, 37, 0.9);
  color: white;
}

.event-badge.completed {
  background: rgba(76, 175, 80, 0.9);
  color: white;
}

/* ===== КОНТЕНТ КАРТОЧЕК ===== */
.event-content {
  padding: 1.5rem;
}

.event-name {
  font-size: 1.3rem;
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
  font-size: 0.9rem;
  color: var(--text-muted);
}

.event-date, .event-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.event-meta i {
  color: var(--accent-orange);
  width: 16px;
}

.event-description {
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ===== РЕЙТИНГ ===== */
.event-rating {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
}

.rating-stars {
  display: flex;
  gap: 0.2rem;
}

.rating-stars i {
  color: #444;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.rating-stars i.active {
  color: #ffd700;
}

.rating-text {
  font-size: 0.9rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* ===== ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ ===== */
.event-extra {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.event-spent, .event-visitors {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.event-extra i {
  color: var(--accent-orange);
  width: 16px;
}

/* ===== КАРТОЧКА "ВСЕ СОБЫТИЯ" ===== */
.all-events-card {
  cursor: pointer;
  background: linear-gradient(135deg, 
    rgba(255, 123, 37, 0.1) 0%, 
    rgba(76, 175, 80, 0.1) 100%
  );
  border: 1px solid rgba(255, 123, 37, 0.2);
  position: relative;
  overflow: hidden;
}

.all-events-card:hover {
  background: linear-gradient(135deg, 
    rgba(255, 123, 37, 0.15) 0%, 
    rgba(76, 175, 80, 0.15) 100%
  );
  border-color: rgba(255, 123, 37, 0.4);
}

.all-events-content {
  padding: 2rem;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.all-events-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--accent-orange), var(--accent-green));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  margin-bottom: 0.5rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 123, 37, 0.7);
  }
  50% {
    box-shadow: 0 0 0 20px rgba(255, 123, 37, 0);
  }
}

.all-events-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-light);
  margin: 0;
}

.all-events-description {
  color: var(--text-muted);
  line-height: 1.5;
  margin: 0;
}

.all-events-stats {
  display: flex;
  gap: 2rem;
  margin: 1rem 0;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-orange);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.all-events-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--accent-orange);
  font-weight: 600;
  margin-top: 0.5rem;
  transition: all 0.3s ease;
}

.all-events-card:hover .all-events-button {
  color: var(--accent-green);
  transform: translateX(5px);
}

/* ===== АНИМАЦИЯ БЛЕСКА ===== */
.card-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.1), 
    transparent
  );
  transition: left 0.6s ease;
}

.all-events-card:hover .card-shine {
  left: 100%;
}

/* ===== АДАПТИВНОСТЬ ===== */
@media (max-width: 768px) {
  .events-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .all-events-icon {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
  
  .all-events-stats {
    gap: 1.5rem;
  }
  
  .stat-number {
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .event-content {
    padding: 1rem;
  }
  
  .event-image {
    height: 150px;
  }
  
  .all-events-content {
    padding: 1.5rem;
  }
}
</style>