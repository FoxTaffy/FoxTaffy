const ADMIN_API_BASE = import.meta.env.VITE_UPLOAD_API_URL || '/upload'

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
    throw new Error(data?.error || 'Ошибка запроса администратора')
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
  const data = await request('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ code })
  })

  if (!data?.ok) {
    throw new Error(data?.error || 'Ошибка авторизации')
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
