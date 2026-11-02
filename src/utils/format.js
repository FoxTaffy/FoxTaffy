/** Русская плюрализация: pluralize(5, ['год', 'года', 'лет']) → 'лет'. */
export function pluralize(count, [one, few, many]) {
  const mod100 = Math.abs(count) % 100
  const mod10 = mod100 % 10
  if (mod100 > 10 && mod100 < 20) return many
  if (mod10 === 1) return one
  if (mod10 >= 2 && mod10 <= 4) return few
  return many
}

/** Полных лет и месяцев между датами (с учётом дня месяца). */
export function elapsedYearsMonths(from, to = new Date()) {
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth())
  if (to.getDate() < from.getDate()) months--
  months = Math.max(months, 0)
  return { years: Math.floor(months / 12), months: months % 12 }
}

/** Полных лет между датами. */
export function ageFrom(birthDate, today = new Date()) {
  return elapsedYearsMonths(birthDate, today).years
}
