<template>
  <!-- Мероприятия -->
  <div class="section events-section" id="events">
    <h2 class="section-title">Мероприятия</h2>
    <p class="section-description">События, которые я посетил и планирую посетить.</p>

    <!-- Скелетон: повторяет структуру карточки, чтобы ничего не прыгало после загрузки -->
    <div v-if="loading" class="events-grid" aria-busy="true" aria-live="polite">
      <div v-for="i in 3" :key="'skeleton-' + i" class="ev-card ev-skel" :style="{ '--i': i - 1 }">
        <div class="ev-media">
          <div class="ev-shimmer"></div>
          <div class="ev-skel-chip ev-shimmer"></div>
          <div class="ev-skel-pill ev-shimmer"></div>
        </div>
        <div class="ev-body">
          <div class="ev-skel-line title ev-shimmer"></div>
          <div class="ev-skel-line meta ev-shimmer"></div>
          <div class="ev-skel-line ev-shimmer"></div>
          <div class="ev-skel-line short ev-shimmer"></div>
          <div class="ev-skel-foot ev-shimmer"></div>
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
      <article
        v-for="(event, index) in mainEvents"
        :key="event.id"
        class="ev-card card-lazy"
        :class="[getCardClass(event), { 'is-locked': !hasReview(event) && !isUpcoming(event), 'card-visible': visibleCards.has('main-' + index) }]"
        :style="{ '--i': index }"
        :data-card-id="'main-' + index"
        :tabindex="!hasReview(event) && !isUpcoming(event) && !isAdminMode ? -1 : 0"
        @click="openEvent(event)"
        @keydown.enter.self="openEvent(event)"
      >
        <!-- Обложка -->
        <div class="ev-media">
          <div class="ev-shimmer"></div>
          <img
            :src="getImageUrl(event)"
            :alt="event.name"
            :class="{ loaded: imgLoaded[event.id] }"
            :data-eid="event.id"
            loading="lazy"
            decoding="async"
            @load="onImageLoad(event.id)"
            @error="onImageError($event, event.id)"
          >
          <div class="ev-shade"></div>

          <div class="ev-date">
            <b>{{ getDay(event.event_date) }}</b>
            <span>{{ getMonth(event.event_date) }}</span>
            <small>{{ getYear(event.event_date) }}</small>
          </div>

          <div class="ev-status" :class="getStatusClass(event)">
            <span class="ev-dot"></span>{{ getStatusText(event) }}
          </div>

          <div v-if="event.attendance_status" class="ev-badges">
            <span
              v-for="status in parseAttendanceStatuses(event.attendance_status).slice(0, 2)"
              :key="status"
              class="ev-badge"
              :class="'status-' + status"
            >
              <i :class="getAttendanceIcon(status)"></i>{{ getAttendanceLabel(status) }}
            </span>
          </div>
        </div>

        <!-- Контент -->
        <div class="ev-body">
          <h3 class="ev-title">{{ event.name }}</h3>

          <div class="ev-meta">
            <span class="ev-chip"><i class="fas fa-map-marker-alt"></i>{{ getLocation(event) }}</span>
            <span v-if="event.attendees_count" class="ev-chip"><i class="fas fa-users"></i>{{ event.attendees_count }}+</span>
          </div>

          <p class="ev-desc">{{ getDescription(event) }}</p>

          <div v-if="event.con_features && event.con_features.length > 0" class="ev-tags">
            <span
              v-for="feature in event.con_features.slice(0, 2)"
              :key="feature.id"
              class="ev-tag"
              :title="feature.title"
            >{{ feature.title }}</span>
            <span v-if="event.con_features.length > 2" class="ev-tag is-more">+{{ event.con_features.length - 2 }}</span>
          </div>

          <!-- Низ карточки -->
          <div class="ev-foot">
            <template v-if="isUpcoming(event)">
              <div class="ev-count">
                <span class="ev-count-text">
                  <i class="fas fa-clock"></i>через <b>{{ getTimeLeft(event.event_date) }}</b>
                </span>
                <span class="ev-bar"><span class="ev-bar-fill" :style="{ width: getProgress(event.event_date) + '%' }"></span></span>
              </div>
            </template>

            <template v-else>
              <div class="ev-done">
                <span v-if="getOverallRating(event) > 0" class="ev-rating">
                  <StarRating :rating="getOverallRating(event)" size="small" :show-value="false" />
                </span>

                <span v-if="event.photoPreviews && event.photoPreviews.length > 0" class="ev-stack">
                  <span
                    v-for="photo in event.photoPreviews.slice(0, 3)"
                    :key="photo.id"
                    class="ev-thumb"
                  ><img :src="photo.thumbnail_url || photo.image_url" :alt="photo.caption || 'Фото'" loading="lazy" decoding="async"></span>
                  <span v-if="event.photos_count > 3" class="ev-thumb is-more">+{{ event.photos_count - 3 }}</span>
                </span>
                <span v-else-if="event.photos_count" class="ev-photos">
                  <i class="fas fa-images"></i>{{ event.photos_count }} {{ pluralizePhotos(event.photos_count) }}
                </span>

                <span v-if="!hasReview(event)" class="ev-note">Обзор ещё не написан</span>
              </div>
            </template>

            <span v-if="!hasReview(event) && !isUpcoming(event)" class="ev-go is-locked"><i class="fas fa-lock"></i></span>
            <span v-else class="ev-go"><i class="fas fa-arrow-right"></i></span>
          </div>
        </div>
      </article>

      <!-- Карточка «Показать ещё» -->
      <article
        v-if="thirdEvent"
        class="ev-card ev-more card-lazy"
        :class="{ 'card-visible': visibleCards.has('more') }"
        :style="{ '--i': mainEvents.length }"
        data-card-id="more"
        tabindex="0"
        @click="showAllEvents"
        @keydown.enter.self="showAllEvents"
      >
        <div class="ev-media">
          <div class="ev-shimmer"></div>
          <img
            :src="getImageUrl(thirdEvent)"
            alt=""
            :class="{ loaded: imgLoaded[thirdEvent.id] }"
            :data-eid="thirdEvent.id"
            loading="lazy"
            decoding="async"
            @load="onImageLoad(thirdEvent.id)"
            @error="onImageError($event, thirdEvent.id)"
          >
          <div class="ev-shade"></div>
        </div>

        <div class="ev-body ev-body-ghost" aria-hidden="true">
          <h3 class="ev-title">{{ thirdEvent.name }}</h3>
          <div class="ev-meta">
            <span class="ev-chip"><i class="fas fa-map-marker-alt"></i>{{ getLocation(thirdEvent) }}</span>
          </div>
          <p class="ev-desc">{{ getDescription(thirdEvent) }}</p>
        </div>

        <div class="ev-more-cta">
          <span class="ev-more-icon"><i class="fas fa-calendar-week"></i></span>
          <h4>Показать ещё</h4>
          <p>{{ stats.total }}+ мероприятий</p>
          <div class="ev-more-stats">
            <span>{{ stats.completed }} посещено</span>
            <span class="ev-sep"></span>
            <span>{{ stats.upcoming }} планируется</span>
          </div>
        </div>
      </article>
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
      imgLoaded: {},
      _cardsObserver: null
    }
  },
  
  computed: {
    // Первые 2 события для основных карточек
    mainEvents() {
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
      const usedIds = this.mainEvents.map(e => e.id)
      return this.events.find(e => !usedIds.includes(e.id)) || null
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
        
        if (this.events.length === 0) {
          this.error = eventsData.status === 'rejected'
            ? 'Не удалось загрузить мероприятия'
            : 'Мероприятия пока не добавлены'
        }
        
      } catch (error) {
        console.error('❌ Ошибка загрузки:', error)
        this.error = 'Не удалось загрузить мероприятия'
        
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
    
    onImageLoad(id) {
      if (!this.imgLoaded[id]) {
        this.imgLoaded = { ...this.imgLoaded, [id]: true }
      }
    },

    onImageError(event, id) {
      // Один раз подменяем битую картинку заглушкой; её load снимет шиммер
      if (event.target.dataset.failed) {
        this.onImageLoad(id)
        return
      }
      event.target.dataset.failed = '1'
      event.target.src ="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250'%3E%3Crect width='400' height='250' fill='%232a2a2a'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='24' fill='%23ff7b25'%3EEvent%3C/text%3E%3C/svg%3E"
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

      // Картинки из кэша могут догрузиться до подписки на load
      grid.querySelectorAll('img[data-eid]').forEach((img) => {
        if (img.complete && img.naturalWidth > 0) this.onImageLoad(img.dataset.eid)
      })

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

.error-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
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
  transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
  margin-top: 1rem;
}

.retry-button:hover {
  background: #e6691f;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgb(var(--accent-orange-rgb) / 0.3);
}

/* ===== СЕТКА: 3 В РЯД ===== */
.events-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.1rem;
}

/* ===== КАРТОЧКА ===== */
.ev-card {
  --ev-accent: var(--accent-orange);
  --ev-accent-rgb: var(--accent-orange-rgb);
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  cursor: pointer;
  border-radius: 1.1rem;
  border: 1px solid rgb(var(--white-rgb) / 0.1);
  background:
    radial-gradient(120% 60% at 0% 0%, rgb(var(--ev-accent-rgb) / 0.12), transparent 60%),
    linear-gradient(180deg, rgb(var(--white-rgb) / 0.07), rgb(var(--white-rgb) / 0.03));
  box-shadow: 0 6px 18px rgb(0 0 0 / 0.18);
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease, border-color 0.35s ease;
}

.ev-card.upcoming {
  --ev-accent: var(--accent-green);
  --ev-accent-rgb: var(--accent-green-rgb);
}

.ev-card:hover,
.ev-card:focus-visible {
  transform: translateY(-4px);
  border-color: rgb(var(--ev-accent-rgb) / 0.45);
  box-shadow: 0 16px 34px rgb(0 0 0 / 0.28), 0 0 0 1px rgb(var(--ev-accent-rgb) / 0.15), 0 10px 40px -12px rgb(var(--ev-accent-rgb) / 0.45);
  outline: none;
}

.ev-card.is-locked {
  --ev-accent: #8d8d93;
  --ev-accent-rgb: 141 141 147;
  cursor: not-allowed;
}

.ev-card.is-locked:hover {
  transform: none;
  box-shadow: 0 6px 18px rgb(0 0 0 / 0.18);
  border-color: rgb(var(--white-rgb) / 0.1);
}

.ev-card.is-locked .ev-media img {
  filter: grayscale(0.85) brightness(0.85);
}

/* ===== ОБЛОЖКА ===== */
.ev-media {
  position: relative;
  height: 140px;
  flex-shrink: 0;
  overflow: hidden;
  background: rgb(var(--white-rgb) / 0.05);
}

/* Цветная линия-акцент по нижней кромке обложки */
.ev-media::after {
  content: '';
  position: absolute;
  inset: auto 0 0 0;
  height: 2px;
  background: linear-gradient(90deg, var(--ev-accent), transparent 85%);
  z-index: 3;
}

.ev-media img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transform: scale(1.08);
  filter: blur(10px);
  transition: opacity 0.6s ease, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1), filter 0.6s ease;
}

/* Плавная прогрузка: из размытия в чёткую картинку */
.ev-media img.loaded {
  opacity: 1;
  transform: scale(1);
  filter: none;
}

.ev-card:hover .ev-media img.loaded {
  transform: scale(1.06);
}

.ev-card.is-locked .ev-media img.loaded {
  filter: grayscale(0.85) brightness(0.85);
}

.ev-shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgb(0 0 0 / 0.35) 0%, transparent 38%, rgb(10 10 14 / 0.78) 100%);
  z-index: 1;
  pointer-events: none;
}

/* Дата */
.ev-date {
  position: absolute;
  top: 0.6rem;
  left: 0.6rem;
  z-index: 2;
  display: grid;
  justify-items: center;
  min-width: 2.6rem;
  padding: 0.3rem 0.45rem;
  border-radius: 0.65rem;
  color: white;
  line-height: 1;
  background: rgb(14 14 18 / 0.6);
  border: 1px solid rgb(var(--white-rgb) / 0.18);
  backdrop-filter: blur(12px);
}

.ev-date b {
  font-size: 1.15rem;
  font-weight: 800;
}

.ev-date span {
  margin-top: 0.12rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--ev-accent);
}

.ev-date small {
  margin-top: 0.1rem;
  font-size: 0.65rem;
  color: rgb(var(--white-rgb) / 0.7);
}

/* Статус */
.ev-status {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.22rem 0.6rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  white-space: nowrap;
  color: white;
  background: rgb(14 14 18 / 0.6);
  border: 1px solid rgb(var(--ev-accent-rgb) / 0.55);
  backdrop-filter: blur(12px);
}

.ev-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ev-accent);
  box-shadow: 0 0 8px var(--ev-accent);
}

.ev-status.upcoming .ev-dot {
  animation: ev-pulse 1.8s ease-in-out infinite;
}

@keyframes ev-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%      { transform: scale(1.7); opacity: 0.45; }
}

/* Статусы участия */
.ev-badges {
  position: absolute;
  left: 0.6rem;
  right: 0.6rem;
  bottom: 0.55rem;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.ev-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  background: rgb(14 14 18 / 0.62);
  border: 1px solid rgb(var(--white-rgb) / 0.16);
  backdrop-filter: blur(10px);
}

.ev-badge i { font-size: 0.68rem; color: var(--accent-gold, #ffc107); }
.ev-badge.status-vip i,
.ev-badge.status-sponsor i { color: var(--accent-orange); }
.ev-badge.status-registered i,
.ev-badge.status-attended i,
.ev-badge.status-ticket_purchased i { color: var(--accent-green); }

/* ===== ТЕЛО ===== */
.ev-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0.85rem 0.95rem 0.9rem;
}

.ev-title {
  margin: 0 0 0.45rem;
  font-size: 1.02rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--text-light);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ev-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.55rem;
}

.ev-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  max-width: 100%;
  padding: 0.14rem 0.55rem;
  border-radius: 999px;
  font-size: 0.78rem;
  color: var(--text-muted);
  background: rgb(var(--white-rgb) / 0.06);
  border: 1px solid rgb(var(--white-rgb) / 0.08);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ev-chip i {
  font-size: 0.66rem;
  color: var(--ev-accent);
}

.ev-desc {
  margin: 0 0 0.65rem;
  font-size: 0.8rem;
  line-height: 1.45;
  color: rgb(var(--white-rgb) / 0.78);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ev-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-bottom: 0.7rem;
}

.ev-tag {
  max-width: 8rem;
  padding: 0.1rem 0.5rem;
  border-radius: 6px;
  font-size: 0.66rem;
  color: var(--ev-accent);
  background: rgb(var(--ev-accent-rgb) / 0.12);
  border: 1px solid rgb(var(--ev-accent-rgb) / 0.25);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ev-tag.is-more {
  color: rgb(var(--white-rgb) / 0.7);
  background: rgb(var(--white-rgb) / 0.07);
  border-color: rgb(var(--white-rgb) / 0.14);
}

/* ===== НИЗ КАРТОЧКИ ===== */
.ev-foot {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: auto;
  padding-top: 0.7rem;
  border-top: 1px solid rgb(var(--white-rgb) / 0.08);
}

.ev-count {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 0.4rem;
}

.ev-count-text {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.ev-count-text i { color: var(--accent-green); font-size: 0.7rem; }
.ev-count-text b { color: var(--text-light); font-weight: 700; }

.ev-bar {
  display: block;
  height: 4px;
  border-radius: 999px;
  overflow: hidden;
  background: rgb(var(--white-rgb) / 0.1);
}

.ev-bar-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--accent-green), var(--accent-orange));
  transition: width 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}

.ev-done {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem 0.7rem;
}

.ev-rating {
  display: inline-flex;
}

.ev-stack {
  display: inline-flex;
  align-items: center;
}

.ev-thumb {
  position: relative;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  margin-left: -8px;
  border-radius: 50%;
  overflow: hidden;
  background: #2a2a30;
  border: 2px solid #1d1d22;
  transition: transform 0.3s ease, margin 0.3s ease;
}

.ev-thumb:first-child { margin-left: 0; }

.ev-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ev-thumb.is-more {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--ev-accent);
  background: rgb(var(--ev-accent-rgb) / 0.18);
}

.ev-card:hover .ev-thumb { margin-left: -4px; }
.ev-card:hover .ev-thumb:first-child { margin-left: 0; }

.ev-photos,
.ev-note {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  color: var(--text-muted);
}

.ev-photos i { color: var(--ev-accent); }
.ev-note { font-style: italic; }

/* Круглая кнопка-стрелка */
.ev-go {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 0.75rem;
  color: var(--ev-accent);
  background: rgb(var(--ev-accent-rgb) / 0.14);
  border: 1px solid rgb(var(--ev-accent-rgb) / 0.35);
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), background 0.3s ease, color 0.3s ease;
}

.ev-card:hover .ev-go:not(.is-locked) {
  transform: translateX(3px);
  color: #fff;
  background: var(--ev-accent);
}

/* ===== «ПОКАЗАТЬ ЕЩЁ» ===== */
.ev-more .ev-media img.loaded { filter: blur(3px) brightness(0.7); }
.ev-more:hover .ev-media img.loaded { transform: scale(1.1); }
.ev-body-ghost { filter: blur(2.5px); opacity: 0.55; }

.ev-more-cta {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  padding: 1rem;
  text-align: center;
  background: radial-gradient(80% 70% at 50% 50%, rgb(10 10 14 / 0.55), rgb(10 10 14 / 0.8));
  backdrop-filter: blur(6px);
  transition: background 0.35s ease;
}

.ev-more:hover .ev-more-cta {
  background: radial-gradient(80% 70% at 50% 50%, rgb(var(--ev-accent-rgb) / 0.2), rgb(10 10 14 / 0.75));
}

.ev-more-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  margin-bottom: 0.45rem;
  border-radius: 50%;
  font-size: 1.1rem;
  color: white;
  background: linear-gradient(135deg, var(--accent-orange), var(--accent-green));
  box-shadow: 0 6px 20px rgb(var(--accent-orange-rgb) / 0.35);
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.ev-more:hover .ev-more-icon { transform: scale(1.1) rotate(-6deg); }

.ev-more-cta h4 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: white;
}

.ev-more-cta p {
  margin: 0;
  font-size: 0.8rem;
  color: rgb(var(--white-rgb) / 0.85);
}

.ev-more-stats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.3rem 0.5rem;
  margin-top: 0.4rem;
  font-size: 0.78rem;
  color: rgb(var(--white-rgb) / 0.75);
}

.ev-sep {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.6;
}

/* ===== ПРОГРУЗКА: ПОЯВЛЕНИЕ КАРТОЧЕК ===== */
.card-lazy {
  opacity: 0;
  transform: translateY(28px) scale(0.97);
}

.card-lazy.card-visible {
  animation: ev-enter 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i, 0) * 110ms);
}

@keyframes ev-enter {
  from { opacity: 0; transform: translateY(28px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ===== ПРОГРУЗКА: СКЕЛЕТОН ===== */
.ev-skel {
  cursor: default;
  pointer-events: none;
  animation: ev-skel-in 0.5s ease both;
  animation-delay: calc(var(--i, 0) * 90ms);
}

@keyframes ev-skel-in {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Шиммер: блик бежит по заглушке (и по обложке, пока грузится картинка) */
.ev-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    100deg,
    rgb(var(--white-rgb) / 0.04) 20%,
    rgb(var(--white-rgb) / 0.13) 50%,
    rgb(var(--white-rgb) / 0.04) 80%
  );
  background-size: 220% 100%;
  animation: ev-shimmer 1.5s ease-in-out infinite;
}

@keyframes ev-shimmer {
  from { background-position: 120% 0; }
  to   { background-position: -120% 0; }
}

.ev-skel-chip,
.ev-skel-pill {
  position: absolute;
  inset: auto;
  top: 0.6rem;
  border-radius: 0.65rem;
}

.ev-skel-chip { left: 0.6rem; width: 2.6rem; height: 3rem; }
.ev-skel-pill { right: 0.6rem; width: 5rem; height: 1.3rem; border-radius: 999px; }

.ev-skel-line,
.ev-skel-foot {
  position: relative;
  inset: auto;
  height: 0.8rem;
  margin-bottom: 0.55rem;
  border-radius: 6px;
}

.ev-skel-line.title { width: 70%; height: 1.1rem; margin-bottom: 0.7rem; }
.ev-skel-line.meta  { width: 45%; height: 0.9rem; border-radius: 999px; }
.ev-skel-line.short { width: 60%; }

.ev-skel-foot {
  height: 1.9rem;
  margin: auto 0 0;
  border-radius: 999px;
}

/* ===== АДАПТИВНОСТЬ ===== */
@media (max-width: 900px) {
  .events-grid { gap: 0.7rem; }
  .ev-card { border-radius: 0.95rem; }
  .ev-media { height: 110px; }
  .ev-body { padding: 0.7rem 0.75rem 0.8rem; }
  .ev-title { font-size: 0.92rem; }
  .ev-desc { -webkit-line-clamp: 1; line-clamp: 1; }
  .ev-tags,
  .ev-note,
  .ev-chip:nth-child(n + 2) { display: none; }
  .ev-badge { font-size: 0.66rem; padding: 0.1rem 0.4rem; }
  .ev-status { font-size: 0.66rem; padding: 0.18rem 0.45rem; }
  .ev-thumb { width: 22px; height: 22px; }
}

/* Телефоны: одна карточка в строку */
@media (max-width: 640px) {
  .events-grid { grid-template-columns: minmax(0, 1fr); gap: 0.9rem; }
  .ev-media { height: 160px; }
  .ev-body { padding: 0.85rem 0.95rem 0.9rem; }
  .ev-title { font-size: 1.05rem; }
  .ev-desc { -webkit-line-clamp: 2; line-clamp: 2; }
  .ev-tags { display: flex; }
  .ev-note { display: inline-flex; }
  .ev-chip:nth-child(n + 2) { display: inline-flex; }
  .ev-badge { font-size: 0.7rem; padding: 0.15rem 0.5rem; }
  .ev-status { font-size: 0.7rem; padding: 0.22rem 0.6rem; }
  .ev-thumb { width: 26px; height: 26px; }
}

/* Уважаем «уменьшить анимацию» */
@media (prefers-reduced-motion: reduce) {
  .card-lazy,
  .card-lazy.card-visible { animation: none; opacity: 1; transform: none; }
  .ev-skel,
  .ev-shimmer,
  .ev-status.upcoming .ev-dot { animation: none; }
  .ev-media img { transition: opacity 0.2s ease; transform: none; filter: none; }
  .ev-card,
  .ev-card:hover { transition: none; transform: none; }
}
</style>
