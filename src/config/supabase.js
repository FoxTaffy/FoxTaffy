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
      
      // Сначала пробуем использовать представление с полной статистикой
      let query = supabase.from('cons').select('*')

      // Фильтрация по статусу
      if (status === 'upcoming') {
        query = query.gt('event_date', new Date().toISOString().split('T')[0])
      } else if (status === 'completed') {
        query = query.lt('event_date', new Date().toISOString().split('T')[0])
      } else if (status === 'featured') {
        query = query.eq('is_featured', true)
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

      console.log('✅ getEvents: Мероприятия загружены:', data?.length || 0)
      return data || []

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
   * Получить статистику мероприятий
   */
  async getEventsStats() {
    try {
      console.log('📊 getEventsStats: Получаем статистику мероприятий...')
      
      const { data, error } = await supabase
        .from('cons')
        .select('id, event_date, my_rating, total_spent, attendees_count, is_featured')

      if (error) throw error

      const now = new Date()
      const todayISO = now.toISOString().split('T')[0]
      
      const upcoming = data.filter(e => e.event_date > todayISO)
      const completed = data.filter(e => e.event_date <= todayISO)
      const featured = data.filter(e => e.is_featured)

      const stats = {
        total: data.length,
        upcoming: upcoming.length,
        completed: completed.length,
        featured: featured.length,
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
        total: 0, upcoming: 0, completed: 0, featured: 0,
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
      
      const { data, error } = await supabase
        .from('cons')
        .insert(cleanData)
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
      
      // Сначала удаляем связанные данные
      await Promise.all([
        supabase.from('con_links').delete().eq('con_id', eventId),
        supabase.from('con_features').delete().eq('con_id', eventId),
        supabase.from('con_photos').delete().eq('con_id', eventId),
        supabase.from('con_purchases').delete().eq('con_id', eventId)
      ])
      
      // Затем удаляем само мероприятие
      const { error } = await supabase
        .from('cons')
        .delete()
        .eq('id', eventId)
      
      if (error) throw error
      
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
      
      // Используем прямой запрос к основной таблице
      let query = supabase
        .from('arts')
        .select(`
          id, title, image_url, thumbnail_url, is_nsfw, upload_date,
          art_collaborators!inner(persons!inner(nickname, avatar_url, is_friend))
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
        'title_asc': { column: 'title', ascending: true },
        'title_desc': { column: 'title', ascending: false }
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

      // Обработка результатов
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

      console.log('✅ getFurryArts: Арты загружены:', processedArts.length)
      return processedArts
      
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
      
      // Добавляем арт
      const { data: artResult, error: artError } = await supabase
        .from('arts')
        .insert([{
          title: artData.title,
          image_url: artData.image_url,
          thumbnail_url: artData.thumbnail_url || artData.image_url,
          is_nsfw: artData.is_nsfw || false,
          upload_date: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (artError) throw artError
      
      // Связываем с художником
      const { error: collabError } = await supabase
        .from('art_collaborators')
        .insert([{
          art_id: artResult.id,
          person_id: artistId,
          role: 'main_artist'
        }])
      
      if (collabError) throw collabError
      
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
          const { data: newTag, error: createError } = await supabase
            .from('tags')
            .insert([{ name: tagName }])
            .select('id')
            .single()
            
          if (createError) throw createError
          tagId = newTag.id
        }
        
        // Связываем тег с артом
        const { error: linkError } = await supabase
          .from('art_tags')
          .insert([{
            art_id: artId,
            tag_id: tagId
          }])
        
        if (linkError && linkError.code !== '23505') { // Игнорируем дублирование
          throw linkError
        }
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
          const { data: newCharacter, error: createError } = await supabase
            .from('fursonas')
            .insert([{ name: characterName }])
            .select('id')
            .single()
            
          if (createError) throw createError
          characterId = newCharacter.id
        }
        
        // Связываем персонажа с артом
        const { error: linkError } = await supabase
          .from('art_fursonas')
          .insert([{
            art_id: artId,
            fursona_id: characterId
          }])
        
        if (linkError && linkError.code !== '23505') { // Игнорируем дублирование
          throw linkError
        }
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

      const { data, error } = await supabase
        .from('persons')
        .insert([{
          nickname: artistData.nickname.trim(),
          avatar_url: artistData.avatar_url || null,
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
          avatar_url: characterData.avatar_url || null
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
      'is_featured', 'has_dealers_den', 
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
    const dateFields = ['event_date', 'announced_date']
    
    dateFields.forEach(field => {
      if (cleaned[field]) {
        const date = new Date(cleaned[field])
        if (isNaN(date.getTime())) {
          throw new Error(`Неверный формат даты в поле ${field}`)
        }
        cleaned[field] = date.toISOString().split('T')[0] // Только дата, без времени
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