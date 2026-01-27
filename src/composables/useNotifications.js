/**
 * Composable для управления уведомлениями
 * Переиспользуемая логика для показа toast-уведомлений
 */

import { reactive } from 'vue'

export function useNotifications() {
  const notification = reactive({
    show: false,
    message: '',
    type: 'info', // info, success, error, warning
    timeout: null
  })

  const showNotification = (message, type = 'info', duration = 3000) => {
    // Очищаем предыдущий таймаут если есть
    if (notification.timeout) {
      clearTimeout(notification.timeout)
    }

    notification.message = message
    notification.type = type
    notification.show = true

    notification.timeout = setTimeout(() => {
      notification.show = false
    }, duration)
  }

  const closeNotification = () => {
    if (notification.timeout) {
      clearTimeout(notification.timeout)
    }
    notification.show = false
  }

  const getNotificationEmoji = () => {
    switch (notification.type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      default: return 'ℹ️'
    }
  }

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'success': return 'fas fa-check-circle'
      case 'error': return 'fas fa-exclamation-circle'
      case 'warning': return 'fas fa-exclamation-triangle'
      default: return 'fas fa-info-circle'
    }
  }

  return {
    notification,
    showNotification,
    closeNotification,
    getNotificationEmoji,
    getNotificationIcon
  }
}
