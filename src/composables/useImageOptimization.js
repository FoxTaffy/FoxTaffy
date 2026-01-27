/**
 * Composable для оптимизации загрузки изображений
 * Progressive image loading с blur placeholder
 */

import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useImageOptimization() {
  /**
   * Создает blur placeholder для изображения
   */
  const createBlurPlaceholder = (width = 40, height = 40) => {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3CfeColorMatrix values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 100 -1' result='s'/%3E%3CfeFlood x='0' y='0' width='100%25' height='100%25'/%3E%3CfeComposite operator='out' in='s'/%3E%3CfeComposite in2='SourceGraphic'/%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Cimage width='100%25' height='100%25' x='0' y='0' preserveAspectRatio='none' style='filter: url(%23b);' href='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'/%3E%3C/svg%3E`
  }

  /**
   * Hook для ленивой загрузки изображения с IntersectionObserver
   */
  const useLazyImage = (imageRef) => {
    const isLoaded = ref(false)
    const isInView = ref(false)
    let observer = null

    onMounted(() => {
      if (!imageRef.value) return

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              isInView.value = true
              // Останавливаем наблюдение после первого появления
              observer?.unobserve(entry.target)
            }
          })
        },
        {
          rootMargin: '400px', // Загружаем за 400px до видимости (вместо 50px)
          threshold: 0.01
        }
      )

      observer.observe(imageRef.value)
    })

    onBeforeUnmount(() => {
      if (observer && imageRef.value) {
        observer.unobserve(imageRef.value)
      }
    })

    const handleImageLoad = () => {
      isLoaded.value = true
    }

    return {
      isLoaded,
      isInView,
      handleImageLoad
    }
  }

  /**
   * Генерирует srcset для адаптивных изображений
   */
  const generateSrcSet = (baseUrl, sizes = [320, 640, 960, 1280]) => {
    return sizes
      .map(size => `${baseUrl}?w=${size} ${size}w`)
      .join(', ')
  }

  /**
   * Оптимизирует URL изображения (добавляет параметры сжатия)
   */
  const optimizeImageUrl = (url, options = {}) => {
    const {
      width = null,
      quality = 75, // Снижено с 80 до 75 для лучшего сжатия
      format = 'webp'
    } = options

    if (!url) return ''

    // Если это внешний URL, возвращаем как есть
    if (url.startsWith('http') && !url.includes('selstorage.ru')) {
      return url
    }

    // Добавляем параметры оптимизации для наших изображений
    const separator = url.includes('?') ? '&' : '?'
    let optimizedUrl = url

    if (width) {
      optimizedUrl += `${separator}w=${width}`
    }

    return optimizedUrl
  }

  return {
    createBlurPlaceholder,
    useLazyImage,
    generateSrcSet,
    optimizeImageUrl
  }
}
