export const normalizeSearchValue = (value = '') => {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[@#_]/g, '')
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
}

export const matchesFuzzySearch = (searchTerm = '', candidateValue = '') => {
  const normalizedSearch = normalizeSearchValue(searchTerm)
  if (!normalizedSearch) return true

  const normalizedCandidate = normalizeSearchValue(candidateValue)
  if (!normalizedCandidate) return false

  return normalizedCandidate.includes(normalizedSearch) || normalizedSearch.includes(normalizedCandidate)
}

export const buildSearchableText = (...values) => {
  return values
    .filter(value => value !== null && value !== undefined && value !== '')
    .map(value => String(value))
    .join(' ')
}
