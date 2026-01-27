/**
 * Composable для управления лайтбоксом
 * Переиспользуемая логика для просмотра изображений в полноэкранном режиме
 */

import { reactive, computed } from 'vue'

export function useLightbox(arts) {
  const lightbox = reactive({
    visible: false,
    imageUrl: '',
    title: '',
    art: null,
    currentIndex: 0
  })

  const canGoPrevious = computed(() => lightbox.currentIndex > 0)
  const canGoNext = computed(() => lightbox.currentIndex < arts.value.length - 1)

  const openLightbox = (art) => {
    const index = arts.value.findIndex(a => a.id === art.id)
    lightbox.imageUrl = art.image_url
    lightbox.title = art.title
    lightbox.art = art
    lightbox.currentIndex = index
    lightbox.visible = true

    // Блокируем прокрутку страницы
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    lightbox.visible = false
    lightbox.art = null

    // Восстанавливаем прокрутку
    document.body.style.overflow = ''
  }

  const previousArt = () => {
    if (canGoPrevious.value) {
      const prevArt = arts.value[lightbox.currentIndex - 1]
      openLightbox(prevArt)
    }
  }

  const nextArt = () => {
    if (canGoNext.value) {
      const nextArt = arts.value[lightbox.currentIndex + 1]
      openLightbox(nextArt)
    }
  }

  const handleKeyDown = (event) => {
    if (!lightbox.visible) return

    switch (event.key) {
      case 'Escape':
        closeLightbox()
        break
      case 'ArrowLeft':
        previousArt()
        break
      case 'ArrowRight':
        nextArt()
        break
    }
  }

  return {
    lightbox,
    canGoPrevious,
    canGoNext,
    openLightbox,
    closeLightbox,
    previousArt,
    nextArt,
    handleKeyDown
  }
}
