import assert from 'node:assert/strict'
import {
  daysUntil, eventCompleteness, isUpcoming, ratingCategoriesFor, slugify, toDateInput
} from '../src/utils/eventUtils.js'

const pad = (n) => String(n).padStart(2, '0')
const day = (shift) => {
  const d = new Date()
  d.setDate(d.getDate() + shift)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Событие «сегодня» ещё не закончилось; вчерашнее — закончилось
assert.equal(isUpcoming({ event_date: day(0) }), true)
assert.equal(isUpcoming({ event_date: day(-1) }), false)
assert.equal(isUpcoming({ event_date: day(1) }), true)
// Многодневное: решает день окончания
assert.equal(isUpcoming({ event_date: day(-1), event_end_date: day(1) }), true)
assert.equal(isUpcoming({ event_date: null }), false)
assert.equal(daysUntil({ event_date: day(0) }), 0)
assert.equal(daysUntil({ event_date: day(3) }), 3)

assert.equal(toDateInput('2025-08-01T00:00:00.000Z'), '2025-08-01')
assert.equal(toDateInput(null), '')

// Slug должен проходить CHECK (slug ~ '^[a-z0-9-]+$') даже для кириллицы
assert.equal(slugify('Фурри Фест VII: «Лето»!'), 'furri-fest-vii-leto')
assert.match(slugify('Привет, мир'), /^[a-z0-9-]+$/)
assert.equal(slugify('!!!'), '')

assert.deepEqual(ratingCategoriesFor('market').map(c => c.key),
  ['rating_organization', 'rating_atmosphere', 'rating_location', 'rating_participants'])
assert.equal(ratingCategoriesFor('convention').length, 6)

const upcoming = eventCompleteness({ event_date: day(5), meta_image: 'x', avatar_url: 'x', description: 'x'.repeat(40), city: 'Москва', official_website: 'https://a.b' })
assert.equal(upcoming.score, 100)
const past = eventCompleteness({ event_date: day(-5) })
assert.ok(past.score < 50 && past.missing.some(item => item.key === 'photos'))

console.log('eventUtils test ok')
