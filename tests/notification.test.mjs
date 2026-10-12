import assert from 'node:assert/strict'
import { useNotifications } from '../src/composables/useNotifications.js'

const notifications = useNotifications()

notifications.showNotification('Тест', 'success', 1000)
assert.equal(notifications.notification.show, true)
assert.equal(notifications.notification.type, 'success')

notifications.closeNotification()
assert.equal(notifications.notification.show, false)
assert.equal(notifications.notification.timeout, null)

console.log('notification test ok')
