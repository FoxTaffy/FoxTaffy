import { computed, reactive, ref, toRaw } from 'vue'
import { furryApi } from '@/config/supabase.js'
import { RATING_CATEGORIES, isUpcoming, parseAttendance, ratingCategoriesFor, slugify, toDateInput } from '@/utils/eventUtils.js'

export const EVENT_FORM_KEY = Symbol('eventForm')

export const MAIN_STATUSES = ['planning', 'registered', 'ticket_purchased', 'attended', 'missed', 'cancelled']
export const ROLE_STATUSES = ['vip', 'sponsor', 'volunteer']
const SLUG_RE = /^[a-z0-9-]+$/

export const emptyEventForm = () => ({
  id: null,
  name: '', slug: '', subtitle: '', description: '',
  event_date: '', event_end_date: '', announced_date: '',
  event_type: 'convention',
  attendance_status: 'planning', attendance_roles: [],
  location: '', city: '', country: '', official_website: '',
  meta_image: '', avatar_url: '',
  expected_visitors: null, attendees_count: null,
  has_dealers_den: false, has_art_show: false, has_fursuit_parade: false,
  review_completed: false, my_review: '', pros: [], cons_text: [],
  rating_organization: null, rating_program: null, rating_atmosphere: null,
  rating_location: null, rating_participants: null, rating_food: null,
  purchases_summary: '', purchase_items: [],
  photos_folder: ''
})

// Поля, которые формируют карточку-«шаблон» при дублировании: без дат, оценок и фото
const TEMPLATE_FIELDS = [
  'name', 'subtitle', 'description', 'event_type', 'location', 'city', 'country', 'official_website',
  'expected_visitors', 'has_dealers_den', 'has_art_show', 'has_fursuit_parade'
]

const numberOrNull = (value) => (value === '' || value === null || value === undefined || Number.isNaN(Number(value)) ? null : Number(value))
const nonBlank = (list) => (list || []).map(item => String(item).trim()).filter(Boolean)

function fromEvent(event) {
  const form = emptyEventForm()
  for (const key of Object.keys(form)) {
    if (event[key] !== undefined && event[key] !== null) form[key] = event[key]
  }
  const attendance = parseAttendance(event.attendance_status)
  Object.assign(form, {
    id: event.id,
    event_date: toDateInput(event.event_date),
    event_end_date: toDateInput(event.event_end_date),
    announced_date: toDateInput(event.announced_date),
    attendance_status: attendance.find(key => MAIN_STATUSES.includes(key)) || 'planning',
    attendance_roles: attendance.filter(key => ROLE_STATUSES.includes(key)),
    pros: [...(event.pros || [])],
    cons_text: [...(event.cons_text || [])],
    purchase_items: []
  })
  return form
}

export function useEventForm(notify) {
  const open = ref(false)
  const form = reactive(emptyEventForm())
  const photos = ref([])      // уже сохранённые (есть id) и загруженные, но ещё не записанные в БД (isNew)
  const removedPhotoIds = ref([])
  const step = ref('main')
  const saving = ref(false)
  const loading = ref(false)
  const uploading = ref(false)
  const progress = ref(0)
  const baseline = ref('')

  const isPast = computed(() => !!form.event_date && !isUpcoming({ event_date: form.event_date, event_end_date: form.event_end_date }))
  const basicsValid = computed(() => form.name.trim().length >= 3 && !!form.event_date)
  const rangeValid = computed(() => !form.event_end_date || form.event_end_date >= form.event_date)
  const autoSlug = computed(() => slugify(form.name))
  const slugValid = computed(() => !form.slug || SLUG_RE.test(form.slug))
  const valid = computed(() => basicsValid.value && rangeValid.value && slugValid.value)

  const steps = computed(() => [
    { id: 'main', title: 'Основное' },
    { id: 'place', title: 'Место и масштаб' },
    ...(isPast.value ? [{ id: 'review', title: 'Отзыв' }] : []),
    { id: 'purchases', title: 'Покупки' },
    { id: 'gallery', title: 'Фото' }
  ])
  const stepIndex = computed(() => steps.value.findIndex(item => item.id === step.value))

  const ratingCategories = computed(() => ratingCategoriesFor(form.event_type))
  const overall = computed(() => {
    const values = ratingCategories.value.map(category => Number(form[category.key])).filter(value => value > 0)
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
  })

  const signature = computed(() => JSON.stringify([form, photos.value.map(photo => photo.id || photo.image_url), removedPhotoIds.value]))
  const dirty = computed(() => open.value && signature.value !== baseline.value)

  // Папка файлов события; после первой загрузки её фиксируем, иначе правка названия/slug «разъединит» файлы
  const folder = computed(() => form.photos_folder || form.slug || autoSlug.value || 'temp')
  const lockFolder = () => { if (!form.photos_folder) form.photos_folder = folder.value }

  function begin(next, nextPhotos = []) {
    Object.assign(form, emptyEventForm(), next)
    photos.value = nextPhotos
    removedPhotoIds.value = []
    step.value = 'main'
    open.value = true
    baseline.value = signature.value
  }

  async function openFor(event = null, startStep = 'main') {
    if (!event) return begin({})
    // Сначала открываем окно с данными события, докачиваем покупки и фото
    begin(fromEvent(event))
    step.value = startStep
    loading.value = true
    try {
      const [purchases, savedPhotos] = await Promise.all([furryApi.getEventPurchases(event.id), furryApi.getEventPhotos(event.id)])
      form.purchase_items = purchases.map(item => ({ name: item.item_name, price: numberOrNull(item.price), image: item.image_url || '' }))
      photos.value = savedPhotos
      baseline.value = signature.value
    } catch (err) {
      notify(`Не удалось загрузить покупки и фото: ${err.message}`, 'error')
    } finally {
      loading.value = false
    }
  }

  function openCopy(event) {
    const template = Object.fromEntries(TEMPLATE_FIELDS.map(key => [key, event[key] ?? emptyEventForm()[key]]))
    template.name = `${event.name} (копия)`
    begin(template)
  }

  function buildPayload() {
    const payload = { ...toRaw(form) }
    payload.slug = payload.slug || autoSlug.value || `event-${Date.now()}`
    payload.photos_folder = payload.photos_folder || folder.value
    payload.attendance_status = JSON.stringify({ status: payload.attendance_status || 'planning', roles: payload.attendance_roles })
    payload.pros = nonBlank(payload.pros)
    payload.cons_text = nonBlank(payload.cons_text)
    payload.expected_visitors = numberOrNull(payload.expected_visitors)
    payload.attendees_count = numberOrNull(payload.attendees_count)
    // Оценки категорий, которых у этого типа нет, не должны попадать в средний рейтинг на сайте
    RATING_CATEGORIES.forEach(({ key }) => {
      if (!ratingCategories.value.some(category => category.key === key)) payload[key] = null
    })
    delete payload.attendance_roles
    delete payload.purchase_items
    // Пустые строки → null: в БД не должно быть '' вместо отсутствующего значения
    for (const key of Object.keys(payload)) {
      if (typeof payload[key] === 'string' && !payload[key].trim()) payload[key] = null
    }
    return payload
  }

  async function save() {
    if (!valid.value || saving.value) return null
    saving.value = true
    try {
      const payload = buildPayload()
      const saved = form.id ? await furryApi.updateEvent(form.id, payload) : await furryApi.createEvent(payload)
      // Сразу запоминаем id: если шаги ниже упадут, повторное сохранение обновит событие, а не создаст копию
      form.id = saved.id
      Object.assign(form, { slug: saved.slug, photos_folder: saved.photos_folder || form.photos_folder })

      const purchases = form.purchase_items.filter(item => item.name.trim())
      await furryApi.saveEventPurchases(saved.id, purchases.map(item => ({ ...item, price: item.price ?? 0 })))

      for (const id of removedPhotoIds.value) await furryApi.deleteEventPhoto(id)
      const fresh = photos.value.filter(photo => photo.isNew)
      if (fresh.length) await furryApi.saveEventPhotos(saved.id, fresh)

      open.value = false
      photos.value = []
      return saved
    } catch (err) {
      notify(`Ошибка сохранения: ${err.message}`, 'error')
      return null
    } finally {
      saving.value = false
    }
  }

  async function uploadPhotos(files) {
    const list = [...files].filter(file => file.type.startsWith('image/'))
    if (!list.length || uploading.value) return
    if (!form.name.trim()) {
      notify('Сначала укажите название мероприятия', 'warning')
      return
    }
    uploading.value = true
    progress.value = 0
    try {
      const { s3Api } = await import('@/config/s3.js')
      lockFolder()
      const results = await s3Api.uploadEventPhotos(list, { photos_folder: folder.value }, (total) => { progress.value = total })
      photos.value = [...photos.value, ...results.map(result => ({ ...result, isNew: true }))]
      notify(`Загружено фото: ${results.length}. Они сохранятся вместе с мероприятием`, 'success')
    } catch (err) {
      notify(`Ошибка загрузки: ${err.message}`, 'error')
    } finally {
      uploading.value = false
      progress.value = 0
    }
  }

  async function dropFiles(files) {
    const { s3Api } = await import('@/config/s3.js')
    await Promise.allSettled(files.map(path => s3Api.deleteFile(path)))
  }

  function removePhoto(photo) {
    photos.value = photos.value.filter(item => item !== photo)
    if (photo.id) removedPhotoIds.value = [...removedPhotoIds.value, photo.id]
    else dropFiles([photo.file_path, photo.thumbnail_path].filter(Boolean))
  }

  // Закрытие без сохранения: загруженные, но не записанные файлы удаляем из хранилища
  function close() {
    dropFiles(photos.value.filter(photo => photo.isNew).flatMap(photo => [photo.file_path, photo.thumbnail_path]).filter(Boolean))
    open.value = false
    photos.value = []
  }

  return {
    open, form, photos, step, steps, stepIndex, saving, loading, uploading, progress,
    isPast, basicsValid, rangeValid, slugValid, valid, autoSlug, ratingCategories, overall, dirty,
    folder, lockFolder, openFor, openCopy, save, close, uploadPhotos, removePhoto
  }
}

