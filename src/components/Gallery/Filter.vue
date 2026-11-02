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
      <div class="filter-dropdown" ref="tagsRef">
        <button 
          class="filter-btn" 
          @click="toggleDropdown('tags')"
          :class="{ active: selectedTags.length > 0 }"
        >
          <i class="fas fa-tags"></i>
          <span>Теги</span>
          <span v-if="selectedTags.length > 0" class="filter-count">{{ selectedTags.length }}</span>
          <i class="fas fa-chevron-down" :class="{ rotated: showDropdowns.tags }"></i>
        </button>
        
        <Transition name="ft-dropdown">
          <div v-if="showDropdowns.tags" class="dropdown-content">
            <div class="dropdown-header">
              <span>Выберите теги</span>
              <button @click="clearTags" class="clear-btn">Очистить</button>
            </div>
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
          </div>
        </Transition>
      </div>

      <!-- Фильтр по художникам -->
      <div class="filter-dropdown" ref="artistsRef">
        <button 
          class="filter-btn" 
          @click="toggleDropdown('artists')"
          :class="{ active: selectedArtists.length > 0 }"
        >
          <i class="fas fa-palette"></i>
          <span>Художники</span>
          <span v-if="selectedArtists.length > 0" class="filter-count">{{ selectedArtists.length }}</span>
          <i class="fas fa-chevron-down" :class="{ rotated: showDropdowns.artists }"></i>
        </button>
        
        <Transition name="ft-dropdown">
          <div v-if="showDropdowns.artists" class="dropdown-content">
            <div class="dropdown-header">
              <span>Выберите художников</span>
              <button @click="clearArtists" class="clear-btn">Очистить</button>
            </div>
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
          </div>
        </Transition>
      </div>

      <!-- Фильтр по персонажам -->
      <div class="filter-dropdown" ref="charactersRef">
        <button 
          class="filter-btn" 
          @click="toggleDropdown('characters')"
          :class="{ active: selectedCharacters.length > 0 }"
        >
          <i class="fas fa-paw"></i>
          <span>Персонажи</span>
          <span v-if="selectedCharacters.length > 0" class="filter-count">{{ selectedCharacters.length }}</span>
          <i class="fas fa-chevron-down" :class="{ rotated: showDropdowns.characters }"></i>
        </button>
        
        <Transition name="ft-dropdown">
          <div v-if="showDropdowns.characters" class="dropdown-content">
            <div class="dropdown-header">
              <span>Выберите персонажей</span>
              <button @click="clearCharacters" class="clear-btn">Очистить</button>
            </div>
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
          </div>
        </Transition>
      </div>

      <!-- Сортировка -->
      <div class="filter-dropdown" ref="sortRef">
        <button 
          class="filter-btn" 
          @click="toggleDropdown('sort')"
        >
          <i class="fas fa-sort"></i>
          <span>{{ getSortLabel(currentSort) }}</span>
          <i class="fas fa-chevron-down" :class="{ rotated: showDropdowns.sort }"></i>
        </button>
        
        <Transition name="ft-dropdown">
          <div v-if="showDropdowns.sort" class="dropdown-content">
            <div class="dropdown-header">
              <span>Сортировать по</span>
            </div>
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
          </div>
        </Transition>
      </div>

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
    <Transition name="ft-filters-panel">
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
      </div>
    </div>
    </Transition>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

// ============================================
// ✅ КОНСТАНТЫ
// ============================================
const DEBOUNCE_DELAY = 300

// ============================================
// ✅ ИСПРАВЛЕНО: УБРАНО ДУБЛИРОВАНИЕ СОСТОЯНИЯ
// Props напрямую используются без дублирования
// ============================================
const props = defineProps({
  availableTags: { type: Array, default: () => [] },
  availableArtists: { type: Array, default: () => [] },
  availableCharacters: { type: Array, default: () => [] },
  selectedTags: { type: Array, default: () => [] },
  selectedArtists: { type: Array, default: () => [] },
  selectedCharacters: { type: Array, default: () => [] },
  currentSort: { type: String, default: 'newest' }
})

// Emits
const emit = defineEmits([
  'search',
  'filter-tags',
  'filter-artists',
  'filter-characters',
  'sort-change',
  'clear-filters'
])

// ============================================
// ✅ МИНИМАЛЬНОЕ ЛОКАЛЬНОЕ СОСТОЯНИЕ
// ============================================
const searchQuery = ref('')

// Дропдауны
const showDropdowns = ref({
  tags: false,
  artists: false,
  characters: false,
  sort: false
})

// Refs для дропдаунов
const tagsRef = ref(null)
const artistsRef = ref(null)
const charactersRef = ref(null)
const sortRef = ref(null)

// Опции сортировки
const sortOptions = ref([
  { label: 'Новые сначала', value: 'newest', icon: 'fas fa-clock' },
  { label: 'Старые сначала', value: 'oldest', icon: 'fas fa-history' },
  { label: 'По алфавиту А-Я', value: 'alphabetical', icon: 'fas fa-sort-alpha-down' },
  { label: 'По алфавиту Я-А', value: 'alphabetical-desc', icon: 'fas fa-sort-alpha-up' },
  { label: 'По художнику', value: 'artist', icon: 'fas fa-user' }
])

// Таймер для поиска
let searchTimeout = null

// ============================================
// ✅ ВЫЧИСЛЯЕМЫЕ СВОЙСТВА НА ОСНОВЕ PROPS (БЕЗ ДУБЛИРОВАНИЯ)
// ============================================
const selectedTags = computed(() => props.selectedTags)
const selectedArtists = computed(() => props.selectedArtists)
const selectedCharacters = computed(() => props.selectedCharacters)
const currentSort = computed(() => props.currentSort)

const hasActiveFilters = computed(() => {
  return searchQuery.value.trim() !== '' ||
         selectedTags.value.length > 0 ||
         selectedArtists.value.length > 0 ||
         selectedCharacters.value.length > 0 ||
         currentSort.value !== 'newest'
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (searchQuery.value.trim()) count++
  count += selectedTags.value.length
  count += selectedArtists.value.length
  count += selectedCharacters.value.length
  if (currentSort.value !== 'newest') count++
  return count
})

// ============================================
// ✅ ИСПРАВЛЕННЫЕ АВАТАРЫ
// ============================================
const getDefaultAvatar = (name) => {
  const colors = ['FF7B25', '4CAF50', '2196F3', '9C27B0', 'FF5722']
  const colorIndex = name ? name.length % colors.length : 0
  const color = colors[colorIndex]
  const initial = name ? name.charAt(0).toUpperCase() : '?'
  
  // ✅ ИСПРАВЛЕНО: Используем надежный сервис
  return `https://ui-avatars.com/api/?name=${initial}&background=${color}&color=ffffff&size=32&bold=true&format=png`
}

const getDefaultCharacterAvatar = (name) => {
  const emojis = ['🦊', '🐱', '🐺', '🐲', '🦝', '🐰', '🐻', '🦌']
  const emojiIndex = name ? name.length % emojis.length : 0
  const emoji = emojis[emojiIndex]
  
  // ✅ ИСПРАВЛЕНО: Используем надежный сервис
  return `https://ui-avatars.com/api/?name=${emoji}&background=FF7B25&color=ffffff&size=32&bold=true&format=png`
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
// ✅ ИСПРАВЛЕННЫЕ МЕТОДЫ ФИЛЬТРОВ (БЕЗ ДУБЛИРОВАНИЯ СОСТОЯНИЯ)
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
  const newTags = selectedTags.value.filter(t => t !== tag)
  emit('filter-tags', newTags)
}

const removeArtist = (artist) => {
  const newArtists = selectedArtists.value.filter(a => a !== artist)
  emit('filter-artists', newArtists)
}

const removeCharacter = (character) => {
  const newCharacters = selectedCharacters.value.filter(c => c !== character)
  emit('filter-characters', newCharacters)
}

// ============================================
// СОРТИРОВКА
// ============================================
const setSort = (sortValue) => {
  closeAllDropdowns()
  emit('sort-change', sortValue)
}

const getSortLabel = (sortValue) => {
  const option = sortOptions.value.find(opt => opt.value === sortValue)
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
  const dropdownRefs = [tagsRef.value, artistsRef.value, charactersRef.value, sortRef.value]
  const clickedOutside = dropdownRefs.every(ref => ref && !ref.contains(event.target))
  if (clickedOutside) {
    closeAllDropdowns()
  }
}

// ============================================
// ЖИЗНЕННЫЙ ЦИКЛ
// ============================================
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  console.log('✅ Filter.vue оптимизирован с простым NSFW toggle!')
})

onBeforeUnmount(() => {
  if (searchTimeout) clearTimeout(searchTimeout)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* ✅ ВСЕ СТИЛИ ОСТАЮТСЯ БЕЗ ИЗМЕНЕНИЙ - ОНИ УЖЕ ПРАВИЛЬНЫЕ */

.gallery-filters {
  margin-bottom: 2rem;
  font-family: 'Nunito', sans-serif;
}

/* Поисковая строка */
.search-container {
  position: relative;
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid rgb(var(--white-rgb) / 0.1);
  border-radius: var(--radius-sm);
  background: rgb(var(--white-rgb) / 0.05);
  color: var(--text-light);
  font-size: 1rem;
  transition: var(--transition);
  font-family: inherit;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-orange);
  background: rgb(var(--white-rgb) / 0.08);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-clear {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  border-radius: 50%;
  background: rgb(var(--white-rgb) / 0.1);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

.search-clear:hover {
  background: rgba(255, 0, 0, 0.2);
  color: #ff5252;
}

/* Ряд фильтров */
.filters-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1rem;
}

/* Базовые стили кнопок */
.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid rgb(var(--white-rgb) / 0.1);
  border-radius: var(--radius-sm);
  background: rgb(var(--white-rgb) / 0.05);
  color: var(--text-light);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: var(--transition);
  font-family: inherit;
  white-space: nowrap;
}

.filter-btn:hover {
  background: rgb(var(--white-rgb) / 0.1);
  border-color: rgb(var(--white-rgb) / 0.2);
}

.filter-btn.active {
  background: rgb(var(--accent-orange-rgb) / 0.2);
  border-color: rgb(var(--accent-orange-rgb) / 0.5);
  color: var(--accent-orange);
}

/* Специальные стили для контент фильтра */
.filter-btn.content-btn.sfw {
  background: rgb(var(--accent-green-rgb) / 0.2);
  border-color: rgb(var(--accent-green-rgb) / 0.5);
  color: var(--accent-green);
}

.filter-btn.content-btn.nsfw {
  background: rgba(255, 107, 107, 0.2);
  border-color: rgba(255, 107, 107, 0.5);
  color: var(--danger);
}

.filter-count {
  background: var(--accent-orange);
  color: white;
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
  border-radius: 0.75rem;
  font-weight: 600;
  min-width: 1.2rem;
  text-align: center;
}

.filter-btn i.fa-chevron-down {
  transition: transform 0.3s ease;
}

.filter-btn i.fa-chevron-down.rotated {
  transform: rotate(180deg);
}

/* Дропдауны */
.filter-dropdown {
  position: relative;
}

.dropdown-content {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  min-width: 280px;
  max-width: 400px;
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid rgb(var(--white-rgb) / 0.1);
  border-radius: var(--radius-sm);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgb(var(--white-rgb) / 0.1);
  font-weight: 600;
  color: var(--text-light);
  font-size: 0.9rem;
}

.clear-btn {
  background: none;
  border: none;
  color: var(--accent-orange);
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-family: inherit;
}

.clear-btn:hover {
  background: rgb(var(--accent-orange-rgb) / 0.1);
}

.dropdown-list {
  max-height: 250px;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
  border: none;
  background: none;
  color: var(--text-light);
  width: 100%;
  text-align: left;
  font-family: inherit;
}

.dropdown-item:hover {
  background: rgb(var(--white-rgb) / 0.05);
}

.dropdown-item.active {
  background: rgb(var(--accent-orange-rgb) / 0.1);
  color: var(--accent-orange);
}

/* Специальные стили для контент элементов */
.content-item {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
}

.content-item .item-name {
  font-weight: 600;
}

.content-item .item-description {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-left: 1.5rem;
}

.sfw-item:hover,
.sfw-item.active {
  background: rgb(var(--accent-green-rgb) / 0.1);
  color: var(--accent-green);
}

.nsfw-item:hover,
.nsfw-item.active {
  background: rgba(255, 107, 107, 0.1);
  color: var(--danger);
}

.dropdown-item input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  accent-color: var(--accent-orange);
}

.tag-color {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: var(--accent-orange);
  flex-shrink: 0;
}

.item-avatar {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.item-name {
  flex: 1;
  font-weight: 500;
}

.item-count {
  color: var(--text-muted);
  font-size: 0.8rem;
  margin-left: auto;
}

.friend-star {
  color: var(--accent-gold);
  font-size: 0.7rem;
}

.sort-item {
  justify-content: space-between;
}

/* Кнопка очистки всех фильтров */
.clear-all-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: var(--radius-sm);
  background: rgba(244, 67, 54, 0.1);
  color: var(--danger);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  margin-left: auto;
  font-family: inherit;
}

.clear-all-btn:hover {
  background: rgba(244, 67, 54, 0.2);
}

/* Активные фильтры */
.active-filters {
  padding: 1rem;
  background: rgb(var(--white-rgb) / 0.02);
  border: 1px solid rgb(var(--white-rgb) / 0.05);
  border-radius: var(--radius-sm);
}

.active-filters-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: var(--text-light);
  font-size: 0.9rem;
}

.active-filter-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  max-width: 200px;
}

.filter-pill button {
  width: 1rem;
  height: 1rem;
  border: none;
  border-radius: 50%;
  background: rgb(var(--white-rgb) / 0.2);
  color: inherit;
  cursor: pointer;
  font-size: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.filter-pill button:hover {
  background: rgba(255, 0, 0, 0.3);
}

.filter-pill span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.pill-avatar {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

/* Цвета пилюль */
.search-pill {
  background: rgba(33, 150, 243, 0.2);
  color: #2196f3;
  border: 1px solid rgba(33, 150, 243, 0.3);
}

.tag-pill {
  background: rgb(var(--accent-orange-rgb) / 0.2);
  color: var(--accent-orange);
  border: 1px solid rgb(var(--accent-orange-rgb) / 0.3);
}

.artist-pill {
  background: rgb(var(--accent-green-rgb) / 0.2);
  color: var(--accent-green);
  border: 1px solid rgb(var(--accent-green-rgb) / 0.3);
}

.character-pill {
  background: rgba(156, 39, 176, 0.2);
  color: #9c27b0;
  border: 1px solid rgba(156, 39, 176, 0.3);
}

.content-pill.sfw {
  background: rgb(var(--accent-green-rgb) / 0.2);
  color: var(--accent-green);
  border: 1px solid rgb(var(--accent-green-rgb) / 0.3);
}

.content-pill.nsfw {
  background: rgba(255, 107, 107, 0.2);
  color: var(--danger);
  border: 1px solid rgba(255, 107, 107, 0.3);
}

/* Адаптивность */
@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .filter-btn {
    justify-content: space-between;
    width: 100%;
  }

  .dropdown-content {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    max-width: 400px;
    max-height: 70vh;
  }

  .clear-all-btn {
    margin-left: 0;
    justify-content: center;
  }

  .active-filter-pills {
    justify-content: center;
  }
}

/* ===================================================
   АНИМАЦИИ ДРОПДАУНОВ
   =================================================== */

/* Открытие/закрытие дропдауна */
.ft-dropdown-enter-active {
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.ft-dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.ft-dropdown-enter-from {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
.ft-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

/* Панель активных фильтров */
.ft-filters-panel-enter-active {
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              max-height 0.3s ease;
  overflow: hidden;
}
.ft-filters-panel-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease,
              max-height 0.25s ease;
  overflow: hidden;
}
.ft-filters-panel-enter-from {
  opacity: 0;
  transform: translateY(-8px);
  max-height: 0;
}
.ft-filters-panel-enter-to {
  max-height: 200px;
}
.ft-filters-panel-leave-to {
  opacity: 0;
  transform: translateY(-4px);
  max-height: 0;
}
</style>