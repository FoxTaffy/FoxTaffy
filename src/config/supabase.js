// ✅ ПОЛНОСТЬЮ ИСПРАВЛЕННЫЙ API FOX TAFFY - ПОД РЕАЛЬНУЮ СХЕМУ БД
import { createClient } from '@supabase/supabase-js'

// ✅ Получаем переменные из окружения (НЕ хардкод!)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// ✅ Проверяем, что переменные определены
if (!supabaseUrl || !supabaseKey) {
  throw new Error('❌ Отсутствуют переменные окружения Supabase! Проверьте .env файл.')
}

// ✅ Логируем безопасную информацию для отладки
console.log('🔧 Инициализация Supabase:', {
  url: supabaseUrl,
  hasKey: !!supabaseKey,
  keyLength: supabaseKey?.length,
  environment: import.meta.env.MODE
})

// ✅ Создаём клиент Supabase с переменными окружения
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'User-Agent': 'FoxTaffy.fun/2.0'
    }
  }
})

// ✅ ПОЛНОСТЬЮ ИСПРАВЛЕННЫЙ API ПОД РЕАЛЬНУЮ СХЕМУ БД
export const furryApi = {
  async getEvents(options = {}) {
    const {
      status = 'all', // 'upcoming', 'completed', 'all'
      featured = false,
      limit = 20,
      offset = 0,
      sort = 'date_desc' // 'date_desc', 'date_asc', 'name', 'rating'
    } = options

    try {
      console.log('🎪 getEvents: Загружаем мероприятия из cons с опциями:', options)
      
      let query = supabase
        .from('cons_full_view')
        .select('*')

      // Фильтр по статусу
      if (status !== 'all') {
        if (status === 'upcoming') {
          query = query.gt('event_date', new Date().toISOString())
        } else if (status === 'completed') {
          query = query.lt('event_date', new Date().toISOString())
        }
      }

      // Фильтр избранных
      if (featured) {
        query = query.eq('is_featured', true)
      }

      // Сортировка
      switch (sort) {
        case 'date_desc':
          query = query.order('event_date', { ascending: false })
          break
        case 'date_asc':
          query = query.order('event_date', { ascending: true })
          break
        case 'name':
          query = query.order('name', { ascending: true })
          break
        case 'rating':
          query = query.order('my_rating', { ascending: false, nullsLast: true })
          break
      }

      // Пагинация
      if (limit > 0) {
        query = query.range(offset, offset + limit - 1)
      }

      const { data, error } = await query

      if (error) throw error

      console.log(`✅ getEvents: Загружено ${data?.length || 0} мероприятий из cons`)
      return data || []

    } catch (error) {
      console.error('❌ getEvents: Ошибка загрузки мероприятий:', error)
      
      // Fallback на основную таблицу cons если представление не работает
      try {
        console.log('🔄 Пробуем fallback на основную таблицу cons...')
        let fallbackQuery = supabase
          .from('cons')
          .select('*')

        if (status === 'upcoming') {
          fallbackQuery = fallbackQuery.gt('event_date', new Date().toISOString())
        } else if (status === 'completed') {
          fallbackQuery = fallbackQuery.lt('event_date', new Date().toISOString())
        }

        if (featured) {
          fallbackQuery = fallbackQuery.eq('is_featured', true)
        }

        // Сортировка
        switch (sort) {
          case 'date_desc':
            fallbackQuery = fallbackQuery.order('event_date', { ascending: false })
            break
          case 'date_asc':
            fallbackQuery = fallbackQuery.order('event_date', { ascending: true })
            break
          case 'name':
            fallbackQuery = fallbackQuery.order('name', { ascending: true })
            break
        }

        if (limit > 0) {
          fallbackQuery = fallbackQuery.range(offset, offset + limit - 1)
        }

        const { data: fallbackData, error: fallbackError } = await fallbackQuery
        
        if (fallbackError) throw fallbackError
        
        console.log(`✅ getEvents (fallback): Загружено ${fallbackData?.length || 0} мероприятий`)
        return fallbackData || []
        
      } catch (fallbackError) {
        console.error('❌ getEvents (fallback): Критическая ошибка:', fallbackError)
        throw new Error(`Ошибка загрузки мероприятий: ${fallbackError.message}`)
      }
    }
  },

  async getEventBySlug(slug) {
    try {
      console.log('🎪 getEventBySlug: Загружаем мероприятие из cons:', slug)
      
      // Пробуем через представление
      let { data: event, error: eventError } = await supabase
        .from('cons_full_view')
        .select('*')
        .eq('slug', slug)
        .single()

      // Если представление не работает, используем основную таблицу
      if (eventError) {
        console.log('🔄 Fallback на основную таблицу cons...')
        const { data: fallbackEvent, error: fallbackError } = await supabase
          .from('cons')
          .select('*')
          .eq('slug', slug)
          .single()
          
        if (fallbackError) throw fallbackError
        event = fallbackEvent
      }

      // Загружаем связанные данные
      const [linksData, featuresData, photosData, purchasesData] = await Promise.all([
        supabase.from('con_links').select('*').eq('con_id', event.id).order('display_order'),
        supabase.from('con_features').select('*').eq('con_id', event.id).order('display_order'),
        supabase.from('con_photos').select('*').eq('con_id', event.id).order('display_order'),
        supabase.from('con_purchases').select('*').eq('con_id', event.id).order('purchased_at', { ascending: false })
      ])

      const fullEvent = {
        ...event,
        links: linksData.data || [],
        features: featuresData.data || [],
        photos: photosData.data || [],
        purchases: purchasesData.data || []
      }

      console.log('✅ getEventBySlug: Мероприятие загружено с полными данными')
      return fullEvent

    } catch (error) {
      console.error('❌ getEventBySlug: Ошибка загрузки мероприятия:', error)
      throw new Error(`Мероприятие не найдено: ${error.message}`)
    }
  },

  async createEvent(eventData) {
    try {
      console.log('➕ createEvent: Создаём мероприятие в cons:', eventData.name)
      
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

      const { data, error } = await supabase
        .from('cons')
        .insert([{
          name: eventData.name.trim(),
          slug: eventData.slug,
          description: eventData.description?.trim(),
          short_description: eventData.short_description?.trim(),
          event_date: eventData.event_date,
          announced_date: eventData.announced_date,
          location: eventData.location?.trim(),
          city: eventData.city?.trim(),
          country: eventData.country || 'Россия',
          banner_url: eventData.banner_url?.trim(),
          logo_url: eventData.logo_url?.trim(),
          status: eventData.status || 'upcoming',
          event_type: eventData.event_type || 'convention',
          attendance_status: eventData.attendance_status || 'planning',
          attendees_count: eventData.attendees_count,
          my_rating: eventData.my_rating,
          is_featured: eventData.is_featured || false,
          has_fursuit_friendly: eventData.has_fursuit_friendly !== false,
          has_dealers_den: eventData.has_dealers_den || false,
          has_art_show: eventData.has_art_show || false
        }])
        .select()
        .single()

      if (error) throw error

      console.log('✅ createEvent: Мероприятие создано в cons:', data)
      return data

    } catch (error) {
      console.error('❌ createEvent: Ошибка создания мероприятия:', error)
      throw new Error(`Ошибка создания мероприятия: ${error.message}`)
    }
  },

  async updateEvent(eventId, eventData) {
    try {
      console.log('🔄 updateEvent: Обновляем мероприятие в cons:', eventId)
      
      // Удаляем поля, которые нельзя обновлять
      const { id, created_at, ...updateData } = eventData
      updateData.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('cons')
        .update(updateData)
        .eq('id', eventId)
        .select()
        .single()

      if (error) throw error

      console.log('✅ updateEvent: Мероприятие обновлено в cons')
      return data

    } catch (error) {
      console.error('❌ updateEvent: Ошибка обновления мероприятия:', error)
      throw new Error(`Ошибка обновления мероприятия: ${error.message}`)
    }
  },

  async deleteEvent(eventId) {
    try {
      console.log('🗑️ deleteEvent: Удаляем мероприятие из cons:', eventId)
      
      const { error } = await supabase
        .from('cons')
        .delete()
        .eq('id', eventId)

      if (error) throw error

      console.log('✅ deleteEvent: Мероприятие удалено из cons')
      return true

    } catch (error) {
      console.error('❌ deleteEvent: Ошибка удаления мероприятия:', error)
      throw new Error(`Ошибка удаления мероприятия: ${error.message}`)
    }
  },

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

  async addEventLink(eventId, linkData) {
    try {
      const { data, error } = await supabase
        .from('con_links')
        .insert([{
          con_id: eventId,
          link_type: linkData.link_type,
          title: linkData.title.trim(),
          url: linkData.url.trim(),
          icon_class: linkData.icon_class,
          display_order: linkData.display_order || 1
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ addEventLink: Ошибка добавления ссылки:', error)
      throw error
    }
  },

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
  // ✨ МЕТОДЫ ДЛЯ ОСОБЕННОСТЕЙ МЕРОПРИЯТИЙ
  // ============================================

  async addEventFeature(eventId, featureData) {
    try {
      const { data, error } = await supabase
        .from('con_features')
        .insert([{
          con_id: eventId,
          feature_type: featureData.feature_type,
          title: featureData.title.trim(),
          description: featureData.description?.trim(),
          icon_class: featureData.icon_class,
          display_order: featureData.display_order || 1
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ addEventFeature: Ошибка добавления особенности:', error)
      throw error
    }
  },

  // ============================================
  // 📸 МЕТОДЫ ДЛЯ ФОТОГРАФИЙ МЕРОПРИЯТИЙ
  // ============================================

  async addEventPhoto(eventId, photoData) {
    try {
      const { data, error } = await supabase
        .from('con_photos')
        .insert([{
          con_id: eventId,
          image_url: photoData.image_url.trim(),
          thumbnail_url: photoData.thumbnail_url?.trim(),
          caption: photoData.caption?.trim(),
          photo_type: photoData.photo_type || 'general',
          is_featured: photoData.is_featured || false,
          taken_at: photoData.taken_at,
          display_order: photoData.display_order || 1
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ addEventPhoto: Ошибка добавления фото:', error)
      throw error
    }
  },

  // ============================================
  // 🛒 МЕТОДЫ ДЛЯ ПОКУПОК НА МЕРОПРИЯТИЯХ
  // ============================================

  async addEventPurchase(eventId, purchaseData) {
    try {
      const { data, error } = await supabase
        .from('con_purchases')
        .insert([{
          con_id: eventId,
          item_name: purchaseData.item_name.trim(),
          description: purchaseData.description?.trim(),
          price: purchaseData.price,
          currency: purchaseData.currency || 'RUB',
          vendor_name: purchaseData.vendor_name?.trim(),
          category: purchaseData.category,
          image_url: purchaseData.image_url?.trim(),
          purchased_at: purchaseData.purchased_at || new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      // Обновляем счётчики в основной таблице
      await this.updateEventCounters(eventId)
      
      return data
    } catch (error) {
      console.error('❌ addEventPurchase: Ошибка добавления покупки:', error)
      throw error
    }
  },

  async updateEventCounters(eventId) {
    try {
      // Получаем статистику покупок
      const { data: purchaseStats, error } = await supabase
        .from('con_purchases')
        .select('price')
        .eq('con_id', eventId)

      if (error) throw error

      const totalSpent = purchaseStats.reduce((sum, p) => sum + (p.price || 0), 0)
      const purchasesCount = purchaseStats.length

      // Обновляем счётчики
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
  // 📊 СТАТИСТИЧЕСКИЕ МЕТОДЫ ДЛЯ МЕРОПРИЯТИЙ
  // ============================================

  async getEventsStats() {
    try {
      console.log('📊 getEventsStats: Получаем статистику мероприятий из cons...')
      
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

      console.log('✅ getEventsStats: Статистика получена из cons:', stats)
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

  // ============================================
  // 🔍 ПОИСК И ФИЛЬТРАЦИЯ МЕРОПРИЯТИЙ
  // ============================================

  async searchEvents(searchQuery, options = {}) {
    try {
      console.log('🔍 searchEvents: Поиск мероприятий в cons:', searchQuery)
      
      const { limit = 20, status = 'all' } = options
      
      let query = supabase
        .from('cons')
        .select('*')
        .or(`name.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)

      // Фильтр по статусу
      if (status !== 'all') {
        if (status === 'upcoming') {
          query = query.gt('event_date', new Date().toISOString())
        } else if (status === 'completed') {
          query = query.lt('event_date', new Date().toISOString())
        }
      }

      query = query.order('event_date', { ascending: false }).limit(limit)

      const { data, error } = await query

      if (error) throw error

      console.log(`✅ searchEvents: Найдено ${data?.length || 0} мероприятий в cons`)
      return data || []

    } catch (error) {
      console.error('❌ searchEvents: Ошибка поиска:', error)
      throw new Error(`Ошибка поиска мероприятий: ${error.message}`)
    }
  },
  
  // ============================================
  // ✅ ГЛАВНЫЙ МЕТОД - loadAllData
  // ============================================
  async loadAllData(options = {}) {
    const { 
      search = '', 
      tags = [], 
      artists = [], 
      showNsfw = false,
      sort = 'newest',
      limit = 24,
      offset = 0
    } = options

    try {
      console.log('🔄 loadAllData: Загружаем все данные с правильными счетчиками...')
      console.log('📋 Опции:', options)
      
      // Параллельная загрузка всех данных для максимальной скорости
      const [artsResult, artistsResult, tagsResult, charactersResult] = await Promise.all([
        this.getFurryArts(options),
        this.getFurryArtists(), // Теперь с правильными счетчиками
        this.getFurryTags(),     // Теперь с правильными счетчиками
        this.getSpecies()        // Теперь с правильными счетчиками
      ])
      
      // Статистика рассчитывается на основе полученных данных
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
      
      console.log('✅ loadAllData: Все данные загружены с правильными счетчиками!')
      console.log(`📊 Результат:`)
      console.log(`  - Артов: ${artsResult.length}`)
      console.log(`  - Художников: ${artistsResult.length} (топ: ${artistsResult[0]?.name} - ${artistsResult[0]?.artCount || 0} артов)`)
      console.log(`  - Тегов: ${tagsResult.length} (топ: ${tagsResult[0]?.name} - ${tagsResult[0]?.useCount || 0} использований)`)
      console.log(`  - Персонажей: ${charactersResult.length} (топ: ${charactersResult[0]?.name} - ${charactersResult[0]?.useCount || 0} появлений)`)
      
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
  // ✅ ПОЛУЧЕНИЕ АРТОВ
  // ============================================
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
      console.log('🔍 getFurryArts: Запрашиваем арты с опциями:', options)
      
      // Попробуем использовать gallery_view, если недоступно - прямой запрос
      let query = supabase
        .from('gallery_view')
        .select('*')

      // Поиск по названию
      if (search.trim()) {
        query = query.ilike('title', `%${search}%`)
      }

      // Фильтр по художникам
      if (artists.length > 0) {
        query = query.in('artist_name', artists)
      }

      // ✅ NSFW фильтр (поддерживаем оба варианта)
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
        console.error('❌ Ошибка запроса к gallery_view:', error)
        if (error.message.includes('does not exist') || error.code === '42P01') {
          console.warn('⚠️ Представление gallery_view не существует, используем прямой запрос')
          return await this.getFurryArtsDirectQuery(options)
        }
        throw error
      }

      console.log(`✅ getFurryArts: Получено артов из gallery_view: ${data?.length || 0}`)

      // Унифицированная обработка данных
      let processedArts = (data || []).map(art => ({
        // Основные поля
        id: art.id,
        title: art.title,
        image_url: art.image_url,
        thumbnail_url: art.thumbnail_url || art.image_url,
        is_nsfw: art.is_nsfw || false,
        created_date: art.upload_date,
        created_at: art.upload_date,
        upload_date: art.upload_date,
        
        // Художник
        artist_name: art.artist_name,
        artist_avatar: art.artist_avatar,
        artist_is_friend: art.artist_is_friend,
        
        // Персонажи
        characters: Array.isArray(art.characters) ? art.characters : [],
        depicted_fursona_names: Array.isArray(art.characters) ? 
          art.characters.map(c => c.name) : [],
        depicted_fursona_avatars: Array.isArray(art.characters) ? 
          art.characters.map(c => c.avatar) : [],
        
        // Теги
        tags: Array.isArray(art.tags) ? art.tags.map(t => t.name) : [],
        tagNames: Array.isArray(art.tags) ? art.tags.map(t => t.name) : []
      }))

      // Фильтрация по тегам (после парсинга JSON)
      if (tags.length > 0) {
        processedArts = processedArts.filter(art => 
          tags.some(tagName => art.tagNames.includes(tagName))
        )
      }

      console.log(`✅ getFurryArts: Обработано артов: ${processedArts.length}`)
      return processedArts
      
    } catch (error) {
      console.error('❌ getFurryArts: Ошибка получения артов:', error)
      throw error
    }
  },

  // ✅ РЕЗЕРВНЫЙ МЕТОД: Прямой запрос к таблицам если gallery_view недоступно
  async getFurryArtsDirectQuery(options = {}) {
    const { 
      search = '', 
      showNsfw = false,
      sort = 'newest',
      limit = 24,
      offset = 0
    } = options

    try {
      console.log('🔍 getFurryArtsDirectQuery: Прямой запрос к таблицам...')
      
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

      // Поиск по названию
      if (search.trim()) {
        query = query.ilike('title', `%${search}%`)
      }

      // NSFW фильтр
      if (!showNsfw) {
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
      }

      // Пагинация
      if (offset > 0) {
        query = query.range(offset, offset + limit - 1)
      } else {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) throw error

      console.log(`✅ getFurryArtsDirectQuery: Получено артов: ${data?.length || 0}`)

      // Обрабатываем данные
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
          
          // Художник
          artist_name: mainArtist?.nickname || 'Неизвестно',
          artist_avatar: mainArtist?.avatar_url,
          artist_is_friend: mainArtist?.is_friend || false,
          
          // Пустые массивы для совместимости
          characters: [],
          tags: [],
          tagNames: []
        }
      })

      return processedArts
      
    } catch (error) {
      console.error('❌ getFurryArtsDirectQuery: Ошибка прямого запроса:', error)
      return []
    }
  },

  // ============================================
  // ✅ ИСПРАВЛЕННОЕ ПОЛУЧЕНИЕ ХУДОЖНИКОВ С ПОДСЧЕТОМ
  // ============================================
  
  async getFurryArtists() {
    try {
      console.log('🎨 getFurryArtists: Загружаем художников с подсчетом артов...')
      
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
        
        console.log(`👨‍🎨 ${artist.nickname}: ${artCount} артов`)
        
        return {
          id: artist.id,
          name: artist.nickname,
          nickname: artist.nickname,
          avatar_url: artist.avatar_url,
          is_friend: artist.is_friend,
          created_at: artist.created_at,
          count: artCount,        // Для совместимости
          artCount: artCount      // Основное поле
        }
      })
      
      // Сортируем по количеству артов (сначала больше)
      const sortedArtists = artistsWithCounts.sort((a, b) => (b.artCount || 0) - (a.artCount || 0))
      
      console.log('✅ getFurryArtists: Художники с подсчетами загружены:', sortedArtists.length)
      console.log('📊 Топ 3 художника:', sortedArtists.slice(0, 3).map(a => `${a.name}: ${a.artCount}`))
      
      return sortedArtists
      
    } catch (error) {
      console.error('❌ getFurryArtists: Ошибка получения художников:', error)
      return []
    }
  },

  async createArtist(artistData) {
    try {
      console.log('➕ createArtist:', artistData)
      
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

  async updateArtist(artistId, artistData) {
    try {
      console.log('🔄 updateArtist:', artistId, artistData)
      
      const { data, error } = await supabase
        .from('persons')
        .update({
          nickname: artistData.nickname.trim(),
          avatar_url: artistData.avatar_url?.trim() || null,
          is_friend: artistData.is_friend || false
        })
        .eq('id', artistId)
        .select()

      if (error) throw error
      if (!data || data.length === 0) {
        throw new Error('Художник не найден')
      }
      console.log('✅ updateArtist: Художник обновлен:', data[0])
      return data[0]
    } catch (error) {
      console.error('❌ updateArtist: Ошибка обновления художника:', error)
      throw error
    }
  },

  async deleteArtist(artistId) {
    try {
      console.log('🗑️ deleteArtist:', artistId)
      
      const { error } = await supabase
        .from('persons')
        .delete()
        .eq('id', artistId)

      if (error) throw error
      console.log('✅ deleteArtist: Художник удален')
      return true
    } catch (error) {
      console.error('❌ deleteArtist: Ошибка удаления художника:', error)
      throw error
    }
  },

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
  // ✅ ИСПРАВЛЕННОЕ ПОЛУЧЕНИЕ ТЕГОВ С ПОДСЧЕТОМ (БЕЗ color_hex!)
  // ============================================
  
  async getFurryTags() {
    try {
      console.log('🏷️ getFurryTags: Загружаем теги с подсчетом использований...')
      
      // Получаем все теги (ТОЛЬКО те поля, что есть в БД)
      const { data: tags, error: tagsError } = await supabase
        .from('tags')
        .select('id, name, created_at')  // ✅ ТОЛЬКО существующие поля!
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
        
        console.log(`🏷️ ${tag.name}: ${useCount} использований`)
        
        return {
          id: tag.id,
          name: tag.name,
          created_at: tag.created_at,
          count: useCount,     // Для совместимости
          useCount: useCount   // Основное поле
        }
      })
      
      // Сортируем по количеству использований (сначала больше)
      const sortedTags = tagsWithCounts.sort((a, b) => (b.useCount || 0) - (a.useCount || 0))
      
      console.log('✅ getFurryTags: Теги с подсчетами загружены:', sortedTags.length)
      console.log('📊 Топ 5 тегов:', sortedTags.slice(0, 5).map(t => `${t.name}: ${t.useCount}`))
      
      return sortedTags
      
    } catch (error) {
      console.error('❌ getFurryTags: Ошибка получения тегов:', error)
      return []
    }
  },

  async createTag(tagData) {
    try {
      console.log('➕ createTag:', tagData)
      
      const existingTag = await this.checkTagExists(tagData.name)
      if (existingTag) {
        throw new Error('Тег с таким названием уже существует')
      }

      // ✅ ИСПРАВЛЕНО: ТОЛЬКО поля, которые есть в БД
      const { data, error } = await supabase
        .from('tags')
        .insert([{
          name: tagData.name.trim()
          // НЕТ color_hex - этого поля нет в схеме!
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

  async updateTag(tagId, tagData) {
    try {
      console.log('🔄 updateTag:', tagId, tagData)
      
      // ✅ ИСПРАВЛЕНО: ТОЛЬКО поля, которые есть в БД
      const { data, error } = await supabase
        .from('tags')
        .update({
          name: tagData.name.trim()
          // НЕТ color_hex - этого поля нет в схеме!
        })
        .eq('id', tagId)
        .select()

      if (error) throw error
      if (!data || data.length === 0) {
        throw new Error('Тег не найден')
      }
      console.log('✅ updateTag: Тег обновлен:', data[0])
      return data[0]
    } catch (error) {
      console.error('❌ updateTag: Ошибка обновления тега:', error)
      throw error
    }
  },

  async deleteTag(tagId) {
    try {
      console.log('🗑️ deleteTag:', tagId)
      
      // Удаляем связи с артами
      await supabase.from('art_tags').delete().eq('tag_id', tagId)
      
      // Удаляем сам тег
      const { error } = await supabase.from('tags').delete().eq('id', tagId)
      if (error) throw error
      
      console.log('✅ deleteTag: Тег удален')
      return true
    } catch (error) {
      console.error('❌ deleteTag: Ошибка удаления тега:', error)
      throw error
    }
  },

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
  // ✅ ИСПРАВЛЕННОЕ ПОЛУЧЕНИЕ ПЕРСОНАЖЕЙ С ПОДСЧЕТОМ
  // ============================================
  
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
        
        console.log(`🦊 ${character.name}: ${useCount} появлений`)
        
        return {
          id: character.id,
          name: character.name,
          avatar_url: character.avatar_url,
          created_at: character.created_at,
          count: useCount,     // Для совместимости
          useCount: useCount   // Основное поле
        }
      })
      
      // Сортируем по количеству появлений (сначала больше)
      const sortedCharacters = charactersWithCounts.sort((a, b) => (b.useCount || 0) - (a.useCount || 0))
      
      console.log('✅ getSpecies: Персонажи с подсчетами загружены:', sortedCharacters.length)
      console.log('📊 Топ 3 персонажа:', sortedCharacters.slice(0, 3).map(c => `${c.name}: ${c.useCount}`))
      
      return sortedCharacters
      
    } catch (error) {
      console.error('❌ getSpecies: Ошибка получения персонажей:', error)
      return []
    }
  },

  async createCharacter(characterData) {
    try {
      console.log('➕ createCharacter:', characterData)
      
      const existingCharacter = await this.checkCharacterExists(characterData.name)
      if (existingCharacter) {
        throw new Error('Персонаж с таким именем уже существует')
      }

      const { data, error } = await supabase
        .from('fursonas')
        .insert([{
          name: characterData.name.trim(),
          avatar_url: characterData.avatar_url?.trim() || null,
          person_id: null // Можно будет привязать к художнику позже
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

  async updateCharacter(characterId, characterData) {
    try {
      console.log('🔄 updateCharacter:', characterId, characterData)
      
      const { data, error } = await supabase
        .from('fursonas')
        .update({
          name: characterData.name.trim(),
          avatar_url: characterData.avatar_url?.trim() || null
        })
        .eq('id', characterId)
        .select()

      if (error) throw error
      if (!data || data.length === 0) {
        throw new Error('Персонаж не найден')
      }
      console.log('✅ updateCharacter: Персонаж обновлен:', data[0])
      return data[0]
    } catch (error) {
      console.error('❌ updateCharacter: Ошибка обновления персонажа:', error)
      throw error
    }
  },

  async deleteCharacter(characterId) {
    try {
      console.log('🗑️ deleteCharacter:', characterId)
      
      // Удаляем связи с артами
      await supabase.from('art_fursonas').delete().eq('fursona_id', characterId)
      
      // Удаляем самого персонажа
      const { error } = await supabase.from('fursonas').delete().eq('id', characterId)
      if (error) throw error
      
      console.log('✅ deleteCharacter: Персонаж удален')
      return true
    } catch (error) {
      console.error('❌ deleteCharacter: Ошибка удаления персонажа:', error)
      throw error
    }
  },

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
  // ✅ ДОБАВЛЕНИЕ И УДАЛЕНИЕ АРТОВ (ИСПРАВЛЕНО!)
  // ============================================
  
  async addFurryArt(artData) {
    try {
      console.log('➕ addFurryArt:', artData)
      
      // ✅ ИСПРАВЛЕНО: Прямая вставка вместо проблемной RPC функции
      
      // Сначала находим или создаем художника
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
        // Создаем нового художника
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
      
      // Создаем арт (используем ТОЧНЫЕ поля из схемы БД)
      const { data: artResult, error: artError } = await supabase
        .from('arts')
        .insert([{
          title: artData.title,
          image_url: artData.image_url,
          thumbnail_url: artData.thumbnail_url || artData.image_url,
          is_nsfw: artData.is_nsfw || false,  // ✅ Поле есть в схеме
          upload_date: new Date().toISOString(),
          is_deleted: false
        }])
        .select('id')
        .single()
      
      if (artError) throw artError
      
      // Добавляем связь художник-арт как главный художник
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

  async deleteArt(artId) {
    try {
      console.log('🗑️ deleteArt:', artId)
      
      // Удаляем все связи
      await Promise.all([
        supabase.from('art_tags').delete().eq('art_id', artId),
        supabase.from('art_fursonas').delete().eq('art_id', artId),
        supabase.from('art_collaborators').delete().eq('art_id', artId)
      ])

      // Помечаем арт как удаленный (soft delete)
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
  // ✅ ДОБАВЛЕНИЕ СВЯЗЕЙ (ТЕГИ И ПЕРСОНАЖИ)
  // ============================================
  
  async addArtTags(artId, tagNames) {
    try {
      console.log('🏷️ addArtTags:', artId, tagNames)
      
      // Создаем теги, которых нет
      for (const tagName of tagNames) {
        const exists = await this.checkTagExists(tagName)
        if (!exists) {
          await this.createTag({ name: tagName })
        }
      }

      // Получаем ID тегов
      const { data: tags, error: tagsError } = await supabase
        .from('tags')
        .select('id, name')
        .in('name', tagNames)

      if (tagsError) throw tagsError

      // Создаем связи
      const tagLinks = tags.map(tag => ({
        art_id: artId,
        tag_id: tag.id
      }))

      const { error } = await supabase.from('art_tags').insert(tagLinks)
      if (error) throw error
      
      console.log('✅ addArtTags: Теги добавлены')
      return tagLinks
    } catch (error) {
      console.error('❌ addArtTags: Ошибка добавления тегов:', error)
      throw error
    }
  },

  async addArtCharacters(artId, characterNames) {
    try {
      console.log('🦊 addArtCharacters:', artId, characterNames)
      
      // Создаем персонажей, которых нет
      for (const characterName of characterNames) {
        const exists = await this.checkCharacterExists(characterName)
        if (!exists) {
          await this.createCharacter({ name: characterName })
        }
      }

      // Получаем ID персонажей
      const { data: characters, error: charactersError } = await supabase
        .from('fursonas')
        .select('id, name')
        .in('name', characterNames)

      if (charactersError) throw charactersError

      // Создаем связи
      const characterLinks = characters.map((character, index) => ({
        art_id: artId,
        fursona_id: character.id,
        display_order: index + 1
      }))

      const { error } = await supabase.from('art_fursonas').insert(characterLinks)
      if (error) throw error
      
      console.log('✅ addArtCharacters: Персонажи добавлены')
      return characterLinks
    } catch (error) {
      console.error('❌ addArtCharacters: Ошибка добавления персонажей:', error)
      throw error
    }
  },

  // ============================================
  // ✅ СТАТИСТИКА И ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ
  // ============================================
  
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
        // Основные счетчики
        artists: artists.length,
        tags: tags.length,
        characters: characters.length,
        arts: arts.length,
        
        // Дополнительная статистика
        nsfwArts: arts.filter(art => art.is_nsfw).length,
        sfwArts: arts.filter(art => !art.is_nsfw).length,
        friendArtists: artists.filter(artist => artist.is_friend).length,
        
        // S3 файлы
        s3Files: arts.filter(art => this.isS3Url(art.image_url)).length,
        
        // Недавние загрузки (за неделю)
        recentUploads: arts.filter(art => {
          if (!art.created_date) return false
          const uploadDate = new Date(art.created_date)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return uploadDate >= weekAgo
        }).length,
        
        // Топ данные
        topArtist: artists.length > 0 ? artists[0] : null,
        topTag: tags.length > 0 ? tags[0] : null,
        topCharacter: characters.length > 0 ? characters[0] : null
      }
      
      console.log('✅ getDashboardStats: Полная статистика:', stats)
      return stats
      
    } catch (error) {
      console.error('❌ getDashboardStats: Ошибка получения статистики:', error)
      return {
        artists: 0,
        tags: 0, 
        characters: 0,
        arts: 0,
        nsfwArts: 0,
        sfwArts: 0,
        friendArtists: 0,
        s3Files: 0,
        recentUploads: 0,
        topArtist: null,
        topTag: null,
        topCharacter: null
      }
    }
  },

  async getAdminStats() {
    try {
      console.log('📊 getAdminStats: Получаем статистику для админки...')
      return await this.getDashboardStats()
    } catch (error) {
      console.error('❌ getAdminStats: Ошибка статистики:', error)
      return { artists: 0, tags: 0, arts: 0 }
    }
  },

  // ============================================
  // ✅ ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
  // ============================================
  
  isS3Url(url) {
    if (!url) return false
    return url.includes('supabase.co/storage') || url.includes('gallery/')
  },

  // ============================================
  // ✅ АЛИАСЫ ДЛЯ СОВМЕСТИМОСТИ
  // ============================================
  
  async searchFurryContent(searchTerm) {
    return this.getFurryArts({ search: searchTerm })
  }
}

// ✅ Экспорт для совместимости
export const api = furryApi

// ✅ ДЕФОЛТНЫЙ ЭКСПОРТ
export default furryApi

// ✅ Логируем успешную инициализацию
console.log('✅ ПОЛНОСТЬЮ ИСПРАВЛЕННЫЙ API FOX TAFFY ЗАГРУЖЕН!')
console.log('🔒 Все переменные берутся из окружения, хардкода нет!')
console.log('📊 Счетчики художников, тегов и персонажей исправлены!')
console.log('🗃️ API полностью соответствует реальной схеме БД!')
console.log('🎯 Все методы API готовы к работе!')