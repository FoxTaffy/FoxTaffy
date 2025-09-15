// ===============================================
// 🎪 FOXTAFFY.FUN - ПОЛНЫЙ SUPABASE API
// Система управления мероприятиями
// ===============================================

import { createClient } from '@supabase/supabase-js'

// ===============================================
// 🔧 КОНФИГУРАЦИЯ SUPABASE
// ===============================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ Supabase environment variables are not set')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
})

// ===============================================
// 🎪 ОСНОВНОЙ API КЛАСС
// ===============================================

export const furryApi = {

  // ============================================
  // 📅 ОСНОВНЫЕ МЕТОДЫ МЕРОПРИЯТИЙ (CONS)
  // ============================================

  /**
   * Получить список всех мероприятий
   * @param {Object} options - Опции фильтрации и сортировки
   * @returns {Promise<Array>} Список мероприятий
   */
  async getEvents(options = {}) {
    try {
      console.log('🔍 Загружаем мероприятия с опциями:', options)
      
      let query = supabase.from('events_full_stats').select('*')
      
      // Фильтрация по статусу
      if (options.status === 'upcoming') {
        query = query.gt('event_date', new Date().toISOString())
      } else if (options.status === 'completed') {
        query = query.lt('event_date', new Date().toISOString())
      } else if (options.status === 'featured') {
        query = query.eq('is_featured', true)
      }
      
      // Фильтрация по типу мероприятия
      if (options.event_type) {
        query = query.eq('event_type', options.event_type)
      }
      
      // Фильтрация по статусу участия
      if (options.attendance_status) {
        query = query.eq('attendance_status', options.attendance_status)
      }
      
      // Фильтрация по городу
      if (options.city) {
        query = query.eq('city', options.city)
      }
      
      // Поиск по тексту
      if (options.search) {
        query = query.or(`name.ilike.%${options.search}%,location.ilike.%${options.search}%,subtitle.ilike.%${options.search}%`)
      }
      
      // Сортировка
      const sortOptions = {
        'date_asc': { column: 'event_date', ascending: true },
        'date_desc': { column: 'event_date', ascending: false },
        'name_asc': { column: 'name', ascending: true },
        'name_desc': { column: 'name', ascending: false },
        'rating_desc': { column: 'my_rating', ascending: false },
        'created_desc': { column: 'created_at', ascending: false }
      }
      
      const sort = sortOptions[options.sort] || sortOptions['date_desc']
      query = query.order(sort.column, { ascending: sort.ascending })
      
      // Лимит результатов
      if (options.limit) {
        query = query.limit(options.limit)
      }
      
      // Смещение для пагинации
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      console.log(`✅ Загружено ${data?.length || 0} мероприятий`)
      return data || []
      
    } catch (error) {
      console.error('❌ Ошибка загрузки мероприятий:', error)
      throw new Error(`Ошибка загрузки мероприятий: ${error.message}`)
    }
  },

  /**
   * Получить мероприятие по slug
   * @param {string} slug - URL slug мероприятия
   * @returns {Promise<Object|null>} Мероприятие или null
   */
  async getEventBySlug(slug) {
    try {
      console.log('🔍 Загружаем мероприятие по slug:', slug)
      
      const { data, error } = await supabase
        .from('events_full_stats')
        .select('*')
        .eq('slug', slug)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log('❌ Мероприятие не найдено:', slug)
          return null
        }
        throw error
      }
      
      console.log('✅ Мероприятие загружено:', data.name)
      return data
      
    } catch (error) {
      console.error('❌ Ошибка загрузки мероприятия:', error)
      throw new Error(`Ошибка загрузки мероприятия: ${error.message}`)
    }
  },

  /**
   * Создать новое мероприятие
   * @param {Object} eventData - Данные мероприятия
   * @returns {Promise<Object>} Созданное мероприятие
   */
  async createEvent(eventData) {
    try {
      console.log('➕ Создаём новое мероприятие:', eventData.name)
      
      // Подготавливаем данные
      const cleanData = this._cleanEventData(eventData)
      
      // Создаём мероприятие
      const { data, error } = await supabase
        .from('cons')
        .insert([cleanData])
        .select('*')
        .single()
      
      if (error) throw error
      
      console.log('✅ Мероприятие создано:', data.name)
      return data
      
    } catch (error) {
      console.error('❌ Ошибка создания мероприятия:', error)
      throw new Error(`Ошибка создания мероприятия: ${error.message}`)
    }
  },

  /**
   * Обновить мероприятие
   * @param {string} eventId - ID мероприятия
   * @param {Object} updateData - Данные для обновления
   * @returns {Promise<Object>} Обновлённое мероприятие
   */
  async updateEvent(eventId, updateData) {
    try {
      console.log('📝 Обновляем мероприятие:', eventId)
      
      // Подготавливаем данные
      const cleanData = this._cleanEventData(updateData)
      cleanData.updated_at = new Date().toISOString()
      
      const { data, error } = await supabase
        .from('cons')
        .update(cleanData)
        .eq('id', eventId)
        .select('*')
        .single()
      
      if (error) throw error
      
      console.log('✅ Мероприятие обновлено:', data.name)
      return data
      
    } catch (error) {
      console.error('❌ Ошибка обновления мероприятия:', error)
      throw new Error(`Ошибка обновления мероприятия: ${error.message}`)
    }
  },

  /**
   * Удалить мероприятие
   * @param {string} eventId - ID мероприятия
   * @returns {Promise<boolean>} Успешность удаления
   */
  async deleteEvent(eventId) {
    try {
      console.log('🗑️ Удаляем мероприятие:', eventId)
      
      const { error } = await supabase
        .from('cons')
        .delete()
        .eq('id', eventId)
      
      if (error) throw error
      
      console.log('✅ Мероприятие удалено')
      return true
      
    } catch (error) {
      console.error('❌ Ошибка удаления мероприятия:', error)
      throw new Error(`Ошибка удаления мероприятия: ${error.message}`)
    }
  },

  // ============================================
  // 🔗 МЕТОДЫ ДЛЯ ССЫЛОК (CON_LINKS)
  // ============================================

  /**
   * Получить ссылки мероприятия
   * @param {string} eventId - ID мероприятия
   * @returns {Promise<Array>} Список ссылок
   */
  async getEventLinks(eventId) {
    try {
      console.log('🔗 Загружаем ссылки для мероприятия:', eventId)
      
      const { data, error } = await supabase
        .from('con_links')
        .select('*')
        .eq('con_id', eventId)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true })
      
      if (error) throw error
      
      console.log(`✅ Загружено ${data?.length || 0} ссылок`)
      return data || []
      
    } catch (error) {
      console.error('❌ Ошибка загрузки ссылок:', error)
      throw new Error(`Ошибка загрузки ссылок: ${error.message}`)
    }
  },

  /**
   * Добавить ссылку к мероприятию
   * @param {string} eventId - ID мероприятия
   * @param {Object} linkData - Данные ссылки
   * @returns {Promise<Object>} Созданная ссылка
   */
  async addEventLink(eventId, linkData) {
    try {
      console.log('➕ Добавляем ссылку к мероприятию:', eventId)
      
      const { data, error } = await supabase
        .from('con_links')
        .insert([{
          con_id: eventId,
          link_type: linkData.link_type || 'website',
          title: linkData.title?.trim(),
          url: linkData.url?.trim(),
          description: linkData.description?.trim(),
          icon_class: linkData.icon_class?.trim(),
          display_order: linkData.display_order || 0,
          is_primary: linkData.is_primary || false,
          is_active: linkData.is_active !== false
        }])
        .select('*')
        .single()
      
      if (error) throw error
      
      console.log('✅ Ссылка добавлена:', data.title)
      return data
      
    } catch (error) {
      console.error('❌ Ошибка добавления ссылки:', error)
      throw new Error(`Ошибка добавления ссылки: ${error.message}`)
    }
  },

  /**
   * Обновить ссылку
   * @param {string} linkId - ID ссылки
   * @param {Object} updateData - Данные для обновления
   * @returns {Promise<Object>} Обновлённая ссылка
   */
  async updateEventLink(linkId, updateData) {
    try {
      const { data, error } = await supabase
        .from('con_links')
        .update(updateData)
        .eq('id', linkId)
        .select('*')
        .single()
      
      if (error) throw error
      return data
      
    } catch (error) {
      console.error('❌ Ошибка обновления ссылки:', error)
      throw new Error(`Ошибка обновления ссылки: ${error.message}`)
    }
  },

  /**
   * Удалить ссылку
   * @param {string} linkId - ID ссылки
   * @returns {Promise<boolean>} Успешность удаления
   */
  async deleteEventLink(linkId) {
    try {
      const { error } = await supabase
        .from('con_links')
        .delete()
        .eq('id', linkId)
      
      if (error) throw error
      return true
      
    } catch (error) {
      console.error('❌ Ошибка удаления ссылки:', error)
      throw new Error(`Ошибка удаления ссылки: ${error.message}`)
    }
  },

  // ============================================
  // ⭐ МЕТОДЫ ДЛЯ ОСОБЕННОСТЕЙ (CON_FEATURES)
  // ============================================

  /**
   * Получить особенности мероприятия
   * @param {string} eventId - ID мероприятия
   * @returns {Promise<Array>} Список особенностей
   */
  async getEventFeatures(eventId) {
    try {
      console.log('⭐ Загружаем особенности для мероприятия:', eventId)
      
      const { data, error } = await supabase
        .from('con_features')
        .select('*')
        .eq('con_id', eventId)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true })
      
      if (error) throw error
      
      console.log(`✅ Загружено ${data?.length || 0} особенностей`)
      return data || []
      
    } catch (error) {
      console.error('❌ Ошибка загрузки особенностей:', error)
      throw new Error(`Ошибка загрузки особенностей: ${error.message}`)
    }
  },

  /**
   * Добавить особенность к мероприятию
   * @param {string} eventId - ID мероприятия
   * @param {Object} featureData - Данные особенности
   * @returns {Promise<Object>} Созданная особенность
   */
  async addEventFeature(eventId, featureData) {
    try {
      console.log('➕ Добавляем особенность к мероприятию:', eventId)
      
      const { data, error } = await supabase
        .from('con_features')
        .insert([{
          con_id: eventId,
          feature_type: featureData.feature_type || 'activity',
          title: featureData.title?.trim(),
          description: featureData.description?.trim(),
          icon_class: featureData.icon_class?.trim(),
          start_time: featureData.start_time,
          end_time: featureData.end_time,
          location_details: featureData.location_details?.trim(),
          requirements: featureData.requirements?.trim(),
          max_participants: featureData.max_participants,
          display_order: featureData.display_order || 0,
          is_featured: featureData.is_featured || false,
          is_free: featureData.is_free !== false,
          price: featureData.price || 0
        }])
        .select('*')
        .single()
      
      if (error) throw error
      
      console.log('✅ Особенность добавлена:', data.title)
      return data
      
    } catch (error) {
      console.error('❌ Ошибка добавления особенности:', error)
      throw new Error(`Ошибка добавления особенности: ${error.message}`)
    }
  },

  /**
   * Обновить особенность
   * @param {string} featureId - ID особенности
   * @param {Object} updateData - Данные для обновления
   * @returns {Promise<Object>} Обновлённая особенность
   */
  async updateEventFeature(featureId, updateData) {
    try {
      const { data, error } = await supabase
        .from('con_features')
        .update(updateData)
        .eq('id', featureId)
        .select('*')
        .single()
      
      if (error) throw error
      return data
      
    } catch (error) {
      console.error('❌ Ошибка обновления особенности:', error)
      throw new Error(`Ошибка обновления особенности: ${error.message}`)
    }
  },

  /**
   * Удалить особенность
   * @param {string} featureId - ID особенности
   * @returns {Promise<boolean>} Успешность удаления
   */
  async deleteEventFeature(featureId) {
    try {
      const { error } = await supabase
        .from('con_features')
        .delete()
        .eq('id', featureId)
      
      if (error) throw error
      return true
      
    } catch (error) {
      console.error('❌ Ошибка удаления особенности:', error)
      throw new Error(`Ошибка удаления особенности: ${error.message}`)
    }
  },

  // ============================================
  // 📸 МЕТОДЫ ДЛЯ ФОТОГРАФИЙ (CON_PHOTOS)
  // ============================================

  /**
   * Получить фотографии мероприятия
   * @param {string} eventId - ID мероприятия
   * @param {Object} options - Опции фильтрации
   * @returns {Promise<Array>} Список фотографий
   */
  async getEventPhotos(eventId, options = {}) {
    try {
      console.log('📸 Загружаем фотографии для мероприятия:', eventId)
      
      let query = supabase
        .from('con_photos')
        .select('*')
        .eq('con_id', eventId)
      
      // Фильтрация по типу фотографии
      if (options.photo_type) {
        query = query.eq('photo_type', options.photo_type)
      }
      
      // Только избранные фото
      if (options.featured_only) {
        query = query.eq('is_featured', true)
      }
      
      // Только главные фото (аватары событий)
      if (options.avatar_only) {
        query = query.eq('is_avatar', true)
      }
      
      // Лимит
      if (options.limit) {
        query = query.limit(options.limit)
      }
      
      // Сортировка
      const sortBy = options.sort || 'display_order'
      const sortOrder = options.order === 'desc' ? { ascending: false } : { ascending: true }
      query = query.order(sortBy, sortOrder)
      
      // Дополнительная сортировка по дате
      if (sortBy !== 'taken_at') {
        query = query.order('taken_at', { ascending: false })
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      console.log(`✅ Загружено ${data?.length || 0} фотографий`)
      return data || []
      
    } catch (error) {
      console.error('❌ Ошибка загрузки фотографий:', error)
      throw new Error(`Ошибка загрузки фотографий: ${error.message}`)
    }
  },

  /**
   * Добавить фотографию к мероприятию
   * @param {string} eventId - ID мероприятия
   * @param {Object} photoData - Данные фотографии
   * @returns {Promise<Object>} Созданная фотография
   */
  async addEventPhoto(eventId, photoData) {
    try {
      console.log('➕ Добавляем фотографию к мероприятию:', eventId)
      
      const { data, error } = await supabase
        .from('con_photos')
        .insert([{
          con_id: eventId,
          image_url: photoData.image_url?.trim(),
          thumbnail_url: photoData.thumbnail_url?.trim(),
          caption: photoData.caption?.trim(),
          alt_text: photoData.alt_text?.trim(),
          photo_type: photoData.photo_type || 'general',
          is_featured: photoData.is_featured || false,
          is_avatar: photoData.is_avatar || false,
          taken_at: photoData.taken_at,
          taken_by: photoData.taken_by?.trim(),
          camera_info: photoData.camera_info?.trim(),
          width: photoData.width,
          height: photoData.height,
          file_size: photoData.file_size,
          format: photoData.format,
          latitude: photoData.latitude,
          longitude: photoData.longitude,
          display_order: photoData.display_order || 0,
          copyright_holder: photoData.copyright_holder?.trim(),
          license: photoData.license || 'personal_use',
          exif_data: photoData.exif_data || {}
        }])
        .select('*')
        .single()
      
      if (error) throw error
      
      console.log('✅ Фотография добавлена')
      return data
      
    } catch (error) {
      console.error('❌ Ошибка добавления фотографии:', error)
      throw new Error(`Ошибка добавления фотографии: ${error.message}`)
    }
  },

  /**
   * Обновить фотографию
   * @param {string} photoId - ID фотографии
   * @param {Object} updateData - Данные для обновления
   * @returns {Promise<Object>} Обновлённая фотография
   */
  async updateEventPhoto(photoId, updateData) {
    try {
      const { data, error } = await supabase
        .from('con_photos')
        .update(updateData)
        .eq('id', photoId)
        .select('*')
        .single()
      
      if (error) throw error
      return data
      
    } catch (error) {
      console.error('❌ Ошибка обновления фотографии:', error)
      throw new Error(`Ошибка обновления фотографии: ${error.message}`)
    }
  },

  /**
   * Удалить фотографию
   * @param {string} photoId - ID фотографии
   * @returns {Promise<boolean>} Успешность удаления
   */
  async deleteEventPhoto(photoId) {
    try {
      const { error } = await supabase
        .from('con_photos')
        .delete()
        .eq('id', photoId)
      
      if (error) throw error
      return true
      
    } catch (error) {
      console.error('❌ Ошибка удаления фотографии:', error)
      throw new Error(`Ошибка удаления фотографии: ${error.message}`)
    }
  },

  // ============================================
  // 🛒 МЕТОДЫ ДЛЯ ПОКУПОК (CON_PURCHASES)
  // ============================================

  /**
   * Получить покупки мероприятия
   * @param {string} eventId - ID мероприятия
   * @param {Object} options - Опции фильтрации
   * @returns {Promise<Array>} Список покупок
   */
  async getEventPurchases(eventId, options = {}) {
    try {
      console.log('🛒 Загружаем покупки для мероприятия:', eventId)
      
      let query = supabase
        .from('con_purchases')
        .select('*')
        .eq('con_id', eventId)
      
      // Фильтрация по категории
      if (options.category) {
        query = query.eq('category', options.category)
      }
      
      // Фильтрация по продавцу
      if (options.vendor_name) {
        query = query.ilike('vendor_name', `%${options.vendor_name}%`)
      }
      
      // Фильтрация по статусу
      if (options.status) {
        query = query.eq('status', options.status)
      } else {
        // По умолчанию показываем только завершённые покупки
        query = query.eq('status', 'completed')
      }
      
      // Лимит
      if (options.limit) {
        query = query.limit(options.limit)
      }
      
      // Сортировка
      const sortBy = options.sort || 'purchased_at'
      const sortOrder = options.order === 'asc' ? { ascending: true } : { ascending: false }
      query = query.order(sortBy, sortOrder)
      
      const { data, error } = await query
      
      if (error) throw error
      
      console.log(`✅ Загружено ${data?.length || 0} покупок`)
      return data || []
      
    } catch (error) {
      console.error('❌ Ошибка загрузки покупок:', error)
      throw new Error(`Ошибка загрузки покупок: ${error.message}`)
    }
  },

  /**
   * Добавить покупку к мероприятию
   * @param {string} eventId - ID мероприятия
   * @param {Object} purchaseData - Данные покупки
   * @returns {Promise<Object>} Созданная покупка
   */
  async addEventPurchase(eventId, purchaseData) {
    try {
      console.log('➕ Добавляем покупку к мероприятию:', eventId)
      
      const { data, error } = await supabase
        .from('con_purchases')
        .insert([{
          con_id: eventId,
          item_name: purchaseData.item_name?.trim(),
          description: purchaseData.description?.trim(),
          brand: purchaseData.brand?.trim(),
          model: purchaseData.model?.trim(),
          price: purchaseData.price || 0,
          currency: purchaseData.currency || 'RUB',
          original_price: purchaseData.original_price,
          discount_percent: purchaseData.discount_percent,
          vendor_name: purchaseData.vendor_name?.trim(),
          vendor_type: purchaseData.vendor_type || 'unknown',
          booth_number: purchaseData.booth_number?.trim(),
          category: purchaseData.category || 'other',
          image_url: purchaseData.image_url?.trim(),
          gallery_urls: purchaseData.gallery_urls || [],
          receipt_photo: purchaseData.receipt_photo?.trim(),
          quantity: purchaseData.quantity || 1,
          size: purchaseData.size?.trim(),
          color: purchaseData.color?.trim(),
          material: purchaseData.material?.trim(),
          condition: purchaseData.condition || 'new',
          rating: purchaseData.rating,
          review: purchaseData.review?.trim(),
          purchased_at: purchaseData.purchased_at || new Date().toISOString(),
          delivery_date: purchaseData.delivery_date,
          status: purchaseData.status || 'completed',
          is_commission: purchaseData.is_commission || false,
          is_limited_edition: purchaseData.is_limited_edition || false,
          is_signed: purchaseData.is_signed || false,
          is_gift: purchaseData.is_gift || false,
          tags: purchaseData.tags || [],
          extra_data: purchaseData.extra_data || {}
        }])
        .select('*')
        .single()
      
      if (error) throw error
      
      console.log('✅ Покупка добавлена:', data.item_name)
      return data
      
    } catch (error) {
      console.error('❌ Ошибка добавления покупки:', error)
      throw new Error(`Ошибка добавления покупки: ${error.message}`)
    }
  },

  /**
   * Обновить покупку
   * @param {string} purchaseId - ID покупки
   * @param {Object} updateData - Данные для обновления
   * @returns {Promise<Object>} Обновлённая покупка
   */
  async updateEventPurchase(purchaseId, updateData) {
    try {
      const { data, error } = await supabase
        .from('con_purchases')
        .update(updateData)
        .eq('id', purchaseId)
        .select('*')
        .single()
      
      if (error) throw error
      return data
      
    } catch (error) {
      console.error('❌ Ошибка обновления покупки:', error)
      throw new Error(`Ошибка обновления покупки: ${error.message}`)
    }
  },

  /**
   * Удалить покупку
   * @param {string} purchaseId - ID покупки
   * @returns {Promise<boolean>} Успешность удаления
   */
  async deleteEventPurchase(purchaseId) {
    try {
      const { error } = await supabase
        .from('con_purchases')
        .delete()
        .eq('id', purchaseId)
      
      if (error) throw error
      return true
      
    } catch (error) {
      console.error('❌ Ошибка удаления покупки:', error)
      throw new Error(`Ошибка удаления покупки: ${error.message}`)
    }
  },

  // ============================================
  // 📊 МЕТОДЫ СТАТИСТИКИ И АНАЛИТИКИ
  // ============================================

  /**
   * Получить общую статистику мероприятий
   * @returns {Promise<Object>} Статистика
   */
  async getEventsStats() {
    try {
      console.log('📊 Загружаем статистику мероприятий')
      
      const { data, error } = await supabase
        .rpc('get_events_overview')
      
      if (error) throw error
      
      const stats = data?.[0] || {
        total_events: 0,
        upcoming_events: 0,
        completed_events: 0,
        total_photos: 0,
        total_purchases: 0,
        total_spent: 0,
        avg_rating: 0
      }
      
      // Приводим к нужному формату
      const formattedStats = {
        total: stats.total_events,
        upcoming: stats.upcoming_events,
        completed: stats.completed_events,
        totalPhotos: stats.total_photos,
        totalPurchases: stats.total_purchases,
        totalSpent: parseFloat(stats.total_spent) || 0,
        averageRating: parseFloat(stats.avg_rating) || 0
      }
      
      console.log('✅ Статистика загружена:', formattedStats)
      return formattedStats
      
    } catch (error) {
      console.error('❌ Ошибка загрузки статистики:', error)
      // Возвращаем дефолтную статистику при ошибке
      return {
        total: 0,
        upcoming: 0,
        completed: 0,
        totalPhotos: 0,
        totalPurchases: 0,
        totalSpent: 0,
        averageRating: 0
      }
    }
  },

  /**
   * Получить статистику конкретного мероприятия
   * @param {string} eventId - ID мероприятия
   * @returns {Promise<Object>} Статистика мероприятия
   */
  async getEventStats(eventId) {
    try {
      console.log('📊 Загружаем статистику мероприятия:', eventId)
      
      const { data, error } = await supabase
        .from('events_full_stats')
        .select('photos_count, purchases_count, total_items_purchased, links_count, features_count, total_spent')
        .eq('id', eventId)
        .single()
      
      if (error) throw error
      
      return {
        photosCount: data.photos_count || 0,
        purchasesCount: data.purchases_count || 0,
        totalItems: data.total_items_purchased || 0,
        linksCount: data.links_count || 0,
        featuresCount: data.features_count || 0,
        totalSpent: parseFloat(data.total_spent) || 0
      }
      
    } catch (error) {
      console.error('❌ Ошибка загрузки статистики мероприятия:', error)
      return {
        photosCount: 0,
        purchasesCount: 0,
        totalItems: 0,
        linksCount: 0,
        featuresCount: 0,
        totalSpent: 0
      }
    }
  },

  /**
   * Получить топ категорий покупок
   * @param {number} limit - Количество категорий
   * @returns {Promise<Array>} Топ категорий
   */
  async getTopPurchaseCategories(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('con_purchases')
        .select('category, price, quantity')
        .eq('status', 'completed')
      
      if (error) throw error
      
      // Группируем по категориям
      const categoryStats = {}
      data.forEach(purchase => {
        const category = purchase.category || 'other'
        if (!categoryStats[category]) {
          categoryStats[category] = {
            category,
            count: 0,
            totalSpent: 0,
            totalItems: 0
          }
        }
        categoryStats[category].count += 1
        categoryStats[category].totalSpent += (purchase.price * purchase.quantity)
        categoryStats[category].totalItems += purchase.quantity
      })
      
      // Сортируем по количеству покупок
      return Object.values(categoryStats)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, limit)
      
    } catch (error) {
      console.error('❌ Ошибка загрузки топ категорий:', error)
      return []
    }
  },

  // ============================================
  // 🔧 ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
  // ============================================

  /**
   * Очистка данных мероприятия перед сохранением
   * @param {Object} eventData - Данные мероприятия
   * @returns {Object} Очищенные данные
   * @private
   */
  _cleanEventData(eventData) {
    const cleanData = {}
    
    // Обязательные поля
    if (eventData.name) cleanData.name = eventData.name.trim()
    if (eventData.slug) cleanData.slug = eventData.slug.trim().toLowerCase()
    if (eventData.event_date) cleanData.event_date = eventData.event_date
    if (eventData.location) cleanData.location = eventData.location.trim()
    
    // Необязательные строковые поля
    const stringFields = [
      'subtitle', 'description', 'short_description', 'city', 'country', 
      'address', 'venue_url', 'banner_url', 'logo_url', 'gallery_folder',
      'my_role', 'my_review', 'meta_title', 'meta_description', 'og_image',
      'official_website', 'tickets_url', 'currency'
    ]
    
    stringFields.forEach(field => {
      if (eventData[field] && typeof eventData[field] === 'string') {
        cleanData[field] = eventData[field].trim()
      }
    })
    
    // Даты
    const dateFields = [
      'announced_date', 'registration_start', 'registration_end'
    ]
    
    dateFields.forEach(field => {
      if (eventData[field]) {
        cleanData[field] = eventData[field]
      }
    })
    
    // Перечисления
    if (eventData.status) cleanData.status = eventData.status
    if (eventData.event_type) cleanData.event_type = eventData.event_type
    if (eventData.attendance_status) cleanData.attendance_status = eventData.attendance_status
    
    // Числовые поля
    const numberFields = [
      'attendees_count', 'expected_visitors', 'my_rating', 
      'entrance_fee', 'total_spent'
    ]
    
    numberFields.forEach(field => {
      if (eventData[field] !== undefined && eventData[field] !== null && eventData[field] !== '') {
        const num = parseFloat(eventData[field])
        if (!isNaN(num)) {
          cleanData[field] = num
        }
      }
    })
    
    // Булевы поля
    const booleanFields = [
      'has_dealers_den', 'has_art_show', 'has_fursuit_parade', 'has_competitions',
      'is_featured', 'is_nsfw', 'is_online'
    ]
    
    booleanFields.forEach(field => {
      if (eventData[field] !== undefined) {
        cleanData[field] = Boolean(eventData[field])
      }
    })
    
    // JSON поля
    if (eventData.extra_data && typeof eventData.extra_data === 'object') {
      cleanData.extra_data = eventData.extra_data
    }
    
    return cleanData
  },

  /**
   * Проверка соединения с базой данных
   * @returns {Promise<boolean>} Статус соединения
   */
  async testConnection() {
    try {
      const { data, error } = await supabase
        .from('cons')
        .select('count')
        .limit(1)
      
      if (error) throw error
      
      console.log('✅ Соединение с Supabase установлено')
      return true
      
    } catch (error) {
      console.error('❌ Ошибка соединения с Supabase:', error)
      return false
    }
  },

  /**
   * Получить информацию о доступных таблицах
   * @returns {Promise<Array>} Список таблиц
   */
  async getTableInfo() {
    try {
      const tables = []
      
      const tablesData = await Promise.allSettled([
        supabase.from('cons').select('count', { count: 'exact', head: true }),
        supabase.from('con_links').select('count', { count: 'exact', head: true }),
        supabase.from('con_features').select('count', { count: 'exact', head: true }),
        supabase.from('con_photos').select('count', { count: 'exact', head: true }),
        supabase.from('con_purchases').select('count', { count: 'exact', head: true })
      ])
      
      const tableNames = ['cons', 'con_links', 'con_features', 'con_photos', 'con_purchases']
      
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
export { furryApi as eventApi, furryApi as consApi }

console.log('🎪 FoxTaffy Events API initialized successfully!')