<template>
  <!-- Мероприятия -->
  <div class="section events-section" id="events">
    <h2 class="section-title">Мероприятия</h2>
    <p class="section-description">События, которые я посетил и планирую посетить.</p>
    
    <!-- Скелетон-заглушки при загрузке -->
    <div v-if="loading" class="events-grid">
      <div v-for="i in 3" :key="'skeleton-' + i" class="event-card skeleton-card">
        <div class="skeleton-image">
          <div class="skeleton-pulse"></div>
          <div class="skeleton-date-badge">
            <div class="skeleton-line short"></div>
            <div class="skeleton-line bold"></div>
            <div class="skeleton-line short"></div>
          </div>
          <div class="skeleton-status-badge skeleton-pulse"></div>
        </div>
        <div class="card-content skeleton-content">
          <div class="skeleton-line title skeleton-pulse"></div>
          <div class="skeleton-meta">
            <div class="skeleton-line meta skeleton-pulse"></div>
            <div class="skeleton-line meta-sm skeleton-pulse"></div>
          </div>
          <div class="skeleton-line desc skeleton-pulse"></div>
          <div class="skeleton-line desc-short skeleton-pulse"></div>
          <div class="skeleton-footer skeleton-pulse"></div>
        </div>
      </div>
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
    <div v-else class="events-grid" ref="eventsGrid">
      <!-- Две основные карточки -->
      <div
        v-for="(event, index) in mainEvents"
        :key="event.id"
        class="event-card card-lazy"
        :class="[getCardClass(event), { 'no-review': !hasReview(event) && !isUpcoming(event) }, { 'card-visible': visibleCards.has('main-' + index) }]"
        :data-card-id="'main-' + index"
        @click="openEvent(event)"
      >
        <!-- Изображение -->
        <div class="card-image">
          <img
            :src="getImageUrl(event)"
            :alt="event.name"
            loading="lazy"
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

          <!-- Бейджи статусов участия (для всех событий, поддержка мультивыбора) -->
          <div v-if="event.attendance_status" class="attendance-badges-container">
            <div
              v-for="status in parseAttendanceStatuses(event.attendance_status)"
              :key="status"
              class="attendance-badge"
              :class="'status-' + status"
            >
              <i :class="getAttendanceIcon(status)"></i>
              <span>{{ getAttendanceLabel(status) }}</span>
            </div>
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
                <i :class="hasReview(event) ? 'fas fa-arrow-right' : 'fas fa-lock'"></i>
                <span>{{ hasReview(event) ? 'Смотреть обзор' : 'Обзор ещё не написан' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Карточка "Показать ещё" -->
      <div
        class="event-card show-more-card card-lazy"
        :class="{ 'card-visible': visibleCards.has('more') }"
        data-card-id="more"
        @click="showAllEvents"
      >
        <!-- Заблюренное изображение -->
        <div class="card-image blurred">
          <img
            :src="getImageUrl(thirdEvent)"
            :alt="thirdEvent.name"
            loading="lazy"
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
import { getAdminSession } from '@/utils/adminAuth.js'
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
      },
      isAdminMode: false,
      visibleCards: new Set(),
      _cardsObserver: null
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
    this.checkAdminMode()
    await this.loadData()
  },

  beforeUnmount() {
    if (this._cardsObserver) {
      this._cardsObserver.disconnect()
    }
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

          // Отладка: проверяем attendance_status
          console.log('🔍 Проверка attendance_status у событий на главной:')
          this.events.forEach(event => {
            console.log(`  - ${event.name}: attendance_status="${event.attendance_status}", предстоящее=${new Date(event.event_date) > new Date()}`)
          })

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
        this.$nextTick(() => this.setupCardAnimations())
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

    checkAdminMode() {
      getAdminSession().then(isAdmin => {
        this.isAdminMode = isAdmin
      }).catch(() => {
        this.isAdminMode = false
      })
    },

    // =================== УТИЛИТЫ ===================
    isUpcoming(event) {
      return new Date(event.event_date) > new Date()
    },

    // Проверка наличия обзора (хотя бы один рейтинг или my_rating)
    hasReview(event) {
      if (!event) return false

      // Предстоящие события не блокируются (у них ещё нет обзора)
      if (this.isUpcoming(event)) {
        return true
      }

      // Если поле review_completed явно установлено, используем его значение
      if (event.review_completed !== undefined && event.review_completed !== null) {
        // true = обзор завершён, false = обзор НЕ завершён
        return event.review_completed === true
      }

      // Fallback: если поле не установлено, проверяем наличие рейтингов/отзывов
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
      const hasReviewText = event.review || event.review_text || event.my_review

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
      // Приоритет: logo_url (аватарка) -> avatar_url -> image_url
      // Баннеры (banner_url, meta_image) используются только в детальной странице
      const urls = [event.logo_url, event.avatar_url, event.image_url]

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
      // Блокируем переход для прошедших событий без обзора (кроме админа)
      if (!this.isAdminMode && !this.hasReview(event) && !this.isUpcoming(event)) {
        return
      }

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
    },

    // =================== СТАТУСЫ УЧАСТИЯ ===================
    // Парсинг статусов участия (поддержка нового формата status + roles)
    parseAttendanceStatuses(status) {
      if (!status) return []

      // Если это строка
      if (typeof status === 'string') {
        try {
          const parsed = JSON.parse(status)

          // Новый формат: объект с полями status и roles
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            const result = []
            if (parsed.status) result.push(parsed.status)
            if (parsed.roles && Array.isArray(parsed.roles)) {
              result.push(...parsed.roles)
            }
            return result
          }
          // Старый формат: массив статусов
          else if (Array.isArray(parsed)) {
            return parsed
          }
          // Простая строка в JSON
          else {
            return [parsed]
          }
        } catch {
          // Если не JSON, то обычная строка
          return [status]
        }
      }
      // Если это массив (не должно быть, но для совместимости)
      else if (Array.isArray(status)) {
        return status
      }

      return []
    },

    // =================== ЛЕНИВАЯ ЗАГРУЗКА КАРТОЧЕК ===================
    setupCardAnimations() {
      // Сбрасываем старый observer и видимые карточки
      if (this._cardsObserver) {
        this._cardsObserver.disconnect()
        this._cardsObserver = null
      }
      this.visibleCards = new Set()

      if (typeof IntersectionObserver === 'undefined') {
        // Fallback: показываем все сразу
        this.visibleCards = new Set(['main-0', 'main-1', 'more'])
        return
      }

      const options = {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.08
      }

      this._cardsObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.dataset.cardId
            if (id) {
              this.visibleCards = new Set([...this.visibleCards, id])
              this._cardsObserver.unobserve(entry.target)
            }
          }
        })
      }, options)

      const grid = this.$refs.eventsGrid
      if (!grid) return

      const cards = grid.querySelectorAll('.card-lazy')
      cards.forEach((card) => this._cardsObserver.observe(card))
    },

    // Получение иконки для статуса участия
    getAttendanceIcon(status) {
      const icons = {
        'planning': 'fas fa-clock',
        'registered': 'fas fa-check-circle',
        'ticket_purchased': 'fas fa-ticket-alt',
        'vip': 'fas fa-crown',
        'sponsor': 'fas fa-hand-holding-usd',
        'volunteer': 'fas fa-hands-helping',
        'attended': 'fas fa-star',
        'missed': 'fas fa-times-circle',
        'cancelled': 'fas fa-ban'
      }
      return icons[status] || 'fas fa-question'
    },

    // Получение названия для статуса участия
    getAttendanceLabel(status) {
      const labels = {
        'planning': 'Планирую',
        'registered': 'Зарегистрирован',
        'ticket_purchased': 'Билет куплен',
        'vip': 'VIP',
        'sponsor': 'Спонсор',
        'volunteer': 'Волонтёр',
        'attended': 'Посетил',
        'missed': 'Пропустил',
        'cancelled': 'Отменено'
      }
      return labels[status] || status
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

/* ===== СОСТОЯНИЯ ЗАГРУЗКИ (СКЕЛЕТОН) ===== */
.error-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

/* Скелетон-пульсация */
@keyframes skeleton-shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}

.skeleton-pulse {
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.04) 25%,
    rgba(255,255,255,0.10) 50%,
    rgba(255,255,255,0.04) 75%
  );
  background-size: 800px 100%;
  animation: skeleton-shimmer 1.6s infinite linear;
  border-radius: 6px;
}

/* Скелетон-карточка */
.skeleton-card {
  pointer-events: none;
  cursor: default;
  animation: skeleton-card-in 0.5s ease both;
}

.skeleton-card:nth-child(1) { animation-delay: 0s; }
.skeleton-card:nth-child(2) { animation-delay: 0.1s; }
.skeleton-card:nth-child(3) { animation-delay: 0.2s; }

@keyframes skeleton-card-in {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.skeleton-image {
  position: relative;
  height: 200px;
  overflow: hidden;
  border-radius: 1rem 1rem 0 0;
  background: rgba(255,255,255,0.06);
}

.skeleton-image .skeleton-pulse {
  width: 100%;
  height: 100%;
  border-radius: 0;
}

.skeleton-date-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(0,0,0,0.5);
  padding: 0.6rem;
  border-radius: 0.6rem;
  min-width: 65px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.skeleton-status-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 80px;
  height: 26px;
  border-radius: 1.5rem;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.skeleton-meta {
  display: flex;
  gap: 0.75rem;
}

.skeleton-line {
  height: 12px;
  border-radius: 6px;
}
.skeleton-line.short  { width: 40px; height: 10px; }
.skeleton-line.bold   { width: 30px; height: 20px; }
.skeleton-line.title  { width: 70%; height: 18px; }
.skeleton-line.meta   { width: 90px; }
.skeleton-line.meta-sm { width: 60px; }
.skeleton-line.desc   { width: 100%; height: 12px; }
.skeleton-line.desc-short { width: 65%; height: 12px; }

.skeleton-footer {
  margin-top: 0.4rem;
  height: 38px;
  border-radius: 8px;
  width: 100%;
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

/* ===== ЛЕНИВАЯ ЗАГРУЗКА КАРТОЧЕК ===== */
@keyframes card-enter {
  0%   { opacity: 0; transform: translateY(40px) scale(0.97); }
  60%  { opacity: 1; transform: translateY(-6px) scale(1.005); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

.card-lazy {
  opacity: 0;
  transform: translateY(40px) scale(0.97);
  transition: opacity 0s, transform 0s;
}

.card-lazy.card-visible {
  animation: card-enter 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Stagger по data-card-id */
.card-lazy[data-card-id="main-0"].card-visible { animation-delay: 0s; }
.card-lazy[data-card-id="main-1"].card-visible { animation-delay: 0.12s; }
.card-lazy[data-card-id="more"].card-visible   { animation-delay: 0.24s; }

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
  will-change: transform, box-shadow;
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
  border: 2px solid rgba(128, 128, 128, 0.6);
  cursor: not-allowed;
  position: relative;
}

.event-card.no-review:hover {
  transform: none;
  box-shadow: 0 4px 12px rgba(128, 128, 128, 0.3);
  border-color: rgba(128, 128, 128, 0.8);
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
  will-change: transform;
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
  will-change: transform;
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

/* ===== БЕЙДЖИ СТАТУСОВ УЧАСТИЯ ===== */
.attendance-badges-container {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  max-width: calc(100% - 2rem);
  z-index: 3;
}

.attendance-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  white-space: nowrap;
}

.attendance-badge.status-planning {
  background: linear-gradient(135deg, #607d8b, #546e7a);
}

.attendance-badge.status-registered {
  background: linear-gradient(135deg, #4caf50, #45a049);
}

.attendance-badge.status-ticket_purchased {
  background: linear-gradient(135deg, #2196f3, #1976d2);
}

.attendance-badge.status-vip {
  background: linear-gradient(135deg, #ffd700, #ffb300);
  color: #333;
}

.attendance-badge.status-sponsor {
  background: linear-gradient(135deg, #9c27b0, #7b1fa2);
}

.attendance-badge.status-volunteer {
  background: linear-gradient(135deg, #ff9800, #f57c00);
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

/* Широкие экраны (1400px+) */
@media (min-width: 1400px) {
  .events-grid {
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
    gap: 2.5rem;
  }

  .event-card {
    border-radius: 1.5rem;
  }

  .card-image {
    height: 220px;
  }

  .card-content {
    padding: 1.25rem;
  }
}

/* Хорошие экраны (1024px - 1399px) */
@media (max-width: 1399px) and (min-width: 1024px) {
  .events-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
  }

  .card-image {
    height: 200px;
  }

  .card-content {
    padding: 1.1rem;
  }

  .event-name {
    font-size: 1.25rem;
  }

  .event-meta {
    gap: 0.8rem;
  }
}

/* Планшеты горизонтальные (769px - 1023px) */
@media (max-width: 1023px) and (min-width: 769px) {
  .events-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
  }

  .event-card {
    border-radius: 1.25rem;
  }

  .card-image {
    height: 190px;
  }

  .card-content {
    padding: 1rem;
  }

  .event-name {
    font-size: 1.2rem;
    margin-bottom: 0.6rem;
  }

  .event-description {
    font-size: 0.9rem;
  }

  .meta-item {
    font-size: 0.85rem;
  }

  .event-features {
    gap: 0.4rem;
  }

  .feature-badge {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }

  .countdown-block {
    padding: 0.65rem 1rem;
  }

  .countdown-value {
    font-size: 1.3rem;
  }

  .gallery-preview-item {
    width: 44px;
    height: 44px;
  }

  .gallery-previews {
    gap: 0.3rem;
  }
}

/* Планшеты и большие мобильные (481px - 768px) */
@media (max-width: 768px) {
  .section-title {
    font-size: 1.8rem;
  }

  .section-description {
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
  }

  .events-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.2rem;
  }

  .event-card {
    border-radius: 1rem;
    border-radius: 1rem;
  }

  .event-card:hover {
    transform: translateY(-6px);
  }

  .card-image {
    height: 170px;
  }

  .date-badge {
    top: 0.75rem;
    left: 0.75rem;
    min-width: 55px;
    padding: 0.5rem;
    font-size: 0.85rem;
  }

  .month {
    font-size: 0.65rem;
  }

  .day {
    font-size: 1.4rem;
  }

  .year {
    font-size: 0.65rem;
  }

  .status-badge {
    top: 0.75rem;
    right: 0.75rem;
    padding: 0.3rem 0.6rem;
    font-size: 0.65rem;
  }

  .attendance-badges-container {
    bottom: 0.75rem;
    left: 0.75rem;
    gap: 0.35rem;
  }

  .attendance-badge {
    padding: 0.35rem 0.7rem;
    font-size: 0.65rem;
    gap: 0.3rem;
  }

  .card-content {
    padding: 0.9rem;
  }

  .event-name {
    font-size: 1.15rem;
    margin-bottom: 0.5rem;
  }

  .event-meta {
    gap: 0.7rem;
    margin-bottom: 0.6rem;
  }

  .meta-item {
    font-size: 0.8rem;
  }

  .meta-item i {
    font-size: 0.8rem;
  }

  .event-description {
    font-size: 0.85rem;
    line-height: 1.4;
  }

  .event-features {
    gap: 0.35rem;
    margin-bottom: 0.75rem;
  }

  .feature-badge {
    padding: 0.25rem 0.55rem;
    font-size: 0.7rem;
    gap: 0.3rem;
  }

  .feature-badge i {
    font-size: 0.65rem;
  }

  .countdown-block {
    padding: 0.65rem 0.9rem;
    border-radius: 0.5rem;
  }

  .countdown-text {
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
  }

  .countdown-value {
    font-size: 1.25rem;
  }

  .progress-bar {
    height: 5px;
  }

  .gallery-block {
    padding: 0.65rem;
    border-radius: 0.5rem;
  }

  .gallery-previews {
    gap: 0.3rem;
    margin-bottom: 0.5rem;
  }

  .gallery-preview-item {
    width: 42px;
    height: 42px;
    border-radius: 0.3rem;
  }

  .gallery-text {
    font-size: 0.8rem;
    gap: 0.3rem;
  }

  .gallery-text i {
    font-size: 0.85rem;
  }

  .gallery-hint {
    font-size: 0.75rem;
  }

  .show-more-overlay {
    border-radius: 1rem;
  }

  .overlay-content {
    padding: 1.5rem;
  }

  .overlay-icon {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .overlay-title {
    font-size: 1.1rem;
  }

  .overlay-subtitle {
    font-size: 0.85rem;
  }

  .overlay-stats {
    font-size: 0.75rem;
  }

  .error-state {
    padding: 2rem 1rem;
  }

  .retry-button {
    padding: 0.65rem 1.25rem;
    font-size: 0.85rem;
  }

  .skeleton-image {
    height: 160px;
  }

  .skeleton-date-badge {
    width: 50px;
  }

  .skeleton-line.title {
    width: 60%;
  }

  .skeleton-footer {
    height: 35px;
  }
}

/* Мобильные (до 480px) */
@media (max-width: 480px) {
  .section-title {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .section-description {
    font-size: 0.85rem;
    margin-bottom: 1.25rem;
  }

  .events-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .event-card {
    border-radius: 0.9rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .event-card:hover {
    transform: translateY(-4px);
  }

  .event-card.upcoming {
    border-left: 3px solid var(--accent-green);
  }

  .event-card.completed {
    border-left: 3px solid var(--accent-orange);
  }

  .card-image {
    height: 150px;
  }

  .date-badge {
    top: 0.6rem;
    left: 0.6rem;
    min-width: 50px;
    padding: 0.4rem;
    border-radius: 0.5rem;
  }

  .month {
    font-size: 0.6rem;
    letter-spacing: 0.3px;
  }

  .day {
    font-size: 1.2rem;
    margin: 0.15rem 0;
  }

  .year {
    font-size: 0.6rem;
  }

  .status-badge {
    top: 0.6rem;
    right: 0.6rem;
    padding: 0.25rem 0.55rem;
    font-size: 0.6rem;
    border-radius: 1.2rem;
  }

  .attendance-badges-container {
    bottom: 0.6rem;
    left: 0.6rem;
    gap: 0.3rem;
  }

  .attendance-badge {
    padding: 0.3rem 0.6rem;
    font-size: 0.6rem;
    gap: 0.25rem;
    border-radius: 6px;
  }

  .attendance-badge i {
    font-size: 0.65rem;
  }

  .card-content {
    padding: 0.8rem;
  }

  .event-name {
    font-size: 1.05rem;
    margin-bottom: 0.4rem;
    line-height: 1.2;
  }

  .event-meta {
    gap: 0.6rem;
    margin-bottom: 0.5rem;
  }

  .meta-item {
    font-size: 0.75rem;
  }

  .meta-item i {
    width: 14px;
    font-size: 0.75rem;
  }

  .event-description {
    font-size: 0.8rem;
    line-height: 1.35;
    margin-bottom: 0.75rem;
  }

  .event-features {
    gap: 0.3rem;
    margin-bottom: 0.65rem;
  }

  .feature-badge {
    padding: 0.2rem 0.5rem;
    font-size: 0.65rem;
    border-radius: 15px;
    gap: 0.25rem;
  }

  .feature-badge i {
    font-size: 0.6rem;
  }

  .feature-badge.more-features {
    font-size: 0.65rem;
    font-weight: 700;
  }

  .countdown-block {
    background: rgba(76, 175, 80, 0.08);
    border: 1px solid rgba(76, 175, 80, 0.15);
    padding: 0.6rem 0.8rem;
    border-radius: 0.45rem;
  }

  .countdown-text {
    font-size: 0.8rem;
    margin-bottom: 0.4rem;
  }

  .countdown-text i {
    font-size: 0.8rem;
  }

  .countdown-value {
    font-size: 1.1rem;
    font-weight: 700;
  }

  .progress-bar {
    height: 4px;
    border-radius: 2px;
  }

  .completed-info-block {
    gap: 0.6rem;
  }

  .rating-block {
    background: rgba(255, 123, 37, 0.08);
    border: 1px solid rgba(255, 123, 37, 0.15);
    padding: 0.6rem 0.8rem;
    border-radius: 0.45rem;
  }

  .gallery-block {
    background: rgba(139, 92, 246, 0.08);
    border: 1px solid rgba(139, 92, 246, 0.15);
    padding: 0.6rem 0.8rem;
    border-radius: 0.45rem;
  }

  .gallery-previews {
    gap: 0.25rem;
    margin-bottom: 0.4rem;
  }

  .gallery-preview-item {
    width: 36px;
    height: 36px;
    border-radius: 0.28rem;
    border: 1.5px solid rgba(139, 92, 246, 0.25);
  }

  .gallery-text {
    font-size: 0.75rem;
    gap: 0.25rem;
  }

  .gallery-text i {
    font-size: 0.8rem;
  }

  .gallery-hint {
    font-size: 0.7rem;
    margin-top: 0.3rem;
  }

  .gallery-hint i {
    font-size: 0.65rem;
  }

  .show-more-card {
    border-radius: 0.9rem;
  }

  .show-more-overlay {
    border-radius: 0.9rem;
    background: rgba(0, 0, 0, 0.75);
  }

  .overlay-icon {
    width: 35px;
    height: 35px;
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }

  .overlay-title {
    font-size: 1rem;
    margin-bottom: 0.4rem;
  }

  .overlay-subtitle {
    font-size: 0.8rem;
    margin-bottom: 0.8rem;
  }

  .overlay-content {
    padding: 1.25rem 1rem;
  }

  .overlay-stats {
    font-size: 0.7rem;
    gap: 0.6rem;
  }

  .divider {
    display: inline;
  }

  .error-state {
    padding: 1.5rem 0.75rem;
    gap: 1rem;
  }

  .error-state i {
    font-size: 2.5rem;
  }

  .error-state p {
    font-size: 0.85rem;
  }

  .retry-button {
    padding: 0.6rem 1.2rem;
    font-size: 0.8rem;
    margin-top: 0.75rem;
  }

  .retry-button i {
    font-size: 0.8rem;
  }

  /* Скелеты для мобильных */
  .skeleton-card {
    animation: skeleton-card-in 0.4s ease both;
  }

  .skeleton-image {
    height: 140px;
  }

  .skeleton-date-badge {
    width: 45px;
    gap: 3px;
  }

  .skeleton-status-badge {
    width: 70px;
    height: 24px;
  }

  .skeleton-line.title {
    width: 55%;
    height: 16px;
  }

  .skeleton-line.meta {
    width: 80px;
    height: 10px;
  }

  .skeleton-line.meta-sm {
    width: 50px;
  }

  .skeleton-footer {
    height: 32px;
  }

  .skeleton-content {
    gap: 0.5rem;
  }
}

/* Очень маленькие экраны (до 360px) */
@media (max-width: 360px) {
  .section-title {
    font-size: 1.4rem;
  }

  .section-description {
    font-size: 0.8rem;
  }

  .events-grid {
    gap: 0.75rem;
  }

  .card-image {
    height: 130px;
  }

  .date-badge {
    min-width: 45px;
  }

  .card-content {
    padding: 0.7rem;
  }

  .event-name {
    font-size: 1rem;
    margin-bottom: 0.35rem;
  }

  .event-description {
    font-size: 0.75rem;
    margin-bottom: 0.65rem;
  }

  .event-meta {
    gap: 0.5rem;
    margin-bottom: 0.4rem;
  }

  .meta-item {
    font-size: 0.7rem;
  }

  .feature-badge {
    padding: 0.18rem 0.45rem;
    font-size: 0.6rem;
  }

  .gallery-preview-item {
    width: 32px;
    height: 32px;
  }

  .countdown-block {
    padding: 0.5rem 0.7rem;
  }

  .countdown-value {
    font-size: 1rem;
  }
}
</style>