/**
 * Composable для управления фильтрами галереи
 * Централизованная логика фильтрации и состояния
 */

import { ref, computed } from 'vue'

export function useGalleryFilters() {
  // Состояние фильтров
  const searchQuery = ref('')
  const selectedTags = ref([])
  const selectedArtists = ref([])
  const selectedCharacters = ref([])
  const currentSort = ref('newest')
  const currentContentFilter = ref('all') // all, sfw, nsfw

  // NSFW настройки
  const showNsfwContent = ref(false)
  const viewedNsfwArts = ref([])

  // Debounce таймер
  let filterTimeout = null
  const DEBOUNCE_DELAY = 300

  /**
   * Проверка наличия активных фильтров
   */
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

  /**
   * Количество активных фильтров
   */
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

  /**
   * Сброс всех фильтров
   */
  const clearFilters = () => {
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
  }

  /**
   * Применить фильтры с debounce
   */
  const debouncedApplyFilters = (callback) => {
    if (filterTimeout) clearTimeout(filterTimeout)

    filterTimeout = setTimeout(() => {
      callback()
    }, DEBOUNCE_DELAY)
  }

  /**
   * Загрузить настройки из localStorage
   */
  const loadSettings = () => {
    const savedNsfwSetting = localStorage.getItem('gallery_show_nsfw')
    if (savedNsfwSetting === 'true') {
      showNsfwContent.value = true
    }

    const savedContentFilter = localStorage.getItem('gallery_content_filter')
    if (savedContentFilter && ['all', 'sfw', 'nsfw'].includes(savedContentFilter)) {
      currentContentFilter.value = savedContentFilter
    }
  }

  /**
   * Сохранить настройки в localStorage
   */
  const saveSettings = () => {
    localStorage.setItem('gallery_show_nsfw', showNsfwContent.value ? 'true' : 'false')
    localStorage.setItem('gallery_content_filter', currentContentFilter.value)
  }

  /**
   * Переключить NSFW контент
   */
  const toggleNsfwContent = () => {
    showNsfwContent.value = !showNsfwContent.value
    saveSettings()
  }

  /**
   * Разблокировать просмотр конкретного NSFW арта
   */
  const unlockNsfwArt = (artId) => {
    if (!viewedNsfwArts.value.includes(artId)) {
      viewedNsfwArts.value.push(artId)
    }
  }

  /**
   * Проверка, разблокирован ли NSFW арт
   */
  const isNsfwArtUnlocked = (artId) => {
    return viewedNsfwArts.value.includes(artId)
  }

  /**
   * Очистка debounce таймера
   */
  const cleanup = () => {
    if (filterTimeout) {
      clearTimeout(filterTimeout)
    }
  }

  return {
    // Состояние
    searchQuery,
    selectedTags,
    selectedArtists,
    selectedCharacters,
    currentSort,
    currentContentFilter,
    showNsfwContent,
    viewedNsfwArts,

    // Computed
    hasActiveFilters,
    activeFiltersCount,

    // Методы
    clearFilters,
    debouncedApplyFilters,
    loadSettings,
    saveSettings,
    toggleNsfwContent,
    unlockNsfwArt,
    isNsfwArtUnlocked,
    cleanup
  }
}
