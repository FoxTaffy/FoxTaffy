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
    watch(showNsfw, (newValue, oldValue) => {
      console.log(`👁️ useNsfwToggle watch: ${oldValue} → ${newValue}`)
      localStorage.setItem('foxtaffy_reference_nsfw', newValue ? 'true' : 'false')
      console.log(`💾 useNsfwToggle: сохранено в localStorage: ${newValue}`)
    })

    // Слушаем изменения из других вкладок
    window.addEventListener('storage', (e) => {
      if (e.key === 'foxtaffy_reference_nsfw') {
        showNsfw.value = e.newValue === 'true'
      }
    })
  }

  const toggle = () => {
    const oldValue = showNsfw.value
    showNsfw.value = !showNsfw.value
    console.log(`🔀 useNsfwToggle: toggle вызван, ${oldValue} → ${showNsfw.value}`)
  }

  return {
    showNsfw,
    toggle
  }
}
