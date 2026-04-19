<template>
  <div class="event-details-page">
    <!-- Загрузка -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Загружаем мероприятие...</p>
    </div>

    <!-- Ошибка -->
    <div v-else-if="error" class="error-container">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>Ошибка загрузки</h3>
      <p>{{ error }}</p>
      <router-link to="/events" class="back-btn">Вернуться к мероприятиям</router-link>
    </div>

    <!-- Блокировка доступа для событий без обзора (УБРАНА - теперь показываем страницу) -->
    <!-- <div v-else-if="event && isBlockedWithoutReview" class="blocked-container">
      <div class="blocked-content">
        <div class="blocked-icon">
          <i class="fas fa-lock"></i>
        </div>
        <h2>Обзор ещё не написан</h2>
        <p>Мероприятие "{{ event.name }}" уже прошло, но обзор пока не готов.</p>
        <p class="blocked-hint">Обзор появится в ближайшее время с фотографиями и впечатлениями!</p>
        <router-link to="/events" class="back-btn">
          <i class="fas fa-arrow-left"></i>
          Вернуться к мероприятиям
        </router-link>
      </div>
    </div> -->

    <!-- Основной контент -->
    <div v-else-if="event">
      <!-- Баннер -->
      <div class="event-hero">
        <div class="hero-overlay"></div>
        <div class="hero-image" :style="{ backgroundImage: `url(${event.meta_image || event.avatar_url})` }"></div>
        <div class="hero-content">
          <router-link to="/events" class="back-button">
            <i class="fas fa-arrow-left"></i>
            <span>Назад</span>
          </router-link>

          <div class="hero-info">
            <div class="event-badges">
              <span class="event-status" :class="getStatusClass(event)">
                <i class="fas fa-check"></i>
                {{ getStatusText() }}
              </span>
              <span v-if="event.event_type" class="event-type-badge">
                <i :class="getEventTypeIcon(event.event_type)"></i>
                {{ getEventTypeName(event.event_type) }}
              </span>
            </div>

            <h1 class="event-title">{{ event.name }}</h1>
            <p v-if="event.description" class="event-subtitle">{{ stripHtml(event.description) }}</p>

            <div class="hero-meta">
              <span class="meta-item">
                <i class="fas fa-calendar-alt"></i>
                {{ formatEventDate(event.event_date) }}
              </span>
              <span v-if="event.location" class="meta-item">
                <i class="fas fa-map-marker-alt"></i>
                {{ event.location }}
              </span>
              <span v-if="event.attendees_count" class="meta-item">
                <i class="fas fa-users"></i>
                {{ event.attendees_count }}+ участников
              </span>
            </div>

            <div v-if="hasAnyRating" class="hero-rating">
              <StarRating :rating="parseFloat(calculatedOverallRating)" size="large" :show-value="true" />
            </div>
          </div>
        </div>
      </div>

      <div class="container">
        <!-- Уведомление для событий без обзора -->
        <div v-if="isEventWithoutReview" class="no-review-alert">
          <div class="alert-icon">
            <i class="fas fa-pencil-alt"></i>
          </div>
          <div class="alert-content">
            <h4>Обзор ещё не написан</h4>
            <p>Мероприятие уже прошло, но подробный обзор с впечатлениями и фотографиями пока готовится.</p>
          </div>
        </div>

        <!-- Двухколоночная сетка -->
        <div class="content-grid">
          <!-- Левая колонка -->
          <div class="content-left">
            <!-- О мероприятии -->
            <div class="event-card">
              <h3 class="card-title">
                <i class="fas fa-info-circle"></i>
                О мероприятии
              </h3>
              <div v-if="event.description" class="card-text" v-html="event.description"></div>
              <p v-else class="card-text muted">Описание мероприятия пока не добавлено</p>
            </div>

            <!-- Фотографии -->
            <div v-if="photos.length > 0" class="event-card">
              <h3 class="card-title">
                <i class="fas fa-images"></i>
                Фотографии
                <span class="photos-count">{{ photos.length }}</span>
              </h3>
              <div class="photos-grid">
                <div
                  v-for="(photo, index) in displayedPhotos"
                  :key="photo.id"
                  class="photo-item"
                  @click="openPhotoAtIndex(index)"
                >
                  <!-- Используем миниатюры для превью -->
                  <img :src="photo.thumbnail_url || photo.image_url" :alt="photo.caption || 'Фото'" loading="lazy" />
                  <div class="photo-overlay">
                    <i class="fas fa-search-plus"></i>
                  </div>
                </div>
                <!-- Кнопка "Показать все фото" если больше 3 фото -->
                <div v-if="photos.length > 3" class="photo-item more-photos" @click="openPhotoGallery">
                  <div class="more-overlay">
                    <span class="more-count">+{{ photos.length - 3 }}</span>
                    <span class="more-text">ещё</span>
                  </div>
                </div>
              </div>
              <!-- Кнопка просмотра всего альбома -->
              <button v-if="photos.length > 3" class="view-album-btn" @click="openPhotoGallery">
                <i class="fas fa-images"></i>
                Открыть фотоальбом ({{ photos.length }} фото)
              </button>
            </div>

            <!-- Покупки (только для фестивалей и маркетов) -->
            <div v-if="showPurchases && (purchases.length > 0 || event.purchases_summary)" class="event-card">
              <h3 class="card-title">
                <i class="fas fa-shopping-bag"></i>
                Покупки
                <span v-if="purchases.length > 0" class="photos-count">{{ purchases.length }}</span>
              </h3>
              <div class="purchases-summary">
                <div class="purchase-stat">
                  <i class="fas fa-shopping-bag"></i>
                  <span>{{ purchases.length }} покупок</span>
                </div>
                <div class="purchase-stat">
                  <i class="fas fa-ruble-sign"></i>
                  <span>{{ formatMoney(totalSpent) }}</span>
                </div>
              </div>
              <div v-if="event.purchases_summary" class="card-text">{{ event.purchases_summary }}</div>
              <div v-if="purchases.length > 0" class="purchases-list">
                <div v-for="purchase in purchases" :key="purchase.id" class="purchase-item">
                  <div v-if="purchase.image_url" class="purchase-image">
                    <img :src="purchase.image_url" :alt="purchase.item_name" />
                  </div>
                  <div class="purchase-details">
                    <div class="purchase-header">
                      <span class="purchase-name">{{ purchase.item_name }}</span>
                      <span class="purchase-price">{{ formatMoney(purchase.price) }}</span>
                    </div>
                    <div v-if="purchase.vendor_name || purchase.category || purchase.purchased_at" class="purchase-meta">
                      <span v-if="purchase.vendor_name" class="meta-vendor">
                        <i class="fas fa-store"></i>
                        {{ purchase.vendor_name }}
                      </span>
                      <span v-if="purchase.category" class="meta-category">
                        <i class="fas fa-tag"></i>
                        {{ getCategoryName(purchase.category) }}
                      </span>
                      <span v-if="purchase.purchased_at" class="meta-date">
                        <i class="fas fa-calendar"></i>
                        {{ formatPurchaseDate(purchase.purchased_at) }}
                      </span>
                    </div>
                    <p v-if="purchase.description" class="purchase-description">{{ purchase.description }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Плюсы и минусы -->
            <div v-if="hasProsOrCons" class="event-card pros-cons-card">
              <h3 class="card-title">
                <i class="fas fa-balance-scale"></i>
                Мое мнение
              </h3>
              <div class="pros-cons-grid">
                <div v-if="event.pros && event.pros.length > 0" class="pros-block">
                  <h4 class="block-subtitle pros">
                    <i class="fas fa-thumbs-up"></i>
                    Плюсы
                  </h4>
                  <ul class="opinion-list">
                    <li v-for="(pro, i) in event.pros" :key="i">
                      <i class="fas fa-check"></i>
                      {{ pro }}
                    </li>
                  </ul>
                </div>
                <div v-if="event.cons_text && event.cons_text.length > 0" class="cons-block">
                  <h4 class="block-subtitle cons">
                    <i class="fas fa-thumbs-down"></i>
                    Минусы
                  </h4>
                  <ul class="opinion-list">
                    <li v-for="(con, i) in event.cons_text" :key="i">
                      <i class="fas fa-times"></i>
                      {{ con }}
                    </li>
                  </ul>
                </div>
              </div>
              <!-- Общее впечатление -->
              <div v-if="event.my_review" class="general-impression">
                <h4 class="block-subtitle">
                  <i class="fas fa-comment-alt"></i>
                  Общее впечатление
                </h4>
                <div class="impression-text">{{ cleanReviewText }}</div>
              </div>
            </div>
          </div>

          <!-- Правая колонка -->
          <div class="content-right">
            <!-- Рейтинг по категориям -->
            <div v-if="shouldShowRatings && visibleRatings.length > 0" class="event-card compact">
              <h3 class="card-title">
                <i class="fas fa-star"></i>
                Оценки
              </h3>
              <div class="ratings-list">
                <div v-for="rating in visibleRatings" :key="rating.key" class="rating-row">
                  <span class="rating-label">{{ rating.label }}</span>
                  <div class="rating-stars">
                    <i
                      v-for="n in 5"
                      :key="n"
                      :class="[{ 'fas': n <= rating.value, 'far': n > rating.value }, 'fa-star', { active: n <= rating.value }]"
                    ></i>
                  </div>
                  <span class="rating-num">{{ rating.value }}</span>
                </div>
              </div>
              <div class="overall-score">
                <span>Общая оценка</span>
                <strong>{{ calculatedOverallRating }}/5</strong>
              </div>
            </div>

            <!-- Особенности мероприятия -->
            <div v-if="eventFeatures.length > 0" class="event-card compact">
              <h3 class="card-title">
                <i class="fas fa-sparkles"></i>
                Особенности
              </h3>
              <ul class="features-list">
                <li v-for="feature in eventFeatures" :key="feature.id" class="feature-item">
                  <i :class="feature.icon"></i>
                  <span>{{ feature.title }}</span>
                </li>
              </ul>
            </div>


            <!-- Ссылки -->
            <div v-if="event.official_website || links.length > 0" class="event-card compact">
              <h3 class="card-title">
                <i class="fas fa-link"></i>
                Ссылки
              </h3>
              <div class="links-list">
                <a v-if="event.official_website" :href="event.official_website" class="link-item" target="_blank">
                  <i class="fas fa-globe"></i>
                  <span>{{ getWebsiteDomain(event.official_website) }}</span>
                </a>
                <a v-for="link in links" :key="link.id" :href="link.url" class="link-item" target="_blank">
                  <i :class="link.icon_class || 'fas fa-external-link-alt'"></i>
                  <span>{{ link.title }}</span>
                </a>
              </div>
            </div>

            <!-- Информация -->
            <div class="event-card compact">
              <h3 class="card-title">
                <i class="fas fa-info"></i>
                Информация
              </h3>
              <div class="info-list">
                <div v-if="event.city" class="info-row">
                  <span class="info-label">Город</span>
                  <span class="info-value">{{ event.city }}</span>
                </div>
                <div v-if="event.event_type" class="info-row">
                  <span class="info-label">Тип</span>
                  <span class="info-value">{{ getEventTypeName(event.event_type) }}</span>
                </div>
                <div v-if="event.attendees_count" class="info-row">
                  <span class="info-label">Участников</span>
                  <span class="info-value">{{ event.attendees_count }} чел.</span>
                </div>
                <div v-if="event.expected_visitors" class="info-row">
                  <span class="info-label">Ожидалось</span>
                  <span class="info-value">{{ event.expected_visitors }} чел.</span>
                </div>
                <div v-if="parsedAttendanceStatus.roles && parsedAttendanceStatus.roles.length > 0" class="info-row">
                  <span class="info-label">Мой статус</span>
                  <span class="info-value roles-value">
                    <span v-for="role in parsedAttendanceStatus.roles" :key="role" class="role-badge" :class="role">
                      {{ getRoleName(role) }}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно галереи с сеткой фото -->
    <div v-if="showPhotoGallery" class="photo-gallery-modal" @click="closePhotoGallery">
      <div class="gallery-modal-content" @click.stop>
        <div class="gallery-modal-header">
          <h2>
            <i class="fas fa-images"></i>
            Фотоальбом
            <span class="gallery-count">{{ photos.length }} фото</span>
          </h2>
          <button class="gallery-close-btn" @click="closePhotoGallery">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="gallery-grid">
          <div
            v-for="(photo, index) in photos"
            :key="photo.id"
            class="gallery-grid-item"
            @click="openPhotoAtIndex(index)"
          >
            <img :src="photo.thumbnail_url || photo.image_url" :alt="photo.caption || 'Фото'" loading="lazy" />
            <div class="gallery-grid-overlay">
              <i class="fas fa-search-plus"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно просмотра одного фото с навигацией -->
    <div v-if="selectedPhotoIndex !== null" class="photo-modal" @click="closePhotoModal">
      <button class="modal-close" @click="closePhotoModal">
        <i class="fas fa-times"></i>
      </button>
      <img :src="photos[selectedPhotoIndex].image_url" :alt="photos[selectedPhotoIndex].caption" @click.stop />
      <button v-if="selectedPhotoIndex > 0" class="modal-nav prev" @click.stop="selectedPhotoIndex--">
        <i class="fas fa-chevron-left"></i>
      </button>
      <button v-if="selectedPhotoIndex < photos.length - 1" class="modal-nav next" @click.stop="selectedPhotoIndex++">
        <i class="fas fa-chevron-right"></i>
      </button>
      <div class="modal-counter">{{ selectedPhotoIndex + 1 }} / {{ photos.length }}</div>
    </div>
  </div>
</template>

<script>
import { furryApi } from '@/config/supabase.js'
import { imageHelpers } from '@/utils/imageUtils'
import StarRating from '@/components/ui/StarRating.vue'

export default {
  name: 'EventDetailPage',
  components: {
    StarRating
  },
  
  data() {
    return {
      // Основные данные
      event: null,
      links: [],
      photos: [],
      purchases: [],

      // Состояние
      loading: true,
      error: null,
      activeTab: 'overview',
      selectedPhotoIndex: null,
      showPhotoGallery: false,
    }
  },
  
  computed: {
    // Проверка событий без обзора (показываем предупреждение, но не блокируем доступ)
    isEventWithoutReview() {
      if (!this.event) return false
      const isPast = new Date(this.event.event_date) < new Date()
      if (!isPast) return false

      // Обзор считается написанным если review_completed=true ИЛИ есть рейтинги
      const hasRatings = this.event.rating_organization || this.event.rating_program ||
                         this.event.rating_atmosphere || this.event.rating_location ||
                         this.event.rating_participants || this.event.rating_food || this.event.my_rating

      return !this.event.review_completed && !hasRatings
    },

    totalSpent() {
      return this.purchases.reduce((sum, purchase) => sum + (parseFloat(purchase.price) || 0), 0)
    },
    showPurchases() {
      return this.event && (this.event.event_type === 'festival' || this.event.event_type === 'market')
    },
    displayedPhotos() {
      return this.photos.slice(0, 3)
    },
    hasMultiRatings() {
      return this.event && (
        this.event.rating_organization ||
        this.event.rating_program ||
        this.event.rating_atmosphere ||
        this.event.rating_location ||
        this.event.rating_participants ||
        this.event.rating_food
      )
    },
    // Особенности мероприятия из boolean полей
    eventFeatures() {
      if (!this.event) return []
      const features = []
      if (this.event.has_dealers_den) {
        features.push({ id: 'dealers_den', title: 'Торговая зона', icon: 'fas fa-store' })
      }
      if (this.event.has_art_show) {
        features.push({ id: 'art_show', title: 'Арт-выставка', icon: 'fas fa-palette' })
      }
      if (this.event.has_fursuit_parade) {
        features.push({ id: 'fursuit_parade', title: 'Фурсьют-парад', icon: 'fas fa-paw' })
      }
      return features
    },
    hasProsOrCons() {
      return this.event && (
        (this.event.pros && this.event.pros.length > 0) ||
        (this.event.cons_text && this.event.cons_text.length > 0)
      )
    },
    hasAnyRating() {
      return this.event && this.visibleRatings.length > 0
    },
    // Парсинг attendance_status из JSON
    parsedAttendanceStatus() {
      if (!this.event || !this.event.attendance_status) return { status: null, roles: [] }

      if (typeof this.event.attendance_status === 'string') {
        try {
          return JSON.parse(this.event.attendance_status)
        } catch {
          // Если это простая строка (старый формат)
          return { status: this.event.attendance_status, roles: [] }
        }
      }
      return this.event.attendance_status
    },
    calculatedOverallRating() {
      if (!this.event) return '0.0'
      const ratings = this.visibleRatings.map(r => r.value).filter(v => v !== null && v > 0)

      if (ratings.length === 0) return '0.0'
      const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      return avg.toFixed(1)
    },

    cleanReviewText() {
      if (!this.event || !this.event.my_review) return ''
      return this.stripHtml(this.event.my_review)
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
    },

    // Проверка, нужно ли показывать рейтинги для данного типа мероприятия
    shouldShowRatings() {
      // Показываем рейтинги для всех типов (но фильтруем категории в visibleRatings)
      return this.event && this.visibleRatings.length > 0
    },

    // Категории рейтинга в зависимости от типа мероприятия
    visibleRatings() {
      if (!this.event) return []

      const type = this.event.event_type
      const allRatings = [
        { key: 'organization', label: 'Организация', value: this.event.rating_organization },
        { key: 'program', label: 'Программа', value: this.event.rating_program },
        { key: 'atmosphere', label: 'Атмосфера', value: this.event.rating_atmosphere },
        { key: 'location', label: 'Локация', value: this.event.rating_location },
        { key: 'participants', label: 'Участники', value: this.event.rating_participants },
        { key: 'food', label: 'Питание', value: this.event.rating_food }
      ]

      // Фильтруем по типу мероприятия
      let excludeKeys = []

      if (type === 'market') {
        // На маркетах нет программы и питания
        excludeKeys = ['program', 'food']
      } else if (type === 'festival') {
        // На фестивалях обычно нет организованного питания
        excludeKeys = ['food']
      } else if (type === 'party') {
        // На вечеринках нет программы (только музыка/танцы)
        excludeKeys = ['program']
      } else if (type === 'meetup') {
        // На встречах нет программы и питания
        excludeKeys = ['program', 'food']
      }

      return allRatings.filter(r => !excludeKeys.includes(r.key) && r.value)
    }
  },
  
  async mounted() {
    await this.loadEventData()
    
    // Установка активной вкладки из URL hash
    if (window.location.hash) {
      const tab = window.location.hash.substring(1)
      if (['overview', 'gallery', 'purchases', 'impressions'].includes(tab)) {
        this.activeTab = tab
      }
    }
  },
  
  methods: {
    async loadEventData() {
      try {
        this.loading = true
        this.error = null

        const slugOrId = this.$route.params.slug
        console.log('🔍 Загружаем данные для мероприятия:', slugOrId)

        // Проверяем, является ли параметр UUID (ID) или slug
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId)

        // Загружаем основные данные мероприятия
        if (isUUID) {
          // Загружаем по ID
          this.event = await furryApi.getEventById(slugOrId)
        } else {
          // Загружаем по slug
          this.event = await furryApi.getEventBySlug(slugOrId)
        }

        if (!this.event) {
          throw new Error('Мероприятие не найдено')
        }
        
        console.log('✅ Мероприятие загружено:', this.event.name)
        
        // Загружаем связанные данные параллельно
        const [linksData, photosData, purchasesData] = await Promise.allSettled([
          furryApi.getEventLinks(this.event.id),
          furryApi.getEventPhotos(this.event.id),
          furryApi.getEventPurchases(this.event.id)
        ])
        
        // Обрабатываем результаты
        this.links = linksData.status === 'fulfilled' ? linksData.value : []
        this.photos = photosData.status === 'fulfilled' ? photosData.value : []
        this.purchases = purchasesData.status === 'fulfilled' ? purchasesData.value : []

        console.log('✅ Связанные данные загружены:', {
          links: this.links.length,
          photos: this.photos.length,
          purchases: this.purchases.length
        })
        
        // Устанавливаем заголовок страницы
        document.title = `${this.event.name} | FoxTaffy.gay`
        
      } catch (error) {
        console.error('❌ Ошибка загрузки мероприятия:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    
    // Утилиты для отображения
    getBannerImage(url) {
      return imageHelpers.getEventBannerLarge(url)
    },
    
    getStatusClass(event) {
      const now = new Date()
      const eventDate = new Date(event.event_date)
      
      if (eventDate > now) return 'upcoming'
      if (eventDate <= now) return 'completed'
      return 'unknown'
    },
    
    getStatusText() {
      const statusMap = {
        planning: 'Планирую',
        registered: 'Зарегистрирован',
        ticket_bought: 'Билет куплен',
        attended: 'Посетил',
        missed: 'Пропустил',
        cancelled: 'Отменено'
      }
      const parsed = this.parsedAttendanceStatus
      return statusMap[parsed.status] || 'Неизвестно'
    },

    getRoleName(role) {
      const roleMap = {
        vip: 'VIP',
        sponsor: 'Спонсор',
        volunteer: 'Волонтёр'
      }
      return roleMap[role] || role
    },

    stripHtml(html) {
      if (!html) return ''
      const div = document.createElement('div')
      div.innerHTML = html
      return div.textContent || div.innerText || ''
    },

    getEventTypeName(eventType) {
      const typeMap = {
        convention: 'Конвент',
        market: 'Маркет',
        festival: 'Фестиваль',
        meetup: 'Встреча',
        exhibition: 'Выставка',
        party: 'Вечеринка',
        online: 'Онлайн',
        other: 'Другое'
      }
      return typeMap[eventType] || eventType
    },

    getEventTypeIcon(eventType) {
      const iconMap = {
        convention: 'fas fa-crown',
        market: 'fas fa-store',
        festival: 'fas fa-music',
        meetup: 'fas fa-users',
        exhibition: 'fas fa-image',
        party: 'fas fa-glass-cheers',
        online: 'fas fa-laptop',
        other: 'fas fa-calendar'
      }
      return iconMap[eventType] || 'fas fa-calendar'
    },

    getWebsiteDomain(url) {
      try {
        const domain = new URL(url).hostname
        return domain.replace('www.', '')
      } catch {
        return url
      }
    },
    
    formatEventDate(dateString) {
      // Особый формат для КОНов с диапазоном дат
      if (this.event && this.event.event_type === 'convention' && this.event.event_end_date) {
        const startDate = new Date(dateString)
        const endDate = new Date(this.event.event_end_date)

        const startDay = startDate.getDate().toString().padStart(2, '0')
        const startMonth = (startDate.getMonth() + 1).toString().padStart(2, '0')
        const endDay = endDate.getDate().toString().padStart(2, '0')
        const endMonth = (endDate.getMonth() + 1).toString().padStart(2, '0')

        return `${startDay}.${startMonth} – ${endDay}.${endMonth}`
      }

      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    
    getEventTime(dateString) {
      const date = new Date(dateString)
      const time = date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      })
      return time !== '00:00' ? time : null
    },
    
    formatMoney(amount) {
      if (!amount) return '0 ₽'
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
      if (isNaN(numAmount)) return '0 ₽'
      return `${numAmount.toLocaleString('ru-RU')} ₽`
    },

    formatPurchaseDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short'
      })
    },

    getCategoryName(category) {
      const categories = {
        art: 'Арт',
        badge: 'Бейдж',
        fursuit: 'Фурсьют',
        accessory: 'Аксессуары',
        plushie: 'Плюшевая игрушка',
        figurine: 'Фигурка',
        book: 'Книга',
        sticker: 'Наклейка',
        pin: 'Значок',
        clothing: 'Одежда',
        jewelry: 'Украшение',
        keychain: 'Брелок',
        poster: 'Постер',
        food: 'Еда',
        ticket: 'Билет',
        merch: 'Мерчандайз',
        craft: 'Рукоделие',
        tech: 'Техника',
        other: 'Другое'
      }
      return categories[category] || category
    },
    
    // Работа с фотографиями
    openPhotoGallery() {
      this.showPhotoGallery = true
      document.body.style.overflow = 'hidden'
    },

    closePhotoGallery() {
      this.showPhotoGallery = false
      document.body.style.overflow = ''
    },

    openPhotoAtIndex(index) {
      this.selectedPhotoIndex = index
      this.showPhotoGallery = false
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', this.handleKeydown)
    },

    closePhotoModal() {
      this.selectedPhotoIndex = null
      document.body.style.overflow = ''
      window.removeEventListener('keydown', this.handleKeydown)
    },

    handleKeydown(e) {
      if (this.selectedPhotoIndex === null) return

      if (e.key === 'ArrowLeft' && this.selectedPhotoIndex > 0) {
        this.selectedPhotoIndex--
      } else if (e.key === 'ArrowRight' && this.selectedPhotoIndex < this.photos.length - 1) {
        this.selectedPhotoIndex++
      } else if (e.key === 'Escape') {
        this.closePhotoModal()
      }
    }
  },

  beforeUnmount() {
    // Возвращаем скролл при выходе со страницы
    document.body.style.overflow = ''
    window.removeEventListener('keydown', this.handleKeydown)
  }
}
</script>


<style scoped>
.event-details-page {
  min-height: 100vh;
  background: var(--bg-primary, #0a0a0f);
}

/* Загрузка и ошибки */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 1rem;
  text-align: center;
  color: rgba(255,255,255,0.6);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(139, 92, 246, 0.2);
  border-top: 3px solid #8b5cf6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #8b5cf6;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s;
}

.back-btn:hover {
  background: #7c3aed;
}

/* Блокировка */
.blocked-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 2rem;
}

.blocked-content {
  max-width: 500px;
  text-align: center;
  background: rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 3rem;
}

.blocked-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: rgba(128,128,128,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.blocked-icon i {
  font-size: 2.5rem;
  color: rgba(255,255,255,0.5);
}

.blocked-content h2 {
  color: white;
  margin-bottom: 1rem;
}

.blocked-content p {
  color: rgba(255,255,255,0.7);
  margin-bottom: 0.5rem;
}

.blocked-hint {
  font-size: 0.875rem;
  color: rgba(255,255,255,0.5);
  margin-bottom: 1.5rem;
}

/* Уведомление о событии без обзора */
.no-review-alert {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  margin-bottom: 2rem;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-left: 4px solid #ffc107;
  border-radius: 0.75rem;
  backdrop-filter: blur(10px);
}

.no-review-alert .alert-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: rgba(255, 193, 7, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-review-alert .alert-icon i {
  font-size: 1.5rem;
  color: #ffc107;
}

.no-review-alert .alert-content h4 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #ffc107;
}

.no-review-alert .alert-content p {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

/* Баннер */
.event-hero {
  position: relative;
  height: 500px;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.85) 100%);
  z-index: 1;
}

.hero-image {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.back-button {
  position: absolute;
  top: 2rem;
  left: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  background: rgba(255,255,255,0.15);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  font-size: 0.875rem;
  transition: all 0.3s;
}

.back-button:hover {
  background: rgba(255,255,255,0.25);
  transform: translateX(-4px);
}

.hero-info {
  max-width: 600px;
}

.event-badges {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.event-status, .event-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.event-status.completed {
  background: rgba(34, 197, 94, 0.3);
  color: #4ade80;
}

.event-status.upcoming {
  background: rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}

.event-type-badge {
  background: rgba(139, 92, 246, 0.3);
  color: #a78bfa;
}

.event-title {
  font-size: 3rem;
  font-weight: 800;
  color: white;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 4px 20px rgba(0,0,0,0.5);
}

.event-subtitle {
  font-size: 1.125rem;
  color: rgba(255,255,255,0.8);
  margin: 0 0 1.5rem 0;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: rgba(255,255,255,0.85);
  font-size: 0.8rem;
}

.meta-item i {
  color: #a78bfa;
}

.hero-rating {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.rating-stars-large i {
  font-size: 1.5rem;
  color: rgba(255,255,255,0.3);
}

.rating-stars-large i.active {
  color: #fbbf24;
}

.rating-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fbbf24;
}

/* Контейнер */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Сетка контента */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 1.5rem;
}

.content-left {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.content-right {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Карточки */
.event-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 1.5rem;
}

.event-card.compact {
  padding: 1.25rem;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  margin: 0 0 1rem 0;
}

.card-title i {
  color: #8b5cf6;
}

.card-text {
  color: rgba(255,255,255,0.7);
  line-height: 1.7;
}

.card-text.muted {
  color: rgba(255,255,255,0.4);
  font-style: italic;
}

/* Фотографии */
.photos-count {
  margin-left: auto;
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.photo-item:hover img {
  transform: scale(1.1);
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.photo-item:hover .photo-overlay {
  opacity: 1;
}

.photo-overlay i {
  color: white;
  font-size: 1.25rem;
}

/* Покупки */
.purchases-summary {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.purchase-stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255,255,255,0.7);
  font-size: 0.875rem;
}

.purchase-stat i {
  color: #8b5cf6;
}

.purchases-list {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.purchase-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  transition: all 0.3s;
}

.purchase-item:hover {
  background: rgba(255,255,255,0.05);
  border-color: rgba(139, 92, 246, 0.3);
}

.purchase-image {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(0,0,0,0.3);
}

.purchase-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.purchase-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.purchase-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
}

.purchase-name {
  color: white;
  font-size: 0.9375rem;
  font-weight: 500;
  flex: 1;
}

.purchase-price {
  color: #fbbf24;
  font-weight: 600;
  font-size: 0.9375rem;
  white-space: nowrap;
}

.purchase-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.75rem;
}

.meta-vendor,
.meta-category,
.meta-date {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: rgba(255,255,255,0.6);
}

.meta-vendor i,
.meta-category i,
.meta-date i {
  color: #8b5cf6;
  font-size: 0.7rem;
}

.purchase-description {
  margin: 0;
  font-size: 0.8125rem;
  color: rgba(255,255,255,0.7);
  line-height: 1.5;
}

/* Плюсы/Минусы */
.pros-cons-card {
  max-width: none;
}

.pros-cons-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.pros-block, .cons-block {
  min-height: 0;
}

.block-subtitle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
}

.block-subtitle.pros {
  color: #4ade80;
}

.block-subtitle.cons {
  color: #f87171;
}

.opinion-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.opinion-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.4rem 0;
  font-size: 0.875rem;
  color: rgba(255,255,255,0.8);
  line-height: 1.4;
}

.pros-block .opinion-list i {
  color: #4ade80;
  font-size: 0.75rem;
  margin-top: 0.2rem;
  flex-shrink: 0;
}

.cons-block .opinion-list i {
  color: #f87171;
  font-size: 0.75rem;
  margin-top: 0.2rem;
  flex-shrink: 0;
}

.general-impression {
  margin-top: 1.5rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 18px;
  background: rgba(255,255,255,0.03);
}

.general-impression .block-subtitle {
  color: #a78bfa;
  margin-bottom: 0.85rem;
}

.impression-text {
  color: rgba(255,255,255,0.9);
  line-height: 1.7;
  font-size: 0.95rem;
  white-space: pre-wrap;
  word-break: break-word;
  padding: 0.85rem 1rem;
  border-radius: 14px;
  background: rgba(255,255,255,0.02);
}

/* Рейтинги */
.ratings-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.rating-label {
  flex: 0 0 90px;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.6);
}

.rating-stars {
  flex: 1;
  display: flex;
  gap: 0.25rem;
}

.rating-stars i {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.2);
}

.rating-stars i.active {
  color: #fbbf24;
}

.rating-num {
  flex: 0 0 20px;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  text-align: right;
}

.overall-score {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255,255,255,0.1);
  font-size: 0.875rem;
  color: rgba(255,255,255,0.7);
}

.overall-score strong {
  color: #fbbf24;
  font-size: 1rem;
}


/* Ссылки */
.links-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  font-size: 0.875rem;
  transition: all 0.3s;
}

.link-item:hover {
  background: rgba(139, 92, 246, 0.2);
  color: white;
}

.link-item i {
  font-size: 1rem;
  color: #8b5cf6;
}

/* Особенности мероприятия */
.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  font-size: 0.875rem;
  color: rgba(255,255,255,0.8);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.feature-item:last-child {
  border-bottom: none;
}

.feature-item i {
  color: #8b5cf6;
  font-size: 0.875rem;
  flex-shrink: 0;
}

/* Информация */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .roles-value {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  justify-content: flex-end;
}

.role-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
}

.role-badge.vip {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.role-badge.sponsor {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.role-badge.volunteer {
  background: rgba(244, 114, 182, 0.2);
  color: #f472b6;
}

.info-row .info-label {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.5);
}

.info-row .info-value {
  font-size: 0.875rem;
  color: rgba(255,255,255,0.8);
}

/* Кнопка просмотра альбома */
.view-album-btn {
  width: 100%;
  margin-top: 1rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.3s;
}

.view-album-btn:hover {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(139, 92, 246, 0.3);
}

.view-album-btn i {
  font-size: 1.125rem;
}

/* Модальное окно галереи */
.photo-gallery-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.gallery-modal-content {
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  background: rgba(20, 20, 30, 0.95);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.gallery-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  background: rgba(139, 92, 246, 0.1);
  border-bottom: 1px solid rgba(139, 92, 246, 0.3);
}

.gallery-modal-header h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
}

.gallery-modal-header h2 i {
  color: #8b5cf6;
  font-size: 1.75rem;
}

.gallery-count {
  font-size: 0.875rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
  margin-left: 0.5rem;
}

.gallery-close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  font-size: 1.25rem;
}

.gallery-close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.gallery-grid {
  padding: 2rem;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-auto-rows: minmax(200px, auto);
  gap: 1rem;
  align-items: start;
}

.gallery-grid-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.3);
}

.gallery-grid-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.gallery-grid-item:hover img {
  transform: scale(1.1);
}

.gallery-grid-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.gallery-grid-item:hover .gallery-grid-overlay {
  opacity: 1;
}

.gallery-grid-overlay i {
  color: white;
  font-size: 1.5rem;
}

/* Модальное окно одного фото */
.photo-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.95);
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.photo-modal img {
  max-width: 90%;
  max-height: 90vh;
  border-radius: 8px;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.25rem;
}

.modal-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.25rem;
  transition: background 0.3s;
}

.modal-nav:hover {
  background: rgba(255,255,255,0.2);
}

.modal-nav.prev {
  left: 1rem;
}

.modal-nav.next {
  right: 1rem;
}

.modal-counter {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.5);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  color: white;
  font-size: 0.875rem;
}

/* Кнопка "ещё" для фото */
.more-photos {
  background: rgba(139, 92, 246, 0.3);
}

.more-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(139, 92, 246, 0.8);
  color: white;
}

.more-count {
  font-size: 1.5rem;
  font-weight: 700;
}

.more-text {
  font-size: 0.75rem;
  text-transform: uppercase;
}

/* Адаптив */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .content-right {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .event-hero {
    height: 400px;
  }

  .event-title {
    font-size: 2rem;
  }

  .hero-meta {
    gap: 1rem;
  }

  .photos-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .pros-cons-grid {
    grid-template-columns: 1fr 1fr;
  }

  .content-right {
    grid-template-columns: 1fr;
  }

  .purchases-summary {
    flex-direction: column;
    gap: 0.5rem;
  }

  .purchase-item {
    flex-direction: column;
  }

  .purchase-image {
    width: 100%;
    height: 200px;
  }

  .gallery-modal-content {
    max-height: 95vh;
  }

  .gallery-modal-header {
    padding: 1rem 1.5rem;
  }

  .gallery-modal-header h2 {
    font-size: 1.25rem;
  }

  .gallery-grid {
    padding: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
  }

  .photo-gallery-modal {
    padding: 1rem;
  }
}
</style>
