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

  const hideNotification = () => {
    if (notification.timeout) {
      clearTimeout(notification.timeout)
      notification.timeout = null
    }
    notification.show = false
  }

  const showNotification = (message, type = 'info', duration = 3000) => {
    hideNotification()

    notification.message = message
    notification.type = type
    notification.show = true

    notification.timeout = setTimeout(() => {
      hideNotification()
    }, duration)
  }

  const closeNotification = () => {
    hideNotification()
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
