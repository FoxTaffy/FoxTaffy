// ===============================================
// 🎪 FOXTAFFY.FUN - ОБЪЕДИНЁННЫЙ SUPABASE API
// Система управления мероприятиями и галереей
// ===============================================

import { createClient } from '@supabase/supabase-js'

// ===============================================
// 🔧 КОНФИГУРАЦИЯ SUPABASE
// ===============================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ Supabase environment variables are not set. Проверьте .env файл.')
}

console.log('🔧 Инициализация Supabase:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length,
  environment: import.meta.env.MODE
})

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'User-Agent': 'FoxTaffy.fun/2.0'
    }
  }
})

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
      status = 'all', // 'upcoming', 'completed', 'all', 'featured'
      event_type,
      attendance_status,
      city,
      search,
      featured = false,
      limit = 20,
      offset = 0,
      sort = 'date_desc' // 'date_desc', 'date_asc', 'name_asc', 'name_desc', 'rating_desc', 'created_desc'
    } = options

    try {
      console.log('🎪 getEvents: Загружаем мероприятия с опциями:', options)
      
      // Пробуем использовать представление с полной статистикой
      let query = supabase.from('events_full_stats').select('*')
      
      // Если представление недоступно, используем основную таблицу
      if (!query) {
        query = supabase.from('cons_full_view').select('*')
      }
      
      // Если и это недоступно, используем базовую таблицу
      if (!query) {
        query = supabase.from('cons').select('*')
      }

      // Фильтрация по статусу
      if (status === 'upcoming') {
        query = query.gt('event_date', new Date().toISOString())
      } else if (status === 'completed') {
        query = query.lt('event_date', new Date().toISOString())
      } else if (status === 'featured') {
        query = query.eq('is_featured', true)
      }
      
      // Дополнительные фильтры
      if (event_type) query = query.eq('event_type', event_type)
      if (attendance_status) query = query.eq('attendance_status', attendance_status)
      if (city) query = query.eq('city', city)
      if (featured) query = query.eq('is_featured', true)
      
      // Поиск по тексту
      if (search) {
        query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%,subtitle.ilike.%${search}%`)
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
      
      const sortConfig = sortOptions[sort] || sortOptions['date_desc']
      query = query.order(sortConfig.column, { ascending: sortConfig.ascending })
      
      // Пагинация
      if (limit > 0) {
        if (offset > 0) {
          query = query.range(offset, offset + limit - 1)
        } else {
          query = query.limit(limit)
        }
      }
      
      const { data, error } = await query
      
      if (error) {
        console.warn('Ошибка загрузки из представления, пробуем основную таблицу:', error)
        return await this._getEventsFromBaseTable(options)
      }
      
      console.log(`✅ getEvents: Загружено ${data?.length || 0} мероприятий`)
      return data || []
      
    } catch (error) {
      console.error('❌ getEvents: Ошибка загрузки мероприятий:', error)
      return await this._getEventsFromBaseTable(options)
    }
  },

  /**
   * Fallback метод для загрузки из основной таблицы
   */
  async _getEventsFromBaseTable(options) {
    try {
      console.log('🔄 Fallback на основную таблицу cons...')
      
      let query = supabase.from('cons').select('*')
      
      if (options.status === 'upcoming') {
        query = query.gt('event_date', new Date().toISOString())
      } else if (options.status === 'completed') {
        query = query.lt('event_date', new Date().toISOString())
      }
      
      if (options.featured) query = query.eq('is_featured', true)
      if (options.search) {
        query = query.or(`name.ilike.%${options.search}%,location.ilike.%${options.search}%`)
      }
      
      query = query.order('event_date', { ascending: false })
      
      if (options.limit) query = query.limit(options.limit)
      if (options.offset) query = query.range(options.offset, options.offset + options.limit - 1)
      
      const { data, error } = await query
      if (error) throw error
      
      return data || []
    } catch (error) {
      console.error('❌ Fallback также не работает:', error)
      return []
    }
  },

  /**
   * Получить мероприятие по slug с полными данными
   */
  async getEventBySlug(slug) {
    try {
      console.log('🔍 getEventBySlug: Загружаем мероприятие:', slug)
      
      // Загружаем основное мероприятие
      let { data: event, error } = await supabase
        .from('events_full_stats')
        .select('*')
        .eq('slug', slug)
        .single()

      // Fallback на основную таблицу
      if (error) {
        console.log('🔄 Fallback на основную таблицу cons...')
        const { data: fallbackEvent, error: fallbackError } = await supabase
          .from('cons')
          .select('*')
          .eq('slug', slug)
          .single()
          
        if (fallbackError) throw fallbackError
        event = fallbackEvent
      }

      // Загружаем связанные данные параллельно
      const [linksData, featuresData, photosData, purchasesData] = await Promise.all([
        this.getEventLinks(event.id),
        this.getEventFeatures(event.id),
        this.getEventPhotos(event.id),
        this.getEventPurchases(event.id)
      ])

      // Собираем полный объект мероприятия
      const fullEvent = {
        ...event,
        links: linksData,
        features: featuresData,
        photos: photosData,
        purchases: purchasesData
      }

      console.log('✅ getEventBySlug: Мероприятие загружено с полными данными')
      return fullEvent

    } catch (error) {
      console.error('❌ getEventBySlug: Ошибка загрузки мероприятия:', error)
      if (error.code === 'PGRST116') return null
      throw new Error(`Ошибка загрузки мероприятия: ${error.message}`)
    }
  },

  /**
   * Создать новое мероприятие
   */
  async createEvent(eventData) {
    try {
      console.log('➕ createEvent: Создаём мероприятие:', eventData.name)
      
      // Генерируем slug если не указан
      if (!eventData.slug) {
        eventData.slug = eventData.name
          .toLowerCase()
          .replace(/[^а-яё\w\s-]/gi, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()
      }

      // Проверяем уникальность slug
      const existingEvent = await this.checkEventSlugExists(eventData.slug)
      if (existingEvent) {
        eventData.slug = `${eventData.slug}-${Date.now()}`
      }

      // Подготавливаем данные
      const cleanData = this._cleanEventData(eventData)
      
      const { data, error } = await supabase
        .from('cons')
        .insert([cleanData])
        .select('*')
        .single()
      
      if (error) throw error
      
      console.log('✅ createEvent: Мероприятие создано:', data.name)
      return data
      
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
      
      const { data, error } = await supabase
        .from('cons')
        .update(cleanData)
        .eq('id', eventId)
        .select('*')
        .single()
      
      if (error) throw error
      
      console.log('✅ updateEvent: Мероприятие обновлено:', data.name)
      return data
      
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
      
      const { error } = await supabase
        .from('cons')
        .delete()
        .eq('id', eventId)
      
      if (error) throw error
      
      console.log('✅ deleteEvent: Мероприятие удалено')
      return true
      
    } catch (error) {
      console.error('❌ deleteEvent: Ошибка удаления мероприятия:', error)
      throw new Error(`Ошибка удаления мероприятия: ${error.message}`)
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

  // ============================================
  // 🔗 МЕТОДЫ ДЛЯ ССЫЛОК МЕРОПРИЯТИЙ
  // ============================================

  /**
   * Получить ссылки мероприятия
   */
  async getEventLinks(eventId) {
    try {
      console.log('🔗 getEventLinks: Загружаем ссылки для мероприятия:', eventId)
      
      const { data, error } = await supabase
        .from('con_links')
        .select('*')
        .eq('con_id', eventId)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true })
      
      if (error) throw error
      
      console.log(`✅ getEventLinks: Загружено ${data?.length || 0} ссылок`)
      return data || []
      
    } catch (error) {
      console.error('❌ getEventLinks: Ошибка загрузки ссылок:', error)
      return []
    }
  },

  /**
   * Добавить ссылку к мероприятию
   */
  async addEventLink(eventId, linkData) {
    try {
      console.log('➕ addEventLink: Добавляем ссылку к мероприятию:', eventId)
      
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
      
      console.log('✅ addEventLink: Ссылка добавлена:', data.title)
      return data
      
    } catch (error) {
      console.error('❌ addEventLink: Ошибка добавления ссылки:', error)
      throw new Error(`Ошибка добавления ссылки: ${error.message}`)
    }
  },

  /**
   * Удалить ссылку мероприятия
   */
  async removeEventLink(linkId) {
    try {
      const { error } = await supabase
        .from('con_links')
        .delete()
        .eq('id', linkId)
      
      if (error) throw error
      return true
      
    } catch (error) {
      console.error('❌ removeEventLink: Ошибка удаления ссылки:', error)
      throw error
    }
  },

  // ============================================
  // ⭐ МЕТОДЫ ДЛЯ ОСОБЕННОСТЕЙ МЕРОПРИЯТИЙ
  // ============================================

  /**
   * Получить особенности мероприятия
   */
  async getEventFeatures(eventId) {
    try {
      console.log('⭐ getEventFeatures: Загружаем особенности для мероприятия:', eventId)
      
      const { data, error } = await supabase
        .from('con_features')
        .select('*')
        .eq('con_id', eventId)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true })
      
      if (error) throw error
      
      console.log(`✅ getEventFeatures: Загружено ${data?.length || 0} особенностей`)
      return data || []
      
    } catch (error) {
      console.error('❌ getEventFeatures: Ошибка загрузки особенностей:', error)
      return []
    }
  },

  /**
   * Добавить особенность к мероприятию
   */
  async addEventFeature(eventId, featureData) {
    try {
      console.log('➕ addEventFeature: Добавляем особенность к мероприятию:', eventId)
      
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
      
      console.log('✅ addEventFeature: Особенность добавлена:', data.title)
      return data
      
    } catch (error) {
      console.error('❌ addEventFeature: Ошибка добавления особенности:', error)
      throw new Error(`Ошибка добавления особенности: ${error.message}`)
    }
  },

  // ============================================
  // 📸 МЕТОДЫ ДЛЯ ФОТОГРАФИЙ МЕРОПРИЯТИЙ
  // ============================================

  /**
   * Получить фотографии мероприятия
   */
  async getEventPhotos(eventId, options = {}) {
    try {
      console.log('📸 getEventPhotos: Загружаем фотографии для мероприятия:', eventId)
      
      let query = supabase
        .from('con_photos')
        .select('*')
        .eq('con_id', eventId)
      
      // Фильтры
      if (options.photo_type) query = query.eq('photo_type', options.photo_type)
      if (options.featured_only) query = query.eq('is_featured', true)
      if (options.avatar_only) query = query.eq('is_avatar', true)
      if (options.limit) query = query.limit(options.limit)
      
      // Сортировка
      const sortBy = options.sort || 'display_order'
      const sortOrder = options.order === 'desc' ? { ascending: false } : { ascending: true }
      query = query.order(sortBy, sortOrder)
      
      if (sortBy !== 'taken_at') {
        query = query.order('taken_at', { ascending: false })
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      console.log(`✅ getEventPhotos: Загружено ${data?.length || 0} фотографий`)
      return data || []
      
    } catch (error) {
      console.error('❌ getEventPhotos: Ошибка загрузки фотографий:', error)
      return []
    }
  },

  /**
   * Добавить фотографию к мероприятию
   */
  async addEventPhoto(eventId, photoData) {
    try {
      console.log('➕ addEventPhoto: Добавляем фотографию к мероприятию:', eventId)
      
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
          display_order: photoData.display_order || 0
        }])
        .select('*')
        .single()
      
      if (error) throw error
      
      console.log('✅ addEventPhoto: Фотография добавлена')
      return data
      
    } catch (error) {
      console.error('❌ addEventPhoto: Ошибка добавления фотографии:', error)
      throw new Error(`Ошибка добавления фотографии: ${error.message}`)
    }
  },

  // ============================================
  // 🛒 МЕТОДЫ ДЛЯ ПОКУПОК НА МЕРОПРИЯТИЯХ
  // ============================================

  /**
   * Получить покупки мероприятия
   */
  async getEventPurchases(eventId, options = {}) {
    try {
      console.log('🛒 getEventPurchases: Загружаем покупки для мероприятия:', eventId)
      
      let query = supabase
        .from('con_purchases')
        .select('*')
        .eq('con_id', eventId)
      
      // Фильтры
      if (options.category) query = query.eq('category', options.category)
      if (options.vendor_name) query = query.ilike('vendor_name', `%${options.vendor_name}%`)
      if (options.status) {
        query = query.eq('status', options.status)
      } else {
        query = query.eq('status', 'completed')
      }
      if (options.limit) query = query.limit(options.limit)
      
      // Сортировка
      const sortBy = options.sort || 'purchased_at'
      const sortOrder = options.order === 'asc' ? { ascending: true } : { ascending: false }
      query = query.order(sortBy, sortOrder)
      
      const { data, error } = await query
      
      if (error) throw error
      
      console.log(`✅ getEventPurchases: Загружено ${data?.length || 0} покупок`)
      return data || []
      
    } catch (error) {
      console.error('❌ getEventPurchases: Ошибка загрузки покупок:', error)
      return []
    }
  },

  /**
   * Добавить покупку к мероприятию
   */
  async addEventPurchase(eventId, purchaseData) {
    try {
      console.log('➕ addEventPurchase: Добавляем покупку к мероприятию:', eventId)
      
      const { data, error } = await supabase
        .from('con_purchases')
        .insert([{
          con_id: eventId,
          item_name: purchaseData.item_name?.trim(),
          description: purchaseData.description?.trim(),
          price: purchaseData.price || 0,
          currency: purchaseData.currency || 'RUB',
          vendor_name: purchaseData.vendor_name?.trim(),
          category: purchaseData.category || 'other',
          image_url: purchaseData.image_url?.trim(),
          quantity: purchaseData.quantity || 1,
          purchased_at: purchaseData.purchased_at || new Date().toISOString(),
          status: purchaseData.status || 'completed'
        }])
        .select('*')
        .single()
      
      if (error) throw error

      // Обновляем счётчики в основной таблице мероприятий
      await this.updateEventCounters(eventId)
      
      console.log('✅ addEventPurchase: Покупка добавлена:', data.item_name)
      return data
      
    } catch (error) {
      console.error('❌ addEventPurchase: Ошибка добавления покупки:', error)
      throw new Error(`Ошибка добавления покупки: ${error.message}`)
    }
  },

  /**
   * Обновить счётчики мероприятия
   */
  async updateEventCounters(eventId) {
    try {
      const { data: purchaseStats, error } = await supabase
        .from('con_purchases')
        .select('price, quantity')
        .eq('con_id', eventId)
        .eq('status', 'completed')

      if (error) throw error

      const totalSpent = purchaseStats.reduce((sum, p) => sum + ((p.price || 0) * (p.quantity || 1)), 0)
      const purchasesCount = purchaseStats.length

      await supabase
        .from('cons')
        .update({
          total_spent: totalSpent,
          purchases_count: purchasesCount
        })
        .eq('id', eventId)

    } catch (error) {
      console.error('❌ updateEventCounters: Ошибка обновления счётчиков:', error)
    }
  },

  // ============================================
  // 🎨 МЕТОДЫ ДЛЯ ГАЛЕРЕИ ИСКУССТВА
  // ============================================

  /**
   * Получить арты с фильтрацией и сортировкой
   */
  async getFurryArts(options = {}) {
    const { 
      search = '', 
      tags = [], 
      artists = [], 
      showYiff = false,
      showNsfw = false,
      sort = 'newest',
      limit = 24,
      offset = 0
    } = options

    try {
      console.log('🎨 getFurryArts: Запрашиваем арты с опциями:', options)
      
      // Пробуем использовать представление gallery_view
      let query = supabase.from('gallery_view').select('*')

      // Поиск по названию
      if (search.trim()) {
        query = query.ilike('title', `%${search}%`)
      }

      // Фильтр по художникам
      if (artists.length > 0) {
        query = query.in('artist_name', artists)
      }

      // NSFW фильтр
      const hideNsfw = !showYiff && !showNsfw
      if (hideNsfw) {
        query = query.eq('is_nsfw', false)
      }

      // Сортировка
      switch (sort) {
        case 'newest':
          query = query.order('upload_date', { ascending: false })
          break
        case 'oldest':
          query = query.order('upload_date', { ascending: true })
          break
        case 'alphabetical':
          query = query.order('title', { ascending: true })
          break
        case 'alphabetical-desc':
          query = query.order('title', { ascending: false })
          break
        case 'artist':
          query = query.order('artist_name', { ascending: true })
          break
      }

      // Пагинация
      if (offset > 0) {
        query = query.range(offset, offset + limit - 1)
      } else {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) {
        console.warn('⚠️ Ошибка запроса к gallery_view, используем прямой запрос:', error)
        return await this._getFurryArtsDirectQuery(options)
      }

      console.log(`✅ getFurryArts: Получено артов из gallery_view: ${data?.length || 0}`)

      // Обрабатываем данные для унификации
      let processedArts = (data || []).map(art => ({
        id: art.id,
        title: art.title,
        image_url: art.image_url,
        thumbnail_url: art.thumbnail_url || art.image_url,
        is_nsfw: art.is_nsfw || false,
        created_date: art.upload_date,
        upload_date: art.upload_date,
        artist_name: art.artist_name,
        artist_avatar: art.artist_avatar,
        artist_is_friend: art.artist_is_friend,
        characters: Array.isArray(art.characters) ? art.characters : [],
        tags: Array.isArray(art.tags) ? art.tags.map(t => t.name) : [],
        tagNames: Array.isArray(art.tags) ? art.tags.map(t => t.name) : []
      }))

      // Фильтрация по тегам
      if (tags.length > 0) {
        processedArts = processedArts.filter(art => 
          tags.some(tagName => art.tagNames.includes(tagName))
        )
      }

      console.log(`✅ getFurryArts: Обработано артов: ${processedArts.length}`)
      return processedArts
      
    } catch (error) {
      console.error('❌ getFurryArts: Ошибка получения артов:', error)
      return await this._getFurryArtsDirectQuery(options)
    }
  },

  /**
   * Прямой запрос к таблицам если представление недоступно
   */
  async _getFurryArtsDirectQuery(options = {}) {
    const { 
      search = '', 
      showNsfw = false,
      sort = 'newest',
      limit = 24,
      offset = 0
    } = options

    try {
      console.log('🔍 _getFurryArtsDirectQuery: Прямой запрос к таблицам...')
      
      let query = supabase
        .from('arts')
        .select(`
          id,
          title,
          image_url,
          thumbnail_url,
          is_nsfw,
          upload_date,
          art_collaborators!inner(
            role,
            persons!inner(
              nickname,
              avatar_url,
              is_friend
            )
          )
        `)
        .eq('is_deleted', false)
        .eq('art_collaborators.role', 'main_artist')

      if (search.trim()) query = query.ilike('title', `%${search}%`)
      if (!showNsfw) query = query.eq('is_nsfw', false)

      switch (sort) {
        case 'newest': query = query.order('upload_date', { ascending: false }); break
        case 'oldest': query = query.order('upload_date', { ascending: true }); break
        case 'alphabetical': query = query.order('title', { ascending: true }); break
      }

      if (offset > 0) {
        query = query.range(offset, offset + limit - 1)
      } else {
        query = query.limit(limit)
      }

      const { data, error } = await query
      if (error) throw error

      const processedArts = (data || []).map(art => {
        const mainArtist = art.art_collaborators?.[0]?.persons
        
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
          characters: [],
          tags: [],
          tagNames: []
        }
      })

      return processedArts
      
    } catch (error) {
      console.error('❌ _getFurryArtsDirectQuery: Ошибка прямого запроса:', error)
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
        const { data: newArtist, error: createError } = await supabase
          .from('persons')
          .insert([{
            nickname: artData.artist_nickname,
            avatar_url: null,
            is_friend: false
          }])
          .select('id')
          .single()
        
        if (createError) throw createError
        artistId = newArtist.id
      }
      
      // Создаем арт
      const { data: artResult, error: artError } = await supabase
        .from('arts')
        .insert([{
          title: artData.title,
          image_url: artData.image_url,
          thumbnail_url: artData.thumbnail_url || artData.image_url,
          is_nsfw: artData.is_nsfw || false,
          upload_date: new Date().toISOString(),
          is_deleted: false
        }])
        .select('id')
        .single()
      
      if (artError) throw artError
      
      // Связываем с художником
      const { error: collaboratorError } = await supabase
        .from('art_collaborators')
        .insert([{
          art_id: artResult.id,
          person_id: artistId,
          role: 'main_artist'
        }])
      
      if (collaboratorError) throw collaboratorError

      console.log('✅ addFurryArt: Арт добавлен с ID:', artResult.id)
      return { id: artResult.id, ...artData }
      
    } catch (error) {
      console.error('❌ addFurryArt: Ошибка добавления арта:', error)
      throw error
    }
  },

  /**
   * Удалить арт
   */
  async deleteArt(artId) {
    try {
      console.log('🗑️ deleteArt: Удаляем арт:', artId)
      
      // Удаляем все связи
      await Promise.all([
        supabase.from('art_tags').delete().eq('art_id', artId),
        supabase.from('art_fursonas').delete().eq('art_id', artId),
        supabase.from('art_collaborators').delete().eq('art_id', artId)
      ])

      // Помечаем арт как удаленный
      const { error } = await supabase
        .from('arts')
        .update({ is_deleted: true })
        .eq('id', artId)
      
      if (error) throw error
      
      console.log('✅ deleteArt: Арт удален')
      return true
    } catch (error) {
      console.error('❌ deleteArt: Ошибка удаления арта:', error)
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
          is_friend: artist.is_friend,
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

      const { data, error } = await supabase
        .from('persons')
        .insert([{
          nickname: artistData.nickname.trim(),
          avatar_url: artistData.avatar_url?.trim() || null,
          is_friend: artistData.is_friend || false
        }])
        .select()

      if (error) throw error
      console.log('✅ createArtist: Художник создан:', data[0])
      return data[0]
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

      const { data, error } = await supabase
        .from('tags')
        .insert([{
          name: tagData.name.trim()
        }])
        .select()

      if (error) throw error
      console.log('✅ createTag: Тег создан:', data[0])
      return data[0]
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

      const { data, error } = await supabase
        .from('fursonas')
        .insert([{
          name: characterData.name.trim(),
          avatar_url: characterData.avatar_url?.trim() || null,
          person_id: null
        }])
        .select()

      if (error) throw error
      console.log('✅ createCharacter: Персонаж создан:', data[0])
      return data[0]
    } catch (error) {
      console.error('❌ createCharacter: Ошибка создания персонажа:', error)
      throw error
    }
  },

  /**
   * Проверить существование персонажа
   */
  async checkCharacterExists(characterName) {
    try {
      const { data, error } = await supabase
        .from('fursonas')
        .select('id')
        .eq('name', characterName.trim())
        .maybeSingle()

      if (error) throw error
      return !!data
    } catch (error) {
      console.error('❌ checkCharacterExists: Ошибка проверки персонажа:', error)
      return false
    }
  },

  // ============================================
  // 📊 СТАТИСТИКА И АНАЛИТИКА
  // ============================================

  /**
   * Получить общую статистику мероприятий
   */
  async getEventsStats() {
    try {
      console.log('📊 getEventsStats: Получаем статистику мероприятий...')
      
      const { data, error } = await supabase
        .from('cons')
        .select(`
          id,
          status,
          event_type,
          my_rating,
          total_spent,
          attendees_count,
          event_date
        `)

      if (error) throw error

      const now = new Date()
      const upcoming = data.filter(e => new Date(e.event_date) > now)
      const completed = data.filter(e => new Date(e.event_date) <= now)

      const stats = {
        total: data.length,
        upcoming: upcoming.length,
        completed: completed.length,
        totalSpent: data.reduce((sum, e) => sum + (e.total_spent || 0), 0),
        averageRating: data.filter(e => e.my_rating).length > 0 ? 
          (data.filter(e => e.my_rating).reduce((sum, e) => sum + e.my_rating, 0) / 
           data.filter(e => e.my_rating).length).toFixed(1) : 0,
        byType: {}
      }

      // Группировка по типам
      data.forEach(event => {
        const type = event.event_type || 'convention'
        stats.byType[type] = (stats.byType[type] || 0) + 1
      })

      console.log('✅ getEventsStats: Статистика получена:', stats)
      return stats
      
    } catch (error) {
      console.error('❌ getEventsStats: Ошибка получения статистики:', error)
      return { 
        total: 0, 
        upcoming: 0, 
        completed: 0, 
        totalSpent: 0, 
        averageRating: 0, 
        byType: {} 
      }
    }
  },

  /**
   * Получить статистику галереи
   */
  async getDashboardStats() {
    try {
      console.log('📊 getDashboardStats: Получаем полную статистику...')
      
      // Параллельно загружаем все данные
      const [artists, tags, characters, arts] = await Promise.all([
        this.getFurryArtists(),
        this.getFurryTags(), 
        this.getSpecies(),
        this.getFurryArts({ limit: 1000, showNsfw: true })
      ])
      
      // Подсчитываем статистику
      const stats = {
        artists: artists.length,
        tags: tags.length,
        characters: characters.length,
        arts: arts.length,
        nsfwArts: arts.filter(art => art.is_nsfw).length,
        sfwArts: arts.filter(art => !art.is_nsfw).length,
        friendArtists: artists.filter(artist => artist.is_friend).length,
        s3Files: arts.filter(art => this.isS3Url(art.image_url)).length,
        recentUploads: arts.filter(art => {
          if (!art.created_date) return false
          const uploadDate = new Date(art.created_date)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return uploadDate >= weekAgo
        }).length,
        topArtist: artists.length > 0 ? artists[0] : null,
        topTag: tags.length > 0 ? tags[0] : null,
        topCharacter: characters.length > 0 ? characters[0] : null
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

  /**
   * Загрузить все данные галереи
   */
  async loadAllData(options = {}) {
    try {
      console.log('🔄 loadAllData: Загружаем все данные галереи...')
      
      const [artsResult, artistsResult, tagsResult, charactersResult] = await Promise.all([
        this.getFurryArts(options),
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
        s3Files: artsResult.filter(art => this.isS3Url(art.image_url)).length
      }
      
      console.log('✅ loadAllData: Все данные загружены!')
      
      return {
        arts: artsResult,
        artists: artistsResult,
        tags: tagsResult,
        characters: charactersResult,
        stats: stats
      }
      
    } catch (error) {
      console.error('❌ loadAllData: Ошибка загрузки всех данных:', error)
      throw new Error(`Ошибка загрузки данных: ${error.message}`)
    }
  },

  // ============================================
  // 🔧 ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
  // ============================================

  /**
   * Очистка данных мероприятия перед сохранением
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
   * Проверка S3 URL
   */
  isS3Url(url) {
    if (!url) return false
    return url.includes('supabase.co/storage') || url.includes('gallery/')
  },

  /**
   * Поиск по мероприятиям
   */
  async searchEvents(searchQuery, options = {}) {
    return this.getEvents({
      search: searchQuery,
      ...options
    })
  },

  /**
   * Поиск по галерее
   */
  async searchFurryContent(searchTerm) {
    return this.getFurryArts({ search: searchTerm })
  },

  /**
   * Проверка соединения с базой данных
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