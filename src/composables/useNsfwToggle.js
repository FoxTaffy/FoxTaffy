/**
 * Общий composable для управления NSFW контентом
 * Синхронизирует состояние между Reference.vue и Gallery.vue
 */

import { ref, watch } from 'vue'

// Глобальное состояние (singleton)
const showNsfw = ref(false)
const isInitialized = ref(false)

export function useNsfwToggle() {
  // Инициализация только один раз
  if (!isInitialized.value) {
    const saved = localStorage.getItem('foxtaffy_reference_nsfw')
    showNsfw.value = saved === 'true'
    isInitialized.value = true

    // Следим за изменениями и сохраняем в localStorage
    watch(showNsfw, (newValue) => {
      localStorage.setItem('foxtaffy_reference_nsfw', newValue ? 'true' : 'false')
    })

    // Слушаем изменения из других вкладок
    window.addEventListener('storage', (e) => {
      if (e.key === 'foxtaffy_reference_nsfw') {
        showNsfw.value = e.newValue === 'true'
      }
    })
  }

  const toggle = () => {
    showNsfw.value = !showNsfw.value
  }

  return {
    showNsfw,
    toggle
  }
}
