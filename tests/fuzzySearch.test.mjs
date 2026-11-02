import assert from 'node:assert/strict'
import { normalizeSearchValue, matchesFuzzySearch } from '../src/utils/searchUtils.js'

assert.equal(normalizeSearchValue('@FoxTaffy'), 'foxtaffy')
assert.equal(normalizeSearchValue('Fox Taffy'), 'foxtaffy')
assert.equal(normalizeSearchValue('foxtaffy'), 'foxtaffy')
assert.equal(normalizeSearchValue('taffy'), 'taffy')

assert.equal(matchesFuzzySearch('@foxtaffy', 'Fox Taffy'), true)
assert.equal(matchesFuzzySearch('@ FoxTaffy', 'FoxTaffy'), true)
assert.equal(matchesFuzzySearch('FoxTaffy', 'foxtaffy'), true)
assert.equal(matchesFuzzySearch('foxtaffy', 'Fox Taffy'), true)
assert.equal(matchesFuzzySearch('taffy', 'FoxTaffy'), true)
assert.equal(matchesFuzzySearch('unknown', 'Fox Taffy'), false)

assert.equal(matchesFuzzySearch('галерея', 'Галерея артов'), true)
assert.equal(matchesFuzzySearch('кон', 'Фурсьют'), false)

console.log('fuzzy search test ok')
