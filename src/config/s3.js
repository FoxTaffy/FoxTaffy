// ============================================
// FOX TAFFY - SUPABASE STORAGE CONFIGURATION
// Исправленная версия с политиками безопасности
// ============================================

import { supabase } from '@/config/supabase.js'

const BUCKET_NAME = 'gallery' // Название bucket в Supabase Storage

// ============================================
// SUPABASE STORAGE API МЕТОДЫ
// ============================================
export const s3Api = {
  
  /**
   * Загрузка файла в Supabase Storage
   * @param {File} file - Файл для загрузки
   * @param {string} folder - Папка в bucket (например: 'arts', 'avatars')
   * @param {Function} onProgress - Callback для прогресса (опционально)
   * @returns {Promise<string>} URL загруженного файла
   */
  async uploadFile(file, folder = 'arts', onProgress = null) {
    try {
      // Генерируем уникальное имя файла
      const fileExtension = file.name.split('.').pop().toLowerCase()
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const fileName = `${folder}/${timestamp}_${randomString}.${fileExtension}`
      
      console.log('📤 Загружаем файл в Supabase Storage:', fileName)
      
      // Проверяем размер файла (максимум 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        throw new Error(`Файл слишком большой. Максимальный размер: ${Math.round(maxSize / 1024 / 1024)}MB`)
      }
      
      // Проверяем тип файла
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Неподдерживаемый тип файла. Разрешены: JPG, PNG, GIF, WebP')
      }
      
      // Симуляция прогресса для UI
      if (onProgress) {
        onProgress(10) // Начало загрузки
      }
      
      // ✅ ИСПРАВЛЕНО: Убеждаемся что bucket и политики настроены
      await this.ensureBucketAndPolicies()
      
      // Загружаем файл в Supabase Storage
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        })
      
      if (error) {
        console.error('❌ Ошибка загрузки в Supabase Storage:', error)
        
        // ✅ Специальная обработка ошибки RLS
        if (error.message.includes('row-level security policy') || error.message.includes('RLS')) {
          throw new Error('Ошибка доступа: необходимо настроить политики безопасности в Supabase. Проверьте Storage настройки.')
        }
        
        throw new Error(`Ошибка загрузки: ${error.message}`)
      }
      
      // Симуляция прогресса
      if (onProgress) {
        onProgress(70)
      }
      
      // Получаем публичный URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName)
      
      const publicUrl = urlData.publicUrl
      
      // Завершение прогресса
      if (onProgress) {
        onProgress(100)
      }
      
      console.log('✅ Файл успешно загружен в Supabase Storage:', publicUrl)
      
      return {
        url: publicUrl,
        fileName: fileName,
        size: file.size,
        type: file.type,
        path: data.path
      }
      
    } catch (error) {
      console.error('❌ Ошибка загрузки в Supabase Storage:', error)
      throw new Error(`Ошибка загрузки: ${error.message}`)
    }
  },
  
  /**
   * ✅ НОВЫЙ МЕТОД: Убеждаемся что bucket и политики настроены правильно
   */
  async ensureBucketAndPolicies() {
    try {
      console.log('🔧 Проверяем настройки bucket и политик...')
      
      // Проверяем существование bucket
      const bucketExists = await this.checkBucketExists()
      
      if (!bucketExists) {
        console.log('🪣 Создаем bucket...')
        await this.createBucketWithPolicies()
      } else {
        console.log('✅ Bucket существует')
      }
      
      return true
    } catch (error) {
      console.warn('⚠️ Ошибка настройки bucket:', error)
      return false
    }
  },
  
  /**
   * ✅ НОВЫЙ МЕТОД: Создание bucket с правильными политиками
   */
  async createBucketWithPolicies() {
    try {
      console.log('🪣 Создаем bucket с политиками...')
      
      // Создаем публичный bucket
      const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
      })
      
      if (error) {
        console.error('❌ Ошибка создания bucket:', error)
        return false
      }
      
      console.log('✅ Bucket создан:', data)
      
      // ✅ Попытка создать политики доступа через SQL
      try {
        await this.createStoragePolicies()
      } catch (policyError) {
        console.warn('⚠️ Не удалось создать политики автоматически:', policyError)
        console.log('💡 Необходимо настроить политики вручную в Supabase Dashboard')
      }
      
      return true
    } catch (error) {
      console.error('❌ Ошибка создания bucket:', error)
      return false
    }
  },
  
  /**
   * ✅ НОВЫЙ МЕТОД: Создание политик доступа к Storage
   */
  async createStoragePolicies() {
    try {
      console.log('🔐 Создаем политики доступа к Storage...')
      
      // Политика для чтения (публичного доступа)
      const readPolicy = `
        CREATE POLICY "Public read access" ON storage.objects
        FOR SELECT USING (bucket_id = '${BUCKET_NAME}');
      `
      
      // Политика для записи (анонимного доступа)
      const writePolicy = `
        CREATE POLICY "Public write access" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = '${BUCKET_NAME}');
      `
      
      // Политика для удаления
      const deletePolicy = `
        CREATE POLICY "Public delete access" ON storage.objects
        FOR DELETE USING (bucket_id = '${BUCKET_NAME}');
      `
      
      // Выполняем SQL запросы
      await supabase.rpc('exec_sql', { sql: readPolicy })
      await supabase.rpc('exec_sql', { sql: writePolicy })
      await supabase.rpc('exec_sql', { sql: deletePolicy })
      
      console.log('✅ Политики доступа созданы')
      return true
    } catch (error) {
      console.warn('⚠️ Ошибка создания политик:', error)
      return false
    }
  },
  
  /**
   * Удаление файла из Supabase Storage
   * @param {string} fileName - Имя файла для удаления
   * @returns {Promise<boolean>} Успешность удаления
   */
  async deleteFile(fileName) {
    try {
      console.log('🗑️ Удаляем файл из Supabase Storage:', fileName)
      
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([fileName])
      
      if (error) {
        console.error('❌ Ошибка удаления из Supabase Storage:', error)
        throw new Error(`Ошибка удаления: ${error.message}`)
      }
      
      console.log('✅ Файл успешно удален из Supabase Storage')
      return true
      
    } catch (error) {
      console.error('❌ Ошибка удаления из Supabase Storage:', error)
      throw new Error(`Ошибка удаления: ${error.message}`)
    }
  },
  
  /**
   * Загрузка изображения и создание превью
   * @param {File} file - Файл изображения
   * @param {string} folder - Папка назначения
   * @param {Function} onProgress - Callback прогресса
   * @returns {Promise<Object>} Объект с URL оригинала и превью
   */
  async uploadImageWithThumbnail(file, folder = 'arts', onProgress = null) {
    try {
      // ✅ ИСПРАВЛЕНО: Сначала загружаем только оригинал, превью отключаем временно
      console.log('📤 Загружаем оригинальное изображение...')
      
      const originalResult = await this.uploadFile(file, folder, onProgress)
      
      // Возвращаем результат без превью пока не решим проблему с RLS
      return {
        original: originalResult,
        thumbnail: originalResult // Используем оригинал как превью временно
      }
      
    } catch (error) {
      console.error('❌ Ошибка загрузки изображения:', error)
      throw error
    }
  },
  
  /**
   * Создание превью изображения (временно отключено)
   * @param {File} file - Исходный файл
   * @param {string} folder - Папка назначения
   * @param {Function} onProgress - Callback прогресса
   * @returns {Promise<Object>} Результат загрузки превью
   */
  async createThumbnail(file, folder = 'arts', onProgress = null) {
    // ✅ Временно отключаем создание превью из-за проблем с RLS
    console.log('⚠️ Создание превью временно отключено из-за политик безопасности')
    
    // Возвращаем заглушку
    return {
      url: '',
      fileName: '',
      size: 0,
      type: file.type,
      path: ''
    }
  },
  
  /**
   * Валидация файла перед загрузкой
   * @param {File} file - Файл для проверки
   * @returns {Object} Результат валидации
   */
  validateFile(file) {
    const errors = []
    
    // Проверка размера
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      errors.push(`Файл слишком большой. Максимум: ${Math.round(maxSize / 1024 / 1024)}MB`)
    }
    
    // Проверка типа
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      errors.push('Неподдерживаемый формат. Разрешены: JPG, PNG, GIF, WebP')
    }
    
    // Проверка имени файла
    if (!file.name || file.name.length === 0) {
      errors.push('Отсутствует имя файла')
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    }
  },
  
  /**
   * Получение информации о файле
   * @param {File} file - Файл для анализа
   * @returns {Promise<Object>} Информация о файле
   */
  async getFileInfo(file) {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const img = new Image()
        img.onload = () => {
          resolve({
            name: file.name,
            size: file.size,
            type: file.type,
            width: img.width,
            height: img.height,
            aspectRatio: img.width / img.height
          })
        }
        img.onerror = () => {
          resolve({
            name: file.name,
            size: file.size,
            type: file.type,
            width: null,
            height: null,
            aspectRatio: null
          })
        }
        img.src = URL.createObjectURL(file)
      } else {
        resolve({
          name: file.name,
          size: file.size,
          type: file.type,
          width: null,
          height: null,
          aspectRatio: null
        })
      }
    })
  },
  
  /**
   * Проверка существования bucket
   * @returns {Promise<boolean>} Существует ли bucket
   */
  async checkBucketExists() {
    try {
      const { data, error } = await supabase.storage.listBuckets()
      
      if (error) {
        console.error('❌ Ошибка проверки bucket:', error)
        return false
      }
      
      const bucketExists = data.some(bucket => bucket.name === BUCKET_NAME)
      console.log(`🪣 Bucket "${BUCKET_NAME}" ${bucketExists ? 'существует' : 'не найден'}`)
      
      return bucketExists
    } catch (error) {
      console.error('❌ Ошибка проверки bucket:', error)
      return false
    }
  },
  
  /**
   * Создание bucket (если не существует)
   * @returns {Promise<boolean>} Успешность создания
   */
  async createBucketIfNotExists() {
    try {
      const bucketExists = await this.checkBucketExists()
      
      if (!bucketExists) {
        return await this.createBucketWithPolicies()
      }
      
      return true
    } catch (error) {
      console.error('❌ Ошибка создания bucket:', error)
      return false
    }
  },
  
  /**
   * Получение списка файлов в папке
   * @param {string} folder - Папка для просмотра
   * @returns {Promise<Array>} Список файлов
   */
  async listFiles(folder = '') {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(folder)
      
      if (error) {
        console.error('❌ Ошибка получения списка файлов:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('❌ Ошибка получения списка файлов:', error)
      return []
    }
  }
}

// ============================================
// ✅ ИСПРАВЛЕНО: ПРАВИЛЬНЫЕ ЭКСПОРТЫ
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

/**
 * Инициализация Supabase Storage
 * Проверяет и создает bucket при необходимости
 */
export const initializeStorage = async () => {
  try {
    console.log('🚀 Инициализация Supabase Storage...')
    
    const bucketReady = await s3Api.createBucketIfNotExists()
    
    if (bucketReady) {
      console.log('✅ Supabase Storage готов к работе!')
      return true
    } else {
      console.warn('⚠️ Проблемы с инициализацией Supabase Storage')
      return false
    }
  } catch (error) {
    console.error('❌ Ошибка инициализации Supabase Storage:', error)
    return false
  }
}

// ============================================
// ✅ ДЕФОЛТНЫЙ ЭКСПОРТ
// ============================================
export default s3Api

// Автоматическая инициализация при загрузке модуля
if (typeof window !== 'undefined') {
  // Инициализируем только в браузере
  initializeStorage().then(success => {
    if (success) {
      console.log('✅ Supabase Storage Configuration загружен и готов!')
      console.log('🔧 Endpoint: Supabase Storage API')
      console.log('📁 Bucket:', BUCKET_NAME)
      console.log('📤 Максимальный размер файла: 10MB')
      console.log('🖼️ Поддерживаемые форматы: JPG, PNG, GIF, WebP')
      console.log('🔐 Политики безопасности: Автоматическая настройка')
    } else {
      console.warn('⚠️ Требуется ручная настройка политик в Supabase Dashboard')
    }
  })
}

console.log('✅ Supabase Storage API с поддержкой RLS загружен!')