/**
 * Утилиты для управления новогодней темой
 * Автоматически включает тему с 1 декабря по 1 февраля
 */

/**
 * Проверяет, находится ли текущая дата в праздничном периоде
 * @returns {boolean} true если период с 1 декабря по 1 февраля (включительно)
 */
export function isHolidaySeason() {
  const now = new Date()
  const month = now.getMonth() + 1 // getMonth() возвращает 0-11
  const day = now.getDate()

  // Декабрь (месяц 12)
  if (month === 12) {
    return true
  }

  // Январь до 1 февраля включительно (месяц 1, день <= 1 февраля)
  if (month === 1) {
    return true
  }

  // 1 февраля (месяц 2, день 1)
  if (month === 2 && day === 1) {
    return true
  }

  return false
}

/**
 * Включает праздничную тему
 */
export function enableHolidayTheme() {
  if (typeof document !== 'undefined') {
    document.body.classList.add('holiday-theme')

    // Импортируем праздничные стили
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = '/src/holiday-theme.css'
    link.id = 'holiday-theme-styles'

    // Проверяем, что стили еще не добавлены
    if (!document.getElementById('holiday-theme-styles')) {
      document.head.appendChild(link)
    }
  }
}

/**
 * Отключает праздничную тему
 */
export function disableHolidayTheme() {
  if (typeof document !== 'undefined') {
    document.body.classList.remove('holiday-theme')

    // Удаляем праздничные стили
    const link = document.getElementById('holiday-theme-styles')
    if (link) {
      link.remove()
    }
  }
}

/**
 * Автоматически включает/выключает праздничную тему в зависимости от даты
 */
export function applyHolidayTheme() {
  if (isHolidaySeason()) {
    enableHolidayTheme()
  } else {
    disableHolidayTheme()
  }
}

/**
 * Создает снежинки для анимации
 * @param {number} count - количество снежинок (по умолчанию 20)
 */
export function createSnowflakes(count = 20) {
  if (typeof document === 'undefined' || !isHolidaySeason()) {
    return
  }

  // Удаляем существующие снежинки, если они есть
  const existingContainer = document.querySelector('.snowflakes')
  if (existingContainer) {
    existingContainer.remove()
  }

  // Создаем контейнер для снежинок
  const container = document.createElement('div')
  container.className = 'snowflakes'
  container.setAttribute('aria-hidden', 'true')

  // Создаем снежинки
  for (let i = 0; i < count; i++) {
    const snowflake = document.createElement('div')
    snowflake.className = 'snowflake'
    snowflake.textContent = '❄'
    container.appendChild(snowflake)
  }

  // Добавляем контейнер в body
  document.body.appendChild(container)
}

/**
 * Удаляет снежинки
 */
export function removeSnowflakes() {
  if (typeof document !== 'undefined') {
    const container = document.querySelector('.snowflakes')
    if (container) {
      container.remove()
    }
  }
}

/**
 * Инициализирует праздничную тему
 * Вызывается при загрузке приложения
 */
export function initHolidayTheme() {
  applyHolidayTheme()

  if (isHolidaySeason()) {
    // Добавляем снежинки с небольшой задержкой для лучшей производительности
    setTimeout(() => {
      createSnowflakes(20)
    }, 500)
  }
}

/**
 * Композабл для Vue компонентов
 * Использование: const { isHoliday } = useHolidayTheme()
 */
export function useHolidayTheme() {
  return {
    isHoliday: isHolidaySeason(),
    enableTheme: enableHolidayTheme,
    disableTheme: disableHolidayTheme,
    createSnowflakes,
    removeSnowflakes
  }
}
