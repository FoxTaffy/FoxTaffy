import { onBeforeUnmount, onMounted, ref } from 'vue'
import { getAdminSession, loginAdmin, logoutAdmin, onAdminUnauthorized } from '@/utils/adminAuth.js'

/** Серверная сессия администратора: проверка при открытии, вход, выход и реакция на истёкшую куку. */
export function useAdminSession({ onExpired } = {}) {
  const authenticated = ref(false)
  const checking = ref(true)
  const busy = ref(false)
  const code = ref('')
  const error = ref('')

  async function login() {
    if (busy.value || !code.value.trim()) return
    busy.value = true
    error.value = ''
    try {
      await loginAdmin(code.value.trim())
      authenticated.value = true
    } catch (err) {
      error.value = err.message || 'Ошибка авторизации'
    } finally {
      code.value = ''
      busy.value = false
    }
  }

  async function logout() {
    try {
      await logoutAdmin()
    } catch {
      // сервер недоступен — локальное состояние всё равно сбрасываем
    }
    authenticated.value = false
  }

  const stopListening = onAdminUnauthorized(() => {
    if (!authenticated.value) return
    authenticated.value = false
    onExpired?.()
  })

  onMounted(async () => {
    authenticated.value = await getAdminSession()
    checking.value = false
  })
  onBeforeUnmount(stopListening)

  return { authenticated, checking, busy, code, error, login, logout }
}
