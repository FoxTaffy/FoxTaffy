<template>
  <div class="ft-furry-gallery-page">
    <!-- Референс персонажа -->
    <Reference />

    <!-- Фильтры -->
    <Filter
      @search="handleSearch"
      @filter-tags="handleTagFilter"
      @filter-artists="handleArtistFilter"
      @filter-characters="handleCharacterFilter"
      @sort-change="handleSortChange"
      @clear-filters="handleClearFilters"
      @filter-by-tag="handleFilterByTag"
      @filter-by-artist="handleFilterByArtist"
      @filter-by-species="handleFilterBySpecies"
      :available-tags="availableTags"
      :available-artists="availableArtists"
      :available-characters="availableCharacters"
      :selected-tags="filters.selectedTags.value"
      :selected-artists="filters.selectedArtists.value"
      :selected-characters="filters.selectedCharacters.value"
      :current-sort="filters.currentSort.value"
    />

    <!-- Галерея -->
    <section class="ft-furry-arts-gallery">
      <!-- Скелетон загрузки -->
      <GallerySkeleton v-if="loading" :count="12" />

      <!-- Ошибка -->
      <div v-else-if="error" class="ft-error-container">
        <div class="ft-error-emoji">😿</div>
        <p>Упс! Что-то пошло не так...</p>
        <p class="ft-error-message">{{ error }}</p>
        <button @click="loadArts" class="ft-retry-btn">
          <i class="fas fa-redo"></i>
          Попробовать снова
        </button>
      </div>

      <!-- Пустой результат -->
      <div v-else-if="arts.length === 0 && !loading" class="ft-no-arts-message">
        <div class="ft-empty-emoji">🔍</div>
        <p>Фурри-арты не найдены TwT</p>
        <p class="ft-no-arts-hint">Попробуйте изменить фильтры или поискать другие виды</p>
        <button @click="handleClearFilters" class="ft-reset-search-btn">
          <i class="fas fa-broom"></i>
          Сбросить все фильтры
        </button>
      </div>

      <!-- Контент с артами -->
      <div v-else>
        <!-- Отладочная информация (компактная) -->
        <div class="ft-results-bar">
          <div class="ft-results-count">
            <i class="fas fa-images"></i>
            <span>{{ arts.length }} {{ arts.length === 1 ? 'арт' : 'артов' }}</span>
          </div>
          <div class="ft-results-filters" v-if="hasActiveFilters">
            <span class="ft-filter-badge" v-if="filters.searchQuery.value">
              <i class="fas fa-search"></i> {{ filters.searchQuery.value }}
            </span>
            <span class="ft-filter-badge" v-if="filters.selectedTags.value.length">
              <i class="fas fa-tags"></i> {{ filters.selectedTags.value.length }}
            </span>
            <span class="ft-filter-badge" v-if="filters.selectedArtists.value.length">
              <i class="fas fa-palette"></i> {{ filters.selectedArtists.value.length }}
            </span>
            <span class="ft-filter-badge" v-if="filters.selectedCharacters.value.length">
              <i class="fas fa-paw"></i> {{ filters.selectedCharacters.value.length }}
            </span>
          </div>
        </div>

        <!-- Pinterest-style сетка артов -->
        <GalleryGrid
          :arts="arts"
          :show-nsfw="showNsfw"
          :is-nsfw-unlocked="filters.isNsfwArtUnlocked"
          @open-lightbox="lightbox.openLightbox"
          @unlock-nsfw="handleUnlockNsfw"
          @filter-artist="quickFilterByArtist"
          @filter-character="quickFilterBySpecies"
          @filter-tag="quickFilterByTag"
        />
      </div>

      <!-- Кнопка "Загрузить ещё" -->
      <div v-if="hasMoreArts && !loading" class="ft-load-more-container">
        <button @click="loadMoreArts" class="ft-load-more-btn" :disabled="loadingMore">
          <i v-if="loadingMore" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-paw"></i>
          <span>{{ loadingMore ? 'Загружаем...' : 'Загрузить ещё артов OwO' }}</span>
        </button>
      </div>
    </section>

    <!-- Лайтбокс -->
    <GalleryLightbox
      :lightbox="lightbox.lightbox"
      :can-go-previous="lightbox.canGoPrevious.value"
      :can-go-next="lightbox.canGoNext.value"
      @close="lightbox.closeLightbox"
      @previous="lightbox.previousArt"
      @next="lightbox.nextArt"
    />

    <!-- Уведомления -->
    <div v-if="notifications.notification.show" class="ft-notification" :class="notifications.notification.type">
      <span class="ft-notification-emoji">{{ notifications.getNotificationEmoji() }}</span>
      <span>{{ notifications.notification.message }}</span>
      <button @click="notifications.closeNotification">×</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import Reference from './Reference.vue'
import Filter from './Filter.vue'
import GalleryCard from './GalleryCard.vue'
import GalleryGrid from './GalleryGrid.vue'
import GallerySkeleton from './GallerySkeleton.vue'
import GalleryLightbox from './GalleryLightbox.vue'
import { furryApi as api } from '@/config/supabase.js'
import { useGalleryFilters } from '@/composables/useGalleryFilters'
import { useLightbox } from '@/composables/useLightbox'
import { useNotifications } from '@/composables/useNotifications'
import { useNsfwToggle } from '@/composables/useNsfwToggle'

// ============================================
// КОМПОЗАБЛЫ
// ============================================
const filters = useGalleryFilters()
const notifications = useNotifications()
const { showNsfw } = useNsfwToggle() // NSFW состояние синхронизировано с Reference.vue

// ============================================
// СОСТОЯНИЕ ДАННЫХ
// ============================================
const arts = ref([])
const artists = ref([])
const tags = ref([])
const species = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const error = ref('')
const hasMoreArts = ref(false)
const currentOffset = ref(0)

// Лайтбокс
const lightbox = useLightbox(arts)

// ============================================
// КОНСТАНТЫ
// ============================================
const ITEMS_PER_PAGE = parseInt(import.meta.env.VITE_ARTS_PER_PAGE) || 24

// Флаги инициализации
const isInitialized = ref(false)
const initialLoadComplete = ref(false)

// ============================================
// ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
// ============================================
const availableTags = computed(() => tags.value)
const availableArtists = computed(() => artists.value)
const availableCharacters = computed(() => species.value)

const hasActiveFilters = computed(() => {
  return filters.searchQuery.value.trim() !== '' ||
         filters.selectedTags.value.length > 0 ||
         filters.selectedArtists.value.length > 0 ||
         filters.selectedCharacters.value.length > 0 ||
         filters.currentContentFilter.value !== 'all'
})

// ============================================
// ЗАГРУЗКА ДАННЫХ
// ============================================
const loadAllData = async () => {
  if (isInitialized.value) {
    console.log('⏭️ Данные уже инициализированы, пропускаем загрузку')
    return
  }

  console.log('🔄 Начинаем единоразовую загрузку всех данных...')
  loading.value = true
  error.value = ''

  try {
    console.log(`📡 Загружаем данные с showNsfw: ${showNsfw.value}`)
    const allData = await api.loadAllData({
      search: filters.searchQuery.value.trim(),
      tags: filters.selectedTags.value,
      artists: filters.selectedArtists.value,
      characters: filters.selectedCharacters.value,
      showNsfw: showNsfw.value,
      sort: filters.currentSort.value,
      limit: ITEMS_PER_PAGE,
      offset: 0
    })

    // Устанавливаем все данные одновременно
    arts.value = allData.arts
    artists.value = allData.artists
    tags.value = allData.tags
    species.value = allData.characters

    hasMoreArts.value = allData.arts.length === ITEMS_PER_PAGE
    currentOffset.value = allData.arts.length

    isInitialized.value = true
    initialLoadComplete.value = true

    const nsfwCount = allData.arts.filter(art => art.is_nsfw).length
    const sfwCount = allData.arts.filter(art => !art.is_nsfw).length
    console.log(`📊 Загружено: артов ${allData.arts.length} (SFW: ${sfwCount}, NSFW: ${nsfwCount})`)
    console.log(`📊 Художников: ${allData.artists.length}, Тегов: ${allData.tags.length}, Персонажей: ${allData.characters.length}`)
    console.log(`🔞 showNsfw был: ${showNsfw.value} → ${nsfwCount > 0 ? 'NSFW арты загружены ✅' : 'NSFW артов нет ⚠️'}`)
    console.log('✅ Все данные загружены оптимизированно!')

  } catch (err) {
    error.value = err.message || 'Ошибка загрузки фурри-артов'
    console.error('❌ Ошибка загрузки данных:', err)
  } finally {
    loading.value = false
  }
}

const loadArts = async (isLoadMore = false) => {
  if (!initialLoadComplete.value && !isLoadMore) {
    console.log('⏭️ Инициализация не завершена, отложим загрузку артов')
    return
  }

  if (isLoadMore) {
    loadingMore.value = true
  } else {
    loading.value = true
    currentOffset.value = 0
  }

  error.value = ''

  try {
    const options = {
      search: filters.searchQuery.value.trim(),
      tags: filters.selectedTags.value,
      artists: filters.selectedArtists.value,
      characters: filters.selectedCharacters.value,
      showNsfw: showNsfw.value,
      sort: filters.currentSort.value,
      limit: ITEMS_PER_PAGE,
      offset: currentOffset.value
    }

    console.log('🔍 Загружаем арты с опциями:', options)

    const newArts = await api.getFurryArts(options)

    if (isLoadMore) {
      arts.value = [...arts.value, ...newArts]
    } else {
      arts.value = newArts
    }

    hasMoreArts.value = newArts.length === ITEMS_PER_PAGE
    currentOffset.value += newArts.length

    const nsfwCount = newArts.filter(art => art.is_nsfw).length
    const sfwCount = newArts.filter(art => !art.is_nsfw).length
    console.log(`📊 Загружено артов: ${newArts.length} (SFW: ${sfwCount}, NSFW: ${nsfwCount})`)
    console.log(`🔞 showNsfw=${showNsfw.value} → ${nsfwCount > 0 ? 'NSFW арты загружены ✅' : 'NSFW артов нет ⚠️'}`)

  } catch (err) {
    error.value = err.message || 'Ошибка загрузки фурри-артов'
    console.error('❌ Ошибка загрузки артов:', err)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadMoreArts = () => {
  loadArts(true)
}

// ============================================
// ОБРАБОТЧИКИ ФИЛЬТРОВ
// ============================================
const handleSearch = (query) => {
  console.log('🔍 handleSearch:', query)
  filters.searchQuery.value = query
  filters.debouncedApplyFilters(() => {
    if (initialLoadComplete.value) {
      loadArts()
    }
  })
}

const handleTagFilter = (tagNames) => {
  console.log('🏷️ handleTagFilter:', tagNames)
  filters.selectedTags.value = [...tagNames]
  filters.debouncedApplyFilters(() => {
    if (initialLoadComplete.value) {
      loadArts()
    }
  })
}

const handleArtistFilter = (artistNames) => {
  console.log('🎨 handleArtistFilter:', artistNames)
  filters.selectedArtists.value = [...artistNames]
  filters.debouncedApplyFilters(() => {
    if (initialLoadComplete.value) {
      loadArts()
    }
  })
}

const handleCharacterFilter = (characterNames) => {
  console.log('🦊 handleCharacterFilter:', characterNames)
  filters.selectedCharacters.value = [...characterNames]
  filters.debouncedApplyFilters(() => {
    if (initialLoadComplete.value) {
      loadArts()
    }
  })
}

const handleSortChange = (sort) => {
  console.log('📊 handleSortChange:', sort)
  filters.currentSort.value = sort
  filters.debouncedApplyFilters(() => {
    if (initialLoadComplete.value) {
      loadArts()
    }
  })
}

const handleClearFilters = () => {
  console.log('🧹 handleClearFilters: Сбрасываем все фильтры')
  filters.clearFilters()
  filters.debouncedApplyFilters(() => {
    if (initialLoadComplete.value) {
      loadArts()
    }
  })
  notifications.showNotification('Все фильтры сброшены! 🧹', 'success')
}

// Быстрые фильтры
const quickFilterByTag = (tagName) => {
  console.log('🏷️ Быстрый фильтр по тегу:', tagName)
  filters.selectedTags.value = [tagName]
  filters.selectedArtists.value = []
  filters.selectedCharacters.value = []
  filters.debouncedApplyFilters(() => {
    if (initialLoadComplete.value) {
      loadArts()
    }
  })
  notifications.showNotification(`Фильтр по тегу: ${tagName} 🏷️`, 'info')
}

const quickFilterByArtist = (artistName) => {
  console.log('🎨 Быстрый фильтр по художнику:', artistName)
  filters.selectedArtists.value = [artistName]
  filters.selectedTags.value = []
  filters.selectedCharacters.value = []
  filters.debouncedApplyFilters(() => {
    if (initialLoadComplete.value) {
      loadArts()
    }
  })
  notifications.showNotification(`Фильтр по художнику: ${artistName} 🎨`, 'info')
}

const quickFilterBySpecies = (speciesName) => {
  console.log('🦊 Быстрый фильтр по персонажу:', speciesName)
  filters.selectedCharacters.value = [speciesName]
  filters.selectedTags.value = []
  filters.selectedArtists.value = []
  filters.debouncedApplyFilters(() => {
    if (initialLoadComplete.value) {
      loadArts()
    }
  })
  notifications.showNotification(`Фильтр по персонажу: ${speciesName} 🦊`, 'info')
}

// Старые обработчики для совместимости
const handleFilterByTag = quickFilterByTag
const handleFilterByArtist = quickFilterByArtist
const handleFilterBySpecies = quickFilterBySpecies

// ============================================
// NSFW ОБРАБОТЧИКИ
// ============================================
const handleUnlockNsfw = (artId) => {
  filters.unlockNsfwArt(artId)
  notifications.showNotification('NSFW контент разблокирован 🔓', 'warning')
}

// ============================================
// РЕАКТИВНОСТЬ - ОТСЛЕЖИВАНИЕ NSFW
// ============================================
// Следим за изменением NSFW и перезагружаем арты
watch(showNsfw, (newValue, oldValue) => {
  console.log(`👀 Watch NSFW сработал: ${oldValue} → ${newValue}, initialLoadComplete: ${initialLoadComplete.value}`)

  if (initialLoadComplete.value && newValue !== oldValue) {
    console.log(`🔄 NSFW изменен, перезагружаем арты...`)
    notifications.showNotification(
      newValue ? 'NSFW контент включен 🔞' : 'Только SFW контент ✅',
      'info'
    )
    loadArts()
  } else if (!initialLoadComplete.value) {
    console.log(`⏳ Начальная загрузка еще не завершена, пропускаем перезагрузку`)
  }
})

// ============================================
// ЖИЗНЕННЫЙ ЦИКЛ
// ============================================
onMounted(async () => {
  console.log('🚀 Инициализация оптимизированной Gallery.vue...')

  // Загружаем настройки
  filters.loadSettings()

  // Загружаем данные только один раз
  await loadAllData()

  // Настраиваем обработчики событий
  window.addEventListener('keydown', lightbox.handleKeyDown)

  console.log('✅ Оптимизированная Gallery.vue инициализирована!')
  console.log('✨ Использованы композаблы: useGalleryFilters, useLightbox, useNotifications, useNsfwToggle')
  console.log('✨ Использованы подкомпоненты: GalleryCard, GalleryGrid, GallerySkeleton, GalleryLightbox')
  console.log('✨ Применена оптимизация изображений с IntersectionObserver')
  console.log('✨ Добавлен v-memo для предотвращения лишних ре-рендеров')
  console.log(`✨ NSFW синхронизирован с Reference.vue, текущее состояние: ${showNsfw.value}`)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', lightbox.handleKeyDown)
  filters.cleanup()
})
</script>

<style scoped>
.ft-furry-gallery-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family: 'Nunito', sans-serif;
  color: #f2f2f2;
}

.ft-furry-arts-gallery {
  margin-bottom: 2rem;
}

/* Панель результатов (Pinterest-style) */
.ft-results-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.ft-results-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #f2f2f2;
}

.ft-results-count i {
  color: #ff7b25;
  font-size: 1.2rem;
}

.ft-results-filters {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.ft-filter-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  background: rgba(255, 123, 37, 0.15);
  border: 1px solid rgba(255, 123, 37, 0.3);
  border-radius: 1rem;
  font-size: 0.85rem;
  color: #ff7b25;
  font-weight: 500;
}

.ft-filter-badge i {
  font-size: 0.8rem;
}

/* Ошибки и пустые состояния */
.ft-error-container,
.ft-no-arts-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  color: #a0a0a0;
  text-align: center;
}

.ft-error-emoji,
.ft-empty-emoji {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.ft-retry-btn,
.ft-reset-search-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  background: #ff7b25;
  color: white;
  border: none;
  border-radius: 2rem;
  padding: 0.7rem 1.2rem;
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  transition: all 0.3s ease;
}

.ft-retry-btn:hover,
.ft-reset-search-btn:hover {
  background: #ff8f4f;
  transform: translateY(-2px);
}

/* Кнопка "Загрузить ещё" */
.ft-load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 3rem;
}

.ft-load-more-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #ff7b25, #ff8f4f);
  border: none;
  color: white;
  padding: 1rem 2rem;
  border-radius: 2rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  font-family: inherit;
}

.ft-load-more-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #ff8f4f, #ffa366);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 123, 37, 0.3);
}

.ft-load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Уведомления */
.ft-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 3rem 1rem 1rem;
  border-radius: 0.5rem;
  color: white;
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 300px;
  animation: slideInRight 0.3s ease;
  font-weight: 500;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.ft-notification.success {
  background: rgba(76, 175, 80, 0.9);
}

.ft-notification.error {
  background: rgba(244, 67, 54, 0.9);
}

.ft-notification.info {
  background: rgba(33, 150, 243, 0.9);
}

.ft-notification.warning {
  background: rgba(255, 152, 0, 0.9);
}

.ft-notification button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s ease;
}

.ft-notification button:hover {
  background: rgba(0, 0, 0, 0.2);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .ft-furry-gallery-page {
    padding: 1rem 0.5rem;
  }

  .ft-results-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem 0;
  }

  .ft-results-count {
    font-size: 1rem;
  }

  .ft-results-filters {
    width: 100%;
  }

  .ft-filter-badge {
    font-size: 0.75rem;
    padding: 0.3rem 0.6rem;
  }

  .ft-notification {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
    max-width: none;
  }
}
</style>
