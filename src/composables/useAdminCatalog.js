import { computed, inject, reactive, ref } from 'vue'
import { furryApi } from '@/config/supabase.js'

const ART_LIMIT = 1000

export const KINDS = {
  artist: { label: 'Художник', many: 'Художники', genitive: 'художника', icon: 'fas fa-palette', usage: ['арт', 'арта', 'артов'] },
  tag: { label: 'Тег', many: 'Теги', genitive: 'тег', icon: 'fas fa-tag', usage: ['использование', 'использования', 'использований'] },
  character: { label: 'Персонаж', many: 'Персонажи', genitive: 'персонажа', icon: 'fas fa-paw', usage: ['появление', 'появления', 'появлений'] }
}

// Форма сущности единая (name / avatar_url / is_friend); API ждёт для художника поле nickname
const ENTITY_API = {
  artist: {
    create: f => furryApi.createArtist({ nickname: f.name, avatar_url: f.avatar_url, is_friend: f.is_friend }),
    update: (id, f) => furryApi.updateArtist(id, { nickname: f.name, avatar_url: f.avatar_url, is_friend: f.is_friend }),
    remove: id => furryApi.deleteArtist(id)
  },
  tag: {
    create: f => furryApi.createTag({ name: f.name }),
    update: (id, f) => furryApi.updateTag(id, { name: f.name }),
    remove: id => furryApi.deleteTag(id)
  },
  character: {
    create: f => furryApi.createCharacter({ name: f.name, avatar_url: f.avatar_url }),
    update: (id, f) => furryApi.updateCharacter(id, { name: f.name, avatar_url: f.avatar_url }),
    remove: id => furryApi.deleteCharacter(id)
  }
}

export const CATALOG_KEY = Symbol('adminCatalog')
export const useCatalog = () => inject(CATALOG_KEY)

export const nameKey = (value) => String(value ?? '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
export const isStoredUpload = (url) => !!url && (url.includes('supabase.co/storage') || url.includes('gallery/'))

export const emptyArtForm = () => ({
  title: '', artist: '', imageUrl: '', thumbnailUrl: '', tags: [], characters: [], isNsfw: false, date: ''
})

export const artToForm = (art) => {
  const date = art.upload_date ? new Date(art.upload_date).toISOString().slice(0, 10) : ''
  return {
    title: art.title,
    artist: art.artist_name === 'Неизвестно' ? '' : art.artist_name,
    imageUrl: art.image_url,
    thumbnailUrl: art.thumbnail_url,
    tags: [...art.tags],
    characters: art.characters.map(character => character.name),
    isNsfw: art.is_nsfw,
    date,
    originalDate: date
  }
}

export function useAdminCatalog(notify) {
  const lists = reactive({ artist: [], tag: [], character: [] })
  const arts = ref([])
  const loading = ref(true)
  const error = ref('')
  // Фильтры вкладок живут здесь, чтобы дашборд мог открыть вкладку уже отфильтрованной
  const filters = reactive({ gallery: 'all', artist: 'all', tag: 'all', character: 'all' })

  async function load({ silent = false } = {}) {
    if (!silent) loading.value = true
    error.value = ''
    try {
      const [artists, tags, characters, allArts] = await Promise.all([
        furryApi.getFurryArtists(),
        furryApi.getFurryTags(),
        furryApi.getSpecies(),
        furryApi.getFurryArts({ limit: ART_LIMIT, showNsfw: true, sort: 'newest' })
      ])
      Object.assign(lists, { artist: artists, tag: tags, character: characters })
      arts.value = allArts
    } catch (err) {
      error.value = err.message || 'Не удалось загрузить данные'
      notify(`Ошибка загрузки: ${error.value}`, 'error')
    } finally {
      loading.value = false
    }
  }

  // Выполняет запись, затем тихо перечитывает данные: счётчики и имена в артах всегда актуальны
  async function mutate(task, successMessage) {
    try {
      const result = await task()
      await load({ silent: true })
      if (successMessage) notify(successMessage, 'success')
      return { ok: true, result }
    } catch (err) {
      // 401: сессия истекла — об этом уже сообщает оболочка и показывает форму входа
      if (err.status === 401) return { ok: false }
      const duplicate = /duplicate|unique|уже существует/i.test(err.message)
      notify(duplicate ? 'Такое имя уже занято' : `Ошибка: ${err.message}`, 'error')
      return { ok: false }
    }
  }

  const stats = computed(() => ({
    arts: arts.value.length,
    artists: lists.artist.length,
    tags: lists.tag.length,
    characters: lists.character.length,
    nsfw: arts.value.filter(art => art.is_nsfw).length,
    stored: arts.value.filter(art => isStoredUpload(art.image_url)).length
  }))

  function saveEntity(kind, item, form) {
    const api = ENTITY_API[kind]
    const name = form.name.trim()
    const clash = lists[kind].some(other => other.id !== item?.id && nameKey(other.name) === nameKey(name))
    if (clash) {
      notify(`${KINDS[kind].label} «${name}» уже есть`, 'warning')
      return { ok: false }
    }
    const payload = { ...form, name }
    return mutate(
      () => (item ? api.update(item.id, payload) : api.create(payload)),
      item ? 'Изменения сохранены' : `${KINDS[kind].label} добавлен`
    )
  }

  const removeEntity = (kind, item) =>
    mutate(() => ENTITY_API[kind].remove(item.id), `«${item.name}» удалён`)

  // Создание «на лету» из выпадающего списка: возвращает имя, чтобы выбрать его сразу
  async function quickCreate(kind, name) {
    const { ok } = await saveEntity(kind, null, { name, avatar_url: '', is_friend: false })
    return ok ? name.trim() : null
  }

  async function addArt(form) {
    const data = {
      title: form.title.trim(),
      artist_nickname: form.artist,
      image_url: form.imageUrl.trim(),
      thumbnail_url: form.thumbnailUrl || form.imageUrl.trim(),
      is_nsfw: form.isNsfw
    }
    return mutate(async () => {
      const art = await furryApi.addFurryArt(data)
      const links = await Promise.allSettled([
        form.tags.length ? furryApi.addArtTags(art.id, form.tags) : null,
        form.characters.length ? furryApi.addArtCharacters(art.id, form.characters) : null
      ])
      if (links.some(link => link.status === 'rejected')) notify('Арт добавлен, но теги или персонажи сохранились не полностью', 'warning')
      return art
    }, 'Арт добавлен')
  }

  // Дату отправляем только если её изменили: иначе точное время загрузки подменялось полуночью
  const updateArt = (art, form) => mutate(() => furryApi.updateArt(art.id, {
    title: form.title,
    is_nsfw: form.isNsfw,
    artist_nickname: form.artist,
    tags: form.tags,
    characters: form.characters,
    created_date: form.date && form.date !== form.originalDate ? form.date : undefined
  }), 'Арт обновлён')

  const removeArts = (ids) => mutate(
    () => (ids.length === 1 ? furryApi.deleteArt(ids[0]) : furryApi.deleteArts(ids)),
    ids.length === 1 ? 'Арт удалён' : `Удалено артов: ${ids.length}`
  )
  const setNsfw = (ids, flag) => mutate(() => furryApi.setArtsNsfw(ids, flag), `Обновлено артов: ${ids.length}`)
  const addTag = (ids, tag) => mutate(() => furryApi.addTagToArts(ids, tag), `Тег «${tag}» добавлен к ${ids.length}`)

  return {
    lists, arts, loading, error, filters, stats,
    load, saveEntity, removeEntity, quickCreate, addArt, updateArt, removeArts, setNsfw, addTag
  }
}
