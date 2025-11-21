<template>
  <div class="admin-events-panel">
    <!-- Заголовок панели -->
    <div class="panel-header">
      <div class="header-content">
        <h2 class="panel-title">
          <i class="fas fa-calendar-star"></i>
          Управление мероприятиями
        </h2>
        <p class="panel-description">
          Создание, редактирование и управление всеми мероприятиями Fox Taffy
        </p>
      </div>
      
      <div class="header-actions">
        <button @click="refreshData" class="refresh-btn" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'spinning': loading }"></i>
          <span>Обновить</span>
        </button>
        <button @click="openCreateModal" class="add-btn" :disabled="loading">
          <i class="fas fa-plus"></i>
          <span>Создать мероприятие</span>
        </button>
      </div>
    </div>

    <!-- Статистическая панель -->
    <div v-if="!loading && stats" class="stats-grid">
      <div class="stat-card total">
        <div class="stat-icon">
          <i class="fas fa-calendar-alt"></i>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ stats.total || 0 }}</div>
          <div class="stat-label">Всего событий</div>
        </div>
      </div>
      
      <div class="stat-card upcoming">
        <div class="stat-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ stats.upcoming || 0 }}</div>
          <div class="stat-label">Предстоящих</div>
        </div>
      </div>
      
      <div class="stat-card completed">
        <div class="stat-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ stats.completed || 0 }}</div>
          <div class="stat-label">Завершённых</div>
        </div>
      </div>
      
      <div class="stat-card featured">
        <div class="stat-icon">
          <i class="fas fa-star"></i>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ stats.featured || 0 }}</div>
          <div class="stat-label">Избранных</div>
        </div>
      </div>
    </div>

    <!-- Панель управления и фильтры -->
    <div class="controls-panel">
      <!-- Поиск -->
      <div class="search-container">
        <div class="search-input-wrapper">
          <i class="fas fa-search search-icon"></i>
          <input 
            v-model="searchQuery" 
            @input="debouncedSearch"
            type="text" 
            placeholder="Поиск мероприятий..." 
            class="search-input"
          />
          <button 
            v-if="searchQuery" 
            @click="clearSearch" 
            class="clear-search-btn"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Фильтры и сортировка -->
      <div class="filters-row">
        <!-- Фильтры по статусу -->
        <div class="status-filters">
          <button 
            v-for="filter in statusFilters" 
            :key="filter.value"
            @click="setStatusFilter(filter.value)"
            class="filter-btn"
            :class="{ 
              'active': statusFilter === filter.value,
              [filter.value]: true 
            }"
          >
            <i :class="filter.icon"></i>
            <span>{{ filter.label }}</span>
            <span v-if="filter.count !== undefined" class="filter-count">({{ filter.count }})</span>
          </button>
        </div>

        <!-- Сортировка -->
        <select v-model="sortBy" @change="loadEvents" class="sort-select">
          <option value="date_desc">Сначала новые</option>
          <option value="date_asc">Сначала старые</option>
          <option value="name_asc">По названию А-Я</option>
          <option value="name_desc">По названию Я-А</option>
          <option value="rating_desc">По рейтингу ⬇</option>
          <option value="rating_asc">По рейтингу ⬆</option>
        </select>
      </div>
    </div>

    <!-- Загрузка -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка мероприятий...</p>
    </div>

    <!-- Ошибка -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <h3>Ошибка загрузки</h3>
      <p>{{ error }}</p>
      <button @click="loadEvents" class="retry-btn">
        <i class="fas fa-redo"></i>
        Попробовать снова
      </button>
    </div>

    <!-- Список мероприятий -->
    <div v-else-if="events.length > 0" class="events-list">
      <div 
        v-for="event in events" 
        :key="event.id" 
        class="event-card"
        :class="{
          'high-rating': event.my_rating >= 5,
          'upcoming': isUpcoming(event),
          'featured': event.is_featured
        }"
      >
        <!-- Превью баннера -->
        <div class="event-preview">
          <div 
            class="event-banner" 
            :style="{ backgroundImage: event.meta_image ? `url(${event.meta_image})` : 'none' }"
          >
            <div v-if="!event.meta_image" class="no-image-placeholder">
              <i class="fas fa-image"></i>
            </div>
            <div class="event-overlay"></div>
            
            <!-- Статус мероприятия -->
            <div class="event-status" :class="getEventStatusClass(event)">
              {{ getEventStatusText(event) }}
            </div>
            
            <!-- Значок избранного -->
            <div v-if="event.is_featured" class="featured-badge">
              <i class="fas fa-star"></i>
            </div>
          </div>
        </div>
        
        <!-- Информация о мероприятии -->
        <div class="event-info">
          <div class="event-main-info">
            <div class="event-header">
              <h3 class="event-title">{{ event.name }}</h3>
              <div v-if="event.subtitle" class="event-subtitle">{{ event.subtitle }}</div>
            </div>
            
            <div class="event-meta">
              <div class="event-meta-item">
                <i class="fas fa-calendar"></i>
                <span>{{ formatEventDate(event.event_date) }}</span>
              </div>
              
              <div v-if="event.city" class="event-meta-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>{{ event.city }}</span>
              </div>
              
              <div class="event-meta-item">
                <i :class="getEventTypeIcon(event.event_type)"></i>
                <span>{{ getEventTypeName(event.event_type) }}</span>
              </div>
            </div>
            
            <!-- Рейтинг -->
            <div v-if="event.my_rating" class="event-rating">
              <div class="rating-stars">
                <i 
                  v-for="star in 5" 
                  :key="star"
                  class="fas fa-star"
                  :class="{ 'active': star <= event.my_rating }"
                ></i>
              </div>
              <span class="rating-text">{{ event.my_rating }}/5</span>
            </div>
          </div>
          
          <!-- Дополнительная информация -->
          <div class="event-extras">
            <div v-if="event.attendees_count || event.expected_visitors" class="event-attendees">
              <i class="fas fa-users"></i>
              <span>{{ event.attendees_count || event.expected_visitors }} участников</span>
            </div>

            <div v-if="event.photos_count" class="event-photos">
              <i class="fas fa-images"></i>
              <span>{{ event.photos_count }} фото</span>
            </div>
          </div>
          
          <!-- Действия -->
          <div class="event-actions">
            <button @click="viewEvent(event)" class="action-btn view">
              <i class="fas fa-eye"></i>
              <span>Посмотреть</span>
            </button>
            <button @click="editEvent(event)" class="action-btn edit">
              <i class="fas fa-edit"></i>
              <span>Редактировать</span>
            </button>
            <button @click="duplicateEvent(event)" class="action-btn duplicate">
              <i class="fas fa-copy"></i>
              <span>Дублировать</span>
            </button>
            <button @click="deleteEvent(event)" class="action-btn delete">
              <i class="fas fa-trash"></i>
              <span>Удалить</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Пустое состояние -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-calendar-times"></i>
      </div>
      <h3>Мероприятия не найдены</h3>
      <p v-if="searchQuery || statusFilter !== 'all'">
        Попробуйте изменить критерии поиска или фильтры
      </p>
      <p v-else>
        Пока нет ни одного мероприятия. Создайте первое!
      </p>
      <div class="empty-actions">
        <button v-if="searchQuery || statusFilter !== 'all'" @click="clearFilters" class="action-btn">
          <i class="fas fa-filter"></i>
          <span>Очистить фильтры</span>
        </button>
        <button @click="openCreateModal" class="action-btn primary">
          <i class="fas fa-plus"></i>
          <span>Создать мероприятие</span>
        </button>
      </div>
    </div>

    <!-- Модальное окно создания/редактирования мероприятия -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal create-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="fas fa-plus"></i>
            {{ isEditing ? 'Редактировать мероприятие' : 'Создать новое мероприятие' }}
          </h3>
          <button @click="closeCreateModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="saveEvent" class="event-form">
            <!-- Основная информация -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fas fa-info-circle"></i>
                Основная информация
              </h4>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label required">Название мероприятия</label>
                  <input 
                    v-model="eventForm.name" 
                    type="text" 
                    class="form-input"
                    placeholder="Например: Any Furry Fest VII"
                    required
                  />
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Подзаголовок</label>
                  <input 
                    v-model="eventForm.subtitle" 
                    type="text" 
                    class="form-input"
                    placeholder="Краткое описание мероприятия"
                  />
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Описание</label>
                  <textarea 
                    v-model="eventForm.description" 
                    class="form-textarea"
                    placeholder="Подробное описание мероприятия..."
                    rows="4"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Дата и место -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fas fa-calendar-alt"></i>
                Дата и место проведения
              </h4>
              
              <div class="form-row two-columns">
                <div class="form-group">
                  <label class="form-label required">Дата проведения</label>
                  <input 
                    v-model="eventForm.event_date" 
                    type="date" 
                    class="form-input"
                    required
                  />
                </div>
                
                <div class="form-group">
                  <label class="form-label">Дата анонса</label>
                  <input 
                    v-model="eventForm.announced_date" 
                    type="date" 
                    class="form-input"
                  />
                </div>
              </div>
              
              <div class="form-row two-columns">
                <div class="form-group">
                  <label class="form-label">Город</label>
                  <input 
                    v-model="eventForm.city" 
                    type="text" 
                    class="form-input"
                    placeholder="Москва"
                  />
                </div>
                
                <div class="form-group">
                  <label class="form-label">Страна</label>
                  <input 
                    v-model="eventForm.country" 
                    type="text" 
                    class="form-input"
                    placeholder="Россия"
                  />
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Место проведения</label>
                  <input 
                    v-model="eventForm.location" 
                    type="text" 
                    class="form-input"
                    placeholder="Название площадки, адрес"
                  />
                </div>
              </div>
            </div>

            <!-- Тип и статус -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fas fa-tags"></i>
                Категории и статус
              </h4>
              
              <div class="form-row two-columns">
                <div class="form-group">
                  <label class="form-label">Тип мероприятия</label>
                  <select v-model="eventForm.event_type" class="form-select">
                    <option value="convention">Конвент</option>
                    <option value="market">Маркет</option>
                    <option value="festival">Фестиваль</option>
                    <option value="meetup">Встреча</option>
                    <option value="party">Вечеринка</option>
                    <option value="workshop">Мастер-класс</option>
                    <option value="other">Другое</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label class="form-label">Статус участия</label>
                  <select v-model="eventForm.attendance_status" class="form-select">
                    <option value="planning">Планирую</option>
                    <option value="registered">Зарегистрирован</option>
                    <option value="attended">Посетил</option>
                    <option value="missed">Пропустил</option>
                    <option value="cancelled">Отменено</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Оценка и статистика -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fas fa-chart-bar"></i>
                Оценка и статистика
              </h4>

              <div class="form-row two-columns">
                <div class="form-group">
                  <label class="form-label">Моя оценка</label>
                  <select v-model="eventForm.my_rating" class="form-select">
                    <option value="">Не оценено</option>
                    <option value="1">⭐ 1 - Очень плохо</option>
                    <option value="2">⭐⭐ 2 - Плохо</option>
                    <option value="3">⭐⭐⭐ 3 - Нормально</option>
                    <option value="4">⭐⭐⭐⭐ 4 - Хорошо</option>
                    <option value="5">⭐⭐⭐⭐⭐ 5 - Отлично</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Количество участников</label>
                  <input
                    v-model="eventForm.attendees_count"
                    type="number"
                    class="form-input"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Ожидаемых посетителей</label>
                  <input
                    v-model="eventForm.expected_visitors"
                    type="number"
                    class="form-input"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <!-- Покупки (только для фестивалей и маркетов) -->
            <div v-if="eventForm.event_type === 'festival' || eventForm.event_type === 'market'" class="form-section purchases-section">
              <h4 class="section-title">
                <i class="fas fa-shopping-bag"></i>
                Покупки и траты
              </h4>

              <div class="form-row two-columns">
                <div class="form-group">
                  <label class="form-label">Стоимость входа</label>
                  <input
                    v-model="eventForm.entrance_fee"
                    type="number"
                    class="form-input"
                    placeholder="0 ₽"
                    min="0"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Всего потрачено</label>
                  <input
                    v-model="eventForm.total_spent"
                    type="number"
                    class="form-input"
                    placeholder="0 ₽"
                    min="0"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Описание покупок</label>
                  <textarea
                    v-model="eventForm.purchases_summary"
                    class="form-textarea"
                    placeholder="Что было куплено на мероприятии..."
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Ссылки и изображения -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fas fa-link"></i>
                Ссылки и изображения
              </h4>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Официальный сайт</label>
                  <input 
                    v-model="eventForm.official_website" 
                    type="url" 
                    class="form-input"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Баннер (URL изображения)</label>
                  <input 
                    v-model="eventForm.meta_image" 
                    type="url" 
                    class="form-input"
                    placeholder="https://example.com/banner.jpg"
                  />
                </div>
              </div>
            </div>

            <!-- Дополнительные опции -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fas fa-cog"></i>
                Дополнительные опции
              </h4>
              
              <div class="form-checkboxes">
                <label class="checkbox-label">
                  <input v-model="eventForm.is_featured" type="checkbox" class="form-checkbox" />
                  <span class="checkbox-custom"></span>
                  <span class="checkbox-text">
                    <i class="fas fa-star"></i>
                    Избранное мероприятие
                  </span>
                </label>
                
                <label class="checkbox-label">
                  <input v-model="eventForm.has_dealers_den" type="checkbox" class="form-checkbox" />
                  <span class="checkbox-custom"></span>
                  <span class="checkbox-text">
                    <i class="fas fa-store"></i>
                    Есть торговая зона
                  </span>
                </label>
                
                <label class="checkbox-label">
                  <input v-model="eventForm.has_art_show" type="checkbox" class="form-checkbox" />
                  <span class="checkbox-custom"></span>
                  <span class="checkbox-text">
                    <i class="fas fa-palette"></i>
                    Есть арт-шоу
                  </span>
                </label>
                
                <label class="checkbox-label">
                  <input v-model="eventForm.has_fursuit_parade" type="checkbox" class="form-checkbox" />
                  <span class="checkbox-custom"></span>
                  <span class="checkbox-text">
                    <i class="fas fa-mask"></i>
                    Есть фурсьют-парад
                  </span>
                </label>
              </div>
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button @click="closeCreateModal" class="cancel-btn" :disabled="saving">
            <i class="fas fa-times"></i>
            <span>Отменить</span>
          </button>
          <button @click="saveEvent" class="save-btn" :disabled="saving || !isFormValid">
            <i class="fas fa-spinner fa-spin" v-if="saving"></i>
            <i class="fas fa-save" v-else></i>
            <span>{{ saving ? 'Сохранение...' : (isEditing ? 'Сохранить изменения' : 'Создать мероприятие') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно подтверждения удаления -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal delete-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title danger">
            <i class="fas fa-exclamation-triangle"></i>
            Удалить мероприятие?
          </h3>
          <button @click="closeDeleteModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <p>Вы действительно хотите удалить мероприятие <strong>{{ eventToDelete?.name }}</strong>?</p>
          <p class="warning">
            <i class="fas fa-exclamation-circle"></i>
            Это действие невозможно отменить. Будут удалены все связанные данные: покупки, фотографии, отзывы и т.д.
          </p>
        </div>
        
        <div class="modal-footer">
          <button @click="closeDeleteModal" class="cancel-btn" :disabled="deleting">
            <i class="fas fa-times"></i>
            <span>Отменить</span>
          </button>
          <button @click="confirmDelete" class="delete-btn" :disabled="deleting">
            <i class="fas fa-spinner fa-spin" v-if="deleting"></i>
            <i class="fas fa-trash" v-else></i>
            <span>{{ deleting ? 'Удаление...' : 'Удалить мероприятие' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { furryApi } from '@/config/supabase.js'

export default {
  name: 'AdminEventsPanel',
  
  emits: ['notification'],
  
  data() {
    return {
      // Состояние загрузки
      loading: true,
      error: null,
      
      // Данные
      events: [],
      stats: {
        total: 0,
        upcoming: 0,
        completed: 0,
        featured: 0
      },
      
      // Фильтрация и поиск
      searchQuery: '',
      searchTimeout: null,
      statusFilter: 'all',
      sortBy: 'date_desc',
      
      // Модальные окна
      showCreateModal: false,
      showDeleteModal: false,
      
      // Форма создания/редактирования
      isEditing: false,
      saving: false,
      eventForm: this.getEmptyForm(),
      
      // Удаление
      eventToDelete: null,
      deleting: false
    }
  },
  
  computed: {
    statusFilters() {
      return [
        {
          value: 'all',
          label: 'Все',
          icon: 'fas fa-list',
          count: this.stats.total
        },
        {
          value: 'upcoming',
          label: 'Предстоящие',
          icon: 'fas fa-clock',
          count: this.stats.upcoming
        },
        {
          value: 'completed',
          label: 'Завершённые',
          icon: 'fas fa-check-circle',
          count: this.stats.completed
        },
        {
          value: 'featured',
          label: 'Избранные',
          icon: 'fas fa-star',
          count: this.stats.featured
        }
      ]
    },
    
    isFormValid() {
      return this.eventForm.name && 
             this.eventForm.name.trim().length > 0 &&
             this.eventForm.event_date
    }
  },
  
  async mounted() {
    await this.loadInitialData()
  },
  
  methods: {
    // ============================================
    // ИНИЦИАЛИЗАЦИЯ И ЗАГРУЗКА ДАННЫХ
    // ============================================
    
    async loadInitialData() {
      this.loading = true
      this.error = null
      
      try {
        await Promise.all([
          this.loadEvents(),
          this.loadStats()
        ])
      } catch (error) {
        console.error('❌ AdminEvents: Ошибка инициализации:', error)
        this.error = error.message || 'Ошибка загрузки данных'
      } finally {
        this.loading = false
      }
    },
    
    async loadEvents() {
      try {
        console.log('🎪 AdminEvents: Загружаем мероприятия...')
        
        const events = await furryApi.getEvents({
          status: this.statusFilter === 'all' ? undefined : this.statusFilter,
          sort: this.sortBy,
          limit: 100,
          search: this.searchQuery.trim() || undefined
        })
        
        this.events = events || []
        
        console.log('✅ AdminEvents: Мероприятия загружены:', this.events.length)
        
      } catch (error) {
        console.error('❌ AdminEvents: Ошибка загрузки мероприятий:', error)
        throw error
      }
    },
    
    async loadStats() {
      try {
        this.stats = await furryApi.getEventsStats()
        console.log('✅ AdminEvents: Статистика загружена:', this.stats)
      } catch (error) {
        console.error('❌ AdminEvents: Ошибка загрузки статистики:', error)
        // Не прокидываем ошибку для статистики
      }
    },
    
    async refreshData() {
      await this.loadInitialData()
      this.$emit('notification', 'Данные обновлены', 'success')
    },
    
    // ============================================
    // ФИЛЬТРАЦИЯ И ПОИСК
    // ============================================
    
    setStatusFilter(filter) {
      if (this.statusFilter !== filter) {
        this.statusFilter = filter
        this.loadEvents()
      }
    },
    
    debouncedSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.loadEvents()
      }, 500)
    },
    
    clearSearch() {
      this.searchQuery = ''
      this.loadEvents()
    },
    
    clearFilters() {
      this.searchQuery = ''
      this.statusFilter = 'all'
      this.loadEvents()
    },
    
    // ============================================
    // СОЗДАНИЕ И РЕДАКТИРОВАНИЕ МЕРОПРИЯТИЙ
    // ============================================
    
    getEmptyForm() {
      return {
        name: '',
        slug: '',
        subtitle: '',
        description: '',
        event_date: '',
        announced_date: '',
        location: '',
        city: '',
        country: '',
        event_type: 'convention',
        attendance_status: 'planning',
        my_rating: null,
        total_spent: null,
        attendees_count: null,
        expected_visitors: null,
        entrance_fee: null,
        purchases_summary: '',
        official_website: '',
        meta_image: '',
        is_featured: false,
        has_dealers_den: false,
        has_art_show: false,
        has_fursuit_parade: false
      }
    },
    
    openCreateModal() {
      this.isEditing = false
      this.eventForm = this.getEmptyForm()
      this.showCreateModal = true
    },
    
    closeCreateModal() {
      this.showCreateModal = false
      this.isEditing = false
      this.eventForm = this.getEmptyForm()
    },
    
    editEvent(event) {
      this.isEditing = true
      this.eventForm = { ...event }
      this.showCreateModal = true
    },
    
    async saveEvent() {
      if (!this.isFormValid) return
      
      this.saving = true
      
      try {
        // Генерируем slug из названия
        if (!this.eventForm.slug) {
          this.eventForm.slug = this.generateSlug(this.eventForm.name)
        }
        
        let savedEvent
        
        if (this.isEditing) {
          console.log('✏️ AdminEvents: Обновляем мероприятие:', this.eventForm.id)
          savedEvent = await furryApi.updateEvent(this.eventForm.id, this.eventForm)
        } else {
          console.log('➕ AdminEvents: Создаём новое мероприятие')
          savedEvent = await furryApi.createEvent(this.eventForm)
        }
        
        console.log('✅ AdminEvents: Мероприятие сохранено:', savedEvent)
        
        // Обновляем локальные данные
        if (this.isEditing) {
          const index = this.events.findIndex(e => e.id === savedEvent.id)
          if (index !== -1) {
            this.events.splice(index, 1, savedEvent)
          }
        } else {
          this.events.unshift(savedEvent)
        }
        
        this.closeCreateModal()
        await this.loadStats()
        
        this.$emit('notification', 
          `Мероприятие "${savedEvent.name}" ${this.isEditing ? 'обновлено' : 'создано'}!`, 
          'success'
        )
        
      } catch (error) {
        console.error('❌ AdminEvents: Ошибка сохранения:', error)
        this.$emit('notification', 
          `Ошибка сохранения: ${error.message}`, 
          'error'
        )
      } finally {
        this.saving = false
      }
    },
    
    duplicateEvent(event) {
      this.isEditing = false
      this.eventForm = {
        ...event,
        id: undefined,
        name: `${event.name} (копия)`,
        slug: '',
        created_at: undefined,
        updated_at: undefined
      }
      this.showCreateModal = true
    },
    
    generateSlug(name) {
      return name
        .toLowerCase()
        .replace(/[^a-zа-я0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-')
        .substring(0, 50)
    },
    
    // ============================================
    // УДАЛЕНИЕ МЕРОПРИЯТИЙ
    // ============================================
    
    deleteEvent(event) {
      this.eventToDelete = event
      this.showDeleteModal = true
    },
    
    closeDeleteModal() {
      this.showDeleteModal = false
      this.eventToDelete = null
    },
    
    async confirmDelete() {
      if (!this.eventToDelete) return
      
      this.deleting = true
      
      try {
        console.log('🗑️ AdminEvents: Удаляем мероприятие:', this.eventToDelete.id)
        
        await furryApi.deleteEvent(this.eventToDelete.id)
        
        // Удаляем из локального списка
        const index = this.events.findIndex(e => e.id === this.eventToDelete.id)
        if (index !== -1) {
          this.events.splice(index, 1)
        }
        
        await this.loadStats()
        
        this.$emit('notification', 
          `Мероприятие "${this.eventToDelete.name}" удалено`, 
          'success'
        )
        
        this.closeDeleteModal()
        
      } catch (error) {
        console.error('❌ AdminEvents: Ошибка удаления:', error)
        this.$emit('notification', 
          `Ошибка удаления: ${error.message}`, 
          'error'
        )
      } finally {
        this.deleting = false
      }
    },
    
    // ============================================
    // ДЕЙСТВИЯ С МЕРОПРИЯТИЯМИ
    // ============================================
    
    viewEvent(event) {
      if (event.slug) {
        const url = `/events/${event.slug}`
        window.open(url, '_blank')
      } else {
        this.$emit('notification', 'У мероприятия нет slug для просмотра', 'warning')
      }
    },
    
    // ============================================
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // ============================================
    
    isUpcoming(event) {
      return new Date(event.event_date) > new Date()
    },
    
    getEventStatusClass(event) {
      return this.isUpcoming(event) ? 'upcoming' : 'completed'
    },
    
    getEventStatusText(event) {
      const statusMap = {
        planning: 'Планируется',
        registered: 'Зарегистрирован', 
        attended: 'Посетил',
        missed: 'Пропустил',
        cancelled: 'Отменено'
      }
      return statusMap[event.attendance_status] || (this.isUpcoming(event) ? 'Предстоящее' : 'Завершённое')
    },
    
    getEventTypeIcon(type) {
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
    
    getEventTypeName(type) {
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
    
    formatEventDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    
    formatMoney(amount) {
      if (!amount) return '0 ₽'
      return `${Number(amount).toLocaleString('ru-RU')} ₽`
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
   🎨 ОСНОВНЫЕ СТИЛИ И CSS ПЕРЕМЕННЫЕ
   =============================================== */

.admin-events-panel {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2a2a2a;
  --bg-card: rgba(255, 255, 255, 0.05);
  --bg-card-hover: rgba(255, 255, 255, 0.08);
  
  --text-light: #f2f2f2;
  --text-muted: #a0a0a0;
  --text-dim: #666666;
  
  --accent-green: #4caf50;
  --accent-orange: #ff7b25;
  --accent-red: #f44336;
  --accent-blue: #2196f3;
  --accent-purple: #9c27b0;
  
  --border-light: rgba(255, 255, 255, 0.1);
  --border-medium: rgba(255, 255, 255, 0.2);
  
  --shadow-soft: 0 4px 20px rgba(0, 0, 0, 0.15);
  --shadow-strong: 0 8px 32px rgba(0, 0, 0, 0.25);
  
  --border-radius-small: 0.5rem;
  --border-radius-medium: 0.75rem;
  --border-radius-large: 1rem;
  
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-light);
  font-family: 'Nunito', sans-serif;
  padding: 2rem;
}

/* ===============================================
   📋 ЗАГОЛОВОК ПАНЕЛИ
   =============================================== */

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
}

.header-content h2.panel-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-light);
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.panel-title i {
  color: var(--accent-orange);
}

.panel-description {
  font-size: 1.1rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.4;
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.refresh-btn, .add-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-medium);
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
}

.refresh-btn:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-medium);
  transform: translateY(-2px);
}

.add-btn {
  background: var(--accent-green);
  border-color: var(--accent-green);
  color: white;
}

.add-btn:hover {
  background: #45a049;
  border-color: #45a049;
  transform: translateY(-2px);
  box-shadow: var(--shadow-soft);
}

.refresh-btn:disabled,
.add-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ===============================================
   📊 СТАТИСТИЧЕСКИЕ КАРТОЧКИ
   =============================================== */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-large);
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: var(--bg-card-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-soft);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-card.total .stat-icon {
  background: var(--accent-blue);
}

.stat-card.upcoming .stat-icon {
  background: var(--accent-orange);
}

.stat-card.completed .stat-icon {
  background: var(--accent-green);
}

.stat-card.featured .stat-icon {
  background: var(--accent-purple);
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-light);
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

/* ===============================================
   🔍 ПАНЕЛЬ УПРАВЛЕНИЯ И ФИЛЬТРОВ
   =============================================== */

.controls-panel {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-large);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.search-container {
  margin-bottom: 1.5rem;
}

.search-input-wrapper {
  position: relative;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-medium);
  color: var(--text-light);
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-blue);
  background: rgba(255, 255, 255, 0.08);
}

.clear-search-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 2rem;
  height: 2rem;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.clear-search-btn:hover {
  color: var(--text-light);
  background: rgba(255, 255, 255, 0.1);
}

.filters-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.status-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-medium);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  font-size: 0.9rem;
}

.filter-btn:hover {
  color: var(--text-light);
  border-color: var(--border-medium);
  background: rgba(255, 255, 255, 0.05);
}

.filter-btn.active {
  background: var(--accent-blue);
  border-color: var(--accent-blue);
  color: white;
}

.filter-btn.active.upcoming {
  background: var(--accent-orange);
  border-color: var(--accent-orange);
}

.filter-btn.active.completed {
  background: var(--accent-green);
  border-color: var(--accent-green);
}

.filter-btn.active.featured {
  background: var(--accent-purple);
  border-color: var(--accent-purple);
}

.filter-count {
  font-size: 0.8rem;
  opacity: 0.8;
}

.sort-select {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-medium);
  color: var(--text-light);
  cursor: pointer;
  font-size: 0.9rem;
  font-family: inherit;
}

.sort-select:focus {
  outline: none;
  border-color: var(--accent-blue);
}

/* ===============================================
   📋 СОСТОЯНИЯ ЗАГРУЗКИ И ОШИБОК
   =============================================== */

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid var(--border-light);
  border-top-color: var(--accent-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.error-icon,
.empty-icon {
  font-size: 4rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.error-state h3,
.empty-state h3 {
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

.error-state p,
.empty-state p {
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

.retry-btn,
.empty-actions .action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--accent-blue);
  border: none;
  border-radius: var(--border-radius-medium);
  color: white;
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  transition: all 0.3s ease;
}

.empty-actions .action-btn.primary {
  background: var(--accent-green);
}

.retry-btn:hover,
.empty-actions .action-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-soft);
}

.empty-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* ===============================================
   📅 СПИСОК МЕРОПРИЯТИЙ
   =============================================== */

.events-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.event-card {
  display: flex;
  background: var(--bg-card);
  border-radius: var(--border-radius-large);
  overflow: hidden;
  border: 1px solid var(--border-light);
  transition: all 0.3s ease;
}

.event-card:hover {
  background: var(--bg-card-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-soft);
}

.event-card.featured {
  border-color: var(--accent-purple);
  box-shadow: 0 0 0 1px rgba(156, 39, 176, 0.3);
}

.event-card.high-rating {
  border-color: var(--accent-green);
}

.event-preview {
  width: 200px;
  flex-shrink: 0;
}

.event-banner {
  width: 100%;
  height: 180px;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-image-placeholder {
  font-size: 2rem;
  color: var(--text-muted);
}

.event-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1));
}

.event-status,
.featured-badge {
  position: absolute;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
  z-index: 2;
}

.event-status {
  top: 0.75rem;
  left: 0.75rem;
}

.event-status.upcoming {
  background: rgba(255, 123, 37, 0.9);
  color: white;
}

.event-status.completed {
  background: rgba(76, 175, 80, 0.9);
  color: white;
}

.featured-badge {
  top: 0.75rem;
  right: 0.75rem;
  width: 30px;
  height: 30px;
  background: rgba(255, 193, 7, 0.9);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.event-info {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-main-info {
  flex: 1;
}

.event-header {
  margin-bottom: 1rem;
}

.event-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-light);
  margin: 0 0 0.25rem 0;
  line-height: 1.2;
}

.event-subtitle {
  font-size: 0.95rem;
  color: var(--text-muted);
  line-height: 1.3;
}

.event-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.event-meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.event-meta-item i {
  color: var(--accent-orange);
  width: 1.2rem;
  text-align: center;
}

.event-rating {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.rating-stars {
  display: flex;
  gap: 0.25rem;
}

.rating-stars i {
  color: var(--text-dim);
  font-size: 1rem;
  transition: color 0.2s ease;
}

.rating-stars i.active {
  color: #ffc107;
}

.rating-text {
  font-size: 0.9rem;
  color: var(--text-muted);
  font-weight: 600;
}

.event-extras {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.event-attendees,
.event-photos {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.event-attendees i {
  color: var(--accent-blue);
}

.event-photos i {
  color: var(--accent-purple);
}

.event-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-small);
  color: var(--text-muted);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.action-btn:hover {
  color: var(--text-light);
  border-color: var(--border-medium);
  background: rgba(255, 255, 255, 0.05);
}

.action-btn.view:hover {
  color: var(--accent-blue);
  border-color: var(--accent-blue);
  background: rgba(33, 150, 243, 0.1);
}

.action-btn.edit:hover {
  color: var(--accent-orange);
  border-color: var(--accent-orange);
  background: rgba(255, 123, 37, 0.1);
}

.action-btn.duplicate:hover {
  color: var(--accent-purple);
  border-color: var(--accent-purple);
  background: rgba(156, 39, 176, 0.1);
}

.action-btn.delete:hover {
  color: var(--accent-red);
  border-color: var(--accent-red);
  background: rgba(244, 67, 54, 0.1);
}

/* ===============================================
   🪟 МОДАЛЬНЫЕ ОКНА
   =============================================== */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--bg-secondary);
  border: 1px solid var(--border-medium);
  border-radius: var(--border-radius-large);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-strong);
}

.modal.delete-modal {
  max-width: 500px;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-card);
}

.modal-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-light);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-title.danger {
  color: var(--accent-red);
}

.modal-close {
  width: 2.5rem;
  height: 2.5rem;
  background: none;
  border: 1px solid var(--border-light);
  border-radius: 50%;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close:hover {
  color: var(--text-light);
  border-color: var(--border-medium);
  background: rgba(255, 255, 255, 0.05);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-light);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  background: var(--bg-card);
}

.cancel-btn,
.save-btn,
.delete-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-medium);
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: transparent;
  color: var(--text-muted);
}

.cancel-btn:hover {
  color: var(--text-light);
  border-color: var(--border-medium);
  background: rgba(255, 255, 255, 0.05);
}

.save-btn {
  background: var(--accent-green);
  border-color: var(--accent-green);
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #45a049;
  border-color: #45a049;
  transform: translateY(-1px);
  box-shadow: var(--shadow-soft);
}

.delete-btn {
  background: var(--accent-red);
  border-color: var(--accent-red);
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background: #d32f2f;
  border-color: #d32f2f;
  transform: translateY(-1px);
  box-shadow: var(--shadow-soft);
}

.save-btn:disabled,
.delete-btn:disabled,
.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.warning {
  background: rgba(255, 152, 0, 0.1);
  border: 1px solid rgba(255, 152, 0, 0.3);
  border-radius: var(--border-radius-small);
  padding: 1rem;
  color: #ff9800;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* ===============================================
   📝 ФОРМА СОЗДАНИЯ МЕРОПРИЯТИЙ
   =============================================== */

.event-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-medium);
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
}

.form-section.purchases-section {
  border-color: var(--accent-green);
  background: rgba(76, 175, 80, 0.05);
}

.form-section.purchases-section .section-title i {
  color: var(--accent-green);
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-light);
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title i {
  color: var(--accent-orange);
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-row.two-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-group {
  flex: 1;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

.form-label.required::after {
  content: '*';
  color: var(--accent-red);
  margin-left: 0.25rem;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-small);
  color: var(--text-light);
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent-blue);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: var(--border-radius-small);
  transition: background 0.2s ease;
}

.checkbox-label:hover {
  background: rgba(255, 255, 255, 0.05);
}

.form-checkbox {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-medium);
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
}

.form-checkbox:checked + .checkbox-custom {
  background: var(--accent-blue);
  border-color: var(--accent-blue);
}

.form-checkbox:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.checkbox-text {
  color: var(--text-light);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-text i {
  color: var(--accent-orange);
  width: 1.2rem;
  text-align: center;
}

/* ===============================================
   📱 АДАПТИВНЫЙ ДИЗАЙН
   =============================================== */

@media (max-width: 768px) {
  .admin-events-panel {
    padding: 1rem;
  }
  
  .panel-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .refresh-btn,
  .add-btn {
    flex: 1;
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-row {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .status-filters {
    justify-content: center;
  }
  
  .event-card {
    flex-direction: column;
  }
  
  .event-preview {
    width: 100%;
  }
  
  .event-banner {
    height: 200px;
  }
  
  .form-row.two-columns {
    grid-template-columns: 1fr;
  }
  
  .modal {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  .form-checkboxes {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .panel-title {
    font-size: 2rem !important;
  }
  
  .event-actions {
    flex-direction: column;
  }
  
  .action-btn {
    justify-content: center;
  }
  
  .modal-footer {
    flex-direction: column-reverse;
  }
  
  .cancel-btn,
  .save-btn,
  .delete-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>