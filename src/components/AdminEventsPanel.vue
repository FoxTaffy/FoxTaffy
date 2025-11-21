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

    <!-- Уведомление о событиях без обзора -->
    <div v-if="eventsNeedingReview.length > 0" class="review-alert">
      <div class="alert-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <div class="alert-content">
        <h4>Требуется написать обзор</h4>
        <p>{{ eventsNeedingReview.length }} мероприятий прошли и ждут обзора</p>
      </div>
      <div class="alert-actions">
        <button
          v-for="event in eventsNeedingReview.slice(0, 3)"
          :key="event.id"
          class="alert-event-btn"
          @click="editEvent(event)"
        >
          {{ event.name }}
        </button>
      </div>
    </div>

    <!-- Статистическая панель с графиком -->
    <div v-if="!loading && stats" class="stats-section">
      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-icon">
            <i class="fas fa-calendar-alt"></i>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.total || 0 }}</div>
            <div class="stat-label">Всего событий</div>
          </div>
          <div class="stat-trend up">
            <i class="fas fa-arrow-up"></i>
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
          <div class="stat-progress">
            <div class="progress-fill" :style="{ width: upcomingPercent + '%' }"></div>
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
          <div class="stat-progress">
            <div class="progress-fill" :style="{ width: completedPercent + '%' }"></div>
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

      <!-- Визуальная диаграмма распределения -->
      <div class="chart-section">
        <h3 class="chart-title">
          <i class="fas fa-chart-pie"></i>
          Распределение мероприятий
        </h3>
        <div class="donut-chart">
          <svg viewBox="0 0 100 100" class="chart-svg">
            <circle
              cx="50" cy="50" r="40"
              fill="none"
              stroke="rgba(255, 123, 37, 0.8)"
              stroke-width="8"
              :stroke-dasharray="upcomingArc + ' ' + (251.2 - upcomingArc)"
              stroke-dashoffset="0"
              transform="rotate(-90 50 50)"
            />
            <circle
              cx="50" cy="50" r="40"
              fill="none"
              stroke="rgba(76, 175, 80, 0.8)"
              stroke-width="8"
              :stroke-dasharray="completedArc + ' ' + (251.2 - completedArc)"
              :stroke-dashoffset="-upcomingArc"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div class="chart-center">
            <span class="chart-total">{{ stats.total || 0 }}</span>
            <span class="chart-label">всего</span>
          </div>
        </div>
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-dot upcoming"></span>
            <span>Предстоящие ({{ stats.upcoming || 0 }})</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot completed"></span>
            <span>Завершённые ({{ stats.completed || 0 }})</span>
          </div>
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
      <div class="modal create-modal wizard-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="fas fa-magic"></i>
            {{ isEditing ? 'Редактировать мероприятие' : 'Создать мероприятие' }}
          </h3>
          <button @click="closeCreateModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Wizard Steps Indicator -->
        <div class="wizard-steps">
          <div
            v-for="(step, index) in wizardSteps"
            :key="index"
            class="wizard-step"
            :class="{
              'active': currentStep === index,
              'completed': currentStep > index,
              'clickable': index <= maxReachedStep
            }"
            @click="goToStep(index)"
          >
            <div class="step-number">
              <i v-if="currentStep > index" class="fas fa-check"></i>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="step-label">{{ step.title }}</div>
          </div>
        </div>

        <div class="modal-body wizard-body">
          <!-- Шаг 1: Основная информация -->
          <div v-show="currentStep === 0" class="wizard-step-content">
            <div class="step-header">
              <div class="step-icon">
                <i class="fas fa-info-circle"></i>
              </div>
              <div class="step-info">
                <h4>Основная информация</h4>
                <p>Название, тип и дата мероприятия</p>
              </div>
            </div>

            <div class="form-group large">
              <label class="form-label required">Название мероприятия</label>
              <input
                v-model="eventForm.name"
                type="text"
                class="form-input large"
                placeholder="Например: Any Furry Fest VII"
                required
              />
            </div>

            <div class="form-row two-columns">
              <div class="form-group">
                <label class="form-label required">Тип мероприятия</label>
                <div class="event-type-grid">
                  <label
                    v-for="type in eventTypes"
                    :key="type.value"
                    class="type-card"
                    :class="{ 'selected': eventForm.event_type === type.value }"
                  >
                    <input
                      type="radio"
                      v-model="eventForm.event_type"
                      :value="type.value"
                      class="hidden-radio"
                    />
                    <i :class="type.icon"></i>
                    <span>{{ type.label }}</span>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label required">Дата и время</label>
                <div class="datetime-inputs">
                  <input
                    v-model="eventForm.event_date"
                    type="date"
                    class="form-input"
                    required
                  />
                  <input
                    v-model="eventForm.event_time"
                    type="time"
                    class="form-input time-input"
                    placeholder="10:00"
                  />
                </div>
                <div class="form-hint">
                  <i class="fas fa-info-circle"></i>
                  Дата и время начала
                </div>
              </div>
            </div>
          </div>

          <!-- Шаг 2: Место и медиа -->
          <div v-show="currentStep === 1" class="wizard-step-content">
            <div class="step-header">
              <div class="step-icon">
                <i class="fas fa-map-marker-alt"></i>
              </div>
              <div class="step-info">
                <h4>Место и описание</h4>
                <p>Где будет проходить и как выглядит</p>
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

            <div class="form-group">
              <label class="form-label">Место проведения</label>
              <input
                v-model="eventForm.location"
                type="text"
                class="form-input"
                placeholder="Название площадки, адрес"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Лого/Аватар для карточки</label>
              <div class="upload-tabs">
                <button
                  type="button"
                  @click="avatarUploadMethod = 's3'"
                  class="upload-tab"
                  :class="{ active: avatarUploadMethod === 's3' }"
                >
                  <i class="fas fa-cloud-upload-alt"></i>
                  Загрузить файл
                </button>
                <button
                  type="button"
                  @click="avatarUploadMethod = 'url'"
                  class="upload-tab"
                  :class="{ active: avatarUploadMethod === 'url' }"
                >
                  <i class="fas fa-link"></i>
                  URL
                </button>
              </div>
              <div v-if="avatarUploadMethod === 's3'" class="upload-area">
                <FileUploader
                  v-model="eventForm.avatar_url"
                  folder="events/avatars"
                  :show-info="false"
                  @file-uploaded="onAvatarUploaded"
                />
              </div>
              <div v-else class="url-input-area">
                <input
                  v-model="eventForm.avatar_url"
                  type="url"
                  class="form-input"
                  placeholder="https://example.com/logo.jpg"
                />
                <div v-if="eventForm.avatar_url" class="avatar-preview">
                  <img :src="eventForm.avatar_url" alt="Avatar" @error="eventForm.avatar_url = ''" />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Баннер (широкий)</label>
              <div class="upload-tabs">
                <button
                  type="button"
                  @click="bannerUploadMethod = 's3'"
                  class="upload-tab"
                  :class="{ active: bannerUploadMethod === 's3' }"
                >
                  <i class="fas fa-cloud-upload-alt"></i>
                  Загрузить файл
                </button>
                <button
                  type="button"
                  @click="bannerUploadMethod = 'url'"
                  class="upload-tab"
                  :class="{ active: bannerUploadMethod === 'url' }"
                >
                  <i class="fas fa-link"></i>
                  URL
                </button>
              </div>
              <div v-if="bannerUploadMethod === 's3'" class="upload-area">
                <FileUploader
                  v-model="eventForm.meta_image"
                  folder="events/banners"
                  :show-info="false"
                  @file-uploaded="onBannerUploaded"
                />
              </div>
              <div v-else class="url-input-area">
                <input
                  v-model="eventForm.meta_image"
                  type="url"
                  class="form-input"
                  placeholder="https://example.com/banner.jpg"
                />
                <div v-if="eventForm.meta_image" class="banner-preview">
                  <img :src="eventForm.meta_image" alt="Banner" @error="eventForm.meta_image = ''" />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Описание</label>
              <textarea
                v-model="eventForm.description"
                class="form-textarea"
                placeholder="Расскажите о мероприятии..."
                rows="4"
              ></textarea>
            </div>
          </div>

          <!-- Шаг 3: Статистика -->
          <div v-show="currentStep === 2" class="wizard-step-content">
            <div class="step-header">
              <div class="step-icon">
                <i class="fas fa-users"></i>
              </div>
              <div class="step-info">
                <h4>Статистика</h4>
                <p>Информация об участниках</p>
              </div>
            </div>

            <div class="form-row two-columns">
              <div class="form-group">
                <label class="form-label">Ожидаемых посетителей</label>
                <input
                  v-model="eventForm.expected_visitors"
                  type="number"
                  class="form-input"
                  placeholder="500"
                  min="0"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Фактическое количество</label>
                <input
                  v-model="eventForm.attendees_count"
                  type="number"
                  class="form-input"
                  placeholder="Заполните после мероприятия"
                  min="0"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Официальный сайт</label>
              <input
                v-model="eventForm.official_website"
                type="url"
                class="form-input"
                placeholder="https://example.com"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Особенности мероприятия</label>
              <div class="features-grid">
                <label class="feature-checkbox" :class="{ 'checked': eventForm.has_dealers_den }">
                  <input v-model="eventForm.has_dealers_den" type="checkbox" />
                  <i class="fas fa-store"></i>
                  <span>Торговая зона</span>
                </label>
                <label class="feature-checkbox" :class="{ 'checked': eventForm.has_art_show }">
                  <input v-model="eventForm.has_art_show" type="checkbox" />
                  <i class="fas fa-palette"></i>
                  <span>Арт-выставка</span>
                </label>
                <label class="feature-checkbox" :class="{ 'checked': eventForm.has_fursuit_parade }">
                  <input v-model="eventForm.has_fursuit_parade" type="checkbox" />
                  <i class="fas fa-paw"></i>
                  <span>Фурсьют-парад</span>
                </label>
                <label class="feature-checkbox" :class="{ 'checked': eventForm.is_featured }">
                  <input v-model="eventForm.is_featured" type="checkbox" />
                  <i class="fas fa-star"></i>
                  <span>Избранное</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Шаг 4: Отзыв (после мероприятия) -->
          <div v-show="currentStep === 3" class="wizard-step-content">
            <div class="step-header">
              <div class="step-icon review-icon">
                <i class="fas fa-comment-alt"></i>
              </div>
              <div class="step-info">
                <h4>Отзыв и оценка</h4>
                <p>Заполняется после посещения</p>
              </div>
            </div>

            <!-- Множественные оценки по категориям -->
            <div class="form-group">
              <label class="form-label">Оценки по категориям</label>
              <div class="multi-rating-grid">
                <div v-for="category in ratingCategories" :key="category.key" class="rating-category">
                  <span class="category-name">{{ category.label }}</span>
                  <div class="category-stars">
                    <button
                      v-for="n in 5"
                      :key="n"
                      type="button"
                      class="rating-star small"
                      :class="{ 'active': eventForm[category.key] >= n }"
                      @click="eventForm[category.key] = n"
                    >
                      <i class="fas fa-star"></i>
                    </button>
                  </div>
                  <span class="category-value">{{ eventForm[category.key] || 0 }}/5</span>
                </div>
              </div>
              <div class="overall-rating">
                <span>Общая оценка:</span>
                <strong>{{ calculatedOverallRating }}/5</strong>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Статус участия</label>
              <div class="status-selector">
                <label
                  v-for="status in filteredStatuses"
                  :key="status.value"
                  class="status-option"
                  :class="{ 'selected': eventForm.attendance_status === status.value }"
                >
                  <input
                    type="radio"
                    v-model="eventForm.attendance_status"
                    :value="status.value"
                    class="hidden-radio"
                  />
                  <i :class="status.icon"></i>
                  <span>{{ status.label }}</span>
                </label>
              </div>
            </div>

            <!-- Плюсы как список -->
            <div class="form-row two-columns">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-thumbs-up" style="color: var(--accent-green)"></i>
                  Плюсы
                </label>
                <div class="list-input-container">
                  <div v-for="(item, index) in eventForm.pros" :key="'pro-' + index" class="list-item pro-item">
                    <i class="fas fa-check"></i>
                    <input
                      v-model="eventForm.pros[index]"
                      type="text"
                      class="form-input small"
                      placeholder="Плюс..."
                    />
                    <button type="button" class="remove-list-item" @click="removeProItem(index)">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <button type="button" class="add-list-item pro" @click="addProItem">
                    <i class="fas fa-plus"></i>
                    Добавить плюс
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-thumbs-down" style="color: var(--accent-red)"></i>
                  Минусы
                </label>
                <div class="list-input-container">
                  <div v-for="(item, index) in eventForm.cons_list" :key="'con-' + index" class="list-item con-item">
                    <i class="fas fa-times"></i>
                    <input
                      v-model="eventForm.cons_list[index]"
                      type="text"
                      class="form-input small"
                      placeholder="Минус..."
                    />
                    <button type="button" class="remove-list-item" @click="removeConItem(index)">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <button type="button" class="add-list-item con" @click="addConItem">
                    <i class="fas fa-plus"></i>
                    Добавить минус
                  </button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Общее впечатление</label>
              <textarea
                v-model="eventForm.my_review"
                class="form-textarea"
                placeholder="Общий отзыв о мероприятии..."
                rows="3"
              ></textarea>
            </div>

            <!-- Покупки для маркетов/фестивалей -->
            <div v-if="eventForm.event_type === 'festival' || eventForm.event_type === 'market'" class="purchases-block">
              <h5 class="block-title">
                <i class="fas fa-shopping-bag"></i>
                Покупки
              </h5>

              <!-- Список покупок -->
              <div class="form-group">
                <label class="form-label">Список покупок</label>
                <div class="purchase-items">
                  <div
                    v-for="(item, index) in eventForm.purchase_items"
                    :key="index"
                    class="purchase-item-card"
                  >
                    <div class="purchase-item-image">
                      <img v-if="item.image" :src="item.image" alt="" />
                      <i v-else class="fas fa-image"></i>
                    </div>
                    <div class="purchase-item-info">
                      <input
                        v-model="item.name"
                        type="text"
                        class="form-input small"
                        placeholder="Название"
                      />
                      <input
                        v-model="item.price"
                        type="number"
                        class="form-input small"
                        placeholder="Цена"
                        min="0"
                      />
                      <input
                        v-model="item.image"
                        type="url"
                        class="form-input small"
                        placeholder="URL фото"
                      />
                    </div>
                    <button type="button" class="remove-item-btn" @click="removePurchaseItem(index)">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <button type="button" class="add-item-btn" @click="addPurchaseItem">
                    <i class="fas fa-plus"></i>
                    Добавить покупку
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer wizard-footer">
          <button
            v-if="currentStep > 0"
            @click="prevStep"
            class="nav-btn prev-btn"
            :disabled="saving"
          >
            <i class="fas fa-arrow-left"></i>
            <span>Назад</span>
          </button>

          <div class="footer-spacer"></div>

          <button @click="closeCreateModal" class="cancel-btn" :disabled="saving">
            <span>Отменить</span>
          </button>

          <button
            v-if="currentStep < wizardSteps.length - 1"
            @click="nextStep"
            class="nav-btn next-btn"
            :disabled="!canProceed"
          >
            <span>Далее</span>
            <i class="fas fa-arrow-right"></i>
          </button>

          <button
            v-else
            @click="saveEvent"
            class="save-btn"
            :disabled="saving || !isFormValid"
          >
            <i class="fas fa-spinner fa-spin" v-if="saving"></i>
            <i class="fas fa-check" v-else></i>
            <span>{{ saving ? 'Сохранение...' : (isEditing ? 'Сохранить' : 'Создать') }}</span>
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
import FileUploader from '@/FileUploader.vue'

export default {
  name: 'AdminEventsPanel',

  components: {
    FileUploader
  },

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
      deleting: false,

      // Upload методы
      avatarUploadMethod: 's3',
      bannerUploadMethod: 's3',

      // Wizard
      currentStep: 0,
      maxReachedStep: 0,
      wizardSteps: [
        { title: 'Основное', icon: 'fas fa-info-circle' },
        { title: 'Место', icon: 'fas fa-map-marker-alt' },
        { title: 'Статистика', icon: 'fas fa-users' },
        { title: 'Отзыв', icon: 'fas fa-comment-alt' }
      ],
      eventTypes: [
        { value: 'convention', label: 'Конвент', icon: 'fas fa-calendar-star' },
        { value: 'market', label: 'Маркет', icon: 'fas fa-store' },
        { value: 'festival', label: 'Фестиваль', icon: 'fas fa-music' },
        { value: 'meetup', label: 'Встреча', icon: 'fas fa-users' },
        { value: 'party', label: 'Вечеринка', icon: 'fas fa-glass-cheers' },
        { value: 'other', label: 'Другое', icon: 'fas fa-calendar' }
      ],
      attendanceStatuses: [
        { value: 'planning', label: 'Планирую', icon: 'fas fa-clock' },
        { value: 'registered', label: 'Зарегистрирован', icon: 'fas fa-check-circle' },
        { value: 'attended', label: 'Посетил', icon: 'fas fa-star' },
        { value: 'missed', label: 'Пропустил', icon: 'fas fa-times-circle' },
        { value: 'cancelled', label: 'Отменено', icon: 'fas fa-ban' }
      ],
      ratingCategories: [
        { key: 'rating_organization', label: 'Организация' },
        { key: 'rating_program', label: 'Программа' },
        { key: 'rating_atmosphere', label: 'Атмосфера' },
        { key: 'rating_location', label: 'Локация' },
        { key: 'rating_participants', label: 'Участники' },
        { key: 'rating_food', label: 'Питание' }
      ]
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
    },

    canProceed() {
      switch (this.currentStep) {
        case 0:
          return this.eventForm.name && this.eventForm.name.trim().length > 0 && this.eventForm.event_date
        case 1:
        case 2:
        case 3:
          return true
        default:
          return false
      }
    },

    isEventInPast() {
      if (!this.eventForm.event_date) return false
      return new Date(this.eventForm.event_date) < new Date()
    },

    upcomingPercent() {
      if (!this.stats.total) return 0
      return Math.round((this.stats.upcoming / this.stats.total) * 100)
    },

    completedPercent() {
      if (!this.stats.total) return 0
      return Math.round((this.stats.completed / this.stats.total) * 100)
    },

    upcomingArc() {
      if (!this.stats.total) return 0
      return (this.stats.upcoming / this.stats.total) * 251.2
    },

    completedArc() {
      if (!this.stats.total) return 0
      return (this.stats.completed / this.stats.total) * 251.2
    },

    calculatedOverallRating() {
      const ratings = [
        this.eventForm.rating_organization,
        this.eventForm.rating_program,
        this.eventForm.rating_atmosphere,
        this.eventForm.rating_location,
        this.eventForm.rating_participants,
        this.eventForm.rating_food
      ].filter(r => r !== null && r > 0)

      if (ratings.length === 0) return '0.0'
      const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      return avg.toFixed(1)
    },

    eventsNeedingReview() {
      return this.events.filter(e => {
        const isPast = new Date(e.event_date) < new Date()
        return isPast && !e.review_completed
      })
    },

    filteredStatuses() {
      if (this.isEventInPast) {
        return [
          { value: 'attended', label: 'Посетил', icon: 'fas fa-star' },
          { value: 'missed', label: 'Пропустил', icon: 'fas fa-times-circle' },
          { value: 'cancelled', label: 'Отменено', icon: 'fas fa-ban' }
        ]
      } else {
        return [
          { value: 'planning', label: 'Планирую', icon: 'fas fa-clock' },
          { value: 'registered', label: 'Зарегистрирован', icon: 'fas fa-check-circle' },
          { value: 'cancelled', label: 'Отменено', icon: 'fas fa-ban' }
        ]
      }
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
        event_time: '',
        announced_date: '',
        location: '',
        city: '',
        country: '',
        event_type: 'convention',
        attendance_status: 'planning',
        my_rating: null,
        attendees_count: null,
        expected_visitors: null,
        purchases_summary: '',
        official_website: '',
        meta_image: '',
        avatar_url: '',
        is_featured: false,
        has_dealers_den: false,
        has_art_show: false,
        has_fursuit_parade: false,
        my_review: '',
        pros: [],
        cons_list: [],
        purchase_items: [],
        rating_organization: null,
        rating_program: null,
        rating_atmosphere: null,
        rating_location: null,
        rating_participants: null,
        rating_food: null,
        review_completed: false
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
      this.currentStep = 0
      this.maxReachedStep = 0
    },

    nextStep() {
      if (this.currentStep < this.wizardSteps.length - 1 && this.canProceed) {
        this.currentStep++
        if (this.currentStep > this.maxReachedStep) {
          this.maxReachedStep = this.currentStep
        }
      }
    },

    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },

    goToStep(index) {
      if (index <= this.maxReachedStep) {
        this.currentStep = index
      }
    },

    getRatingLabel(rating) {
      const labels = {
        1: 'Очень плохо',
        2: 'Плохо',
        3: 'Нормально',
        4: 'Хорошо',
        5: 'Отлично'
      }
      return labels[rating] || ''
    },

    addPurchaseItem() {
      if (!this.eventForm.purchase_items) {
        this.eventForm.purchase_items = []
      }
      this.eventForm.purchase_items.push({
        name: '',
        price: null,
        image: ''
      })
    },

    removePurchaseItem(index) {
      this.eventForm.purchase_items.splice(index, 1)
    },

    onAvatarUploaded(fileData) {
      this.eventForm.avatar_url = fileData.url
      this.$emit('notification', 'Аватар загружен', 'success')
    },

    onBannerUploaded(fileData) {
      this.eventForm.meta_image = fileData.url
      this.$emit('notification', 'Баннер загружен', 'success')
    },

    addProItem() {
      if (!this.eventForm.pros) {
        this.eventForm.pros = []
      }
      this.eventForm.pros.push('')
    },

    removeProItem(index) {
      this.eventForm.pros.splice(index, 1)
    },

    addConItem() {
      if (!this.eventForm.cons_list) {
        this.eventForm.cons_list = []
      }
      this.eventForm.cons_list.push('')
    },

    removeConItem(index) {
      this.eventForm.cons_list.splice(index, 1)
    },

    editEvent(event) {
      this.isEditing = true
      this.eventForm = { ...event }
      this.currentStep = 0
      this.maxReachedStep = 3 // Allow access to all steps when editing
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
   🔔 УВЕДОМЛЕНИЕ ОБ ОБЗОРАХ
   =============================================== */

.review-alert {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.15), rgba(255, 152, 0, 0.1));
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: var(--border-radius-large);
  margin-bottom: 2rem;
}

.alert-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 193, 7, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #ffc107;
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
}

.alert-content h4 {
  margin: 0 0 0.25rem 0;
  color: var(--text-light);
  font-size: 1.1rem;
}

.alert-content p {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.alert-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.alert-event-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: var(--border-radius-small);
  color: #ffc107;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.alert-event-btn:hover {
  background: rgba(255, 193, 7, 0.3);
  transform: translateY(-2px);
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
  position: relative;
  flex-wrap: wrap;
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

.stat-trend {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
}

.stat-trend.up {
  background: rgba(76, 175, 80, 0.2);
  color: var(--accent-green);
}

.stat-progress {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin-top: 0.75rem;
  overflow: hidden;
}

.stat-progress .progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
}

.stat-card.upcoming .progress-fill {
  background: var(--accent-orange);
}

.stat-card.completed .progress-fill {
  background: var(--accent-green);
}

/* Stats section layout */
.stats-section {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  margin-bottom: 2rem;
}

/* Chart section */
.chart-section {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-large);
  padding: 1.5rem;
}

.chart-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-light);
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chart-title i {
  color: var(--accent-orange);
}

.donut-chart {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto 1.5rem;
}

.chart-svg {
  width: 100%;
  height: 100%;
}

.chart-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.chart-total {
  display: block;
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text-light);
  line-height: 1;
}

.chart-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-dot.upcoming {
  background: var(--accent-orange);
}

.legend-dot.completed {
  background: var(--accent-green);
}

@media (max-width: 1024px) {
  .stats-section {
    grid-template-columns: 1fr;
  }

  .chart-section {
    order: -1;
  }
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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
}

.event-card {
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border-radius: var(--border-radius-large);
  overflow: hidden;
  border: 1px solid var(--border-light);
  transition: all 0.3s ease;
  position: relative;
}

.event-card:hover {
  background: var(--bg-card-hover);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.event-card.featured {
  border-color: var(--accent-purple);
  box-shadow: 0 0 20px rgba(156, 39, 176, 0.2);
}

.event-card.featured::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent-purple), var(--accent-orange));
}

.event-card.high-rating {
  border-color: var(--accent-green);
}

.event-card.upcoming {
  border-color: var(--accent-orange);
}

.event-preview {
  width: 100%;
  flex-shrink: 0;
}

.event-banner {
  width: 100%;
  height: 160px;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.03);
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

/* ===============================================
   WIZARD STYLES
   =============================================== */

.wizard-modal {
  max-width: 700px;
}

.wizard-steps {
  display: flex;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid var(--border-light);
  position: relative;
}

.wizard-steps::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 15%;
  right: 15%;
  height: 2px;
  background: var(--border-light);
  transform: translateY(-50%);
  z-index: 0;
}

.wizard-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
  cursor: default;
  transition: all 0.3s ease;
}

.wizard-step.clickable {
  cursor: pointer;
}

.wizard-step.clickable:hover .step-number {
  transform: scale(1.1);
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: 2px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--text-muted);
  transition: all 0.3s ease;
}

.wizard-step.active .step-number {
  background: var(--accent-orange);
  border-color: var(--accent-orange);
  color: white;
  box-shadow: 0 0 20px rgba(255, 123, 37, 0.4);
}

.wizard-step.completed .step-number {
  background: var(--accent-green);
  border-color: var(--accent-green);
  color: white;
}

.step-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
  text-align: center;
}

.wizard-step.active .step-label {
  color: var(--accent-orange);
}

.wizard-step.completed .step-label {
  color: var(--accent-green);
}

.wizard-body {
  padding: 2rem;
  min-height: 400px;
}

.wizard-step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-light);
}

.step-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent-orange), var(--accent-green));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.step-icon.review-icon {
  background: linear-gradient(135deg, #9c27b0, #e91e63);
}

.step-info h4 {
  font-size: 1.3rem;
  color: var(--text-light);
  margin: 0 0 0.25rem 0;
}

.step-info p {
  color: var(--text-muted);
  margin: 0;
  font-size: 0.9rem;
}

.form-group.large .form-input.large {
  font-size: 1.2rem;
  padding: 1rem;
}

.event-type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0.5rem;
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-small);
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
}

.type-card:hover {
  border-color: var(--border-medium);
  background: rgba(255, 255, 255, 0.05);
}

.type-card.selected {
  border-color: var(--accent-orange);
  background: rgba(255, 123, 37, 0.1);
}

.type-card i {
  font-size: 1.2rem;
  color: var(--text-muted);
}

.type-card.selected i {
  color: var(--accent-orange);
}

.type-card span {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
}

.type-card.selected span {
  color: var(--text-light);
}

.hidden-radio {
  display: none;
}

.form-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-dim);
}

.banner-upload {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.banner-preview {
  width: 100%;
  height: 150px;
  border-radius: var(--border-radius-medium);
  overflow: hidden;
  border: 1px solid var(--border-light);
}

.banner-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-placeholder {
  width: 100%;
  height: 150px;
  border-radius: var(--border-radius-medium);
  border: 2px dashed var(--border-light);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--text-dim);
}

.banner-placeholder i {
  font-size: 2rem;
}

.banner-placeholder span {
  font-size: 0.85rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.feature-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-small);
  cursor: pointer;
  transition: all 0.2s ease;
}

.feature-checkbox:hover {
  border-color: var(--border-medium);
  background: rgba(255, 255, 255, 0.05);
}

.feature-checkbox.checked {
  border-color: var(--accent-green);
  background: rgba(76, 175, 80, 0.1);
}

.feature-checkbox input {
  display: none;
}

.feature-checkbox i {
  color: var(--text-muted);
}

.feature-checkbox.checked i {
  color: var(--accent-green);
}

.feature-checkbox span {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.feature-checkbox.checked span {
  color: var(--text-light);
}

.rating-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-star {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--text-dim);
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0.25rem;
}

.rating-star:hover,
.rating-star.active {
  color: #ffc107;
  transform: scale(1.1);
}

.rating-label {
  margin-left: 1rem;
  color: var(--text-muted);
  font-weight: 600;
}

/* Multi-rating grid */
.multi-rating-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.rating-category {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-small);
  padding: 1rem;
  text-align: center;
}

.category-name {
  display: block;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.category-stars {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.rating-star.small {
  padding: 0.25rem;
  font-size: 0.9rem;
}

.category-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--accent-orange);
}

.overall-rating {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-light);
  color: var(--text-muted);
}

.overall-rating strong {
  font-size: 1.2rem;
  color: var(--accent-orange);
}

/* List input container */
.list-input-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.list-item > i {
  width: 20px;
  text-align: center;
}

.pro-item > i {
  color: var(--accent-green);
}

.con-item > i {
  color: var(--accent-red);
}

.list-item .form-input.small {
  flex: 1;
  padding: 0.5rem;
  font-size: 0.9rem;
}

.remove-list-item {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(244, 67, 54, 0.2);
  color: var(--accent-red);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  transition: all 0.3s ease;
}

.remove-list-item:hover {
  background: rgba(244, 67, 54, 0.4);
}

.add-list-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px dashed var(--border-light);
  border-radius: var(--border-radius-small);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.add-list-item.pro:hover {
  border-color: var(--accent-green);
  color: var(--accent-green);
}

.add-list-item.con:hover {
  border-color: var(--accent-red);
  color: var(--accent-red);
}

.status-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.status-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-small);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
}

.status-option:hover {
  border-color: var(--border-medium);
}

.status-option.selected {
  border-color: var(--accent-blue);
  background: rgba(33, 150, 243, 0.1);
  color: var(--accent-blue);
}

.status-option i {
  color: var(--text-muted);
}

.status-option.selected i {
  color: var(--accent-blue);
}

.purchases-block {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: rgba(76, 175, 80, 0.05);
  border: 1px solid var(--accent-green);
  border-radius: var(--border-radius-medium);
}

.block-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--accent-green);
  margin: 0 0 1rem 0;
  font-size: 1rem;
}

.wizard-footer {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.footer-spacer {
  flex: 1;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-medium);
  background: transparent;
  color: var(--text-light);
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--border-medium);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.next-btn {
  background: var(--accent-orange);
  border-color: var(--accent-orange);
  color: white;
}

.next-btn:hover:not(:disabled) {
  background: #ff8f42;
  border-color: #ff8f42;
}

/* Datetime inputs */
.datetime-inputs {
  display: flex;
  gap: 0.5rem;
}

.time-input {
  max-width: 120px;
}

/* Upload tabs */
.upload-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.upload-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-small);
  color: var(--text-muted);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.upload-tab:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-light);
}

.upload-tab.active {
  background: var(--accent-orange);
  border-color: var(--accent-orange);
  color: white;
}

.upload-area {
  margin-bottom: 1rem;
}

.url-input-area {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Avatar upload */
.avatar-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--border-light);
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-preview {
  width: 100%;
  height: 120px;
  border-radius: var(--border-radius-small);
  overflow: hidden;
  border: 1px solid var(--border-light);
}

.banner-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Purchase items */
.purchase-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.purchase-item-card {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-small);
  align-items: flex-start;
}

.purchase-item-image {
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius-small);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.purchase-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.purchase-item-image i {
  color: var(--text-dim);
  font-size: 1.2rem;
}

.purchase-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-input.small {
  padding: 0.5rem;
  font-size: 0.85rem;
}

.remove-item-btn {
  background: none;
  border: none;
  color: var(--accent-red);
  cursor: pointer;
  padding: 0.5rem;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.remove-item-btn:hover {
  opacity: 1;
}

.add-item-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(76, 175, 80, 0.1);
  border: 1px dashed var(--accent-green);
  border-radius: var(--border-radius-small);
  color: var(--accent-green);
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  transition: all 0.2s ease;
}

.add-item-btn:hover {
  background: rgba(76, 175, 80, 0.2);
}

@media (max-width: 768px) {
  .wizard-steps {
    padding: 1rem;
  }

  .step-label {
    display: none;
  }

  .wizard-body {
    padding: 1.5rem;
  }

  .event-type-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .status-selector {
    flex-direction: column;
  }

  .wizard-footer {
    flex-wrap: wrap;
  }

  .footer-spacer {
    display: none;
  }
}
</style>