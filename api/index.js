// ================================================
// FOXTAFFY.GAY — Upload API
// Прокси для загрузки файлов из браузера в MinIO
// ================================================

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
const PORT = process.env.PORT || 3002

// ── S3 / MinIO клиент ────────────────────────────
const s3 = new S3Client({
  endpoint: `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}`,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || 'admin',
    secretAccessKey: process.env.MINIO_SECRET_KEY || 'changeme'
  },
  forcePathStyle: true  // обязательно для MinIO
})

const PUBLIC_URL = process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'
const API_KEY    = process.env.UPLOAD_API_KEY   || ''
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*'

// ── Middleware ───────────────────────────────────
app.use(cors({
  origin: ALLOWED_ORIGIN,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-API-Key', 'Authorization']
}))
app.use(express.json())

// ── Auth guard ───────────────────────────────────
function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'] || req.query.api_key
  if (API_KEY && key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

// ── Health ───────────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true }))

// ── POST /upload/:bucket — загрузить файл ────────
app.post('/upload/:bucket', requireApiKey, async (req, res) => {
  const { bucket } = req.params

  try {
    // Проверяем bucket
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
        limits: { fileSize: 50 * 1024 * 1024 } // 50 МБ max
      })

      bb.on('field', (name, val) => {
        if (name === 'path') uploadedPath = val
      })

      bb.on('file', async (fieldname, stream, info) => {
        const { filename, mimeType } = info
        contentType = mimeType || 'image/jpeg'

        // Путь: либо из поля `path`, либо из имени файла
        const filePath = uploadedPath || filename

        // Собираем chunks в память (до 50 МБ)
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
    res.status(500).json({ error: err.message })
  }
})

// ── DELETE /upload/:bucket — удалить файл(ы) ─────
app.delete('/upload/:bucket', requireApiKey, async (req, res) => {
  const { bucket } = req.params
  const { path: filePath, paths } = req.body

  try {
    if (paths && Array.isArray(paths)) {
      // Удаляем несколько файлов
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

// ── GET /upload/:bucket/list — список файлов ─────
app.get('/upload/:bucket/list', requireApiKey, async (req, res) => {
  const { bucket } = req.params
  const prefix  = req.query.prefix || ''
  const limit   = parseInt(req.query.limit || '1000', 10)

  try {
    const result = await s3.send(new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      MaxKeys: limit
    }))

    const files = (result.Contents || []).map(obj => ({
      name:         obj.Key.replace(prefix, '').replace(/^\//, ''),
      id:           obj.ETag,
      size:         obj.Size,
      updated_at:   obj.LastModified?.toISOString(),
      metadata:     { size: obj.Size, mimetype: 'image/jpeg' }
    }))

    res.json(files)
  } catch (err) {
    console.error('List error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ── GET /upload/buckets — список бакетов ─────────
app.get('/upload/buckets', requireApiKey, async (_req, res) => {
  res.json([
    { id: 'convent',  name: 'convent',  public: true },
    { id: 'gallery',  name: 'gallery',  public: true }
  ])
})

// ── Start ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🦊 FoxTaffy Upload API запущен на порту ${PORT}`)
})
