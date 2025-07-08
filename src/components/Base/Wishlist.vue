<template>
    <div class="section" v-scroll-animation>
      <h2 class="section-title">Список желаний</h2>
      
      <div class="wishlist-intro">
        <p>Топ-6 вещей, которые хочу приобрести или получить в подарок 🎁</p>
      </div>
  
      <!-- Компактная сетка желаний 2x3 -->
      <div class="wishes-grid">
        <div 
          v-for="wish in topWishes" 
          :key="wish.id"
          class="wish-card"
          :class="{ 'urgent': wish.urgent }"
        >
          <!-- Изображение товара -->
          <div class="wish-image-container">
            <img :src="wish.image" :alt="wish.title" class="wish-image" />
            <div class="wish-overlay">
              <!-- Цена -->
              <div class="wish-price-tag">{{ wish.price }}</div>
              <!-- Индикатор срочности -->
              <div v-if="wish.urgent" class="urgent-indicator">
                <i class="fas fa-fire"></i>
              </div>
            </div>
          </div>
  
          <!-- Информация о товаре -->
          <div class="wish-info">
            <h3 class="wish-title">{{ wish.title }}</h3>
            <p class="wish-description">{{ wish.description }}</p>
            
            <!-- Ссылка на покупку -->
            <a 
              v-if="wish.buyLink" 
              :href="wish.buyLink" 
              target="_blank" 
              class="buy-button"
            >
              <i class="fas fa-shopping-cart"></i>
              Купить
            </a>
            <div v-else class="no-link-button">
              <i class="fas fa-search"></i>
              Ищу
            </div>
          </div>
        </div>
      </div>
  
      <!-- Компактная заметка о подарках -->
      <div class="gift-footer">
        <div class="gift-content">
          <i class="fas fa-heart gift-heart"></i>
          <span>Буду благодарен за любой подарок! Пишите в </span>
          <a href="https://t.me/foxtaffy" target="_blank">Telegram</a>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'WishlistPreview',
    data() {
      return {
        // Топ-6 самых важных желаний для компактного отображения
        topWishes: [
          {
            id: 1,
            title: 'Игровое кресло',
            description: 'DXRacer Formula',
            price: '35K₽',
            image: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=400&h=300&fit=crop',
            urgent: true,
            buyLink: 'https://www.dxracer.ru/catalog/gaming_chairs/formula_series/'
          },
          {
            id: 2,
            title: 'Mountain Dew',
            description: 'Energy напиток',
            price: '150₽',
            image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=300&fit=crop',
            buyLink: 'https://www.ozon.ru/search/?text=mountain+dew+energy'
          },
          {
            id: 3,
            title: 'Claude Pro',
            description: 'ИИ подписка',
            price: '$20/мес',
            image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
            buyLink: 'https://claude.ai/upgrade'
          },
          {
            id: 4,
            title: 'Планшет Wacom',
            description: 'Для рисования',
            price: '45K₽',
            image: 'https://images.unsplash.com/photo-1609743522653-52354461eb27?w=400&h=300&fit=crop',
            buyLink: 'https://www.wacom.com/ru-ru/products/pen-tablets/wacom-intuos-pro'
          },
          {
            id: 5,
            title: 'Steam Deck',
            description: 'Портативная консоль',
            price: '65K₽',
            image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop',
            buyLink: 'https://store.steampowered.com/steamdeck'
          },
          {
            id: 6,
            title: 'RGB подсветка',
            description: 'Philips Hue',
            price: '12K₽',
            image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
            buyLink: 'https://www.philips.ru/c-m-li/hue-personalized-lighting'
          }
        ]
      }
    }
  }
  </script>
  
  <style scoped>
  /* Введение */
  .wishlist-intro {
    text-align: center;
    margin-bottom: 1.5rem;
  }
  
  .wishlist-intro p {
    font-size: 1rem;
    color: var(--text-muted);
    margin: 0;
  }
  
  /* Компактная сетка 2x3 */
  .wishes-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
    max-height: 400px; /* Ограничиваем высоту для квадратности */
  }
  
  /* Карточка желания */
  .wish-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.8rem;
    overflow: hidden;
    transition: var(--transition);
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .wish-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px var(--shadow);
    background: rgba(255, 255, 255, 0.08);
  }
  
  .wish-card.urgent {
    border: 2px solid rgba(255, 123, 37, 0.3);
  }
  
  /* Изображение */
  .wish-image-container {
    position: relative;
    height: 80px;
    overflow: hidden;
    flex-shrink: 0;
  }
  
  .wish-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  .wish-card:hover .wish-image {
    transform: scale(1.05);
  }
  
  .wish-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, transparent 20%, rgba(0, 0, 0, 0.6) 100%);
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 0.5rem;
  }
  
  .wish-price-tag {
    background: rgba(255, 123, 37, 0.9);
    color: white;
    padding: 0.2rem 0.5rem;
    border-radius: 0.8rem;
    font-size: 0.75rem;
    font-weight: 700;
    backdrop-filter: blur(5px);
  }
  
  .urgent-indicator {
    background: rgba(255, 71, 87, 0.9);
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    animation: pulse 1.5s infinite;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  
  /* Информация о товаре */
  .wish-info {
    padding: 0.8rem;
    display: flex;
    flex-direction: column;
    flex: 1;
    justify-content: space-between;
  }
  
  .wish-title {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-light);
    margin: 0 0 0.2rem 0;
    line-height: 1.2;
  }
  
  .wish-description {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin: 0 0 0.8rem 0;
    line-height: 1.3;
  }
  
  /* Кнопки покупки */
  .buy-button, .no-link-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    padding: 0.4rem 0.8rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-decoration: none;
    transition: var(--transition);
    margin-top: auto;
  }
  
  .buy-button {
    background: linear-gradient(135deg, var(--accent-green), #5dbd61);
    color: white;
  }
  
  .buy-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(76, 175, 80, 0.3);
  }
  
  .no-link-button {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-muted);
    cursor: default;
  }
  
  /* Компактный футер */
  .gift-footer {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 0.8rem;
    padding: 1rem;
    text-align: center;
  }
  
  .gift-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    font-size: 0.9rem;
    color: var(--text-muted);
  }
  
  .gift-heart {
    color: #ff4757;
    animation: heartbeat 2s ease-in-out infinite;
  }
  
  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  
  .gift-content a {
    color: var(--accent-orange);
    text-decoration: none;
    font-weight: 600;
    transition: var(--transition);
  }
  
  .gift-content a:hover {
    color: var(--accent-green);
  }
  
  /* Адаптивность */
  @media (max-width: 768px) {
    .wishes-grid {
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(3, 1fr);
      max-height: 600px;
    }
    
    .wish-image-container {
      height: 70px;
    }
    
    .wish-info {
      padding: 0.6rem;
    }
  }
  
  @media (max-width: 480px) {
    .wishes-grid {
      grid-template-columns: 1fr;
      grid-template-rows: auto;
      max-height: none;
    }
    
    .wish-card {
      flex-direction: row;
      height: auto;
    }
    
    .wish-image-container {
      width: 80px;
      height: 80px;
      flex-shrink: 0;
    }
    
    .wish-info {
      padding: 0.8rem;
      flex: 1;
    }
    
    .gift-content {
      flex-direction: column;
      gap: 0.3rem;
    }
  }
  </style>