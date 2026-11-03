import { reactive } from 'vue'

const DURATION_MS = { error: 7000 }

/** Единое состояние тоста админки: рисует его AdminShell, показывать можно откуда угодно. */
export const toast = reactive({ show: false, id: 0, message: '', type: 'info' })

let timer = null

export function hideToast() {
  clearTimeout(timer)
  toast.show = false
}

export function notify(message, type = 'info') {
  clearTimeout(timer)
  Object.assign(toast, { show: true, id: toast.id + 1, message, type })
  timer = setTimeout(hideToast, DURATION_MS[type] ?? 3500)
}

export const useAdminNotify = () => notify
