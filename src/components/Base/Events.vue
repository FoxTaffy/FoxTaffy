<template>
  <!-- Мероприятия -->
  <div class="section events-section" id="events">
    <h2 class="section-title">Мероприятия</h2>
    <p class="section-description">События, которые я посетил и планирую посетить.</p>
    
    <!-- Состояния загрузки -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Загружаем последние события...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <button @click="loadData" class="retry-button">
        <i class="fas fa-redo"></i>
        Попробовать снова
      </button>
    </div>
    
    <!-- Карточки мероприятий -->
    <div v-else class="events-grid">
      <!-- Две основные карточки -->
      <div
        v-for="event in mainEvents"
        :key="event.id"
        class="event-card"
        :class="[getCardClass(event), { 'no-review': !hasReview(event) && !isUpcoming(event) }]"
        @click="openEvent(event)"
      >
        <!-- Изображение -->
        <div class="card-image">
          <img 
            :src="getImageUrl(event)" 
            :alt="event.name"
            @error="onImageError"
          >
          
          <!-- Дата -->
          <div class="date-badge">
            <div class="month">{{ getMonth(event.event_date) }}</div>
            <div class="day">{{ getDay(event.event_date) }}</div>
            <div class="year">{{ getYear(event.event_date) }}</div>
          </div>
          
          <!-- Статус -->
          <div class="status-badge" :class="getStatusClass(event)">
            {{ getStatusText(event) }}
          </div>
        </div>
        
        <!-- Контент -->
        <div class="card-content">
          <h3 class="event-name">{{ event.name }}</h3>
          
          <!-- Мета информация -->
          <div class="event-meta">
            <div class="meta-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ getLocation(event) }}</span>
            </div>
            <div v-if="event.attendees_count" class="meta-item">
              <i class="fas fa-users"></i>
              <span>{{ event.attendees_count }}+</span>
            </div>
          </div>
          
          <!-- Описание -->
          <p class="event-description">{{ getDescription(event) }}</p>

          <!-- Особенности мероприятия -->
          <div v-if="event.con_features && event.con_features.length > 0" class="event-features">
            <div
              v-for="feature in event.con_features.slice(0, 3)"
              :key="feature.id"
              class="feature-badge"
              :title="feature.title"
            >
              <i :class="feature.icon_class || 'fas fa-star'"></i>
              <span>{{ feature.title }}</span>
            </div>
            <div v-if="event.con_features.length > 3" class="feature-badge more-features">
              +{{ event.con_features.length - 3 }}
            </div>
          </div>

          <!-- Прогресс для предстоящих или блок для прошедших -->
          <div v-if="isUpcoming(event)" class="countdown-block">
            <div class="countdown-text">
              <i class="fas fa-clock"></i>
              <span>До начала: {{ getTimeLeft(event.event_date) }}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: getProgress(event.event_date) + '%' }"></div>
            </div>
          </div>

          <!-- Для прошедших событий - показываем рейтинг и/или фотогаллерею -->
          <div v-else class="completed-info-block">
            <!-- Рейтинг (если есть) -->
            <div v-if="getOverallRating(event) > 0" class="rating-block">
              <StarRating :rating="getOverallRating(event)" size="medium" :show-value="false" />
            </div>

            <!-- Фотогаллерея (показываем всегда для прошедших, даже без обзора) -->
            <div class="gallery-block">
              <!-- Миниатюры фотографий -->
              <div v-if="event.photoPreviews && event.photoPreviews.length > 0" class="gallery-previews">
                <!-- Показываем первые 4 фотографии -->
                <div
                  v-for="(photo, index) in event.photoPreviews.slice(0, 4)"
                  :key="photo.id"
                  class="gallery-preview-item"
                >
                  <img :src="photo.thumbnail_url || photo.image_url" :alt="photo.caption || 'Фото'">
                </div>
                <!-- Пятая фотография заблюрена с количеством оставшихся -->
                <div v-if="event.photos_count > 4" class="gallery-preview-item gallery-more-overlay">
                  <img
                    v-if="event.photoPreviews[4]"
                    :src="event.photoPreviews[4].thumbnail_url || event.photoPreviews[4].image_url"
                    :alt="'Фото'"
                    class="blurred-image"
                  >
                  <div class="gallery-more-count">
                    +{{ event.photos_count - 4 }}
                  </div>
                </div>
              </div>

              <!-- Fallback если нет превью -->
              <div v-else class="gallery-text">
                <i class="fas fa-images"></i>
                <span>{{ event.photos_count || 0 }} {{ pluralizePhotos(event.photos_count || 0) }}</span>
              </div>

              <div class="gallery-hint">
                <i class="fas fa-arrow-right"></i>
                <span>{{ hasReview(event) ? 'Смотреть обзор' : 'Подробнее' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Карточка "Показать ещё" -->
      <div class="event-card show-more-card" @click="showAllEvents">
        <!-- Заблюренное изображение -->
        <div class="card-image blurred">
          <img 
            :src="getImageUrl(thirdEvent)" 
            :alt="thirdEvent.name"
            @error="onImageError"
          >
          
          <!-- Дата -->
          <div class="date-badge">
            <div class="month">{{ getMonth(thirdEvent.event_date) }}</div>
            <div class="day">{{ getDay(thirdEvent.event_date) }}</div>
            <div class="year">{{ getYear(thirdEvent.event_date) }}</div>
          </div>
          
          <!-- Статус -->
          <div class="status-badge" :class="getStatusClass(thirdEvent)">
            {{ getStatusText(thirdEvent) }}
          </div>
        </div>
        
        <!-- Контент с блюром -->
        <div class="card-content blurred-content">
          <h3 class="event-name">{{ thirdEvent.name }}</h3>
          
          <div class="event-meta">
            <div class="meta-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ getLocation(thirdEvent) }}</span>
            </div>
            <div v-if="thirdEvent.attendees_count" class="meta-item">
              <i class="fas fa-users"></i>
              <span>{{ thirdEvent.attendees_count }}+</span>
            </div>
          </div>
          
          <p class="event-description">{{ getDescription(thirdEvent) }}</p>
        </div>
        
        <!-- Overlay поверх всей карточки -->
        <div class="show-more-overlay">
          <div class="overlay-content">
            <div class="overlay-icon">
              <i class="fas fa-calendar-week"></i>
            </div>
            <h4 class="overlay-title">Показать ещё</h4>
            <p class="overlay-subtitle">{{ stats.total }}+ мероприятий</p>
            <div class="overlay-stats">
              <span>{{ stats.completed }} посещено</span>
              <span class="divider">•</span>
              <span>{{ stats.upcoming }} планируется</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { furryApi } from '@/config/supabase.js'
import StarRating from '@/components/ui/StarRating.vue'

export default {
  name: 'EventsSection',
  components: {
    StarRating
  },
  
  data() {
    return {
      loading: true,
      error: null,
      events: [],
      stats: {
        total: 0,
        upcoming: 0,
        completed: 0
      }
    }
  },
  
  computed: {
    // Первые 2 события для основных карточек
    mainEvents() {
      if (this.events.length === 0) {
        return this.getDefaultEvents().slice(0, 2)
      }
      
      const now = new Date()
      
      // Ближайшие предстоящие
      const upcoming = this.events
        .filter(e => new Date(e.event_date) > now)
        .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
      
      // Последние завершённые
      const completed = this.events
        .filter(e => new Date(e.event_date) <= now)
        .sort((a, b) => new Date(b.event_date) - new Date(a.event_date))
      
      // Берём по одному из каждой категории
      const result = []
      if (upcoming.length > 0) result.push(upcoming[0])
      if (completed.length > 0) result.push(completed[0])
      
      // Если недостаточно, добавляем ещё
      if (result.length < 2) {
        const remaining = [...upcoming.slice(1), ...completed.slice(1)]
        while (result.length < 2 && remaining.length > 0) {
          const next = remaining.shift()
          if (!result.find(e => e.id === next.id)) {
            result.push(next)
          }
        }
      }
      
      return result.slice(0, 2)
    },
    
    // Третье событие для заблюренной карточки
    thirdEvent() {
      if (this.events.length === 0) {
        return this.getDefaultEvents()[2]
      }
      
      const usedIds = this.mainEvents.map(e => e.id)
      const remaining = this.events.filter(e => !usedIds.includes(e.id))
      
      return remaining.length > 0 ? remaining[0] : this.getDefaultEvents()[2]
    }
  },
  
  async mounted() {
    await this.loadData()
  },
  
  methods: {
    // =================== ЗАГРУЗКА ДАННЫХ ===================
    async loadData() {
      try {
        this.loading = true
        this.error = null
        
        console.log('🎪 Загружаем мероприятия...')
        
        const [eventsData, statsData] = await Promise.allSettled([
          furryApi.getEvents({ 
            status: 'all',
            featured: true,
            limit: 15,
            sort: 'date_desc'
          }),
          furryApi.getEventsStats()
        ])
        
        // Обработка событий
        if (eventsData.status === 'fulfilled') {
          this.events = eventsData.value || []
          console.log(`✅ Загружено ${this.events.length} событий`)

          // Загружаем превью фотографий для событий
          await this.loadEventPhotoPreviews()
        } else {
          console.warn('⚠️ События не загружены:', eventsData.reason)
          this.events = []
        }

        // Обработка статистики
        if (statsData.status === 'fulfilled') {
          this.stats = {
            total: statsData.value?.total || 0,
            upcoming: statsData.value?.upcoming || 0,
            completed: statsData.value?.completed || 0
          }
        } else {
          this.calculateStats()
        }
        
        // Fallback данные
        if (this.events.length === 0) {
          console.log('📝 Используем fallback данные')
          this.loadDefaultData()
        }
        
      } catch (error) {
        console.error('❌ Ошибка загрузки:', error)
        this.error = 'Не удалось загрузить мероприятия'
        this.loadDefaultData()
        
      } finally {
        this.loading = false
      }
    },
    
    calculateStats() {
      if (this.events.length === 0) return

      const now = new Date()
      this.stats = {
        total: this.events.length,
        upcoming: this.events.filter(e => new Date(e.event_date) > now).length,
        completed: this.events.filter(e => new Date(e.event_date) <= now).length
      }
    },

    // Загрузка превью фотографий для событий
    async loadEventPhotoPreviews() {
      try {
        // Получаем ID всех событий
        const eventIds = this.events.map(e => e.id).filter(Boolean)
        if (eventIds.length === 0) return

        console.log('📸 Загружаем превью фотографий для событий...')

        // Загружаем фотографии для всех событий одним запросом
        const photos = await furryApi.getPhotosForEvents(eventIds, 5) // 5 фотографий на событие

        // Группируем фотографии по событиям
        const photosByEvent = {}
        photos.forEach(photo => {
          if (!photosByEvent[photo.con_id]) {
            photosByEvent[photo.con_id] = []
          }
          if (photosByEvent[photo.con_id].length < 5) {
            photosByEvent[photo.con_id].push(photo)
          }
        })

        // Добавляем фотографии к событиям
        this.events = this.events.map(event => ({
          ...event,
          photoPreviews: photosByEvent[event.id] || []
        }))

        console.log('✅ Превью фотографий загружены')
      } catch (error) {
        console.warn('⚠️ Не удалось загрузить превью фотографий:', error)
      }
    },

    // =================== FALLBACK ДАННЫЕ ===================
    getDefaultEvents() {
      return [
        {
          id: '1',
          slug: 'summer-meetup-2025',
          name: 'Summer Furry Meetup',
          event_date: '2025-07-15T12:00:00Z',
          city: 'Санкт-Петербург',
          location: 'Парк 300-летия',
          attendees_count: 50,
          short_description: 'Летняя встреча фурри-сообщества с активностями на свежем воздухе.',
          banner_url: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/events/summer_meetup.jpg',
          event_type: 'meetup',
          attendance_status: 'planning'
        },
        {
          id: '2',
          slug: 'any-furry-fest-5',
          name: 'Any Furry Fest V',
          event_date: '2024-08-17T09:00:00Z',
          city: 'Москва',
          location: 'Парк-отель "Воздвиженское"',
          attendees_count: 400,
          my_rating: 5,
          short_description: 'Крупнейший фурри-фестиваль России с множеством активностей.',
          banner_url: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/events/aff5_banner.jpg',
          event_type: 'convention',
          attendance_status: 'attended'
        },
        {
          id: '3',
          slug: 'foxwood-2000s',
          name: 'FoxWood: Back to 2000s',
          event_date: '2024-09-08T10:00:00Z',
          city: 'Ленинградская область',
          location: 'Загородный клуб "Бор"',
          attendees_count: 160,
          my_rating: 5,
          short_description: 'Ретро-мероприятие в лесной тематике с ностальгией по нулевым.',
          banner_url: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/events/foxwood_banner.jpg',
          event_type: 'convention',
          attendance_status: 'attended'
        }
      ]
    },
    
    loadDefaultData() {
      this.events = this.getDefaultEvents()
      this.stats = {
        total: 3,
        upcoming: 1,
        completed: 2
      }
    },
    
    // =================== УТИЛИТЫ ===================
    isUpcoming(event) {
      return new Date(event.event_date) > new Date()
    },

    // Проверка наличия обзора (хотя бы один рейтинг или my_rating)
    hasReview(event) {
      if (!event) return false

      // Проверяем наличие хотя бы одной оценки в новой системе рейтингов
      const hasDetailedRatings = [
        event.rating_organization,
        event.rating_program,
        event.rating_atmosphere,
        event.rating_location,
        event.rating_participants,
        event.rating_food
      ].some(r => r !== null && r !== undefined && r > 0)

      // Или есть старый my_rating
      const hasMyRating = event.my_rating && event.my_rating > 0

      // Или есть текст обзора
      const hasReviewText = event.review || event.review_text

      return hasDetailedRatings || hasMyRating || hasReviewText
    },

    // Вычисление общего рейтинга
    getOverallRating(event) {
      if (!event) return 0

      // Проверяем новую систему рейтингов (6 категорий)
      const ratings = [
        event.rating_organization,
        event.rating_program,
        event.rating_atmosphere,
        event.rating_location,
        event.rating_participants,
        event.rating_food
      ].filter(r => r !== null && r !== undefined && r > 0)

      if (ratings.length > 0) {
        const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        return parseFloat(avg.toFixed(1))
      }

      // Fallback на старый my_rating
      return event.my_rating || 0
    },

    // Плюрализация для количества фотографий
    pluralizePhotos(count) {
      const lastDigit = count % 10
      const lastTwoDigits = count % 100

      if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return 'фотографий'
      } else if (lastDigit === 1) {
        return 'фотография'
      } else if (lastDigit >= 2 && lastDigit <= 4) {
        return 'фотографии'
      } else {
        return 'фотографий'
      }
    },

    getCardClass(event) {
      return this.isUpcoming(event) ? 'upcoming' : 'completed'
    },

    getStatusClass(event) {
      return this.isUpcoming(event) ? 'upcoming' : 'completed'
    },
    
    getStatusText(event) {
      if (this.isUpcoming(event)) {
        return 'Буду участвовать'
      } else {
        return 'Посетил'
      }
    },
    
    // =================== ФОРМАТИРОВАНИЕ ДАТЫ ===================
    getMonth(dateString) {
      const months = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК']
      try {
        return months[new Date(dateString).getMonth()]
      } catch {
        return 'МЕС'
      }
    },
    
    getDay(dateString) {
      try {
        return new Date(dateString).getDate()
      } catch {
        return '1'
      }
    },
    
    getYear(dateString) {
      try {
        return new Date(dateString).getFullYear()
      } catch {
        return '2025'
      }
    },
    
    // =================== ВРЕМЯ ДО СОБЫТИЯ ===================
    getTimeLeft(dateString) {
      try {
        const eventDate = new Date(dateString)
        const now = new Date()
        const diffTime = eventDate - now
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays > 0) {
          return `${diffDays} ${this.pluralizeDays(diffDays)}`
        } else if (diffDays === 0) {
          return 'Сегодня!'
        } else {
          return 'Завершено'
        }
      } catch {
        return 'Скоро'
      }
    },
    
    pluralizeDays(days) {
      const lastDigit = days % 10
      const lastTwoDigits = days % 100
      
      if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return 'дней'
      } else if (lastDigit === 1) {
        return 'день'
      } else if (lastDigit >= 2 && lastDigit <= 4) {
        return 'дня'
      } else {
        return 'дней'
      }
    },
    
    getProgress(dateString) {
      try {
        const eventDate = new Date(dateString)
        const now = new Date()
        const diffDays = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24))
        
        const maxDays = 100
        return Math.max(0, Math.min(100, ((maxDays - diffDays) / maxDays) * 100))
      } catch {
        return 50
      }
    },
    
    // =================== КОНТЕНТ ===================
    getLocation(event) {
      return event.city || event.location || 'Место уточняется'
    },
    
    getDescription(event) {
      let text = event.short_description || event.description || ''
      
      if (!text) {
        const defaults = {
          convention: 'Конвент, который мы создаём так, как сами хотели бы его посетить.',
          meetup: 'Встреча фурри-сообщества для общения и новых знакомств.',
          festival: 'Фестиваль с насыщенной программой и яркими впечатлениями.',
          market: 'Маркет товаров и услуг для фурри-сообщества.'
        }
        text = defaults[event.event_type] || 'Интересное мероприятие для нашего сообщества.'
      }
      
      return text.length > 120 ? text.slice(0, 120) + '...' : text
    },
    
    // =================== ИЗОБРАЖЕНИЯ ===================
    getImageUrl(event) {
      // Приоритет: avatar_url (логотип) -> banner_url -> остальные
      const urls = [event.avatar_url, event.banner_url, event.image_url, event.meta_image, event.logo_url]

      for (const url of urls) {
        if (url && this.isValidUrl(url)) {
          return url
        }
      }
      
      // Используем SVG placeholder вместо via.placeholder.com
      const color = this.isUpcoming(event) ? '4caf50' : 'ff7b25'
      const name = event.name?.slice(0, 8) || 'Event'
      return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250'%3E%3Crect width='400' height='250' fill='%23${color}'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='24' fill='%23ffffff'%3E${encodeURIComponent(name)}%3C/text%3E%3C/svg%3E`
    },
    
    isValidUrl(url) {
      return url && typeof url === 'string' && (
        url.startsWith('http') || 
        url.startsWith('https') ||
        url.startsWith('/')
      )
    },
    
    onImageError(event) {
      // Используем SVG placeholder вместо via.placeholder.com
      event.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250'%3E%3Crect width='400' height='250' fill='%232a2a2a'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='24' fill='%23ff7b25'%3EEvent%3C/text%3E%3C/svg%3E"
    },
    
    // =================== НАВИГАЦИЯ ===================
    openEvent(event) {
      if (event.slug) {
        this.$router.push(`/events/${event.slug}`)
      } else if (event.id) {
        // Fallback на ID если нет slug
        this.$router.push(`/events/${event.id}`)
      } else {
        this.showAllEvents()
      }
    },
    
    showAllEvents() {
      this.$router.push('/events')
    }
  }
}
</script>

<style scoped>
/* ===== ОСНОВА ===== */
.section-description {
  color: var(--text-muted);
  margin-bottom: 2rem;
  text-align: left;
  font-size: 1rem;
  line-height: 1.6;
}

/* ===== СОСТОЯНИЯ ЗАГРУЗКИ ===== */
.loading-state, .error-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 123, 37, 0.2);
  border-top: 3px solid var(--accent-orange);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--accent-orange);
  color: white;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.4s ease;
  margin-top: 1rem;
}

.retry-button:hover {
  background: #e6691f;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 123, 37, 0.3);
}

/* ===== СЕТКА КАРТОЧЕК ===== */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* ===== КАРТОЧКИ СОБЫТИЙ ===== */
.event-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  backdrop-filter: blur(10px);
  transform: translateY(0) scale(1);
}

.event-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.2);
}

.event-card.upcoming {
  border-left: 4px solid var(--accent-green);
}

.event-card.completed {
  border-left: 4px solid var(--accent-orange);
}

.event-card.upcoming:hover {
  box-shadow: 0 12px 25px rgba(76, 175, 80, 0.2);
}

.event-card.completed:hover {
  box-shadow: 0 12px 25px rgba(255, 123, 37, 0.2);
}

/* ===== КАРТОЧКИ БЕЗ ОБЗОРА (СЕРЫЕ) ===== */
.event-card.no-review {
  background: rgba(100, 100, 100, 0.15);
  border-left-color: rgba(150, 150, 150, 0.5);
  opacity: 0.75;
}

.event-card.no-review .card-image {
  filter: grayscale(0.6);
}

.event-card.no-review:hover {
  opacity: 0.9;
  box-shadow: 0 12px 25px rgba(100, 100, 100, 0.2);
}

.event-card.no-review .event-name,
.event-card.no-review .event-description,
.event-card.no-review .meta-item {
  color: rgba(200, 200, 200, 0.8);
}

.event-card.no-review .status-badge {
  background: rgba(150, 150, 150, 0.7);
}

/* ===== ИЗОБРАЖЕНИЯ ===== */
.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
  border-radius: 1rem 1rem 0 0;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
  transform-origin: center;
}

.event-card:hover .card-image img {
  transform: scale(1.02);
}

.card-image.blurred img {
  filter: blur(4px);
}

/* ===== ДАТА В УГЛУ ===== */
.date-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 0.6rem;
  border-radius: 0.6rem;
  text-align: center;
  backdrop-filter: blur(15px);
  min-width: 65px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 3;
  transition: all 0.4s ease;
}

.event-card:hover .date-badge {
  transform: scale(1.05);
  background: rgba(0, 0, 0, 0.9);
}

.month {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--accent-orange);
  line-height: 1;
}

.day {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  margin: 0.1rem 0;
}

.year {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1;
}

/* ===== СТАТУС В УГЛУ (УМЕНЬШЕННЫЙ) ===== */
.status-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.4rem 0.7rem;
  border-radius: 1.5rem;
  font-size: 0.7rem;
  font-weight: 600;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 3;
  transition: all 0.4s ease;
  white-space: nowrap;
}

.event-card:hover .status-badge {
  transform: scale(1.05);
}

.status-badge.upcoming {
  background: rgba(76, 175, 80, 0.9);
  color: white;
}

.status-badge.completed {
  background: rgba(255, 123, 37, 0.9);
  color: white;
}

/* ===== КОНТЕНТ КАРТОЧКИ ===== */
.card-content {
  padding: 1rem;
  position: relative;
}

.blurred-content {
  filter: blur(2px);
}

.event-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 0.75rem;
  line-height: 1.3;
}

.event-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.meta-item i {
  width: 16px;
  text-align: center;
  font-size: 0.9rem;
}

.meta-item:first-child i {
  color: #e74c3c;
}

.meta-item:last-child i {
  color: #3498db;
}

.event-description {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

/* Особенности мероприятия */
.event-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.feature-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 20px;
  font-size: 0.8rem;
  color: #a78bfa;
  white-space: nowrap;
  transition: all 0.3s;
}

.feature-badge:hover {
  background: rgba(139, 92, 246, 0.25);
  border-color: rgba(139, 92, 246, 0.5);
  transform: translateY(-1px);
}

.feature-badge i {
  font-size: 0.75rem;
  color: #8b5cf6;
}

.feature-badge.more-features {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

/* ===== ОБРАТНЫЙ ОТСЧЁТ ===== */
.countdown-block {
  background: rgba(76, 175, 80, 0.1);
  padding: 0.75rem;
  border-radius: 0.6rem;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.countdown-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
  color: var(--text-light);
  font-size: 0.9rem;
  font-weight: 500;
}

.countdown-text i {
  color: var(--accent-green);
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-green), var(--accent-orange));
  border-radius: 3px;
  transition: width 0.4s ease;
}

/* ===== РЕЙТИНГ ===== */
.rating-block {
  background: rgba(255, 123, 37, 0.1);
  padding: 0.75rem;
  border-radius: 0.6rem;
  border: 1px solid rgba(255, 123, 37, 0.2);
}

.rating-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
  color: var(--text-light);
  font-size: 0.9rem;
  font-weight: 500;
}

.rating-text i {
  color: #ffc107;
}

.stars {
  display: flex;
  gap: 0.2rem;
}

.stars i {
  color: rgba(255, 255, 255, 0.2);
  font-size: 1rem;
  transition: color 0.3s ease;
}

.stars i.filled {
  color: #ffc107;
}

/* ===== БЛОК ИНФОРМАЦИИ ДЛЯ ПРОШЕДШИХ СОБЫТИЙ ===== */
.completed-info-block {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Рейтинг в блоке прошедших событий */
.completed-info-block .rating-block {
  background: rgba(255, 123, 37, 0.1);
  padding: 0.75rem;
  border-radius: 0.6rem;
  border: 1px solid rgba(255, 123, 37, 0.2);
}

/* ===== ФОТОГАЛЛЕРЕЯ ===== */
.gallery-block {
  background: rgba(139, 92, 246, 0.1);
  padding: 0.75rem;
  border-radius: 0.6rem;
  border: 1px solid rgba(139, 92, 246, 0.2);
  transition: all 0.3s ease;
}

.event-card:hover .gallery-block {
  background: rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.3);
}

/* Превью фотографий */
.gallery-previews {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.6rem;
  overflow: hidden;
}

.gallery-preview-item {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 0.4rem;
  overflow: hidden;
  border: 2px solid rgba(139, 92, 246, 0.3);
  transition: all 0.3s ease;
}

.gallery-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.event-card:hover .gallery-preview-item img {
  transform: scale(1.1);
}

.event-card:hover .gallery-preview-item {
  border-color: rgba(139, 92, 246, 0.5);
  transform: translateY(-2px);
}

.gallery-more {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 0.4rem;
  background: rgba(139, 92, 246, 0.2);
  border: 2px solid rgba(139, 92, 246, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: #8b5cf6;
  transition: all 0.3s ease;
}

.event-card:hover .gallery-more {
  background: rgba(139, 92, 246, 0.3);
  border-color: rgba(139, 92, 246, 0.5);
  transform: translateY(-2px);
}

.gallery-more-overlay {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery-more-overlay .blurred-image {
  filter: blur(4px);
  opacity: 0.5;
}

.gallery-more-count {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  z-index: 1;
  pointer-events: none;
}

.event-card:hover .gallery-more-overlay {
  border-color: rgba(139, 92, 246, 0.5);
  transform: translateY(-2px);
}

.gallery-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-light);
  font-size: 0.9rem;
  font-weight: 500;
}

.gallery-text i {
  color: #8b5cf6;
}

.gallery-hint {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: rgba(139, 92, 246, 0.8);
  font-size: 0.8rem;
  font-weight: 400;
}

.gallery-hint i {
  font-size: 0.7rem;
  transition: transform 0.3s ease;
}

.event-card:hover .gallery-hint i {
  transform: translateX(3px);
}

/* ===== КАРТОЧКА "ПОКАЗАТЬ ЕЩЁ" (ПОЛНОСТЬЮ ЗАБЛЮРЕННАЯ) ===== */
.show-more-card {
  position: relative;
}

.show-more-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  z-index: 10;
  transition: all 0.4s ease;
}

.show-more-card:hover .show-more-overlay {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
}

.overlay-content {
  text-align: center;
  padding: 2rem;
}

.overlay-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  color: white;
  margin: 0 auto 1rem;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.4s ease;
}

.show-more-card:hover .overlay-icon {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.25);
}

.overlay-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.overlay-subtitle {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1rem;
}

.overlay-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
}

.divider {
  opacity: 0.6;
}

/* ===== АДАПТИВНОСТЬ ===== */
@media (max-width: 768px) {
  .events-grid {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }
  
  .card-image {
    height: 180px;
  }
  
  .card-content {
    padding: 0.875rem;
  }
  
  .event-name {
    font-size: 1.2rem;
  }
  
  .event-meta {
    flex-direction: column;
    gap: 0.6rem;
  }
  
  .overlay-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .divider {
    display: none;
  }
  
  .status-badge {
    padding: 0.3rem 0.6rem;
    font-size: 0.65rem;
  }
}

@media (max-width: 480px) {
  .card-image {
    height: 160px;
  }
  
  .card-content {
    padding: 0.75rem;
  }
  
  .event-name {
    font-size: 1.1rem;
  }
  
  .event-description {
    font-size: 0.9rem;
  }
  
  .overlay-icon {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
  
  .overlay-title {
    font-size: 1rem;
  }
  
  .overlay-content {
    padding: 1.5rem;
  }
  
  .status-badge {
    padding: 0.25rem 0.5rem;
    font-size: 0.6rem;
  }
}
</style>