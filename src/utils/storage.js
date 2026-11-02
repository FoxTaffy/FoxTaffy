const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')

/** Публичный URL файла в бакете Supabase Storage (имена бакетов чувствительны к регистру). */
export function storageUrl(bucket, path) {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
}
