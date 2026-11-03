import { onMounted, onBeforeUnmount } from 'vue'

/**
 * Добавляет className элементам selector, когда они попадают в видимую область.
 * Динамически появившиеся элементы подхватываются вызовом scan().
 */
export function useReveal({ selector = '.reveal', className = 'is-visible' } = {}) {
  let observer = null

  const scan = () => {
    document.querySelectorAll(`${selector}:not(.${className})`).forEach((el) => {
      if (observer) observer.observe(el)
      else el.classList.add(className)
    })
  }

  onMounted(() => {
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add(className)
          observer.unobserve(entry.target)
        })
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })
    }
    scan()
  })

  onBeforeUnmount(() => observer?.disconnect())

  return { scan }
}
