import { pluralize } from './format.js'

const DAY_MS = 86_400_000
const COUNTDOWN_WINDOW_DAYS = 90
const MONTHS = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК']
const RATING_KEYS = [
  'rating_organization', 'rating_program', 'rating_atmosphere',
  'rating_location', 'rating_participants', 'rating_food'
]

// label — множественное (вкладки каталога), single — единственное (формы и бейджи)
export const EVENT_TYPES = {
  convention: { label: 'Конвенты', single: 'Конвент', icon: 'fas fa-crown' },
  market: { label: 'Маркеты', single: 'Маркет', icon: 'fas fa-store' },
  festival: { label: 'Фестивали', single: 'Фестиваль', icon: 'fas fa-music' },
  meetup: { label: 'Встречи', single: 'Встреча', icon: 'fas fa-users' },
  party: { label: 'Вечеринки', single: 'Вечеринка', icon: 'fas fa-glass-cheers' },
  workshop: { label: 'Мастер-классы', single: 'Мастер-класс', icon: 'fas fa-tools' },
  other: { label: 'Другое', single: 'Другое', icon: 'fas fa-calendar' }
}

export const RATING_CATEGORIES = [
  { key: 'rating_organization', label: 'Организация' },
  { key: 'rating_program', label: 'Программа' },
  { key: 'rating_atmosphere', label: 'Атмосфера' },
  { key: 'rating_location', label: 'Локация' },
  { key: 'rating_participants', label: 'Участники' },
  { key: 'rating_food', label: 'Питание' }
]

// Каких оценок у типа мероприятия нет по определению (у маркета нет программы и общепита и т.д.)
const UNRATED = {
  market: ['rating_program', 'rating_food'],
  meetup: ['rating_program', 'rating_food'],
  festival: ['rating_food'],
  party: ['rating_program']
}

export const ratingCategoriesFor = (type) =>
  RATING_CATEGORIES.filter(category => !UNRATED[type]?.includes(category.key))

export const ATTENDANCE = {
  planning: { label: 'Планирую', icon: 'fas fa-clock', tone: 'muted' },
  registered: { label: 'Зарегистрирован', icon: 'fas fa-check-circle', tone: 'success' },
  ticket_purchased: { label: 'Билет куплен', icon: 'fas fa-ticket-alt', tone: 'info' },
  vip: { label: 'VIP', icon: 'fas fa-crown', tone: 'gold' },
  sponsor: { label: 'Спонсор', icon: 'fas fa-hand-holding-usd', tone: 'purple' },
  volunteer: { label: 'Волонтёр', icon: 'fas fa-hands-helping', tone: 'accent' },
  attended: { label: 'Посетил', icon: 'fas fa-star', tone: 'success' },
  missed: { label: 'Пропустил', icon: 'fas fa-times-circle', tone: 'danger' },
  cancelled: { label: 'Отменено', icon: 'fas fa-ban', tone: 'muted' }
}

const DEFAULT_DESCRIPTIONS = {
  convention: 'Конвент, который мы создаём так, как сами хотели бы его посетить.',
  meetup: 'Встреча фурри-сообщества для общения и новых знакомств.',
  festival: 'Фестиваль с насыщенной программой и яркими впечатлениями.',
  market: 'Маркет товаров и услуг для фурри-сообщества.'
}

const toDate = (value) => {
  if (value === null || value === undefined || value === '') return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

// Дата без времени ('2025-08-01' или ISO) → полночь по местному времени: иначе UTC-полночь
// «сегодняшнего» события уже в прошлом и оно мгновенно считалось завершённым.
const toLocalDay = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value ?? ''))
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  const date = toDate(value)
  return date && new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

const startOfToday = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

// Событие не закончилось, пока не прошёл его последний день (для многодневных — день окончания)
export const isUpcoming = (event) => {
  const last = toLocalDay(event?.event_end_date) || toLocalDay(event?.event_date)
  return !!last && last >= startOfToday()
}

/** Значение для <input type="date">: YYYY-MM-DD или пустая строка. */
export const toDateInput = (value) => {
  const day = toLocalDay(value)
  if (!day) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`
}

export const eventYear = (event) => toDate(event?.event_date)?.getFullYear() ?? null

export const dateParts = (value) => {
  const date = toDate(value)
  return date
    ? { month: MONTHS[date.getMonth()], day: date.getDate(), year: date.getFullYear() }
    : { month: '—', day: '—', year: '' }
}

export function formatDateRange(start, end) {
  const from = toDate(start)
  const to = toDate(end)
  if (!from || !to) return ''
  const fromLabel = `${from.getDate()} ${MONTHS[from.getMonth()]}`
  const toLabel = `${to.getDate()} ${MONTHS[to.getMonth()]}`
  return from.getMonth() === to.getMonth()
    ? `${from.getDate()}–${to.getDate()} ${MONTHS[from.getMonth()]}`
    : `${fromLabel} – ${toLabel}`
}

export function overallRating(event) {
  const values = RATING_KEYS.map(key => Number(event?.[key])).filter(value => value > 0)
  if (values.length) {
    return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10
  }
  return Number(event?.my_rating) || 0
}

// Прошедшее событие без обзора: review_completed приоритетнее, иначе смотрим на наличие оценок
export function isReviewMissing(event) {
  if (isUpcoming(event)) return false
  if (event.review_completed !== undefined && event.review_completed !== null) {
    return event.review_completed === false
  }
  return overallRating(event) === 0
}

export function daysUntil(event) {
  const day = toLocalDay(event?.event_date)
  return day ? Math.round((day - startOfToday()) / DAY_MS) : null
}

export function countdownLabel(event) {
  const days = daysUntil(event)
  if (days === null) return 'Скоро'
  if (days <= 0) return 'Сегодня!'
  return `${days} ${pluralize(days, ['день', 'дня', 'дней'])}`
}

export function countdownProgress(event) {
  const days = daysUntil(event)
  if (days === null) return 0
  return Math.max(0, Math.min(100, ((COUNTDOWN_WINDOW_DAYS - days) / COUNTDOWN_WINDOW_DAYS) * 100))
}

export function photosLabel(count) {
  return `${count} ${pluralize(count, ['фотография', 'фотографии', 'фотографий'])}`
}

export function eventDescription(event, maxLength = 110) {
  const text = (event.short_description || event.description || '').trim()
    || DEFAULT_DESCRIPTIONS[event.event_type]
    || 'Интересное мероприятие для нашего сообщества.'
  return text.length > maxLength ? `${text.slice(0, maxLength).replace(/\s+\S*$/, '')}…` : text
}

// Форматы: 'attended' | '["vip","volunteer"]' | '{"status":"attended","roles":["vip"]}' | массив
export function parseAttendance(raw) {
  if (!raw) return []
  let value = raw
  if (typeof raw === 'string') {
    try { value = JSON.parse(raw) } catch { value = raw }
  }
  const list = Array.isArray(value)
    ? value
    : value && typeof value === 'object'
      ? [value.status, ...(Array.isArray(value.roles) ? value.roles : [])]
      : [value]
  return [...new Set(list.filter(item => typeof item === 'string' && item in ATTENDANCE))]
}

// Только http(s): защита от javascript:/data: в полях, которые редактируются из админки
export function safeHttpUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

const safeImageUrl = (value) =>
  typeof value === 'string' && /^\/(?!\/)/.test(value) ? value : safeHttpUrl(value)

export const eventImage = (event) =>
  [event.logo_url, event.avatar_url, event.image_url].map(safeImageUrl).find(Boolean) || null

export function buildIcs(event) {
  const start = toDate(event.event_date)
  if (!start) return null
  const end = toDate(event.event_end_date) || start
  const day = (date, shift = 0) =>
    new Date(date.getTime() + shift * DAY_MS).toISOString().slice(0, 10).replaceAll('-', '')
  const escape = (text = '') => String(text).replace(/[\\;,]/g, '\\$&').replace(/\r?\n/g, '\\n')
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//foxtaffy.gay//events//RU', 'BEGIN:VEVENT',
    `UID:${event.id}@foxtaffy.gay`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]|\.\d{3}/g, '')}`,
    `DTSTART;VALUE=DATE:${day(start)}`,
    `DTEND;VALUE=DATE:${day(end, 1)}`,
    `SUMMARY:${escape(event.name)}`,
    `LOCATION:${escape([event.location, event.city].filter(Boolean).join(', '))}`,
    'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n')
}

// Транслитерация для slug: в БД действует CHECK (slug ~ '^[a-z0-9-]+$'), кириллицу она не пропускает
const TRANSLIT = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z', и: 'i', й: 'y',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
  х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya'
}

export function slugify(text, maxLength = 60) {
  return [...String(text ?? '').toLowerCase()]
    .map(char => TRANSLIT[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
    .replace(/-+$/, '')
}

// Что ещё стоит дописать в карточке: step — шаг мастера, куда вести администратора
const COMPLETENESS_CHECKS = [
  { key: 'banner', label: 'Баннер', step: 'main', done: e => !!e.meta_image },
  { key: 'logo', label: 'Лого', step: 'main', done: e => !!e.avatar_url },
  { key: 'description', label: 'Описание', step: 'main', done: e => (e.description || '').trim().length >= 30 },
  { key: 'place', label: 'Место', step: 'place', done: e => !!(e.city || e.location) },
  { key: 'site', label: 'Сайт', step: 'place', upcomingOnly: true, done: e => !!safeHttpUrl(e.official_website) },
  { key: 'ratings', label: 'Оценки', step: 'review', pastOnly: true, done: e => overallRating(e) > 0 },
  { key: 'review', label: 'Отзыв', step: 'review', pastOnly: true, done: e => (e.my_review || '').trim().length > 0 },
  { key: 'photos', label: 'Фото', step: 'gallery', pastOnly: true, done: e => e.photos_count > 0 }
]

export function eventCompleteness(event) {
  const past = !isUpcoming(event)
  const checks = COMPLETENESS_CHECKS.filter(check => (past ? !check.upcomingOnly : !check.pastOnly))
  const missing = checks.filter(check => !check.done(event))
  return {
    score: Math.round(((checks.length - missing.length) / checks.length) * 100),
    missing
  }
}
