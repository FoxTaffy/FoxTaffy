import { ref } from 'vue'
import { furryApi } from '@/config/supabase.js'

let catalog = null // один запрос на сессию для всех страниц персонажей

const loadCatalog = () => {
  catalog ??= furryApi
    .getFurryArts({ showNsfw: false, limit: 500, sort: 'newest' })
    .catch((error) => {
      catalog = null
      throw error
    })
  return catalog
}

/**
 * Арты персонажа: по имени среди персонажей арта или по тегу.
 * Фильтр клиентский: getFurryArts применяет персонажей/теги уже после limit.
 * Если ничего не найдено или запрос упал — подставляем fallback.
 */
export function useCharacterArts(name, fallback = []) {
  const arts = ref([])
  const loading = ref(true)
  const isFallback = ref(false)

  const load = async () => {
    const needle = name.toLowerCase()
    try {
      const all = await loadCatalog()
      const found = all
        .filter((art) =>
          art.characters?.some((c) => c.name?.toLowerCase().includes(needle)) ||
          art.tags?.some((t) => t.toLowerCase() === needle))
        .map((art) => ({
          src: art.thumbnail_url || art.image_url,
          full: art.image_url,
          title: art.title || 'Без названия',
          sub: art.artist_name
        }))
      isFallback.value = found.length === 0
      arts.value = isFallback.value ? fallback : found
    } catch (error) {
      console.error(`Не удалось загрузить арты «${name}»:`, error)
      isFallback.value = true
      arts.value = fallback
    } finally {
      loading.value = false
    }
  }

  return { arts, loading, isFallback, load }
}
