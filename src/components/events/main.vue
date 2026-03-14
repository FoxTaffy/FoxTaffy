<template>
  <div class="events-main-page">
    <!-- Шапка страницы -->
    <div class="page-header">
      <div class="header-background" style="background-image: url('/s3/gallery/events/SFB/2025-08-05%2009-21-25.JPG')"></div>
      <div class="header-overlay"></div>
      <div class="container">
        <div class="header-content">
          <div class="header-text">
            <h1 class="page-title">Все мероприятия</h1>
            <p class="page-description">
              Полная коллекция конвентов, встреч и мероприятий, которые я посетил и планирую посетить.
              Здесь вы найдете подробные отчеты, фотографии и мои впечатления от каждого события.
            </p>
          </div>
          
          <!-- Статистика в шапке -->
          <div class="header-stats" v-if="stats.total > 0">
            <div class="stat-card">
              <div class="stat-number">{{ stats.total }}</div>
              <div class="stat-label">Всего</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ stats.completed }}</div>
              <div class="stat-label">Посещено</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ stats.upcoming }}</div>
              <div class="stat-label">Планируется</div>
            </div>
          </div>
        </div>
        
      </div>

      <!-- Кнопка "На главную" в углу -->
      <router-link to="/" class="home-corner-button">
        <i class="fas fa-home"></i>
      </router-link>
    </div>

    <!-- Фильтры и поиск -->
    <div class="filters-section">
      <div class="filters-container">
        <!-- Поиск -->
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск мероприятий..."
            @input="debouncedSearch"
          >
          <button v-if="searchQuery" @click="clearSearch" class="clear-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Фильтры -->
        <div class="filter-tabs">
          <button
            v-for="filter in filters"
            :key="filter.key"
            class="filter-tab"
            :class="{ 'active': activeFilter === filter.key }"
            @click="setFilter(filter.key)"
          >
            <i :class="filter.icon"></i>
            <span>{{ filter.label }}</span>
            <span v-if="filter.count > 0" class="filter-count">({{ filter.count }})</span>
          </button>
        </div>

        <!-- Сортировка -->
        <div class="sort-select">
          <select v-model="sortBy" @change="applySorting">
            <option value="date_desc">Сначала новые</option>
            <option value="date_asc">Сначала старые</option>
            <option value="rating_desc">Лучшие (по рейтингу)</option>
            <option value="name_asc">По названию А-Я</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Основной контент -->
    <div class="main-content">
      <div class="container">
        
        <!-- Загрузка -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Загружаем мероприятия...</p>
          </div>
        </div>

        <!-- Ошибка -->
        <div v-else-if="error" class="error-state">
          <div class="error-content">
            <div class="error-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Упс, что-то пошло не так!</h3>
            <p>{{ error }}</p>
            <button @click="loadEvents" class="retry-btn">
              <i class="fas fa-redo"></i>
              <span>Попробовать снова</span>
            </button>
          </div>
        </div>

        <!-- Список мероприятий -->
        <div v-else-if="paginatedEvents.length > 0" class="events-section">
          
          <!-- Сетка мероприятий -->
          <div class="events-grid">
            <!-- Предстоящие мероприятия -->
            <div
              v-for="event in paginatedEvents"
              :key="event.id"
              class="event-card"
              :class="{
                'upcoming-card': isUpcoming(event),
                'completed-card': !isUpcoming(event),
                'high-rating': getOverallRating(event) >= 4.5,
                'blocked-card': isReviewMissing(event)
              }"
              @click="goToEvent(event)"
            >
              <!-- Изображение мероприятия (логотип/аватар) -->
              <div class="event-image">
                <img
                  v-if="event.logo_url || event.avatar_url"
                  :src="event.logo_url || event.avatar_url"
                  :alt="event.name"
                  @error="handleImageError"
                >
                <div v-else class="no-image-placeholder">
                  <i class="fas fa-calendar-alt"></i>
                  <span>{{ event.name }}</span>
                </div>
                
                <!-- Оверлей -->
                <div class="image-overlay"></div>
                
                <!-- Дата в углу для предстоящих -->
                <div v-if="isUpcoming(event)" class="event-date-badge" :class="{ 'date-range': event.event_type === 'convention' && event.event_end_date }">
                  <template v-if="event.event_type === 'convention' && event.event_end_date">
                    <div class="date-range-text">{{ formatDateRange(event.event_date, event.event_end_date) }}</div>
                  </template>
                  <template v-else>
                    <div class="date-month">{{ getMonthShort(event.event_date) }}</div>
                    <div class="date-day">{{ getDay(event.event_date) }}</div>
                    <div class="date-year">{{ getYear(event.event_date) }}</div>
                  </template>
                </div>

                <!-- Рейтинг для завершённых (только если обзор написан и тип поддерживает рейтинги) -->
                <div v-else-if="shouldShowRating(event) && getOverallRating(event) > 0 && !isReviewMissing(event)" class="event-rating-badge">
                  <StarRating :rating="getOverallRating(event)" size="small" :show-value="true" />
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

              <!-- Информация о мероприятии -->
              <div class="event-content">
                <!-- Заголовок -->
                <div class="event-header">
                  <h3 class="event-title">{{ event.name }}</h3>
                  <div class="event-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>{{ event.city }}</span>
                    <i class="fas fa-users"></i>
                    <span>{{ event.attendees_count || 0 }}+</span>
                  </div>
                </div>

                <!-- Описание -->
                <p class="event-description">{{ truncateText(event.description || 'Описание мероприятия', 100) }}</p>

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

                <!-- Информация о времени до начала (для предстоящих) -->
                <div v-if="isUpcoming(event)" class="event-countdown">
                  <div class="countdown-label">До начала</div>
                  <div class="countdown-value">{{ getDaysUntilEvent(event.event_date) }}</div>
                  <div class="countdown-bar">
                    <div class="countdown-progress" :style="{ width: getCountdownProgress(event.event_date) + '%' }"></div>
                  </div>
                </div>

                <!-- Дополнительная информация для завершённых -->
                <div v-else class="event-photo-gallery">
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
                    <div
                      v-if="event.photos_count > 4"
                      class="gallery-preview-item gallery-more-overlay clickable"
                      @click.stop="openPhotoGallery(event)"
                      title="Открыть галерею"
                    >
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
                </div>

                <!-- Кнопки действий -->
                <div class="event-actions">
                  <!-- Для предстоящих мероприятий -->
                  <template v-if="isUpcoming(event)">
                    <button @click.stop="openOfficialSite(event)" class="action-btn primary">
                      <i class="fas fa-external-link-alt"></i>
                      <span>Официальный сайт</span>
                    </button>
                  </template>

                  <!-- Для завершённых мероприятий -->
                  <template v-else>
                    <button
                      v-if="!isReviewMissing(event)"
                      @click.stop="goToEvent(event)"
                      class="action-btn primary"
                    >
                      <i class="fas fa-eye"></i>
                      <span>Подробнее</span>
                    </button>
                    <button
                      v-else
                      class="action-btn primary disabled"
                      disabled
                    >
                      <i class="fas fa-lock"></i>
                      <span>Обзор ещё не написан</span>
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- Пагинация -->
          <div v-if="totalPages > 1" class="pagination">
            <button 
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="pagination-btn prev"
            >
              <i class="fas fa-chevron-left"></i>
              <span>Назад</span>
            </button>

            <div class="pagination-pages">
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="changePage(page)"
                class="pagination-page"
                :class="{ 'active': page === currentPage }"
              >
                {{ page }}
              </button>
            </div>

            <button 
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="pagination-btn next"
            >
              <span>Далее</span>
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <!-- Пустое состояние -->
        <div v-else class="empty-state">
          <div class="empty-content">
            <div class="empty-icon">
              <i class="fas fa-calendar-times"></i>
            </div>
            <h3>Мероприятия не найдены</h3>
            <p v-if="searchQuery || activeFilter !== 'all'">
              По вашему запросу ничего не найдено. Попробуйте изменить критерии поиска.
            </p>
            <p v-else>
              Пока что список мероприятий пуст. Возможно, данные еще загружаются.
            </p>
            <div class="empty-actions">
              <button v-if="searchQuery || activeFilter !== 'all'" @click="clearAllFilters" class="clear-filters-btn">
                <i class="fas fa-eraser"></i>
                <span>Очистить фильтры</span>
              </button>
              <router-link to="/" class="home-btn">
                <i class="fas fa-home"></i>
                <span>На главную</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно превью (опционально) -->
    <div v-if="previewEvent" class="event-preview-modal" @click="closePreview">
      <div class="preview-content" @click.stop>
        <button @click="closePreview" class="preview-close">
          <i class="fas fa-times"></i>
        </button>
        
        <div class="preview-image">
          <img v-if="previewEvent.meta_image" :src="previewEvent.meta_image" :alt="previewEvent.name">
          <div v-else class="preview-placeholder">
            <i class="fas fa-calendar-alt"></i>
          </div>
        </div>
        
        <div class="preview-info">
          <h3>{{ previewEvent.name }}</h3>
          <p v-if="previewEvent.subtitle">{{ previewEvent.subtitle }}</p>
          
          <div class="preview-actions">
            <router-link :to="`/events/${previewEvent.slug}`" class="preview-btn primary">
              <i class="fas fa-eye"></i>
              <span>Посмотреть подробнее</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно с фотогалереей -->
    <div v-if="showGalleryModal" class="gallery-modal" @click="closeGalleryModal">
      <div class="gallery-modal-content" @click.stop>
        <!-- Заголовок -->
        <div class="gallery-modal-header">
          <h3 class="gallery-modal-title">
            <i class="fas fa-images"></i>
            Фотографии: {{ galleryEvent?.name }}
          </h3>
          <button @click="closeGalleryModal" class="gallery-close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Сетка фотографий -->
        <div class="gallery-modal-body">
          <div v-if="loadingGallery" class="gallery-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Загрузка фотографий...</p>
          </div>

          <div v-else-if="galleryPhotos.length > 0" class="gallery-grid">
            <div
              v-for="(photo, index) in galleryPhotos"
              :key="photo.id"
              class="gallery-grid-item"
              @click="openPhotoViewer(index)"
            >
              <img :src="photo.thumbnail_url || photo.image_url" :alt="photo.caption || 'Фото'" />
              <div class="gallery-item-overlay">
                <i class="fas fa-search-plus"></i>
              </div>
            </div>
          </div>

          <div v-else class="gallery-empty">
            <i class="fas fa-images"></i>
            <p>Нет фотографий для отображения</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно просмотра фото -->
    <div v-if="showPhotoViewer" class="photo-viewer-modal" @click="closePhotoViewer">
      <div class="photo-viewer-content">
        <!-- Кнопки навигации -->
        <button
          v-if="currentPhotoIndex > 0"
          @click.stop="prevPhoto"
          class="photo-nav-btn prev"
        >
          <i class="fas fa-chevron-left"></i>
        </button>

        <!-- Фото -->
        <div class="photo-viewer-image-container" @click.stop>
          <img
            :src="galleryPhotos[currentPhotoIndex]?.image_url"
            :alt="galleryPhotos[currentPhotoIndex]?.caption || 'Фото'"
            class="photo-viewer-image"
          />
          <div v-if="galleryPhotos[currentPhotoIndex]?.caption" class="photo-caption">
            {{ galleryPhotos[currentPhotoIndex].caption }}
          </div>
        </div>

        <!-- Кнопки навигации -->
        <button
          v-if="currentPhotoIndex < galleryPhotos.length - 1"
          @click.stop="nextPhoto"
          class="photo-nav-btn next"
        >
          <i class="fas fa-chevron-right"></i>
        </button>

        <!-- Кнопка закрытия -->
        <button @click="closePhotoViewer" class="photo-viewer-close">
          <i class="fas fa-times"></i>
        </button>

        <!-- Счетчик -->
        <div class="photo-counter">
          {{ currentPhotoIndex + 1 }} / {{ galleryPhotos.length }}
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
  name: 'EventsMain',
  components: {
    StarRating
  },
  
  data() {
    return {
      // Состояние загрузки
      loading: false,
      error: null,
      
      // Данные
      allEvents: [],
      stats: {
        total: 0,
        upcoming: 0,
        completed: 0,
        totalSpent: 0
      },
      
      // Фильтрация и поиск
      searchQuery: '',
      activeFilter: 'all',
      sortBy: 'date_desc',
      
      // Пагинация
      currentPage: 1,
      eventsPerPage: 9,
      
      // Админ-режим
      isAdminMode: false,
      
      // Модальное окно превью
      previewEvent: null,

      // Таймеры
      searchTimeout: null,

      // Фотогалерея
      showGalleryModal: false,
      galleryEvent: null,
      galleryPhotos: [],
      loadingGallery: false,

      // Просмотр фото
      showPhotoViewer: false,
      currentPhotoIndex: 0,
    }
  },
  
  computed: {
    // Фильтры
    filters() {
      return [
        { key: 'all', label: 'Все', icon: 'fas fa-calendar-alt', count: this.stats.total },
        { key: 'upcoming', label: 'Предстоящие', icon: 'fas fa-clock', count: this.stats.upcoming },
        { key: 'completed', label: 'Посещённые', icon: 'fas fa-check-circle', count: this.stats.completed },
        { key: 'convention', label: 'Конвенты', icon: 'fas fa-crown', count: this.getTypeCount('convention') },
        { key: 'market', label: 'Маркеты', icon: 'fas fa-store', count: this.getTypeCount('market') },
        { key: 'festival', label: 'Фестивали', icon: 'fas fa-music', count: this.getTypeCount('festival') },
        { key: 'meetup', label: 'Встречи', icon: 'fas fa-users', count: this.getTypeCount('meetup') }
      ]
    },
    
    // Отфильтрованные мероприятия
    filteredEvents() {
      let events = [...this.allEvents]
      
      // Фильтр по статусу/типу
      if (this.activeFilter === 'upcoming') {
        events = events.filter(e => this.isUpcoming(e))
      } else if (this.activeFilter === 'completed') {
        events = events.filter(e => !this.isUpcoming(e))
      } else if (this.activeFilter !== 'all') {
        events = events.filter(e => e.event_type === this.activeFilter)
      }
      
      // Поиск
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        events = events.filter(e => 
          e.name.toLowerCase().includes(query) ||
          (e.city && e.city.toLowerCase().includes(query)) ||
          (e.location && e.location.toLowerCase().includes(query)) ||
          (e.subtitle && e.subtitle.toLowerCase().includes(query))
        )
      }
      
      // Сортировка
      events.sort((a, b) => {
        switch (this.sortBy) {
          case 'date_asc':
            return new Date(a.event_date) - new Date(b.event_date)
          case 'date_desc':
            return new Date(b.event_date) - new Date(a.event_date)
          case 'name_asc':
            return a.name.localeCompare(b.name, 'ru')
          case 'rating_desc':
            return this.getOverallRating(b) - this.getOverallRating(a)
          default:
            return new Date(b.event_date) - new Date(a.event_date)
        }
      })
      
      return events
    },
    
    // Пагинация
    totalPages() {
      return Math.ceil(this.filteredEvents.length / this.eventsPerPage)
    },
    
    paginatedEvents() {
      const start = (this.currentPage - 1) * this.eventsPerPage
      const end = start + this.eventsPerPage
      return this.filteredEvents.slice(start, end)
    },
    
    visiblePages() {
      const pages = []
      const totalPages = this.totalPages
      const current = this.currentPage
      
      // Показываем максимум 5 страниц
      let start = Math.max(1, current - 2)
      let end = Math.min(totalPages, start + 4)
      
      if (end - start < 4) {
        start = Math.max(1, end - 4)
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    }
  },
  
  async mounted() {
    // Проверяем админ права
    this.checkAdminMode()
    
    // Загружаем мероприятия
    await this.loadEvents()
    
    // Устанавливаем мета-теги
    this.updateMetaTags()
  },
  
  methods: {
    // ============================================
    // ЗАГРУЗКА ДАННЫХ
    // ============================================
    
    async loadEvents() {
      this.loading = true
      this.error = null
      
      try {
        console.log('🎪 Events/main: Загружаем все мероприятия...')
        
        const [events, stats] = await Promise.all([
          furryApi.getEvents({ status: 'all', limit: 100, sort: 'date_desc' }),
          furryApi.getEventsStats()
        ])
        
        this.allEvents = events || []
        this.stats = stats || { upcoming: 0, completed: 0, total: 0, totalSpent: 0 }

        console.log('✅ Events/main: Все мероприятия загружены:', {
          total: this.allEvents.length,
          stats: this.stats
        })

        // Отладка: проверяем attendance_status
        console.log('🔍 Проверка attendance_status у мероприятий:')
        this.allEvents.forEach(event => {
          console.log(`  - ${event.name}: attendance_status="${event.attendance_status}", предстоящее=${new Date(event.event_date) > new Date()}`)
        })

        // Загружаем превью фотографий для событий
        await this.loadEventPhotoPreviews()

        // Сбрасываем пагинацию при новой загрузке
        this.currentPage = 1
        
      } catch (error) {
        console.error('❌ Events/main: Ошибка загрузки мероприятий:', error)
        this.error = error.message || 'Проблема с подключением к API'
        
        // Fallback тестовые данные для разработки
        if (process.env.NODE_ENV === 'development') {
          this.loadFallbackData()
        }
        
      } finally {
        this.loading = false
      }
    },
    
    // Загрузка превью фотографий для событий
    async loadEventPhotoPreviews() {
      try {
        // Получаем ID всех событий
        const eventIds = this.allEvents.map(e => e.id).filter(Boolean)
        if (eventIds.length === 0) return

        console.log('📸 Events/main: Загружаем превью фотографий для событий...')

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
        this.allEvents = this.allEvents.map(event => ({
          ...event,
          photoPreviews: photosByEvent[event.id] || []
        }))

        console.log('✅ Events/main: Превью фотографий загружены')
      } catch (error) {
        console.warn('⚠️ Events/main: Не удалось загрузить превью фотографий:', error)
      }
    },

    loadFallbackData() {
      console.log('🧪 Events/main: Загружаем тестовые данные...')

      this.allEvents = [
        {
          id: '1',
          slug: 'any-furry-fest-5',
          name: 'Any Furry Fest V',
          subtitle: 'Крупнейший фурри-фестиваль России',
          event_date: '2024-08-17',
          city: 'Москва',
          location: 'Парк-отель "Воздвиженское"',
          event_type: 'convention',
          attendance_status: 'attended',
          my_rating: 5,
          total_spent: 8500,
          attendees_count: 400,
          photos_count: 47,
          meta_image: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/events/aff5_banner.jpg',
          description: 'Невероятный фестиваль! Три дня полного погружения в фурри-культуру.'
        },
        {
          id: '2',
          slug: 'foxwood-2000s',
          name: 'FoxWood: Back to 2000s',
          subtitle: 'Ретро-мероприятие в лесной тематике',
          event_date: '2024-09-08',
          city: 'Ленинградская область',
          location: 'Загородный клуб "Бор"',
          event_type: 'convention',
          attendance_status: 'attended',
          my_rating: 5,
          total_spent: 7500,
          attendees_count: 160,
          photos_count: 32,
          meta_image: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/events/foxwood_banner.jpg',
          description: 'Совершенно потрясающая концепция! Лесная тематика смешанная с ностальгией по нулевым.'
        }
        // ... другие мероприятия
      ]
      
      this.stats = {
        total: 11,
        upcoming: 3,
        completed: 8,
        totalSpent: 35600
      }
    },
    
    checkAdminMode() {
      getAdminSession().then(isAdmin => {
        this.isAdminMode = isAdmin
      }).catch(() => {
        this.isAdminMode = false
      })
    },
    
    // ============================================
    // ФИЛЬТРАЦИЯ И ПОИСК
    // ============================================
    
    setFilter(filterKey) {
      if (this.activeFilter !== filterKey) {
        this.activeFilter = filterKey
        this.currentPage = 1
      }
    },
    
    applySorting() {
      this.currentPage = 1
    },
    
    debouncedSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1
      }, 300)
    },
    
    clearSearch() {
      this.searchQuery = ''
      this.currentPage = 1
    },
    
    clearAllFilters() {
      this.searchQuery = ''
      this.activeFilter = 'all'
      this.sortBy = 'date_desc'
      this.currentPage = 1
    },
    
    // ============================================
    // ПАГИНАЦИЯ
    // ============================================
    
    changePage(page) {
      if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
        this.currentPage = page
        
        // Скроллим к верху списка
        document.querySelector('.events-grid')?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }
    },
    
    // ============================================
    // НАВИГАЦИЯ И ДЕЙСТВИЯ
    // ============================================
    
    goToEvent(event) {
      // Блокируем переход для прошедших событий без обзора (кроме админа)
      if (!this.isAdminMode && this.isReviewMissing(event)) {
        return
      }

      if (event.slug) {
        this.$router.push(`/events/${event.slug}`)
      } else {
        console.warn('У мероприятия нет slug:', event.name)
      }
    },
    
    planToAttend(event) {
      // Обработка кнопки "Буду участвовать"
      console.log('Планируется посетить:', event.name)
      // Здесь можно добавить в календарь, отправить уведомление и т.д.
      alert(`Добавлено в планы: ${event.name}`)
    },
    
    openOfficialSite(event) {
      // Открытие официального сайта мероприятия из БД
      const url = event.official_website
      if (url) {
        window.open(url, '_blank')
      } else {
        alert('Официальный сайт ещё не объявлен')
      }
    },
    
    openEventGallery(event) {
      // Открытие галереи фотографий мероприятия
      alert(`Открытие галереи для: ${event.name}`)
      // Можно перейти на страницу галереи или открыть модальное окно
    },
    
    openPreview(event) {
      this.previewEvent = event
    },
    
    closePreview() {
      this.previewEvent = null
    },
    
    // ============================================
    // УТИЛИТЫ
    // ============================================
    
    getTypeCount(type) {
      return this.allEvents.filter(e => e.event_type === type).length
    },
    
    isUpcoming(event) {
      return new Date(event.event_date) > new Date()
    },

    // Проверка отсутствия обзора для прошедших событий
    isReviewMissing(event) {
      const isPast = new Date(event.event_date) < new Date()
      if (!isPast) return false

      // Если поле review_completed явно установлено, используем его значение
      if (event.review_completed !== undefined && event.review_completed !== null) {
        // false = обзор НЕ завершён = блокировать карточку
        // true = обзор завершён = НЕ блокировать
        return event.review_completed === false
      }

      // Fallback: если поле не установлено, проверяем наличие рейтингов
      const hasRatings = event.rating_organization || event.rating_program ||
                         event.rating_atmosphere || event.rating_location ||
                         event.rating_participants || event.rating_food || event.my_rating

      // Обзор отсутствует если нет рейтингов
      return !hasRatings
    },
    
    getStatusClass(event) {
      return this.isUpcoming(event) ? 'upcoming' : 'completed'
    },
    
    getStatusText(event) {
      const statusMap = {
        planning: 'Планируется',
        registered: 'Зарегистрирован',
        attended: 'Посетил',
        missed: 'Пропустил',
        cancelled: 'Отменено'
      }
      return statusMap[event.attendance_status] || (this.isUpcoming(event) ? 'Предстоящее' : 'Завершено')
    },
    
    getTypeIcon(type) {
      const iconMap = {
        convention: 'fas fa-calendar-star',
        market: 'fas fa-store',
        festival: 'fas fa-music',
        meetup: 'fas fa-users',
        party: 'fas fa-glass-cheers',
        workshop: 'fas fa-tools',
        other: 'fas fa-calendar'
      }
      return iconMap[type] || 'fas fa-calendar'
    },
    
    getTypeName(type) {
      const typeMap = {
        convention: 'Конвент',
        market: 'Маркет',
        festival: 'Фестиваль',
        meetup: 'Встреча',
        party: 'Вечеринка',
        workshop: 'Мастер-класс',
        other: 'Другое'
      }
      return typeMap[type] || type
    },
    
    formatEventDate(dateString, event) {
      // Особый формат для КОНов с диапазоном дат
      if (event && event.event_type === 'convention' && event.event_end_date) {
        const startDate = new Date(dateString)
        const endDate = new Date(event.event_end_date)

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
    
    // Методы для форматирования даты в угловом бейдже
    getMonthShort(dateString) {
      const date = new Date(dateString)
      const months = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК']
      return months[date.getMonth()]
    },
    
    getDay(dateString) {
      const date = new Date(dateString)
      return date.getDate()
    },
    
    getYear(dateString) {
      const date = new Date(dateString)
      return date.getFullYear()
    },
    
    // Подсчёт дней до мероприятия
    getDaysUntilEvent(dateString) {
      const eventDate = new Date(dateString)
      const today = new Date()
      const diffTime = eventDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays > 0) {
        return `${diffDays} ${this.getDaysWord(diffDays)}`
      } else if (diffDays === 0) {
        return 'Сегодня!'
      } else {
        return 'Завершено'
      }
    },
    
    // Склонение слова "день"
    getDaysWord(days) {
      if (days % 10 === 1 && days % 100 !== 11) {
        return 'день'
      } else if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) {
        return 'дня' 
      } else {
        return 'дней'
      }
    },
    
    // Прогресс-бар для обратного отсчёта (примерно за 3 месяца до события)
    getCountdownProgress(dateString) {
      const eventDate = new Date(dateString)
      const today = new Date()
      const totalPeriod = 90 * 24 * 60 * 60 * 1000 // 3 месяца в миллисекундах
      const timeUntilEvent = eventDate - today
      
      if (timeUntilEvent <= 0) return 100
      if (timeUntilEvent >= totalPeriod) return 0
      
      return Math.max(0, Math.min(100, ((totalPeriod - timeUntilEvent) / totalPeriod) * 100))
    },
    
    formatMoney(amount) {
      if (!amount) return '0 ₽'
      return `${Number(amount).toLocaleString('ru-RU')} ₽`
    },
    
    truncateText(text, maxLength) {
      if (!text || text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    },
    
    handleImageError(event) {
      // Скрываем сломанное изображение
      event.target.style.display = 'none'
    },

    // Проверка, нужно ли показывать рейтинг для данного типа мероприятия
    shouldShowRating(event) {
      // Показываем рейтинг если есть хоть какая-то оценка
      return event && this.getOverallRating(event) > 0
    },

    // Форматирование диапазона дат для КОНов
    formatDateRange(startDateString, endDateString) {
      const startDate = new Date(startDateString)
      const endDate = new Date(endDateString)

      const startDay = startDate.getDate().toString().padStart(2, '0')
      const startMonth = (startDate.getMonth() + 1).toString().padStart(2, '0')
      const endDay = endDate.getDate().toString().padStart(2, '0')
      const endMonth = (endDate.getMonth() + 1).toString().padStart(2, '0')

      return `${startDay}.${startMonth} – ${endDay}.${endMonth}`
    },

    // Вычисление общего рейтинга из 6 категорий
    getOverallRating(event) {
      const ratings = [
        event.rating_organization,
        event.rating_program,
        event.rating_atmosphere,
        event.rating_location,
        event.rating_participants,
        event.rating_food
      ].filter(r => r !== null && r !== undefined && r > 0)

      // Если есть старый my_rating, используем его как fallback
      if (ratings.length === 0) {
        return event.my_rating || 0
      }

      const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      return avg.toFixed(1)
    },

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

    updateMetaTags() {
      document.title = 'Все мероприятия | FoxTaffy.gay'

      // Обновляем мета-теги через Vue Router или другим способом
      if (this.$updateMetaTags) {
        this.$updateMetaTags({
          title: 'Все мероприятия | FoxTaffy.gay',
          description: `Полная коллекция из ${this.stats.total} конвентов и мероприятий, которые посетил Fox Taffy. Отчеты, фотографии и впечатления от каждого события.`,
          image: 'https://foxtaffy.gay/s3/gallery/events/aff5.jpg',
          url: 'https://foxtaffy.gay/events'
        })
      }
    },

    // ============================================
    // ФОТОГАЛЕРЕЯ
    // ============================================

    async openPhotoGallery(event) {
      console.log('📸 Открываем галерею для мероприятия:', event.name)

      this.galleryEvent = event
      this.showGalleryModal = true
      this.loadingGallery = true
      this.galleryPhotos = []

      try {
        // Загружаем все фотографии мероприятия
        const photos = await furryApi.getEventPhotos(event.id)
        this.galleryPhotos = photos
        console.log(`✅ Загружено ${photos.length} фотографий`)
      } catch (error) {
        console.error('❌ Ошибка загрузки фотографий:', error)
        this.galleryPhotos = []
      } finally {
        this.loadingGallery = false
      }
    },

    closeGalleryModal() {
      this.showGalleryModal = false
      this.galleryEvent = null
      this.galleryPhotos = []
    },

    openPhotoViewer(index) {
      this.currentPhotoIndex = index
      this.showPhotoViewer = true
    },

    closePhotoViewer() {
      this.showPhotoViewer = false
      this.currentPhotoIndex = 0
    },

    prevPhoto() {
      if (this.currentPhotoIndex > 0) {
        this.currentPhotoIndex--
      }
    },

    nextPhoto() {
      if (this.currentPhotoIndex < this.galleryPhotos.length - 1) {
        this.currentPhotoIndex++
      }
    }
  },
  
  beforeUnmount() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
  }
}
</script>

<style scoped>
/* ===============================================
   🎨 ОСНОВНЫЕ СТИЛИ
   =============================================== */

.events-main-page {
  min-height: 100vh;
  background: var(--bg-primary, #1a1a1a);
  color: var(--text-light, #f2f2f2);
  font-family: 'Nunito', sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* ===============================================
   📋 ШАПКА СТРАНИЦЫ
   =============================================== */

.page-header {
  position: relative;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 3rem 0;
  overflow: hidden;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.85) 0%, rgba(26, 26, 26, 0.75) 100%);
}

.page-header .container {
  position: relative;
  z-index: 1;
}

.header-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 3rem;
  font-weight: 800;
  color: var(--text-light, #f2f2f2);
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, var(--accent-orange, #ff7b25), var(--accent-green, #4caf50));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-description {
  font-size: 1.1rem;
  color: var(--text-muted, #a0a0a0);
  line-height: 1.6;
  margin: 0;
}

.header-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.header-stats .stat-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  padding: 1rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-orange, #ff7b25);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted, #a0a0a0);
  margin-top: 0.25rem;
}

.page-navigation {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.back-button, .admin-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.back-button {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-light, #f2f2f2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Кнопка "На главную" в углу */
.home-corner-button {
  position: fixed;
  top: 1.5rem;
  left: 1.5rem;
  width: 50px;
  height: 50px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-light, #f2f2f2);
  text-decoration: none;
  font-size: 1.2rem;
  z-index: 100;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.home-corner-button:hover {
  background: var(--accent-orange, #ff7b25);
  border-color: var(--accent-orange, #ff7b25);
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(255, 123, 37, 0.4);
}

/* ===============================================
   🔍 ФИЛЬТРЫ И ПОИСК
   =============================================== */

.filters-section {
  background: linear-gradient(180deg, rgba(255, 123, 37, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2.5rem 0;
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
}

.filters-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 123, 37, 0.5), rgba(76, 175, 80, 0.5), transparent);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.filters-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
}

.search-box {
  position: relative;
  flex: 0 0 280px;
  min-width: 200px;
}

.search-box i {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--accent-orange, #ff7b25);
  font-size: 1.1rem;
  transition: all 0.3s ease;
  z-index: 1;
}

.search-box input {
  width: 100%;
  padding: 1rem 3.5rem 1rem 3rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  color: var(--text-light, #f2f2f2);
  font-size: 1rem;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.search-box input::placeholder {
  color: rgba(160, 160, 160, 0.7);
}

.search-box input:focus {
  outline: none;
  border-color: var(--accent-orange, #ff7b25);
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 25px rgba(255, 123, 37, 0.2), 0 0 0 4px rgba(255, 123, 37, 0.1);
  transform: translateY(-2px);
}

.clear-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 1;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.25);
  border-color: #ef4444;
  transform: translateY(-50%) scale(1.1) rotate(90deg);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.clear-btn:active {
  transform: translateY(-50%) scale(0.95);
}

.filter-tabs {
  display: flex;
  gap: 0.75rem;
  flex-wrap: nowrap;
  flex: 1;
  min-width: 0;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem 1rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  color: var(--text-light, #f2f2f2);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.filter-tab::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.filter-tab:hover::before {
  left: 100%;
}

.filter-tab:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 123, 37, 0.5);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 123, 37, 0.2);
}

.filter-tab i {
  transition: all 0.3s ease;
}

.filter-tab:hover i {
  transform: scale(1.2) rotate(5deg);
}

.filter-tab.active {
  background: linear-gradient(135deg, var(--accent-orange, #ff7b25) 0%, var(--accent-green, #4caf50) 100%);
  border-color: transparent;
  color: white;
  box-shadow: 0 8px 25px rgba(255, 123, 37, 0.4), 0 0 0 4px rgba(255, 123, 37, 0.1);
  transform: translateY(-2px);
}

.filter-tab.active i {
  animation: pulse-icon 2s ease-in-out infinite;
}

@keyframes pulse-icon {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.filter-count {
  font-size: 0.8rem;
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.25);
  padding: 0.25rem 0.6rem;
  border-radius: 1rem;
  font-weight: 700;
}

.sort-select {
  flex: 0 0 auto;
}

.sort-select select {
  padding: 0.9rem 1.3rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  color: var(--text-light, #f2f2f2);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  width: 200px;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.sort-select select:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(76, 175, 80, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.2);
}

.sort-select select:focus {
  outline: none;
  border-color: var(--accent-green, #4caf50);
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3), 0 0 0 4px rgba(76, 175, 80, 0.1);
}

/* ===============================================
   📋 ОСНОВНОЙ КОНТЕНТ
   =============================================== */

.main-content {
  padding: 3rem 0;
}

/* ===============================================
   🎪 КАРТОЧКИ МЕРОПРИЯТИЙ - НОВЫЙ ДИЗАЙН
   =============================================== */

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.event-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1.5rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
}

.event-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-8px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  border-color: rgba(255, 255, 255, 0.2);
}

/* Стили для предстоящих мероприятий */
.event-card.upcoming-card {
  border-color: var(--accent-green, #4caf50);
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.15);
}

.event-card.upcoming-card:hover {
  box-shadow: 0 25px 50px rgba(76, 175, 80, 0.3);
}

.event-card.upcoming-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--accent-green, #4caf50), #45a049);
  z-index: 2;
}

/* Стили для завершённых мероприятий */
.event-card.completed-card {
  border-color: var(--accent-orange, #ff7b25);
  box-shadow: 0 0 20px rgba(255, 123, 37, 0.1);
}

.event-card.completed-card:hover {
  box-shadow: 0 25px 50px rgba(255, 123, 37, 0.2);
}

.event-card.high-rating {
  border-color: #ffd700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
}

/* Изображение мероприятия */
.event-image {
  height: 220px;
  position: relative;
  overflow: hidden;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.event-card:hover .event-image img {
  transform: scale(1.08);
}

.no-image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 123, 37, 0.15), rgba(76, 175, 80, 0.15));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted, #a0a0a0);
  gap: 0.75rem;
}

.no-image-placeholder i {
  font-size: 2.5rem;
  opacity: 0.6;
}

.no-image-placeholder span {
  font-weight: 600;
  text-align: center;
  padding: 0 1rem;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.7));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.event-card:hover .image-overlay {
  opacity: 1;
}

/* Дата в углу для предстоящих мероприятий */
.event-date-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: linear-gradient(135deg, var(--accent-green, #4caf50), #45a049);
  color: white;
  border-radius: 0.75rem;
  padding: 0.5rem 0.75rem;
  text-align: center;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  backdrop-filter: blur(10px);
  z-index: 3;
  min-width: 60px;
}

.event-date-badge.date-range {
  padding: 0.75rem 1rem;
  min-width: auto;
}

.date-range-text {
  font-size: 0.95rem;
  font-weight: 700;
  white-space: nowrap;
}

.date-month {
  font-size: 0.75rem;
  opacity: 0.9;
  letter-spacing: 0.5px;
}

.date-day {
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1;
  margin: 0.25rem 0;
}

.date-year {
  font-size: 0.8rem;
  opacity: 0.9;
}

/* Рейтинг для завершённых мероприятий */
.event-rating-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  z-index: 3;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.event-rating-badge .rating-stars {
  display: flex;
  gap: 0.1rem;
}

.event-rating-badge .rating-stars .fa-star {
  color: #666;
  font-size: 0.8rem;
}

.event-rating-badge .rating-stars .fa-star.active {
  color: #ffd700;
}

.event-rating-badge .rating-text {
  font-size: 0.75rem;
  color: white;
  font-weight: 600;
}

/* Бейджи статусов участия */
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

/* Контент карточки */
.event-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-header {
  flex: none;
}

.event-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-light, #f2f2f2);
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.event-location {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--text-muted, #a0a0a0);
  font-size: 0.9rem;
  font-weight: 500;
}

.event-location i {
  color: var(--accent-orange, #ff7b25);
}

.event-description {
  color: var(--text-muted, #a0a0a0);
  line-height: 1.5;
  margin: 0;
  font-size: 0.95rem;
  flex: 1;
}

/* Особенности мероприятия */
.event-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
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

/* Обратный отсчёт для предстоящих - улучшенный дизайн */
.event-countdown {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(76, 175, 80, 0.05));
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  position: relative;
  text-align: center;
}

.countdown-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--accent-green, #4caf50);
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.countdown-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-light, #f2f2f2);
  line-height: 1.2;
}

.countdown-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(76, 175, 80, 0.2);
  border-radius: 0 0 0.75rem 0.75rem;
  overflow: hidden;
}

.countdown-progress {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-green, #4caf50), #45a049);
  transition: width 0.3s ease;
}

/* Статистика для завершённых */
.event-stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted, #a0a0a0);
  font-size: 0.9rem;
  font-weight: 600;
}

.stat-item i {
  color: var(--accent-orange, #ff7b25);
}

.stat-item:first-child {
  color: var(--accent-orange, #ff7b25);
}

/* Фотогаллерея для завершённых событий */
.event-photo-gallery {
  background: rgba(139, 92, 246, 0.1);
  padding: 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(139, 92, 246, 0.2);
  transition: all 0.3s ease;
}

.event-card:hover .event-photo-gallery {
  background: rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.3);
}

.gallery-previews {
  display: flex;
  gap: 0.4rem;
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
  color: var(--text-light, #f2f2f2);
  font-size: 0.9rem;
  font-weight: 500;
}

.gallery-text i {
  color: #8b5cf6;
  font-size: 1rem;
}

/* Кнопки действий */
.event-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
  min-height: 45px;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--accent-orange, #ff7b25), #e6691f);
  color: white;
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, #e6691f, #cc5a1a);
  box-shadow: 0 8px 20px rgba(255, 123, 37, 0.4);
}

/* Для предстоящих - зелёная кнопка "Буду участвовать" */
.upcoming-card .action-btn.primary {
  background: linear-gradient(135deg, var(--accent-green, #4caf50), #45a049);
}

.upcoming-card .action-btn.primary:hover {
  background: linear-gradient(135deg, #45a049, #3d8b40);
  box-shadow: 0 8px 20px rgba(76, 175, 80, 0.4);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-light, #f2f2f2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: var(--accent-orange, #ff7b25);
  color: var(--accent-orange, #ff7b25);
}

.action-btn.disabled {
  background: rgba(128, 128, 128, 0.3);
  color: var(--text-muted, #a0a0a0);
  cursor: not-allowed;
  opacity: 0.7;
}

.action-btn.disabled:hover {
  transform: none;
  box-shadow: none;
}

/* Заблокированные карточки (без обзора) */
.event-card.blocked-card {
  cursor: not-allowed;
  border: 2px solid rgba(128, 128, 128, 0.6);
  position: relative;
}

.event-card.blocked-card:hover {
  transform: none;
  box-shadow: 0 4px 12px rgba(128, 128, 128, 0.3);
  border-color: rgba(128, 128, 128, 0.8);
}

/* ===============================================
   📄 ПАГИНАЦИЯ
   =============================================== */

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: var(--text-light, #f2f2f2);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--accent-orange, #ff7b25);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: 0.5rem;
}

.pagination-page {
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-light, #f2f2f2);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.pagination-page:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--accent-orange, #ff7b25);
}

.pagination-page.active {
  background: var(--accent-orange, #ff7b25);
  border-color: var(--accent-orange, #ff7b25);
  color: white;
}

/* ===============================================
   🗂️ СОСТОЯНИЯ
   =============================================== */

.loading-state, .error-state, .empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 3rem 2rem;
}

.loading-spinner, .error-content, .empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid var(--accent-orange, #ff7b25);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon, .empty-icon {
  font-size: 4rem;
  color: var(--accent-orange, #ff7b25);
  opacity: 0.5;
}

.empty-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.clear-filters-btn, .home-btn, .retry-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  text-decoration: none;
}

.clear-filters-btn, .retry-btn {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-light, #f2f2f2);
}

.home-btn {
  background: var(--accent-orange, #ff7b25);
  color: white;
  border-color: var(--accent-orange, #ff7b25);
}

.clear-filters-btn:hover, .retry-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--accent-orange, #ff7b25);
}

.home-btn:hover {
  background: #e6691f;
  border-color: #e6691f;
}

/* ===============================================
   🪟 МОДАЛЬНОЕ ОКНО ПРЕВЬЮ
   =============================================== */

.event-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.preview-content {
  background: var(--bg-secondary, #222222);
  border-radius: 1rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: all 0.3s ease;
}

.preview-close:hover {
  background: rgba(239, 68, 68, 0.8);
}

.preview-image {
  height: 250px;
  position: relative;
}

.preview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 123, 37, 0.2), rgba(76, 175, 80, 0.2));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted, #a0a0a0);
}

.preview-placeholder i {
  font-size: 3rem;
}

.preview-info {
  padding: 2rem;
}

.preview-info h3 {
  font-size: 1.5rem;
  color: var(--text-light, #f2f2f2);
  margin: 0 0 0.5rem 0;
}

.preview-info p {
  color: var(--text-muted, #a0a0a0);
  margin: 0 0 2rem 0;
}

.preview-actions {
  display: flex;
  gap: 1rem;
}

.preview-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.preview-btn.primary {
  background: var(--accent-orange, #ff7b25);
  color: white;
}

.preview-btn.primary:hover {
  background: #e6691f;
  transform: translateY(-1px);
}

/* ===============================================
   📸 ФОТОГАЛЕРЕЯ
   =============================================== */

/* Курсор указателя для кликабельного элемента */
.clickable {
  cursor: pointer;
}

.clickable:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

/* Модальное окно галереи */
.gallery-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.gallery-modal-content {
  background: var(--bg-tertiary, #1a1a1a);
  border-radius: 1rem;
  max-width: 1200px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.gallery-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.gallery-modal-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-light, #f2f2f2);
}

.gallery-modal-title i {
  color: var(--accent-orange, #ff7b25);
}

.gallery-close-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-light, #f2f2f2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.gallery-close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.gallery-modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.gallery-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  color: var(--text-light, #f2f2f2);
}

.gallery-loading i {
  font-size: 3rem;
  color: var(--accent-orange, #ff7b25);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.gallery-grid-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 0.75rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.gallery-grid-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(255, 123, 37, 0.3);
}

.gallery-grid-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-item-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.gallery-grid-item:hover .gallery-item-overlay {
  opacity: 1;
}

.gallery-item-overlay i {
  font-size: 2rem;
  color: white;
}

.gallery-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  color: var(--text-muted, #888);
}

.gallery-empty i {
  font-size: 3rem;
}

/* Просмотр фото */
.photo-viewer-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 11000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.photo-viewer-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-viewer-image-container {
  max-width: 90%;
  max-height: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.photo-viewer-image {
  max-width: 100%;
  max-height: calc(90vh - 100px);
  object-fit: contain;
  border-radius: 0.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.photo-caption {
  background: rgba(0, 0, 0, 0.8);
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  color: white;
  max-width: 600px;
  text-align: center;
}

.photo-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.photo-nav-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-50%) scale(1.1);
}

.photo-nav-btn.prev {
  left: 2rem;
}

.photo-nav-btn.next {
  right: 2rem;
}

.photo-viewer-close {
  position: absolute;
  top: 2rem;
  right: 2rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.photo-viewer-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.photo-counter {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  color: white;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

/* ===============================================
   📱 АДАПТИВНОСТЬ
   =============================================== */

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .page-header {
    padding: 2rem 0;
  }
  
  .header-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .header-stats {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }
  
  .header-stats .stat-card {
    padding: 0.75rem;
  }
  
  .filters-container {
    flex-direction: column;
    gap: 1rem;
    padding: 0 1rem;
  }

  .search-box {
    flex: 1 1 100%;
    max-width: 100%;
  }

  .filter-tabs {
    flex-wrap: wrap;
    justify-content: center;
  }

  .sort-select {
    width: 100%;
  }

  .sort-select select {
    width: 100%;
  }
  
  .events-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .event-card {
    max-width: 100%;
  }
  
  .pagination {
    flex-direction: column;
    gap: 1rem;
  }
  
  .pagination-pages {
    order: 2;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 0.5rem;
  }
  
  .page-title {
    font-size: 1.75rem;
  }
  
  .header-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filter-tabs {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-tab {
    justify-content: center;
  }
  
  .event-image {
    height: 150px;
  }
}
</style>