<template>
  <div class="admin-events-panel">
    <!-- Заголовок панели с градиентом -->
    <div class="panel-header">
      <div class="ph-brand">
        <div class="ph-icon-wrap">
          <span class="emoji-icon" role="img" aria-label="Events">🎪</span>
        </div>
        <div class="ph-text">
          <h1 class="ph-title">Мероприятия</h1>
          <p class="ph-sub">FoxTaffy.gay · управление событиями</p>
        </div>
      </div>

      <div class="ph-actions">
        <div class="ph-status" v-if="!loading && stats">
          <span class="status-dot"></span>
          <span>{{ stats.total || 0 }} событий</span>
        </div>
        <button @click="refreshData" class="btn-icon" :disabled="loading" title="Обновить данные">
          <i class="fas fa-sync-alt" :class="{ spinning: loading }"></i>
        </button>
        <button @click="openCreateModal" class="btn-create" :disabled="loading">
          <i class="fas fa-plus"></i>
          <span>Создать</span>
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

      <!-- 4 карточки -->
      <div class="scard-row">
        <div class="scard total">
          <div class="scard-icon"><i class="fas fa-layer-group"></i></div>
          <div class="scard-num">{{ stats.total || 0 }}</div>
          <div class="scard-label">Всего событий</div>
          <div class="scard-glow"></div>
        </div>

        <div class="scard upcoming">
          <div class="scard-icon"><i class="fas fa-hourglass-half"></i></div>
          <div class="scard-num">{{ stats.upcoming || 0 }}</div>
          <div class="scard-label">Предстоящих</div>
          <div class="scard-sub">{{ upcomingPercent }}% от всех</div>
          <div class="scard-glow"></div>
        </div>

        <div class="scard completed">
          <div class="scard-icon"><i class="fas fa-flag-checkered"></i></div>
          <div class="scard-num">{{ stats.completed || 0 }}</div>
          <div class="scard-label">Завершённых</div>
          <div class="scard-sub">{{ completedPercent }}% от всех</div>
          <div class="scard-glow"></div>
        </div>

        <div class="scard review" :class="{ 'has-alerts': eventsNeedingReview.length > 0 }">
          <div class="scard-icon"><i class="fas fa-pen-nib"></i></div>
          <div class="scard-num">{{ eventsNeedingReview.length }}</div>
          <div class="scard-label">Ждут обзора</div>
          <div class="scard-sub" v-if="eventsNeedingReview.length > 0">Требуют внимания</div>
          <div class="scard-sub" v-else>Всё написано</div>
          <div class="scard-glow"></div>
        </div>
      </div>

      <!-- Полоска распределения -->
      <div class="dist-section">
        <div class="dist-head">
          <span class="dist-title">
            <i class="fas fa-chart-bar"></i>
            Распределение событий
          </span>
          <div class="dist-legend">
            <div class="dl-item">
              <span class="dl-dot upcoming"></span>
              <span class="dl-label">Предстоящие</span>
              <span class="dl-val">{{ stats.upcoming || 0 }}</span>
              <span class="dl-pct">{{ upcomingPercent }}%</span>
            </div>
            <div class="dl-item">
              <span class="dl-dot completed"></span>
              <span class="dl-label">Завершённые</span>
              <span class="dl-val">{{ stats.completed || 0 }}</span>
              <span class="dl-pct">{{ completedPercent }}%</span>
            </div>
          </div>
        </div>
        <div class="dist-track">
          <div
            class="dist-seg upcoming"
            :style="{ width: upcomingPercent + '%' }"
            :title="`Предстоящие: ${stats.upcoming}`"
          ></div>
          <div
            class="dist-seg completed"
            :style="{ width: completedPercent + '%' }"
            :title="`Завершённые: ${stats.completed}`"
          ></div>
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
          </div>

          <!-- Дата в углу -->
          <div class="event-date-badge" :class="{ 'upcoming-badge': isUpcoming(event) }">
            <div class="date-day">{{ getDay(event.event_date) }}</div>
            <div class="date-month">{{ getMonthShort(event.event_date) }}</div>
          </div>

          <!-- Статус -->
          <div class="event-status-badge" :class="getEventStatusClass(event)">
            {{ getEventStatusText(event) }}
          </div>

          <!-- Избранное -->
          <div v-if="event.is_featured" class="featured-star">
            <i class="fas fa-star"></i>
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

              <div class="event-meta-item type">
                <i :class="getEventTypeIcon(event.event_type)"></i>
                <span>{{ getEventTypeName(event.event_type) }}</span>
              </div>
            </div>
            
            <!-- Рейтинг (только если тип поддерживает рейтинги) -->
            <div v-if="shouldShowEventRating(event) && getEventOverallRating(event) > 0" class="event-rating">
              <StarRating :rating="getEventOverallRating(event)" size="small" :show-value="true" />
            </div>
          </div>
          
          <!-- Дополнительная информация -->
          <div class="event-extras">
            <div v-if="event.attendees_count || event.expected_visitors" class="event-attendees">
              <i class="fas fa-users"></i>
              <span>{{ event.attendees_count || event.expected_visitors }}+</span>
            </div>

            <div v-if="event.photos_count" class="event-photos">
              <i class="fas fa-images"></i>
              <span>{{ event.photos_count }} фото</span>
            </div>
          </div>

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

          <!-- Действия -->
          <div class="event-actions">
            <button @click="viewEvent(event)" class="action-btn view" title="Посмотреть на сайте">
              <i class="fas fa-external-link-alt"></i>
            </button>
            <button @click="editEvent(event)" class="action-btn edit" title="Редактировать">
              <i class="fas fa-pen"></i>
            </button>
            <button @click="duplicateEvent(event)" class="action-btn duplicate" title="Дублировать">
              <i class="fas fa-copy"></i>
            </button>
            <button @click="deleteEvent(event)" class="action-btn delete" title="Удалить">
              <i class="fas fa-trash-alt"></i>
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
    <div v-if="showCreateModal" class="modal-overlay" @click="handleCloseModal">
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
            class="wizard-progress-bar"
            :style="{ width: progressWidth }"
          ></div>
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
            <div class="step-header compact">
              <div class="step-icon small">
                <i class="fas fa-info-circle"></i>
              </div>
              <div class="step-info">
                <h4>Основная информация</h4>
                <p>Название, тип, дата и описание</p>
              </div>
            </div>

            <!-- Название и тип в одном блоке -->
            <div class="form-row name-type-row">
              <div class="form-group flex-grow">
                <label class="form-label required">Название</label>
                <input
                  v-model="eventForm.name"
                  type="text"
                  class="form-input"
                  placeholder="Any Furry Fest VII"
                  required
                />
              </div>
              <div class="form-group type-select-group">
                <label class="form-label required">Тип</label>
                <div class="type-chips">
                  <label
                    v-for="type in eventTypes"
                    :key="type.value"
                    class="type-chip"
                    :class="{ 'selected': eventForm.event_type === type.value }"
                  >
                    <input type="radio" v-model="eventForm.event_type" :value="type.value" class="hidden-radio" />
                    <i :class="type.icon"></i>
                    <span>{{ type.label }}</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Изображения - компактный ряд -->
            <div class="form-group">
              <label class="form-label">Изображения</label>
              <div class="images-row">
                <CompactImageUploader
                  v-model="eventForm.avatar_url"
                  variant="avatar"
                  folder="events/avatars"
                  label="Лого"
                  @uploaded="onAvatarUploaded"
                  @error="handleUploadError"
                />
                <CompactImageUploader
                  v-model="eventForm.meta_image"
                  variant="banner"
                  folder="events/banners"
                  label="Баннер (перетащите изображение)"
                  @uploaded="onBannerUploaded"
                  @error="handleUploadError"
                />
              </div>
            </div>

            <!-- Даты компактно -->
            <div class="form-row two-columns compact-dates">
              <div class="form-group">
                <label class="form-label required">Дата начала</label>
                <input v-model="eventForm.event_date" type="date" class="form-input compact" required />
              </div>
              <div class="form-group">
                <label class="form-label">Дата окончания</label>
                <input v-model="eventForm.event_end_date" type="date" class="form-input compact" />
              </div>
            </div>

            <!-- Описание -->
            <div class="form-group">
              <label class="form-label">Описание</label>
              <textarea
                v-model="eventForm.description"
                class="form-textarea compact"
                placeholder="Краткое описание мероприятия..."
                rows="2"
              ></textarea>
            </div>

            <!-- Статусы компактно в один ряд -->
            <div class="form-group">
              <label class="form-label">Статус участия</label>
              <div class="status-chips">
                <label
                  v-for="status in mainStatuses"
                  :key="status.value"
                  class="status-chip"
                  :class="{ 'selected': eventForm.attendance_status === status.value }"
                >
                  <input type="radio" v-model="eventForm.attendance_status" :value="status.value" class="hidden-radio" />
                  <i :class="status.icon"></i>
                  <span>{{ status.label }}</span>
                </label>
              </div>
            </div>

            <!-- Роли как чекбоксы в линию -->
            <div class="form-group">
              <label class="form-label">Дополнительные роли</label>
              <div class="role-chips">
                <label
                  v-for="role in roleStatuses"
                  :key="role.value"
                  class="role-chip"
                  :class="{ 'selected': eventForm.attendance_roles.includes(role.value) }"
                >
                  <input type="checkbox" v-model="eventForm.attendance_roles" :value="role.value" class="hidden-checkbox" />
                  <i :class="role.icon"></i>
                  <span>{{ role.label }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Шаг 2: Место и детали -->
          <div v-show="currentStep === 1" class="wizard-step-content">
            <div class="step-header compact">
              <div class="step-icon small">
                <i class="fas fa-map-marker-alt"></i>
              </div>
              <div class="step-info">
                <h4>Место проведения</h4>
                <p>Где проходит мероприятие</p>
              </div>
            </div>

            <div class="form-row two-columns">
              <div class="form-group">
                <label class="form-label">Город</label>
                <input v-model="eventForm.city" type="text" class="form-input" placeholder="Москва" />
              </div>
              <div class="form-group">
                <label class="form-label">Страна</label>
                <input v-model="eventForm.country" type="text" class="form-input" placeholder="Россия" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Место проведения</label>
              <input v-model="eventForm.location" type="text" class="form-input" placeholder="Название площадки, адрес" />
            </div>

            <div class="form-group">
              <label class="form-label">Официальный сайт</label>
              <input v-model="eventForm.official_website" type="url" class="form-input" placeholder="https://example.com" />
            </div>
          </div>

          <!-- Шаг 3: Статистика -->
          <div v-show="currentStep === 2" class="wizard-step-content">
            <div class="step-header compact">
              <div class="step-icon small">
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
                <input v-model="eventForm.expected_visitors" type="number" class="form-input" placeholder="500" min="0" />
              </div>
              <div class="form-group">
                <label class="form-label">Фактическое количество</label>
                <input v-model="eventForm.attendees_count" type="number" class="form-input" placeholder="После мероприятия" min="0" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Особенности мероприятия</label>
              <div class="features-chips">
                <label class="feature-chip" :class="{ 'checked': eventForm.has_dealers_den }">
                  <input v-model="eventForm.has_dealers_den" type="checkbox" />
                  <i class="fas fa-store"></i>
                  <span>Торговая зона</span>
                </label>
                <label class="feature-chip" :class="{ 'checked': eventForm.has_art_show }">
                  <input v-model="eventForm.has_art_show" type="checkbox" />
                  <i class="fas fa-palette"></i>
                  <span>Арт-выставка</span>
                </label>
                <label class="feature-chip" :class="{ 'checked': eventForm.has_fursuit_parade }">
                  <input v-model="eventForm.has_fursuit_parade" type="checkbox" />
                  <i class="fas fa-paw"></i>
                  <span>Фурсьют-парад</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Шаг 4: Отзыв (после мероприятия) -->
          <div v-show="currentStep === 3" class="wizard-step-content">
            <div class="step-header compact">
              <div class="step-icon small review-icon">
                <i class="fas fa-comment-alt"></i>
              </div>
              <div class="step-info">
                <h4>Отзыв и оценка</h4>
                <p>Заполняется после посещения</p>
              </div>
            </div>

            <!-- Выделенная отметка о завершении обзора - вверху -->
            <div class="review-completed-banner" :class="{ 'completed': eventForm.review_completed }">
              <label class="review-completed-toggle">
                <input type="checkbox" v-model="eventForm.review_completed" />
                <span class="toggle-track">
                  <span class="toggle-thumb"></span>
                </span>
                <span class="toggle-content">
                  <i :class="eventForm.review_completed ? 'fas fa-check-circle' : 'fas fa-edit'"></i>
                  <span class="toggle-text">{{ eventForm.review_completed ? 'Обзор завершён!' : 'Отметить обзор как завершённый' }}</span>
                </span>
              </label>
            </div>

            <!-- Множественные оценки по категориям -->
            <div v-if="filteredRatingCategories.length > 0" class="form-group">
              <label class="form-label">Оценки по категориям</label>
              <div class="rating-grid-compact">
                <div v-for="category in filteredRatingCategories" :key="category.key" class="rating-row">
                  <span class="rating-label-text">{{ category.label }}</span>
                  <div class="rating-stars-inline">
                    <button v-for="n in 5" :key="n" type="button" class="star-btn" :class="{ 'active': eventForm[category.key] >= n }" @click="eventForm[category.key] = n">
                      <i class="fas fa-star"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div class="overall-rating-compact">
                <span>Общая:</span>
                <strong>{{ calculatedOverallRating }}/5</strong>
              </div>
            </div>

            <!-- Плюсы и минусы компактно -->
            <div class="form-row two-columns">
              <div class="form-group">
                <label class="form-label"><i class="fas fa-thumbs-up" style="color: var(--accent-green)"></i> Плюсы</label>
                <div class="list-compact">
                  <div v-for="(item, index) in eventForm.pros" :key="'pro-' + index" class="list-item-compact">
                    <input v-model="eventForm.pros[index]" type="text" class="form-input compact" placeholder="Плюс..." />
                    <button type="button" class="remove-btn-small" @click="removeProItem(index)"><i class="fas fa-times"></i></button>
                  </div>
                  <button type="button" class="add-btn-small pro" @click="addProItem"><i class="fas fa-plus"></i> Добавить</button>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label"><i class="fas fa-thumbs-down" style="color: var(--accent-red)"></i> Минусы</label>
                <div class="list-compact">
                  <div v-for="(item, index) in eventForm.cons_text" :key="'con-' + index" class="list-item-compact">
                    <input v-model="eventForm.cons_text[index]" type="text" class="form-input compact" placeholder="Минус..." />
                    <button type="button" class="remove-btn-small" @click="removeConItem(index)"><i class="fas fa-times"></i></button>
                  </div>
                  <button type="button" class="add-btn-small con" @click="addConItem"><i class="fas fa-plus"></i> Добавить</button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Общее впечатление</label>
              <textarea v-model="eventForm.my_review" class="form-textarea compact" placeholder="Общий отзыв..." rows="2"></textarea>
            </div>
          </div>

          <!-- Шаг 5: Покупки -->
          <div v-show="currentStep === 4" class="wizard-step-content">
            <div class="step-header compact">
              <div class="step-icon small">
                <i class="fas fa-shopping-bag"></i>
              </div>
              <div class="step-info">
                <h4>Покупки</h4>
                <p>Добавьте приобретённые товары</p>
              </div>
            </div>

            <!-- Переключатель покупок -->
            <div class="form-group">
              <label class="toggle-switch">
                <input type="checkbox" v-model="eventForm.has_purchases" />
                <span class="toggle-slider"></span>
                <span class="toggle-label">
                  <i class="fas fa-shopping-bag"></i>
                  Были покупки на мероприятии
                </span>
              </label>
            </div>

            <!-- Покупки (если включены) -->
            <div v-if="eventForm.has_purchases" class="purchases-section">
              <div class="section-header-compact">
                <i class="fas fa-shopping-bag"></i>
                <span>Покупки</span>
              </div>
              <div class="purchase-items-compact">
                <div v-for="(item, index) in eventForm.purchase_items" :key="index" class="purchase-item-compact">
                  <div class="purchase-thumb">
                    <img v-if="item.image" :src="item.image" alt="" />
                    <i v-else class="fas fa-image"></i>
                    <input type="file" :ref="'purchasePhoto' + index" accept="image/*" style="display: none" @change="uploadPurchasePhoto($event, index)" />
                    <button type="button" class="thumb-upload" @click="triggerPurchasePhotoUpload(index)" :disabled="uploadingPurchasePhoto === index">
                      <i :class="uploadingPurchasePhoto === index ? 'fas fa-spinner fa-spin' : 'fas fa-camera'"></i>
                    </button>
                  </div>
                  <input v-model="item.name" type="text" class="form-input compact" placeholder="Название" />
                  <input v-model="item.price" type="number" class="form-input compact price-input" placeholder="₽" min="0" />
                  <button type="button" class="remove-btn-small" @click="removePurchaseItem(index)"><i class="fas fa-times"></i></button>
                </div>
                <button type="button" class="add-btn-small purchase" @click="addPurchaseItem"><i class="fas fa-plus"></i> Добавить покупку</button>
              </div>
            </div>
          </div>

          <!-- Шаг 6: Галерея фотографий -->
          <div v-show="currentStep === 5" class="wizard-step-content">
            <div class="step-header compact">
              <div class="step-icon small gallery-icon">
                <i class="fas fa-images"></i>
              </div>
              <div class="step-info">
                <h4>Галерея фотографий</h4>
                <p>Загрузите фотографии с мероприятия</p>
              </div>
            </div>

            <!-- Зона drag & drop для фотографий -->
            <div
              class="gallery-upload-zone"
              :class="{ 'dragging': isDraggingPhotos, 'uploading': uploadingPhotos }"
              @dragover.prevent="isDraggingPhotos = true"
              @dragleave.prevent="isDraggingPhotos = false"
              @drop.prevent="handlePhotoDrop"
              @click="$refs.multiPhotoInput.click()"
            >
              <input type="file" ref="multiPhotoInput" multiple accept="image/*" @change="handleMultiPhotoUpload" class="hidden-input" />
              <div v-if="uploadingPhotos" class="upload-status">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Загрузка {{ uploadProgress }}/{{ uploadTotal }}...</span>
              </div>
              <div v-else class="upload-prompt">
                <i class="fas fa-cloud-upload-alt"></i>
                <span>Перетащите фотографии сюда или нажмите для выбора</span>
                <small>JPG, PNG, WebP • до 10MB каждая</small>
              </div>
            </div>

            <!-- Превью загруженных фотографий -->
            <div v-if="uploadedPhotos.length > 0" class="gallery-preview">
              <div class="gallery-header">
                <span>Загружено: {{ uploadedPhotos.length }} фото</span>
              </div>
              <div class="gallery-grid">
                <div v-for="(photo, index) in uploadedPhotos" :key="index" class="gallery-thumb">
                  <img :src="typeof photo === 'string' ? photo : photo.url" alt="" loading="lazy" />
                  <button type="button" class="gallery-remove" @click="removeUploadedPhoto(index)">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="gallery-empty">
              <i class="fas fa-camera-retro"></i>
              <p>Пока нет загруженных фотографий</p>
            </div>
          </div>
        </div>

        <div class="modal-footer wizard-footer">
          <button
            type="button"
            v-if="currentStep > 0"
            @click.prevent="prevStep"
            class="nav-btn prev-btn"
            :disabled="saving"
          >
            <i class="fas fa-arrow-left"></i>
            <span>Назад</span>
          </button>

          <div class="footer-spacer"></div>

          <button type="button" @click.prevent="handleCloseModal" class="cancel-btn" :disabled="saving">
            <span>Отменить</span>
          </button>

          <button
            type="button"
            v-if="currentStep < wizardSteps.length - 1"
            @click.prevent="nextStep"
            class="nav-btn next-btn"
            :disabled="!canProceed"
          >
            <span>Далее</span>
            <i class="fas fa-arrow-right"></i>
          </button>

          <button
            type="button"
            v-else
            @click.prevent="saveEvent"
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
import FileUploader from '@/components/FileUploader.vue'
import StarRating from '@/components/ui/StarRating.vue'
import CompactImageUploader from '@/components/CompactImageUploader.vue'

export default {
  name: 'AdminEventsPanel',

  components: {
    FileUploader,
    StarRating,
    CompactImageUploader
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
        completed: 0
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
      originalFormData: null,
      
      // Удаление
      eventToDelete: null,
      deleting: false,

      // Upload методы
      avatarUploadMethod: 's3',
      bannerUploadMethod: 's3',

      // Мульти-загрузка фотографий
      uploadingPhotos: false,
      uploadProgress: 0,
      uploadTotal: 0,
      uploadedPhotos: [],
      uploadingPurchasePhoto: null,
      isDraggingPhotos: false,

      // Wizard
      currentStep: 0,
      maxReachedStep: 0,
      eventTypes: [
        { value: 'convention', label: 'Конвент', icon: 'fas fa-crown' },
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
        { value: 'vip', label: 'VIP', icon: 'fas fa-gem' },
        { value: 'volunteer', label: 'Волонтёр', icon: 'fas fa-hands-helping' },
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
        case 4:
          return true
        default:
          return false
      }
    },

    isEventInPast() {
      if (!this.eventForm.event_date) return false

      try {
        const eventDate = new Date(this.eventForm.event_date)
        if (isNaN(eventDate.getTime()) || !isFinite(eventDate.getTime())) return false
        return eventDate < new Date()
      } catch (error) {
        console.error('Ошибка проверки даты:', error)
        return false
      }
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
        if (!e || !e.event_date) return false

        try {
          const eventDate = new Date(e.event_date)
          if (isNaN(eventDate.getTime()) || !isFinite(eventDate.getTime())) return false
          const isPast = eventDate < new Date()
          return isPast && !e.review_completed
        } catch (error) {
          return false
        }
      })
    },

    hasUnsavedChanges() {
      if (!this.originalFormData) return false

      // Сравниваем текущую форму с исходной
      const currentForm = JSON.stringify({
        ...this.eventForm,
        uploadedPhotos: this.uploadedPhotos
      })
      const originalForm = JSON.stringify(this.originalFormData)

      return currentForm !== originalForm
    },

    // Фильтрация категорий рейтинга в зависимости от типа мероприятия (согласно таблице event_type_rating_config)
    filteredRatingCategories() {
      const type = this.eventForm.event_type

      // Для маркета - убираем программу и питание (там нет программы и общепита)
      if (type === 'market') {
        return this.ratingCategories.filter(c =>
          !['rating_program', 'rating_food'].includes(c.key)
        )
      }

      // Для фестиваля - убираем питание (обычно нет общепита)
      if (type === 'festival') {
        return this.ratingCategories.filter(c => c.key !== 'rating_food')
      }

      // Для вечеринки - убираем программу (обычно нет программы, только музыка/танцы)
      if (type === 'party') {
        return this.ratingCategories.filter(c => c.key !== 'rating_program')
      }

      // Для встречи (meetup) - убираем программу и питание
      if (type === 'meetup') {
        return this.ratingCategories.filter(c =>
          !['rating_program', 'rating_food'].includes(c.key)
        )
      }

      // Для конвента и других типов показываем все рейтинги
      return this.ratingCategories
    },

    // Основные статусы участия (выбирается один)
    mainStatuses() {
      return [
        { value: 'planning', label: 'Планирую', icon: 'fas fa-clock' },
        { value: 'registered', label: 'Зарегистрирован', icon: 'fas fa-check-circle' },
        { value: 'ticket_purchased', label: 'Билет куплен', icon: 'fas fa-ticket-alt' },
        { value: 'attended', label: 'Посетил', icon: 'fas fa-star' },
        { value: 'missed', label: 'Пропустил', icon: 'fas fa-times-circle' },
        { value: 'cancelled', label: 'Отменено', icon: 'fas fa-ban' }
      ]
    },

    // Дополнительные роли (можно выбрать несколько)
    roleStatuses() {
      return [
        { value: 'vip', label: 'VIP', icon: 'fas fa-crown' },
        { value: 'sponsor', label: 'Спонсор', icon: 'fas fa-hand-holding-usd' },
        { value: 'volunteer', label: 'Волонтёр', icon: 'fas fa-hands-helping' }
      ]
    },

    // Шаги визарда - этапы обзора и галереи только для прошедших мероприятий
    wizardSteps() {
      const baseSteps = [
        { title: 'Основное', icon: 'fas fa-info-circle' },
        { title: 'Место', icon: 'fas fa-map-marker-alt' },
        { title: 'Статистика', icon: 'fas fa-users' }
      ]

      // Этапы обзора и галереи только для прошедших мероприятий (редактирование после события)
      if (this.eventForm.id && this.isEventInPast) {
        baseSteps.push({ title: 'Отзыв', icon: 'fas fa-comment-alt' })
        baseSteps.push({ title: 'Покупки', icon: 'fas fa-shopping-bag' })
        baseSteps.push({ title: 'Галерея', icon: 'fas fa-images' })
      }

      return baseSteps
    },

    // Вычисляемая ширина прогресс-бара
    progressWidth() {
      if (this.wizardSteps.length <= 1) return '0%'
      const progress = this.currentStep / (this.wizardSteps.length - 1)
      return `calc((100% - 24%) * ${progress})`
    },
  },
  
  async mounted() {
    await this.loadInitialData()
  },

  watch: {
    // Автоматически включаем покупки для фестивалей и маркетов
    'eventForm.event_type': {
      handler(newType) {
        if (['festival', 'market'].includes(newType) && !this.isEditing) {
          this.eventForm.has_purchases = true
        }
      },
      immediate: false
    },
    // Автоматически включаем has_purchases если есть покупки
    'eventForm.purchase_items': {
      handler(newItems) {
        if (newItems && newItems.length > 0 && !this.eventForm.has_purchases) {
          this.eventForm.has_purchases = true
        }
      },
      deep: true,
      immediate: true
    }
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

        // Нормализуем даты для всех событий
        // Это решает проблему разных форматов дат между preview и production
        this.events = (events || []).map(event => this.normalizeEventDates(event))

        console.log('✅ AdminEvents: Мероприятия загружены и нормализованы:', this.events.length)

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
        event_end_date: '',
        announced_date: '',
        location: '',
        city: '',
        country: '',
        event_type: 'convention',
        attendance_status: 'planning',  // Основной статус участия
        attendance_roles: [],  // Дополнительные роли (VIP, Спонсор, Волонтёр)
        my_rating: null,
        attendees_count: null,
        expected_visitors: null,
        purchases_summary: '',
        official_website: '',
        meta_image: '',
        avatar_url: '',
        has_dealers_den: false,
        has_art_show: false,
        has_fursuit_parade: false,
        my_review: '',
        pros: [],
        cons_text: [],
        purchase_items: [],
        rating_organization: null,
        rating_program: null,
        rating_atmosphere: null,
        rating_location: null,
        rating_participants: null,
        rating_food: null,
        review_completed: false,
        photos_folder: '',
        has_purchases: false
      }
    },
    
    openCreateModal() {
      this.isEditing = false
      this.eventForm = this.getEmptyForm()
      this.uploadedPhotos = []
      // Сохраняем исходное состояние
      this.originalFormData = {
        ...this.eventForm,
        uploadedPhotos: []
      }
      this.showCreateModal = true
    },

    handleCloseModal() {
      // Проверяем наличие несохраненных изменений
      if (this.hasUnsavedChanges) {
        if (confirm('У вас есть несохраненные изменения. Вы уверены, что хотите выйти?')) {
          this.closeCreateModal()
        }
      } else {
        this.closeCreateModal()
      }
    },

    closeCreateModal() {
      this.showCreateModal = false
      this.isEditing = false
      this.eventForm = this.getEmptyForm()
      this.uploadedPhotos = []
      this.originalFormData = null
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

    triggerPurchasePhotoUpload(index) {
      const refName = 'purchasePhoto' + index
      const refEl = this.$refs[refName]
      const input = Array.isArray(refEl) ? refEl[0] : refEl
      if (input && typeof input.click === 'function') {
        input.click()
      }
    },

    async uploadPurchasePhoto(event, index) {
      const file = event.target.files[0]
      if (!file) return

      if (!this.eventForm.id) {
        this.$emit('notification', 'Сначала сохраните мероприятие', 'warning')
        return
      }

      this.uploadingPurchasePhoto = index

      try {
        console.log(`📸 Загружаем фото покупки для мероприятия ${this.eventForm.id}...`)

        const { s3Api } = await import('@/config/s3.js')

        // Загружаем фото покупки
        const result = await s3Api.uploadPurchasePhoto(file, this.eventForm.id)

        // Сохраняем URL в форме
        this.eventForm.purchase_items[index].image = result.url

        this.$emit('notification', '✅ Фото покупки загружено', 'success')
        console.log('✅ Фото покупки загружено:', result.url)

      } catch (error) {
        console.error('❌ Ошибка загрузки фото покупки:', error)
        this.$emit('notification', 'Ошибка загрузки: ' + error.message, 'error')
      } finally {
        this.uploadingPurchasePhoto = null
        event.target.value = ''
      }
    },

    async deletePurchasePhoto(index) {
      const item = this.eventForm.purchase_items[index]
      if (!item.image) return

      try {
        console.log('🗑️ Удаляем фото покупки:', item.image)

        const { s3Api } = await import('@/config/s3.js')

        // Извлекаем путь файла из URL
        const url = new URL(item.image)
        const pathParts = url.pathname.split('/')
        const bucketIndex = pathParts.indexOf('foxtaffy')
        if (bucketIndex !== -1) {
          const filePath = pathParts.slice(bucketIndex + 1).join('/')
          await s3Api.deleteFile(filePath)
          console.log('✅ Фото покупки удалено из Storage')
        }

        // Удаляем URL из формы
        this.eventForm.purchase_items[index].image = ''

        this.$emit('notification', 'Фото покупки удалено', 'success')

      } catch (error) {
        console.error('❌ Ошибка удаления фото покупки:', error)
        this.$emit('notification', 'Ошибка удаления: ' + error.message, 'error')
      }
    },

    onAvatarUploaded(fileData) {
      this.eventForm.avatar_url = fileData.url
      this.$emit('notification', 'Аватар загружен', 'success')
    },

    onBannerUploaded(fileData) {
      this.eventForm.meta_image = fileData.url
      this.$emit('notification', 'Баннер загружен', 'success')
    },

    handleUploadError(message) {
      this.$emit('notification', message, 'error')
    },

    handlePhotoDrop(event) {
      this.isDraggingPhotos = false
      const files = Array.from(event.dataTransfer?.files || [])
      if (files.length > 0) {
        // Создаём фейковый event для handleMultiPhotoUpload
        const fakeEvent = { target: { files: files, value: '' } }
        this.handleMultiPhotoUpload(fakeEvent)
      }
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
      if (!this.eventForm.cons_text) {
        this.eventForm.cons_text = []
      }
      this.eventForm.cons_text.push('')
    },

    removeConItem(index) {
      this.eventForm.cons_text.splice(index, 1)
    },

    // Транслитерация для папок S3
    transliterate(text) {
      const map = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
        ' ': '-', '_': '-'
      }
      return text.toLowerCase().split('').map(char => map[char] || char).join('')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
    },

    // Мульти-загрузка фотографий
    async handleMultiPhotoUpload(event) {
      const files = Array.from(event.target.files)
      if (!files.length) return

      // Проверяем, что мероприятие уже создано (есть ID)
      if (!this.eventForm.id) {
        this.$emit('notification', 'Сначала сохраните мероприятие, затем загружайте фотографии', 'warning')
        event.target.value = ''
        return
      }

      this.uploadingPhotos = true
      this.uploadProgress = 0
      this.uploadTotal = files.length

      try {
        console.log(`📸 Загружаем ${files.length} фотографий для мероприятия ${this.eventForm.id}...`)

        const { s3Api } = await import('@/config/s3.js')

        // Используем новый метод uploadEventPhotos который автоматически создает миниатюры
        const results = await s3Api.uploadEventPhotos(
          files,
          this.eventForm.id,
          (totalProgress, currentFile, totalFiles) => {
            this.uploadProgress = currentFile
            this.uploadTotal = totalFiles
          }
        )

        // Сохраняем фотографии в базу данных
        if (results.length > 0) {
          await furryApi.saveEventPhotos(this.eventForm.id, results)
          console.log('✅ Фотографии сохранены в базу данных')

          // Загружаем обновленный список фотографий из БД
          const photos = await furryApi.getEventPhotos(this.eventForm.id)
          // Добавляем фотографии в массив для превью (с полной информацией)
          photos.forEach(photo => {
            this.uploadedPhotos.push({
              id: photo.id,
              url: photo.thumbnail_url || photo.image_url,
              isNew: false
            })
          })
        }

        this.$emit('notification', `✅ Загружено ${files.length} фотографий с миниатюрами`, 'success')

      } catch (error) {
        console.error('❌ Ошибка загрузки фотографий:', error)
        this.$emit('notification', 'Ошибка загрузки: ' + error.message, 'error')
      } finally {
        this.uploadingPhotos = false
        this.uploadProgress = 0
        this.uploadTotal = 0
        event.target.value = ''
      }
    },

    async removeUploadedPhoto(index) {
      const photo = this.uploadedPhotos[index]

      // Если это не новая фотография (уже сохранена в БД)
      if (photo && typeof photo === 'object' && photo.id) {
        try {
          console.log('🗑️ Удаляем фотографию из БД и Storage:', photo.id)

          // Удаляем через API (удалит из БД и Storage)
          await furryApi.deleteEventPhoto(photo.id)

          // Удаляем из локального массива
          this.uploadedPhotos.splice(index, 1)

          this.$emit('notification', 'Фотография удалена', 'success')
          console.log('✅ Фотография успешно удалена')

        } catch (error) {
          console.error('❌ Ошибка удаления фотографии:', error)
          this.$emit('notification', 'Ошибка удаления: ' + error.message, 'error')
        }
      } else {
        // Для новых фотографий (еще не сохранены в БД) - просто удаляем из превью
        this.uploadedPhotos.splice(index, 1)
      }
    },

    async editEvent(event) {
      this.isEditing = true

      // Сначала нормализуем все даты к ISO формату
      const normalizedEvent = this.normalizeEventDates(event)
      this.eventForm = { ...normalizedEvent }

      // Конвертируем дату из ISO формата в YYYY-MM-DD для input[type="date"]
      // После нормализации все даты гарантированно либо ISO строки либо null
      if (this.eventForm.event_date) {
        this.eventForm.event_date = this.eventForm.event_date.split('T')[0]
      }

      if (this.eventForm.event_end_date) {
        this.eventForm.event_end_date = this.eventForm.event_end_date.split('T')[0]
      }

      if (this.eventForm.announced_date) {
        this.eventForm.announced_date = this.eventForm.announced_date.split('T')[0]
      }

      // Инициализируем массивы если они null
      if (!this.eventForm.pros) this.eventForm.pros = []
      if (!this.eventForm.cons_text) this.eventForm.cons_text = []

      // Преобразуем attendance_status для новой структуры (статус + роли)
      if (this.eventForm.attendance_status) {
        if (typeof this.eventForm.attendance_status === 'string') {
          try {
            const parsed = JSON.parse(this.eventForm.attendance_status)

            // Если это объект с полями status и roles (новый формат)
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
              this.eventForm.attendance_status = parsed.status || 'planning'
              this.eventForm.attendance_roles = parsed.roles || []
            }
            // Если это массив (старый формат) - первый элемент статус, остальные роли
            else if (Array.isArray(parsed)) {
              const roles = ['vip', 'sponsor', 'volunteer']
              const mainStatuses = ['planning', 'registered', 'ticket_purchased', 'attended', 'missed', 'cancelled']

              this.eventForm.attendance_status = parsed.find(s => mainStatuses.includes(s)) || 'planning'
              this.eventForm.attendance_roles = parsed.filter(s => roles.includes(s))
            }
            // Если это просто строка в JSON
            else {
              this.eventForm.attendance_status = parsed
              this.eventForm.attendance_roles = []
            }
          } catch {
            // Если не JSON, то обычная строка - это статус
            this.eventForm.attendance_status = this.eventForm.attendance_status
            this.eventForm.attendance_roles = []
          }
        }
      } else {
        this.eventForm.attendance_status = 'planning'
        this.eventForm.attendance_roles = []
      }

      // Загружаем покупки и фотографии
      try {
        const [purchases, photos] = await Promise.all([
          furryApi.getEventPurchases(event.id),
          furryApi.getEventPhotos(event.id)
        ])

        this.eventForm.purchase_items = purchases.map(p => ({
          name: p.item_name,
          price: p.price,
          image: p.image_url
        }))

        // Используем миниатюры для превью вместо оригиналов
        this.uploadedPhotos = photos.map(p => ({
          id: p.id,
          url: p.thumbnail_url || p.image_url,
          isNew: false
        }))
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
        this.eventForm.purchase_items = []
        this.uploadedPhotos = []
      }

      this.currentStep = 0
      this.maxReachedStep = 3 // Allow access to all steps when editing

      // Сохраняем исходное состояние после загрузки всех данных
      this.originalFormData = {
        ...this.eventForm,
        uploadedPhotos: [...this.uploadedPhotos]
      }

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

        // Подготавливаем данные для сохранения
        const dataToSave = { ...this.eventForm }

        // Преобразуем attendance_status в JSON объект для БД
        const attendanceData = {
          status: dataToSave.attendance_status || 'planning',
          roles: dataToSave.attendance_roles || []
        }
        dataToSave.attendance_status = JSON.stringify(attendanceData)

        // Удаляем временные поля (они не существуют в БД)
        delete dataToSave.attendance_roles
        delete dataToSave.has_purchases

        let savedEvent

        if (this.isEditing) {
          console.log('✏️ AdminEvents: Обновляем мероприятие:', dataToSave.id)
          savedEvent = await furryApi.updateEvent(dataToSave.id, dataToSave)
        } else {
          console.log('➕ AdminEvents: Создаём новое мероприятие')
          savedEvent = await furryApi.createEvent(dataToSave)
        }
        
        console.log('✅ AdminEvents: Мероприятие сохранено:', savedEvent)

        // Сохраняем покупки
        if (this.eventForm.purchase_items && this.eventForm.purchase_items.length > 0) {
          await furryApi.saveEventPurchases(savedEvent.id, this.eventForm.purchase_items)
          console.log('✅ AdminEvents: Покупки сохранены')
        }

        // Сохраняем фотографии
        if (this.uploadedPhotos && this.uploadedPhotos.length > 0) {
          await furryApi.saveEventPhotos(savedEvent.id, this.uploadedPhotos)
          console.log('✅ AdminEvents: Фотографии сохранены')
        }

        // Нормализуем даты перед добавлением в локальные данные
        // КРИТИЧНО: savedEvent из API может иметь разный формат дат на preview vs production
        const normalizedEvent = this.normalizeEventDates(savedEvent)

        // Обновляем локальные данные
        if (this.isEditing) {
          const index = this.events.findIndex(e => e.id === savedEvent.id)
          if (index !== -1) {
            this.events.splice(index, 1, normalizedEvent)
          }
        } else {
          this.events.unshift(normalizedEvent)
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
      // Нормализуем даты перед дублированием
      const normalizedEvent = this.normalizeEventDates(event)
      this.eventForm = {
        ...normalizedEvent,
        id: undefined,
        name: `${event.name} (копия)`,
        slug: '',
        created_at: undefined,
        updated_at: undefined
      }
      this.uploadedPhotos = []
      // Сохраняем исходное состояние
      this.originalFormData = {
        ...this.eventForm,
        uploadedPhotos: []
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
      if (!event.event_date) return false
      const eventDate = new Date(event.event_date)
      if (isNaN(eventDate.getTime())) return false
      return eventDate > new Date()
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
        convention: 'fas fa-crown',
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
    
    // ============================================
    // НОРМАЛИЗАЦИЯ ДАТ
    // ============================================

    // Нормализует одну дату - преобразует в ISO строку или null
    normalizeDateValue(dateValue) {
      if (dateValue === null || dateValue === undefined) {
        return null
      }

      try {
        const date = new Date(dateValue)
        if (!isNaN(date.getTime()) && isFinite(date.getTime())) {
          return date.toISOString()
        } else {
          return null
        }
      } catch (e) {
        console.warn('⚠️ Некорректное значение даты:', dateValue)
        return null
      }
    },

    // Нормализует все даты в объекте события
    normalizeEventDates(event) {
      if (!event) return event

      return {
        ...event,
        event_date: this.normalizeDateValue(event.event_date),
        event_end_date: this.normalizeDateValue(event.event_end_date),
        announced_date: this.normalizeDateValue(event.announced_date)
      }
    },

    formatEventDate(dateString) {
      // Максимально строгая проверка
      if (!dateString) return 'Дата не указана'

      // Проверяем что это строка
      if (typeof dateString !== 'string') {
        // Если это Date объект, конвертируем
        if (dateString instanceof Date) {
          if (isNaN(dateString.getTime())) return 'Некорректная дата'
          dateString = dateString.toISOString()
        } else {
          return 'Некорректный формат даты'
        }
      }

      // Проверка на пустую строку
      if (dateString.trim() === '') return 'Дата не указана'

      try {
        const date = new Date(dateString)
        // Двойная проверка валидности
        if (isNaN(date.getTime()) || !isFinite(date.getTime())) {
          return 'Некорректная дата'
        }

        return date.toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      } catch (error) {
        console.error('Ошибка форматирования даты:', dateString, error)
        return 'Ошибка даты'
      }
    },
    
    formatMoney(amount) {
      if (!amount) return '0 ₽'
      return `${Number(amount).toLocaleString('ru-RU')} ₽`
    },

    // Проверка, нужно ли показывать рейтинг (проверяет наличие оценок)
    shouldShowEventRating(event) {
      if (!event) return false

      // Проверяем наличие хотя бы одной оценки
      const hasRatings = [
        event.rating_organization,
        event.rating_program,
        event.rating_atmosphere,
        event.rating_location,
        event.rating_participants,
        event.rating_food
      ].some(r => r !== null && r !== undefined && r > 0)

      // Если есть оценки в новой системе или старый my_rating - показываем
      return hasRatings || (event.my_rating && event.my_rating > 0)
    },

    // Вычисление общего рейтинга из 6 категорий
    getEventOverallRating(event) {
      if (!event) return 0

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
      return parseFloat(avg.toFixed(1))
    },

    // Методы для форматирования даты в угловом бейдже
    getMonthShort(dateValue) {
      if (!dateValue) return '---'

      try {
        // Нормализация даты - преобразуем в Date если это строка
        const date = dateValue instanceof Date ? dateValue : new Date(dateValue)

        // Проверка валидности даты
        if (isNaN(date.getTime()) || !isFinite(date.getTime())) {
          console.error('Invalid date in getMonthShort:', dateValue)
          return '---'
        }

        const months = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК']
        return months[date.getMonth()]
      } catch (error) {
        console.error('Error in getMonthShort:', error, dateValue)
        return '---'
      }
    },

    getDay(dateValue) {
      if (!dateValue) return '--'

      try {
        // Нормализация даты - преобразуем в Date если это строка
        const date = dateValue instanceof Date ? dateValue : new Date(dateValue)

        // Проверка валидности даты
        if (isNaN(date.getTime()) || !isFinite(date.getTime())) {
          console.error('Invalid date in getDay:', dateValue)
          return '--'
        }

        return date.getDate()
      } catch (error) {
        console.error('Error in getDay:', error, dateValue)
        return '--'
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
   🎨 ОСНОВНЫЕ СТИЛИ И CSS ПЕРЕМЕННЫЕ
   =============================================== */

.admin-events-panel {
  --bg-primary: #111114;
  --bg-secondary: #1a1a1f;
  --bg-card: rgba(255, 255, 255, 0.04);
  --bg-card-hover: rgba(255, 255, 255, 0.07);

  --text-light: #f2f2f7;
  --text-muted: #8e8e9a;
  --text-dim: #555560;

  --accent-green: #4caf50;
  --accent-orange: #ff7b25;
  --accent-red: #f44336;
  --accent-blue: #2196f3;
  --accent-purple: #9c27b0;
  --accent-gold: #ffd700;

  --border-light: rgba(255, 255, 255, 0.08);
  --border-medium: rgba(255, 255, 255, 0.16);

  --shadow-soft: 0 4px 20px rgba(0, 0, 0, 0.2);
  --shadow-strong: 0 12px 40px rgba(0, 0, 0, 0.3);
  --shadow-glow-orange: 0 0 30px rgba(255, 123, 37, 0.3);
  --shadow-glow-green: 0 0 30px rgba(76, 175, 80, 0.3);

  --border-radius-small: 0.5rem;
  --border-radius-medium: 0.75rem;
  --border-radius-large: 1rem;
  --border-radius-xl: 1.5rem;

  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-light);
  font-family: 'Nunito', sans-serif;
  padding: 1.5rem 2rem;
}

/* ===============================================
   📋 ЗАГОЛОВОК ПАНЕЛИ
   =============================================== */

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-light);
}

.ph-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.ph-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 1rem;
  background: linear-gradient(135deg, #ff7b25, #c4500a);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  color: white;
  box-shadow: 0 6px 24px rgba(255, 123, 37, 0.45);
  flex-shrink: 0;
}

.emoji-icon {
  font-size: 1.35rem;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ph-title {
  font-size: 1.55rem;
  font-weight: 900;
  color: var(--text-light);
  margin: 0;
  letter-spacing: -0.025em;
  line-height: 1.1;
}

.ph-sub {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin: 0.2rem 0 0;
  font-weight: 500;
}

.ph-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.ph-status {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.85rem;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 2rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: #81c784;
  white-space: nowrap;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4caf50;
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.7);
  flex-shrink: 0;
  animation: statusPulse 2.5s ease-in-out infinite;
}

@keyframes statusPulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(76,175,80,0.7); }
  50% { opacity: 0.5; box-shadow: 0 0 3px rgba(76,175,80,0.3); }
}

.btn-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-light);
  border-radius: 0.6rem;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-light);
  border-color: rgba(255, 123, 37, 0.35);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
}

.btn-create {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.15rem;
  background: linear-gradient(135deg, #ff7b25, #c4500a);
  border: none;
  border-radius: 0.6rem;
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 4px 18px rgba(255, 123, 37, 0.4);
  transition: all 0.25s ease;
  white-space: nowrap;
}

.btn-create:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(255, 123, 37, 0.55);
}

.btn-icon:disabled,
.btn-create:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none;
}

.btn-icon i {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.spinning {
  animation: spin 0.8s linear infinite;
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
   📊 СТАТИСТИЧЕСКАЯ ПАНЕЛЬ — НОВЫЙ ДИЗАЙН
   =============================================== */

.stats-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.75rem;
}

/* ── 4 карточки ── */
.scard-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.scard {
  position: relative;
  border-radius: 1rem;
  padding: 1.4rem 1.4rem 1.2rem;
  overflow: hidden;
  border: 1px solid transparent;
  transition: transform 0.28s cubic-bezier(0.34, 1.4, 0.64, 1),
              box-shadow 0.28s ease;
  cursor: default;
}

.scard.total     { background: linear-gradient(150deg, #162645 0%, #0e1a30 100%); border-color: rgba(33,150,243,0.18); }
.scard.upcoming  { background: linear-gradient(150deg, #3a1e09 0%, #261205 100%); border-color: rgba(255,123,37,0.2); }
.scard.completed { background: linear-gradient(150deg, #0a2814 0%, #061b0d 100%); border-color: rgba(76,175,80,0.18); }
.scard.review    { background: linear-gradient(150deg, #28103a 0%, #1b0a28 100%); border-color: rgba(156,39,176,0.18); }
.scard.review.has-alerts {
  background: linear-gradient(150deg, #3a2805 0%, #261b03 100%);
  border-color: rgba(255,193,7,0.3);
}

.scard:hover {
  transform: translateY(-5px) scale(1.015);
  box-shadow: 0 14px 40px rgba(0,0,0,0.35);
}

/* Иконка */
.scard-icon {
  width: 42px;
  height: 42px;
  border-radius: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
}

.scard.total     .scard-icon { background: rgba(33,150,243,0.18);  color: #64b5f6; border: 1px solid rgba(33,150,243,0.25); }
.scard.upcoming  .scard-icon { background: rgba(255,123,37,0.18);  color: #ffb74d; border: 1px solid rgba(255,123,37,0.25); }
.scard.completed .scard-icon { background: rgba(76,175,80,0.18);   color: #81c784; border: 1px solid rgba(76,175,80,0.25); }
.scard.review    .scard-icon { background: rgba(156,39,176,0.18);  color: #ce93d8; border: 1px solid rgba(156,39,176,0.25); }
.scard.review.has-alerts .scard-icon { background: rgba(255,193,7,0.18); color: #ffd54f; border-color: rgba(255,193,7,0.3); }

/* Большое число */
.scard-num {
  font-size: 3rem;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.04em;
  margin-bottom: 0.25rem;
  position: relative;
  z-index: 1;
}

.scard.total     .scard-num { color: #64b5f6; }
.scard.upcoming  .scard-num { color: #ffb74d; }
.scard.completed .scard-num { color: #81c784; }
.scard.review    .scard-num { color: #ce93d8; }
.scard.review.has-alerts .scard-num { color: #ffd54f; }

/* Подпись */
.scard-label {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.35);
  position: relative;
  z-index: 1;
}

/* Доп текст */
.scard-sub {
  margin-top: 0.55rem;
  font-size: 0.72rem;
  color: rgba(255,255,255,0.25);
  font-weight: 500;
  position: relative;
  z-index: 1;
}

/* Glow-пятно */
.scard-glow {
  position: absolute;
  bottom: -40px;
  right: -40px;
  width: 130px;
  height: 130px;
  border-radius: 50%;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.scard.total     .scard-glow { background: radial-gradient(circle, rgba(33,150,243,0.18) 0%, transparent 70%); }
.scard.upcoming  .scard-glow { background: radial-gradient(circle, rgba(255,123,37,0.18) 0%, transparent 70%); }
.scard.completed .scard-glow { background: radial-gradient(circle, rgba(76,175,80,0.18) 0%, transparent 70%); }
.scard.review    .scard-glow { background: radial-gradient(circle, rgba(156,39,176,0.18) 0%, transparent 70%); }
.scard.review.has-alerts .scard-glow { background: radial-gradient(circle, rgba(255,193,7,0.18) 0%, transparent 70%); }

/* ── Полоска распределения ── */
.dist-section {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 1rem;
  padding: 1.1rem 1.4rem;
}

.dist-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.85rem;
  flex-wrap: wrap;
}

.dist-title {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.dist-title i { color: var(--accent-orange); font-size: 0.8rem; }

.dist-legend {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.dl-item {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
}

.dl-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dl-dot.upcoming  { background: #ff7b25; box-shadow: 0 0 6px rgba(255,123,37,0.6); }
.dl-dot.completed { background: #4caf50; box-shadow: 0 0 6px rgba(76,175,80,0.6); }

.dl-label { color: var(--text-muted); }
.dl-val   { color: var(--text-light); font-weight: 800; }
.dl-pct   { color: var(--text-dim); font-size: 0.7rem; }

/* Трек */
.dist-track {
  height: 12px;
  background: rgba(255,255,255,0.04);
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  border: 1px solid rgba(255,255,255,0.05);
}

.dist-seg {
  height: 100%;
  transition: width 1s cubic-bezier(0.34, 1.3, 0.64, 1);
  min-width: 0;
  position: relative;
}

.dist-seg.upcoming  {
  background: linear-gradient(90deg, #c4500a, #ff7b25, #ffb74d);
}
.dist-seg.completed {
  background: linear-gradient(90deg, #2e7d32, #4caf50, #81c784);
}

/* ── Адаптивность ── */
@media (max-width: 1024px) {
  .scard-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .scard-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .scard-num { font-size: 2.2rem; }

  .dist-head {
    flex-direction: column;
    align-items: flex-start;
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
   📅 СПИСОК МЕРОПРИЯТИЙ — НОВЫЙ ДИЗАЙН
   =============================================== */

.events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-card {
  display: flex;
  flex-direction: row;
  background: var(--bg-card);
  border-radius: var(--border-radius-large);
  overflow: hidden;
  border: 1px solid var(--border-light);
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
  position: relative;
  min-height: 140px;
}

/* Левый акцент-бордер по статусу */
.event-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  border-radius: var(--border-radius-large) 0 0 var(--border-radius-large);
}

.event-card.upcoming::before { background: var(--accent-orange); }
.event-card.high-rating::before { background: var(--accent-green); }
.event-card:not(.upcoming):not(.high-rating)::before { background: var(--border-medium); }

.event-card:hover {
  background: var(--bg-card-hover);
  transform: translateX(4px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  border-color: var(--border-medium);
}

.event-card.upcoming {
  border-color: rgba(255,123,37,0.2);
}

.event-card.high-rating {
  border-color: rgba(76,175,80,0.2);
}

.event-preview {
  flex-shrink: 0;
  width: 180px;
  position: relative;
}

.event-banner {
  width: 100%;
  height: 100%;
  min-height: 140px;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.04);
}

.event-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.3), transparent);
}

.no-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: rgba(255,255,255,0.15);
  font-size: 2.5rem;
}

.event-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.event-card:hover .event-avatar {
  transform: scale(1.05);
  border-color: var(--accent-orange);
}

.event-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--accent-orange), var(--accent-green));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

/* Дата-бейдж */
.event-date-badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(8px);
  border-radius: 0.5rem;
  padding: 0.35rem 0.6rem;
  text-align: center;
  border: 1px solid rgba(255,255,255,0.1);
  z-index: 2;
}

.event-date-badge.upcoming-badge {
  background: rgba(255,123,37,0.85);
  border-color: rgba(255,123,37,0.4);
}

.date-day {
  font-size: 1.1rem;
  font-weight: 800;
  line-height: 1;
  color: white;
  display: block;
}

.date-month {
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.85);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: block;
}

/* Избранное */
.featured-star {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 28px;
  height: 28px;
  background: rgba(255,215,0,0.2);
  border: 1px solid rgba(255,215,0,0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffd700;
  font-size: 0.75rem;
  z-index: 2;
}

/* Статус бейдж */
.event-status {
  display: none; /* скрываем дублирующий */
}

.event-status-badge {
  position: absolute;
  bottom: 0.6rem;
  left: 0.6rem;
  padding: 0.2rem 0.55rem;
  border-radius: 0.4rem;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  z-index: 2;
}

.event-status-badge.upcoming {
  background: rgba(255,123,37,0.9);
  color: white;
}

.event-status-badge.completed {
  background: rgba(76,175,80,0.85);
  color: white;
}

/* Блок информации */
.event-info {
  flex: 1;
  padding: 1.1rem 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
}

.event-main-info {
  flex: 1;
}

.event-header {
  margin-bottom: 0.6rem;
}

.event-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-light);
  margin: 0 0 0.2rem 0;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin-bottom: 0.5rem;
}

.event-meta-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--text-muted);
  font-size: 0.78rem;
}

.event-meta-item i {
  color: var(--accent-orange);
  width: 0.9rem;
  text-align: center;
  font-size: 0.72rem;
}

.event-meta-item.type {
  background: rgba(255, 123, 37, 0.1);
  padding: 0.15rem 0.5rem;
  border-radius: 0.4rem;
  border: 1px solid rgba(255, 123, 37, 0.2);
  color: #ffb74d;
  font-weight: 600;
}

.event-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-stars {
  display: flex;
  gap: 0.15rem;
}

.rating-stars i {
  color: var(--text-dim);
  font-size: 0.75rem;
  transition: color 0.2s ease;
}

.rating-stars i.active {
  color: var(--accent-gold);
}

.rating-text {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 600;
}

/* Статистика */
.event-stats-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Дополнительная информация */
.event-extras {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.event-attendees,
.event-photos {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 0.4rem;
  border: 1px solid rgba(255,255,255,0.08);
  color: var(--text-muted);
}

.event-attendees i { color: var(--accent-blue); }
.event-photos i { color: var(--accent-purple); }

/* Особенности мероприятия */
.event-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.5rem;
}

.feature-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.55rem;
  border-radius: 20px;
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: #c4b5fd;
  font-size: 0.72rem;
  font-weight: 500;
  white-space: nowrap;
}

.feature-badge i {
  font-size: 0.65rem;
  opacity: 0.85;
}

.feature-badge.more-features {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  color: var(--text-muted);
}

/* Кнопки действий */
.event-actions {
  display: flex;
  gap: 0.4rem;
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-light);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-light);
  border-radius: 0.5rem;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.action-btn.view:hover {
  color: #64b5f6;
  border-color: rgba(33, 150, 243, 0.35);
  background: rgba(33, 150, 243, 0.1);
}

.action-btn.edit:hover {
  color: #ffb74d;
  border-color: rgba(255, 123, 37, 0.35);
  background: rgba(255, 123, 37, 0.1);
}

.action-btn.duplicate:hover {
  color: #ce93d8;
  border-color: rgba(156, 39, 176, 0.35);
  background: rgba(156, 39, 176, 0.1);
}

.action-btn.delete:hover {
  color: #ef9a9a;
  border-color: rgba(244, 67, 54, 0.35);
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
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(8px);
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(8px);
  }
}

.modal {
  background: linear-gradient(145deg, var(--bg-secondary) 0%, rgba(255,255,255,0.02) 100%);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 25px 50px rgba(0,0,0,0.5),
    0 0 0 1px rgba(255,255,255,0.05),
    inset 0 1px 0 rgba(255,255,255,0.1);
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--accent-orange), var(--accent-green), var(--accent-blue));
  border-radius: 24px 24px 0 0;
}

.modal.delete-modal {
  max-width: 500px;
}

.modal-header {
  padding: 2rem 2rem 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
  position: relative;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--text-light), rgba(255,255,255,0.8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-title i {
  background: linear-gradient(135deg, var(--accent-orange), var(--accent-green));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 1.8rem;
}

.modal-title.danger {
  background: linear-gradient(135deg, var(--accent-red), #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-close {
  width: 3rem;
  height: 3rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 50%;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.modal-close::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.modal-close:hover {
  color: white;
  border-color: rgba(255,255,255,0.2);
  transform: rotate(90deg) scale(1.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.modal-close:hover::before {
  opacity: 1;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.2) transparent;
}

.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.3);
}

.modal-footer {
  padding: 2rem;
  border-top: 1px solid rgba(255,255,255,0.08);
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  background: linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%);
  position: relative;
}

.cancel-btn,
.save-btn,
.delete-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  font-family: inherit;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.cancel-btn::before,
.save-btn::before,
.delete-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  transition: left 0.5s ease;
}

.cancel-btn:hover::before,
.save-btn:hover::before,
.delete-btn:hover::before {
  left: 100%;
}

.cancel-btn {
  background: rgba(255,255,255,0.05);
  color: var(--text-muted);
  border-color: rgba(255,255,255,0.1);
}

.cancel-btn:hover {
  color: var(--text-light);
  border-color: rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.08);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.save-btn {
  background: linear-gradient(135deg, var(--accent-green), #4caf50);
  border-color: var(--accent-green);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.save-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #4caf50, #45a049);
  border-color: #4caf50;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.delete-btn {
  background: linear-gradient(135deg, var(--accent-red), #f44336);
  border-color: var(--accent-red);
  color: white;
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
}

.delete-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  border-color: #f44336;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(244, 67, 54, 0.4);
}

.save-btn:disabled,
.delete-btn:disabled,
.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04));
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  color: var(--text-light);
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.form-input::placeholder,
.form-select::placeholder,
.form-textarea::placeholder {
  color: rgba(255,255,255,0.4);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent-blue);
  background: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06));
  box-shadow:
    0 0 0 3px rgba(33, 150, 243, 0.1),
    0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-1px);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

.form-textarea:focus {
  min-height: 140px;
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
  .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding-bottom: 1.25rem;
  }

  .ph-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .ph-status { display: none; }

  .filters-row {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .status-filters {
    justify-content: center;
    flex-wrap: wrap;
  }

  .event-card {
    flex-direction: column;
  }

  .event-preview {
    width: 100%;
    height: 160px;
  }

  .event-banner {
    min-height: 160px;
  }

  .event-avatar-section {
    width: 100%;
    padding: 1.5rem;
  }

  .event-avatar {
    width: 100px;
    height: 100px;
  }

  .event-date-badge {
    top: 1rem;
    right: 1rem;
  }

  .featured-star {
    top: 1rem;
    left: 1rem;
  }

  .event-status-badge {
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
  }

  .event-info {
    padding: 1.5rem;
  }

  .event-actions {
    justify-content: center;
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
  .panel-header {
    padding: 1rem;
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
  max-width: 850px;
}

.wizard-steps {
  display: flex;
  justify-content: space-between;
  padding: 2rem 2rem 1.5rem;
  background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  position: relative;
  margin: 0 -1px;
}

.wizard-steps::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 12%;
  right: 12%;
  height: 3px;
  background: linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.2), rgba(255,255,255,0.1));
  border-radius: 2px;
  transform: translateY(-50%);
  z-index: 0;
}

.wizard-progress-bar {
  position: absolute;
  top: 50%;
  left: 12%;
  height: 3px;
  background: linear-gradient(90deg, var(--accent-orange), var(--accent-green));
  border-radius: 2px;
  transform: translateY(-50%);
  z-index: 1;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.wizard-steps::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 12%;
  height: 3px;
  background: linear-gradient(90deg, var(--accent-orange), var(--accent-green));
  border-radius: 2px;
  transform: translateY(-50%);
  z-index: 1;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.wizard-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  z-index: 2;
  cursor: default;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.wizard-step.clickable {
  cursor: pointer;
}

.wizard-step.clickable:hover .step-number {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
}

.step-number {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
  border: 2px solid rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--text-muted);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.step-number::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.wizard-step.active .step-number {
  background: linear-gradient(135deg, var(--accent-orange), #ff8c42);
  border-color: var(--accent-orange);
  color: white;
  box-shadow: 0 0 30px rgba(255, 123, 37, 0.5);
  transform: scale(1.05);
}

.wizard-step.active .step-number::before {
  opacity: 1;
}

.wizard-step.completed .step-number {
  background: linear-gradient(135deg, var(--accent-green), #4caf50);
  border-color: var(--accent-green);
  color: white;
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.4);
}

.step-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 600;
  text-align: center;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.wizard-step.active .step-label {
  color: var(--accent-orange);
  font-weight: 700;
  transform: translateY(-2px);
}

.wizard-step.completed .step-label {
  color: var(--accent-green);
  font-weight: 600;
}

.wizard-body {
  padding: 2.5rem;
  min-height: 450px;
  background: linear-gradient(135deg, rgba(255,255,255,0.01) 0%, rgba(255,255,255,0.005) 100%);
}

.wizard-step-content {
  animation: stepFadeIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes stepFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.step-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  position: relative;
}

.step-header::before {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, var(--accent-orange), var(--accent-green));
  border-radius: 2px;
}

.step-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--accent-orange), var(--accent-green));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: white;
  box-shadow: 0 8px 25px rgba(255, 123, 37, 0.3);
  position: relative;
}

.step-icon::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(135deg, var(--accent-orange), var(--accent-green));
  border-radius: 18px;
  z-index: -1;
  opacity: 0.3;
  filter: blur(8px);
}

.step-icon.review-icon {
  background: linear-gradient(135deg, #9c27b0, #e91e63);
  box-shadow: 0 8px 25px rgba(156, 39, 176, 0.3);
}

.step-icon.review-icon::before {
  background: linear-gradient(135deg, #9c27b0, #e91e63);
}

.step-info h4 {
  font-size: 1.5rem;
  color: var(--text-light);
  margin: 0 0 0.5rem 0;
  font-weight: 700;
  background: linear-gradient(135deg, var(--text-light), rgba(255,255,255,0.8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.step-info p {
  color: var(--text-muted);
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
}

.step-header.compact {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
}

.step-header.compact .step-icon {
  width: 50px;
  height: 50px;
  font-size: 1.5rem;
  border-radius: 12px;
}

.step-header.compact .step-icon::before {
  border-radius: 14px;
}

.step-header.compact .step-info h4 {
  font-size: 1.3rem;
}

.step-header.compact .step-info p {
  font-size: 0.9rem;
}

.form-group.large .form-input.large {
  font-size: 1.2rem;
  padding: 1rem;
}

.event-type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 1rem;
  border: 2px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
  position: relative;
  overflow: hidden;
}

.type-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.type-card:hover {
  border-color: rgba(255,255,255,0.2);
  background: linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04));
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.2);
}

.type-card:hover::before {
  opacity: 1;
}

.type-card.selected {
  border-color: var(--accent-orange);
  background: linear-gradient(135deg, rgba(255, 123, 37, 0.1), rgba(255, 123, 37, 0.05));
  box-shadow: 0 0 30px rgba(255, 123, 37, 0.3);
}

.type-card.selected::before {
  background: linear-gradient(135deg, rgba(255, 123, 37, 0.2), rgba(255, 123, 37, 0.1));
  opacity: 1;
}

.type-card i {
  font-size: 2rem;
  color: var(--text-muted);
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.type-card.selected i {
  color: var(--accent-orange);
  transform: scale(1.1);
  filter: drop-shadow(0 0 10px rgba(255, 123, 37, 0.5));
}

.type-card span {
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.9rem;
  text-align: center;
  transition: all 0.3s ease;
}

.type-card.selected span {
  color: var(--text-light);
  font-weight: 700;
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

/* Review completed checkbox */
.review-completed-group {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
}

.form-checkbox {
  width: 18px;
  height: 18px;
  accent-color: var(--accent-green);
  cursor: pointer;
}

.checkbox-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-light);
}

.checkbox-text i {
  color: var(--accent-green);
}

.form-checkbox:checked + .checkbox-text {
  color: var(--accent-green);
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

/* Скрытие radio и checkbox внутри кастомных кнопок */
.hidden-radio,
.hidden-checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

/* Дополнительные стили для секции ролей */
.roles-selector {
  margin-top: 0.5rem;
}

.role-option.selected {
  border-color: var(--accent-purple);
  background: rgba(156, 39, 176, 0.1);
  color: var(--accent-purple);
}

.role-option.selected i {
  color: var(--accent-purple);
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
  padding: 0.875rem 2rem;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  font-family: inherit;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  background: rgba(255,255,255,0.05);
  color: var(--text-light);
}

.nav-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  transition: left 0.5s ease;
}

.nav-btn:hover::before {
  left: 100%;
}

.nav-btn:hover {
  border-color: rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.08);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.nav-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.next-btn {
  background: linear-gradient(135deg, var(--accent-blue), #2196f3);
  border-color: var(--accent-blue);
  color: white;
  box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
}

.next-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  border-color: #2196f3;
  box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
}

.prev-btn {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.1);
  color: var(--text-muted);
}

.prev-btn:hover:not(:disabled) {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.2);
  color: var(--text-light);
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

/* Multi-upload photos */
.multi-upload-area {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hidden-input {
  display: none;
}

.upload-photos-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 123, 37, 0.1);
  border: 2px dashed var(--accent-orange);
  border-radius: var(--border-radius);
  color: var(--accent-orange);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.upload-photos-btn:hover:not(:disabled) {
  background: rgba(255, 123, 37, 0.2);
}

.upload-photos-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.uploaded-photos-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 0.5rem;
}

.uploaded-photo {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: var(--border-radius-small);
  overflow: hidden;
  border: 1px solid var(--border-light);
}

.uploaded-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-photo-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.9);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
}

.remove-photo-btn:hover {
  background: rgb(239, 68, 68);
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
  position: relative;
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

.purchase-photo-delete {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  background: rgba(239, 68, 68, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.purchase-item-image:hover .purchase-photo-delete {
  opacity: 1;
}

.purchase-photo-delete i {
  font-size: 0.7rem;
  color: white;
}

.purchase-photo-delete:hover {
  background: rgba(220, 38, 38, 1);
}

.purchase-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.purchase-photo-controls {
  display: flex;
  gap: 0.5rem;
}

.upload-photo-btn {
  padding: 0.5rem 0.75rem;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: var(--border-radius-small);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.upload-photo-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
}

.upload-photo-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-photo-btn i {
  font-size: 0.85rem;
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

/* ===============================================
   🆕 НОВЫЕ КОМПАКТНЫЕ СТИЛИ
   =============================================== */

/* Компактный заголовок шага */
.step-header.compact {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
}

.step-icon.small {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 1rem;
}

/* Изображения в ряд */
.images-row {
  display: flex;
  gap: 1rem;
  align-items: stretch;
}

/* Название и тип в одном ряду */
.name-type-row {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.flex-grow {
  flex: 1;
  min-width: 200px;
}

.type-select-group {
  flex: 0 0 auto;
}

/* Типы мероприятий - компактные чипы */
.type-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.type-chip {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
  background: transparent;
}

.type-chip:hover {
  border-color: var(--border-medium);
  background: rgba(255, 255, 255, 0.05);
}

.type-chip.selected {
  border-color: var(--accent-orange);
  background: rgba(255, 123, 37, 0.15);
}

.type-chip i {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.type-chip.selected i {
  color: var(--accent-orange);
}

.type-chip span {
  color: var(--text-muted);
  font-weight: 500;
}

.type-chip.selected span {
  color: var(--text-light);
}

/* Компактные даты */
.compact-dates .form-input.compact {
  padding: 0.5rem;
  font-size: 0.9rem;
}

/* Статусы участия - компактные чипы */
.status-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.status-chip {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.6rem;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
}

.status-chip:hover {
  border-color: var(--border-medium);
}

.status-chip.selected {
  border-color: var(--accent-blue);
  background: rgba(33, 150, 243, 0.15);
}

.status-chip i {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.status-chip.selected i {
  color: var(--accent-blue);
}

.status-chip span {
  color: var(--text-muted);
}

.status-chip.selected span {
  color: var(--accent-blue);
}

/* Роли - компактные чипы */
.role-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.role-chip {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.6rem;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
}

.role-chip.selected {
  border-color: var(--accent-purple);
  background: rgba(156, 39, 176, 0.15);
}

.role-chip.selected i {
  color: var(--accent-purple);
}

.role-chip.selected span {
  color: var(--accent-purple);
}

/* Toggle переключатель */
.toggle-switch {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.75rem;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.toggle-switch:hover {
  background: rgba(255, 255, 255, 0.03);
}

.toggle-switch input {
  display: none;
}

.toggle-slider {
  width: 40px;
  height: 22px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 11px;
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  top: 2px;
  left: 2px;
  transition: all 0.3s ease;
}

.toggle-switch input:checked + .toggle-slider {
  background: var(--accent-green);
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(18px);
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.toggle-switch input:checked ~ .toggle-label {
  color: var(--accent-green);
}

.toggle-label i {
  font-size: 1rem;
}

/* Компактный textarea */
.form-textarea.compact {
  min-height: 60px;
  resize: vertical;
}

.form-input.compact {
  padding: 0.5rem;
  font-size: 0.9rem;
}

/* Особенности мероприятия - компактные чипы */
.features-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.feature-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
}

.feature-chip input {
  display: none;
}

.feature-chip.checked {
  border-color: var(--accent-green);
  background: rgba(76, 175, 80, 0.15);
}

.feature-chip i {
  color: var(--text-muted);
}

.feature-chip.checked i {
  color: var(--accent-green);
}

.feature-chip span {
  color: var(--text-muted);
}

.feature-chip.checked span {
  color: var(--text-light);
}

/* Баннер "Обзор завершён" */
.review-completed-banner {
  padding: 0.75rem 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  background: rgba(255, 193, 7, 0.1);
  border: 2px solid rgba(255, 193, 7, 0.3);
  transition: all 0.3s ease;
}

.review-completed-banner.completed {
  background: rgba(76, 175, 80, 0.15);
  border-color: var(--accent-green);
}

.review-completed-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.review-completed-toggle input {
  display: none;
}

.toggle-track {
  width: 44px;
  height: 24px;
  background: rgba(255, 193, 7, 0.5);
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.review-completed-banner.completed .toggle-track {
  background: var(--accent-green);
}

.toggle-thumb {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  top: 2px;
  left: 2px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.review-completed-toggle input:checked + .toggle-track .toggle-thumb {
  transform: translateX(20px);
}

.toggle-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toggle-content i {
  font-size: 1.1rem;
  color: #ffc107;
}

.review-completed-banner.completed .toggle-content i {
  color: var(--accent-green);
}

.toggle-text {
  font-weight: 600;
  color: #ffc107;
}

.review-completed-banner.completed .toggle-text {
  color: var(--accent-green);
}

/* Компактная сетка рейтингов */
.rating-grid-compact {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.rating-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
}

.rating-label-text {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.rating-stars-inline {
  display: flex;
  gap: 0.15rem;
}

.star-btn {
  background: none;
  border: none;
  padding: 0.15rem;
  cursor: pointer;
  color: var(--text-dim);
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.star-btn.active {
  color: #ffc107;
}

.star-btn:hover {
  transform: scale(1.2);
}

.overall-rating-compact {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.overall-rating-compact strong {
  color: var(--accent-orange);
  font-size: 1rem;
}

/* Компактные списки плюсов/минусов */
.list-compact {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.list-item-compact {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.list-item-compact .form-input.compact {
  flex: 1;
  padding: 0.4rem 0.5rem;
  font-size: 0.85rem;
}

.remove-btn-small {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  background: rgba(244, 67, 54, 0.15);
  color: var(--accent-red);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.remove-btn-small:hover {
  background: rgba(244, 67, 54, 0.3);
}

.add-btn-small {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.4rem;
  border: 1px dashed var(--border-light);
  border-radius: 4px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s ease;
}

.add-btn-small.pro:hover {
  border-color: var(--accent-green);
  color: var(--accent-green);
}

.add-btn-small.con:hover {
  border-color: var(--accent-red);
  color: var(--accent-red);
}

.add-btn-small.purchase:hover {
  border-color: var(--accent-green);
  color: var(--accent-green);
}

/* Секция покупок */
.purchases-section {
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(76, 175, 80, 0.05);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;
}

.section-header-compact {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: var(--accent-green);
  font-size: 0.9rem;
}

.purchase-items-compact {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.purchase-item-compact {
  display: grid;
  grid-template-columns: 70px 1fr 90px 40px;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.purchase-thumb {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.purchase-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.purchase-thumb i {
  color: rgba(255,255,255,0.6);
  font-size: 1.1rem;
}

.thumb-upload {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 1rem;
}

.purchase-thumb:hover .thumb-upload {
  opacity: 1;
}

.purchase-item-compact .form-input.compact {
  flex: 1;
  min-width: 100px;
}

.price-input {
  max-width: 90px !important;
  flex: 0 0 90px !important;
}

.remove-btn-small {
  width: 32px;
  height: 32px;
  border-radius: 10px;
}

.purchase-thumb:hover .thumb-upload {
  opacity: 1;
}

.purchase-item-compact .form-input.compact {
  flex: 1;
  min-width: 80px;
}

.price-input {
  max-width: 80px !important;
  flex: 0 0 80px !important;
}

/* Галерея фотографий */
.step-icon.gallery-icon {
  background: linear-gradient(135deg, #9c27b0, #673ab7);
}

.gallery-upload-zone {
  padding: 2rem;
  border: 2px dashed var(--border-light);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  margin-bottom: 1rem;
}

.gallery-upload-zone:hover {
  border-color: var(--accent-orange);
  background: rgba(255, 123, 37, 0.05);
}

.gallery-upload-zone.dragging {
  border-color: var(--accent-orange);
  background: rgba(255, 123, 37, 0.15);
  transform: scale(1.02);
}

.gallery-upload-zone.uploading {
  border-color: var(--accent-blue);
  pointer-events: none;
}

.upload-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--accent-blue);
}

.upload-status i {
  font-size: 2rem;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
}

.upload-prompt i {
  font-size: 2.5rem;
  color: var(--accent-orange);
}

.upload-prompt span {
  font-weight: 500;
}

.upload-prompt small {
  font-size: 0.8rem;
  opacity: 0.7;
}

.gallery-preview {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 1rem;
}

.gallery-header {
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 0.5rem;
}

.gallery-thumb {
  position: relative;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
}

.gallery-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-remove {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(244, 67, 54, 0.9);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.gallery-thumb:hover .gallery-remove {
  opacity: 1;
}

.gallery-empty {
  text-align: center;
  padding: 2rem;
  color: var(--text-dim);
}

.gallery-empty i {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.gallery-empty p {
  margin: 0;
}

/* Мобильная адаптация новых стилей */
@media (max-width: 768px) {
  .name-type-row {
    flex-direction: column;
  }

  .images-row {
    flex-direction: column;
  }

  .type-chips {
    gap: 0.35rem;
  }

  .status-chips,
  .role-chips {
    gap: 0.25rem;
  }

  .rating-grid-compact {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>