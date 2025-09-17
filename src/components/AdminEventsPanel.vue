<template>
  <div class="admin-events-panel">
    <!-- Заголовок панели -->
    <div class="panel-header">
      <div class="header-content">
        <h2 class="panel-title">
          <i class="fas fa-calendar-alt"></i>
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
      
      <div class="stat-card money">
        <div class="stat-icon">
          <i class="fas fa-ruble-sign"></i>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ formatMoney(stats.totalSpent || 0) }}</div>
          <div class="stat-label">Потрачено</div>
        </div>
      </div>

      <div class="stat-card types">
        <div class="stat-icon">
          <i class="fas fa-tags"></i>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ getUniqueTypesCount() }}</div>
          <div class="stat-label">Типов событий</div>
        </div>
      </div>

      <div class="stat-card rating">
        <div class="stat-icon">
          <i class="fas fa-heart"></i>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ stats.avgRating || 0 }}<small>/5</small></div>
          <div class="stat-label">Средний рейтинг</div>
        </div>
      </div>
    </div>

    <!-- Фильтры и поиск -->
    <div class="filters-section">
      <div class="filters-row">
        <!-- Поиск -->
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Поиск по названию, городу, локации..."
            @input="debouncedSearch"
          >
          <button v-if="searchQuery" @click="clearSearch" class="clear-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Фильтры -->
        <div class="filter-buttons">
          <button 
            v-for="filter in filters" 
            :key="filter.key"
            class="filter-btn"
            :class="{ 'active': statusFilter === filter.key }"
            @click="setStatusFilter(filter.key)"
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
          <option value="spent_desc">По тратам ⬇</option>
          <option value="spent_asc">По тратам ⬆</option>
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
          'upcoming': isUpcoming(event)
        }"
      >
        <!-- Превью баннера -->
        <div class="event-preview">
          <div 
            class="event-banner" 
            :style="{ backgroundImage: event.meta_image ? `url('${event.meta_image}')` : 'none' }"
          >
            <div v-if="!event.meta_image" class="no-image-placeholder">
              <i class="fas fa-image"></i>
            </div>
            <div class="event-overlay"></div>
            
            <!-- Статус бейдж -->
            <div class="event-status" :class="getEventStatusClass(event)">
              {{ getEventStatusText(event) }}
            </div>
          </div>
        </div>

        <!-- Информация о мероприятии -->
        <div class="event-info">
          <div class="event-header">
            <div class="event-meta">
              <span class="event-type" :class="`type-${event.event_type}`">
                <i :class="getEventTypeIcon(event.event_type)"></i>
                {{ getEventTypeName(event.event_type) }}
              </span>
              <span class="event-date">
                <i class="fas fa-calendar"></i>
                {{ formatEventDate(event.event_date) }}
              </span>
            </div>

            <h3 class="event-name">{{ event.name }}</h3>
            <p v-if="event.subtitle" class="event-subtitle">{{ event.subtitle }}</p>

            <div class="event-location">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ event.location }}, {{ event.city }}</span>
            </div>

            <!-- Рейтинг и траты -->
            <div class="event-stats">
              <div v-if="event.my_rating" class="rating">
                <div class="stars">
                  <i 
                    v-for="n in 5" 
                    :key="n"
                    class="fas fa-star"
                    :class="{ 'active': n <= event.my_rating }"
                  ></i>
                </div>
                <span class="rating-text">{{ event.my_rating }}/5</span>
              </div>
              
              <div v-if="event.total_spent" class="spent">
                <i class="fas fa-ruble-sign"></i>
                <span>{{ formatMoney(event.total_spent) }}</span>
              </div>

              <div v-if="event.attendees_count" class="attendees">
                <i class="fas fa-users"></i>
                <span>{{ event.attendees_count }} чел.</span>
              </div>
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

    <!-- Модальное окно подтверждения удаления -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal" @click.stop>
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
        
        <div class="modal-actions">
          <button @click="closeDeleteModal" class="modal-btn secondary">
            <i class="fas fa-times"></i>
            Отмена
          </button>
          <button @click="confirmDelete" class="modal-btn danger" :disabled="deleting">
            <i class="fas fa-trash"></i>
            <span v-if="deleting">Удаление...</span>
            <span v-else>Удалить навсегда</span>
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
  
  data() {
    return {
      // Состояние загрузки
      loading: false,
      error: null,
      
      // Данные
      events: [],
      stats: null,
      
      // Фильтры и поиск
      searchQuery: '',
      statusFilter: 'all',
      sortBy: 'date_desc',
      
      // Модальные окна
      showDeleteModal: false,
      eventToDelete: null,
      deleting: false,
      
      // Таймеры
      searchTimeout: null,
    }
  },
  
  computed: {
    // Фильтры
    filters() {
      return [
        { key: 'all', label: 'Все', icon: 'fas fa-calendar-alt', count: this.stats?.total },
        { key: 'upcoming', label: 'Предстоящие', icon: 'fas fa-clock', count: this.stats?.upcoming },
        { key: 'completed', label: 'Завершённые', icon: 'fas fa-check-circle', count: this.stats?.completed },
        { key: 'convention', label: 'Конвенты', icon: 'fas fa-calendar-star', count: this.getTypeCount('convention') },
        { key: 'market', label: 'Маркеты', icon: 'fas fa-store', count: this.getTypeCount('market') },
        { key: 'festival', label: 'Фестивали', icon: 'fas fa-music', count: this.getTypeCount('festival') },
        { key: 'meetup', label: 'Встречи', icon: 'fas fa-users', count: this.getTypeCount('meetup') },
      ]
    }
  },
  
  async mounted() {
    await this.loadInitialData()
  },
  
  methods: {
    // ============================================
    // ЗАГРУЗКА ДАННЫХ
    // ============================================
    
    async loadInitialData() {
      await Promise.all([
        this.loadEvents(),
        this.loadStats()
      ])
    },
    
    async loadEvents() {
      this.loading = true
      this.error = null
      
      try {
        console.log('🎪 AdminEvents: Загружаем мероприятия...', {
          search: this.searchQuery || 'нет',
          filter: this.statusFilter,
          sort: this.sortBy
        })
        
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
        this.error = error.message || 'Проблема с подключением к API'
      } finally {
        this.loading = false
      }
    },
    
    async loadStats() {
      try {
        this.stats = await furryApi.getEventsStats()
        console.log('✅ AdminEvents: Статистика загружена:', this.stats)
      } catch (error) {
        console.error('❌ AdminEvents: Ошибка загрузки статистики:', error)
        // Не показываем ошибку пользователю для статистики
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
    // ДЕЙСТВИЯ С МЕРОПРИЯТИЯМИ
    // ============================================
    
    openCreateModal() {
      // Реализация создания нового мероприятия
      this.$emit('notification', 'Функция создания в разработке', 'info')
    },
    
    viewEvent(event) {
      // Переход на страницу мероприятия
      if (event.slug) {
        const url = `/events/${event.slug}`
        window.open(url, '_blank')
      } else {
        this.$emit('notification', 'У мероприятия нет slug для просмотра', 'warning')
      }
    },
    
    editEvent(event) {
      // Реализация редактирования мероприятия
      this.$emit('notification', 'Функция редактирования в разработке', 'info')
    },
    
    duplicateEvent(event) {
      // Реализация дублирования мероприятия
      this.$emit('notification', 'Функция дублирования в разработке', 'info')
    },
    
    deleteEvent(event) {
      this.eventToDelete = event
      this.showDeleteModal = true
    },
    
    closeDeleteModal() {
      this.showDeleteModal = false
      this.eventToDelete = null
      this.deleting = false
    },
    
    async confirmDelete() {
      if (!this.eventToDelete) return
      
      this.deleting = true
      
      try {
        await furryApi.deleteEvent(this.eventToDelete.id)
        
        // Удаляем из локального списка
        this.events = this.events.filter(e => e.id !== this.eventToDelete.id)
        
        this.$emit('notification', `Мероприятие "${this.eventToDelete.name}" удалено`, 'success')
        this.closeDeleteModal()
        
        // Обновляем статистику
        await this.loadStats()
        
      } catch (error) {
        console.error('❌ Ошибка удаления мероприятия:', error)
        this.$emit('notification', 'Ошибка при удалении мероприятия', 'error')
      } finally {
        this.deleting = false
      }
    },
    
    // ============================================
    // УТИЛИТЫ
    // ============================================
    
    getTypeCount(type) {
      return this.events.filter(e => e.event_type === type).length
    },
    
    getUniqueTypesCount() {
      const types = new Set(this.events.map(e => e.event_type))
      return types.size
    },
    
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
   🎨 ОСНОВНЫЕ СТИЛИ
   =============================================== */

.admin-events-panel {
  min-height: 100vh;
  background: var(--bg-primary, #1a1a1a);
  color: var(--text-light, #f2f2f2);
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
  color: var(--text-light, #f2f2f2);
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.panel-description {
  font-size: 1.1rem;
  color: var(--text-muted, #a0a0a0);
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
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-light, #f2f2f2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.add-btn {
  background: linear-gradient(135deg, var(--accent-orange, #ff7b25), var(--accent-green, #4caf50));
  color: white;
}

.add-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 123, 37, 0.3);
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ===============================================
   📊 СТАТИСТИКА
   =============================================== */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-card.total .stat-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-card.upcoming .stat-icon { background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); }
.stat-card.completed .stat-icon { background: linear-gradient(135deg, #ff7b25 0%, #e6691f 100%); }
.stat-card.money .stat-icon { background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%); }
.stat-card.types .stat-icon { background: linear-gradient(135deg, #9c27b0 0%, #673ab7 100%); }
.stat-card.rating .stat-icon { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); }

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-light, #f2f2f2);
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-number small {
  font-size: 1.2rem;
  opacity: 0.7;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-muted, #a0a0a0);
  font-weight: 500;
}

/* ===============================================
   🔍 ФИЛЬТРЫ И ПОИСК
   =============================================== */

.filters-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.filters-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.search-box {
  flex: 1;
  min-width: 300px;
  position: relative;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted, #a0a0a0);
  z-index: 2;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  color: var(--text-light, #f2f2f2);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: var(--accent-orange, #ff7b25);
  background: rgba(255, 255, 255, 0.08);
}

.clear-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: var(--text-muted, #a0a0a0);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: var(--text-light, #f2f2f2);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 500;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--accent-orange, #ff7b25);
}

.filter-btn.active {
  background: var(--accent-orange, #ff7b25);
  border-color: var(--accent-orange, #ff7b25);
  color: white;
}

.filter-count {
  font-size: 0.8rem;
  opacity: 0.8;
}

.sort-select {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: var(--text-light, #f2f2f2);
  cursor: pointer;
  font-size: 0.9rem;
}

/* ===============================================
   📋 СПИСОК МЕРОПРИЯТИЙ
   =============================================== */

.events-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.event-card.high-rating {
  border-color: var(--accent-green, #4caf50);
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
  color: rgba(255, 255, 255, 0.3);
}

.event-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1));
}

.event-status, .featured-badge {
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
  background: rgba(76, 175, 80, 0.8);
  color: white;
}

.event-status.completed {
  background: rgba(255, 123, 37, 0.8);
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

.event-header {
  flex: 1;
}

.event-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  flex-wrap: wrap;
}

.event-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.8rem;
}

.event-type.type-convention { background: rgba(76, 175, 80, 0.2); color: #4caf50; }
.event-type.type-market { background: rgba(255, 123, 37, 0.2); color: #ff7b25; }
.event-type.type-festival { background: rgba(156, 39, 176, 0.2); color: #9c27b0; }
.event-type.type-meetup { background: rgba(33, 150, 243, 0.2); color: #2196f3; }

.event-date {
  color: var(--text-muted, #a0a0a0);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.event-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-light, #f2f2f2);
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.event-subtitle {
  color: var(--text-muted, #a0a0a0);
  margin: 0 0 0.75rem 0;
  font-style: italic;
  line-height: 1.4;
}

.event-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted, #a0a0a0);
  margin-bottom: 1rem;
}

.event-stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars {
  display: flex;
  gap: 0.1rem;
}

.stars .fa-star {
  color: #666;
  font-size: 0.9rem;
}

.stars .fa-star.active {
  color: #ffd700;
}

.rating-text {
  font-weight: 600;
  color: var(--text-light, #f2f2f2);
}

.spent, .attendees {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted, #a0a0a0);
  font-weight: 500;
}

.event-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-light, #f2f2f2);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 500;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.action-btn.view:hover { border-color: #2196f3; color: #2196f3; }
.action-btn.edit:hover { border-color: var(--accent-orange, #ff7b25); color: var(--accent-orange, #ff7b25); }
.action-btn.duplicate:hover { border-color: #9c27b0; color: #9c27b0; }
.action-btn.delete:hover { border-color: #ef4444; color: #ef4444; }

/* ===============================================
   🗂️ СОСТОЯНИЯ
   =============================================== */

.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 2rem;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top: 3px solid var(--accent-orange, #ff7b25);
  border-radius: 50%;
  animation: spin 1s linear infinite;
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

.action-btn.primary {
  background: linear-gradient(135deg, var(--accent-orange, #ff7b25), var(--accent-green, #4caf50));
  border-color: var(--accent-orange, #ff7b25);
  color: white;
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
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal {
  background: var(--bg-primary, #1a1a1a);
  border-radius: 1rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-light, #f2f2f2);
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  color: var(--text-muted, #a0a0a0);
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

.warning {
  background: rgba(255, 193, 7, 0.1);
  border-left: 4px solid #ffc107;
  padding: 1rem;
  border-radius: 0 0.5rem 0.5rem 0;
  margin-top: 1rem;
  color: var(--text-muted, #a0a0a0);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1rem 2rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.modal-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.modal-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--text-light, #f2f2f2);
}

.modal-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.modal-btn.danger {
  background: #ef4444;
  border: 1px solid #ef4444;
  color: white;
}

.modal-btn.danger:hover:not(:disabled) {
  background: #dc2626;
  border-color: #dc2626;
}

.modal-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===============================================
   📱 АДАПТИВНОСТЬ
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
    justify-content: stretch;
  }
  
  .refresh-btn, .add-btn {
    flex: 1;
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .event-card {
    flex-direction: column;
  }
  
  .event-preview {
    width: 100%;
  }
  
  .event-banner {
    height: 160px;
  }
  
  .event-actions {
    justify-content: stretch;
  }
  
  .action-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>