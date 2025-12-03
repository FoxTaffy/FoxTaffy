// ============================================
// FOX TAFFY - SUPABASE STORAGE CONFIGURATION
// С автоматической генерацией миниатюр и организованной структурой папок
// ============================================

import { supabase } from '@/config/supabase.js'

// ============================================
// КОНСТАНТЫ
// ============================================
const DEFAULT_BUCKET = 'Convent'
const THUMBNAIL_MAX_WIDTH = 400
const THUMBNAIL_MAX_HEIGHT = 400
const THUMBNAIL_QUALITY = 0.8

// ============================================
// ОПРЕДЕЛЕНИЕ БАКЕТА И СТРУКТУРЫ ПАПОК
// ============================================
const getBucketName = (folder) => {
  // Все мероприятия хранятся в бакете Convent
  if (folder.startsWith('events/')) {
    return 'Convent'
  }
  // Для остального контента - gallery
  return 'gallery'
}

/**
 * Генерация структуры папок для мероприятия
 * @param {string|number} eventId - ID мероприятия
 * @param {string} type - Тип файла: 'original', 'thumbnails', 'purchases', 'avatar', 'banner'
 * @returns {string} Путь к папке
 */
const getEventFolderPath = (eventId, type = 'original') => {
  if (!eventId) {
    // Для файлов без привязки к мероприятию (временные)
    return `events/temp/${type}`
  }
  // Структура: events/{event-id}/original/ или events/{event-id}/thumbnails/ или events/{event-id}/purchases/
  return `events/${eventId}/${type}`
}

// ============================================
// УТИЛИТЫ ДЛЯ РАБОТЫ С ИЗОБРАЖЕНИЯМИ
// ============================================

/**
 * Создание миниатюры изображения с помощью Canvas API
 * @param {File} file - Исходный файл изображения
 * @param {number} maxWidth - Максимальная ширина миниатюры
 * @param {number} maxHeight - Максимальная высота миниатюры
 * @param {number} quality - Качество JPEG (0-1)
 * @returns {Promise<Blob>} Blob с миниатюрой
 */
const createThumbnailBlob = (file, maxWidth = THUMBNAIL_MAX_WIDTH, maxHeight = THUMBNAIL_MAX_HEIGHT, quality = THUMBNAIL_QUALITY) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.src = e.target.result
    }

    reader.onerror = () => {
      reject(new Error('Ошибка чтения файла'))
    }

    img.onload = () => {
      try {
        // Вычисляем новые размеры с сохранением пропорций
        let { width, height } = img

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height

          if (width > height) {
            width = maxWidth
            height = Math.round(width / aspectRatio)
          } else {
            height = maxHeight
            width = Math.round(height * aspectRatio)
          }
        }

        // Создаем canvas и рисуем изображение
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Конвертируем canvas в blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Ошибка создания миниатюры'))
            }
          },
          'image/jpeg',
          quality
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Ошибка загрузки изображения'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Оптимизация изображения (сжатие без изменения размера)
 * @param {File} file - Исходный файл
 * @param {number} quality - Качество (0-1)
 * @returns {Promise<Blob>} Оптимизированное изображение
 */
const optimizeImage = async (file, quality = 0.9) => {
  // Если файл уже небольшой, не оптимизируем
  if (file.size < 500 * 1024) { // < 500KB
    return file
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.src = e.target.result
    }

    reader.onerror = () => {
      reject(new Error('Ошибка чтения файла'))
    }

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Если оптимизация увеличила размер, возвращаем оригинал
            resolve(blob.size < file.size ? blob : file)
          } else {
            reject(new Error('Ошибка оптимизации'))
          }
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => {
      reject(new Error('Ошибка загрузки изображения'))
    }

    reader.readAsDataURL(file)
  })
}

// ============================================
// SUPABASE STORAGE API МЕТОДЫ
// ============================================
export const s3Api = {

  /**
   * Загрузка файла в Supabase Storage
   * @param {File|Blob} file - Файл для загрузки
   * @param {string} folder - Папка в bucket
   * @param {Function} onProgress - Callback для прогресса
   * @returns {Promise<Object>} Результат загрузки
   */
  async uploadFile(file, folder = 'arts', onProgress = null) {
    try {
      const bucketName = getBucketName(folder)

      // Генерируем уникальное имя файла
      const fileExtension = file.name ? file.name.split('.').pop().toLowerCase() : 'jpg'
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const fileName = `${folder}/${timestamp}_${randomString}.${fileExtension}`

      console.log(`📤 Загружаем файл в Supabase Storage [${bucketName}]:`, fileName)

      // Проверяем размер файла (максимум 10MB)
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        throw new Error(`Файл слишком большой. Максимальный размер: ${Math.round(maxSize / 1024 / 1024)}MB`)
      }

      // Симуляция прогресса
      if (onProgress) onProgress(10)

      // Загружаем файл
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'image/jpeg'
        })

      if (error) {
        console.error('❌ Ошибка загрузки в Supabase Storage:', error)

        if (error.message.includes('row-level security policy') || error.message.includes('RLS')) {
          throw new Error('Ошибка доступа: необходимо настроить политики безопасности в Supabase. Проверьте Storage настройки.')
        }

        throw new Error(`Ошибка загрузки: ${error.message}`)
      }

      if (onProgress) onProgress(90)

      // Получаем публичный URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName)

      if (onProgress) onProgress(100)

      console.log(`✅ Файл успешно загружен в Supabase Storage [${bucketName}]:`, urlData.publicUrl)

      return {
        url: urlData.publicUrl,
        fileName: fileName,
        size: file.size,
        type: file.type || 'image/jpeg',
        path: data.path,
        bucket: bucketName
      }

    } catch (error) {
      console.error('❌ Ошибка загрузки в Supabase Storage:', error)
      throw error
    }
  },

  /**
   * Загрузка изображения с автоматическим созданием миниатюры
   * @param {File} file - Файл изображения
   * @param {string} folder - Базовая папка (например 'events/123')
   * @param {Function} onProgress - Callback прогресса
   * @returns {Promise<Object>} Объект с URL оригинала и миниатюры
   */
  async uploadImageWithThumbnail(file, folder = 'arts', onProgress = null) {
    try {
      console.log('🖼️ Загружаем изображение с созданием миниатюры...')

      // Парсим eventId из folder если это путь к событию
      let eventId = null
      let baseFolder = folder

      if (folder.startsWith('events/')) {
        const parts = folder.split('/')
        if (parts[1] && parts[1] !== 'temp') {
          eventId = parts[1]
        }
      }

      // Определяем пути для оригинала и миниатюры
      const originalFolder = eventId ? getEventFolderPath(eventId, 'original') : folder
      const thumbnailFolder = eventId ? getEventFolderPath(eventId, 'thumbnails') : `${folder}/thumbnails`

      // Обновляем прогресс
      if (onProgress) onProgress(5)

      // 1. Оптимизируем оригинал если нужно
      console.log('🔄 Оптимизируем оригинальное изображение...')
      const optimizedOriginal = await optimizeImage(file, 0.92)
      if (onProgress) onProgress(20)

      // 2. Создаем миниатюру
      console.log('🔄 Создаем миниатюру...')
      const thumbnailBlob = await createThumbnailBlob(file, THUMBNAIL_MAX_WIDTH, THUMBNAIL_MAX_HEIGHT, THUMBNAIL_QUALITY)
      if (onProgress) onProgress(40)

      // 3. Загружаем оригинал
      console.log('📤 Загружаем оригинал...')
      const originalFile = new File([optimizedOriginal], file.name, { type: 'image/jpeg' })
      const originalResult = await this.uploadFile(originalFile, originalFolder, (progress) => {
        if (onProgress) onProgress(40 + (progress * 0.3)) // 40-70%
      })

      // 4. Загружаем миниатюру
      console.log('📤 Загружаем миниатюру...')
      const thumbnailFile = new File([thumbnailBlob], `thumb_${file.name}`, { type: 'image/jpeg' })
      const thumbnailResult = await this.uploadFile(thumbnailFile, thumbnailFolder, (progress) => {
        if (onProgress) onProgress(70 + (progress * 0.3)) // 70-100%
      })

      console.log('✅ Изображение и миниатюра успешно загружены!')

      return {
        original: {
          url: originalResult.url,
          path: originalResult.path,
          fileName: originalResult.fileName,
          size: originalResult.size,
          type: originalResult.type,
          bucket: originalResult.bucket
        },
        thumbnail: {
          url: thumbnailResult.url,
          path: thumbnailResult.path,
          fileName: thumbnailResult.fileName,
          size: thumbnailResult.size,
          type: thumbnailResult.type,
          bucket: thumbnailResult.bucket
        }
      }

    } catch (error) {
      console.error('❌ Ошибка загрузки изображения с миниатюрой:', error)
      throw error
    }
  },

  /**
   * Загрузка нескольких фотографий для мероприятия
   * @param {Array<File>} files - Массив файлов
   * @param {string|number} eventId - ID мероприятия
   * @param {Function} onProgress - Callback прогресса для каждого файла
   * @returns {Promise<Array>} Массив результатов загрузки
   */
  async uploadEventPhotos(files, eventId, onProgress = null) {
    try {
      console.log(`📸 Загружаем ${files.length} фотографий для мероприятия ${eventId}...`)

      const results = []
      const totalFiles = files.length

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        console.log(`📤 Загружаем фото ${i + 1}/${totalFiles}: ${file.name}`)

        const result = await this.uploadImageWithThumbnail(
          file,
          `events/${eventId}`,
          (progress) => {
            if (onProgress) {
              // Общий прогресс: (завершенные файлы + прогресс текущего) / всего файлов
              const totalProgress = ((i + (progress / 100)) / totalFiles) * 100
              onProgress(Math.round(totalProgress), i + 1, totalFiles)
            }
          }
        )

        results.push({
          image_url: result.original.url,
          thumbnail_url: result.thumbnail.url,
          file_path: result.original.path,
          thumbnail_path: result.thumbnail.path,
          file_size: result.original.size,
          file_name: file.name
        })
      }

      console.log(`✅ Все ${totalFiles} фотографий успешно загружены!`)
      return results

    } catch (error) {
      console.error('❌ Ошибка загрузки фотографий мероприятия:', error)
      throw error
    }
  },

  /**
   * Загрузка фотографии покупки
   * @param {File} file - Файл изображения
   * @param {string} eventId - ID мероприятия
   * @param {string} purchaseId - ID покупки (опционально)
   * @returns {Promise<Object>} URL загруженного файла
   */
  async uploadPurchasePhoto(file, eventId, purchaseId = null) {
    try {
      console.log(`📸 Загружаем фото покупки для мероприятия ${eventId}...`)

      // Генерируем имя файла
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 8)
      const fileName = purchaseId
        ? `purchase_${purchaseId}_${timestamp}_${randomStr}.jpg`
        : `purchase_${timestamp}_${randomStr}.jpg`

      // Путь к папке покупок
      const purchasesFolder = getEventFolderPath(eventId, 'purchases')

      // Оптимизируем изображение
      const optimizedImage = await optimizeImage(file, 0.85)
      const optimizedFile = new File([optimizedImage], fileName, { type: 'image/jpeg' })

      // Загружаем файл
      const result = await this.uploadFile(optimizedFile, purchasesFolder)

      console.log('✅ Фото покупки успешно загружено')
      return {
        url: result.url,
        path: result.path,
        fileName: result.fileName
      }

    } catch (error) {
      console.error('❌ Ошибка загрузки фото покупки:', error)
      throw error
    }
  },

  /**
   * Удаление файла из Supabase Storage
   * @param {string} filePath - Путь к файлу
   * @param {string} bucketName - Имя bucket
   * @returns {Promise<boolean>} Успешность удаления
   */
  async deleteFile(filePath, bucketName = DEFAULT_BUCKET) {
    try {
      console.log(`🗑️ Удаляем файл из Supabase Storage [${bucketName}]:`, filePath)

      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath])

      if (error) {
        console.error('❌ Ошибка удаления из Supabase Storage:', error)
        throw new Error(`Ошибка удаления: ${error.message}`)
      }

      console.log('✅ Файл успешно удален из Supabase Storage')
      return true

    } catch (error) {
      console.error('❌ Ошибка удаления из Supabase Storage:', error)
      throw error
    }
  },

  /**
   * Удаление всех файлов мероприятия
   * @param {string|number} eventId - ID мероприятия
   * @returns {Promise<boolean>} Успешность удаления
   */
  async deleteEventFiles(eventId) {
    try {
      console.log(`🗑️ Удаляем все файлы мероприятия ${eventId}...`)

      const bucketName = 'Convent'
      const eventFolder = `events/${eventId}`

      // Получаем список всех файлов в папке мероприятия
      const { data: files, error: listError } = await supabase.storage
        .from(bucketName)
        .list(eventFolder, {
          limit: 1000,
          sortBy: { column: 'name', order: 'asc' }
        })

      if (listError) {
        console.error('❌ Ошибка получения списка файлов:', listError)
        return false
      }

      if (!files || files.length === 0) {
        console.log('📁 Нет файлов для удаления')
        return true
      }

      // Формируем пути для удаления
      const filePaths = files.map(file => `${eventFolder}/${file.name}`)

      // Удаляем все файлы
      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove(filePaths)

      if (deleteError) {
        console.error('❌ Ошибка удаления файлов:', deleteError)
        return false
      }

      console.log(`✅ Удалено ${files.length} файлов мероприятия ${eventId}`)
      return true

    } catch (error) {
      console.error('❌ Ошибка удаления файлов мероприятия:', error)
      return false
    }
  },

  /**
   * Валидация файла перед загрузкой
   * @param {File} file - Файл для проверки
   * @returns {Object} Результат валидации
   */
  validateFile(file) {
    const errors = []

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      errors.push(`Файл слишком большой. Максимум: ${Math.round(maxSize / 1024 / 1024)}MB`)
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      errors.push('Неподдерживаемый формат. Разрешены: JPG, PNG, GIF, WebP')
    }

    if (!file.name || file.name.length === 0) {
      errors.push('Отсутствует имя файла')
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    }
  },

  /**
   * Проверка существования bucket
   * @param {string} bucketName - Имя bucket
   * @returns {Promise<boolean>} Существует ли bucket
   */
  async checkBucketExists(bucketName = DEFAULT_BUCKET) {
    try {
      const { data, error } = await supabase.storage.listBuckets()

      if (error) {
        console.error('❌ Ошибка проверки bucket:', error)
        return false
      }

      const bucketExists = data.some(bucket => bucket.name === bucketName)
      console.log(`🪣 Bucket "${bucketName}" ${bucketExists ? 'существует' : 'не найден'}`)

      return bucketExists
    } catch (error) {
      console.error('❌ Ошибка проверки bucket:', error)
      return false
    }
  }
}

// ============================================
// УТИЛИТЫ
// ============================================

/**
 * Форматирование размера файла
 * @param {number} bytes - Размер в байтах
 * @returns {string} Читаемый размер
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Проверка поддержки браузером File API
 * @returns {boolean} Поддерживается ли File API
 */
export const isFileApiSupported = () => {
  return !!(window.File && window.FileReader && window.FileList && window.Blob)
}

// ============================================
// ДЕФОЛТНЫЙ ЭКСПОРТ
// ============================================
export default s3Api

console.log('✅ Supabase Storage API с автоматической генерацией миниатюр загружен!')
console.log('📁 Структура хранения: events/{event-id}/original/ и events/{event-id}/thumbnails/')
console.log('🖼️ Размер миниатюр: максимум 400x400px')
console.log('📦 Bucket по умолчанию: Convent')
