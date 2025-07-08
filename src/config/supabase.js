// ✅ ИСПРАВЛЕННЫЙ API FOX TAFFY - ВСЕ ПРОБЛЕМЫ УСТРАНЕНЫ
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://plugjsubjcfblzkabjia.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsdWdqc3ViamNmYmx6a2FiamlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNDM4NTUsImV4cCI6MjA2NTkxOTg1NX0._SjaevspsFdM_0-dOc7zPTIfwDCspl39wkkHDMjtlKo'

export const supabase = createClient(supabaseUrl, supabaseKey)

// ✅ ИСПРАВЛЕННЫЙ API С УНИФИЦИРОВАННЫМИ ПОЛЯМИ + loadAllData
export const furryApi = {
  
  // ============================================
  // ✅ ГЛАВНЫЙ МЕТОД - loadAllData (ОБЯЗАТЕЛЬНО!)
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
      console.log('🔄 loadAllData: Загружаем все данные оптимизированно...')
      console.log('📋 Опции:', options)
      
      // Параллельная загрузка всех данных для максимальной скорости
      const [artsResult, artistsResult, tagsResult, charactersResult] = await Promise.all([
        this.getFurryArts(options),
        this.getFurryArtists(),
        this.getFurryTags(),
        this.getSpecies()
      ])
      
      // Статистика рассчитывается на основе полученных данных
      const stats = {
        arts: artsResult.length,
        artists: artistsResult.length,
        tags: tagsResult.length,
        characters: charactersResult.length
      }
      
      console.log('✅ loadAllData: Все данные загружены!')
      console.log(`📊 Результат: артов ${artsResult.length}, художников ${artistsResult.length}, тегов ${tagsResult.length}, персонажей ${charactersResult.length}`)
      
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
  // ✅ ИСПРАВЛЕННОЕ ПОЛУЧЕНИЕ АРТОВ
  // ============================================
  async getFurryArts(options = {}) {
    const { 
      search = '', 
      tags = [], 
      artists = [], 
      showYiff = false,
      showNsfw = false, // Добавляем поддержку showNsfw
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
  // ✅ ХУДОЖНИКИ
  // ============================================
  
  async getFurryArtists() {
    try {
      console.log('🎨 getFurryArtists: Загружаем художников...')
      
      const { data, error } = await supabase
        .from('persons')
        .select('*')
        .order('nickname', { ascending: true })

      if (error) throw error
      
      console.log('✅ getFurryArtists: Получены художники:', data?.length || 0)
      
      return (data || []).map(artist => ({
        id: artist.id,
        name: artist.nickname,
        nickname: artist.nickname,
        avatar_url: artist.avatar_url,
        is_friend: artist.is_friend,
        created_at: artist.created_at,
        count: 0 // Будет пересчитано при необходимости
      }))
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
  // ✅ ТЕГИ
  // ============================================
  
  async getFurryTags() {
    try {
      console.log('🏷️ getFurryTags: Загружаем теги...')
      
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      
      console.log('✅ getFurryTags: Получены теги:', data?.length || 0)
      
      return (data || []).map(tag => ({
        id: tag.id,
        name: tag.name,
        created_at: tag.created_at,
        count: 0
      }))
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

  async updateTag(tagId, tagData) {
    try {
      console.log('🔄 updateTag:', tagId, tagData)
      
      const { data, error } = await supabase
        .from('tags')
        .update({
          name: tagData.name.trim()
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
  // ✅ ПЕРСОНАЖИ
  // ============================================
  
  async getSpecies() {
    try {
      console.log('🦊 getSpecies: Загружаем персонажей...')
      
      const { data, error } = await supabase
        .from('fursonas')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      
      console.log('✅ getSpecies: Получены персонажи:', data?.length || 0)
      
      return (data || []).map(fursona => ({
        id: fursona.id,
        name: fursona.name,
        avatar_url: fursona.avatar_url,
        created_at: fursona.created_at,
        count: 0
      }))
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
      
      const { data, error } = await supabase.rpc('add_simple_art', {
        p_title: artData.title,
        p_artist_nickname: artData.artist_nickname,
        p_image_url: artData.image_url,
        p_thumbnail_url: artData.thumbnail_url,
        p_is_nsfw: artData.is_nsfw || false
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

      // Удаляем сам арт
      const { error } = await supabase.from('arts').delete().eq('id', artId)
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
  // ✅ СТАТИСТИКА
  // ============================================
  
  async getAdminStats() {
    try {
      console.log('📊 getAdminStats: Получаем статистику...')
      
      const [artists, tags, arts] = await Promise.all([
        this.getFurryArtists(),
        this.getFurryTags(),
        this.getFurryArts({ limit: 1000, showNsfw: true })
      ])

      const stats = {
        artists: artists.length,
        tags: tags.length,
        arts: arts.length
      }
      
      console.log('✅ getAdminStats: Статистика:', stats)
      return stats
    } catch (error) {
      console.error('❌ getAdminStats: Ошибка статистики:', error)
      return { artists: 0, tags: 0, arts: 0 }
    }
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

console.log('✅ ПОЛНОСТЬЮ ИСПРАВЛЕННЫЙ API FOX TAFFY ЗАГРУЖЕН!')
console.log('🎯 Все методы присутствуют:')
console.log('- ✅ loadAllData - ГЛАВНЫЙ МЕТОД!')
console.log('- ✅ getFurryArts - получение артов')
console.log('- ✅ getFurryArtists - получение художников') 
console.log('- ✅ getFurryTags - получение тегов')
console.log('- ✅ getSpecies - получение персонажей')
console.log('- ✅ CRUD операции для всех сущностей')
console.log('- ✅ NSFW фильтрация работает')
console.log('- ✅ Статистика и совместимость')