// ================================================
// FOXTAFFY.GAY — Upload + Admin API
// Безопасная загрузка файлов и серверная админ-аутентификация
// ================================================

import crypto from 'node:crypto'
import express from 'express'
import cors from 'cors'
import busboy from 'busboy'
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadBucketCommand
} from '@aws-sdk/client-s3'

const app = express()
app.set('trust proxy', 1)
const PORT = process.env.PORT || 3002

const s3 = new S3Client({
  endpoint: `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}`,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || 'admin',
    secretAccessKey: process.env.MINIO_SECRET_KEY || 'changeme'
  },
  forcePathStyle: true
})

const normalizeAdminCode = (value) => {
  let s = String(value ?? '').normalize('NFC').trim()
  if (s.length >= 2 && s[0] === s[s.length - 1] && (s[0] === '"' || s[0] === "'")) {
    s = s.slice(1, -1)
  }
  return s.trim()
}

const PUBLIC_URL = process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'
const API_KEY = process.env.UPLOAD_API_KEY || ''
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*'
const ADMIN_SECRET_CODE = normalizeAdminCode(process.env.ADMIN_SECRET_CODE)
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || process.env.PGRST_JWT_SECRET || ADMIN_SECRET_CODE
const PGRST_URL = process.env.PGRST_URL || 'http://localhost:3001'
const PGRST_JWT_SECRET = process.env.PGRST_JWT_SECRET || ''

const ADMIN_COOKIE_NAME = 'foxtaffy_admin_session'
const ADMIN_SESSION_TTL_SEC = 60 * 60 * 12
const LOGIN_LOCK_MS = 15 * 60 * 1000
const LOGIN_MAX_ATTEMPTS = 5
const loginAttempts = new Map()

// Очистка устаревших записей brute-force каждые 30 минут.
// Удаляем все записи, у которых блокировка истекла (lockedUntil < now).
// Важно: без этой проверки entries с attempts > 0 и истёкшим lockedUntil
// никогда не удалялись бы (старое условие требовало attempts === 0).
setInterval(() => {
  const now = Date.now()
  for (const [ip, state] of loginAttempts) {
    if (state.lockedUntil < now) {
      loginAttempts.delete(ip)
    }
  }
}, 30 * 60 * 1000)

const allowedOrigins = ALLOWED_ORIGIN === '*'
  ? ['*']
  : ALLOWED_ORIGIN.split(',').map(origin => origin.trim()).filter(Boolean)

const isProduction = process.env.NODE_ENV === 'production'
const cookieSecure = process.env.ADMIN_COOKIE_SECURE
  ? process.env.ADMIN_COOKIE_SECURE === 'true'
  : isProduction

const base64url = (input) => Buffer.from(input).toString('base64url')
const fromBase64url = (input) => Buffer.from(input, 'base64url').toString('utf8')
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')
const signValue = (value, secret) => crypto.createHmac('sha256', secret).update(value).digest('base64url')

const createJwt = (payload, secret) => {
  const header = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = base64url(JSON.stringify(header))
  const encodedPayload = base64url(JSON.stringify(payload))
  const signature = signValue(`${encodedHeader}.${encodedPayload}`, secret)
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

const parseCookies = (req) => {
  const cookieHeader = req.headers.cookie || ''
  return cookieHeader
    .split(';')
    .map(part => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const [name, ...rest] = part.split('=')
      acc[name] = decodeURIComponent(rest.join('='))
      return acc
    }, {})
}

const isAllowedOrigin = (origin) => {
  if (!origin) return true
  if (!isProduction && /^https?:\/\/localhost(?::\d+)?$/.test(origin)) return true
  if (!isProduction && /^https?:\/\/127\.0\.0\.1(?::\d+)?$/.test(origin)) return true
  if (allowedOrigins.includes('*')) return true
  return allowedOrigins.includes(origin)
}

const ensureAllowedOrigin = (req, res) => {
  const origin = req.headers.origin
  if (!isAllowedOrigin(origin)) {
    res.status(403).json({ error: 'Forbidden origin' })
    return false
  }
  return true
}

const setSecurityHeaders = (_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  next()
}

const createAdminSessionToken = () => {
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iat: now,
    exp: now + ADMIN_SESSION_TTL_SEC,
    scope: 'admin',
    marker: sha256(ADMIN_SECRET_CODE).slice(0, 16)
  }

  return `${base64url(JSON.stringify(payload))}.${signValue(JSON.stringify(payload), ADMIN_SESSION_SECRET)}`
}

const validateAdminSessionToken = (token) => {
  if (!token || !ADMIN_SECRET_CODE || !ADMIN_SESSION_SECRET) return false

  const [encodedPayload, signature] = token.split('.')
  if (!encodedPayload || !signature) return false

  let payload
  try {
    payload = JSON.parse(fromBase64url(encodedPayload))
  } catch {
    return false
  }

  const expectedSignature = signValue(JSON.stringify(payload), ADMIN_SESSION_SECRET)
  if (signature.length !== expectedSignature.length) return false

  const validSignature = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  if (!validSignature) return false
  if (payload.scope !== 'admin') return false
  if (payload.marker !== sha256(ADMIN_SECRET_CODE).slice(0, 16)) return false
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return false

  return true
}

const getAdminAttemptState = (req) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown'
  const state = loginAttempts.get(ip) || { attempts: 0, lockedUntil: 0 }

  if (state.lockedUntil && state.lockedUntil < Date.now()) {
    state.attempts = 0
    state.lockedUntil = 0
    loginAttempts.set(ip, state)
  }

  return { ip, state }
}

const hasValidAdminSession = (req) => {
  const cookies = parseCookies(req)
  return validateAdminSessionToken(cookies[ADMIN_COOKIE_NAME])
}

const requireAdmin = (req, res, next) => {
  if (!hasValidAdminSession(req)) {
    return res.status(401).json({ error: 'Admin authentication required' })
  }

  next()
}

const requireApiKeyOrAdmin = (req, res, next) => {
  // api_key принимается ТОЛЬКО из заголовка, не из query string.
  // Ключи в URL попадают в access-логи сервера, историю браузера и Referer-заголовки.
  const key = req.headers['x-api-key']
  if (API_KEY && key === API_KEY) {
    return next()
  }

  if (hasValidAdminSession(req)) {
    return next()
  }

  return res.status(401).json({ error: 'Unauthorized' })
}

const adminCookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: cookieSecure,
  path: '/',
  maxAge: ADMIN_SESSION_TTL_SEC * 1000
}

const createPostgrestServiceToken = () => {
  if (!PGRST_JWT_SECRET) {
    throw new Error('PGRST_JWT_SECRET is not configured')
  }

  const now = Math.floor(Date.now() / 1000)
  return createJwt({ role: 'service_role', iat: now, exp: now + 300 }, PGRST_JWT_SECRET)
}

app.use(setSecurityHeaders)
app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true)
      return
    }

    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-API-Key', 'Authorization', 'Prefer']
}))
app.use(express.json({ limit: '10mb' }))

app.get('/health', (_req, res) => res.json({ ok: true }))

app.get('/upload/admin/session', (req, res) => {
  res.json({ authenticated: hasValidAdminSession(req) })
})

app.post('/upload/admin/login', (req, res) => {
  if (!ensureAllowedOrigin(req, res)) return

  if (!ADMIN_SECRET_CODE || !ADMIN_SESSION_SECRET) {
    return res.status(503).json({ error: 'Admin auth is not configured' })
  }

  const { ip, state } = getAdminAttemptState(req)
  if (state.lockedUntil > Date.now()) {
    const retryAfter = Math.ceil((state.lockedUntil - Date.now()) / 1000)
    return res.status(429).json({ error: 'Too many attempts', retryAfter })
  }

  const submittedCode = normalizeAdminCode(req.body?.code)
  const expected = Buffer.from(ADMIN_SECRET_CODE)
  const received = Buffer.from(submittedCode)
  const isMatch = expected.length === received.length && crypto.timingSafeEqual(expected, received)

  if (!isMatch) {
    state.attempts += 1
    if (state.attempts >= LOGIN_MAX_ATTEMPTS) {
      state.lockedUntil = Date.now() + LOGIN_LOCK_MS
    }
    loginAttempts.set(ip, state)

    if (state.lockedUntil) {
      const retryAfter = Math.ceil((state.lockedUntil - Date.now()) / 1000)
      return res.status(429).json({ error: 'Too many attempts', retryAfter })
    }

    return res.json({ ok: false, error: 'Invalid admin code' })
  }

  loginAttempts.set(ip, { attempts: 0, lockedUntil: 0 })
  res.cookie(ADMIN_COOKIE_NAME, createAdminSessionToken(), adminCookieOptions)
  res.json({ ok: true })
})

app.post('/upload/admin/logout', (req, res) => {
  if (!ensureAllowedOrigin(req, res)) return

  res.clearCookie(ADMIN_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'strict',
    secure: cookieSecure,
    path: '/'
  })
  res.json({ ok: true })
})

app.all('/upload/admin/db/*', requireAdmin, async (req, res) => {
  if (!ensureAllowedOrigin(req, res)) return

  try {
    const proxyPath = req.originalUrl.replace(/^\/upload\/admin\/db\//, '')
    const targetUrl = `${PGRST_URL.replace(/\/$/, '')}/${proxyPath}`
    const token = createPostgrestServiceToken()

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: req.headers.accept || 'application/json'
    }

    if (req.headers.prefer) {
      headers.Prefer = req.headers.prefer
    }

    const isBodyMethod = !['GET', 'HEAD'].includes(req.method)
    if (isBodyMethod) {
      headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: isBodyMethod ? JSON.stringify(req.body ?? {}) : undefined
    })

    const contentType = response.headers.get('content-type')
    const text = await response.text()

    if (contentType) {
      res.setHeader('Content-Type', contentType)
    }

    res.status(response.status).send(text)
  } catch (error) {
    console.error('Admin DB proxy error:', error)
    res.status(500).json({ error: error.message || 'Admin DB proxy failed' })
  }
})

app.post('/upload/:bucket', requireApiKeyOrAdmin, async (req, res) => {
  if (!ensureAllowedOrigin(req, res)) return

  const { bucket } = req.params

  // Белый список разрешённых MIME-типов.
  // Запрет SVG/HTML/XML предотвращает хранимый XSS через /s3/ прокси.
  const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
    'image/webp', 'image/avif'
  ])

  // Паттерн безопасного пути: только буквы, цифры, /, -, _, .
  // Запрет .. предотвращает path traversal (перезапись произвольных файлов в бакете)
  const SAFE_PATH_RE = /^[a-zA-Z0-9/_\-. ]+$/
  const sanitizePath = (raw) => {
    if (!raw || typeof raw !== 'string') return null
    const normalized = raw.replace(/\.\.\/|\.\.\\/g, '').replace(/^\/+/, '')
    return SAFE_PATH_RE.test(normalized) ? normalized : null
  }

  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }))
  } catch {
    return res.status(404).json({ error: `Bucket "${bucket}" not found` })
  }

  let uploadedPath = null
  let contentType = 'application/octet-stream'
  let fileSize = 0

  try {
    await new Promise((resolve, reject) => {
      const bb = busboy({
        headers: req.headers,
        limits: { fileSize: 50 * 1024 * 1024 }
      })

      bb.on('field', (name, val) => {
        if (name === 'path') uploadedPath = sanitizePath(val)
      })

      bb.on('file', async (_fieldname, stream, info) => {
        const { filename, mimeType } = info
        const resolvedMime = mimeType || 'image/jpeg'

        // Проверяем MIME-тип до чтения содержимого файла
        if (!ALLOWED_MIME_TYPES.has(resolvedMime)) {
          stream.resume() // обязательно дренируем поток busboy
          return reject(Object.assign(new Error(`Недопустимый тип файла: ${resolvedMime}`), { status: 415 }))
        }

        contentType = resolvedMime
        const safeName = sanitizePath(uploadedPath || filename)
        if (!safeName) {
          stream.resume()
          return reject(Object.assign(new Error('Недопустимый путь файла'), { status: 400 }))
        }
        const filePath = safeName

        const chunks = []
        for await (const chunk of stream) {
          chunks.push(chunk)
          fileSize += chunk.length
        }

        const body = Buffer.concat(chunks)

        try {
          await s3.send(new PutObjectCommand({
            Bucket: bucket,
            Key: filePath,
            Body: body,
            ContentType: contentType,
            CacheControl: 'max-age=31536000'
          }))
          uploadedPath = filePath
          resolve()
        } catch (err) {
          reject(err)
        }
      })

      bb.on('error', reject)
      req.pipe(bb)
    })

    const publicUrl = `${PUBLIC_URL}/${bucket}/${uploadedPath}`

    res.json({
      path: uploadedPath,
      url: publicUrl,
      size: fileSize,
      bucket
    })
  } catch (err) {
    console.error('Upload error:', err)
    res.status(err.status || 500).json({ error: err.message })
  }
})

app.delete('/upload/:bucket', requireApiKeyOrAdmin, async (req, res) => {
  if (!ensureAllowedOrigin(req, res)) return

  const { bucket } = req.params
  const { path: filePath, paths } = req.body

  try {
    if (paths && Array.isArray(paths)) {
      await s3.send(new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: paths.map(p => ({ Key: p })) }
      }))
      res.json({ deleted: paths.length })
    } else if (filePath) {
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: filePath }))
      res.json({ deleted: 1 })
    } else {
      res.status(400).json({ error: 'Provide `path` or `paths`' })
    }
  } catch (err) {
    console.error('Delete error:', err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/upload/:bucket/list', requireApiKeyOrAdmin, async (req, res) => {
  const { bucket } = req.params
  const prefix = req.query.prefix || ''
  const limit = parseInt(req.query.limit || '1000', 10)

  try {
    const result = await s3.send(new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      MaxKeys: limit
    }))

    const files = (result.Contents || []).map(obj => ({
      name: obj.Key.replace(prefix, '').replace(/^\//, ''),
      id: obj.ETag,
      size: obj.Size,
      updated_at: obj.LastModified?.toISOString(),
      metadata: { size: obj.Size, mimetype: 'image/jpeg' }
    }))

    res.json(files)
  } catch (err) {
    console.error('List error:', err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/upload/buckets', requireApiKeyOrAdmin, async (_req, res) => {
  res.json([
    { id: 'convent', name: 'convent', public: true },
    { id: 'gallery', name: 'gallery', public: true }
  ])
})

app.listen(PORT, () => {
  console.log(`🦊 FoxTaffy Upload API запущен на порту ${PORT}`)
})
