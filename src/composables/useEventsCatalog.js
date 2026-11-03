import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { furryApi } from '@/config/supabase.js'
import { buildSearchableText, matchesFuzzySearch } from '@/utils/searchUtils.js'
import { EVENT_TYPES, eventYear, isUpcoming, overallRating } from '@/utils/eventUtils.js'

export const PAGE_SIZE = 9
const SEARCH_DEBOUNCE_MS = 250
const MAX_QUERY_LENGTH = 80

const byDate = (a, b) => new Date(a.event_date) - new Date(b.event_date)
export const SORTS = {
  date_desc: { label: 'Сначала новые', compare: (a, b) => byDate(b, a) },
  date_asc: { label: 'Сначала старые', compare: byDate },
  rating_desc: { label: 'Лучшие по рейтингу', compare: (a, b) => overallRating(b) - overallRating(a) || byDate(b, a) },
  name_asc: { label: 'По названию А–Я', compare: (a, b) => (a.name || '').localeCompare(b.name || '', 'ru') }
}

export const STATUS_FILTERS = {
  all: { label: 'Все', icon: 'fas fa-calendar-alt', test: () => true },
  upcoming: { label: 'Предстоящие', icon: 'fas fa-clock', test: isUpcoming },
  completed: { label: 'Посещённые', icon: 'fas fa-check-circle', test: event => !isUpcoming(event) }
}

const filterTest = (key) =>
  STATUS_FILTERS[key]?.test ?? (event => event.event_type === key)

const pick = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback)

// Состояние живёт в query-параметрах: ссылку на выборку можно отправить и она откроется так же
export function useEventsCatalog() {
  const route = useRoute()
  const router = useRouter()

  const filterKeys = [...Object.keys(STATUS_FILTERS), ...Object.keys(EVENT_TYPES)]
  const { q, f, s, y, p } = route.query

  const state = reactive({
    q: typeof q === 'string' ? q.slice(0, MAX_QUERY_LENGTH) : '',
    filter: pick(f, filterKeys, 'all'),
    sort: pick(s, Object.keys(SORTS), 'date_desc'),
    year: Number(y) || null,
    page: Math.max(1, parseInt(p, 10) || 1)
  })
  const searchInput = ref(state.q)

  const events = ref([])
  const loading = ref(true)
  const error = ref(null)

  let searchTimer = null
  watch(searchInput, (value) => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => { state.q = value.trim().slice(0, MAX_QUERY_LENGTH) }, SEARCH_DEBOUNCE_MS)
  })
  onBeforeUnmount(() => clearTimeout(searchTimer))

  watch(() => [state.q, state.filter, state.sort, state.year], () => { state.page = 1 })

  watch(state, () => {
    const query = {
      q: state.q || undefined,
      f: state.filter !== 'all' ? state.filter : undefined,
      s: state.sort !== 'date_desc' ? state.sort : undefined,
      y: state.year || undefined,
      p: state.page > 1 ? state.page : undefined
    }
    router.replace({ query })
  })

  const matchesQuery = (event) =>
    matchesFuzzySearch(state.q, buildSearchableText(event.name, event.subtitle, event.city, event.location))

  const filtered = computed(() => {
    const test = filterTest(state.filter)
    return events.value
      .filter(event => test(event) && (!state.year || eventYear(event) === state.year) && matchesQuery(event))
      .sort(SORTS[state.sort].compare)
  })

  const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
  const currentPage = computed(() => Math.min(state.page, totalPages.value))
  const pageItems = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE
    return filtered.value.slice(start, start + PAGE_SIZE)
  })

  const stats = computed(() => {
    const upcoming = events.value.filter(isUpcoming).length
    const rated = events.value.map(overallRating).filter(Boolean)
    return {
      total: events.value.length,
      upcoming,
      completed: events.value.length - upcoming,
      avgRating: rated.length ? rated.reduce((sum, value) => sum + value, 0) / rated.length : 0
    }
  })

  const filterTabs = computed(() => {
    const keys = [
      ...Object.keys(STATUS_FILTERS),
      ...Object.keys(EVENT_TYPES).filter(key => events.value.some(event => event.event_type === key))
    ]
    return keys.map(key => ({
      key,
      label: (STATUS_FILTERS[key] ?? EVENT_TYPES[key]).label,
      icon: (STATUS_FILTERS[key] ?? EVENT_TYPES[key]).icon,
      count: events.value.filter(filterTest(key)).length
    }))
  })

  // Гистограмма по годам — она же быстрый фильтр
  const years = computed(() => {
    const counts = new Map()
    events.value.forEach(event => {
      const year = eventYear(event)
      if (year) counts.set(year, (counts.get(year) || 0) + 1)
    })
    const max = Math.max(1, ...counts.values())
    return [...counts].sort((a, b) => a[0] - b[0]).map(([year, count]) => ({ year, count, share: count / max }))
  })

  const hasActiveFilters = computed(() =>
    !!(state.q || state.year || state.filter !== 'all' || state.sort !== 'date_desc'))

  function reset() {
    searchInput.value = ''
    Object.assign(state, { q: '', filter: 'all', sort: 'date_desc', year: null, page: 1 })
  }

  async function attachPhotoPreviews(list) {
    const ids = list.filter(event => event.photos_count > 0).map(event => event.id)
    if (!ids.length) return list
    const photos = await furryApi.getPhotosForEvents(ids, 5)
    const byEvent = new Map()
    photos.forEach(photo => {
      const group = byEvent.get(photo.con_id) ?? []
      if (group.length < 5) byEvent.set(photo.con_id, [...group, photo])
    })
    return list.map(event => ({ ...event, photoPreviews: byEvent.get(event.id) ?? [] }))
  }

  async function load() {
    loading.value = true
    error.value = null
    try {
      const list = await furryApi.getEvents({ status: 'all', limit: 100, sort: 'date_desc' })
      events.value = await attachPhotoPreviews(list || []).catch(() => list || [])
    } catch {
      error.value = 'Не удалось загрузить мероприятия. Проверьте соединение и попробуйте снова.'
    } finally {
      loading.value = false
    }
  }

  return {
    state, searchInput, events, loading, error,
    filtered, pageItems, totalPages, currentPage,
    stats, filterTabs, years, hasActiveFilters,
    load, reset
  }
}
