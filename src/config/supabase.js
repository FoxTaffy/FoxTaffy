// ✅ ПОЛНОСТЬЮ ИСПРАВЛЕННЫЙ API FOX TAFFY - С ПРАВИЛЬНЫМИ СЧЕТЧИКАМИ
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

// ✅ ПОЛНОСТЬЮ ИСПРАВЛЕННЫЙ API С ПРАВИЛЬНЫМИ СЧЕТЧИКАМИ
export const furryApi = {
  
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
          console.warn('⚠️ Представление gallery_view не существует, возвращаем пустой массив')
          return []
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
      
      // Получаем все арты для подсчета
      const { data: arts, error: artsError } = await supabase
        .from('gallery_view')
        .select('artist_name')

      if (artsError) {
        console.warn('⚠️ Не удалось загрузить арты для подсчета:', artsError)
        // Возвращаем художников без подсчетов
        return (artists || []).map(artist => ({
          id: artist.id,
          name: artist.nickname,
          nickname: artist.nickname,
          avatar_url: artist.avatar_url,
          is_friend: artist.is_friend,
          created_at: artist.created_at,
          count: 0,
          artCount: 0
        }))
      }
      
      // Подсчитываем арты для каждого художника
      const artistsWithCounts = (artists || []).map(artist => {
        const artCount = (arts || []).filter(art => 
          art.artist_name === artist.nickname
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
  // ✅ ИСПРАВЛЕННОЕ ПОЛУЧЕНИЕ ТЕГОВ С ПОДСЧЕТОМ
  // ============================================
  
  async getFurryTags() {
    try {
      console.log('🏷️ getFurryTags: Загружаем теги с подсчетом использований...')
      
      // Получаем все теги
      const { data: tags, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true })

      if (tagsError) throw tagsError
      
      // Получаем все арты с тегами для подсчета
      const { data: arts, error: artsError } = await supabase
        .from('gallery_view')
        .select('tags')

      if (artsError) {
        console.warn('⚠️ Не удалось загрузить арты для подсчета тегов:', artsError)
        // Возвращаем теги без подсчетов
        return (tags || []).map(tag => ({
          id: tag.id,
          name: tag.name,
          color_hex: tag.color_hex,
          created_at: tag.created_at,
          count: 0,
          useCount: 0
        }))
      }
      
      // Подсчитываем использование каждого тега
      const tagsWithCounts = (tags || []).map(tag => {
        let useCount = 0
        
        // Проходим по всем артам и считаем использования тега
        ;(arts || []).forEach(art => {
          try {
            const artTags = Array.isArray(art.tags) ? art.tags : []
            const hasTag = artTags.some(artTag => 
              artTag && (artTag.name === tag.name || artTag === tag.name)
            )
            if (hasTag) {
              useCount++
            }
          } catch (e) {
            // Игнорируем ошибки парсинга отдельных артов
          }
        })
        
        console.log(`🏷️ ${tag.name}: ${useCount} использований`)
        
        return {
          id: tag.id,
          name: tag.name,
          color_hex: tag.color_hex,
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

      const { data, error } = await supabase
        .from('tags')
        .insert([{
          name: tagData.name.trim(),
          color_hex: tagData.color_hex || '#FF7B25'
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
      
      const { data, error } = await supabase
        .from('tags')
        .update({
          name: tagData.name.trim(),
          color_hex: tagData.color_hex || '#FF7B25'
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
      
      // Получаем все арты с персонажами для подсчета
      const { data: arts, error: artsError } = await supabase
        .from('gallery_view')
        .select('characters')

      if (artsError) {
        console.warn('⚠️ Не удалось загрузить арты для подсчета персонажей:', artsError)
        // Возвращаем персонажей без подсчетов
        return (characters || []).map(character => ({
          id: character.id,
          name: character.name,
          avatar_url: character.avatar_url,
          created_at: character.created_at,
          count: 0,
          useCount: 0
        }))
      }
      
      // Подсчитываем появления каждого персонажа
      const charactersWithCounts = (characters || []).map(character => {
        let useCount = 0
        
        // Проходим по всем артам и считаем появления персонажа
        ;(arts || []).forEach(art => {
          try {
            const artCharacters = Array.isArray(art.characters) ? art.characters : []
            const hasCharacter = artCharacters.some(artChar => 
              artChar && (artChar.name === character.name || artChar === character.name)
            )
            if (hasCharacter) {
              useCount++
            }
          } catch (e) {
            // Игнорируем ошибки парсинга отдельных артов
          }
        })
        
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
  // ✅ ДОБАВЛЕНИЕ И УДАЛЕНИЕ АРТОВ
  // ============================================
  
  async addFurryArt(artData) {
    try {
      console.log('➕ addFurryArt:', artData)
      
      // Используем функцию add_simple_art для добавления
      const { data, error } = await supabase.rpc('add_simple_art', {
        p_title: artData.title,
        p_artist_nickname: artData.artist_nickname,
        p_image_url: artData.image_url,
        p_thumbnail_url: artData.thumbnail_url || artData.image_url
      })

      if (error) throw error
      console.log('✅ addFurryArt: Арт добавлен с ID:', data)
      return { id: data, ...artData }
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

      // Удаляем сам арт (используем soft delete)
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
console.log('🎯 Все методы API готовы к работе!')