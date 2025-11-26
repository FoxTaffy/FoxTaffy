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

    <!-- Основной контент -->
    <div v-else-if="event">
      <!-- Героическая секция с баннером -->
      <div class="event-hero">
        <div class="hero-overlay"></div>
        <div class="hero-image" :style="{ backgroundImage: getBannerImage(event.banner_url) }"></div>
        <div class="hero-content">
          <router-link to="/events" class="back-button">
            <i class="fas fa-arrow-left"></i>
            <span>Назад к мероприятиям</span>
          </router-link>
          
          <div class="event-badges">
            <span class="event-status" :class="getStatusClass(event)">
              {{ getStatusText(event) }}
            </span>
            <span v-if="event.my_rating" class="event-rating">
              <i class="fas fa-star"></i>
              {{ event.my_rating }}/5
            </span>
          </div>
          
          <h1 class="event-title">{{ event.name }}</h1>
          <div v-if="event.subtitle" class="event-subtitle">{{ event.subtitle }}</div>
        </div>
      </div>
      
      <div class="container">
        <!-- Краткая информация о мероприятии -->
        <div class="event-info-grid">
          <div class="event-info-card">
            <div class="info-icon"><i class="fas fa-calendar-alt"></i></div>
            <div class="info-content">
              <div class="info-label">Дата проведения</div>
              <div class="info-value">{{ formatEventDate(event.event_date) }}</div>
            </div>
          </div>


          <div class="event-info-card">
            <div class="info-icon"><i class="fas fa-map-marker-alt"></i></div>
            <div class="info-content">
              <div class="info-label">Место проведения</div>
              <div class="info-value">{{ event.location }}</div>
              <div v-if="event.city" class="info-extra">{{ event.city }}<span v-if="event.country">, {{ event.country }}</span></div>
            </div>
          </div>

          <div v-if="event.attendees_count" class="event-info-card">
            <div class="info-icon"><i class="fas fa-users"></i></div>
            <div class="info-content">
              <div class="info-label">Участников</div>
              <div class="info-value">{{ event.attendees_count }}+</div>
              <div v-if="event.expected_visitors" class="info-extra">Ожидалось: {{ event.expected_visitors }}</div>
            </div>
          </div>

          <div v-if="event.event_type" class="event-info-card">
            <div class="info-icon"><i class="fas fa-tag"></i></div>
            <div class="info-content">
              <div class="info-label">Тип мероприятия</div>
              <div class="info-value">{{ getEventTypeName(event.event_type) }}</div>
            </div>
          </div>

          <div v-if="event.announced_date" class="event-info-card">
            <div class="info-icon"><i class="fas fa-bullhorn"></i></div>
            <div class="info-content">
              <div class="info-label">Дата анонса</div>
              <div class="info-value">{{ formatEventDate(event.announced_date) }}</div>
            </div>
          </div>
        </div>
        
        <!-- Вкладки для навигации по секциям мероприятия -->
        <div class="event-navigation">
          <div class="nav-tabs">
            <a 
              href="#overview" 
              class="nav-tab" 
              :class="{ 'active': activeTab === 'overview' }" 
              @click.prevent="activeTab = 'overview'"
            >
              <i class="fas fa-info-circle"></i>
              <span>Обзор</span>
            </a>
            
            <a 
              v-if="photos.length > 0"
              href="#gallery" 
              class="nav-tab" 
              :class="{ 'active': activeTab === 'gallery' }" 
              @click.prevent="activeTab = 'gallery'"
            >
              <i class="fas fa-images"></i>
              <span>Фотографии</span>
              <span class="tab-count">({{ photos.length }})</span>
            </a>
            
            <a
              v-if="purchases.length > 0 || event.purchases_summary"
              href="#purchases"
              class="nav-tab"
              :class="{ 'active': activeTab === 'purchases' }"
              @click.prevent="activeTab = 'purchases'"
            >
              <i class="fas fa-shopping-bag"></i>
              <span>Покупки</span>
              <span v-if="purchases.length > 0" class="tab-count">({{ purchases.length }})</span>
            </a>
            
            <a
              v-if="event.my_review || event.my_rating || event.conclusion || event.pros || event.cons_text"
              href="#impressions"
              class="nav-tab"
              :class="{ 'active': activeTab === 'impressions' }"
              @click.prevent="activeTab = 'impressions'"
            >
              <i class="fas fa-heart"></i>
              <span>Впечатления</span>
            </a>
          </div>
        </div>
        
        <!-- Контент для вкладок -->
        <div class="event-content-container">
          <!-- Обзор -->
          <div class="event-section" v-show="activeTab === 'overview'">
            <h2 class="section-title">О мероприятии</h2>
            <div class="section-content">
              <div v-if="event.description" class="event-description" v-html="event.description"></div>
              <div v-else class="no-description">
                <i class="fas fa-info-circle"></i>
                <p>Описание мероприятия пока не добавлено</p>
              </div>

              <!-- Официальный сайт -->
              <div v-if="event.official_website" class="event-links">
                <h3 class="links-title">Официальный сайт:</h3>
                <div class="links-container">
                  <a
                    :href="event.official_website"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="event-link"
                  >
                    <i class="fas fa-globe"></i>
                    <span>{{ getWebsiteDomain(event.official_website) }}</span>
                  </a>
                </div>
              </div>

              <!-- Официальные ресурсы из базы -->
              <div v-if="links.length > 0" class="event-links">
                <h3 class="links-title">Ссылки:</h3>
                <div class="links-container">
                  <a
                    v-for="link in links"
                    :key="link.id"
                    :href="link.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="event-link"
                  >
                    <i :class="link.icon_class || 'fas fa-external-link-alt'"></i>
                    <span>{{ link.title }}</span>
                  </a>
                </div>
              </div>

              <!-- Встроенные особенности мероприятия -->
              <div v-if="hasBuiltInFeatures" class="features-container">
                <h3 class="features-title">Что было на мероприятии</h3>
                <div class="features-grid">
                  <div v-if="event.has_dealers_den" class="feature-card">
                    <div class="feature-icon">
                      <i class="fas fa-store"></i>
                    </div>
                    <div class="feature-content">
                      <h4 class="feature-title">Dealers Den</h4>
                      <p class="feature-description">Торговая зона с мерчем и артами</p>
                    </div>
                  </div>
                  <div v-if="event.has_art_show" class="feature-card">
                    <div class="feature-icon">
                      <i class="fas fa-palette"></i>
                    </div>
                    <div class="feature-content">
                      <h4 class="feature-title">Арт-выставка</h4>
                      <p class="feature-description">Выставка работ художников</p>
                    </div>
                  </div>
                  <div v-if="event.has_fursuit_parade" class="feature-card">
                    <div class="feature-icon">
                      <i class="fas fa-paw"></i>
                    </div>
                    <div class="feature-content">
                      <h4 class="feature-title">Фурсьют-парад</h4>
                      <p class="feature-description">Парад участников в костюмах</p>
                    </div>
                  </div>
                  <div v-if="event.has_competitions" class="feature-card">
                    <div class="feature-icon">
                      <i class="fas fa-trophy"></i>
                    </div>
                    <div class="feature-content">
                      <h4 class="feature-title">Конкурсы</h4>
                      <p class="feature-description">Различные соревнования и конкурсы</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Дополнительные особенности из базы -->
              <div v-if="features.length > 0" class="features-container">
                <h3 class="features-title">Дополнительные особенности</h3>
                <div class="features-grid">
                  <div v-for="feature in features" :key="feature.id" class="feature-card">
                    <div class="feature-icon">
                      <i :class="feature.icon_class || 'fas fa-star'"></i>
                    </div>
                    <div class="feature-content">
                      <h4 class="feature-title">{{ feature.title }}</h4>
                      <p v-if="feature.description" class="feature-description">{{ feature.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Фотографии -->
          <div class="event-section" v-show="activeTab === 'gallery'">
            <h2 class="section-title">
              Фотографии
              <span class="section-count">({{ photos.length }})</span>
            </h2>
            <div v-if="photos.length > 0" class="photos-grid">
              <div 
                v-for="photo in photos" 
                :key="photo.id" 
                class="photo-item"
                @click="openPhotoModal(photo)"
              >
                <img 
                  :src="photo.thumbnail_url || photo.image_url" 
                  :alt="photo.caption || 'Фото с мероприятия'"
                  class="photo-image"
                  loading="lazy"
                >
                <div v-if="photo.caption" class="photo-caption">{{ photo.caption }}</div>
              </div>
            </div>
          </div>
          
          <!-- Покупки -->
          <div class="event-section" v-show="activeTab === 'purchases'">
            <h2 class="section-title">
              Покупки
              <span class="section-count">({{ purchases.length }})</span>
            </h2>
            <div v-if="purchases.length > 0 || event.purchases_summary">
              <!-- Сводка покупок -->
              <div class="purchases-summary">
                <div class="purchase-stat">
                  <i class="fas fa-shopping-bag"></i>
                  <span>{{ purchases.length }} покупок</span>
                </div>
                <div class="purchase-stat">
                  <i class="fas fa-ruble-sign"></i>
                  <span>{{ formatMoney(totalSpent) }} потрачено</span>
                </div>
              </div>

              <!-- Текстовая сводка покупок -->
              <div v-if="event.purchases_summary" class="purchases-text-summary">
                <h3 class="summary-title">Что было куплено:</h3>
                <p class="summary-text">{{ event.purchases_summary }}</p>
              </div>
              
              <!-- Список покупок -->
              <div class="purchases-list">
                <div v-for="purchase in purchases" :key="purchase.id" class="purchase-card">
                  <div v-if="purchase.image_url" class="purchase-image">
                    <img :src="purchase.image_url" :alt="purchase.item_name" loading="lazy">
                  </div>
                  <div class="purchase-info">
                    <h4 class="purchase-name">{{ purchase.item_name }}</h4>
                    <p v-if="purchase.description" class="purchase-description">{{ purchase.description }}</p>
                    <div class="purchase-details">
                      <span v-if="purchase.vendor_name" class="purchase-vendor">
                        <i class="fas fa-store"></i>
                        {{ purchase.vendor_name }}
                      </span>
                      <span v-if="purchase.category" class="purchase-category">
                        <i class="fas fa-tag"></i>
                        {{ getCategoryName(purchase.category) }}
                      </span>
                    </div>
                    <div class="purchase-price">{{ formatMoney(purchase.price) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Впечатления -->
          <div class="event-section" v-show="activeTab === 'impressions'">
            <h2 class="section-title">Мои впечатления</h2>
            <div class="impressions-content">
              <div v-if="event.my_rating" class="review-rating">
                <div class="rating-stars">
                  <i
                    v-for="n in 5"
                    :key="n"
                    class="fas fa-star"
                    :class="{ 'active': n <= event.my_rating }"
                  ></i>
                </div>
                <span class="rating-text">{{ event.my_rating }}/5</span>
              </div>

              <!-- Оценки по категориям -->
              <div v-if="hasMultiRatings" class="multi-rating-section">
                <h3 class="rating-section-title">Моя оценка</h3>
                <div class="rating-categories-grid">
                  <div v-if="event.rating_organization" class="rating-cat-card">
                    <span class="cat-label">Организация</span>
                    <div class="cat-stars">
                      <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ 'active': n <= event.rating_organization }"></i>
                    </div>
                    <span class="cat-value">{{ event.rating_organization }}/5</span>
                  </div>
                  <div v-if="event.rating_program" class="rating-cat-card">
                    <span class="cat-label">Программа</span>
                    <div class="cat-stars">
                      <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ 'active': n <= event.rating_program }"></i>
                    </div>
                    <span class="cat-value">{{ event.rating_program }}/5</span>
                  </div>
                  <div v-if="event.rating_atmosphere" class="rating-cat-card">
                    <span class="cat-label">Атмосфера</span>
                    <div class="cat-stars">
                      <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ 'active': n <= event.rating_atmosphere }"></i>
                    </div>
                    <span class="cat-value">{{ event.rating_atmosphere }}/5</span>
                  </div>
                  <div v-if="event.rating_location" class="rating-cat-card">
                    <span class="cat-label">Локация</span>
                    <div class="cat-stars">
                      <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ 'active': n <= event.rating_location }"></i>
                    </div>
                    <span class="cat-value">{{ event.rating_location }}/5</span>
                  </div>
                  <div v-if="event.rating_participants" class="rating-cat-card">
                    <span class="cat-label">Участники</span>
                    <div class="cat-stars">
                      <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ 'active': n <= event.rating_participants }"></i>
                    </div>
                    <span class="cat-value">{{ event.rating_participants }}/5</span>
                  </div>
                  <div v-if="event.rating_food && shouldShowFoodRating" class="rating-cat-card">
                    <span class="cat-label">Питание</span>
                    <div class="cat-stars">
                      <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ 'active': n <= event.rating_food }"></i>
                    </div>
                    <span class="cat-value">{{ event.rating_food }}/5</span>
                  </div>
                </div>
                <div class="overall-rating-display">
                  Общая оценка: <strong>{{ calculatedOverallRating }}/5</strong>
                </div>
              </div>

              <!-- Плюсы и минусы как списки -->
              <div v-if="hasProsOrCons" class="pros-cons-section">
                <h3 class="opinion-title">Мое мнение</h3>
                <div class="pros-cons-columns">
                  <div v-if="event.pros && event.pros.length > 0" class="pros-block">
                    <h4 class="pros-title">
                      <i class="fas fa-thumbs-up"></i>
                      Плюсы
                    </h4>
                    <ul class="pros-list">
                      <li v-for="(pro, index) in event.pros" :key="index">
                        <i class="fas fa-check"></i>
                        <span>{{ pro }}</span>
                      </li>
                    </ul>
                  </div>
                  <div v-if="event.cons_text && event.cons_text.length > 0" class="cons-block">
                    <h4 class="cons-title">
                      <i class="fas fa-thumbs-down"></i>
                      Минусы
                    </h4>
                    <ul class="cons-list">
                      <li v-for="(con, index) in event.cons_text" :key="index">
                        <i class="fas fa-times"></i>
                        <span>{{ con }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div v-if="event.my_review" class="review-text" v-html="event.my_review"></div>
              <div v-else-if="!event.conclusion && !event.pros && !event.cons_text" class="no-review">
                <i class="fas fa-pen"></i>
                <p>Отзыв о мероприятии пока не написан</p>
              </div>

              <!-- Заключение -->
              <div v-if="event.conclusion" class="conclusion-section">
                <h3 class="conclusion-title">Итоги</h3>
                <div class="conclusion-text" v-html="event.conclusion"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Навигация к другим мероприятиям -->
        <div class="navigation-section">
          <router-link to="/events" class="all-events-btn">
            <i class="fas fa-calendar-alt"></i>
            <span>Посмотреть все мероприятия</span>
            <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Модальное окно фото -->
    <div v-if="selectedPhoto" class="photo-modal" @click="closePhotoModal">
      <div class="photo-modal-content" @click.stop>
        <button class="photo-modal-close" @click="closePhotoModal">
          <i class="fas fa-times"></i>
        </button>
        <img :src="selectedPhoto.image_url" :alt="selectedPhoto.caption" class="modal-photo">
        <div v-if="selectedPhoto.caption" class="modal-photo-caption">{{ selectedPhoto.caption }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { furryApi } from '@/config/supabase.js'
import { imageHelpers } from '@/utils/imageUtils'

export default {
  name: 'EventDetailPage',
  
  data() {
    return {
      // Основные данные
      event: null,
      links: [],
      features: [],
      photos: [],
      purchases: [],
      
      // Состояние
      loading: true,
      error: null,
      activeTab: 'overview',
      selectedPhoto: null,
    }
  },
  
  computed: {
    totalSpent() {
      return this.purchases.reduce((sum, purchase) => sum + (purchase.price || 0), 0)
    },
    hasBuiltInFeatures() {
      return this.event && (
        this.event.has_dealers_den ||
        this.event.has_art_show ||
        this.event.has_fursuit_parade ||
        this.event.has_competitions
      )
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
    hasProsOrCons() {
      return this.event && (
        (this.event.pros && this.event.pros.length > 0) ||
        (this.event.cons_text && this.event.cons_text.length > 0)
      )
    },
    calculatedOverallRating() {
      if (!this.event) return '0.0'

      // Типы мероприятий без питания
      const typesWithoutFood = ['market', 'festival', 'party']
      const shouldIncludeFood = !typesWithoutFood.includes(this.event.event_type)

      const ratings = [
        this.event.rating_organization,
        this.event.rating_program,
        this.event.rating_atmosphere,
        this.event.rating_location,
        this.event.rating_participants,
        shouldIncludeFood ? this.event.rating_food : null
      ].filter(r => r !== null && r > 0)

      if (ratings.length === 0) return '0.0'
      const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      return avg.toFixed(1)
    },

    shouldShowFoodRating() {
      if (!this.event) return false

      // Типы мероприятий без питания
      const typesWithoutFood = ['market', 'festival', 'party']
      return !typesWithoutFood.includes(this.event.event_type)
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
        
        const slug = this.$route.params.slug
        console.log('🔍 Загружаем данные для мероприятия:', slug)
        
        // Загружаем основные данные мероприятия
        this.event = await furryApi.getEventBySlug(slug)
        
        if (!this.event) {
          throw new Error('Мероприятие не найдено')
        }
        
        console.log('✅ Мероприятие загружено:', this.event.name)
        
        // Загружаем связанные данные параллельно
        const [linksData, featuresData, photosData, purchasesData] = await Promise.allSettled([
          furryApi.getEventLinks(this.event.id),
          furryApi.getEventFeatures(this.event.id),
          furryApi.getEventPhotos(this.event.id),
          furryApi.getEventPurchases(this.event.id)
        ])
        
        // Обрабатываем результаты
        this.links = linksData.status === 'fulfilled' ? linksData.value : []
        this.features = featuresData.status === 'fulfilled' ? featuresData.value : []
        this.photos = photosData.status === 'fulfilled' ? photosData.value : []
        this.purchases = purchasesData.status === 'fulfilled' ? purchasesData.value : []
        
        console.log('✅ Связанные данные загружены:', {
          links: this.links.length,
          features: this.features.length,
          photos: this.photos.length,
          purchases: this.purchases.length
        })
        
        // Устанавливаем заголовок страницы
        document.title = `${this.event.name} | FoxTaffy.fun`
        
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
    
    getStatusText(event) {
      const statusMap = {
        planning: 'Планируется',
        registered: 'Зарегистрирован',
        attended: 'Посетил',
        missed: 'Пропустил',
        cancelled: 'Отменено'
      }
      return statusMap[event.attendance_status] || 'Неизвестно'
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

    getWebsiteDomain(url) {
      try {
        const domain = new URL(url).hostname
        return domain.replace('www.', '')
      } catch {
        return url
      }
    },
    
    formatEventDate(dateString) {
      // Для КОНов отображаем диапазон дат
      if (this.event && this.event.event_type === 'convention' && this.event.event_end_date) {
        const startDate = new Date(dateString)
        const endDate = new Date(this.event.event_end_date)

        const startDay = startDate.getDate().toString().padStart(2, '0')
        const startMonth = (startDate.getMonth() + 1).toString().padStart(2, '0')
        const endDay = endDate.getDate().toString().padStart(2, '0')
        const endMonth = (endDate.getMonth() + 1).toString().padStart(2, '0')
        const year = startDate.getFullYear()

        // Формат ДД.ММ – ДД.ММ ГГГГ
        return `${startDay}.${startMonth} – ${endDay}.${endMonth} ${year}`
      }

      // Для остальных типов — обычный формат
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
      return `${amount.toLocaleString('ru-RU')} ₽`
    },
    
    getCategoryName(category) {
      const categories = {
        art: 'Арт',
        badge: 'Бейдж',
        fursuit: 'Фурсьют',
        accessory: 'Аксессуары',
        book: 'Книги',
        toy: 'Игрушки',
        food: 'Еда',
        merch: 'Мерчандайз',
        other: 'Другое'
      }
      return categories[category] || category
    },
    
    // Работа с фотографиями
    openPhotoModal(photo) {
      this.selectedPhoto = photo
      document.body.style.overflow = 'hidden'
    },
    
    closePhotoModal() {
      this.selectedPhoto = null
      document.body.style.overflow = ''
    }
  },
  
  beforeUnmount() {
    // Возвращаем скролл при выходе со страницы
    document.body.style.overflow = ''
  }
}
</script>

<style scoped>
/* ===== ОСНОВНЫЕ СТИЛИ ===== */
.event-details-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* ===== СОСТОЯНИЯ ЗАГРУЗКИ ===== */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 1rem;
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

.back-btn {
  padding: 0.75rem 1.5rem;
  background: var(--accent-orange);
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #e6691f;
  transform: translateY(-2px);
}

/* ===== ГЕРОИЧЕСКАЯ СЕКЦИЯ ===== */
.event-hero {
  position: relative;
  height: 60vh;
  min-height: 400px;
  display: flex;
  align-items: flex-end;
  color: white;
  overflow: hidden;
}

.hero-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.7) 100%
  );
}

.hero-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.event-badges {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.event-status, .event-rating {
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.9rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.event-status.upcoming {
  background: rgba(76, 175, 80, 0.8);
}

.event-status.completed {
  background: rgba(255, 123, 37, 0.8);
}

.event-rating {
  background: rgba(255, 193, 7, 0.8);
  color: white;
}

.event-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.event-subtitle {
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
}

/* ===== ИНФОРМАЦИОННЫЕ КАРТОЧКИ ===== */
.event-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 3rem 0;
}

.event-info-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.event-info-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.info-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--accent-orange), #e6691f);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.info-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-light);
}

.info-extra {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

/* ===== НАВИГАЦИЯ ПО ВКЛАДКАМ ===== */
.event-navigation {
  margin-bottom: 3rem;
}

.nav-tabs {
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
  overflow-x: auto;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  border-radius: 0.5rem;
  text-decoration: none;
  color: var(--text-muted);
  transition: all 0.3s ease;
  font-weight: 600;
  white-space: nowrap;
}

.nav-tab:hover:not(.active) {
  color: var(--text-light);
  background: rgba(255, 255, 255, 0.05);
}

.nav-tab.active {
  background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
  color: white;
  box-shadow: 0 5px 15px rgba(255, 123, 37, 0.2);
}

.tab-count {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* ===== СЕКЦИИ КОНТЕНТА ===== */
.event-section {
  margin-bottom: 3rem;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-count {
  font-size: 1rem;
  color: var(--text-muted);
  font-weight: 400;
}

.section-content {
  color: var(--text-light);
}

.event-description {
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 2rem;
}

.no-description, .no-review {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  color: var(--text-muted);
  text-align: center;
  justify-content: center;
}

/* ===== ССЫЛКИ И ОСОБЕННОСТИ ===== */
.event-links {
  margin: 2rem 0;
}

.links-title, .features-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-light);
  margin-bottom: 1rem;
}

.links-container {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.event-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  color: var(--text-light);
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.event-link:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.feature-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.feature-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--accent-green), #45a049);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
  flex-shrink: 0;
}

.feature-content {
  flex: 1;
}

.feature-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

.feature-description {
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.5;
}

/* ===== ФОТОГРАФИИ ===== */
.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 0.75rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
}

.photo-item:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 1rem;
  font-size: 0.9rem;
}

/* ===== ПОКУПКИ ===== */
.purchases-summary {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.purchase-stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  font-weight: 600;
  color: var(--text-light);
}

.purchase-stat i {
  color: var(--accent-orange);
}

.purchases-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.purchase-card {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.purchase-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.purchase-image {
  width: 80px;
  height: 80px;
  border-radius: 0.5rem;
  overflow: hidden;
  flex-shrink: 0;
}

.purchase-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.purchase-info {
  flex: 1;
}

.purchase-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

.purchase-description {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.purchase-details {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
}

.purchase-vendor, .purchase-category {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-muted);
}

.purchase-price {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--accent-orange);
}

/* ===== ВПЕЧАТЛЕНИЯ ===== */
.impressions-content {
  max-width: 800px;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
}

.rating-stars {
  display: flex;
  gap: 0.25rem;
}

.rating-stars i {
  font-size: 1.5rem;
  color: rgba(255, 193, 7, 0.3);
  transition: color 0.3s ease;
}

.rating-stars i.active {
  color: #ffc107;
}

.rating-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-light);
}

.review-text {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--text-light);
}

/* ===== МНОЖЕСТВЕННЫЕ ОЦЕНКИ ===== */
.multi-rating-section {
  margin-bottom: 2rem;
}

.rating-section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-light);
  margin: 0 0 1.5rem 0;
}

.rating-categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.rating-cat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1rem;
  text-align: center;
}

.cat-label {
  display: block;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.cat-stars {
  display: flex;
  justify-content: center;
  gap: 0.15rem;
  margin-bottom: 0.5rem;
}

.cat-stars i {
  font-size: 0.9rem;
  color: rgba(255, 193, 7, 0.3);
}

.cat-stars i.active {
  color: #ffc107;
}

.cat-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--accent-orange);
}

.overall-rating-display {
  text-align: right;
  color: var(--text-muted);
  font-size: 0.95rem;
}

.overall-rating-display strong {
  font-size: 1.1rem;
  color: var(--accent-orange);
}

/* ===== ПЛЮСЫ И МИНУСЫ ===== */
.pros-cons-section {
  margin-bottom: 2rem;
}

.opinion-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-light);
  margin: 0 0 1.5rem 0;
}

.pros-cons-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.pros-block,
.cons-block {
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.pros-block {
  background: rgba(76, 175, 80, 0.1);
  border-color: rgba(76, 175, 80, 0.3);
}

.cons-block {
  background: rgba(244, 67, 54, 0.1);
  border-color: rgba(244, 67, 54, 0.3);
}

.pros-title,
.cons-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.pros-title {
  color: #4caf50;
}

.cons-title {
  color: #f44336;
}

.pros-list,
.cons-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.pros-list li,
.cons-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  color: var(--text-light);
  line-height: 1.5;
}

.pros-list li:last-child,
.cons-list li:last-child {
  margin-bottom: 0;
}

.pros-list li i {
  color: #4caf50;
  margin-top: 0.2rem;
}

.cons-list li i {
  color: #f44336;
  margin-top: 0.2rem;
}

@media (max-width: 768px) {
  .pros-cons-columns {
    grid-template-columns: 1fr;
  }

  .rating-categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ===== ЗАКЛЮЧЕНИЕ ===== */
.conclusion-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.conclusion-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-light);
  margin-bottom: 1rem;
}

.conclusion-text {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--text-light);
}

/* ===== СВОДКА ПОКУПОК ===== */
.purchases-text-summary {
  margin: 1.5rem 0;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.summary-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-light);
  margin-bottom: 0.75rem;
}

.summary-text {
  color: var(--text-muted);
  line-height: 1.6;
}

/* ===== НАВИГАЦИЯ ===== */
.navigation-section {
  margin-top: 4rem;
  text-align: center;
}

.all-events-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, var(--accent-orange), var(--accent-green));
  color: white;
  text-decoration: none;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 123, 37, 0.3);
}

.all-events-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 123, 37, 0.4);
}

/* ===== МОДАЛЬНОЕ ОКНО ФОТО ===== */
.photo-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.photo-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  text-align: center;
}

.photo-modal-close {
  position: absolute;
  top: -50px;
  right: 0;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.photo-modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-photo {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 0.5rem;
}

.modal-photo-caption {
  color: white;
  margin-top: 1rem;
  font-size: 1.1rem;
}

/* ===== АДАПТИВНОСТЬ ===== */
@media (max-width: 768px) {
  .event-title {
    font-size: 2.5rem;
  }
  
  .event-subtitle {
    font-size: 1.1rem;
  }
  
  .nav-tabs {
    justify-content: flex-start;
  }
  
  .features-grid,
  .purchases-list {
    grid-template-columns: 1fr;
  }
  
  .photos-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
  
  .purchases-summary {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>