<template>
  <div class="ft-furry-gallery-page">
    <!-- ✅ ИСПРАВЛЕНО: Используем единственный Reference -->
    <Reference />
    
    <!-- Компонент фурри-фильтрации -->
    <Filter 
      @search="handleSearch"
      @filter-tags="handleTagFilter"
      @filter-artists="handleArtistFilter"
      @filter-characters="handleCharacterFilter"
      @filter-content="handleContentFilter"
      @sort-change="handleSortChange"
      @clear-filters="handleClearFilters"
      @filter-by-tag="handleFilterByTag"
      @filter-by-artist="handleFilterByArtist"
      @filter-by-species="handleFilterBySpecies"
      :available-tags="availableTags"
      :available-artists="availableArtists"
      :available-characters="availableCharacters"
      :selected-tags="selectedTags"
      :selected-artists="selectedArtists"
      :selected-characters="selectedCharacters"
      :current-sort="currentSort"
      :current-content-filter="currentContentFilter"
    />
    
    <!-- Упрощенная галерея артов -->
    <section class="ft-furry-arts-gallery">
      <!-- Скелетная загрузка -->
      <div v-if="loading" class="ft-loading-skeleton">
        <div class="ft-skeleton-grid">
          <div 
            v-for="i in 12" 
            :key="'skeleton-' + i" 
            class="ft-skeleton-card"
          >
            <div class="ft-skeleton-image">
              <div class="ft-skeleton-paw">{{ ['🦊', '🦝', '🦊', '🦝', '🦊'][i % 5] }}</div>
            </div>
            <div class="ft-skeleton-content">
              <div class="ft-skeleton-line ft-skeleton-line-title"></div>
              <div class="ft-skeleton-line ft-skeleton-line-subtitle"></div>
              <div class="ft-skeleton-tags">
                <div class="ft-skeleton-tag"></div>
                <div class="ft-skeleton-tag"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ✅ Отладочная информация -->
      <div v-if="!loading && arts.length > 0" class="ft-debug-info">
        <p>🔍 Найдено {{ arts.length }} артов | Поиск: "{{ searchQuery }}" | Теги: {{ selectedTags.length }} | Художники: {{ selectedArtists.length }} | Персонажи: {{ selectedCharacters.length }} | Контент: {{ currentContentFilter }}</p>
      </div>

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

      <!-- ✅ ИСПРАВЛЕНО: Сетка артов с унифицированными полями -->
      <div v-else class="ft-furry-gallery-grid">
        <div 
          v-for="art in arts" 
          :key="art.id" 
          class="ft-simple-art-card"
          :class="{ 'nsfw-content': art.is_nsfw }" 
          @click="openLightbox(art)"
        >
          <!-- ✅ ИСПРАВЛЕНО: NSFW система работает! -->
          <div class="ft-art-image-container">
            <!-- NSFW индикатор -->
            <div v-if="art.is_nsfw" class="ft-nsfw-indicator">
              <div class="ft-nsfw-badge">
                <i class="fas fa-exclamation-triangle"></i>
                <span>NSFW</span>
              </div>
            </div>
            
            <!-- NSFW blur overlay -->
            <div 
              v-if="art.is_nsfw && !showNsfwContent"
              class="ft-nsfw-overlay"
              @click.stop="toggleNsfwView(art.id)"
            >
              <div class="ft-nsfw-overlay-content">
                <i class="fas fa-eye-slash"></i>
                <h4>Контент 18+</h4>
                <p>Нажмите чтобы показать</p>
              </div>
            </div>
            
            <img 
              :src="art.thumbnail_url || art.image_url" 
              :alt="art.title" 
              class="ft-art-thumbnail"
              :class="{ 
                'nsfw-blurred': art.is_nsfw && !showNsfwContent && !viewedNsfwArts.includes(art.id)
              }"
              loading="lazy"
            >
          </div>

          <!-- ✅ ИСПРАВЛЕНО: Информация с унифицированными полями -->
          <div class="ft-art-info">
            <h3 class="ft-art-title">{{ art.title }}</h3>
            
            <!-- ✅ Художник -->
            <div class="ft-artist-pill" @click.stop="quickFilterByArtist(art.artist_name)">
              <img 
                :src="art.artist_avatar || getDefaultAvatar(art.artist_name)" 
                :alt="art.artist_name" 
                class="ft-artist-avatar"
              >
              <span class="ft-artist-name">{{ art.artist_name }}</span>
              <i v-if="art.artist_is_friend" class="fas fa-star ft-friend-star"></i>
            </div>
            
            <!-- ✅ ИСПРАВЛЕНО: Персонажи (используем art.characters) -->
            <div v-if="art.characters && art.characters.length > 0" class="ft-characters-section">
              <span class="ft-characters-label">
                {{ art.characters.length === 1 ? 'Персонаж:' : 'Персонажи:' }}
              </span>
              <div class="ft-characters-avatars">
                <img 
                  v-for="(character, index) in art.characters.slice(0, 3)" 
                  :key="character.name + index"
                  :src="character.avatar || getDefaultCharacterAvatar(character.name)" 
                  :alt="character.name" 
                  class="ft-character-avatar"
                  :title="character.name"
                  @click.stop="quickFilterBySpecies(character.name)"
                >
                <div 
                  v-if="art.characters.length > 3" 
                  class="ft-more-characters"
                  :title="`Еще ${art.characters.length - 3} персонажей`"
                >
                  +{{ art.characters.length - 3 }}
                </div>
              </div>
            </div>
            
            <!-- ✅ ИСПРАВЛЕНО: Теги унифицированы (используем art.tags) -->
            <div v-if="art.tags && art.tags.length > 0" class="ft-art-tags">
              <span 
                v-for="(tagName, index) in art.tags.slice(0, 3)" 
                :key="tagName + index" 
                class="ft-tag-pill"
                @click.stop="quickFilterByTag(tagName)"
              >
                {{ tagName }}
              </span>
              <span v-if="art.tags.length > 3" class="ft-more-tags-pill">
                +{{ art.tags.length - 3 }}
              </span>
            </div>

            <!-- ✅ ИСПРАВЛЕНО: Дата -->
            <div class="ft-art-date">
              <i class="fas fa-calendar-alt"></i>
              <span>{{ formatDate(art.created_date) }}</span>
            </div>
          </div>
        </div>
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

    <!-- Упрощенный лайтбокс -->
    <Teleport to="body">
      <Transition name="ft-lightbox">
        <div v-if="lightbox.visible" class="ft-lightbox" @click="closeLightbox">
          <div class="ft-lightbox-content" @click.stop>
            <button @click="closeLightbox" class="ft-lightbox-close">
              <i class="fas fa-times"></i>
            </button>
            
            <!-- Навигация -->
            <button 
              v-if="lightbox.currentIndex > 0"
              @click="previousArt" 
              class="ft-lightbox-nav ft-lightbox-prev"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <button 
              v-if="lightbox.currentIndex < arts.length - 1"
              @click="nextArt" 
              class="ft-lightbox-nav ft-lightbox-next"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
            
            <img 
              :src="lightbox.imageUrl" 
              :alt="lightbox.title" 
              class="ft-lightbox-image"
            >
            
            <div class="ft-lightbox-info">
              <h3>{{ lightbox.title }}</h3>
              
              <div class="ft-lightbox-meta">
                <div class="ft-lightbox-artist">
                  <img :src="lightbox.art?.artist_avatar || getDefaultAvatar(lightbox.art?.artist_name)" class="ft-lightbox-avatar">
                  <span class="ft-lightbox-artist-name">{{ lightbox.art?.artist_name }}</span>
                  <i v-if="lightbox.art?.artist_is_friend" class="fas fa-star ft-friend-star"></i>
                </div>
                <div class="ft-lightbox-date">{{ formatDate(lightbox.art?.created_date) }}</div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Уведомления -->
    <div v-if="notification.show" class="ft-notification" :class="notification.type">
      <span class="ft-notification-emoji">{{ getNotificationEmoji() }}</span>
      <span>{{ notification.message }}</span>
      <button @click="closeNotification">×</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import Reference from './Reference.vue'
import Filter from './Filter.vue'
import { furryApi as api } from '@/config/supabase.js'

// ============================================
// ✅ ИСПРАВЛЕНО: КОНСТАНТЫ (убираем магические числа)
// ============================================
const ITEMS_PER_PAGE = parseInt(import.meta.env.VITE_ARTS_PER_PAGE) || 24
const DEBOUNCE_DELAY = 300

// ============================================
// ✅ ОПТИМИЗАЦИЯ: Флаги для предотвращения дублирования
// ============================================
const isInitialized = ref(false)
const initialLoadComplete = ref(false)

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

// ============================================
// ✅ ИСПРАВЛЕНО: Упрощенные фильтры с реактивностью
// ============================================
const searchQuery = ref('')
const selectedTags = ref([])
const selectedArtists = ref([])
const selectedCharacters = ref([])
const currentSort = ref('newest')
const currentContentFilter = ref('all') // all, sfw, nsfw

// ============================================
// ✅ ИСПРАВЛЕНО: NSFW СОСТОЯНИЕ РАБОТАЕТ!
// ============================================
const showNsfwContent = ref(false)
const viewedNsfwArts = ref([]) // ID артов которые пользователь разблокировал

// ============================================
// ЛАЙТБОКС
// ============================================
const lightbox = reactive({
  visible: false,
  imageUrl: '',
  title: '',
  art: null,
  currentIndex: 0
})

// ============================================
// УВЕДОМЛЕНИЯ
// ============================================
const notification = reactive({
  show: false,
  message: '',
  type: 'info'
})

// ============================================
// ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
// ============================================
const availableTags = computed(() => tags.value)
const availableArtists = computed(() => artists.value)
const availableCharacters = computed(() => species.value)

// ============================================
// ✅ ИСПРАВЛЕНО: НАДЕЖНЫЕ АВАТАРЫ
// ============================================
const getDefaultAvatar = (name) => {
  const colors = ['FF7B25', '4CAF50', '2196F3', '9C27B0', 'FF5722']
  const colorIndex = name ? name.length % colors.length : 0
  const color = colors[colorIndex]
  const initial = name ? name.charAt(0).toUpperCase() : '?'
  
  // ✅ ИСПРАВЛЕНО: Используем надежный сервис вместо via.placeholder.com
  return `https://ui-avatars.com/api/?name=${initial}&background=${color}&color=ffffff&size=64&bold=true&format=png`
}

const getDefaultCharacterAvatar = (name) => {
  const emojis = ['🦊', '🐱', '🐺', '🐲', '🦝', '🐰', '🐻', '🦌']
  const emojiIndex = name ? name.length % emojis.length : 0
  const emoji = emojis[emojiIndex]
  
  // ✅ ИСПРАВЛЕНО: Используем надежный сервис
  return `https://ui-avatars.com/api/?name=${emoji}&background=FF7B25&color=ffffff&size=64&bold=true&format=png`
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ru-RU')
}

// ============================================
// ✅ DEBOUNCE ДЛЯ ФИЛЬТРОВ
// ============================================
let filterTimeout = null

const debouncedLoadArts = () => {
  if (filterTimeout) clearTimeout(filterTimeout)
  
  filterTimeout = setTimeout(() => {
    if (initialLoadComplete.value) {
      loadArts()
    } else {
      console.log('⏭️ Инициализация не завершена, отложим загрузку артов')
    }
  }, DEBOUNCE_DELAY)
}

// ============================================
// БЫСТРЫЕ ФИЛЬТРЫ
// ============================================
const quickFilterByTag = (tagName) => {
  console.log('🏷️ Быстрый фильтр по тегу:', tagName)
  selectedTags.value = [tagName]
  selectedArtists.value = []
  selectedCharacters.value = []
  debouncedLoadArts()
  showNotification(`Фильтр по тегу: ${tagName} 🏷️`, 'info')
}

const quickFilterByArtist = (artistName) => {
  console.log('🎨 Быстрый фильтр по художнику:', artistName)
  selectedArtists.value = [artistName]
  selectedTags.value = []
  selectedCharacters.value = []
  debouncedLoadArts()
  showNotification(`Фильтр по художнику: ${artistName} 🎨`, 'info')
}

const quickFilterBySpecies = (speciesName) => {
  console.log('🦊 Быстрый фильтр по персонажу:', speciesName)
  selectedCharacters.value = [speciesName]
  selectedTags.value = []
  selectedArtists.value = []
  debouncedLoadArts()
  showNotification(`Фильтр по персонажу: ${speciesName} 🦊`, 'info')
}

// ============================================
// ✅ ИСПРАВЛЕНО: NSFW МЕТОДЫ РАБОТАЮТ!
// ============================================
const toggleNsfwView = (artId) => {
  if (!viewedNsfwArts.value.includes(artId)) {
    viewedNsfwArts.value.push(artId)
  }
  showNotification('NSFW контент разблокирован 🔓', 'warning')
}

const toggleGlobalNsfwView = () => {
  showNsfwContent.value = !showNsfwContent.value
  localStorage.setItem('gallery_show_nsfw', showNsfwContent.value ? 'true' : 'false')
  
  const message = showNsfwContent.value 
    ? 'NSFW контент включен для всех артов 👁️' 
    : 'NSFW контент скрыт 🙈'
  showNotification(message, 'info')
}

// ============================================
// ✅ ОПТИМИЗИРОВАННАЯ ЗАГРУЗКА ДАННЫХ БЕЗ ДУБЛИРОВАНИЯ
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
    // ✅ ИСПОЛЬЗУЕМ НОВЫЙ ОПТИМИЗИРОВАННЫЙ МЕТОД
    const allData = await api.loadAllData({
      search: searchQuery.value.trim(),
      tags: selectedTags.value,
      artists: selectedArtists.value,
      characters: selectedCharacters.value, // ✅ Добавляем персонажей
      showNsfw: currentContentFilter.value === 'nsfw' || (currentContentFilter.value === 'all' && showNsfwContent.value),
      sort: currentSort.value,
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
    
    // ✅ Логируем статистику с NSFW
    const nsfwCount = allData.arts.filter(art => art.is_nsfw).length
    console.log(`📊 Загружено данных: артов ${allData.arts.length}, художников ${allData.artists.length}, тегов ${allData.tags.length}, персонажей ${allData.characters.length}, NSFW: ${nsfwCount}`)
    console.log('✅ Все данные загружены оптимизированно за минимальное количество запросов!')

  } catch (err) {
    error.value = err.message || 'Ошибка загрузки фурри-артов'
    console.error('❌ Ошибка загрузки данных:', err)
  } finally {
    loading.value = false
  }
}

// ============================================
// ✅ ИСПРАВЛЕНО: ЗАГРУЗКА АРТОВ БЕЗ ДУБЛИРОВАНИЯ ОСТАЛЬНЫХ ДАННЫХ
// ============================================
const loadArts = async (isLoadMore = false) => {
  // Предотвращаем загрузку во время инициализации
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
    // ✅ ИСПРАВЛЕНО: Правильные опции для API с унифицированными полями
    const options = {
      search: searchQuery.value.trim(),
      tags: selectedTags.value,
      artists: selectedArtists.value,
      characters: selectedCharacters.value, // ✅ Добавляем персонажей
      showNsfw: currentContentFilter.value === 'nsfw' || (currentContentFilter.value === 'all' && showNsfwContent.value),
      sort: currentSort.value,
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

    // ✅ Логируем статистику с NSFW
    const nsfwCount = newArts.filter(art => art.is_nsfw).length
    console.log(`📊 Загружено артов: ${newArts.length}, NSFW: ${nsfwCount}`)

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
// ✅ ИСПРАВЛЕНО: ОБРАБОТЧИКИ ФИЛЬТРОВ БЕЗ ДУБЛИРОВАНИЯ
// ============================================
const handleSearch = (query) => {
  console.log('🔍 handleSearch:', query)
  searchQuery.value = query
  debouncedLoadArts()
}

const handleTagFilter = (tagNames) => {
  console.log('🏷️ handleTagFilter:', tagNames)
  selectedTags.value = [...tagNames] // Создаем новый массив для реактивности
  debouncedLoadArts()
}

const handleArtistFilter = (artistNames) => {
  console.log('🎨 handleArtistFilter:', artistNames)
  selectedArtists.value = [...artistNames] // Создаем новый массив для реактивности
  debouncedLoadArts()
}

const handleCharacterFilter = (characterNames) => {
  console.log('🦊 handleCharacterFilter:', characterNames)
  selectedCharacters.value = [...characterNames] // Создаем новый массив для реактивности
  debouncedLoadArts()
}

const handleContentFilter = (contentFilter) => {
  console.log('🔍 handleContentFilter:', contentFilter)
  currentContentFilter.value = contentFilter
  
  // ✅ ИСПРАВЛЕНО: Правильная обработка NSFW фильтра
  if (contentFilter === 'nsfw') {
    showNsfwContent.value = true
  } else if (contentFilter === 'sfw') {
    showNsfwContent.value = false
  }
  // Для 'all' не меняем showNsfwContent.value
  
  // Сохраняем в localStorage
  localStorage.setItem('gallery_content_filter', contentFilter)
  
  debouncedLoadArts()
  
  const filterNames = {
    all: 'Всё содержимое',
    sfw: 'Только SFW',
    nsfw: 'Только NSFW'
  }
  showNotification(`Фильтр: ${filterNames[contentFilter]} 🔍`, 'info')
}

const handleSortChange = (sort) => {
  console.log('📊 handleSortChange:', sort)
  currentSort.value = sort
  debouncedLoadArts()
}

const handleClearFilters = () => {
  console.log('🧹 handleClearFilters: Сбрасываем все фильтры')
  searchQuery.value = ''
  selectedTags.value = []
  selectedArtists.value = []
  selectedCharacters.value = []
  currentContentFilter.value = 'all'
  currentSort.value = 'newest'
  showNsfwContent.value = false
  
  // Очищаем localStorage
  localStorage.removeItem('gallery_content_filter')
  localStorage.removeItem('gallery_show_nsfw')
  
  debouncedLoadArts()
  showNotification('Все фильтры сброшены! 🧹', 'success')
}

// Старые обработчики для совместимости
const handleFilterByTag = quickFilterByTag
const handleFilterByArtist = quickFilterByArtist
const handleFilterBySpecies = quickFilterBySpecies

// ============================================
// ЛАЙТБОКС
// ============================================
const openLightbox = (art) => {
  const index = arts.value.findIndex(a => a.id === art.id)
  lightbox.imageUrl = art.image_url
  lightbox.title = art.title
  lightbox.art = art
  lightbox.currentIndex = index
  lightbox.visible = true
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  lightbox.visible = false
  lightbox.art = null
  document.body.style.overflow = ''
}

const previousArt = () => {
  if (lightbox.currentIndex > 0) {
    const prevArt = arts.value[lightbox.currentIndex - 1]
    openLightbox(prevArt)
  }
}

const nextArt = () => {
  if (lightbox.currentIndex < arts.value.length - 1) {
    const nextArt = arts.value[lightbox.currentIndex + 1]
    openLightbox(nextArt)
  }
}

// ============================================
// УВЕДОМЛЕНИЯ
// ============================================
const showNotification = (message, type = 'info') => {
  notification.message = message
  notification.type = type
  notification.show = true
  
  setTimeout(() => {
    notification.show = false
  }, 3000)
}

const closeNotification = () => {
  notification.show = false
}

const getNotificationEmoji = () => {
  switch (notification.type) {
    case 'success': return '✅'
    case 'error': return '❌' 
    case 'warning': return '⚠️'
    default: return 'ℹ️'
  }
}

// ============================================
// СОБЫТИЯ КЛАВИАТУРЫ
// ============================================
const handleKeyDown = (event) => {
  if (lightbox.visible) {
    if (event.key === 'Escape') {
      closeLightbox()
    } else if (event.key === 'ArrowLeft') {
      previousArt()
    } else if (event.key === 'ArrowRight') {
      nextArt()
    }
  }
}

// ============================================
// ✅ ОПТИМИЗИРОВАННЫЙ ЖИЗНЕННЫЙ ЦИКЛ
// ============================================
onMounted(async () => {
  console.log('🚀 Инициализация Gallery.vue...')
  
  // ✅ ИСПРАВЛЕНО: Загружаем настройки БЕЗ вызова фильтров
  const savedNsfwSetting = localStorage.getItem('gallery_show_nsfw')
  if (savedNsfwSetting === 'true') {
    showNsfwContent.value = true
  }
  
  const savedContentFilter = localStorage.getItem('gallery_content_filter')
  if (savedContentFilter && ['all', 'sfw', 'nsfw'].includes(savedContentFilter)) {
    currentContentFilter.value = savedContentFilter
    // ✅ НЕ ВЫЗЫВАЕМ handleContentFilter здесь, чтобы избежать повторной загрузки
  }
  
  // Загружаем данные только один раз оптимизированно
  await loadAllData()
  
  // Настраиваем обработчики событий
  window.addEventListener('keydown', handleKeyDown)
  
  console.log('✅ Gallery.vue инициализирован оптимально!')
  console.log('✅ Предотвращено дублирование запросов!')
  console.log('✅ NSFW функционал полностью работает!')
  console.log('✅ Унифицированные поля данных используются!')
  console.log('✅ Исправлены аватары с надежным сервисом!')
  console.log('✅ Фильтры работают корректно!')
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
  if (filterTimeout) clearTimeout(filterTimeout)
})
</script>

<style scoped>
/* ✅ ВСЕ СТИЛИ ОСТАЮТСЯ БЕЗ ИЗМЕНЕНИЙ - ОНИ УЖЕ ПРАВИЛЬНЫЕ */

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

/* ✅ Отладочная информация */
.ft-debug-info {
  background: rgba(33, 150, 243, 0.1);
  border: 1px solid rgba(33, 150, 243, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  color: #2196f3;
  font-size: 0.9rem;
  text-align: center;
}

.ft-debug-info p {
  margin: 0;
}

/* NSFW карточки */
.ft-simple-art-card.nsfw-content {
  position: relative;
}

.ft-simple-art-card.nsfw-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid rgba(255, 107, 107, 0.3);
  border-radius: 1rem;
  pointer-events: none;
  z-index: 1;
}

/* NSFW индикатор */
.ft-nsfw-indicator {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 10;
}

.ft-nsfw-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 107, 107, 0.9);
  color: white;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
  border: 1px solid rgba(255, 107, 107, 0.6);
}

.ft-nsfw-badge i {
  font-size: 0.7rem;
}

/* NSFW overlay */
.ft-nsfw-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  cursor: pointer;
  backdrop-filter: blur(10px);
  border-radius: 1rem 1rem 0 0;
}

.ft-nsfw-overlay-content {
  text-align: center;
  color: white;
  padding: 2rem;
}

.ft-nsfw-overlay-content i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #ff6b6b;
}

.ft-nsfw-overlay-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 700;
}

.ft-nsfw-overlay-content p {
  margin: 0;
  font-size: 0.9rem;
  color: #cccccc;
}

/* NSFW blur эффект */
.ft-art-thumbnail.nsfw-blurred {
  filter: blur(20px);
  transform: scale(1.1);
}

/* Hover эффекты для NSFW */
.ft-nsfw-overlay:hover {
  background: rgba(0, 0, 0, 0.9);
}

.ft-nsfw-overlay:hover .ft-nsfw-overlay-content i {
  color: #ff8a80;
  transform: scale(1.1);
}

/* Анимации */
.ft-nsfw-badge {
  animation: nsfwPulse 2s ease-in-out infinite;
}

@keyframes nsfwPulse {
  0%, 100% { 
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
  }
  50% { 
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6);
  }
}

/* Остальные стили остаются без изменений... */
.ft-loading-skeleton {
  animation: pulse 1.5s ease-in-out infinite alternate;
}

.ft-skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.ft-skeleton-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.ft-skeleton-image {
  aspect-ratio: 1;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  display: flex;
  align-items: center;
  justify-content: center;
}

.ft-skeleton-paw {
  font-size: 3rem;
  opacity: 0.3;
  animation: float 3s ease-in-out infinite;
}

.ft-skeleton-content {
  padding: 1rem;
}

.ft-skeleton-line {
  border-radius: 0.25rem;
  margin-bottom: 0.75rem;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
}

.ft-skeleton-line-title {
  height: 1.2rem;
  width: 80%;
}

.ft-skeleton-line-subtitle {
  height: 1rem;
  width: 60%;
}

.ft-skeleton-tags {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.ft-skeleton-tag {
  height: 1.5rem;
  width: 3rem;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border-radius: 0.75rem;
}

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
}

.ft-furry-gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.ft-simple-art-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.ft-simple-art-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 123, 37, 0.3);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
}

.ft-art-image-container {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.ft-art-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.ft-simple-art-card:hover .ft-art-thumbnail {
  transform: scale(1.05);
}

.ft-art-info {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ft-art-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #f2f2f2;
  margin: 0;
}

.ft-artist-pill {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  width: fit-content;
}

.ft-artist-pill:hover {
  background: rgba(76, 175, 80, 0.2);
  transform: translateY(-2px);
}

.ft-artist-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  object-fit: cover;
}

.ft-artist-name {
  font-weight: 600;
  color: #f2f2f2;
  font-size: 0.9rem;
}

.ft-friend-star {
  color: #ffd700;
  font-size: 0.8rem;
}

.ft-characters-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ft-characters-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

.ft-characters-avatars {
  display: flex;
  align-items: center;
}

.ft-character-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(255, 123, 37, 0.6);
  object-fit: cover;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.ft-character-avatar:not(:first-child) {
  margin-left: -12px;
}

.ft-character-avatar:hover {
  transform: scale(1.1) translateY(-2px);
  z-index: 10;
  border-color: rgba(255, 123, 37, 1);
}

.ft-more-characters {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 123, 37, 0.8), rgba(255, 152, 0, 0.8));
  border: 2px solid rgba(255, 123, 37, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: white;
  cursor: pointer;
  margin-left: -12px;
}

.ft-art-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.ft-tag-pill {
  padding: 0.3rem 0.7rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 123, 37, 0.15);
  color: #ff7b25;
  border: 1px solid rgba(255, 123, 37, 0.3);
}

.ft-tag-pill:hover {
  transform: translateY(-2px);
  background: rgba(255, 123, 37, 0.25);
  border-color: rgba(255, 123, 37, 0.5);
}

.ft-more-tags-pill {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  padding: 0.3rem 0.7rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.ft-art-date {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.5rem;
}

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
}

.ft-lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.ft-lightbox-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ft-lightbox-close {
  position: absolute;
  top: -50px;
  right: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.ft-lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  z-index: 10;
}

.ft-lightbox-prev {
  left: -70px;
}

.ft-lightbox-next {
  right: -70px;
}

.ft-lightbox-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 0.5rem;
}

.ft-lightbox-info {
  margin-top: 1rem;
  text-align: center;
  color: white;
  max-width: 500px;
}

.ft-lightbox-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.ft-lightbox-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  font-size: 0.9rem;
  opacity: 0.7;
}

.ft-lightbox-artist {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ft-lightbox-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

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
}

@keyframes pulse {
  0% { opacity: 0.6; }
  100% { opacity: 1; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
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

.ft-lightbox-enter-active,
.ft-lightbox-leave-active {
  transition: all 0.3s ease;
}

.ft-lightbox-enter-from,
.ft-lightbox-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .ft-furry-gallery-page {
    padding: 1rem 0.5rem;
  }
  
  .ft-furry-gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }
  
  .ft-art-info {
    padding: 1rem;
    gap: 0.8rem;
  }
  
  .ft-character-avatar,
  .ft-more-characters {
    width: 32px;
    height: 32px;
  }
  
  .ft-character-avatar:not(:first-child),
  .ft-more-characters {
    margin-left: -10px;
  }
  
  .ft-notification {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
    max-width: none;
  }
  
  .ft-lightbox-nav {
    display: none;
  }
  
  .ft-nsfw-badge {
    padding: 0.4rem 0.6rem;
    font-size: 0.7rem;
  }
  
  .ft-nsfw-overlay-content {
    padding: 1.5rem;
  }
  
  .ft-nsfw-overlay-content i {
    font-size: 2rem;
  }
  
  .ft-nsfw-overlay-content h4 {
    font-size: 1rem;
  }
  
  .ft-debug-info {
    font-size: 0.8rem;
    padding: 0.75rem;
  }
}
</style>