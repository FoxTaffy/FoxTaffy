/**
 * Утилиты для создания SVG заглушек изображений
 * Заменяет заблокированный via.placeholder.com
 */

/**
 * Создает SVG заглушку для изображений
 */
export function createPlaceholderImage(
    width = 400, 
    height = 200, 
    backgroundColor = '1a1a1a', 
    textColor = 'ff7b25', 
    text = '🎪',
    fontSize = 50
  ) {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="#${backgroundColor}"/>
        <text 
          x="${width/2}" 
          y="${height/2 + fontSize/3}" 
          font-family="Nunito,Arial,sans-serif" 
          font-size="${fontSize}" 
          fill="#${textColor}" 
          text-anchor="middle"
        >${text}</text>
      </svg>
    `.trim()
    
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
  }
  
  /**
   * Создает круглый аватар-заглушку
   */
  export function createAvatarPlaceholder(
    size = 64,
    backgroundColor = 'ff7b25',
    textColor = 'ffffff',
    text = '🦊'
  ) {
    const fontSize = size * 0.4
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="#${backgroundColor}"/>
        <text 
          x="${size/2}" 
          y="${size/2 + fontSize/3}" 
          font-family="Nunito,Arial,sans-serif" 
          font-size="${fontSize}" 
          fill="#${textColor}" 
          text-anchor="middle"
        >${text}</text>
      </svg>
    `.trim()
    
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
  }
  
  /**
   * Готовые заглушки для типичных случаев
   */
  export const placeholders = {
    // Для мероприятий
    event: createPlaceholderImage(400, 200, '1a1a1a', 'ff7b25', '🎪', 50),
    eventSmall: createPlaceholderImage(300, 150, '1a1a1a', 'ff7b25', '🎪', 40),
    eventLarge: createPlaceholderImage(800, 400, '1a1a1a', 'ff7b25', '🎪', 80),
    
    // Для галереи
    artwork: createPlaceholderImage(300, 300, '1a1a1a', '4caf50', '🎨', 60),
    
    // Аватары
    userAvatar: createAvatarPlaceholder(64, 'ff7b25', 'ffffff', '🦊'),
    artistAvatar: createAvatarPlaceholder(64, '4caf50', 'ffffff', '🎨'),
    fursonaAvatar: createAvatarPlaceholder(64, 'ff7b25', 'ffffff', '🐱'),
  }
  
  /**
   * Универсальная функция для получения изображения с заглушкой
   */
  export function getImageWithPlaceholder(imageUrl, placeholder = placeholders.event) {
    if (!imageUrl) {
      return `url(${placeholder})`
    }
    return `url(${imageUrl})`
  }
  
  /**
   * Специализированные функции для разных типов изображений
   */
  export const imageHelpers = {
    // Для мероприятий
    getEventBanner: (url) => getImageWithPlaceholder(url, placeholders.event),
    getEventBannerSmall: (url) => getImageWithPlaceholder(url, placeholders.eventSmall),
    getEventBannerLarge: (url) => getImageWithPlaceholder(url, placeholders.eventLarge),
    
    // Для аватаров
    getUserAvatar: (url) => url || placeholders.userAvatar,
    getArtistAvatar: (url) => url || placeholders.artistAvatar,
    getFursonaAvatar: (url) => url || placeholders.fursonaAvatar,
    
    // Для артов
    getArtwork: (url) => getImageWithPlaceholder(url, placeholders.artwork),
  }