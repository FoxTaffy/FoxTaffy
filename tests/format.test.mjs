import assert from 'node:assert/strict'
import { pluralize, elapsedYearsMonths, ageFrom } from '../src/utils/format.js'

const years = ['год', 'года', 'лет']
assert.equal(pluralize(1, years), 'год')
assert.equal(pluralize(2, years), 'года')
assert.equal(pluralize(5, years), 'лет')
assert.equal(pluralize(11, years), 'лет')
assert.equal(pluralize(21, years), 'год')
assert.equal(pluralize(112, years), 'лет')

// до дня месяца полный месяц ещё не прошёл
assert.deepEqual(elapsedYearsMonths(new Date(2020, 6, 27), new Date(2025, 7, 26)), { years: 5, months: 0 })
assert.deepEqual(elapsedYearsMonths(new Date(2020, 6, 27), new Date(2025, 7, 27)), { years: 5, months: 1 })
assert.equal(ageFrom(new Date(2004, 7, 2), new Date(2025, 7, 1)), 20)
assert.equal(ageFrom(new Date(2004, 7, 2), new Date(2025, 7, 2)), 21)

console.log('format test ok')
