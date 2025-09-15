<template>
    <!-- Админ-панель мероприятий -->
    <div class="admin-events-panel">
      <!-- Шапка с кнопкой добавления -->
      <div class="panel-header">
        <div class="header-info">
          <h2>Управление мероприятиями</h2>
          <p>Добавляйте и редактируйте информацию о конвентах и мероприятиях</p>
        </div>
        <button @click="showAddEventModal = true" class="add-event-btn">
          <i class="fas fa-plus"></i>
          Добавить мероприятие
        </button>
      </div>
  
      <!-- Статистика -->
      <div class="events-stats">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-calendar"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ eventsStats.total }}</div>
            <div class="stat-label">Всего мероприятий</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon upcoming">
            <i class="fas fa-calendar-alt"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ eventsStats.upcoming }}</div>
            <div class="stat-label">Предстоящих</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon completed">
            <i class="fas fa-calendar-check"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ eventsStats.completed }}</div>
            <div class="stat-label">Завершённых</div>
          </div>
        </div>
        <div class="stat-card" v-if="eventsStats.totalSpent > 0">
          <div class="stat-icon money">
            <i class="fas fa-ruble-sign"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ formatMoney(eventsStats.totalSpent) }}</div>
            <div class="stat-label">Потрачено</div>
          </div>
        </div>
      </div>
  
      <!-- Фильтры -->
      <div class="events-filters">
        <div class="filter-group">
          <label>Поиск:</label>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Название, локация..."
            @input="debouncedSearch"
          >
        </div>
        <div class="filter-group">
          <label>Статус:</label>
          <select v-model="statusFilter" @change="loadEvents">
            <option value="all">Все</option>
            <option value="upcoming">Предстоящие</option>
            <option value="completed">Завершённые</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Сортировка:</label>
          <select v-model="sortBy" @change="loadEvents">
            <option value="date_desc">Сначала новые</option>
            <option value="date_asc">Сначала старые</option>
            <option value="name">По названию</option>
            <option value="rating">По рейтингу</option>
          </select>
        </div>
      </div>
  
      <!-- Список мероприятий -->
      <div class="events-list">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Загружаем мероприятия...</p>
        </div>
  
        <div v-else-if="error" class="error-state">
          <p>Ошибка: {{ error }}</p>
          <button @click="loadEvents" class="retry-btn">Попробовать снова</button>
        </div>
  
        <div v-else-if="filteredEvents.length === 0" class="empty-state">
          <i class="fas fa-calendar-times"></i>
          <p>Мероприятия не найдены</p>
          <button @click="showAddEventModal = true" class="add-first-event-btn">
            Добавить первое мероприятие
          </button>
        </div>
  
        <div v-else class="events-grid">
          <div 
            v-for="event in filteredEvents" 
            :key="event.id"
            class="event-admin-card"
            :class="[getEventStatusClass(event)]"
          >
            <!-- Баннер -->
            <div class="event-banner" :style="{ backgroundImage: getBannerImage(event.banner_url) }">
              <div class="event-overlay"></div>
              <div class="event-actions">
                <button @click="editEvent(event)" class="action-btn edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="deleteEvent(event)" class="action-btn delete">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
              <div class="event-status-badge" :class="getEventStatusClass(event)">
                {{ getStatusText(event.computed_status || event.status) }}
              </div>
            </div>
  
            <!-- Информация -->
            <div class="event-info">
              <h3 class="event-name">{{ event.name }}</h3>
              <div class="event-meta">
                <div class="meta-row">
                  <i class="fas fa-calendar"></i>
                  <span>{{ formatEventDate(event.event_date) }}</span>
                </div>
                <div class="meta-row">
                  <i class="fas fa-map-marker-alt"></i>
                  <span>{{ event.city || event.location }}</span>
                </div>
                <div v-if="event.event_type" class="meta-row">
                  <i :class="getEventTypeIcon(event.event_type)"></i>
                  <span>{{ getEventTypeText(event.event_type) }}</span>
                </div>
              </div>
  
              <!-- Статистика события -->
              <div class="event-stats-mini">
                <div v-if="event.photos_count > 0" class="stat-mini">
                  <i class="fas fa-camera"></i>
                  <span>{{ event.photos_count }}</span>
                </div>
                <div v-if="event.purchases_total > 0" class="stat-mini">
                  <i class="fas fa-shopping-bag"></i>
                  <span>{{ event.purchases_total }}</span>
                </div>
                <div v-if="event.my_rating" class="stat-mini rating">
                  <i class="fas fa-star"></i>
                  <span>{{ event.my_rating }}/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Модальное окно добавления/редактирования события -->
      <div v-if="showAddEventModal || showEditEventModal" class="modal-overlay" @click="closeModals">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ editingEvent ? 'Редактировать мероприятие' : 'Добавить мероприятие' }}</h3>
            <button @click="closeModals" class="close-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
  
          <form @submit.prevent="saveEvent" class="event-form">
            <!-- Основная информация -->
            <div class="form-section">
              <h4>Основная информация</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>Название *</label>
                  <input 
                    v-model="eventForm.name" 
                    type="text" 
                    required
                    placeholder="Например: Any Furry Fest V"
                  >
                </div>
                <div class="form-group">
                  <label>Слаг (URL)</label>
                  <input 
                    v-model="eventForm.slug" 
                    type="text"
                    placeholder="any-furry-fest-5 (заполнится автоматически)"
                  >
                </div>
              </div>
  
              <div class="form-group">
                <label>Краткое описание</label>
                <textarea 
                  v-model="eventForm.short_description" 
                  placeholder="Краткое описание для карточек"
                  rows="2"
                ></textarea>
              </div>
  
              <div class="form-group">
                <label>Полное описание</label>
                <textarea 
                  v-model="eventForm.description" 
                  placeholder="Подробное описание мероприятия"
                  rows="4"
                ></textarea>
              </div>
            </div>
  
            <!-- Даты и локация -->
            <div class="form-section">
              <h4>Даты и локация</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>Дата проведения *</label>
                  <input 
                    v-model="eventForm.event_date" 
                    type="datetime-local" 
                    required
                  >
                </div>
                <div class="form-group">
                  <label>Дата анонса</label>
                  <input 
                    v-model="eventForm.announced_date" 
                    type="datetime-local"
                  >
                </div>
              </div>
  
              <div class="form-row">
                <div class="form-group">
                  <label>Локация *</label>
                  <input 
                    v-model="eventForm.location" 
                    type="text" 
                    required
                    placeholder="Название площадки"
                  >
                </div>
                <div class="form-group">
                  <label>Город</label>
                  <input 
                    v-model="eventForm.city" 
                    type="text"
                    placeholder="Москва"
                  >
                </div>
              </div>
            </div>
  
            <!-- Медиа -->
            <div class="form-section">
              <h4>Медиа</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>URL баннера</label>
                  <input 
                    v-model="eventForm.banner_url" 
                    type="url"
                    placeholder="https://example.com/banner.jpg"
                  >
                </div>
                <div class="form-group">
                  <label>URL логотипа</label>
                  <input 
                    v-model="eventForm.logo_url" 
                    type="url"
                    placeholder="https://example.com/logo.jpg"
                  >
                </div>
              </div>
            </div>
  
            <!-- Типы и статусы -->
            <div class="form-section">
              <h4>Категории</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>Тип мероприятия</label>
                  <select v-model="eventForm.event_type">
                    <option value="convention">Конвент</option>
                    <option value="meeting">Встреча</option>
                    <option value="party">Вечеринка</option>
                    <option value="workshop">Мастер-класс</option>
                    <option value="market">Маркет</option>
                    <option value="other">Другое</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Статус участия</label>
                  <select v-model="eventForm.attendance_status">
                    <option value="planning">Планирую</option>
                    <option value="registered">Зарегистрирован</option>
                    <option value="attended">Посетил</option>
                    <option value="missed">Пропустил</option>
                    <option value="cancelled">Отменено</option>
                  </select>
                </div>
              </div>
  
              <div class="form-row">
                <div class="form-group">
                  <label>Количество участников</label>
                  <input 
                    v-model.number="eventForm.attendees_count" 
                    type="number"
                    min="1"
                    placeholder="300"
                  >
                </div>
                <div class="form-group">
                  <label>Моя оценка</label>
                  <select v-model.number="eventForm.my_rating">
                    <option :value="null">Без оценки</option>
                    <option :value="1">⭐ 1 - Плохо</option>
                    <option :value="2">⭐⭐ 2 - Неплохо</option>
                    <option :value="3">⭐⭐⭐ 3 - Хорошо</option>
                    <option :value="4">⭐⭐⭐⭐ 4 - Отлично</option>
                    <option :value="5">⭐⭐⭐⭐⭐ 5 - Идеально</option>
                  </select>
                </div>
              </div>
            </div>
  
            <!-- Особенности -->
            <div class="form-section">
              <h4>Особенности</h4>
              <div class="checkboxes-grid">
                <label class="checkbox-item">
                  <input v-model="eventForm.is_featured" type="checkbox">
                  <span>⭐ Избранное мероприятие</span>
                </label>
                <label class="checkbox-item">
                  <input v-model="eventForm.has_fursuit_friendly" type="checkbox">
                  <span>🐺 Фурсьют-френдли</span>
                </label>
                <label class="checkbox-item">
                  <input v-model="eventForm.has_dealers_den" type="checkbox">
                  <span>🛍️ Dealers Den</span>
                </label>
                <label class="checkbox-item">
                  <input v-model="eventForm.has_art_show" type="checkbox">
                  <span>🎨 Art Show</span>
                </label>
                <label class="checkbox-item">
                  <input v-model="eventForm.has_photography" type="checkbox">
                  <span>📸 Фотосессии</span>
                </label>
                <label class="checkbox-item">
                  <input v-model="eventForm.is_nsfw" type="checkbox">
                  <span>🔞 18+ контент</span>
                </label>
              </div>
            </div>
  
            <!-- Кнопки -->
            <div class="form-actions">
              <button type="button" @click="closeModals" class="cancel-btn">
                Отмена
              </button>
              <button type="submit" :disabled="saving" class="save-btn">
                <i v-if="saving" class="fas fa-spinner fa-spin"></i>
                {{ saving ? 'Сохранение...' : (editingEvent ? 'Обновить' : 'Создать') }}
              </button>
            </div>
          </form>
        </div>
      </div>
  
      <!-- Подтверждение удаления -->
      <div v-if="showDeleteConfirm" class="modal-overlay" @click="showDeleteConfirm = false">
        <div class="modal-content small" @click.stop>
          <div class="modal-header">
            <h3>Подтвердите удаление</h3>
          </div>
          <div class="modal-body">
            <p>Вы действительно хотите удалить мероприятие "{{ deletingEvent?.name }}"?</p>
            <p class="warning">Это действие нельзя отменить!</p>
          </div>
          <div class="form-actions">
            <button @click="showDeleteConfirm = false" class="cancel-btn">
              Отмена
            </button>
            <button @click="confirmDelete" :disabled="deleting" class="delete-btn">
              <i v-if="deleting" class="fas fa-spinner fa-spin"></i>
              {{ deleting ? 'Удаление...' : 'Удалить' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { furryApi } from '../config/supabase.js'
  import { getBannerImage, placeholders } from '@/utils/imageUtils'
  export default {
    name: 'AdminEventsPanel',
    
    data() {
      return {
        // Данные
        events: [],
        eventsStats: {
          total: 0,
          upcoming: 0,
          completed: 0,
          totalSpent: 0
        },
        
        // Состояние
        loading: true,
        error: null,
        saving: false,
        deleting: false,
        
        // Фильтры
        searchQuery: '',
        statusFilter: 'all',
        sortBy: 'date_desc',
        searchTimeout: null,
        
        // Модальные окна
        showAddEventModal: false,
        showEditEventModal: false,
        showDeleteConfirm: false,
        
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
            event.city?.toLowerCase().includes(query)
          )
        }
        
        // Фильтр по статусу
        if (this.statusFilter !== 'all') {
          const now = new Date()
          if (this.statusFilter === 'upcoming') {
            filtered = filtered.filter(event => new Date(event.event_date) > now)
          } else if (this.statusFilter === 'completed') {
            filtered = filtered.filter(event => new Date(event.event_date) <= now)
          }
        }
        
        return filtered
      }
    },
    
    async mounted() {
      await this.loadEvents()
      await this.loadStats()
    },
    
    methods: {
      async loadEvents() {
        this.loading = true
        this.error = null
        
        try {
          this.events = await furryApi.getEvents({ 
            status: 'all', 
            limit: 100, 
            sort: this.sortBy 
          })
          console.log('✅ События загружены в админ-панель:', this.events.length)
        } catch (error) {
          console.error('❌ Ошибка загрузки событий:', error)
          this.error = error.message
        } finally {
          this.loading = false
        }
      },
      
      async loadStats() {
        try {
          this.eventsStats = await furryApi.getEventsStats()
        } catch (error) {
          console.error('❌ Ошибка загрузки статистики:', error)
        }
      },
      getBannerImage(bannerUrl) {
        if (!bannerUrl) {
          // SVG заглушка вместо via.placeholder.com
          const svgPlaceholder = "data:image/svg+xml,%3Csvg width='400' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='200' fill='%231a1a1a'/%3E%3Ctext x='200' y='110' font-family='Nunito,Arial,sans-serif' font-size='50' fill='%23ff7b25' text-anchor='middle'%3E🎪%3C/text%3E%3C/svg%3E"
          return `url(${svgPlaceholder})`
        }
        return `url(${bannerUrl})`
      },
      
      // Поиск с задержкой
      debouncedSearch() {
        clearTimeout(this.searchTimeout)
        this.searchTimeout = setTimeout(() => {
          // Поиск выполняется автоматически через computed
        }, 300)
      },
      
      // Работа с формой
      getEmptyEventForm() {
        return {
          name: '',
          slug: '',
          description: '',
          short_description: '',
          event_date: '',
          announced_date: '',
          location: '',
          city: '',
          banner_url: '',
          logo_url: '',
          event_type: 'convention',
          attendance_status: 'planning',
          attendees_count: null,
          my_rating: null,
          is_featured: false,
          has_fursuit_friendly: true,
          has_dealers_den: false,
          has_art_show: false,
          has_photography: true,
          is_nsfw: false
        }
      },
      
      editEvent(event) {
        this.editingEvent = event
        this.eventForm = {
          ...event,
          event_date: event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : '',
          announced_date: event.announced_date ? new Date(event.announced_date).toISOString().slice(0, 16) : ''
        }
        this.showEditEventModal = true
      },
      
      async saveEvent() {
        this.saving = true
        
        try {
          // Автогенерация slug если не указан
          if (!this.eventForm.slug && this.eventForm.name) {
            this.eventForm.slug = this.eventForm.name
              .toLowerCase()
              .replace(/[^а-яё\w\s-]/gi, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .trim()
          }
          
          if (this.editingEvent) {
            // Обновление
            await furryApi.updateEvent(this.editingEvent.id, this.eventForm)
            this.$emit('notification', 'Мероприятие обновлено!', 'success')
          } else {
            // Создание
            await furryApi.createEvent(this.eventForm)
            this.$emit('notification', 'Мероприятие создано!', 'success')
          }
          
          await this.loadEvents()
          await this.loadStats()
          this.closeModals()
          
        } catch (error) {
          console.error('❌ Ошибка сохранения события:', error)
          this.$emit('notification', 'Ошибка: ' + error.message, 'error')
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
          
          await this.loadEvents()
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
      
      closeModals() {
        this.showAddEventModal = false
        this.showEditEventModal = false
        this.editingEvent = null
        this.eventForm = this.getEmptyEventForm()
      },
      
      // Утилиты
      getEventStatusClass(event) {
        const now = new Date()
        return new Date(event.event_date) > now ? 'upcoming' : 'completed'
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
      
      getEventTypeIcon(type) {
        const typeIcons = {
          'convention': 'fas fa-calendar-star',
          'meeting': 'fas fa-users',
          'party': 'fas fa-glass-cheers',
          'workshop': 'fas fa-chalkboard-teacher',
          'market': 'fas fa-store',
          'other': 'fas fa-calendar'
        }
        return typeIcons[type] || 'fas fa-calendar'
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
      
      getBannerImage(bannerUrl) {
        if (!bannerUrl) {
          // SVG заглушка 300x150 вместо via.placeholder.com
          const svgPlaceholder = `data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22150%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22300%22%20height%3D%22150%22%20fill%3D%22%231a1a1a%22%2F%3E%3Ctext%20x%3D%22150%22%20y%3D%2285%22%20font-family%3D%22Nunito%2CArial%2Csans-serif%22%20font-size%3D%2240%22%20fill%3D%22%23ff7b25%22%20text-anchor%3D%22middle%22%3E🎪%3C%2Ftext%3E%3C%2Fsvg%3E`
          return `url(${svgPlaceholder})`
        }
        return `url(${bannerUrl})`
      },
      
      formatEventDate(dateString) {
        return new Date(dateString).toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      },
      
      formatMoney(amount) {
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
  .admin-events-panel {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }
  
  /* Шапка */
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .header-info h2 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-light);
    margin-bottom: 0.5rem;
  }
  
  .header-info p {
    color: var(--text-muted);
    font-size: 1.1rem;
  }
  
  .add-event-btn {
    padding: 0.8rem 1.5rem;
    background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
    border: none;
    border-radius: 0.5rem;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .add-event-btn:hover {
    transform: translateY(-2px);
  }
  
  /* Статистика */
  .events-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .stat-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 1rem;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 123, 37, 0.2);
    color: var(--accent-orange);
    font-size: 1.3rem;
  }
  
  .stat-icon.upcoming {
    background: rgba(255, 123, 37, 0.2);
    color: var(--accent-orange);
  }
  
  .stat-icon.completed {
    background: rgba(76, 175, 80, 0.2);
    color: var(--accent-green);
  }
  
  .stat-icon.money {
    background: rgba(255, 215, 0, 0.2);
    color: #ffd700;
  }
  
  .stat-number {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-light);
  }
  
  .stat-label {
    font-size: 0.9rem;
    color: var(--text-muted);
  }
  
  /* Фильтры */
  .events-filters {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .filter-group label {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-muted);
  }
  
  .filter-group input,
  .filter-group select {
    padding: 0.6rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.4rem;
    color: var(--text-light);
    min-width: 200px;
  }
  
  /* Состояния */
  .loading-state,
  .error-state,
  .empty-state {
    text-align: center;
    padding: 3rem;
    color: var(--text-muted);
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 123, 37, 0.3);
    border-top: 3px solid var(--accent-orange);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }
  
  .retry-btn,
  .add-first-event-btn {
    margin-top: 1rem;
    padding: 0.8rem 1.5rem;
    background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
    border: none;
    border-radius: 0.5rem;
    color: white;
    cursor: pointer;
  }
  
  /* Сетка событий */
  .events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }
  
  .event-admin-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 1rem;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
  }
  
  .event-admin-card:hover {
    transform: translateY(-3px);
    border-color: rgba(255, 123, 37, 0.3);
  }
  
  .event-admin-card.upcoming {
    border-left: 4px solid var(--accent-orange);
  }
  
  .event-admin-card.completed {
    border-left: 4px solid var(--accent-green);
  }
  
  .event-banner {
    height: 120px;
    background-size: cover;
    background-position: center;
    position: relative;
  }
  
  .event-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7));
  }
  
  .event-actions {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    display: flex;
    gap: 0.5rem;
  }
  
  .action-btn {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
    transition: all 0.2s;
  }
  
  .action-btn.edit {
    background: rgba(255, 123, 37, 0.8);
    color: white;
  }
  
  .action-btn.delete {
    background: rgba(255, 69, 58, 0.8);
    color: white;
  }
  
  .action-btn:hover {
    transform: scale(1.1);
  }
  
  .event-status-badge {
    position: absolute;
    bottom: 0.5rem;
    left: 0.5rem;
    padding: 0.3rem 0.8rem;
    border-radius: 1rem;
    font-size: 0.8rem;
    font-weight: 600;
    backdrop-filter: blur(10px);
  }
  
  .event-status-badge.upcoming {
    background: rgba(255, 123, 37, 0.9);
    color: white;
  }
  
  .event-status-badge.completed {
    background: rgba(76, 175, 80, 0.9);
    color: white;
  }
  
  .event-info {
    padding: 1.2rem;
  }
  
  .event-name {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-light);
    margin-bottom: 0.8rem;
  }
  
  .event-meta {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 1rem;
  }
  
  .meta-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--text-muted);
  }
  
  .meta-row i {
    color: var(--accent-orange);
    width: 14px;
  }
  
  .event-stats-mini {
    display: flex;
    gap: 1rem;
    padding-top: 0.8rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .stat-mini {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.8rem;
    color: var(--text-muted);
  }
  
  .stat-mini.rating {
    color: var(--accent-orange);
  }
  
  .stat-mini i {
    color: var(--accent-green);
  }
  
  .stat-mini.rating i {
    color: var(--accent-orange);
  }
  
  /* Модальные окна */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 2rem;
  }
  
  .modal-content {
    background: var(--bg-secondary);
    border-radius: 1rem;
    width: 100%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .modal-content.small {
    max-width: 500px;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .modal-header h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-light);
  }
  
  .close-btn {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    color: var(--text-light);
  }
  
  /* Форма */
  .event-form {
    padding: 1.5rem;
  }
  
  .form-section {
    margin-bottom: 2rem;
  }
  
  .form-section h4 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-light);
    margin-bottom: 1rem;
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
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-muted);
  }
  
  .form-group input,
  .form-group textarea,
  .form-group select {
    padding: 0.8rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
    color: var(--text-light);
    font-size: 0.95rem;
  }
  
  .form-group input:focus,
  .form-group textarea:focus,
  .form-group select:focus {
    outline: none;
    border-color: var(--accent-orange);
    background: rgba(255, 255, 255, 0.08);
  }
  
  .checkboxes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .checkbox-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: var(--text-muted);
    transition: color 0.2s;
  }
  
  .checkbox-item:hover {
    color: var(--text-light);
  }
  
  .checkbox-item input[type="checkbox"] {
    width: auto;
    margin: 0;
  }
  
  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .cancel-btn,
  .save-btn,
  .delete-btn {
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .cancel-btn {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-muted);
  }
  
  .cancel-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    color: var(--text-light);
  }
  
  .save-btn {
    background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
    color: white;
  }
  
  .save-btn:hover:not(:disabled) {
    transform: translateY(-2px);
  }
  
  .save-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .delete-btn {
    background: linear-gradient(45deg, #ff453a, #ff6347);
    color: white;
  }
  
  .delete-btn:hover:not(:disabled) {
    transform: translateY(-2px);
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  .warning {
    color: var(--accent-orange);
    font-weight: 600;
    margin-top: 0.5rem;
  }
  
  /* Адаптивность */
  @media (max-width: 768px) {
    .panel-header {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }
    
    .events-filters {
      flex-direction: column;
      gap: 1rem;
    }
    
    .filter-group input,
    .filter-group select {
      min-width: 100%;
    }
    
    .events-grid {
      grid-template-columns: 1fr;
    }
    
    .form-row {
      grid-template-columns: 1fr;
    }
    
    .checkboxes-grid {
      grid-template-columns: 1fr;
    }
    
    .modal-overlay {
      padding: 1rem;
    }
    
    .form-actions {
      flex-direction: column;
    }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  </style>