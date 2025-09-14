<template>
    <div class="event-detail-page">
      <!-- Загрузка -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Загружаем информацию о мероприятии...</p>
      </div>
  
      <!-- Ошибка -->
      <div v-else-if="error" class="error-container">
        <div class="error-content">
          <i class="fas fa-exclamation-triangle"></i>
          <h2>Мероприятие не найдено</h2>
          <p>{{ error }}</p>
          <router-link to="/events" class="back-link">
            <i class="fas fa-arrow-left"></i>
            Вернуться к списку мероприятий
          </router-link>
        </div>
      </div>
  
      <!-- Детали мероприятия -->
      <div v-else-if="event" class="event-content">
        <!-- Хедер с баннером -->
        <div class="event-header" :style="{ backgroundImage: getBannerImage(event.banner_url) }">
          <div class="header-overlay"></div>
          <div class="container">
            <div class="header-content">
              <!-- Навигация назад -->
              <router-link to="/events" class="back-button">
                <i class="fas fa-arrow-left"></i>
                <span>Все мероприятия</span>
              </router-link>
  
              <!-- Основная информация -->
              <div class="event-main-info">
                <div class="event-badges">
                  <span class="event-status" :class="getEventStatusClass(event)">
                    {{ getStatusText(event.computed_status || event.status) }}
                  </span>
                  <span v-if="event.is_featured" class="event-badge featured">
                    ⭐ Избранное
                  </span>
                  <span v-if="event.my_rating" class="event-badge rating">
                    {{ '★'.repeat(event.my_rating) }} ({{ event.my_rating }}/5)
                  </span>
                </div>
  
                <h1 class="event-title">{{ event.name }}</h1>
                
                <div class="event-meta-main">
                  <div class="meta-item">
                    <i class="fas fa-calendar"></i>
                    <div>
                      <div class="meta-primary">{{ formatEventDate(event.event_date) }}</div>
                      <div class="meta-secondary">{{ formatEventTime(event.event_date) }}</div>
                    </div>
                  </div>
                  <div class="meta-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <div>
                      <div class="meta-primary">{{ event.location }}</div>
                      <div class="meta-secondary">{{ event.city || event.country }}</div>
                    </div>
                  </div>
                  <div v-if="event.attendees_count" class="meta-item">
                    <i class="fas fa-users"></i>
                    <div>
                      <div class="meta-primary">{{ event.attendees_count }} участников</div>
                      <div class="meta-secondary">{{ getEventTypeText(event.event_type) }}</div>
                    </div>
                  </div>
                </div>
  
                <!-- Прогресс для предстоящих событий -->
                <div v-if="isUpcoming(event) && event.preparation_progress < 100" class="preparation-progress">
                  <div class="progress-header">
                    <span>Подготовка к событию</span>
                    <span>{{ Math.round(event.preparation_progress) }}%</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: event.preparation_progress + '%' }"></div>
                  </div>
                  <div class="progress-footer">
                    <span>{{ getDaysUntil(event.event_date) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Навигация по разделам -->
        <div class="event-navigation">
          <div class="container">
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
                v-if="event.photos && event.photos.length > 0"
                href="#gallery" 
                class="nav-tab" 
                :class="{ 'active': activeTab === 'gallery' }" 
                @click.prevent="activeTab = 'gallery'"
              >
                <i class="fas fa-images"></i>
                <span>Фотографии ({{ event.photos.length }})</span>
              </a>
              
              <a 
                v-if="event.purchases && event.purchases.length > 0"
                href="#purchases" 
                class="nav-tab" 
                :class="{ 'active': activeTab === 'purchases' }" 
                @click.prevent="activeTab = 'purchases'"
              >
                <i class="fas fa-shopping-bag"></i>
                <span>Покупки ({{ event.purchases.length }})</span>
              </a>
              
              <a 
                v-if="event.my_review || event.highlights"
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
        </div>
  
        <!-- Контент разделов -->
        <div class="event-sections">
          <div class="container">
            <!-- Обзор -->
            <div class="event-section" id="overview" v-show="activeTab === 'overview'">
              <h2 class="section-title">О мероприятии</h2>
              
              <div class="section-content">
                <div class="description-block">
                  <p class="event-description">{{ event.description || event.short_description }}</p>
                </div>
  
                <!-- Официальные ресурсы -->
                <div v-if="event.links && event.links.length > 0" class="links-section">
                  <h3 class="subsection-title">Официальные ресурсы</h3>
                  <div class="links-grid">
                    <a 
                      v-for="link in event.links" 
                      :key="link.id"
                      :href="link.url" 
                      target="_blank" 
                      class="event-link"
                    >
                      <i :class="link.icon_class || getDefaultLinkIcon(link.link_type)"></i>
                      <span>{{ link.title }}</span>
                      <i class="fas fa-external-link-alt link-external"></i>
                    </a>
                  </div>
                </div>
  
                <!-- Особенности мероприятия -->
                <div v-if="event.features && event.features.length > 0" class="features-section">
                  <h3 class="subsection-title">Особенности</h3>
                  <div class="features-grid">
                    <div v-for="feature in event.features" :key="feature.id" class="feature-card">
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
  
                <!-- Быстрые факты -->
                <div class="quick-facts">
                  <h3 class="subsection-title">Информация</h3>
                  <div class="facts-grid">
                    <div class="fact-item">
                      <i class="fas fa-calendar-alt"></i>
                      <div>
                        <div class="fact-label">Дата проведения</div>
                        <div class="fact-value">{{ formatEventDate(event.event_date) }}</div>
                      </div>
                    </div>
                    <div v-if="event.announced_date" class="fact-item">
                      <i class="fas fa-bullhorn"></i>
                      <div>
                        <div class="fact-label">Дата анонса</div>
                        <div class="fact-value">{{ formatEventDate(event.announced_date) }}</div>
                      </div>
                    </div>
                    <div class="fact-item">
                      <i class="fas fa-user-check"></i>
                      <div>
                        <div class="fact-label">Статус участия</div>
                        <div class="fact-value">{{ getAttendanceStatusText(event.attendance_status) }}</div>
                      </div>
                    </div>
                    <div v-if="event.total_spent > 0" class="fact-item">
                      <i class="fas fa-ruble-sign"></i>
                      <div>
                        <div class="fact-label">Потрачено</div>
                        <div class="fact-value">{{ formatMoney(event.total_spent) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            <!-- Галерея фотографий -->
            <div class="event-section" id="gallery" v-show="activeTab === 'gallery'">
              <h2 class="section-title">Фотографии с мероприятия</h2>
              
              <div v-if="event.photos && event.photos.length > 0" class="photos-grid">
                <div 
                  v-for="(photo, index) in event.photos" 
                  :key="photo.id"
                  class="photo-item"
                  @click="openPhotoModal(index)"
                >
                  <img 
                    :src="photo.thumbnail_url || photo.image_url" 
                    :alt="photo.caption || 'Фото с мероприятия'"
                    loading="lazy"
                  >
                  <div class="photo-overlay">
                    <i class="fas fa-search-plus"></i>
                  </div>
                  <div v-if="photo.caption" class="photo-caption">
                    {{ photo.caption }}
                  </div>
                </div>
              </div>
  
              <div v-else class="empty-section">
                <i class="fas fa-images"></i>
                <p>Фотографии с мероприятия пока не добавлены</p>
              </div>
            </div>
  
            <!-- Покупки -->
            <div class="event-section" id="purchases" v-show="activeTab === 'purchases'">
              <h2 class="section-title">Покупки на мероприятии</h2>
              
              <div v-if="event.purchases && event.purchases.length > 0" class="purchases-section">
                <!-- Статистика покупок -->
                <div class="purchases-stats">
                  <div class="stat-item">
                    <i class="fas fa-shopping-bag"></i>
                    <div>
                      <div class="stat-number">{{ event.purchases.length }}</div>
                      <div class="stat-label">покупок</div>
                    </div>
                  </div>
                  <div class="stat-item">
                    <i class="fas fa-ruble-sign"></i>
                    <div>
                      <div class="stat-number">{{ formatMoney(totalPurchasesAmount) }}</div>
                      <div class="stat-label">потрачено</div>
                    </div>
                  </div>
                  <div v-if="averagePurchasePrice > 0" class="stat-item">
                    <i class="fas fa-chart-line"></i>
                    <div>
                      <div class="stat-number">{{ formatMoney(averagePurchasePrice) }}</div>
                      <div class="stat-label">средний чек</div>
                    </div>
                  </div>
                </div>
  
                <!-- Список покупок -->
                <div class="purchases-grid">
                  <div v-for="purchase in event.purchases" :key="purchase.id" class="purchase-card">
                    <div v-if="purchase.image_url" class="purchase-image">
                      <img :src="purchase.image_url" :alt="purchase.item_name" loading="lazy">
                    </div>
                    <div class="purchase-content">
                      <h4 class="purchase-name">{{ purchase.item_name }}</h4>
                      <p v-if="purchase.description" class="purchase-description">{{ purchase.description }}</p>
                      <div class="purchase-meta">
                        <div v-if="purchase.vendor_name" class="purchase-vendor">
                          <i class="fas fa-store"></i>
                          <span>{{ purchase.vendor_name }}</span>
                        </div>
                        <div v-if="purchase.category" class="purchase-category">
                          <i :class="getPurchaseCategoryIcon(purchase.category)"></i>
                          <span>{{ getPurchaseCategoryText(purchase.category) }}</span>
                        </div>
                      </div>
                      <div class="purchase-footer">
                        <div class="purchase-price">{{ formatMoney(purchase.price) }}</div>
                        <div class="purchase-date">{{ formatPurchaseDate(purchase.purchased_at) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  
              <div v-else class="empty-section">
                <i class="fas fa-shopping-bag"></i>
                <p>Покупки на мероприятии не зафиксированы</p>
              </div>
            </div>
  
            <!-- Впечатления -->
            <div class="event-section" id="impressions" v-show="activeTab === 'impressions'">
              <h2 class="section-title">Мои впечатления</h2>
              
              <div class="impressions-content">
                <!-- Рейтинг -->
                <div v-if="event.my_rating" class="rating-block">
                  <h3 class="subsection-title">Моя оценка</h3>
                  <div class="rating-display">
                    <div class="stars">
                      <i 
                        v-for="n in 5" 
                        :key="n"
                        class="fas fa-star"
                        :class="{ 'filled': n <= event.my_rating }"
                      ></i>
                    </div>
                    <span class="rating-text">{{ event.my_rating }} из 5</span>
                  </div>
                </div>
  
                <!-- Ключевые моменты -->
                <div v-if="event.highlights && event.highlights.length > 0" class="highlights-block">
                  <h3 class="subsection-title">Ключевые моменты</h3>
                  <div class="highlights-list">
                    <div v-for="highlight in event.highlights" :key="highlight" class="highlight-item">
                      <i class="fas fa-star"></i>
                      <span>{{ highlight }}</span>
                    </div>
                  </div>
                </div>
  
                <!-- Подробный отзыв -->
                <div v-if="event.my_review" class="review-block">
                  <h3 class="subsection-title">Подробный отзыв</h3>
                  <div class="review-content">
                    <p>{{ event.my_review }}</p>
                  </div>
                </div>
  
                <!-- Если нет впечатлений -->
                <div v-if="!event.my_rating && !event.highlights && !event.my_review" class="empty-section">
                  <i class="fas fa-heart"></i>
                  <p>Впечатления от мероприятия пока не добавлены</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Модальное окно для фотографий -->
      <div v-if="showPhotoModal" class="photo-modal-overlay" @click="closePhotoModal">
        <div class="photo-modal-content" @click.stop>
          <button @click="closePhotoModal" class="modal-close-btn">
            <i class="fas fa-times"></i>
          </button>
          
          <div class="photo-modal-nav">
            <button 
              @click="previousPhoto" 
              :disabled="currentPhotoIndex === 0"
              class="nav-btn"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <button 
              @click="nextPhoto" 
              :disabled="currentPhotoIndex === event.photos.length - 1"
              class="nav-btn"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
  
          <div class="photo-modal-image">
            <img 
              :src="event.photos[currentPhotoIndex]?.image_url" 
              :alt="event.photos[currentPhotoIndex]?.caption || 'Фото с мероприятия'"
            >
          </div>
  
          <div v-if="event.photos[currentPhotoIndex]?.caption" class="photo-modal-caption">
            {{ event.photos[currentPhotoIndex].caption }}
          </div>
  
          <div class="photo-modal-counter">
            {{ currentPhotoIndex + 1 }} из {{ event.photos.length }}
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { furryApi } from '../../config/supabase.js'
  
  export default {
    name: 'EventDetailPage',
    
    data() {
      return {
        // Данные
        event: null,
        
        // Состояние
        loading: true,
        error: null,
        
        // Навигация
        activeTab: 'overview',
        
        // Модальное окно фото
        showPhotoModal: false,
        currentPhotoIndex: 0
      }
    },
    
    computed: {
      totalPurchasesAmount() {
        if (!this.event?.purchases) return 0
        return this.event.purchases.reduce((sum, p) => sum + (p.price || 0), 0)
      },
      
      averagePurchasePrice() {
        if (!this.event?.purchases || this.event.purchases.length === 0) return 0
        return this.totalPurchasesAmount / this.event.purchases.length
      }
    },
    
    async mounted() {
      await this.loadEvent()
    },
    
    methods: {
      async loadEvent() {
        this.loading = true
        this.error = null
        
        try {
          const slug = this.$route.params.slug
          this.event = await furryApi.getEventBySlug(slug)
          
          // Устанавливаем заголовок страницы
          document.title = `${this.event.name} | FoxTaffy.fun`
          
          console.log('✅ Мероприятие загружено:', this.event)
          
        } catch (error) {
          console.error('❌ Ошибка загрузки мероприятия:', error)
          this.error = error.message
        } finally {
          this.loading = false
        }
      },
      
      // Утилиты для дат и статусов
      isUpcoming(event) {
        return new Date(event.event_date) > new Date()
      },
      
      getEventStatusClass(event) {
        if (this.isUpcoming(event)) return 'upcoming'
        return 'completed'
      },
      
      getStatusText(status) {
        const statusMap = {
          'upcoming': 'Предстоящее',
          'ongoing': 'Идёт сейчас',
          'completed': 'Завершено',
          'cancelled': 'Отменено'
        }
        return statusMap[status] || status
      },
      
      getAttendanceStatusText(status) {
        const statusMap = {
          'planning': 'Планирую посетить',
          'registered': 'Зарегистрирован',
          'attended': 'Посетил',
          'missed': 'Пропустил',
          'cancelled': 'Отменено'
        }
        return statusMap[status] || status
      },
      
      getEventTypeText(type) {
        const typeTexts = {
          'convention': 'Конвент',
          'meeting': 'Встреча',
          'party': 'Вечеринка',
          'workshop': 'Мастер-класс',
          'market': 'Маркет',
          'other': 'Мероприятие'
        }
        return typeTexts[type] || type
      },
      
      getDaysUntil(dateString) {
        const eventDate = new Date(dateString)
        const now = new Date()
        const diffTime = eventDate - now
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays < 0) return "Событие прошло"
        if (diffDays === 0) return "Сегодня"
        if (diffDays === 1) return "Завтра"
        if (diffDays < 7) return `Через ${diffDays} дня`
        if (diffDays < 30) return `Через ${Math.ceil(diffDays / 7)} недель`
        return `Через ${Math.ceil(diffDays / 30)} месяцев`
      },
      
      // Модальное окно фотографий
      openPhotoModal(index) {
        this.currentPhotoIndex = index
        this.showPhotoModal = true
        document.body.style.overflow = 'hidden'
      },
      
      closePhotoModal() {
        this.showPhotoModal = false
        document.body.style.overflow = ''
      },
      
      previousPhoto() {
        if (this.currentPhotoIndex > 0) {
          this.currentPhotoIndex--
        }
      },
      
      nextPhoto() {
        if (this.currentPhotoIndex < this.event.photos.length - 1) {
          this.currentPhotoIndex++
        }
      },
      
      // Иконки и форматирование
      getDefaultLinkIcon(linkType) {
        const iconMap = {
          'website': 'fas fa-globe',
          'telegram': 'fab fa-telegram',
          'vk': 'fab fa-vk',
          'discord': 'fab fa-discord',
          'youtube': 'fab fa-youtube',
          'twitter': 'fab fa-twitter',
          'instagram': 'fab fa-instagram',
          'furaffinity': 'fas fa-paw',
          'registration': 'fas fa-ticket-alt',
          'other': 'fas fa-link'
        }
        return iconMap[linkType] || 'fas fa-link'
      },
      
      getPurchaseCategoryIcon(category) {
        const iconMap = {
          'art': 'fas fa-palette',
          'badge': 'fas fa-id-badge',
          'fursuit': 'fas fa-mask',
          'accessory': 'fas fa-gem',
          'book': 'fas fa-book',
          'toy': 'fas fa-toy-brick',
          'food': 'fas fa-utensils',
          'merch': 'fas fa-tshirt',
          'other': 'fas fa-shopping-bag'
        }
        return iconMap[category] || 'fas fa-shopping-bag'
      },
      
      getPurchaseCategoryText(category) {
        const textMap = {
          'art': 'Арт',
          'badge': 'Бейдж',
          'fursuit': 'Фурсьют',
          'accessory': 'Аксессуар',
          'book': 'Книга',
          'toy': 'Игрушка',
          'food': 'Еда',
          'merch': 'Мерч',
          'other': 'Другое'
        }
        return textMap[category] || category
      },
      
      // Форматирование
      getBannerImage(bannerUrl) {
        if (!bannerUrl) {
          return 'url(https://via.placeholder.com/1200x400/1a1a1a/ff7b25?text=🎪)'
        }
        return `url(${bannerUrl})`
      },
      
      formatEventDate(dateString) {
        return new Date(dateString).toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        })
      },
      
      formatEventTime(dateString) {
        return new Date(dateString).toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit'
        })
      },
      
      formatPurchaseDate(dateString) {
        return new Date(dateString).toLocaleDateString('ru-RU', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      },
      
      formatMoney(amount) {
        return new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          minimumFractionDigits: 0
        }).format(amount)
      }
    },
    
    // Обработка клавиш для модального окна
    mounted() {
      document.addEventListener('keydown', this.handleKeydown)
    },
    
    beforeUnmount() {
      document.removeEventListener('keydown', this.handleKeydown)
      document.body.style.overflow = ''
    },
    
    methods: {
      handleKeydown(event) {
        if (!this.showPhotoModal) return
        
        switch (event.key) {
          case 'Escape':
            this.closePhotoModal()
            break
          case 'ArrowLeft':
            this.previousPhoto()
            break
          case 'ArrowRight':
            this.nextPhoto()
            break
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .event-detail-page {
    min-height: 100vh;
    background: var(--bg-primary);
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  /* Состояния загрузки */
  .loading-container,
  .error-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
    text-align: center;
    color: var(--text-muted);
  }
  
  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255, 123, 37, 0.3);
    border-top: 4px solid var(--accent-orange);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  .error-content i {
    font-size: 3rem;
    color: var(--accent-orange);
    margin-bottom: 1rem;
  }
  
  .error-content h2 {
    color: var(--text-light);
    margin-bottom: 1rem;
  }
  
  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--accent-orange);
    text-decoration: none;
    font-weight: 600;
    margin-top: 1rem;
    transition: all 0.3s ease;
  }
  
  .back-link:hover {
    gap: 0.8rem;
  }
  
  /* Хедер события */
  .event-header {
    position: relative;
    min-height: 60vh;
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    display: flex;
    align-items: flex-end;
    padding-bottom: 3rem;
  }
  
  .header-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.4) 0%,
      rgba(0, 0, 0, 0.6) 50%,
      rgba(0, 0, 0, 0.8) 100%
    );
  }
  
  .header-content {
    position: relative;
    z-index: 2;
    width: 100%;
  }
  
  .back-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    font-weight: 600;
    margin-bottom: 2rem;
    padding: 0.5rem 1rem;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 2rem;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
  }
  
  .back-button:hover {
    color: white;
    background: rgba(0, 0, 0, 0.7);
    gap: 0.8rem;
  }
  
  .event-badges {
    display: flex;
    gap: 0.8rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }
  
  .event-status,
  .event-badge {
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    font-size: 0.9rem;
    font-weight: 600;
    backdrop-filter: blur(10px);
    white-space: nowrap;
  }
  
  .event-status.upcoming {
    background: rgba(255, 123, 37, 0.9);
    color: white;
  }
  
  .event-status.completed {
    background: rgba(76, 175, 80, 0.9);
    color: white;
  }
  
  .event-badge.featured {
    background: rgba(255, 215, 0, 0.9);
    color: #1a1a1a;
  }
  
  .event-badge.rating {
    background: rgba(255, 123, 37, 0.9);
    color: white;
  }
  
  .event-title {
    font-size: 3.5rem;
    font-weight: 800;
    color: white;
    margin-bottom: 1.5rem;
    line-height: 1.2;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }
  
  .event-meta-main {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 1rem;
    backdrop-filter: blur(10px);
  }
  
  .meta-item i {
    color: var(--accent-orange);
    font-size: 1.5rem;
    width: 24px;
  }
  
  .meta-primary {
    color: white;
    font-weight: 600;
    font-size: 1.1rem;
  }
  
  .meta-secondary {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    margin-top: 0.2rem;
  }
  
  .preparation-progress {
    background: rgba(0, 0, 0, 0.5);
    border-radius: 1rem;
    padding: 1.5rem;
    backdrop-filter: blur(10px);
    max-width: 400px;
  }
  
  .progress-header {
    display: flex;
    justify-content: space-between;
    color: white;
    font-weight: 600;
    margin-bottom: 0.8rem;
  }
  
  .progress-bar {
    height: 8px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 0.8rem;
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-orange), var(--accent-green));
    border-radius: 4px;
    transition: width 0.3s ease;
  }
  
  .progress-footer {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
    text-align: center;
  }
  
  /* Навигация */
  .event-navigation {
    background: rgba(26, 26, 26, 0.95);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  
  .nav-tabs {
    display: flex;
    gap: 0.5rem;
    padding: 1rem 0;
    overflow-x: auto;
  }
  
  .nav-tab {
    padding: 0.8rem 1.5rem;
    color: var(--text-muted);
    text-decoration: none;
    border-radius: 0.5rem;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
    font-weight: 600;
  }
  
  .nav-tab:hover {
    color: var(--text-light);
    background: rgba(255, 255, 255, 0.05);
  }
  
  .nav-tab.active {
    color: white;
    background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
  }
  
  /* Разделы контента */
  .event-sections {
    padding: 3rem 0;
  }
  
  .event-section {
    animation: fadeIn 0.5s ease;
  }
  
  .section-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-light);
    margin-bottom: 2rem;
    text-align: center;
  }
  
  .subsection-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-light);
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid var(--accent-orange);
    display: inline-block;
  }
  
  .section-content {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .description-block {
    margin-bottom: 3rem;
  }
  
  .event-description {
    font-size: 1.2rem;
    line-height: 1.8;
    color: var(--text-muted);
    text-align: center;
  }
  
  /* Ссылки */
  .links-section {
    margin-bottom: 3rem;
  }
  
  .links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .event-link {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.8rem;
    text-decoration: none;
    color: var(--text-light);
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .event-link:hover {
    background: rgba(255, 123, 37, 0.1);
    border-color: var(--accent-orange);
    transform: translateY(-2px);
  }
  
  .event-link i:first-child {
    color: var(--accent-orange);
    font-size: 1.3rem;
  }
  
  .link-external {
    margin-left: auto;
    opacity: 0.5;
    font-size: 0.8rem;
  }
  
  /* Особенности */
  .features-section {
    margin-bottom: 3rem;
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
  }
  
  .feature-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba(255, 123, 37, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent-orange);
    font-size: 1.2rem;
    flex-shrink: 0;
  }
  
  .feature-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-light);
    margin-bottom: 0.5rem;
  }
  
  .feature-description {
    color: var(--text-muted);
    line-height: 1.5;
  }
  
  /* Быстрые факты */
  .quick-facts {
    margin-bottom: 3rem;
  }
  
  .facts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .fact-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.8rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .fact-item i {
    color: var(--accent-orange);
    font-size: 1.2rem;
    width: 20px;
  }
  
  .fact-label {
    font-size: 0.85rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .fact-value {
    font-weight: 600;
    color: var(--text-light);
    margin-top: 0.2rem;
  }
  
  /* Галерея фотографий */
  .photos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .photo-item {
    position: relative;
    aspect-ratio: 1;
    border-radius: 1rem;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.3s ease;
  }
  
  .photo-item:hover {
    transform: scale(1.05);
  }
  
  .photo-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .photo-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .photo-item:hover .photo-overlay {
    opacity: 1;
  }
  
  .photo-overlay i {
    color: white;
    font-size: 2rem;
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
  
  /* Покупки */
  .purchases-stats {
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;
    justify-content: center;
  }
  
  .stat-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .stat-item i {
    color: var(--accent-green);
    font-size: 1.5rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-light);
  }
  
  .stat-label {
    font-size: 0.85rem;
    color: var(--text-muted);
  }
  
  .purchases-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .purchase-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 1rem;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: transform 0.3s ease;
  }
  
  .purchase-card:hover {
    transform: translateY(-3px);
  }
  
  .purchase-image {
    height: 150px;
    overflow: hidden;
  }
  
  .purchase-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .purchase-content {
    padding: 1.2rem;
  }
  
  .purchase-name {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-light);
    margin-bottom: 0.5rem;
  }
  
  .purchase-description {
    color: var(--text-muted);
    margin-bottom: 1rem;
    line-height: 1.5;
  }
  
  .purchase-meta {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .purchase-vendor,
  .purchase-category {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-muted);
  }
  
  .purchase-vendor i,
  .purchase-category i {
    color: var(--accent-orange);
  }
  
  .purchase-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .purchase-price {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--accent-green);
  }
  
  .purchase-date {
    font-size: 0.85rem;
    color: var(--text-muted);
  }
  
  /* Впечатления */
  .impressions-content {
    max-width: 700px;
    margin: 0 auto;
  }
  
  .rating-block,
  .highlights-block,
  .review-block {
    margin-bottom: 3rem;
  }
  
  .rating-display {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 1rem;
  }
  
  .stars {
    display: flex;
    gap: 0.3rem;
  }
  
  .stars i {
    font-size: 2rem;
    color: rgba(255, 123, 37, 0.3);
    transition: color 0.3s ease;
  }
  
  .stars i.filled {
    color: var(--accent-orange);
  }
  
  .rating-text {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-light);
  }
  
  .highlights-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .highlight-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.8rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .highlight-item i {
    color: var(--accent-orange);
    font-size: 1.1rem;
  }
  
  .review-content {
    padding: 2rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .review-content p {
    color: var(--text-muted);
    line-height: 1.8;
    font-size: 1.1rem;
  }
  
  /* Пустые состояния */
  .empty-section {
    text-align: center;
    padding: 3rem;
    color: var(--text-muted);
  }
  
  .empty-section i {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  /* Модальное окно фотографий */
  .photo-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 2rem;
  }
  
  .photo-modal-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .modal-close-btn {
    position: absolute;
    top: -3rem;
    right: 0;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    transition: background 0.3s ease;
  }
  
  .modal-close-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  
  .photo-modal-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: -4rem;
    right: -4rem;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
  }
  
  .nav-btn {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    pointer-events: auto;
    transition: all 0.3s ease;
  }
  
  .nav-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
  
  .nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  .photo-modal-image {
    max-width: 100%;
    max-height: 70vh;
  }
  
  .photo-modal-image img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 0.5rem;
  }
  
  .photo-modal-caption {
    margin-top: 1rem;
    color: white;
    text-align: center;
    max-width: 600px;
  }
  
  .photo-modal-counter {
    margin-top: 1rem;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
  }
  
  /* Адаптивность */
  @media (max-width: 768px) {
    .event-title {
      font-size: 2.5rem;
    }
    
    .event-meta-main {
      grid-template-columns: 1fr;
    }
    
    .nav-tabs {
      justify-content: center;
    }
    
    .facts-grid,
    .links-grid,
    .features-grid {
      grid-template-columns: 1fr;
    }
    
    .photos-grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
    
    .purchases-stats {
      flex-direction: column;
      align-items: center;
    }
    
    .purchases-grid {
      grid-template-columns: 1fr;
    }
    
    .photo-modal-nav {
      left: -2rem;
      right: -2rem;
    }
    
    .event-header {
      background-attachment: scroll;
    }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  </style>