const ADMIN_API_BASE = import.meta.env.VITE_UPLOAD_API_URL || '/upload'

const LOGIN_ERRORS = {
  'Invalid admin code': 'Неверный код доступа',
  'Too many attempts': 'Слишком много попыток входа',
  'Admin auth is not configured': 'Вход не настроен на сервере',
  'Forbidden origin': 'Запрос с недопустимого адреса'
}

const unauthorizedListeners = new Set()

/** Подписка на истёкшую сессию: вызывается, когда любой админ-запрос получил 401. */
export function onAdminUnauthorized(listener) {
  unauthorizedListeners.add(listener)
  return () => unauthorizedListeners.delete(listener)
}

async function parseJson(response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return { error: text }
  }
}

async function request(path, options = {}) {
  const { headers: extraHeaders, ...restOptions } = options
  const response = await fetch(`${ADMIN_API_BASE}${path}`, {
    credentials: 'include',
    ...restOptions,
    headers: {
      ...(restOptions.body ? { 'Content-Type': 'application/json' } : {}),
      ...(extraHeaders || {})
    }
  })

  const data = await parseJson(response)

  if (!response.ok) {
    if (response.status === 401 && path.startsWith('/admin/db/')) {
      unauthorizedListeners.forEach(listener => listener())
    }
    throw Object.assign(new Error(data?.error || 'Ошибка запроса администратора'), {
      status: response.status,
      retryAfter: data?.retryAfter
    })
  }

  return data
}

export async function getAdminSession() {
  try {
    const data = await request('/admin/session')
    return !!data?.authenticated
  } catch {
    return false
  }
}

export async function loginAdmin(code) {
  let data
  try {
    data = await request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ code })
    })
  } catch (error) {
    const base = LOGIN_ERRORS[error.message] || error.message
    const wait = error.retryAfter ? `. Повторите через ${Math.ceil(error.retryAfter / 60)} мин.` : ''
    throw new Error(base + wait)
  }

  if (!data?.ok) {
    throw new Error(LOGIN_ERRORS[data?.error] || data?.error || 'Ошибка авторизации')
  }

  return data
}

export async function logoutAdmin() {
  return request('/admin/logout', {
    method: 'POST'
  })
}

export async function adminApiRequest(path, options = {}) {
  return request(path, options)
}
