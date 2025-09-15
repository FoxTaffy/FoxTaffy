<template>
  <div class="admin-events-panel">
    <!-- Заголовок -->
    <div class="panel-header">
      <div class="header-content">
        <h2 class="panel-title">
          <i class="fas fa-calendar-alt"></i>
          Управление мероприятиями
        </h2>
        <p class="panel-description">Создание, редактирование и управление всеми мероприятиями</p>
      </div>
      
      <div class="header-actions">
        <button @click="openCreateModal" class="add-btn" :disabled="loading">
          <i class="fas fa-plus"></i>
          <span>Создать мероприятие</span>
        </button>
      </div>
    </div>

    <!-- Статистика -->
    <div v-if="!loading && stats" class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon total">
          <i class="fas fa-calendar-alt"></i>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ stats.total }}</div>
          <div class="stat-label">Всего событий</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon upcoming">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ stats.upcoming }}</div>
          <div class="stat-label">Предстоящих</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon completed">
          <i class="fas fa-check"></i>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ stats.completed }}</div>
          <div class="stat-label">Завершённых</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon money">
          <i class="fas fa-ruble-sign"></i>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ formatMoney(stats.totalSpent) }}</div>
          <div class="stat-label">Потрачено</div>
        </div>
      </div>
    </div>

    <!-- Фильтры и поиск -->
    <div class="filters-section">
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
      
      <select v-model="statusFilter" @change="loadEvents" class="filter-select">
        <option value="all">Все статусы</option>
        <option value="upcoming">Предстоящие</option>
        <option value="completed">Завершённые</option>
        <option value="featured">Избранные</option>
      </select>
      
      <select v-model="sortBy" @change="loadEvents" class="filter-select">
        <option value="date_desc">Сначала новые</option>
        <option value="date_asc">Сначала старые</option>
        <option value="name_asc">По названию</option>
        <option value="created_desc">По дате создания</option>
      </select>
      
      <button @click="refreshData" class="refresh-btn" :disabled="loading">
        <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
        <span>Обновить</span>
      </button>
    </div>

    <!-- Загрузка -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Загружаем мероприятия...</p>
    </div>

    <!-- Ошибка -->
    <div v-else-if="error" class="error-container">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <button @click="loadEvents" class="retry-btn">Попробовать снова</button>
    </div>

    <!-- Список мероприятий -->
    <div v-else class="events-list">
      <div v-if="filteredEvents.length === 0" class="no-events">
        <i class="fas fa-calendar-plus"></i>
        <h3>Мероприятия не найдены</h3>
        <p>Попробуйте изменить фильтры или создайте новое мероприятие</p>
      </div>
      
      <div 
        v-else
        v-for="event in filteredEvents" 
        :key="event.id" 
        class="event-card"
        :class="{ 'featured': event.is_featured }"
      >
        <!-- Превью -->
        <div class="event-preview">
          <div class="event-banner" :style="{ backgroundImage: getBannerImage(event.banner_url) }">
            <div class="event-overlay"></div>
            <div class="event-status" :class="getEventStatusClass(event)">
              {{ getEventStatusText(event) }}
            </div>
            <div v-if="event.is_featured" class="featured-badge">
              <i class="fas fa-star"></i>
            </div>
          </div>
        </div>
        
        <!-- Информация -->
        <div class="event-info">
          <div class="event-header">
            <h3 class="event-name">{{ event.name }}</h3>
            <div v-if="event.subtitle" class="event-subtitle">{{ event.subtitle }}</div>
          </div>
          
          <div class="event-details">
            <div class="event-detail">
              <i class="fas fa-calendar-alt"></i>
              <span>{{ formatEventDate(event.event_date) }}</span>
            </div>
            <div class="event-detail">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ event.location }}</span>
            </div>
            <div v-if="event.attendees_count" class="event-detail">
              <i class="fas fa-users"></i>
              <span>{{ event.attendees_count }} чел.</span>
            </div>
            <div class="event-detail">
              <i class="fas fa-tag"></i>
              <span>{{ getEventTypeName(event.event_type) }}</span>
            </div>
          </div>
          
          <!-- Статистика связанных данных -->
          <div class="event-stats">
            <div v-if="event.photos_count > 0" class="stat-item">
              <i class="fas fa-images"></i>
              <span>{{ event.photos_count }}</span>
            </div>
            <div v-if="event.purchases_count > 0" class="stat-item">
              <i class="fas fa-shopping-bag"></i>
              <span>{{ event.purchases_count }}</span>
            </div>
            <div v-if="event.links_count > 0" class="stat-item">
              <i class="fas fa-link"></i>
              <span>{{ event.links_count }}</span>
            </div>
            <div v-if="event.features_count > 0" class="stat-item">
              <i class="fas fa-star"></i>
              <span>{{ event.features_count }}</span>
            </div>
            <div v-if="event.total_spent > 0" class="stat-item money">
              <i class="fas fa-ruble-sign"></i>
              <span>{{ formatMoney(event.total_spent) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Действия -->
        <div class="event-actions">
          <router-link 
            :to="`/events/${event.slug}`" 
            class="action-btn view-btn"
            title="Просмотр"
            target="_blank"
          >
            <i class="fas fa-eye"></i>
          </router-link>
          
          <button 
            @click="editEvent(event)" 
            class="action-btn edit-btn"
            title="Редактировать"
          >
            <i class="fas fa-edit"></i>
          </button>
          
          <button 
            @click="manageEventData(event)" 
            class="action-btn manage-btn"
            title="Управление данными"
          >
            <i class="fas fa-cogs"></i>
          </button>
          
          <button 
            @click="deleteEvent(event)" 
            class="action-btn delete-btn"
            title="Удалить"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно создания/редактирования -->
    <div v-if="showEventModal" class="modal-overlay" @click="closeEventModal">
      <div class="modal-content large-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <i :class="isEditMode ? 'fas fa-edit' : 'fas fa-plus'"></i>
            {{ isEditMode ? 'Редактирование мероприятия' : 'Новое мероприятие' }}
          </h3>
          <button @click="closeEventModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="saveEvent" class="event-form">
            
            <!-- Основная информация -->
            <div class="form-section">
              <h4 class="section-title">Основная информация</h4>
              
              <div class="form-group">
                <label for="event-name">Название мероприятия *</label>
                <input 
                  id="event-name"
                  v-model="eventForm.name" 
                  type="text" 
                  required 
                  placeholder="Например: Any Furry Fest VII"
                  @input="generateSlug"
                >
              </div>
              
              <div class="form-group">
                <label for="event-subtitle">Подзаголовок</label>
                <input 
                  id="event-subtitle"
                  v-model="eventForm.subtitle" 
                  type="text" 
                  placeholder="Краткое описание мероприятия"
                >
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="event-slug">URL slug *</label>
                  <input 
                    id="event-slug"
                    v-model="eventForm.slug" 
                    type="text" 
                    required 
                    placeholder="any-furry-fest-7"
                    pattern="[a-z0-9-]+"
                    @blur="validateSlug"
                  >
                  <small class="form-hint">Только строчные буквы, цифры и дефисы</small>
                </div>
                
                <div class="form-group">
                  <label for="event-date">Дата и время проведения *</label>
                  <input 
                    id="event-date"
                    v-model="eventForm.event_date" 
                    type="datetime-local" 
                    required
                  >
                </div>
              </div>
              
              <div class="form-group">
                <label for="event-description">Описание</label>
                <textarea 
                  id="event-description"
                  v-model="eventForm.description" 
                  rows="4" 
                  placeholder="Подробное описание мероприятия..."
                ></textarea>
              </div>
            </div>

            <!-- Медиа контент -->
            <div class="form-section">
              <h4 class="section-title">Изображения</h4>
              
              <div class="form-group">
                <label>Баннер мероприятия</label>
                <div class="image-upload-section">
                  <!-- Загрузчик изображений -->
                  <div class="image-uploader">
                    <input 
                      ref="bannerInput"
                      type="file" 
                      accept="image/*" 
                      @change="handleBannerUpload"
                      style="display: none"
                    >
                    
                    <!-- Превью текущего баннера -->
                    <div v-if="eventForm.banner_url" class="image-preview">
                      <img :src="eventForm.banner_url" alt="Баннер" class="preview-image">
                      <div class="image-overlay">
                        <button 
                          type="button" 
                          @click="$refs.bannerInput.click()" 
                          class="overlay-btn"
                          :disabled="uploading"
                        >
                          <i class="fas fa-edit"></i>
                          Изменить
                        </button>
                        <button 
                          type="button" 
                          @click="removeBanner" 
                          class="overlay-btn delete"
                          :disabled="uploading"
                        >
                          <i class="fas fa-trash"></i>
                          Удалить
                        </button>
                      </div>
                    </div>
                    
                    <!-- Зона загрузки -->
                    <div v-else class="upload-zone" @click="$refs.bannerInput.click()">
                      <div v-if="uploading" class="upload-progress">
                        <div class="spinner"></div>
                        <p>Загружаем изображение...</p>
                        <div class="progress-bar">
                          <div class="progress-fill" :style="{ width: `${uploadProgress}%` }"></div>
                        </div>
                      </div>
                      <div v-else class="upload-content">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <h4>Загрузить баннер</h4>
                        <p>Нажмите для выбора изображения</p>
                        <small>Рекомендуется: 1200x400px, до 5MB</small>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Или введите URL вручную -->
                  <div class="url-input-section">
                    <label for="banner-url">Или введите URL изображения:</label>
                    <input 
                      id="banner-url"
                      v-model="eventForm.banner_url" 
                      type="url" 
                      placeholder="https://example.com/banner.jpg"
                      :disabled="uploading"
                    >
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Локация -->
            <div class="form-section">
              <h4 class="section-title">Место проведения</h4>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="event-location">Название площадки *</label>
                  <input 
                    id="event-location"
                    v-model="eventForm.location" 
                    type="text" 
                    required 
                    placeholder="Парк-отель 'Воздвиженское'"
                  >
                </div>
                
                <div class="form-group">
                  <label for="event-city">Город</label>
                  <input 
                    id="event-city"
                    v-model="eventForm.city" 
                    type="text" 
                    placeholder="Москва"
                  >
                </div>
              </div>
              
              <div class="form-group">
                <label for="event-address">Адрес</label>
                <input 
                  id="event-address"
                  v-model="eventForm.address" 
                  type="text" 
                  placeholder="Полный адрес площадки"
                >
              </div>
            </div>
            
            <!-- Настройки мероприятия -->
            <div class="form-section">
              <h4 class="section-title">Настройки</h4>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="event-type">Тип мероприятия</label>
                  <select id="event-type" v-model="eventForm.event_type">
                    <option value="convention">Конвент</option>
                    <option value="meeting">Встреча</option>
                    <option value="party">Вечеринка</option>
                    <option value="workshop">Мастер-класс</option>
                    <option value="market">Маркет</option>
                    <option value="other">Другое</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="attendance-status">Статус участия</label>
                  <select id="attendance-status" v-model="eventForm.attendance_status">
                    <option value="planning">Планируется</option>
                    <option value="registered">Зарегистрирован</option>
                    <option value="attended">Посетил</option>
                    <option value="missed">Пропустил</option>
                    <option value="cancelled">Отменено</option>
                  </select>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="attendees-count">Ожидаемое количество участников</label>
                  <input 
                    id="attendees-count"
                    v-model.number="eventForm.attendees_count" 
                    type="number" 
                    min="0"
                    placeholder="500"
                  >
                </div>
                
                <div class="form-group">
                  <label for="entrance-fee">Входная плата (₽)</label>
                  <input 
                    id="entrance-fee"
                    v-model.number="eventForm.entrance_fee" 
                    type="number" 
                    min="0"
                    step="0.01"
                    placeholder="0"
                  >
                </div>
              </div>
            </div>
            
            <!-- Особенности мероприятия -->
            <div class="form-section">
              <h4 class="section-title">Особенности</h4>
              
              <div class="form-checkboxes">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="eventForm.has_dealers_den">
                  <span class="checkbox-text">Есть торговая зона (Dealers Den)</span>
                </label>
                
                <label class="checkbox-label">
                  <input type="checkbox" v-model="eventForm.has_art_show">
                  <span class="checkbox-text">Есть арт-выставка (Art Show)</span>
                </label>
                
                <label class="checkbox-label">
                  <input type="checkbox" v-model="eventForm.has_fursuit_parade">
                  <span class="checkbox-text">Есть фурсьют парад</span>
                </label>
                
                <label class="checkbox-label">
                  <input type="checkbox" v-model="eventForm.has_competitions">
                  <span class="checkbox-text">Есть конкурсы и состязания</span>
                </label>
                
                <label class="checkbox-label">
                  <input type="checkbox" v-model="eventForm.is_featured">
                  <span class="checkbox-text">Избранное мероприятие</span>
                </label>
                
                <label class="checkbox-label">
                  <input type="checkbox" v-model="eventForm.is_online">
                  <span class="checkbox-text">Онлайн мероприятие</span>
                </label>
              </div>
            </div>
            
            <!-- Дополнительные ссылки -->
            <div class="form-section">
              <h4 class="section-title">Ссылки</h4>
              
              <div class="form-group">
                <label for="official-website">Официальный сайт</label>
                <input 
                  id="official-website"
                  v-model="eventForm.official_website" 
                  type="url" 
                  placeholder="https://example.com"
                >
              </div>
              
              <div class="form-group">
                <label for="tickets-url">Ссылка на билеты</label>
                <input 
                  id="tickets-url"
                  v-model="eventForm.tickets_url" 
                  type="url" 
                  placeholder="https://tickets.example.com"
                >
              </div>
            </div>
          </form>
        </div>
        
        <div class="modal-actions">
          <button @click="closeEventModal" type="button" class="btn-secondary">
            Отмена
          </button>
          <button @click="saveEvent" type="button" class="btn-primary" :disabled="saving || uploading">
            <i v-if="saving" class="fas fa-spinner fa-spin"></i>
            <i v-else :class="isEditMode ? 'fas fa-save' : 'fas fa-plus'"></i>
            {{ saving ? 'Сохранение...' : (isEditMode ? 'Сохранить изменения' : 'Создать мероприятие') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно подтверждения удаления -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="showDeleteConfirm = false">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title danger">
            <i class="fas fa-exclamation-triangle"></i>
            Подтверждение удаления
          </h3>
          <button @click="showDeleteConfirm = false" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="delete-warning">
            <div class="delete-icon">
              <i class="fas fa-trash-alt"></i>
            </div>
            <div class="delete-text">
              <h4>Удалить мероприятие?</h4>
              <p>Вы действительно хотите удалить мероприятие <strong>{{ deletingEvent?.name }}</strong>?</p>
              <p class="warning-text">⚠️ Это действие нельзя отменить! Также будут удалены все связанные данные: фотографии, покупки, ссылки и особенности.</p>
            </div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="showDeleteConfirm = false" type="button" class="btn-secondary">
            Отмена
          </button>
          <button @click="confirmDelete" type="button" class="btn-danger" :disabled="deleting">
            <i v-if="deleting" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-trash"></i>
            {{ deleting ? 'Удаление...' : 'Удалить мероприятие' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { furryApi } from '@/config/supabase.js'
import { imageHelpers } from '@/utils/imageUtils'
import { s3Storage } from '@/config/s3.js'

export default {
  name: 'AdminEventsPanel',
  
  data() {
    return {
      // Данные
      events: [],
      stats: null,
      
      // Состояние
      loading: true,
      error: null,
      saving: false,
      deleting: false,
      uploading: false,
      uploadProgress: 0,
      
      // Фильтры
      searchQuery: '',
      statusFilter: 'all',
      sortBy: 'date_desc',
      searchTimeout: null,
      
      // Модальные окна
      showEventModal: false,
      showDeleteConfirm: false,
      isEditMode: false,
      
      // Редактирование
      editingEvent: null,
      deletingEvent: null,
      
      // Форма события
      eventForm: this.getEmptyEventForm()
    }
  },
  
  computed: {
    filteredEvents() {
      let filtered = [...this.events]
      
      // Поиск
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(event =>
          event.name.toLowerCase().includes(query) ||
          event.location?.toLowerCase().includes(query) ||
          event.city?.toLowerCase().includes(query) ||
          event.subtitle?.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query)
        )
      }
      
      return filtered
    }
  },
  
  async mounted() {
    await this.initializeData()
  },
  
  methods: {
    // ============================================
    // ИНИЦИАЛИЗАЦИЯ И ЗАГРУЗКА ДАННЫХ
    // ============================================
    
    async initializeData() {
      await Promise.all([
        this.loadEvents(),
        this.loadStats()
      ])
    },
    
    async loadEvents() {
      this.loading = true
      this.error = null
      
      try {
        console.log('🔄 Загружаем мероприятия для админ-панели...')
        
        this.events = await furryApi.getEvents({ 
          status: this.statusFilter === 'all' ? undefined : this.statusFilter,
          sort: this.sortBy,
          limit: 100,
          search: this.searchQuery.trim() || undefined
        })
        
        console.log('✅ События загружены:', this.events.length)
        
      } catch (error) {
        console.error('❌ Ошибка загрузки событий:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    
    async loadStats() {
      try {
        this.stats = await furryApi.getEventsStats()
      } catch (error) {
        console.error('❌ Ошибка загрузки статистики:', error)
        // Не показываем ошибку пользователю для статистики
      }
    },
    
    async refreshData() {
      await this.initializeData()
      this.$emit('notification', 'Данные обновлены', 'success')
    },
    
    // ============================================
    // УПРАВЛЕНИЕ МОДАЛЬНЫМИ ОКНАМИ
    // ============================================
    
    openCreateModal() {
      this.isEditMode = false
      this.editingEvent = null
      this.eventForm = this.getEmptyEventForm()
      this.showEventModal = true
    },
    
    editEvent(event) {
      this.isEditMode = true
      this.editingEvent = { ...event }
      this.eventForm = this.mapEventToForm(event)
      this.showEventModal = true
    },
    
    closeEventModal() {
      this.showEventModal = false
      this.isEditMode = false
      this.editingEvent = null
      this.eventForm = this.getEmptyEventForm()
      
      // Сбрасываем состояние загрузки
      this.uploading = false
      this.uploadProgress = 0
    },
    
    // ============================================
    // РАБОТА С ФОРМОЙ СОБЫТИЯ
    // ============================================
    
    getEmptyEventForm() {
      return {
        name: '',
        subtitle: '',
        slug: '',
        description: '',
        event_date: '',
        location: '',
        city: '',
        address: '',
        event_type: 'convention',
        attendance_status: 'planning',
        attendees_count: null,
        entrance_fee: null,
        banner_url: '',
        has_dealers_den: false,
        has_art_show: false,
        has_fursuit_parade: false,
        has_competitions: false,
        is_featured: false,
        is_online: false,
        official_website: '',
        tickets_url: ''
      }
    },
    
    mapEventToForm(event) {
      return {
        name: event.name || '',
        subtitle: event.subtitle || '',
        slug: event.slug || '',
        description: event.description || '',
        event_date: event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : '',
        location: event.location || '',
        city: event.city || '',
        address: event.address || '',
        event_type: event.event_type || 'convention',
        attendance_status: event.attendance_status || 'planning',
        attendees_count: event.attendees_count || null,
        entrance_fee: event.entrance_fee || null,
        banner_url: event.banner_url || '',
        has_dealers_den: event.has_dealers_den || false,
        has_art_show: event.has_art_show || false,
        has_fursuit_parade: event.has_fursuit_parade || false,
        has_competitions: event.has_competitions || false,
        is_featured: event.is_featured || false,
        is_online: event.is_online || false,
        official_website: event.official_website || '',
        tickets_url: event.tickets_url || ''
      }
    },
    
    generateSlug() {
      if (!this.eventForm.name) return
      
      // Автогенерация slug из названия
      const slug = this.eventForm.name
        .toLowerCase()
        .replace(/[^a-zа-я0-9\s-]/g, '') // Убираем спецсимволы
        .replace(/[а-я]/g, (char) => { // Транслитерация
          const map = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
            'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
            'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
            'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
            'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
          }
          return map[char] || char
        })
        .replace(/\s+/g, '-') // Пробелы в дефисы
        .replace(/-+/g, '-') // Множественные дефисы в один
        .replace(/^-|-$/g, '') // Убираем дефисы в начале и конце
      
      this.eventForm.slug = slug
    },
    
    validateSlug() {
      // Проверяем корректность slug
      const slugPattern = /^[a-z0-9-]+$/
      if (this.eventForm.slug && !slugPattern.test(this.eventForm.slug)) {
        this.$emit('notification', 'Slug может содержать только строчные буквы, цифры и дефисы', 'error')
        this.generateSlug() // Автоисправление
      }
    },
    
    // ============================================
    // ЗАГРУЗКА ИЗОБРАЖЕНИЙ
    // ============================================
    
    async handleBannerUpload(event) {
      const file = event.target.files[0]
      if (!file) return
      
      // Валидация файла
      if (!file.type.startsWith('image/')) {
        this.$emit('notification', 'Можно загружать только изображения', 'error')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        this.$emit('notification', 'Размер файла не должен превышать 5MB', 'error')
        return
      }
      
      this.uploading = true
      this.uploadProgress = 0
      
      try {
        console.log('📤 Загружаем баннер:', file.name)
        
        // Загружаем файл через s3Storage
        const result = await s3Storage.uploadImageWithThumbnail(
          file, 
          'events/banners',
          (progress) => {
            this.uploadProgress = progress
          }
        )
        
        // Устанавливаем URL изображения
        this.eventForm.banner_url = result.original.url
        
        console.log('✅ Баннер загружен:', result.original.url)
        this.$emit('notification', 'Баннер успешно загружен!', 'success')
        
      } catch (error) {
        console.error('❌ Ошибка загрузки баннера:', error)
        this.$emit('notification', 'Ошибка загрузки: ' + error.message, 'error')
      } finally {
        this.uploading = false
        this.uploadProgress = 0
        
        // Сбрасываем input
        if (this.$refs.bannerInput) {
          this.$refs.bannerInput.value = ''
        }
      }
    },
    
    removeBanner() {
      this.eventForm.banner_url = ''
      this.$emit('notification', 'Баннер удалён', 'info')
    },
    
    // ============================================
    // СОХРАНЕНИЕ И УДАЛЕНИЕ
    // ============================================
    
    async saveEvent() {
      // Валидация
      if (!this.eventForm.name?.trim()) {
        this.$emit('notification', 'Введите название мероприятия', 'error')
        return
      }
      
      if (!this.eventForm.slug?.trim()) {
        this.$emit('notification', 'Введите URL slug', 'error')
        return
      }
      
      if (!this.eventForm.event_date) {
        this.$emit('notification', 'Выберите дату проведения', 'error')
        return
      }
      
      if (!this.eventForm.location?.trim()) {
        this.$emit('notification', 'Введите место проведения', 'error')
        return
      }
      
      this.saving = true
      
      try {
        if (this.isEditMode && this.editingEvent) {
          // Обновление
          const updatedEvent = await furryApi.updateEvent(this.editingEvent.id, this.eventForm)
          this.$emit('notification', 'Мероприятие обновлено!', 'success')
          
          // Обновляем в списке
          const index = this.events.findIndex(e => e.id === updatedEvent.id)
          if (index !== -1) {
            this.events.splice(index, 1, { ...this.events[index], ...updatedEvent })
          }
        } else {
          // Создание
          const newEvent = await furryApi.createEvent(this.eventForm)
          this.$emit('notification', 'Мероприятие создано!', 'success')
          
          // Добавляем в начало списка
          this.events.unshift(newEvent)
        }
        
        await this.loadStats()
        this.closeEventModal()
        
      } catch (error) {
        console.error('❌ Ошибка сохранения события:', error)
        
        // Обработка специфичных ошибок
        if (error.message.includes('duplicate key value violates unique constraint')) {
          this.$emit('notification', 'Мероприятие с таким slug уже существует', 'error')
        } else {
          this.$emit('notification', 'Ошибка: ' + error.message, 'error')
        }
      } finally {
        this.saving = false
      }
    },
    
    deleteEvent(event) {
      this.deletingEvent = event
      this.showDeleteConfirm = true
    },
    
    async confirmDelete() {
      if (!this.deletingEvent) return
      
      this.deleting = true
      
      try {
        await furryApi.deleteEvent(this.deletingEvent.id)
        this.$emit('notification', 'Мероприятие удалено!', 'success')
        
        // Удаляем из списка
        this.events = this.events.filter(e => e.id !== this.deletingEvent.id)
        
        await this.loadStats()
        this.showDeleteConfirm = false
        this.deletingEvent = null
        
      } catch (error) {
        console.error('❌ Ошибка удаления события:', error)
        this.$emit('notification', 'Ошибка: ' + error.message, 'error')
      } finally {
        this.deleting = false
      }
    },
    
    manageEventData(event) {
      // Переход на страницу управления данными мероприятия
      this.$router.push(`/events/${event.slug}`)
    },
    
    // ============================================
    // УТИЛИТЫ
    // ============================================
    
    getBannerImage(bannerUrl) {
      return imageHelpers.getEventBanner(bannerUrl)
    },
    
    getEventStatusClass(event) {
      const now = new Date()
      return new Date(event.event_date) > now ? 'upcoming' : 'completed'
    },
    
    getEventStatusText(event) {
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
        meeting: 'Встреча',
        party: 'Вечеринка',
        workshop: 'Мастер-класс',
        market: 'Маркет',
        other: 'Другое'
      }
      return typeMap[eventType] || eventType
    },
    
    formatEventDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    formatMoney(amount) {
      if (!amount) return '0 ₽'
      return `${amount.toLocaleString('ru-RU')} ₽`
    },
    
    // Поиск с задержкой
    debouncedSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.loadEvents()
      }, 500)
    },
    
    clearSearch() {
      this.searchQuery = ''
      this.loadEvents()
    }
  },
  
  beforeUnmount() {
    // Очищаем таймеры
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
  }
}
</script>

<style scoped>
/* ===== ОСНОВНЫЕ СТИЛИ ===== */
.admin-events-panel {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-light);
  font-family: 'Nunito', sans-serif;
  padding: 2rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
}

.header-content {
  flex: 1;
}

.panel-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.panel-description {
  color: var(--text-muted);
  font-size: 1.1rem;
}

.header-actions {
  flex-shrink: 0;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--accent-orange), var(--accent-green));
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 123, 37, 0.3);
}

.add-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 123, 37, 0.4);
}

.add-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ===== СТАТИСТИКА ===== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
  flex-shrink: 0;
}

.stat-icon.total { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.stat-icon.upcoming { background: linear-gradient(135deg, #10b981, #059669); }
.stat-icon.completed { background: linear-gradient(135deg, var(--accent-orange), #e6691f); }
.stat-icon.money { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ===== ФИЛЬТРЫ ===== */
.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: var(--text-light);
  font-size: 1rem;
}

.search-box input:focus {
  outline: none;
  border-color: var(--accent-orange);
  background: rgba(255, 255, 255, 0.08);
}

.clear-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
}

.clear-btn:hover {
  color: var(--text-light);
  background: rgba(255, 255, 255, 0.1);
}

.filter-select {
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: var(--text-light);
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: var(--accent-orange);
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

/* ===== СОСТОЯНИЯ ЗАГРУЗКИ ===== */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

/* ===== СПИСОК МЕРОПРИЯТИЙ ===== */
.events-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.no-events {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.02);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.no-events i {
  font-size: 4rem;
  color: var(--accent-orange);
  opacity: 0.5;
}

.no-events h3 {
  color: var(--text-light);
  margin: 0;
}

.event-card {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.event-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.event-card.featured {
  border-color: var(--accent-orange);
  box-shadow: 0 0 20px rgba(255, 123, 37, 0.2);
}

.event-preview {
  width: 200px;
  flex-shrink: 0;
}

.event-banner {
  width: 100%;
  height: 100%;
  min-height: 160px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.event-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1));
}

.event-status {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
  z-index: 2;
}

.event-status.upcoming {
  background: rgba(76, 175, 80, 0.8);
  color: white;
}

.event-status.completed {
  background: rgba(255, 123, 37, 0.8);
  color: white;
}

.featured-badge {
  position: absolute;
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
  font-size: 0.8rem;
  backdrop-filter: blur(10px);
  z-index: 2;
}

.event-info {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-header {
  flex: 1;
}

.event-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-light);
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.event-subtitle {
  font-size: 1rem;
  color: var(--text-muted);
  font-style: italic;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.event-detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.event-detail i {
  width: 16px;
  color: var(--accent-orange);
}

.event-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.05);
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
}

.stat-item.money {
  color: var(--accent-green);
  font-weight: 600;
}

.stat-item i {
  color: var(--accent-orange);
}

.event-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.view-btn {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.view-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  transform: scale(1.1);
}

.edit-btn {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.edit-btn:hover {
  background: rgba(245, 158, 11, 0.2);
  transform: scale(1.1);
}

.manage-btn {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.manage-btn:hover {
  background: rgba(139, 92, 246, 0.2);
  transform: scale(1.1);
}

.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: scale(1.1);
}

/* ===== МОДАЛЬНЫЕ ОКНА ===== */
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
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 1rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.large-modal {
  max-width: 900px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-light);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}

.modal-title.danger {
  color: #ef4444;
}

.modal-close {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.modal-body {
  padding: 2rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1rem 2rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* ===== ФОРМЫ ===== */
.event-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-light);
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: var(--text-light);
  font-size: 0.9rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: var(--text-light);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--accent-orange);
  background: rgba(255, 255, 255, 0.08);
}

.form-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-style: italic;
}

.form-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background 0.3s ease;
}

.checkbox-label:hover {
  background: rgba(255, 255, 255, 0.05);
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.checkbox-text {
  color: var(--text-light);
  font-weight: 500;
}

/* ===== ЗАГРУЗКА ИЗОБРАЖЕНИЙ ===== */
.image-upload-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.image-uploader {
  position: relative;
}

.image-preview {
  position: relative;
  border-radius: 0.75rem;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
}

.preview-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.overlay-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: var(--bg-primary);
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.overlay-btn.delete {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.overlay-btn:hover {
  transform: scale(1.05);
}

.upload-zone {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.02);
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-zone:hover {
  border-color: var(--accent-orange);
  background: rgba(255, 123, 37, 0.05);
}

.upload-content i {
  font-size: 3rem;
  color: var(--accent-orange);
  margin-bottom: 1rem;
}

.upload-content h4 {
  color: var(--text-light);
  margin: 0 0 0.5rem 0;
}

.upload-content p {
  color: var(--text-muted);
  margin: 0 0 0.5rem 0;
}

.upload-content small {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.upload-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 123, 37, 0.2);
  border-top: 3px solid var(--accent-orange);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.progress-bar {
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent-orange);
  transition: width 0.3s ease;
}

.url-input-section {
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* ===== КНОПКИ ===== */
.btn-primary,
.btn-secondary,
.btn-danger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-orange), var(--accent-green));
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 123, 37, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-light);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-2px);
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ===== УДАЛЕНИЕ ===== */
.delete-modal .modal-content {
  border-color: rgba(239, 68, 68, 0.3);
}

.delete-warning {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.delete-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: #ef4444;
  flex-shrink: 0;
}

.delete-text {
  flex: 1;
}

.delete-text h4 {
  margin: 0 0 0.75rem 0;
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
}

.delete-text p {
  margin: 0 0 1rem 0;
  color: var(--text-muted);
  line-height: 1.5;
}

.warning-text {
  color: #f59e0b;
  font-size: 0.9rem;
  font-style: italic;
}

/* ===== АДАПТИВНОСТЬ ===== */
@media (max-width: 768px) {
  .admin-events-panel {
    padding: 1rem;
  }
  
  .panel-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-section {
    flex-direction: column;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .event-card {
    flex-direction: column;
  }
  
  .event-preview {
    width: auto;
    height: 200px;
  }
  
  .event-actions {
    flex-direction: row;
    padding: 1rem;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-checkboxes {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
  
  .large-modal {
    max-width: calc(100vw - 2rem);
  }
}
</style>