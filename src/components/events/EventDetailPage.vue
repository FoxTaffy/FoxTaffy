<template>
  <div class="event-detail-page">
    <!-- Загрузка -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Загружаем информацию о мероприятии...</p>
    </div>
    
    <!-- Ошибка -->
    <div v-else-if="error" class="error-container">
      <i class="fas fa-exclamation-triangle"></i>
      <h2>Ошибка загрузки</h2>
      <p>{{ error }}</p>
      <div class="error-actions">
        <button @click="loadEvent" class="retry-btn">
          <i class="fas fa-redo"></i>
          Попробовать снова
        </button>
        <router-link to="/events" class="back-btn">
          <i class="fas fa-arrow-left"></i>
          Все мероприятия
        </router-link>
      </div>
    </div>
    
    <!-- Мероприятие не найдено -->
    <div v-else-if="!event" class="not-found-container">
      <i class="fas fa-calendar-times"></i>
      <h2>Мероприятие не найдено</h2>
      <p>Возможно, мероприятие было удалено или перемещено.</p>
      <div class="not-found-actions">
        <router-link to="/events" class="back-btn">
          <i class="fas fa-arrow-left"></i>
          Все мероприятия
        </router-link>
        <router-link to="/" class="home-btn">
          <i class="fas fa-home"></i>
          Главная
        </router-link>
      </div>
    </div>
    
    <!-- Контент мероприятия -->
    <div v-else class="event-content">
      <!-- Героическая секция -->
      <div class="event-hero">
        <div class="hero-overlay"></div>
        <div class="hero-image" :style="{ backgroundImage: getBannerImage(event.banner_url) }"></div>
        <div class="hero-content">
          <div class="hero-nav">
            <router-link to="/" class="back-button">
              <i class="fas fa-arrow-left"></i>
              <span>Назад на главную</span>
            </router-link>
            <router-link to="/events" class="events-button">
              <i class="fas fa-calendar-alt"></i>
              <span>Все мероприятия</span>
            </router-link>
          </div>
          
          <div class="event-badges">
            <span class="event-status" :class="getStatusClass(event.attendance_status)">
              {{ getStatusText(event.attendance_status) }}
            </span>
            <span v-if="event.my_rating" class="event-badge rating">
              <i class="fas fa-star"></i>
              {{ event.my_rating }}/5
            </span>
          </div>
          
          <h1 class="event-title">{{ event.name }}</h1>
          <div v-if="event.subtitle" class="event-subtitle">{{ event.subtitle }}</div>
        </div>
      </div>
      
      <div class="container">
        <!-- Краткая информация -->
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
              <div v-if="event.city && event.city !== event.location" class="info-extra">{{ event.city }}</div>
            </div>
          </div>
          
          <div v-if="event.expected_visitors" class="event-info-card">
            <div class="info-icon"><i class="fas fa-users"></i></div>
            <div class="info-content">
              <div class="info-label">Участников</div>
              <div class="info-value">{{ event.expected_visitors }}+</div>
            </div>
          </div>
          
          <div v-if="event.total_spent > 0" class="event-info-card">
            <div class="info-icon"><i class="fas fa-shopping-bag"></i></div>
            <div class="info-content">
              <div class="info-label">Потрачено</div>
              <div class="info-value">{{ formatMoney(event.total_spent) }}</div>
            </div>
          </div>
        </div>
        
        <!-- Описание -->
        <div v-if="event.description" class="event-description-section">
          <h2 class="section-title">О мероприятии</h2>
          <div class="event-description" v-html="event.description"></div>
        </div>
        
        <!-- Фотографии -->
        <div v-if="event.photos_count > 0" class="photos-section">
          <h2 class="section-title">
            Фотографии
            <span class="photos-count">({{ event.photos_count }})</span>
          </h2>
          <div class="photos-grid">
            <!-- Заглушка для фотографий -->
            <div class="photo-placeholder" v-for="n in Math.min(event.photos_count, 6)" :key="n">
              <i class="fas fa-image"></i>
              <span>Фото {{ n }}</span>
            </div>
          </div>
        </div>
        
        <!-- Покупки -->
        <div v-if="event.purchases_count > 0" class="purchases-section">
          <h2 class="section-title">
            Покупки
            <span class="purchases-count">({{ event.purchases_count }})</span>
          </h2>
          <div class="purchases-summary">
            <div class="purchase-stat">
              <i class="fas fa-shopping-bag"></i>
              <span>{{ event.purchases_count }} покупок</span>
            </div>
            <div class="purchase-stat">
              <i class="fas fa-ruble-sign"></i>
              <span>{{ formatMoney(event.total_spent) }} потрачено</span>
            </div>
          </div>
        </div>
        
        <!-- Отзыв -->
        <div v-if="event.my_review" class="review-section">
          <h2 class="section-title">Мои впечатления</h2>
          <div class="review-content">
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
            <div class="review-text" v-html="event.my_review"></div>
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
  </div>
</template>

<script>
import { imageHelpers } from '@/utils/imageUtils'
import { furryApi } from '@/config/supabase.js'

export default {
  name: 'EventDetailPage',
  data() {
    return {
      event: null,
      loading: false,
      error: null
    }
  },
  
  async mounted() {
    await this.loadEvent()
  },
  
  watch: {
    '$route'() {
      this.loadEvent()
    }
  },
  
  methods: {
    async loadEvent() {
      const slug = this.$route.params.slug
      if (!slug) {
        this.error = 'Не указан идентификатор мероприятия'
        return
      }
      
      this.loading = true
      this.error = null
      this.event = null
      
      try {
        console.log('🎪 EventDetail: Загружаем мероприятие:', slug)
        
        // Проверяем статические маршруты сначала
        const staticEvents = {
          'furmarket': { 
            name: 'FurMarket', 
            slug: 'furmarket',
            event_date: '2024-06-15',
            location: 'ЛенЭкспо',
            city: 'Санкт-Петербург',
            attendance_status: 'attended',
            my_rating: 4,
            photos_count: 25,
            total_spent: 3500,
            description: 'Маркет фурри-товаров в Санкт-Петербурге'
          },
          'skyfurrburg': { 
            name: 'SkyFurrBurg', 
            slug: 'SkyFurrBurg',
            event_date: '2024-09-20',
            location: 'ТРК "Континент"',
            city: 'Санкт-Петербург',
            attendance_status: 'attended',
            my_rating: 5,
            photos_count: 33,
            total_spent: 5200,
            description: 'Конвент в Санкт-Петербурге'
          },
          'furrmarket4': { 
            name: 'FurrMarket 4', 
            slug: 'FurrMarket4',
            event_date: '2024-04-20',
            location: 'ЛенЭкспо',
            city: 'Санкт-Петербург',
            attendance_status: 'attended',
            my_rating: 4,
            photos_count: 18,
            total_spent: 2800,
            description: 'Четвертый FurrMarket в Санкт-Петербурге'
          },
          'tourfurr': { 
            name: 'TourFurr', 
            slug: 'TourFurr',
            event_date: '2024-05-15',
            location: 'Центральный парк',
            city: 'Москва',
            attendance_status: 'attended',
            my_rating: 3,
            photos_count: 12,
            total_spent: 1200,
            description: 'Фурри-пикник в Москве'
          },
          'aff5': { 
            name: 'Any Furry Fest V', 
            slug: 'aff5',
            event_date: '2024-08-17',
            location: 'Парк-отель "Воздвиженское"',
            city: 'Москва',
            attendance_status: 'attended',
            my_rating: 5,
            photos_count: 47,
            total_spent: 8500,
            purchases_count: 12,
            description: 'Пятый Any Furry Fest - крупнейший российский фурри-конвент'
          },
          'sillycon': { 
            name: 'Тупикон', 
            slug: 'sillycon',
            event_date: '2024-03-10',
            location: 'Дом культуры',
            city: 'Москва',
            attendance_status: 'attended',
            my_rating: 4,
            photos_count: 15,
            total_spent: 2000,
            description: 'Небольшой дружественный конвент'
          },
          'fff': { 
            name: 'FFF', 
            slug: 'fff',
            event_date: '2024-07-05',
            location: 'Загородный клуб',
            city: 'Московская область',
            attendance_status: 'attended',
            my_rating: 4,
            photos_count: 22,
            total_spent: 3200,
            description: 'Летний фурри-фест на природе'
          },
          'foxwood': { 
            name: 'FoxWood 2000s', 
            slug: 'foxwood',
            event_date: '2024-10-12',
            location: 'База отдыха "Лесная"',
            city: 'Подмосковье',
            attendance_status: 'attended',
            my_rating: 5,
            photos_count: 38,
            total_spent: 4500,
            description: 'Ретро-мероприятие в стиле 2000-х'
          }
        }
        
        const staticEvent = staticEvents[slug.toLowerCase()]
        if (staticEvent) {
          // Используем статические данные
          this.event = {
            id: staticEvent.slug,
            ...staticEvent,
            expected_visitors: 200
          }
          console.log('✅ EventDetail: Статическое мероприятие загружено:', this.event.name)
          return
        }
        
        // Попытка загрузить из API
        if (furryApi.getEventBySlug) {
          this.event = await furryApi.getEventBySlug(slug)
        }
        
        if (!this.event) {
          this.error = `Мероприятие "${slug}" не найдено`
        } else {
          console.log('✅ EventDetail: Мероприятие из API загружено:', this.event.name)
        }
        
      } catch (error) {
        console.error('❌ EventDetail: Ошибка загрузки мероприятия:', error)
        this.error = error.message || 'Ошибка загрузки мероприятия'
      } finally {
        this.loading = false
      }
    },
    
    // Форматирование
    getBannerImage(bannerUrl) {
      return imageHelpers.getEventBannerLarge(bannerUrl)
    },
    
    getStatusText(status) {
      const statusMap = {
        'planning': 'Планирую посетить',
        'registered': 'Зарегистрирован',
        'attended': 'Посетил',
        'missed': 'Пропустил',
        'cancelled': 'Отменено'
      }
      return statusMap[status] || 'Планирую посетить'
    },
    
    getStatusClass(status) {
      return {
        'attended': 'completed',
        'registered': 'upcoming',
        'planning': 'upcoming'
      }[status] || 'upcoming'
    },
    
    formatEventDate(dateString) {
      if (!dateString) return 'Дата не указана'
      return new Date(dateString).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
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
.event-detail-page {
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* ===== СОСТОЯНИЯ ЗАГРУЗКИ ===== */
.loading-container, .error-container, .not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
  text-align: center;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 123, 37, 0.2);
  border-top: 4px solid var(--accent-orange);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container i, .not-found-container i {
  font-size: 4rem;
  color: var(--accent-orange);
  margin-bottom: 1rem;
}

.error-actions, .not-found-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.retry-btn, .back-btn, .home-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.retry-btn {
  background: var(--accent-orange);
  color: white;
  border: none;
  cursor: pointer;
}

.back-btn, .home-btn {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-light);
}

.retry-btn:hover, .back-btn:hover, .home-btn:hover {
  transform: translateY(-2px);
}

/* ===== ГЕРОИЧЕСКАЯ СЕКЦИЯ ===== */
.event-hero {
  position: relative;
  height: 60vh;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(26, 26, 26, 0.8) 100%
  );
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
  max-width: 800px;
  padding: 2rem;
}

.hero-nav {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.back-button, .events-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 0.5rem;
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.back-button:hover, .events-button:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: translateY(-2px);
}

.event-badges {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.event-status, .event-badge {
  padding: 0.5rem 1rem;
  border-radius: 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.event-status {
  background: rgba(255, 123, 37, 0.9);
}

.event-status.completed {
  background: rgba(76, 175, 80, 0.9);
}

.event-badge.rating {
  background: rgba(255, 123, 37, 0.9);
}

.event-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.event-subtitle {
  font-size: 1.3rem;
  opacity: 0.9;
  font-weight: 300;
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

/* ===== СЕКЦИИ КОНТЕНТА ===== */
.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.photos-count, .purchases-count {
  font-size: 1rem;
  color: var(--text-muted);
  font-weight: 400;
}

.event-description-section, .photos-section, .purchases-section, .review-section {
  margin: 4rem 0;
}

.event-description {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--text-light);
}

/* ===== ФОТОГРАФИИ ===== */
.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.photo-placeholder {
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--text-muted);
  font-size: 1.2rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.photo-placeholder:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: scale(1.02);
}

.photo-placeholder i {
  font-size: 2rem;
  color: var(--accent-orange);
}

/* ===== ПОКУПКИ ===== */
.purchases-summary {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.purchase-stat {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  font-size: 1.1rem;
  font-weight: 500;
}

.purchase-stat i {
  color: var(--accent-orange);
  font-size: 1.3rem;
}

/* ===== ОТЗЫВ ===== */
.review-content {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 2rem;
  border-left: 4px solid var(--accent-orange);
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.rating-stars {
  display: flex;
  gap: 0.25rem;
}

.rating-stars i {
  color: #444;
  font-size: 1.2rem;
}

.rating-stars i.active {
  color: #ffd700;
}

.rating-text {
  font-weight: 600;
  color: var(--accent-orange);
  font-size: 1.1rem;
}

.review-text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--text-light);
}

/* ===== НАВИГАЦИЯ ===== */
.navigation-section {
  margin: 4rem 0;
  text-align: center;
}

.all-events-btn {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 2rem;
  background: linear-gradient(135deg, var(--accent-orange), #e6691f);
  color: white;
  text-decoration: none;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 123, 37, 0.3);
}

.all-events-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 123, 37, 0.4);
}

/* ===== АДАПТИВНОСТЬ ===== */
@media (max-width: 768px) {
  .event-hero {
    height: 50vh;
    min-height: 300px;
  }
  
  .hero-content {
    padding: 1rem;
  }
  
  .event-title {
    font-size: 2rem;
  }
  
  .event-subtitle {
    font-size: 1.1rem;
  }
  
  .hero-nav {
    justify-content: center;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .event-info-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .hero-image {
    background-attachment: scroll;
  }
  
  .event-title {
    font-size: 1.5rem;
  }
  
  .event-subtitle {
    font-size: 1rem;
  }
  
  .back-button, .events-button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
  
  .photos-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .purchases-summary {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>