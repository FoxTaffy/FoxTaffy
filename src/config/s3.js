// ============================================
// FOX TAFFY - SUPABASE STORAGE CONFIGURATION
// С автоматической генерацией миниатюр и организованной структурой папок
// ============================================

import { supabase } from '@/config/supabase.js'

// ============================================
// КОНСТАНТЫ
// ============================================
const DEFAULT_BUCKET = 'Convent'
const THUMBNAIL_MAX_WIDTH = 300
const THUMBNAIL_MAX_HEIGHT = 300
const THUMBNAIL_QUALITY = 0.7

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
 * Санитизация имени для использования в качестве имени папки
 * @param {string} name - Имя для санитизации
 * @returns {string} Безопасное имя папки
 */
const sanitizeFolderName = (name) => {
  if (!name) return ''

  return name
    // Убираем спецсимволы, оставляем буквы, цифры, пробелы и дефисы
    .replace(/[^\w\s-]/g, '')
    // Заменяем пробелы на дефисы
    .replace(/\s+/g, '-')
    // Убираем множественные дефисы
    .replace(/-+/g, '-')
    // Убираем дефисы в начале и конце
    .replace(/^-+|-+$/g, '')
    // Ограничиваем длину до 50 символов
    .substring(0, 50)
}

/**
 * Генерация структуры папок для мероприятия
 * @param {string|number|Object} eventIdentifier - Может быть: photos_folder из БД, slug, name, или старый eventId для обратной совместимости
 * @param {string} type - Тип файла: 'original', 'thumbnails', 'purchases', 'avatar', 'banner'
 * @returns {string} Путь к папке
 */
const getEventFolderPath = (eventIdentifier, type = 'original') => {
  if (!eventIdentifier) {
    // Для файлов без привязки к мероприятию (временные)
    return `events/temp/${type}`
  }

  let folderName = ''

  // Если передан объект события с photos_folder - используем его
  if (typeof eventIdentifier === 'object' && eventIdentifier.photos_folder) {
    folderName = eventIdentifier.photos_folder
  }
  // Если передан объект события со slug - используем slug
  else if (typeof eventIdentifier === 'object' && eventIdentifier.slug) {
    folderName = sanitizeFolderName(eventIdentifier.slug)
  }
  // Если передан объект события с name - используем name
  else if (typeof eventIdentifier === 'object' && eventIdentifier.name) {
    folderName = sanitizeFolderName(eventIdentifier.name)
  }
  // Если передана строка - используем её напрямую (предполагаем что это уже photos_folder или slug)
  else if (typeof eventIdentifier === 'string') {
    // Если это уже путь events/... - извлекаем имя папки
    if (eventIdentifier.startsWith('events/')) {
      const parts = eventIdentifier.split('/')
      folderName = parts[1] || eventIdentifier
    } else {
      folderName = eventIdentifier
    }
  }
  // Иначе это число (старый eventId) - используем для обратной совместимости
  else {
    folderName = String(eventIdentifier)
  }

  // Структура: events/{folder-name}/original/ или events/{folder-name}/thumbnails/ или events/{folder-name}/purchases/
  return `events/${folderName}/${type}`
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
 * Оптимизация изображения (сжатие с адаптивным качеством и размером)
 * @param {File} file - Исходный файл
 * @param {number} quality - Базовое качество (0-1)
 * @returns {Promise<Blob>} Оптимизированное изображение
 */
const optimizeImage = async (file, quality = 0.8) => {
  const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 МБ
  const MIN_FILE_SIZE = 300 * 1024 // 300 КБ
  const MAX_DIMENSION = 2000 // Максимальная ширина/высота

  // Оптимизируем все файлы больше MIN_FILE_SIZE
  if (file.size < MIN_FILE_SIZE) {
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
      let width = img.width
      let height = img.height
      let targetQuality = quality

      // Ограничиваем размеры изображения
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
        width = Math.round(width * scale)
        height = Math.round(height * scale)
        console.log(`📐 Уменьшаем размеры до: ${width}x${height}`)
      }

      // Если файл больше 2 МБ, нужно сжать агрессивнее
      if (file.size > MAX_FILE_SIZE) {
        console.log(`📦 Файл ${(file.size / 1024 / 1024).toFixed(2)} МБ > 2 МБ, сжимаем агрессивнее...`)

        // Вычисляем коэффициент сжатия
        const compressionRatio = Math.sqrt(MAX_FILE_SIZE / file.size)

        // Дополнительно уменьшаем размеры
        width = Math.round(width * compressionRatio)
        height = Math.round(height * compressionRatio)

        // Снижаем качество
        targetQuality = Math.max(0.6, quality * compressionRatio)

        console.log(`📐 Новые размеры: ${width}x${height}, качество: ${(targetQuality * 100).toFixed(0)}%`)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log(`✅ Сжато: ${(file.size / 1024 / 1024).toFixed(2)} МБ → ${(blob.size / 1024 / 1024).toFixed(2)} МБ`)

            // Если оптимизация увеличила размер, возвращаем оригинал
            resolve(blob.size < file.size ? blob : file)
          } else {
            reject(new Error('Ошибка оптимизации'))
          }
        },
        'image/jpeg',
        targetQuality
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

      // Проверяем размер файла (максимум 5MB)
      const maxSize = 5 * 1024 * 1024
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
   * @param {string|Object} folder - Базовая папка (например 'events/AnyFurryFestVI') или объект события
   * @param {Function} onProgress - Callback прогресса
   * @returns {Promise<Object>} Объект с URL оригинала и миниатюры
   */
  async uploadImageWithThumbnail(file, folder = 'arts', onProgress = null) {
    try {
      console.log('🖼️ Загружаем изображение с созданием миниатюры...')

      // Определяем идентификатор события из folder
      let eventIdentifier = null

      if (typeof folder === 'object') {
        // Если передан объект события
        eventIdentifier = folder
      } else if (typeof folder === 'string' && folder.startsWith('events/')) {
        // Если это путь к событию - извлекаем имя папки
        const parts = folder.split('/')
        if (parts[1] && parts[1] !== 'temp') {
          eventIdentifier = parts[1]
        }
      }

      // Определяем пути для оригинала и миниатюры
      const originalFolder = eventIdentifier ? getEventFolderPath(eventIdentifier, 'original') : folder
      const thumbnailFolder = eventIdentifier ? getEventFolderPath(eventIdentifier, 'thumbnails') : `${folder}/thumbnails`

      // Обновляем прогресс
      if (onProgress) onProgress(5)

      // 1. Оптимизируем оригинал если нужно
      console.log('🔄 Оптимизируем оригинальное изображение...')
      const optimizedOriginal = await optimizeImage(file, 0.8)
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
   * @param {string|number|Object} eventIdentifier - ID/slug/name мероприятия или объект события
   * @param {Function} onProgress - Callback прогресса для каждого файла
   * @returns {Promise<Array>} Массив результатов загрузки
   */
  async uploadEventPhotos(files, eventIdentifier, onProgress = null) {
    try {
      const displayName = typeof eventIdentifier === 'object'
        ? (eventIdentifier.name || eventIdentifier.slug || eventIdentifier.id)
        : eventIdentifier
      console.log(`📸 Загружаем ${files.length} фотографий для мероприятия ${displayName}...`)

      const results = []
      const totalFiles = files.length

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        console.log(`📤 Загружаем фото ${i + 1}/${totalFiles}: ${file.name}`)

        const result = await this.uploadImageWithThumbnail(
          file,
          eventIdentifier,
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
   * @param {string|number|Object} eventIdentifier - ID/slug/name мероприятия или объект события
   * @param {string} purchaseId - ID покупки (опционально)
   * @returns {Promise<Object>} URL загруженного файла
   */
  async uploadPurchasePhoto(file, eventIdentifier, purchaseId = null) {
    try {
      const displayName = typeof eventIdentifier === 'object'
        ? (eventIdentifier.name || eventIdentifier.slug || eventIdentifier.id)
        : eventIdentifier
      console.log(`📸 Загружаем фото покупки для мероприятия ${displayName}...`)

      // Генерируем имя файла
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 8)
      const fileName = purchaseId
        ? `purchase_${purchaseId}_${timestamp}_${randomStr}.jpg`
        : `purchase_${timestamp}_${randomStr}.jpg`

      // Путь к папке покупок
      const purchasesFolder = getEventFolderPath(eventIdentifier, 'purchases')

      // Оптимизируем изображение
      const optimizedImage = await optimizeImage(file, 0.75)
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
   * @param {string|number|Object} eventIdentifier - ID/slug/name мероприятия или объект события
   * @returns {Promise<boolean>} Успешность удаления
   */
  async deleteEventFiles(eventIdentifier) {
    try {
      const displayName = typeof eventIdentifier === 'object'
        ? (eventIdentifier.name || eventIdentifier.slug || eventIdentifier.id)
        : eventIdentifier
      console.log(`🗑️ Удаляем все файлы мероприятия ${displayName}...`)

      const bucketName = 'Convent'

      // Получаем имя папки из идентификатора
      let folderName = ''
      if (typeof eventIdentifier === 'object' && eventIdentifier.photos_folder) {
        // Используем photos_folder из БД
        folderName = eventIdentifier.photos_folder.replace('events/', '')
      } else if (typeof eventIdentifier === 'object' && eventIdentifier.slug) {
        folderName = sanitizeFolderName(eventIdentifier.slug)
      } else if (typeof eventIdentifier === 'object' && eventIdentifier.name) {
        folderName = sanitizeFolderName(eventIdentifier.name)
      } else if (typeof eventIdentifier === 'string') {
        folderName = eventIdentifier.startsWith('events/')
          ? eventIdentifier.split('/')[1]
          : eventIdentifier
      } else {
        folderName = String(eventIdentifier)
      }

      const eventFolder = `events/${folderName}`

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

      console.log(`✅ Удалено ${files.length} файлов мероприятия ${displayName}`)
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

    const maxSize = 5 * 1024 * 1024 // 5MB
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
export { sanitizeFolderName, getEventFolderPath }

console.log('✅ Supabase Storage API с автоматической генерацией миниатюр загружен!')
console.log('📁 Структура хранения: events/{event-name}/original/ и events/{event-name}/thumbnails/')
console.log('🖼️ Размер миниатюр: максимум 300x300px')
console.log('📦 Bucket по умолчанию: Convent')
console.log('⚡ Оптимизация: макс. 2MB на файл, качество 80%, макс. размер 2000px')
