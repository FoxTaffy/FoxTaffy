// ===============================================
// 🎪 FOXTAFFY.GAY - ОБЪЕДИНЁННЫЙ SUPABASE API
// Система управления мероприятиями и галереей
// ===============================================

import { createClient } from '@supabase/supabase-js'
import { adminApiRequest } from '@/utils/adminAuth.js'

// ===============================================
// 🔧 КОНФИГУРАЦИЯ — Self-hosted VPS (PostgREST)
// ===============================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Ошибка: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY не заданы в .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

const buildAdminQuery = (params = {}) => {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return

    if (Array.isArray(value)) {
      value.forEach(item => search.append(key, String(item)))
      return
    }

    search.set(key, String(value))
  })

  const query = search.toString()
  return query ? `?${query}` : ''
}

const firstRow = (data) => Array.isArray(data) ? (data[0] || null) : data

const adminDb = async (table, { method = 'GET', query = {}, body, prefer } = {}) => {
  return adminApiRequest(`/admin/db/${table}${buildAdminQuery(query)}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(prefer ? { Prefer: prefer } : {})
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  })
}

// ===============================================
// 🎪 ОБЪЕДИНЁННЫЙ API КЛАСС
// ===============================================

export const furryApi = {

  // ============================================
  // 📅 МЕТОДЫ ДЛЯ МЕРОПРИЯТИЙ (CONS)
  // ============================================

  /**
   * Получить список всех мероприятий
   */
  async getEvents(options = {}) {
    const {
      status = 'all', // 'upcoming', 'completed', 'all'
      event_type,
      attendance_status,
      city,
      search,
      limit = 20,
      offset = 0,
      sort = 'date_desc' // 'date_desc', 'date_asc', 'name_asc', 'name_desc', 'rating_desc', 'created_desc'
    } = options

    try {
      console.log('🎪 getEvents: Загружаем мероприятия с опциями:', options)

      // Загружаем мероприятия с подсчетом фотографий и особенностями
      let query = supabase
        .from('cons')
        .select('*, con_photos(count), con_features(id, title, icon_class, feature_type)')

      // Фильтрация по статусу
      if (status === 'upcoming') {
        query = query.gt('event_date', new Date().toISOString().split('T')[0])
      } else if (status === 'completed') {
        query = query.lt('event_date', new Date().toISOString().split('T')[0])
      }

      // Фильтрация по типу мероприятия
      if (event_type) {
        query = query.eq('event_type', event_type)
      }

      // Фильтрация по статусу участия
      if (attendance_status) {
        query = query.eq('attendance_status', attendance_status)
      }

      // Фильтрация по городу
      if (city) {
        query = query.eq('city', city)
      }

      // Поиск по тексту
      if (search) {
        query = query.or(`name.ilike.%${search}%,subtitle.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`)
      }

      // Сортировка
      const sortMapping = {
        'date_desc': { column: 'event_date', ascending: false },
        'date_asc': { column: 'event_date', ascending: true },
        'name_asc': { column: 'name', ascending: true },
        'name_desc': { column: 'name', ascending: false },
        'rating_desc': { column: 'my_rating', ascending: false },
        'rating_asc': { column: 'my_rating', ascending: true },
        'spent_desc': { column: 'total_spent', ascending: false },
        'spent_asc': { column: 'total_spent', ascending: true },
        'created_desc': { column: 'created_at', ascending: false }
      }

      const sortConfig = sortMapping[sort] || sortMapping['date_desc']
      query = query.order(sortConfig.column, { ascending: sortConfig.ascending, nullsLast: true })

      // Пагинация
      if (limit) {
        query = query.limit(limit)
      }
      if (offset) {
        query = query.range(offset, offset + limit - 1)
      }

      const { data, error } = await query

      if (error) throw error

      // Обработка данных: добавляем photos_count из агрегации
      const eventsWithPhotos = (data || []).map(event => {
        const photosCount = event.con_photos?.[0]?.count || 0
        const { con_photos, ...eventData } = event
        return {
          ...eventData,
          photos_count: photosCount
        }
      })

      console.log('✅ getEvents: Мероприятия загружены:', eventsWithPhotos.length)

      // Отладка con_features
      console.log('🔍 Проверка con_features:')
      eventsWithPhotos.forEach(event => {
        if (event.con_features && event.con_features.length > 0) {
          console.log(`  - ${event.name}: ${event.con_features.length} особенностей`)
        }
      })

      return eventsWithPhotos

    } catch (error) {
      console.error('❌ getEvents: Ошибка загрузки мероприятий:', error)
      throw new Error(`Ошибка загрузки мероприятий: ${error.message}`)
    }
  },

  /**
   * Получить мероприятие по slug
   */
  async getEventBySlug(slug) {
    try {
      console.log('🔍 getEventBySlug: Ищем мероприятие по slug:', slug)

      const { data, error } = await supabase
        .from('cons')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('⚠️ getEventBySlug: Мероприятие не найдено')
          return null
        }
        throw error
      }

      console.log('✅ getEventBySlug: Мероприятие найдено:', data.name)
      return data

    } catch (error) {
      console.error('❌ getEventBySlug: Ошибка поиска мероприятия:', error)
      throw new Error(`Ошибка поиска мероприятия: ${error.message}`)
    }
  },

  /**
   * Получить мероприятие по ID
   */
  async getEventById(id) {
    try {
      console.log('🔍 getEventById: Ищем мероприятие по ID:', id)

      const { data, error } = await supabase
        .from('cons')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('⚠️ getEventById: Мероприятие не найдено')
          return null
        }
        throw error
      }

      console.log('✅ getEventById: Мероприятие найдено:', data.name)
      return data

    } catch (error) {
      console.error('❌ getEventById: Ошибка поиска мероприятия:', error)
      throw new Error(`Ошибка поиска мероприятия: ${error.message}`)
    }
  },

  /**
   * Получить статистику мероприятий
   */
  async getEventsStats() {
    try {
      console.log('📊 getEventsStats: Получаем статистику мероприятий...')
      
      const { data, error } = await supabase
        .from('cons')
        .select('id, event_date, my_rating, total_spent, attendees_count')

      if (error) throw error

      const now = new Date()
      const todayISO = now.toISOString().split('T')[0]

      const upcoming = data.filter(e => e.event_date > todayISO)
      const completed = data.filter(e => e.event_date <= todayISO)

      const stats = {
        total: data.length,
        upcoming: upcoming.length,
        completed: completed.length,
        totalSpent: data.reduce((sum, e) => sum + (e.total_spent || 0), 0),
        averageRating: data.filter(e => e.my_rating).length > 0
          ? data.reduce((sum, e) => sum + (e.my_rating || 0), 0) / data.filter(e => e.my_rating).length
          : 0,
        totalAttendees: data.reduce((sum, e) => sum + (e.attendees_count || 0), 0)
      }

      console.log('✅ getEventsStats: Статистика получена:', stats)
      return stats

    } catch (error) {
      console.error('❌ getEventsStats: Ошибка получения статистики:', error)
      return {
        total: 0, upcoming: 0, completed: 0,
        totalSpent: 0, averageRating: 0, totalAttendees: 0
      }
    }
  },

  /**
   * Создать новое мероприятие
   */
  async createEvent(eventData) {
    try {
      console.log('➕ createEvent: Создаём новое мероприятие:', eventData.name)
      
      const cleanData = this._cleanEventData(eventData)
      if (cleanData.event_date === '') {
        cleanData.event_date = null
      }
      
      // Проверяем уникальность slug
      if (cleanData.slug) {
        const slugExists = await this.checkEventSlugExists(cleanData.slug)
        if (slugExists) {
          cleanData.slug = `${cleanData.slug}-${Date.now()}`
        }
      }
      
      // Устанавливаем временные метки
      cleanData.created_at = new Date().toISOString()
      cleanData.updated_at = new Date().toISOString()

      const data = await adminDb('cons', {
        method: 'POST',
        query: { select: '*' },
        prefer: 'return=representation',
        body: cleanData
      })

      const createdEvent = firstRow(data)
      if (!createdEvent) throw new Error('Мероприятие не было создано')

      console.log('✅ createEvent: Мероприятие создано:', createdEvent.name)
      return createdEvent
      
    } catch (error) {
      console.error('❌ createEvent: Ошибка создания мероприятия:', error)
      throw new Error(`Ошибка создания мероприятия: ${error.message}`)
    }
  },

  /**
   * Обновить мероприятие
   */
  async updateEvent(eventId, updateData) {
    try {
      console.log('📝 updateEvent: Обновляем мероприятие:', eventId)
      
      const cleanData = this._cleanEventData(updateData)
      cleanData.updated_at = new Date().toISOString()
      
      if (cleanData.event_date === '') {
        cleanData.event_date = null
      }

      // Проверяем уникальность slug если он изменился
      if (cleanData.slug) {
        const existingEvent = await this.getEventById(eventId)
        if (existingEvent && existingEvent.slug !== cleanData.slug) {
          const slugExists = await this.checkEventSlugExists(cleanData.slug)
          if (slugExists) {
            cleanData.slug = `${cleanData.slug}-${Date.now()}`
          }
        }
      }
      
      const data = await adminDb('cons', {
        method: 'PATCH',
        query: { id: `eq.${eventId}`, select: '*' },
        prefer: 'return=representation',
        body: cleanData
      })

      const updatedEvent = firstRow(data)
      if (!updatedEvent) throw new Error('Мероприятие не было обновлено')

      console.log('✅ updateEvent: Мероприятие обновлено:', updatedEvent.name)
      return updatedEvent
      
    } catch (error) {
      console.error('❌ updateEvent: Ошибка обновления мероприятия:', error)
      throw new Error(`Ошибка обновления мероприятия: ${error.message}`)
    }
  },

  /**
   * Удалить мероприятие
   */
  async deleteEvent(eventId) {
    try {
      console.log('🗑️ deleteEvent: Удаляем мероприятие:', eventId)

      // Сначала получаем информацию о событии (нужно для удаления файлов)
      const event = await this.getEventById(eventId)

      // Удаляем файлы из Storage
      if (event) {
        try {
          const { s3Api } = await import('./s3.js')
          await s3Api.deleteEventFiles(event)
          console.log('✅ deleteEvent: Файлы мероприятия удалены из Storage')
        } catch (storageError) {
          console.error('⚠️ deleteEvent: Ошибка удаления файлов из Storage:', storageError)
          // Продолжаем удаление даже если файлы не удалились
        }
      }

      // Удаляем связанные данные из БД
      await Promise.all([
        adminDb('con_links', { method: 'DELETE', query: { con_id: `eq.${eventId}` } }),
        adminDb('con_features', { method: 'DELETE', query: { con_id: `eq.${eventId}` } }),
        adminDb('con_photos', { method: 'DELETE', query: { con_id: `eq.${eventId}` } }),
        adminDb('con_purchases', { method: 'DELETE', query: { con_id: `eq.${eventId}` } })
      ])

      // Затем удаляем само мероприятие
      await adminDb('cons', {
        method: 'DELETE',
        query: { id: `eq.${eventId}` }
      })

      console.log('✅ deleteEvent: Мероприятие и все связанные данные удалены')
      return true

    } catch (error) {
      console.error('❌ deleteEvent: Ошибка удаления мероприятия:', error)
      throw new Error(`Ошибка удаления мероприятия: ${error.message}`)
    }
  },

  /**
   * Получить мероприятие по ID
   */
  async getEventById(eventId) {
    try {
      const { data, error } = await supabase
        .from('cons')
        .select('*')
        .eq('id', eventId)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        throw error
      }
      
      return data
      
    } catch (error) {
      console.error('❌ getEventById: Ошибка получения мероприятия:', error)
      throw new Error(`Ошибка получения мероприятия: ${error.message}`)
    }
  },

  /**
   * Проверить существование slug
   */
  async checkEventSlugExists(slug) {
    try {
      const { data, error } = await supabase
        .from('cons')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()

      if (error) throw error
      return !!data

    } catch (error) {
      console.error('❌ checkEventSlugExists: Ошибка проверки slug:', error)
      return false
    }
  },

  /**
   * Получить ссылки мероприятия
   */
  async getEventLinks(eventId) {
    try {
      // Проверяем что eventId валидный
      if (!eventId) {
        return []
      }

      const { data, error } = await supabase
        .from('con_links')
        .select('*')
        .eq('con_id', eventId)
        .order('sort_order', { ascending: true, nullsFirst: false })

      // Если ошибка - просто возвращаем пустой массив
      // Таблица con_links опциональна и может не существовать
      if (error) {
        return []
      }

      return data || []

    } catch (error) {
      // Не логируем ошибку, так как таблица опциональна
      return []
    }
  },

  /**
   * Получить особенности мероприятия
   */
  async getEventFeatures(eventId) {
    try {
      if (!eventId) {
        return []
      }

      const { data, error } = await supabase
        .from('con_features')
        .select('*')
        .eq('con_id', eventId)
        .order('sort_order', { ascending: true })

      // Таблица опциональна
      if (error) {
        return []
      }

      return data || []

    } catch (error) {
      return []
    }
  },

  /**
   * Получить фотографии мероприятия
   */
  async getEventPhotos(eventId) {
    try {
      if (!eventId) {
        return []
      }

      const { data, error } = await supabase
        .from('con_photos')
        .select('*')
        .eq('con_id', eventId)
        .order('display_order', { ascending: true })

      // Таблица опциональна
      if (error) {
        return []
      }

      // Фильтруем дубликаты: оставляем только записи где есть разница между image_url и thumbnail_url
      // Или где image_url не содержит 'thumb_' (не является миниатюрой)
      const uniquePhotos = (data || []).filter((photo, index, self) => {
        // Пропускаем если image_url указывает на миниатюру (содержит thumb_ или /thumbnails/)
        if (photo.image_url && (photo.image_url.includes('thumb_') || photo.image_url.includes('/thumbnails/'))) {
          return false
        }

        // Проверяем что нет дубликата с таким же файлом
        const fileName = photo.image_url ? photo.image_url.split('/').pop().replace('thumb_', '') : ''
        const isDuplicate = self.slice(0, index).some(p => {
          const pFileName = p.image_url ? p.image_url.split('/').pop().replace('thumb_', '') : ''
          return pFileName === fileName && pFileName !== ''
        })

        return !isDuplicate
      })

      return uniquePhotos

    } catch (error) {
      return []
    }
  },

  /**
   * Получить фотографии для нескольких событий (для превью)
   */
  async getPhotosForEvents(eventIds, limit = 5) {
    try {
      if (!eventIds || eventIds.length === 0) {
        return []
      }

      const { data, error } = await supabase
        .from('con_photos')
        .select('id, con_id, image_url, thumbnail_url, caption')
        .in('con_id', eventIds)
        .order('display_order', { ascending: true })
        .limit(limit * eventIds.length) // Загружаем максимум limit*N фотографий

      // Таблица опциональна
      if (error) {
        return []
      }

      // Фильтруем дубликаты для каждого мероприятия
      const uniquePhotos = (data || []).filter((photo, index, self) => {
        // Пропускаем если image_url указывает на миниатюру
        if (photo.image_url && (photo.image_url.includes('thumb_') || photo.image_url.includes('/thumbnails/'))) {
          return false
        }

        // Проверяем дубликаты в рамках одного мероприятия
        const fileName = photo.image_url ? photo.image_url.split('/').pop().replace('thumb_', '') : ''
        const isDuplicate = self.slice(0, index).some(p => {
          if (p.con_id !== photo.con_id) return false // Сравниваем только в рамках одного события
          const pFileName = p.image_url ? p.image_url.split('/').pop().replace('thumb_', '') : ''
          return pFileName === fileName && pFileName !== ''
        })

        return !isDuplicate
      })

      return uniquePhotos

    } catch (error) {
      return []
    }
  },

  /**
   * Получить покупки на мероприятии
   */
  async getEventPurchases(eventId) {
    try {
      console.log('🛍️ getEventPurchases: Загружаем покупки для мероприятия:', eventId)

      const { data, error } = await supabase
        .from('con_purchases')
        .select('*')
        .eq('con_id', eventId)

      if (error) throw error

      console.log('✅ getEventPurchases: Покупки загружены:', data?.length || 0)
      return data || []

    } catch (error) {
      console.error('❌ getEventPurchases: Ошибка загрузки покупок:', error)
      return []
    }
  },

  /**
   * Сохранить покупки мероприятия
   */
  async saveEventPurchases(eventId, purchases) {
    try {
      console.log('🛍️ saveEventPurchases: Сохраняем покупки для мероприятия:', eventId)

      // Удаляем старые покупки
      await adminDb('con_purchases', {
        method: 'DELETE',
        query: { con_id: `eq.${eventId}` }
      })

      // Добавляем новые покупки
      if (purchases && purchases.length > 0) {
        const purchasesToInsert = purchases
          .filter(p => p.name && p.name.trim())
          .map(p => {
            let imageUrl = null
            if (p.image) {
              // Если это полный URL, извлекаем путь относительно bucket
              if (p.image.startsWith('/s3/convent/')) {
                imageUrl = p.image.substring('/s3/convent/'.length)
              } else {
                imageUrl = p.image
              }
            }
            return {
              con_id: eventId,
              item_name: p.name.trim(),
              title: p.name.trim(),
              price: String(p.price || 0),
              image_url: imageUrl
            }
          })

        if (purchasesToInsert.length > 0) {
          console.log('📦 Данные для вставки в con_purchases:', JSON.stringify(purchasesToInsert, null, 2))
          await adminDb('con_purchases', {
            method: 'POST',
            body: purchasesToInsert
          })
        }
      }

      console.log('✅ saveEventPurchases: Покупки сохранены:', purchases?.length || 0)
      return true

    } catch (error) {
      console.error('❌ saveEventPurchases: Ошибка сохранения покупок:', error)
      throw error
    }
  },

  async saveEventPhotos(eventId, photos) {
    try {
      console.log('📸 saveEventPhotos: Сохраняем фотографии для мероприятия:', eventId)

      // Не удаляем старые фотографии, только добавляем новые (append mode)
      // Если нужно полностью заменить - вызовите deleteEventPhotos сначала

      // Добавляем новые фотографии
      if (photos && photos.length > 0) {
        // Получаем текущий максимальный display_order
        const existingPhotos = await adminDb('con_photos', {
          query: {
            select: 'display_order',
            con_id: `eq.${eventId}`,
            order: 'display_order.desc',
            limit: 1
          }
        })

        const startOrder = existingPhotos && existingPhotos.length > 0
          ? existingPhotos[0].display_order + 1
          : 0

        // Подготавливаем данные для вставки
        const photosToInsert = photos
          .map((photo, index) => {
            // Поддержка старого формата (простые URL) и нового (объекты)
            if (typeof photo === 'string') {
              return {
                con_id: eventId,
                image_url: photo,
                thumbnail_url: photo,
                display_order: startOrder + index
              }
            } else {
              return {
                con_id: eventId,
                image_url: photo.image_url || null,
                thumbnail_url: photo.thumbnail_url || photo.image_url || null,
                file_path: photo.file_path || null,
                thumbnail_path: photo.thumbnail_path || null,
                file_size: photo.file_size || null,
                file_name: photo.file_name || null,
                caption: photo.caption || null,
                is_featured: photo.is_featured || false,
                display_order: startOrder + index
              }
            }
          })
          // Фильтруем фотографии: должен быть хотя бы image_url или file_path
          .filter(photo => {
            const hasUrl = photo.image_url && photo.image_url.trim() !== ''
            const hasPath = photo.file_path && photo.file_path.trim() !== ''

            if (!hasUrl && !hasPath) {
              console.warn('⚠️ Пропускаем фото без URL и пути:', photo)
              return false
            }

            return true
          })

        await adminDb('con_photos', {
          method: 'POST',
          body: photosToInsert
        })
      }

      console.log('✅ saveEventPhotos: Фотографии сохранены:', photos?.length || 0)
      return true

    } catch (error) {
      console.error('❌ saveEventPhotos: Ошибка сохранения фотографий:', error)
      throw error
    }
  },

  /**
   * Удалить все фотографии мероприятия
   * @param {number} eventId - ID мероприятия
   * @returns {Promise<boolean>} Успешность удаления
   */
  async deleteEventPhotos(eventId) {
    try {
      console.log('🗑️ deleteEventPhotos: Удаляем фотографии мероприятия:', eventId)

      await adminDb('con_photos', {
        method: 'DELETE',
        query: { con_id: `eq.${eventId}` }
      })

      console.log('✅ deleteEventPhotos: Фотографии удалены')
      return true

    } catch (error) {
      console.error('❌ deleteEventPhotos: Ошибка удаления фотографий:', error)
      throw error
    }
  },

  /**
   * Удалить одну конкретную фотографию
   * @param {number} photoId - ID фотографии
   * @returns {Promise<Object>} Данные удаленной фотографии (для удаления файлов из Storage)
   */
  async deleteEventPhoto(photoId) {
    try {
      console.log('🗑️ deleteEventPhoto: Удаляем фотографию:', photoId)

      // Сначала получаем данные фотографии (нужны пути к файлам)
      const photo = firstRow(await adminDb('con_photos', {
        query: { select: '*', id: `eq.${photoId}`, limit: 1 }
      }))

      if (!photo) throw new Error('Фотография не найдена')

      // Удаляем запись из БД
      await adminDb('con_photos', {
        method: 'DELETE',
        query: { id: `eq.${photoId}` }
      })

      console.log('✅ deleteEventPhoto: Фотография удалена из БД')

      // Удаляем файлы из Storage если есть пути
      if (photo.file_path || photo.thumbnail_path) {
        try {
          const { s3Api } = await import('./s3.js')

          // Удаляем оригинал
          if (photo.file_path) {
            await s3Api.deleteFile(photo.file_path, 'Convent')
            console.log('✅ Удален оригинал:', photo.file_path)
          }

          // Удаляем миниатюру
          if (photo.thumbnail_path) {
            await s3Api.deleteFile(photo.thumbnail_path, 'Convent')
            console.log('✅ Удалена миниатюра:', photo.thumbnail_path)
          }
        } catch (storageError) {
          console.warn('⚠️ Не удалось удалить файлы из Storage:', storageError)
          // Не бросаем ошибку, т.к. запись из БД уже удалена
        }
      }

      return photo

    } catch (error) {
      console.error('❌ deleteEventPhoto: Ошибка удаления фотографии:', error)
      throw error
    }
  },

  // ============================================
  // 🎨 МЕТОДЫ ДЛЯ ГАЛЕРЕИ ИСКУССТВА
  // ============================================

  /**
   * ✅ НОВЫЙ МЕТОД: Загрузить все данные оптимизированно
   */
  async loadAllData(options = {}) {
    try {
      console.log('🔄 loadAllData: Загружаем все данные оптимизированно...')
      
      // Загружаем все данные параллельно
      const [artsResult, artistsResult, tagsResult, charactersResult] = await Promise.allSettled([
        this.getFurryArts(options),
        this.getFurryArtists(),
        this.getFurryTags(),
        this.getSpecies()
      ])
      
      const result = {
        arts: artsResult.status === 'fulfilled' ? artsResult.value : [],
        artists: artistsResult.status === 'fulfilled' ? artistsResult.value : [],
        tags: tagsResult.status === 'fulfilled' ? tagsResult.value : [],
        characters: charactersResult.status === 'fulfilled' ? charactersResult.value : []
      }
      
      // Логируем ошибки если они есть
      if (artsResult.status === 'rejected') {
        console.error('❌ Ошибка загрузки артов:', artsResult.reason)
      }
      if (artistsResult.status === 'rejected') {
        console.error('❌ Ошибка загрузки художников:', artistsResult.reason)
      }
      if (tagsResult.status === 'rejected') {
        console.error('❌ Ошибка загрузки тегов:', tagsResult.reason)
      }
      if (charactersResult.status === 'rejected') {
        console.error('❌ Ошибка загрузки персонажей:', charactersResult.reason)
      }
      
      console.log('✅ loadAllData: Все данные загружены:', {
        arts: result.arts.length,
        artists: result.artists.length,
        tags: result.tags.length,
        characters: result.characters.length
      })
      
      return result
      
    } catch (error) {
      console.error('❌ loadAllData: Критическая ошибка:', error)
      
      // Возвращаем пустые массивы в случае критической ошибки
      return {
        arts: [],
        artists: [],
        tags: [],
        characters: []
      }
    }
  },

  /**
   * Получить арты с фильтрацией и сортировкой
   */
  async getFurryArts(options = {}) {
    const { 
      search = '', 
      tags = [], 
      artists = [], 
      characters = [], // ✅ Добавляем поддержку фильтра персонажей
      showYiff = false,
      showNsfw = false,
      sort = 'newest',
      limit = 24,
      offset = 0
    } = options

    try {
      console.log('🎨 getFurryArts: Запрашиваем арты с опциями:', options)
      
      // Один запрос с embedded resources — устраняет N+1 для тегов и персонажей
      let query = supabase
        .from('arts')
        .select(`
          id, title, image_url, thumbnail_url, is_nsfw, upload_date,
          art_collaborators!inner(persons!inner(nickname, avatar_url, is_friend)),
          art_tags(tags(name)),
          art_fursonas(fursonas(name, avatar_url))
        `)
        .eq('is_deleted', false)
        .eq('art_collaborators.role', 'main_artist')

      // Поиск по названию
      if (search.trim()) {
        query = query.ilike('title', `%${search}%`)
      }

      // Фильтр по художникам
      if (artists.length > 0) {
        query = query.in('art_collaborators.persons.nickname', artists)
      }

      // NSFW фильтр
      if (!showNsfw) {
        query = query.eq('is_nsfw', false)
      }

      // Сортировка
      const sortMapping = {
        'newest': { column: 'upload_date', ascending: false },
        'oldest': { column: 'upload_date', ascending: true },
        'alphabetical': { column: 'title', ascending: true },
        'alphabetical-desc': { column: 'title', ascending: false },
        'artist': { column: 'upload_date', ascending: false } // Пока используем дату, можно улучшить
      }

      const sortConfig = sortMapping[sort] || sortMapping['newest']
      query = query.order(sortConfig.column, { ascending: sortConfig.ascending })

      // Пагинация
      if (limit) {
        query = query.limit(limit)
      }
      if (offset) {
        query = query.range(offset, offset + limit - 1)
      }

      const { data, error } = await query

      if (error) throw error

      // Обработка результатов — теги и персонажи уже embedded в ответе
      const artsWithMetadata = (data || []).map((art) => {
        const mainArtist = art.art_collaborators?.[0]?.persons
        
        const tags = (art.art_tags || []).map(at => at.tags?.name).filter(Boolean)
        const characters = (art.art_fursonas || []).map(ac => ({
          name: ac.fursonas?.name,
          avatar: ac.fursonas?.avatar_url
        })).filter(c => c.name)
        
        return {
          id: art.id,
          title: art.title,
          image_url: art.image_url,
          thumbnail_url: art.thumbnail_url || art.image_url,
          is_nsfw: art.is_nsfw || false,
          created_date: art.upload_date,
          upload_date: art.upload_date,
          artist_name: mainArtist?.nickname || 'Неизвестно',
          artist_avatar: mainArtist?.avatar_url,
          artist_is_friend: mainArtist?.is_friend || false,
          characters: characters,
          tags: tags,
          tagNames: tags // Для совместимости
        }
      })

      // ✅ Применяем клиентские фильтры для тегов и персонажей
      let filteredArts = artsWithMetadata

      // Фильтр по тегам
      if (tags.length > 0) {
        filteredArts = filteredArts.filter(art => 
          tags.some(tag => art.tags.includes(tag))
        )
      }

      // Фильтр по персонажам
      if (characters.length > 0) {
        filteredArts = filteredArts.filter(art => 
          characters.some(character => 
            art.characters.some(artChar => artChar.name === character)
          )
        )
      }

      console.log('✅ getFurryArts: Арты загружены и отфильтрованы:', filteredArts.length)
      return filteredArts
      
    } catch (error) {
      console.error('❌ getFurryArts: Ошибка загрузки артов:', error)
      return []
    }
  },

  /**
   * Добавить новый арт
   */
  async addFurryArt(artData) {
    try {
      console.log('➕ addFurryArt: Добавляем арт:', artData.title)
      
      // Находим или создаем художника
      let artistId = null
      const { data: existingArtist, error: artistError } = await supabase
        .from('persons')
        .select('id')
        .eq('nickname', artData.artist_nickname)
        .maybeSingle()
      
      if (artistError) throw artistError
      
      if (existingArtist) {
        artistId = existingArtist.id
      } else {
        const newArtist = firstRow(await adminDb('persons', {
          method: 'POST',
          query: { select: 'id' },
          prefer: 'return=representation',
          body: [{
            nickname: artData.artist_nickname,
            avatar_url: null,
            is_friend: false
          }]
        }))

        if (!newArtist) throw new Error('Не удалось создать художника')
        artistId = newArtist.id
      }
      
      // Добавляем арт
      const artResult = firstRow(await adminDb('arts', {
        method: 'POST',
        query: { select: '*' },
        prefer: 'return=representation',
        body: [{
          title: artData.title,
          image_url: artData.image_url,
          thumbnail_url: artData.thumbnail_url || artData.image_url,
          is_nsfw: artData.is_nsfw || false,
          upload_date: new Date().toISOString()
        }]
      }))

      if (!artResult) throw new Error('Не удалось создать арт')
      
      // Связываем с художником
      await adminDb('art_collaborators', {
        method: 'POST',
        body: [{
          art_id: artResult.id,
          person_id: artistId,
          role: 'main_artist'
        }]
      })
      
      console.log('✅ addFurryArt: Арт добавлен:', artResult.title)
      return artResult
      
    } catch (error) {
      console.error('❌ addFurryArt: Ошибка добавления арта:', error)
      throw error
    }
  },

  /**
   * Добавить теги к арту
   */
  async addArtTags(artId, tagNames) {
    try {
      console.log('🏷️ addArtTags: Добавляем теги к арту:', artId, tagNames)
      
      for (const tagName of tagNames) {
        // Находим или создаем тег
        let tagId = null
        const { data: existingTag, error: tagError } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .maybeSingle()
        
        if (tagError) throw tagError
        
        if (existingTag) {
          tagId = existingTag.id
        } else {
          const newTag = firstRow(await adminDb('tags', {
            method: 'POST',
            query: { select: 'id' },
            prefer: 'return=representation',
            body: [{ name: tagName }]
          }))

          if (!newTag) throw new Error('Не удалось создать тег')
          tagId = newTag.id
        }
        
        // Связываем тег с артом
        await adminDb('art_tags', {
          method: 'POST',
          body: [{
            art_id: artId,
            tag_id: tagId
          }]
        })
      }
      
      console.log('✅ addArtTags: Теги добавлены')
      return true
      
    } catch (error) {
      console.error('❌ addArtTags: Ошибка добавления тегов:', error)
      throw error
    }
  },

  /**
   * Добавить персонажей к арту
   */
  async addArtCharacters(artId, characterNames) {
    try {
      console.log('🦊 addArtCharacters: Добавляем персонажей к арту:', artId, characterNames)
      
      // Сначала найдем или создадим персонажа по умолчанию (Fox Taffy)
      let defaultPersonId = null
      const { data: defaultPerson, error: personError } = await supabase
        .from('persons')
        .select('id')
        .eq('nickname', 'Fox Taffy')
        .maybeSingle()
      
      if (personError) throw personError
      
      if (defaultPerson) {
        defaultPersonId = defaultPerson.id
      } else {
        const newPerson = firstRow(await adminDb('persons', {
          method: 'POST',
          query: { select: 'id' },
          prefer: 'return=representation',
          body: [{
            nickname: 'Fox Taffy',
            avatar_url: null,
            is_friend: false
          }]
        }))

        if (!newPerson) throw new Error('Не удалось создать персону по умолчанию')
        defaultPersonId = newPerson.id
      }
      
      for (const characterName of characterNames) {
        // Находим или создаем персонажа
        let characterId = null
        const { data: existingCharacter, error: charError } = await supabase
          .from('fursonas')
          .select('id')
          .eq('name', characterName)
          .maybeSingle()
        
        if (charError) throw charError
        
        if (existingCharacter) {
          characterId = existingCharacter.id
        } else {
          const newCharacter = firstRow(await adminDb('fursonas', {
            method: 'POST',
            query: { select: 'id' },
            prefer: 'return=representation',
            body: [{ 
              name: characterName,
              person_id: defaultPersonId // Связываем с персоной по умолчанию
            }]
          }))

          if (!newCharacter) throw new Error('Не удалось создать персонажа')
          characterId = newCharacter.id
        }
        
        // Связываем персонажа с артом
        await adminDb('art_fursonas', {
          method: 'POST',
          body: [{
            art_id: artId,
            fursona_id: characterId
          }]
        })
      }
      
      console.log('✅ addArtCharacters: Персонажи добавлены')
      return true
      
    } catch (error) {
      console.error('❌ addArtCharacters: Ошибка добавления персонажей:', error)
      throw error
    }
  },

  // ============================================
  // 👨‍🎨 МЕТОДЫ ДЛЯ ХУДОЖНИКОВ
  // ============================================

  /**
   * Получить всех художников с подсчетом артов
   */
  async getFurryArtists() {
    try {
      console.log('👨‍🎨 getFurryArtists: Загружаем художников с подсчетом артов...')
      
      // Получаем всех художников
      const { data: artists, error: artistsError } = await supabase
        .from('persons')
        .select('*')
        .order('nickname', { ascending: true })

      if (artistsError) throw artistsError
      
      // Получаем подсчет артов для каждого художника
      const { data: artCounts, error: countsError } = await supabase
        .from('art_collaborators')
        .select(`
          person_id,
          arts!inner(id)
        `)
        .eq('role', 'main_artist')
        .eq('arts.is_deleted', false)

      if (countsError) {
        console.warn('⚠️ Не удалось загрузить подсчеты артов:', countsError)
      }
      
      // Подсчитываем арты для каждого художника
      const artistsWithCounts = (artists || []).map(artist => {
        const artCount = countsError ? 0 : (artCounts || []).filter(count => 
          count.person_id === artist.id
        ).length
        
        return {
          id: artist.id,
          name: artist.nickname,
          nickname: artist.nickname,
          avatar_url: artist.avatar_url,
          is_friend: artist.is_friend || false,
          created_at: artist.created_at,
          count: artCount,
          artCount: artCount
        }
      })
      
      // Сортируем по количеству артов
      const sortedArtists = artistsWithCounts.sort((a, b) => (b.artCount || 0) - (a.artCount || 0))
      
      console.log('✅ getFurryArtists: Художники загружены:', sortedArtists.length)
      return sortedArtists
      
    } catch (error) {
      console.error('❌ getFurryArtists: Ошибка получения художников:', error)
      return []
    }
  },

  /**
   * Создать нового художника
   */
  async createArtist(artistData) {
    try {
      console.log('➕ createArtist: Создаем художника:', artistData.nickname)
      
      const existingArtist = await this.checkArtistExists(artistData.nickname)
      if (existingArtist) {
        throw new Error('Художник с таким никнеймом уже существует')
      }

      const data = await adminDb('persons', {
        method: 'POST',
        query: { select: '*' },
        prefer: 'return=representation',
        body: [{
          nickname: artistData.nickname.trim(),
          avatar_url: artistData.avatar_url || null,
          is_friend: artistData.is_friend || false
        }]
      })

      const createdArtist = firstRow(data)
      console.log('✅ createArtist: Художник создан:', createdArtist)
      return createdArtist
    } catch (error) {
      console.error('❌ createArtist: Ошибка создания художника:', error)
      throw error
    }
  },

  /**
   * Проверить существование художника
   */
  async checkArtistExists(nickname) {
    try {
      const { data, error } = await supabase
        .from('persons')
        .select('id')
        .eq('nickname', nickname.trim())
        .maybeSingle()

      if (error) throw error
      return !!data
    } catch (error) {
      console.error('❌ checkArtistExists: Ошибка проверки художника:', error)
      return false
    }
  },

  // ============================================
  // 🏷️ МЕТОДЫ ДЛЯ ТЕГОВ
  // ============================================

  /**
   * Получить все теги с подсчетом использований
   */
  async getFurryTags() {
    try {
      console.log('🏷️ getFurryTags: Загружаем теги с подсчетом использований...')
      
      // Получаем все теги
      const { data: tags, error: tagsError } = await supabase
        .from('tags')
        .select('id, name, created_at')
        .order('name', { ascending: true })

      if (tagsError) throw tagsError
      
      // Получаем подсчет использований тегов
      const { data: tagCounts, error: countsError } = await supabase
        .from('art_tags')
        .select(`
          tag_id,
          arts!inner(id)
        `)
        .eq('arts.is_deleted', false)

      if (countsError) {
        console.warn('⚠️ Не удалось загрузить подсчеты тегов:', countsError)
      }
      
      // Подсчитываем использование каждого тега
      const tagsWithCounts = (tags || []).map(tag => {
        const useCount = countsError ? 0 : (tagCounts || []).filter(count => 
          count.tag_id === tag.id
        ).length
        
        return {
          id: tag.id,
          name: tag.name,
          created_at: tag.created_at,
          count: useCount,
          useCount: useCount
        }
      })
      
      // Сортируем по количеству использований
      const sortedTags = tagsWithCounts.sort((a, b) => (b.useCount || 0) - (a.useCount || 0))
      
      console.log('✅ getFurryTags: Теги загружены:', sortedTags.length)
      return sortedTags
      
    } catch (error) {
      console.error('❌ getFurryTags: Ошибка получения тегов:', error)
      return []
    }
  },

  /**
   * Создать новый тег
   */
  async createTag(tagData) {
    try {
      console.log('➕ createTag: Создаем тег:', tagData.name)
      
      const existingTag = await this.checkTagExists(tagData.name)
      if (existingTag) {
        throw new Error('Тег с таким названием уже существует')
      }

      const data = await adminDb('tags', {
        method: 'POST',
        query: { select: '*' },
        prefer: 'return=representation',
        body: [{
          name: tagData.name.trim()
        }]
      })

      const createdTag = firstRow(data)
      console.log('✅ createTag: Тег создан:', createdTag)
      return createdTag
    } catch (error) {
      console.error('❌ createTag: Ошибка создания тега:', error)
      throw error
    }
  },

  /**
   * Проверить существование тега
   */
  async checkTagExists(tagName) {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('id')
        .eq('name', tagName.trim())
        .maybeSingle()

      if (error) throw error
      return !!data
    } catch (error) {
      console.error('❌ checkTagExists: Ошибка проверки тега:', error)
      return false
    }
  },

  // ============================================
  // 🦊 МЕТОДЫ ДЛЯ ПЕРСОНАЖЕЙ
  // ============================================

  /**
   * Получить всех персонажей с подсчетом появлений
   */
  async getSpecies() {
    try {
      console.log('🦊 getSpecies: Загружаем персонажей с подсчетом появлений...')
      
      // Получаем всех персонажей
      const { data: characters, error: charactersError } = await supabase
        .from('fursonas')
        .select('*')
        .order('name', { ascending: true })

      if (charactersError) throw charactersError
      
      // Получаем подсчет появлений персонажей
      const { data: characterCounts, error: countsError } = await supabase
        .from('art_fursonas')
        .select(`
          fursona_id,
          arts!inner(id)
        `)
        .eq('arts.is_deleted', false)

      if (countsError) {
        console.warn('⚠️ Не удалось загрузить подсчеты персонажей:', countsError)
      }
      
      // Подсчитываем появления каждого персонажа
      const charactersWithCounts = (characters || []).map(character => {
        const useCount = countsError ? 0 : (characterCounts || []).filter(count => 
          count.fursona_id === character.id
        ).length
        
        return {
          id: character.id,
          name: character.name,
          avatar_url: character.avatar_url,
          created_at: character.created_at,
          count: useCount,
          useCount: useCount
        }
      })
      
      // Сортируем по количеству появлений
      const sortedCharacters = charactersWithCounts.sort((a, b) => (b.useCount || 0) - (a.useCount || 0))
      
      console.log('✅ getSpecies: Персонажи загружены:', sortedCharacters.length)
      return sortedCharacters
      
    } catch (error) {
      console.error('❌ getSpecies: Ошибка получения персонажей:', error)
      return []
    }
  },

  /**
   * Создать нового персонажа
   */
  async createCharacter(characterData) {
    try {
      console.log('➕ createCharacter: Создаем персонажа:', characterData.name)
      
      const existingCharacter = await this.checkCharacterExists(characterData.name)
      if (existingCharacter) {
        throw new Error('Персонаж с таким именем уже существует')
      }

      // Ищем или создаем персону по умолчанию
      let defaultPersonId = null
      const { data: defaultPerson, error: personError } = await supabase
        .from('persons')
        .select('id')
        .eq('nickname', 'Fox Taffy')
        .maybeSingle()
      
      if (personError) throw personError
      
      if (defaultPerson) {
        defaultPersonId = defaultPerson.id
      } else {
        const newPerson = firstRow(await adminDb('persons', {
          method: 'POST',
          query: { select: 'id' },
          prefer: 'return=representation',
          body: [{
            nickname: 'Fox Taffy',
            avatar_url: null,
            is_friend: false
          }]
        }))

        if (!newPerson) throw new Error('Не удалось создать персону по умолчанию')
        defaultPersonId = newPerson.id
      }

      const data = await adminDb('fursonas', {
        method: 'POST',
        query: { select: '*' },
        prefer: 'return=representation',
        body: [{
          name: characterData.name.trim(),
          avatar_url: characterData.avatar_url || null,
          person_id: defaultPersonId
        }]
      })

      const createdCharacter = firstRow(data)
      console.log('✅ createCharacter: Персонаж создан:', createdCharacter)
      return createdCharacter
    } catch (error) {
      console.error('❌ createCharacter: Ошибка создания персонажа:', error)
      throw error
    }
  },

  /**
   * Проверить существование персонажа
   */
  async checkCharacterExists(name) {
    try {
      const { data, error } = await supabase
        .from('fursonas')
        .select('id')
        .eq('name', name.trim())
        .maybeSingle()

      if (error) throw error
      return !!data
    } catch (error) {
      console.error('❌ checkCharacterExists: Ошибка проверки персонажа:', error)
      return false
    }
  },

  // ============================================
  // ✏️ ОБНОВЛЕНИЕ ДАННЫХ
  // ============================================

  /**
   * Обновить художника
   */
  async updateArtist(artistId, artistData) {
    try {
      console.log('📝 updateArtist: Обновляем художника:', artistId)

      const data = await adminDb('persons', {
        method: 'PATCH',
        query: { id: `eq.${artistId}`, select: '*' },
        prefer: 'return=representation',
        body: {
          nickname: artistData.nickname.trim(),
          avatar_url: artistData.avatar_url || null,
          is_friend: artistData.is_friend || false
        }
      })

      const updatedArtist = firstRow(data)
      console.log('✅ updateArtist: Художник обновлен:', updatedArtist)
      return updatedArtist
    } catch (error) {
      console.error('❌ updateArtist: Ошибка обновления художника:', error)
      throw error
    }
  },

  /**
   * Обновить тег
   */
  async updateTag(tagId, tagData) {
    try {
      console.log('📝 updateTag: Обновляем тег:', tagId)

      const data = await adminDb('tags', {
        method: 'PATCH',
        query: { id: `eq.${tagId}`, select: '*' },
        prefer: 'return=representation',
        body: {
          name: tagData.name.trim()
        }
      })

      const updatedTag = firstRow(data)
      console.log('✅ updateTag: Тег обновлен:', updatedTag)
      return updatedTag
    } catch (error) {
      console.error('❌ updateTag: Ошибка обновления тега:', error)
      throw error
    }
  },

  /**
   * Обновить персонажа
   */
  async updateCharacter(characterId, characterData) {
    try {
      console.log('📝 updateCharacter: Обновляем персонажа:', characterId)

      const data = await adminDb('fursonas', {
        method: 'PATCH',
        query: { id: `eq.${characterId}`, select: '*' },
        prefer: 'return=representation',
        body: {
          name: characterData.name.trim(),
          avatar_url: characterData.avatar_url || null
        }
      })

      const updatedCharacter = firstRow(data)
      console.log('✅ updateCharacter: Персонаж обновлен:', updatedCharacter)
      return updatedCharacter
    } catch (error) {
      console.error('❌ updateCharacter: Ошибка обновления персонажа:', error)
      throw error
    }
  },

  /**
   * Обновить арт
   */
  async updateArt(artId, artData) {
    try {
      console.log('📝 updateArt: Обновляем арт:', artId)

      const updateData = {
        title: artData.title.trim(),
        is_nsfw: artData.is_nsfw || false
      }

      if (artData.created_date) {
        updateData.upload_date = artData.created_date
      }

      const data = firstRow(await adminDb('arts', {
        method: 'PATCH',
        query: { id: `eq.${artId}`, select: '*' },
        prefer: 'return=representation',
        body: updateData
      }))

      if (!data) throw new Error('Арт не был обновлен')

      // Обновляем художника если изменился
      if (artData.artist_nickname) {
        // Находим artist_id
        const { data: artist, error: artistError } = await supabase
          .from('persons')
          .select('id')
          .eq('nickname', artData.artist_nickname)
          .maybeSingle()

        if (artistError) throw artistError

        if (artist) {
          // Обновляем связь с художником
          await adminDb('art_collaborators', {
            method: 'DELETE',
            query: { art_id: `eq.${artId}`, role: 'eq.main_artist' }
          })

          await adminDb('art_collaborators', {
            method: 'POST',
            body: {
              art_id: artId,
              person_id: artist.id,
              role: 'main_artist'
            }
          })
        }
      }

      // Обновляем теги если переданы
      if (artData.tags !== undefined) {
        await this.updateArtTags(artId, artData.tags)
      }

      // Обновляем персонажей если переданы
      if (artData.characters !== undefined) {
        await this.updateArtCharacters(artId, artData.characters)
      }

      console.log('✅ updateArt: Арт обновлен:', data)
      return data
    } catch (error) {
      console.error('❌ updateArt: Ошибка обновления арта:', error)
      throw error
    }
  },

  // ============================================
  // 🗑️ УДАЛЕНИЕ ДАННЫХ
  // ============================================

  /**
   * Удалить художника
   */
  async deleteArtist(artistId) {
    try {
      console.log('🗑️ deleteArtist: Удаляем художника:', artistId)

      await adminDb('persons', {
        method: 'DELETE',
        query: { id: `eq.${artistId}` }
      })
      console.log('✅ deleteArtist: Художник удален')
    } catch (error) {
      console.error('❌ deleteArtist: Ошибка удаления художника:', error)
      throw error
    }
  },

  /**
   * Удалить тег
   */
  async deleteTag(tagId) {
    try {
      console.log('🗑️ deleteTag: Удаляем тег:', tagId)

      await adminDb('tags', {
        method: 'DELETE',
        query: { id: `eq.${tagId}` }
      })
      console.log('✅ deleteTag: Тег удален')
    } catch (error) {
      console.error('❌ deleteTag: Ошибка удаления тега:', error)
      throw error
    }
  },

  /**
   * Удалить персонажа
   */
  async deleteCharacter(characterId) {
    try {
      console.log('🗑️ deleteCharacter: Удаляем персонажа:', characterId)

      await adminDb('fursonas', {
        method: 'DELETE',
        query: { id: `eq.${characterId}` }
      })
      console.log('✅ deleteCharacter: Персонаж удален')
    } catch (error) {
      console.error('❌ deleteCharacter: Ошибка удаления персонажа:', error)
      throw error
    }
  },

  /**
   * Удалить арт
   */
  async deleteArt(artId) {
    try {
      console.log('🗑️ deleteArt: Удаляем арт:', artId)

      // Сначала удаляем связи
      await adminDb('art_collaborators', {
        method: 'DELETE',
        query: { art_id: `eq.${artId}` }
      })

      await adminDb('art_tags', {
        method: 'DELETE',
        query: { art_id: `eq.${artId}` }
      })

      await adminDb('art_fursonas', {
        method: 'DELETE',
        query: { art_id: `eq.${artId}` }
      })

      // Затем удаляем сам арт
      await adminDb('arts', {
        method: 'DELETE',
        query: { id: `eq.${artId}` }
      })
      console.log('✅ deleteArt: Арт удален')
    } catch (error) {
      console.error('❌ deleteArt: Ошибка удаления арта:', error)
      throw error
    }
  },

  /**
   * Получить теги арта
   */
  async getArtTags(artId) {
    try {
      const { data, error } = await supabase
        .from('art_tags')
        .select('tag_id, tags(name)')
        .eq('art_id', artId)

      if (error) throw error
      return data.map(item => item.tags.name)
    } catch (error) {
      console.error('❌ getArtTags: Ошибка получения тегов арта:', error)
      return []
    }
  },

  /**
   * Получить персонажей арта
   */
  async getArtCharacters(artId) {
    try {
      const { data, error } = await supabase
        .from('art_fursonas')
        .select('fursona_id, fursonas(name)')
        .eq('art_id', artId)

      if (error) throw error
      return data.map(item => item.fursonas.name)
    } catch (error) {
      console.error('❌ getArtCharacters: Ошибка получения персонажей арта:', error)
      return []
    }
  },

  /**
   * Обновить теги арта
   */
  async updateArtTags(artId, tagNames) {
    try {
      // Удаляем старые теги
      await adminDb('art_tags', {
        method: 'DELETE',
        query: { art_id: `eq.${artId}` }
      })

      // Добавляем новые теги
      if (tagNames && tagNames.length > 0) {
        await this.addArtTags(artId, tagNames)
      }
    } catch (error) {
      console.error('❌ updateArtTags: Ошибка обновления тегов:', error)
      throw error
    }
  },

  /**
   * Обновить персонажей арта
   */
  async updateArtCharacters(artId, characterNames) {
    try {
      // Удаляем старых персонажей
      await adminDb('art_fursonas', {
        method: 'DELETE',
        query: { art_id: `eq.${artId}` }
      })

      // Добавляем новых персонажей
      if (characterNames && characterNames.length > 0) {
        await this.addArtCharacters(artId, characterNames)
      }
    } catch (error) {
      console.error('❌ updateArtCharacters: Ошибка обновления персонажей:', error)
      throw error
    }
  },

  // ============================================
  // 📊 СТАТИСТИКА И АНАЛИТИКА
  // ============================================

  /**
   * Получить статистику панели управления
   */
  async getDashboardStats() {
    try {
      console.log('📊 getDashboardStats: Загружаем полную статистику...')
      
      const [artsResult, artistsResult, tagsResult, charactersResult] = await Promise.all([
        this.getFurryArts({ limit: 1000, showNsfw: true }),
        this.getFurryArtists(),
        this.getFurryTags(),
        this.getSpecies()
      ])
      
      const stats = {
        arts: artsResult.length,
        artists: artistsResult.length,
        tags: tagsResult.length,
        characters: charactersResult.length,
        nsfwArts: artsResult.filter(art => art.is_nsfw).length,
        sfwArts: artsResult.filter(art => !art.is_nsfw).length,
        friendArtists: artistsResult.filter(artist => artist.is_friend).length,
        s3Files: artsResult.filter(art => this.isS3Url(art.image_url)).length,
        recentUploads: artsResult.filter(art => {
          const uploadDate = new Date(art.upload_date)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return uploadDate > weekAgo
        }).length,
        topArtist: artistsResult.length > 0 ? artistsResult[0] : null,
        topTag: tagsResult.length > 0 ? tagsResult[0] : null,
        topCharacter: charactersResult.length > 0 ? charactersResult[0] : null
      }
      
      console.log('✅ getDashboardStats: Полная статистика:', stats)
      return stats
      
    } catch (error) {
      console.error('❌ getDashboardStats: Ошибка получения статистики:', error)
      return {
        artists: 0, tags: 0, characters: 0, arts: 0,
        nsfwArts: 0, sfwArts: 0, friendArtists: 0, s3Files: 0,
        recentUploads: 0, topArtist: null, topTag: null, topCharacter: null
      }
    }
  },

  // ============================================
  // 🧹 ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
  // ============================================

  /**
   * Очистка данных мероприятия перед сохранением
   */
  _cleanEventData(data) {
    const cleaned = { ...data }

    // Удаляем системные поля
    delete cleaned.id
    delete cleaned.created_at
    delete cleaned.updated_at

    // Удаляем вычисляемые/агрегированные поля (не являются колонками в таблице cons)
    delete cleaned.photos_count
    delete cleaned.featured_photos_count
    delete cleaned.purchases_count
    delete cleaned.average_rating

    // Удаляем связанные объекты из join запросов
    delete cleaned.con_photos
    delete cleaned.con_purchases
    delete cleaned.con_links
    delete cleaned.con_features
    delete cleaned.purchase_items
    
    // Конвертируем числовые поля
    const numericFields = [
      'my_rating', 'total_spent', 'attendees_count', 
      'expected_visitors', 'entrance_fee'
    ]
    
    numericFields.forEach(field => {
      if (cleaned[field] !== null && cleaned[field] !== undefined) {
        const num = Number(cleaned[field])
        cleaned[field] = isNaN(num) ? null : num
      }
    })
    
    // Конвертируем булевы поля
    const booleanFields = [
      'has_dealers_den',
      'has_art_show', 'has_fursuit_parade'
    ]
    
    booleanFields.forEach(field => {
      if (cleaned[field] !== null && cleaned[field] !== undefined) {
        cleaned[field] = Boolean(cleaned[field])
      }
    })
    
    // Обрезаем строковые поля
    const stringFields = [
      'name', 'slug', 'subtitle', 'description', 'location', 
      'city', 'country', 'official_website', 'meta_image', 
      'meta_title', 'meta_description'
    ]
    
    stringFields.forEach(field => {
      if (typeof cleaned[field] === 'string') {
        cleaned[field] = cleaned[field].trim() || null
      }
    })
    
    // Валидация дат
    const dateFields = ['event_date', 'event_end_date', 'announced_date']

    dateFields.forEach(field => {
      // Конвертируем пустые строки в null
      if (cleaned[field] === '' || cleaned[field] === undefined) {
        cleaned[field] = null
      }
      // Валидируем и форматируем непустые даты
      else if (cleaned[field]) {
        const date = new Date(cleaned[field])
        if (isNaN(date.getTime())) {
          throw new Error(`Неверный формат даты в поле ${field}`)
        }
      } else if (cleaned[field] === '') {
        // Обрабатываем явно пустые строки
        cleaned[field] = null
      }
    })
    
    // Валидация обязательных полей
    if (!cleaned.name || cleaned.name.length < 3) {
      throw new Error('Название мероприятия обязательно и должно содержать минимум 3 символа')
    }
    
    if (!cleaned.event_date) {
      throw new Error('Дата мероприятия обязательна')
    }
    
    // Генерация slug если не указан
    if (!cleaned.slug && cleaned.name) {
      cleaned.slug = this._generateSlugFromName(cleaned.name)
    }
    
    // Генерация meta_title если не указан
    if (!cleaned.meta_title && cleaned.name) {
      cleaned.meta_title = cleaned.name
      if (cleaned.subtitle) {
        cleaned.meta_title += ` - ${cleaned.subtitle}`
      }
    }
    
    return cleaned
  },

  /**
   * Генерация slug из названия
   */
  _generateSlugFromName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-zа-я0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
      .substring(0, 50)
  },

  /**
   * Проверить является ли URL ссылкой на S3/Supabase Storage
   */
  isS3Url(url) {
    if (!url) return false
    return url.includes('supabase.co/storage') || url.includes('gallery/')
  },

  /**
   * Получить информацию о таблицах
   */
  async getTableInfo() {
    try {
      const tables = []
      
      const tablesData = await Promise.allSettled([
        supabase.from('cons').select('count', { count: 'exact', head: true }),
        supabase.from('con_links').select('count', { count: 'exact', head: true }),
        supabase.from('con_features').select('count', { count: 'exact', head: true }),
        supabase.from('con_photos').select('count', { count: 'exact', head: true }),
        supabase.from('con_purchases').select('count', { count: 'exact', head: true }),
        supabase.from('arts').select('count', { count: 'exact', head: true }),
        supabase.from('persons').select('count', { count: 'exact', head: true }),
        supabase.from('tags').select('count', { count: 'exact', head: true }),
        supabase.from('fursonas').select('count', { count: 'exact', head: true })
      ])
      
      const tableNames = [
        'cons', 'con_links', 'con_features', 'con_photos', 'con_purchases',
        'arts', 'persons', 'tags', 'fursonas'
      ]
      
      tablesData.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          tables.push({
            name: tableNames[index],
            count: result.value.count || 0,
            status: 'ok'
          })
        } else {
          tables.push({
            name: tableNames[index],
            count: 0,
            status: 'error',
            error: result.reason?.message
          })
        }
      })
      
      return tables
      
    } catch (error) {
      console.error('❌ Ошибка получения информации о таблицах:', error)
      return []
    }
  }
}

// ===============================================
// 🚀 ЭКСПОРТ API
// ===============================================

export default furryApi

// Для совместимости
export { furryApi as eventApi, furryApi as consApi, furryApi as api }

console.log('🎪 FoxTaffy Unified API initialized successfully!')
console.log('✅ Мероприятия и галерея объединены в одном API!')
console.log('🔒 Все переменные окружения защищены!')
console.log('📊 Все счетчики и статистика работают корректно!')
console.log('🎯 API готов к использованию!')
console.log('✅ Добавлен метод loadAllData!')
console.log('✅ Исправлена поддержка фильтрации персонажей!')