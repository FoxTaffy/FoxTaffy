<template>
  <section class="gallery-filters">
    <!-- Поисковая строка -->
    <div class="search-container">
      <input
        type="text"
        :value="searchQuery"
        @input="handleSearchInput"
        placeholder="Поиск артов..."
        class="search-input"
      >
      <i class="fas fa-search search-icon"></i>
      <button
        v-if="searchQuery"
        @click="clearSearch"
        class="search-clear"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Основные фильтры -->
    <div class="filters-row">
      <!-- Фильтр по тегам -->
      <FilterDropdown
        ref="tagsRef"
        icon="fas fa-tags"
        label="Теги"
        :selected-count="selectedTags.length"
        :is-open="showDropdowns.tags"
        @toggle="toggleDropdown('tags')"
      >
        <template #header>
          <div class="dropdown-header">
            <span>Выберите теги</span>
            <button @click="clearTags" class="clear-btn">Очистить</button>
          </div>
        </template>
        <template #content>
          <div class="dropdown-list">
            <label
              v-for="tag in availableTags"
              :key="tag.id"
              class="dropdown-item"
            >
              <input
                type="checkbox"
                :value="tag.name"
                :checked="selectedTags.includes(tag.name)"
                @change="handleTagChange($event, tag.name)"
              >
              <div class="tag-color"></div>
              <span class="item-name">{{ tag.name }}</span>
              <span class="item-count">({{ tag.count || 0 }})</span>
            </label>
          </div>
        </template>
      </FilterDropdown>

      <!-- Фильтр по художникам -->
      <FilterDropdown
        ref="artistsRef"
        icon="fas fa-palette"
        label="Художники"
        :selected-count="selectedArtists.length"
        :is-open="showDropdowns.artists"
        @toggle="toggleDropdown('artists')"
      >
        <template #header>
          <div class="dropdown-header">
            <span>Выберите художников</span>
            <button @click="clearArtists" class="clear-btn">Очистить</button>
          </div>
        </template>
        <template #content>
          <div class="dropdown-list">
            <label
              v-for="artist in availableArtists"
              :key="artist.id"
              class="dropdown-item"
            >
              <input
                type="checkbox"
                :value="artist.name"
                :checked="selectedArtists.includes(artist.name)"
                @change="handleArtistChange($event, artist.name)"
              >
              <img
                :src="artist.avatar_url || getDefaultAvatar(artist.name)"
                :alt="artist.name"
                class="item-avatar"
              >
              <span class="item-name">{{ artist.name }}</span>
              <i v-if="artist.is_friend" class="fas fa-star friend-star"></i>
              <span class="item-count">({{ artist.count || 0 }})</span>
            </label>
          </div>
        </template>
      </FilterDropdown>

      <!-- Фильтр по персонажам -->
      <FilterDropdown
        ref="charactersRef"
        icon="fas fa-paw"
        label="Персонажи"
        :selected-count="selectedCharacters.length"
        :is-open="showDropdowns.characters"
        @toggle="toggleDropdown('characters')"
      >
        <template #header>
          <div class="dropdown-header">
            <span>Выберите персонажей</span>
            <button @click="clearCharacters" class="clear-btn">Очистить</button>
          </div>
        </template>
        <template #content>
          <div class="dropdown-list">
            <label
              v-for="character in availableCharacters"
              :key="character.id"
              class="dropdown-item"
            >
              <input
                type="checkbox"
                :value="character.name"
                :checked="selectedCharacters.includes(character.name)"
                @change="handleCharacterChange($event, character.name)"
              >
              <img
                :src="character.avatar_url || getDefaultCharacterAvatar(character.name)"
                :alt="character.name"
                class="item-avatar"
              >
              <span class="item-name">{{ character.name }}</span>
              <span class="item-count">({{ character.count || 0 }})</span>
            </label>
          </div>
        </template>
      </FilterDropdown>

      <!-- NSFW фильтр -->
      <div class="content-filter">
        <FilterDropdown
          ref="contentRef"
          :icon="getContentIcon()"
          :label="getContentLabel()"
          :selected-count="0"
          :is-open="showDropdowns.content"
          :class="{
            sfw: currentContentFilter === 'sfw',
            nsfw: currentContentFilter === 'nsfw'
          }"
          @toggle="toggleDropdown('content')"
        >
          <template #header>
            <div class="dropdown-header">
              <span>Фильтр по содержанию</span>
            </div>
          </template>
          <template #content>
            <div class="dropdown-list">
              <button
                @click="setContentFilter('all')"
                class="dropdown-item content-item"
                :class="{ active: currentContentFilter === 'all' }"
              >
                <i class="fas fa-eye"></i>
                <span class="item-name">Всё содержимое</span>
                <span class="item-description">SFW + NSFW</span>
              </button>

              <button
                @click="setContentFilter('sfw')"
                class="dropdown-item content-item sfw-item"
                :class="{ active: currentContentFilter === 'sfw' }"
              >
                <i class="fas fa-shield-alt"></i>
                <span class="item-name">Только SFW</span>
                <span class="item-description">Безопасно для работы</span>
              </button>

              <button
                @click="setContentFilter('nsfw')"
                class="dropdown-item content-item nsfw-item"
                :class="{ active: currentContentFilter === 'nsfw' }"
              >
                <i class="fas fa-exclamation-triangle"></i>
                <span class="item-name">Только NSFW</span>
                <span class="item-description">Контент 18+</span>
              </button>
            </div>
          </template>
        </FilterDropdown>
      </div>

      <!-- Сортировка -->
      <FilterDropdown
        ref="sortRef"
        icon="fas fa-sort"
        :label="getSortLabel(currentSort)"
        :selected-count="0"
        :is-open="showDropdowns.sort"
        @toggle="toggleDropdown('sort')"
      >
        <template #header>
          <div class="dropdown-header">
            <span>Сортировать по</span>
          </div>
        </template>
        <template #content>
          <div class="dropdown-list">
            <button
              v-for="option in sortOptions"
              :key="option.value"
              class="dropdown-item sort-item"
              :class="{ active: currentSort === option.value }"
              @click="setSort(option.value)"
            >
              <i :class="option.icon"></i>
              <span class="item-name">{{ option.label }}</span>
              <i v-if="currentSort === option.value" class="fas fa-check"></i>
            </button>
          </div>
        </template>
      </FilterDropdown>

      <!-- Кнопка сброса -->
      <button
        v-if="hasActiveFilters"
        @click="clearAllFilters"
        class="clear-all-btn"
      >
        <i class="fas fa-times"></i>
        <span>Сбросить ({{ activeFiltersCount }})</span>
      </button>
    </div>

    <!-- Активные фильтры -->
    <div v-if="hasActiveFilters" class="active-filters">
      <div class="active-filters-header">
        <i class="fas fa-filter"></i>
        <span>Активные фильтры:</span>
      </div>
      <div class="active-filter-pills">
        <!-- Поиск -->
        <div v-if="searchQuery" class="filter-pill search-pill">
          <i class="fas fa-search"></i>
          <span>{{ searchQuery }}</span>
          <button @click="clearSearch"><i class="fas fa-times"></i></button>
        </div>

        <!-- Теги -->
        <div
          v-for="tag in selectedTags"
          :key="'tag-' + tag"
          class="filter-pill tag-pill"
          @click="removeTag(tag)"
        >
          <div class="tag-color"></div>
          <span>{{ tag }}</span>
          <button @click.stop="removeTag(tag)"><i class="fas fa-times"></i></button>
        </div>

        <!-- Художники -->
        <div
          v-for="artist in selectedArtists"
          :key="'artist-' + artist"
          class="filter-pill artist-pill"
          @click="removeArtist(artist)"
        >
          <img :src="getArtistAvatar(artist)" :alt="artist" class="pill-avatar">
          <span>{{ artist }}</span>
          <button @click.stop="removeArtist(artist)"><i class="fas fa-times"></i></button>
        </div>

        <!-- Персонажи -->
        <div
          v-for="character in selectedCharacters"
          :key="'char-' + character"
          class="filter-pill character-pill"
          @click="removeCharacter(character)"
        >
          <img :src="getCharacterAvatar(character)" :alt="character" class="pill-avatar">
          <span>{{ character }}</span>
          <button @click.stop="removeCharacter(character)"><i class="fas fa-times"></i></button>
        </div>

        <!-- Контент фильтр -->
        <div v-if="currentContentFilter !== 'all'" class="filter-pill content-pill" :class="currentContentFilter">
          <i :class="getContentIcon()"></i>
          <span>{{ getContentLabel() }}</span>
          <button @click="setContentFilter('all')"><i class="fas fa-times"></i></button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import FilterDropdown from './FilterDropdown.vue'

// ============================================
// PROPS & EMITS
// ============================================
const props = defineProps({
  availableTags: { type: Array, default: () => [] },
  availableArtists: { type: Array, default: () => [] },
  availableCharacters: { type: Array, default: () => [] },
  selectedTags: { type: Array, default: () => [] },
  selectedArtists: { type: Array, default: () => [] },
  selectedCharacters: { type: Array, default: () => [] },
  currentSort: { type: String, default: 'newest' },
  currentContentFilter: { type: String, default: 'all' }
})

const emit = defineEmits([
  'search',
  'filter-tags',
  'filter-artists',
  'filter-characters',
  'filter-content',
  'sort-change',
  'clear-filters'
])

// ============================================
// ЛОКАЛЬНОЕ СОСТОЯНИЕ
// ============================================
const searchQuery = ref('')

// Дропдауны
const showDropdowns = ref({
  tags: false,
  artists: false,
  characters: false,
  content: false,
  sort: false
})

// Refs для дропдаунов
const tagsRef = ref(null)
const artistsRef = ref(null)
const charactersRef = ref(null)
const contentRef = ref(null)
const sortRef = ref(null)

// Опции сортировки
const sortOptions = [
  { label: 'Новые сначала', value: 'newest', icon: 'fas fa-clock' },
  { label: 'Старые сначала', value: 'oldest', icon: 'fas fa-history' },
  { label: 'По алфавиту А-Я', value: 'alphabetical', icon: 'fas fa-sort-alpha-down' },
  { label: 'По алфавиту Я-А', value: 'alphabetical-desc', icon: 'fas fa-sort-alpha-up' },
  { label: 'По художнику', value: 'artist', icon: 'fas fa-user' }
]

// Таймер для поиска
let searchTimeout = null
const DEBOUNCE_DELAY = 300

// ============================================
// ВЫЧИСЛЯЕМЫЕ СВОЙСТВА (МЕМОИЗАЦИЯ)
// ============================================
const selectedTags = computed(() => props.selectedTags)
const selectedArtists = computed(() => props.selectedArtists)
const selectedCharacters = computed(() => props.selectedCharacters)
const currentSort = computed(() => props.currentSort)
const currentContentFilter = computed(() => props.currentContentFilter)

const hasActiveFilters = computed(() => {
  return (
    searchQuery.value.trim() !== '' ||
    selectedTags.value.length > 0 ||
    selectedArtists.value.length > 0 ||
    selectedCharacters.value.length > 0 ||
    currentContentFilter.value !== 'all' ||
    currentSort.value !== 'newest'
  )
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (searchQuery.value.trim()) count++
  count += selectedTags.value.length
  count += selectedArtists.value.length
  count += selectedCharacters.value.length
  if (currentContentFilter.value !== 'all') count++
  if (currentSort.value !== 'newest') count++
  return count
})

// ============================================
// АВАТАРЫ (МЕМОИЗИРОВАННЫЕ)
// ============================================
const avatarCache = new Map()

const getDefaultAvatar = (name) => {
  if (avatarCache.has(name)) {
    return avatarCache.get(name)
  }

  const colors = ['FF7B25', '4CAF50', '2196F3', '9C27B0', 'FF5722']
  const colorIndex = name ? name.length % colors.length : 0
  const color = colors[colorIndex]
  const initial = name ? name.charAt(0).toUpperCase() : '?'
  const url = `https://ui-avatars.com/api/?name=${initial}&background=${color}&color=ffffff&size=32&bold=true&format=png`

  avatarCache.set(name, url)
  return url
}

const getDefaultCharacterAvatar = (name) => {
  if (avatarCache.has(`char_${name}`)) {
    return avatarCache.get(`char_${name}`)
  }

  const emojis = ['🦊', '🐱', '🐺', '🐲', '🦝', '🐰', '🐻', '🦌']
  const emojiIndex = name ? name.length % emojis.length : 0
  const emoji = emojis[emojiIndex]
  const url = `https://ui-avatars.com/api/?name=${emoji}&background=FF7B25&color=ffffff&size=32&bold=true&format=png`

  avatarCache.set(`char_${name}`, url)
  return url
}

const getArtistAvatar = (artistName) => {
  const artist = props.availableArtists.find(a => a.name === artistName)
  return artist?.avatar_url || getDefaultAvatar(artistName)
}

const getCharacterAvatar = (characterName) => {
  const character = props.availableCharacters.find(c => c.name === characterName)
  return character?.avatar_url || getDefaultCharacterAvatar(characterName)
}

// ============================================
// МЕТОДЫ ПОИСКА С DEBOUNCE
// ============================================
const handleSearchInput = (event) => {
  searchQuery.value = event.target.value

  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    emit('search', searchQuery.value)
  }, DEBOUNCE_DELAY)
}

const clearSearch = () => {
  searchQuery.value = ''
  emit('search', '')
}

// ============================================
// МЕТОДЫ ДРОПДАУНОВ
// ============================================
const toggleDropdown = (type) => {
  Object.keys(showDropdowns.value).forEach(key => {
    if (key !== type) showDropdowns.value[key] = false
  })
  showDropdowns.value[type] = !showDropdowns.value[type]
}

const closeAllDropdowns = () => {
  Object.keys(showDropdowns.value).forEach(key => {
    showDropdowns.value[key] = false
  })
}

// ============================================
// МЕТОДЫ ФИЛЬТРОВ (ОПТИМИЗИРОВАННЫЕ)
// ============================================
const handleTagChange = (event, tagName) => {
  const newTags = event.target.checked
    ? [...selectedTags.value, tagName]
    : selectedTags.value.filter(t => t !== tagName)

  emit('filter-tags', newTags)
}

const handleArtistChange = (event, artistName) => {
  const newArtists = event.target.checked
    ? [...selectedArtists.value, artistName]
    : selectedArtists.value.filter(a => a !== artistName)

  emit('filter-artists', newArtists)
}

const handleCharacterChange = (event, characterName) => {
  const newCharacters = event.target.checked
    ? [...selectedCharacters.value, characterName]
    : selectedCharacters.value.filter(c => c !== characterName)

  emit('filter-characters', newCharacters)
}

const clearTags = () => {
  emit('filter-tags', [])
}

const clearArtists = () => {
  emit('filter-artists', [])
}

const clearCharacters = () => {
  emit('filter-characters', [])
}

const removeTag = (tag) => {
  emit('filter-tags', selectedTags.value.filter(t => t !== tag))
}

const removeArtist = (artist) => {
  emit('filter-artists', selectedArtists.value.filter(a => a !== artist))
}

const removeCharacter = (character) => {
  emit('filter-characters', selectedCharacters.value.filter(c => c !== character))
}

// ============================================
// NSFW/Content фильтры
// ============================================
const setContentFilter = (filter) => {
  closeAllDropdowns()
  emit('filter-content', filter)
}

const getContentIcon = () => {
  switch (currentContentFilter.value) {
    case 'sfw': return 'fas fa-shield-alt'
    case 'nsfw': return 'fas fa-exclamation-triangle'
    default: return 'fas fa-eye'
  }
}

const getContentLabel = () => {
  switch (currentContentFilter.value) {
    case 'sfw': return 'Только SFW'
    case 'nsfw': return 'Только NSFW'
    default: return 'Всё содержимое'
  }
}

// ============================================
// СОРТИРОВКА
// ============================================
const setSort = (sortValue) => {
  closeAllDropdowns()
  emit('sort-change', sortValue)
}

const getSortLabel = (sortValue) => {
  const option = sortOptions.find(opt => opt.value === sortValue)
  return option ? option.label : 'Сортировка'
}

// ============================================
// ОЧИСТКА ВСЕХ ФИЛЬТРОВ
// ============================================
const clearAllFilters = () => {
  searchQuery.value = ''
  closeAllDropdowns()
  emit('clear-filters')
}

// ============================================
// ОБРАБОТКА КЛИКОВ ВНЕ ДРОПДАУНОВ
// ============================================
const handleClickOutside = (event) => {
  const dropdownRefs = [tagsRef.value, artistsRef.value, charactersRef.value, contentRef.value, sortRef.value]
  const clickedOutside = dropdownRefs.every(ref => ref && !ref.$el.contains(event.target))
  if (clickedOutside) {
    closeAllDropdowns()
  }
}

// ============================================
// ЖИЗНЕННЫЙ ЦИКЛ
// ============================================
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  console.log('✅ Оптимизированный Filter.vue инициализирован!')
  console.log('✨ Использован FilterDropdown для уменьшения дублирования')
  console.log('✨ Добавлена мемоизация аватаров')
  console.log('✨ Оптимизированы вычисляемые свойства')
})

onBeforeUnmount(() => {
  if (searchTimeout) clearTimeout(searchTimeout)
  document.removeEventListener('click', handleClickOutside)
  avatarCache.clear()
})
</script>

<style scoped>
/* ВСЕ СТИЛИ ОСТАЮТСЯ ИЗ ОРИГИНАЛА (они уже хороши) */
/* Скопируем их из Filter.vue для полноты */
@import './Filter.css';
</style>
