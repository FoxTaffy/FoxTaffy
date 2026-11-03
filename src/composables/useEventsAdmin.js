import { computed, reactive, ref } from 'vue'
import { furryApi } from '@/config/supabase.js'
import { SORTS, STATUS_FILTERS } from '@/composables/useEventsCatalog.js'
import { eventCompleteness, isReviewMissing, isUpcoming } from '@/utils/eventUtils.js'
import { buildSearchableText, matchesFuzzySearch } from '@/utils/searchUtils.js'

const EVENT_LIMIT = 500

/** Список мероприятий админки: один запрос, фильтры и статистика считаются на клиенте из одного источника. */
export function useEventsAdmin(notify) {
  const events = ref([])
  const loading = ref(true)
  const error = ref('')
  const state = reactive({ q: '', filter: 'all', sort: 'date_desc' })

  async function load({ silent = false } = {}) {
    if (!silent) loading.value = true
    error.value = ''
    try {
      events.value = (await furryApi.getEvents({ status: 'all', limit: EVENT_LIMIT, sort: 'date_desc' })) || []
    } catch (err) {
      error.value = err.message || 'Не удалось загрузить мероприятия'
    } finally {
      loading.value = false
    }
  }

  const stats = computed(() => {
    const upcoming = events.value.filter(isUpcoming).length
    return { total: events.value.length, upcoming, completed: events.value.length - upcoming }
  })

  const needReview = computed(() => events.value.filter(isReviewMissing))
  const completeness = computed(() => new Map(events.value.map(event => [event.id, eventCompleteness(event)])))
  const averageCompleteness = computed(() => {
    const scores = [...completeness.value.values()].map(item => item.score)
    return scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 100
  })

  const tabs = computed(() => Object.entries(STATUS_FILTERS).map(([key, filter]) => ({
    key, label: filter.label, icon: filter.icon, count: events.value.filter(filter.test).length
  })))

  const filtered = computed(() => events.value
    .filter(event => STATUS_FILTERS[state.filter].test(event) && matchesFuzzySearch(
      state.q, buildSearchableText(event.name, event.subtitle, event.city, event.location)))
    .sort(SORTS[state.sort].compare))

  async function remove(event) {
    try {
      await furryApi.deleteEvent(event.id)
      await load({ silent: true })
      notify(`Мероприятие «${event.name}» удалено`, 'success')
      return true
    } catch (err) {
      notify(`Ошибка удаления: ${err.message}`, 'error')
      return false
    }
  }

  return { events, loading, error, state, stats, needReview, completeness, averageCompleteness, tabs, filtered, load, remove, SORTS }
}
