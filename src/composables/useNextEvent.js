import { computed, onMounted, ref } from 'vue'
import { furryApi } from '@/config/supabase.js'
import { pluralize } from '@/utils/format'

const MS_PER_DAY = 24 * 60 * 60 * 1000

// Ближайшее предстоящее мероприятие и человекочитаемый отсчёт до него.
// При ошибке или отсутствии событий nextEvent остаётся null — блок просто не показывается.
export function useNextEvent() {
  const nextEvent = ref(null)

  onMounted(async () => {
    try {
      const [event] = await furryApi.getEvents({ status: 'upcoming', sort: 'date_asc', limit: 1 })
      nextEvent.value = event ?? null
    } catch {
      nextEvent.value = null
    }
  })

  const daysLeft = computed(() => {
    if (!nextEvent.value) return null
    const target = new Date(nextEvent.value.event_date)
    const today = new Date()
    const startOf = d => new Date(d.getFullYear(), d.getMonth(), d.getDate())
    return Math.round((startOf(target) - startOf(today)) / MS_PER_DAY)
  })

  const countdownLabel = computed(() => {
    const days = daysLeft.value
    if (days === null || days < 0) return ''
    if (days === 0) return 'Сегодня!'
    if (days === 1) return 'Завтра'
    return `Через ${days} ${pluralize(days, ['день', 'дня', 'дней'])}`
  })

  return { nextEvent, daysLeft, countdownLabel }
}
