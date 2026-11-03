import { computed } from 'vue'
import { nameKey } from './useAdminCatalog.js'

const MONTHS = 12
const TAB_OF_KIND = { artist: 'artists', tag: 'tags', character: 'characters' }
const byCount = (a, b) => (b.count || 0) - (a.count || 0)

/** Аналитика дашборда: активность, лидеры и «здоровье» каталога — всё из уже загруженных данных. */
export function useCatalogInsights(catalog) {
  const { arts, lists } = catalog

  const activity = computed(() => {
    const counts = new Map()
    arts.value.forEach(art => {
      const date = new Date(art.upload_date)
      if (!Number.isNaN(date.getTime())) {
        const key = `${date.getFullYear()}-${date.getMonth()}`
        counts.set(key, (counts.get(key) || 0) + 1)
      }
    })
    const now = new Date()
    return Array.from({ length: MONTHS }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (MONTHS - 1 - i), 1)
      return {
        label: date.toLocaleDateString('ru-RU', { month: 'short' }),
        count: counts.get(`${date.getFullYear()}-${date.getMonth()}`) || 0
      }
    })
  })

  const lastMonth = computed(() => activity.value.at(-1).count)
  const topArtists = computed(() => [...lists.artist].sort(byCount).slice(0, 5))
  const popularTags = computed(() => [...lists.tag].sort(byCount).slice(0, 12))
  const recentArts = computed(() => arts.value.slice(0, 6))

  // Имена, отличающиеся только регистром/знаками («Fox_Taffy» и «fox taffy»), — вероятные дубли
  const duplicates = computed(() => {
    const result = {}
    for (const kind of ['artist', 'tag', 'character']) {
      const groups = new Map()
      lists[kind].forEach(item => {
        const key = nameKey(item.name)
        groups.set(key, [...(groups.get(key) || []), item.id])
      })
      result[kind] = new Set([...groups.values()].filter(ids => ids.length > 1).flat())
    }
    return result
  })

  const audit = computed(() => {
    const total = arts.value.length
    const untagged = arts.value.filter(art => !art.tags.length).length
    const noCharacters = arts.value.filter(art => !art.characters.length).length
    const unused = (kind) => lists[kind].filter(item => !item.count).length
    const dupes = Object.values(duplicates.value).reduce((sum, ids) => sum + ids.size, 0)
    const dupeKind = Object.keys(duplicates.value).find(kind => duplicates.value[kind].size) || 'artist'

    const issues = [
      { key: 'untagged', icon: 'fas fa-tags', text: 'артов без тегов', count: untagged, tab: 'gallery', filter: 'untagged' },
      { key: 'no-characters', icon: 'fas fa-paw', text: 'артов без персонажей', count: noCharacters, tab: 'gallery', filter: 'no-characters' },
      { key: 'idle-artists', icon: 'fas fa-palette', text: 'художников без артов', count: unused('artist'), tab: 'artists', filter: 'unused' },
      { key: 'idle-tags', icon: 'fas fa-tag', text: 'неиспользуемых тегов', count: unused('tag'), tab: 'tags', filter: 'unused' },
      { key: 'idle-characters', icon: 'fas fa-paw', text: 'персонажей без артов', count: unused('character'), tab: 'characters', filter: 'unused' },
      { key: 'duplicates', icon: 'fas fa-copy', text: 'записей с похожими именами', count: dupes, tab: TAB_OF_KIND[dupeKind], filter: 'duplicates' }
    ].filter(issue => issue.count > 0)

    const complete = arts.value.filter(art => art.tags.length && art.characters.length).length
    return { issues, health: total ? Math.round((complete / total) * 100) : 100 }
  })

  return { activity, lastMonth, topArtists, popularTags, recentArts, duplicates, audit }
}
