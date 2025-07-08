<template>
  <div class="tupicon-wrapper">
    <!-- Construction warning tape -->
    <div class="tupicon-warning-tape tupicon-warning-tape-top"></div>
    <div class="tupicon-warning-tape tupicon-warning-tape-bottom"></div>

    <!-- Hero Section -->
    <div class="tupicon-hero-section">
      <div class="tupicon-hero-overlay"></div>
      <div class="tupicon-hero-image" :style="{ backgroundImage: `url('${eventBannerImage}')` }"></div>
      
      <div class="tupicon-hero-content">
        <router-link to="/" class="tupicon-back-button">
          <i class="fas fa-arrow-left"></i>
          <span>Назад на главную</span>
        </router-link>
        
        <div class="tupicon-event-badges">
          <span class="tupicon-event-status tupicon-visited">✅ Посетил</span>
          <span class="tupicon-event-badge tupicon-vip">⭐ VIP</span>
        </div>
        
        <h1 class="tupicon-event-title">{{ eventName }}</h1>
        <div class="tupicon-event-subtitle">{{ eventSubtitle }}</div>
      </div>
    </div>

    <!-- Event Stats Grid -->
    <section class="tupicon-event-stats">
      <div class="tupicon-container">
        <div class="tupicon-event-info-grid">
          <div class="tupicon-event-info-card" v-for="(stat, index) in eventStats" :key="index">
            <div class="tupicon-info-icon" :class="stat.colorClass">
              <i :class="stat.icon"></i>
            </div>
            <div class="tupicon-info-content">
              <div class="tupicon-info-label">{{ stat.label }}</div>
              <div class="tupicon-info-value">{{ stat.value }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Navigation Tabs -->
    <section class="tupicon-navigation-section">
      <div class="tupicon-container">
        <div class="tupicon-nav-tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['tupicon-nav-tab', { 'tupicon-active': activeTab === tab.id }]"
          >
            <i :class="tab.icon" class="tupicon-tab-icon"></i>
            <span class="tupicon-tab-text">{{ tab.label }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Content Sections -->
    <section class="tupicon-content-section">
      <div class="tupicon-container">
        
        <!-- Overview Tab -->
        <div v-show="activeTab === 'overview'" class="tupicon-content-tab">
          <h3 class="tupicon-section-title">О мероприятии</h3>
          <div class="tupicon-content-main">
            
            <!-- Event Description -->
            <div class="tupicon-event-description">
              <div class="tupicon-description-icon">
                <i class="fas fa-info-circle"></i>
              </div>
              <div class="tupicon-description-content">
                <p>{{ eventDescription }}</p>
              </div>
            </div>

            <!-- Official Links -->
            <div class="tupicon-official-links">
              <h4 class="tupicon-links-title">📱 Официальные ресурсы:</h4>
              <div class="tupicon-links-container">
                <a v-for="(link, index) in officialLinks" :key="index" :href="link.url" target="_blank" class="tupicon-event-link">
                  <i :class="link.icon"></i>
                  <span>{{ link.text }}</span>
                </a>
              </div>
            </div>

            <!-- What was at the event -->
            <div class="tupicon-features-section">
              <h4 class="tupicon-features-title">🎯 Что было на мероприятии:</h4>
              <div class="tupicon-features-grid">
                <div v-for="(feature, index) in features" :key="index" class="tupicon-feature-card">
                  <div class="tupicon-feature-icon">
                    <i :class="feature.icon"></i>
                  </div>
                  <div class="tupicon-feature-content">
                    <h5 class="tupicon-feature-title">{{ feature.title }}</h5>
                    <p class="tupicon-feature-description">{{ feature.description }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- My acquaintances -->
            <div class="tupicon-friends-section">
              <h4 class="tupicon-friends-title">🤝 Мои знакомые на мероприятии:</h4>
              <div class="tupicon-friends-grid">
                <div v-for="(friend, index) in friends" :key="index" class="tupicon-friend-card">
                  <div class="tupicon-friend-image">
                    <div v-if="friend.image" class="tupicon-friend-img">
                      <img :src="friend.image" :alt="friend.name">
                    </div>
                    <div v-else class="tupicon-friend-placeholder">
                      <i :class="friend.icon || 'fas fa-paw'"></i>
                    </div>
                  </div>
                  <div class="tupicon-friend-info">
                    <h5 class="tupicon-friend-name">{{ friend.name }}</h5>
                    <p class="tupicon-friend-desc">{{ friend.description }}</p>
                    <div v-if="friend.socialLinks" class="tupicon-friend-social">
                      <a v-for="(social, idx) in friend.socialLinks" :key="idx" :href="social.url" class="tupicon-social-link" target="_blank">
                        <i :class="social.icon"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Gallery Tab -->
        <div v-show="activeTab === 'gallery'" class="tupicon-content-tab">
          <h3 class="tupicon-section-title">📸 Фотографии</h3>
          <div class="tupicon-gallery-intro">
            <p>Вот несколько моментов, которые удалось запечатлеть на этом замечательном мероприятии!</p>
          </div>
          <div class="tupicon-gallery-grid">
            <div v-for="(photo, index) in galleryImages" :key="index" class="tupicon-gallery-item" @click="openImage(photo)">
              <img :src="photo.src" :alt="photo.alt">
              <div class="tupicon-gallery-overlay">
                <div class="tupicon-gallery-actions">
                  <button class="tupicon-gallery-btn">
                    <i class="fas fa-expand"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Purchases Tab -->
        <div v-show="activeTab === 'purchases'" class="tupicon-content-tab">
          <h3 class="tupicon-section-title">🛍️ Мои покупки</h3>
          <div class="tupicon-purchases-intro">
            <p>{{ purchasesIntro }}</p>
          </div>
          
          <div class="tupicon-purchases-grid">
            <div v-for="(purchase, index) in purchases" :key="index" class="tupicon-purchase-card">
              <div class="tupicon-purchase-image">
                <img :src="purchase.image" :alt="purchase.title">
              </div>
              <div class="tupicon-purchase-info">
                <h4 class="tupicon-purchase-title">{{ purchase.title }}</h4>
                <div class="tupicon-purchase-author">
                  <i :class="purchase.authorIcon || 'fas fa-user'"></i>
                  <span>{{ purchase.author }}</span>
                </div>
                <p class="tupicon-purchase-desc">{{ purchase.description }}</p>
                <div class="tupicon-purchase-price">{{ purchase.price }}</div>
              </div>
            </div>
          </div>
          
          <div class="tupicon-purchases-summary">
            <div class="tupicon-summary-content">
              <h4>💰 Итого потрачено: <span class="tupicon-total-spent">{{ totalSpent }}</span></h4>
              <p>{{ purchasesSummary }}</p>
            </div>
          </div>
        </div>

        <!-- Impressions Tab -->
        <div v-show="activeTab === 'impressions'" class="tupicon-content-tab">
          <h3 class="tupicon-section-title">💭 Впечатления</h3>
          <div class="tupicon-impressions-content">
            
            <!-- Intro -->
            <div class="tupicon-impression-intro">
              <div class="tupicon-intro-icon">
                <i class="fas fa-heart"></i>
              </div>
              <p>{{ impressionsIntro }}</p>
            </div>

            <!-- My Rating -->
            <div class="tupicon-rating-section">
              <h4 class="tupicon-rating-title">⭐ Моя оценка</h4>
              <div class="tupicon-rating-grid">
                <div v-for="(category, index) in ratingCategories" :key="index" class="tupicon-rating-item">
                  <div class="tupicon-rating-category">{{ category.name }}</div>
                  <div class="tupicon-rating-stars">
                    <i v-for="star in 5" :key="star" class="fas fa-star" :class="{ 'tupicon-active': star <= category.rating }"></i>
                  </div>
                  <div class="tupicon-rating-value">{{ category.rating }}/5</div>
                </div>
              </div>
              <div class="tupicon-rating-overall">
                <span class="tupicon-overall-label">Общая оценка:</span>
                <span class="tupicon-overall-value">{{ overallRating }}/5</span>
              </div>
            </div>

            <!-- My Opinion -->
            <div class="tupicon-critique-section">
              <h4 class="tupicon-critique-title">🤔 Мое мнение</h4>
              <div class="tupicon-likes-dislikes-grid">
                <div class="tupicon-likes-section">
                  <div class="tupicon-section-header tupicon-likes-header">
                    <i class="fas fa-thumbs-up tupicon-thumb-icon"></i>
                    <h5 class="tupicon-section-subtitle">Плюсы</h5>
                  </div>
                  <ul class="tupicon-likes-list">
                    <li v-for="(like, index) in likes" :key="index" class="tupicon-like-item">
                      <div class="tupicon-like-bullet"></div>
                      <span>{{ like }}</span>
                    </li>
                  </ul>
                </div>
                
                <div class="tupicon-dislikes-section">
                  <div class="tupicon-section-header tupicon-dislikes-header">
                    <i class="fas fa-thumbs-down tupicon-tool-icon"></i>
                    <h5 class="tupicon-section-subtitle">Минусы</h5>
                  </div>
                  <ul class="tupicon-dislikes-list">
                    <li v-for="(dislike, index) in dislikes" :key="index" class="tupicon-dislike-item">
                      <div class="tupicon-dislike-bullet"></div>
                      <span>{{ dislike }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Memorable Moments -->
            <div class="tupicon-highlight-moments">
              <div class="tupicon-moments-header">
                <i class="fas fa-fire tupicon-fire-icon"></i>
                <h4 class="tupicon-section-subtitle">🔥 Запоминающиеся моменты</h4>
                <i class="fas fa-fire tupicon-fire-icon"></i>
              </div>
              <div class="tupicon-moments-grid">
                <div v-for="(moment, index) in highlightMoments" :key="index" class="tupicon-moment-card">
                  <div class="tupicon-moment-icon">
                    <i :class="moment.icon"></i>
                  </div>
                  <div class="tupicon-moment-content">
                    <h6 class="tupicon-moment-title">{{ moment.title }}</h6>
                    <p class="tupicon-moment-description">{{ moment.description }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Conclusion -->
            <div class="tupicon-event-conclusion">
              <h4 class="tupicon-conclusion-title">🎯 {{ conclusionTitle }}</h4>
              <p class="tupicon-conclusion-text">{{ conclusion }}</p>
              
              <div v-if="nextEvents.length > 0" class="tupicon-next-events">
                <h5 class="tupicon-next-title">{{ nextEventsTitle }}</h5>
                <div class="tupicon-next-events-list">
                  <a v-for="(nextEvent, index) in nextEvents" :key="index" :href="nextEvent.path" class="tupicon-next-event-link">
                    <i class="fas fa-calendar-alt"></i>
                    <span>{{ nextEvent.title }}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Thank You Footer -->
    <section class="tupicon-thank-you-section">
      <div class="tupicon-container">
        <div class="tupicon-thank-you-card">
          <div class="tupicon-thank-you-glow"></div>
          <div class="tupicon-thank-you-content">
            <h3 class="tupicon-thank-you-title">
              <i class="fas fa-heart tupicon-heart"></i>
              СПАСИБО ЗА КРУТОЙ КОН!
              <i class="fas fa-heart tupicon-heart"></i>
            </h3>
            <p class="tupicon-thank-you-text">
              Это был незабываемый опыт! Организаторы, участники, артисты — вы все молодцы! 
              До встречи на следующих мероприятиях! 🎉
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="tupicon-footer-section">
      <div class="tupicon-container">
        <div class="tupicon-footer-content">
          <div class="tupicon-footer-card">
            <div class="tupicon-footer-glow"></div>
            <h3 class="tupicon-footer-title">🏗️ СТР0ИТЕЛЬНАЯ СТРАНИЦА 🏗️</h3>
            <p class="tupicon-footer-subtitle">СДЕЛАНО С ЛЮБОВЬЮ ДЛЯ СООБЩЕСТВА</p>
          </div>
          <div class="tupicon-footer-copyright">
            <p>&copy; 2025 Мои впечатления о ТУПИКОН (2PCON)</p>
          </div>
        </div>
      </div>
    </footer>

    <!-- Floating Construction Elements -->
    <div class="tupicon-floating-elements">
      <div class="tupicon-floating-icon tupicon-floating-icon-1">
        <i class="fas fa-heart"></i>
      </div>
      <div class="tupicon-floating-icon tupicon-floating-icon-2">
        ⭐ VIP
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TupiconPostEvent',
  data() {
    return {
      // Основные данные мероприятия
      eventName: 'ТУПИКОН (2PCON)',
      eventSubtitle: 'Мои впечатления после посещения этого удивительного конвента',
      eventDescription: 'PCON — это конвент, который организаторы делают так, как нравится им самим. Днём: настолки, мастер-классы, квесты, подвижные игры. Вечером: дискотеки и посиделки у костра. Я побывал там и делюсь своими впечатлениями!',
      eventDate: '4 — 7 сентября 2025',
      eventTime: 'с 13:00',
      eventLocation: 'Калужская область',
      eventAttendees: '140+',
      
      // Баннер мероприятия
      eventBannerImage: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/fursuit1.jpg',
      
      // Статистика мероприятия
      eventStats: [
        { 
          icon: 'fas fa-calendar-alt', 
          label: 'ДАТА ПРОВЕДЕНИЯ', 
          value: '4 — 7 сентября 2025',
          colorClass: 'tupicon-icon-date'
        },
        { 
          icon: 'fas fa-clock', 
          label: 'ВРЕМЯ', 
          value: 'с 13:00',
          colorClass: 'tupicon-icon-time'
        },
        { 
          icon: 'fas fa-map-marker-alt', 
          label: 'МЕСТО ПРОВЕДЕНИЯ', 
          value: 'Калужская область',
          colorClass: 'tupicon-icon-location'
        },
        { 
          icon: 'fas fa-users', 
          label: 'УЧАСТНИКОВ', 
          value: '140+',
          colorClass: 'tupicon-icon-users'
        }
      ],
      
      // Навигационные вкладки
      tabs: [
        { id: 'overview', label: 'Обзор', icon: 'fas fa-info-circle' },
        { id: 'gallery', label: 'Фотографии', icon: 'fas fa-images' },
        { id: 'purchases', label: 'Покупки', icon: 'fas fa-shopping-bag' },
        { id: 'impressions', label: 'Впечатления', icon: 'fas fa-heart' }
      ],
      
      // Официальные ссылки
      officialLinks: [
        {
          url: 'https://vk.com/2pcon',
          icon: 'fab fa-vk',
          text: 'Группа ВКонтакте'
        },
        {
          url: 'https://t.me/2pcon',
          icon: 'fab fa-telegram',
          text: 'Telegram-канал'
        }
      ],
      
      // Особенности мероприятия
      features: [
        {
          title: 'Дневные активности',
          description: 'Настольные игры, мастер-классы, квесты и подвижные игры. Много интересного для всех участников!',
          icon: 'fas fa-gamepad'
        },
        {
          title: 'Вечерние развлечения',
          description: 'Дискотеки и посиделки у костра с живой музыкой. Атмосфера была просто невероятная!',
          icon: 'fas fa-music'
        },
        {
          title: 'Фотозоны',
          description: 'Специальные зоны для фурсьютеров и гостей. Сделал кучу крутых фотографий!',
          icon: 'fas fa-camera'
        }
      ],
      
      // Знакомые на мероприятии
      friends: [
        {
          name: 'Феликс',
          description: 'Встретились впервые! Очень дружелюбный и талантливый художник. Было круто познакомиться!',
          icon: 'fas fa-cat',
          image: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Felix.jpg',
          socialLinks: [
            { url: 'https://instagram.com/felix', icon: 'fab fa-instagram' },
            { url: 'https://t.me/felix', icon: 'fab fa-telegram' }
          ]
        },
        {
          name: 'Алекс',
          description: 'Давний знакомый по другим конам. Отличный собеседник и крафтер, всегда есть о чем поговорить.',
          icon: 'fas fa-wolf',
          image: null,
          socialLinks: [
            { url: 'https://vk.com/alex', icon: 'fab fa-vk' }
          ]
        }
      ],
      
      // Фотографии для галереи
      galleryImages: [
        { src: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/fursuit1.jpg', alt: 'Открытие мероприятия' },
        { src: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/fursuit2.jpg', alt: 'Главная сцена' },
        { src: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/fursuit3.jpg', alt: 'Выступление ведущих' },
        { src: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Felix.jpg', alt: 'С друзьями у входа' },
        { src: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Illustration4_6.jpg', alt: 'Групповое фото' },
        { src: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/reference.png', alt: 'Арт-зона' }
      ],
      
      // Покупки
      purchasesIntro: 'На этом мероприятии я приобрел несколько отличных товаров от талантливых художников и крафтеров. Все покупки оказались качественными и стоящими!',
      purchases: [
        {
          title: 'Значок с моей фурсоной',
          author: 'PinMaster',
          authorIcon: 'fas fa-paint-brush',
          description: 'Красивый металлический значок с изображением моей фурсоны. Отличное качество и детализация!',
          image: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/reference.png',
          price: '800₽'
        },
        {
          title: 'Фурсьют-пропуск',
          author: 'BadgeCraft',
          authorIcon: 'fas fa-id-card',
          description: 'Ламинированный пропуск с красивым дизайном и удобным креплением. Теперь как память о коне!',
          image: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Illustration4_6.jpg',
          price: '500₽'
        }
      ],
      totalSpent: '1300₽',
      purchasesSummary: 'Я остался очень доволен своими покупками. Качество всех приобретений на высоте, а цены были вполне разумными для авторских работ. Поддержал талантливых людей!',
      
      // Впечатления
      impressionsIntro: 'Это мероприятие оставило у меня самые яркие впечатления! Несмотря на некоторые организационные моменты, всё прошло интересно и весело. Вот моя детальная оценка и мнение:',
      
      // Оценки по категориям
      ratingCategories: [
        { name: 'Организация', rating: 4 },
        { name: 'Программа', rating: 5 },
        { name: 'Атмосфера', rating: 5 },
        { name: 'Локация', rating: 3 },
        { name: 'Участники', rating: 5 }
      ],
      
      likes: [
        'Разнообразная и насыщенная программа мероприятий',
        'Дружелюбная атмосфера и отзывчивые организаторы',
        'Интересные мастер-классы и активности для всех',
        'Качественный маркет с разнообразными товарами',
        'Отличное озвучивание и музыкальное сопровождение',
        'Возможность познакомиться с новыми людьми'
      ],
      
      dislikes: [
        'Тесное помещение с недостаточной вентиляцией',
        'Мало сидячих мест для отдыха',
        'Высокие цены на еду и напитки',
        'Не очень удобное расположение относительно транспорта',
        'Некоторые задержки в расписании программы'
      ],
      
      highlightMoments: [
        {
          title: 'Фурсьют-парад',
          description: 'Впечатляющий парад фурсьютеров с музыкальным сопровождением. Особенно запомнился милый протоген со светодиодной маской!',
          icon: 'fas fa-star'
        },
        {
          title: 'Мастер-класс по крафтингу',
          description: 'Научился делать простые ушки и хвост своими руками под руководством опытного мастера. Очень полезно!',
          icon: 'fas fa-hands'
        },
        {
          title: 'Дэнс-батл',
          description: 'Зажигательный танцевальный баттл между фурсьютерами. Получил массу впечатлений и сделал много отличных фото!',
          icon: 'fas fa-music'
        }
      ],
      
      // Заключение
      conclusionTitle: 'Общее впечатление',
      conclusion: 'В целом мероприятие оставило очень приятное впечатление. Несмотря на некоторые организационные недостатки, атмосфера и контент полностью компенсировали их. Обязательно посещу это мероприятие снова в следующем году и буду рекомендовать его друзьям из фурри-сообщества!',
      nextEventsTitle: 'Следующие мероприятия, которые я планирую посетить:',
      nextEvents: [
        { path: '#', title: 'Foxwood: Back to 2000s (15 мая 2025)' },
        { path: '#', title: 'FurMarket Mini (22 июля 2025)' }
      ],
      
      // Активная вкладка
      activeTab: 'overview'
    }
  },
  computed: {
    // Вычисление средней оценки
    overallRating() {
      if (this.ratingCategories.length === 0) return 0;
      
      const sum = this.ratingCategories.reduce((total, category) => total + category.rating, 0);
      const average = sum / this.ratingCategories.length;
      
      return Math.round(average * 10) / 10;
    }
  },
  methods: {
    openImage(photo) {
      // Здесь можно добавить логику для открытия изображения в лайтбоксе
      console.log('Opening image:', photo.alt);
    }
  }
}
</script>

<style scoped>
/* Изоляция всех стилей с префиксом tupicon- */

/* CSS Variables */
.tupicon-wrapper {
  --tupicon-yellow: #facc15;
  --tupicon-yellow-bright: #fde047;
  --tupicon-yellow-dark: #eab308;
  --tupicon-black: #0f0f0f;
  --tupicon-black-light: #1a1a1a;
  --tupicon-black-card: #111827;
  --tupicon-orange: #f97316;
  --tupicon-orange-light: #fb923c;
  --tupicon-red: #ef4444;
  --tupicon-green: #10b981;
  --tupicon-blue: #3b82f6;
  --tupicon-purple: #8b5cf6;
  --tupicon-text-light: #f9fafb;
  --tupicon-text-muted: #9ca3af;
  --tupicon-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  --tupicon-shadow-hover: 0 15px 35px rgba(0, 0, 0, 0.4);
}
/* Floating Elements */
.tupicon-floating-elements {
  position: fixed;
  pointer-events: none;
  z-index: 50;
}

.tupicon-floating-icon {
  position: fixed;
  background: linear-gradient(135deg, var(--tupicon-yellow), var(--tupicon-orange));
  color: var(--tupicon-black);
  padding: 1.2rem;
  border-radius: 50%;
  font-weight: 800;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(250, 204, 21, 0.3);
  border: 3px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.tupicon-floating-icon::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.3), transparent, rgba(255, 255, 255, 0.1));
  z-index: -1;
}

.tupicon-floating-icon-1 {
  bottom: 2rem;
  right: 2rem;
  font-size: 1.3rem;
  animation: tupicon-float-bounce 3s ease-in-out infinite;
}

.tupicon-floating-icon-2 {
  top: 140px;
  right: 2rem;
  transform: rotate(12deg);
  font-size: 0.85rem;
  border-radius: 0.8rem;
  padding: 1rem 1.2rem;
  display: none;
  animation: tupicon-float-sway 4s ease-in-out infinite;
}

@keyframes tupicon-float-bounce {
  0%, 100% { 
    transform: translateY(0) scale(1); 
    box-shadow: 
      0 10px 30px rgba(0, 0, 0, 0.4),
      0 0 20px rgba(250, 204, 21, 0.3);
  }
  50% { 
    transform: translateY(-20px) scale(1.05); 
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.3),
      0 0 30px rgba(250, 204, 21, 0.5);
  }
}

@keyframes tupicon-float-sway {
  0%, 100% { 
    transform: translateX(0) rotate(12deg); 
  }
  50% { 
    transform: translateX(15px) rotate(-8deg); 
  }
}

/* Add some decorative elements */
.tupicon-wrapper::after {
  content: '';
  position: fixed;
  top: 50%;
  left: -10px;
  width: 20px;
  height: 100px;
  background: 0 0 20px rgba(250, 204, 21, 0.4);
  --tupicon-glow-orange: 0 0 20px rgba(249, 115, 22, 0.4);
}

/* Base Styles */
.tupicon-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--tupicon-black) 0%, #0a0a0a 50%, var(--tupicon-black-light) 100%);
  color: var(--tupicon-text-light);
  position: relative;
  overflow-x: hidden;
  font-family: 'Arial', 'Helvetica', sans-serif;
  line-height: 1.6;
}

.tupicon-wrapper::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 20%, rgba(250, 204, 21, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(249, 115, 22, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.02) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
}

.tupicon-wrapper * {
  box-sizing: border-box;
}

/* Warning Tape */
.tupicon-warning-tape {
  position: fixed;
  width: 100%;
  height: 20px;
  z-index: 1000;
  background: var(--tupicon-yellow);
  box-shadow: 
    0 2px 10px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.tupicon-warning-tape::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    -45deg,
    var(--tupicon-black) 0px,
    var(--tupicon-black) 15px,
    transparent 15px,
    transparent 30px
  );
  animation: tupicon-tape-pattern 8s linear infinite;
}

.tupicon-warning-tape::after {
  content: '⚠️ ВНИМАНИЕ: СТРОИТЕЛЬНАЯ ЗОНА ⚠️ ВНИМАНИЕ: СТРОИТЕЛЬНАЯ ЗОНА ⚠️ ВНИМАНИЕ: СТРОИТЕЛЬНАЯ ЗОНА ⚠️';
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  width: 200%;
  font-size: 12px;
  font-weight: 900;
  color: var(--tupicon-black);
  text-transform: uppercase;
  letter-spacing: 2px;
  white-space: nowrap;
  animation: tupicon-tape-text 15s linear infinite;
}

.tupicon-warning-tape-top {
  top: 0;
}

.tupicon-warning-tape-bottom {
  bottom: 0;
}

.tupicon-warning-tape-bottom::after {
  content: '🚧 ЗОНА РЕМОНТА 🚧 ЗОНА РЕМОНТА 🚧 ЗОНА РЕМОНТА 🚧 ЗОНА РЕМОНТА 🚧 ЗОНА РЕМОНТА 🚧';
  animation: tupicon-tape-text 12s linear infinite reverse;
}

@keyframes tupicon-tape-pattern {
  0% { transform: translateX(0); }
  100% { transform: translateX(30px); }
}

@keyframes tupicon-tape-text {
  0% { transform: translateY(-50%) translateX(0); }
  100% { transform: translateY(-50%) translateX(-50%); }
}

/* Container */
.tupicon-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
}

.tupicon-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    linear-gradient(90deg, transparent 0%, rgba(250, 204, 21, 0.01) 50%, transparent 100%);
  pointer-events: none;
  z-index: -1;
}

/* Hero Section */
.tupicon-hero-section {
  position: relative;
  height: 500px;
  overflow: hidden;
  margin-bottom: 3rem;
  margin-top: 25px;
  border-radius: 0 0 2rem 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.tupicon-hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(15, 15, 15, 0.1) 30%,
    rgba(0, 0, 0, 0.4) 70%,
    rgba(0, 0, 0, 0.8) 100%
  );
  z-index: 1;
}

.tupicon-hero-overlay::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    linear-gradient(45deg, transparent 40%, rgba(250, 204, 21, 0.1) 50%, transparent 60%),
    linear-gradient(-45deg, transparent 40%, rgba(249, 115, 22, 0.1) 50%, transparent 60%);
  animation: tupicon-hero-shine 8s ease-in-out infinite;
}

@keyframes tupicon-hero-shine {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

.tupicon-hero-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: blur(2px) brightness(0.9) contrast(1.1);
  transform: scale(1.1);
  transition: transform 20s ease-in-out;
}

.tupicon-hero-image:hover {
  transform: scale(1.15);
}

.tupicon-hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.tupicon-back-button {
  position: absolute;
  top: 2rem;
  left: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 2rem;
  text-decoration: none;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  font-weight: 600;
}

.tupicon-back-button:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateX(-5px);
}

.tupicon-event-badges {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.tupicon-event-status {
  background: rgba(76, 175, 80, 0.9);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 2rem;
  font-size: 0.9rem;
  font-weight: 600;
  backdrop-filter: blur(5px);
}

.tupicon-event-badge {
  background: rgba(255, 215, 0, 0.9);
  color: var(--tupicon-black);
  padding: 0.4rem 0.8rem;
  border-radius: 2rem;
  font-size: 0.9rem;
  font-weight: 800;
  backdrop-filter: blur(5px);
}

.tupicon-event-title {
  font-size: 3rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.tupicon-event-subtitle {
  font-size: 1.5rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
}

/* Event Stats */
.tupicon-event-stats {
  padding: 3rem 0;
  position: relative;
}

.tupicon-event-stats::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--tupicon-yellow), transparent);
  opacity: 0.3;
}

.tupicon-event-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.tupicon-event-info-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
  padding: 2rem 1.5rem;
  border-radius: 1rem;
  transition: all 0.4s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.tupicon-event-info-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.6s ease;
}

.tupicon-event-info-card:hover::before {
  left: 100%;
}

.tupicon-event-info-card:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06));
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(250, 204, 21, 0.2);
  border-color: rgba(250, 204, 21, 0.3);
}

.tupicon-info-icon {
  width: 65px;
  height: 65px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1.4rem;
  color: white;
  flex-shrink: 0;
  position: relative;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.tupicon-info-icon::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.2), transparent);
}

.tupicon-icon-date {
  background: linear-gradient(135deg, #f59e0b, #f97316);
  box-shadow: 0 8px 16px rgba(245, 158, 11, 0.4);
}

.tupicon-icon-time {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.4);
}

.tupicon-icon-location {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 8px 16px rgba(239, 68, 68, 0.4);
}

.tupicon-icon-users {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.4);
}

.tupicon-info-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.tupicon-info-label {
  font-size: 0.85rem;
  color: var(--tupicon-text-muted);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.tupicon-info-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--tupicon-text-light);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Navigation */
.tupicon-navigation-section {
  margin-bottom: 3rem;
  position: relative;
}

.tupicon-navigation-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    linear-gradient(45deg, transparent 49%, rgba(250, 204, 21, 0.05) 50%, transparent 51%),
    linear-gradient(-45deg, transparent 49%, rgba(249, 115, 22, 0.05) 50%, transparent 51%);
  pointer-events: none;
  z-index: -1;
}

.tupicon-nav-tabs {
  display: flex;
  gap: 1.5rem;
  border-bottom: 2px solid rgba(250, 204, 21, 0.2);
  padding-bottom: 1.5rem;
  overflow-x: auto;
  position: relative;
}

.tupicon-nav-tabs::before {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--tupicon-yellow), transparent);
  animation: tupicon-nav-glow 3s ease-in-out infinite;
}

@keyframes tupicon-nav-glow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

.tupicon-nav-tab {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem 1.8rem;
  border-radius: 0.8rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--tupicon-text-muted);
  transition: all 0.4s ease;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.tupicon-nav-tab::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.6s ease;
}

.tupicon-nav-tab:hover::before {
  left: 100%;
}

.tupicon-nav-tab:hover:not(.tupicon-active) {
  color: var(--tupicon-text-light);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.tupicon-nav-tab.tupicon-active {
  background: linear-gradient(135deg, var(--tupicon-yellow), var(--tupicon-orange));
  color: var(--tupicon-black);
  transform: translateY(-5px);
  box-shadow: 
    0 10px 25px rgba(250, 204, 21, 0.4),
    0 0 30px rgba(250, 204, 21, 0.3);
  border-color: var(--tupicon-yellow);
}

.tupicon-nav-tab.tupicon-active::after {
  content: '';
  position: absolute;
  bottom: -1.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid var(--tupicon-yellow);
}

.tupicon-tab-icon {
  font-size: 1.1rem;
  transition: transform 0.3s ease;
}

.tupicon-nav-tab:hover .tupicon-tab-icon {
  transform: scale(1.1);
}

.tupicon-tab-text {
  font-size: 0.95rem;
}

/* Content Section */
.tupicon-content-section {
  padding: 3rem 0 5rem 0;
  position: relative;
}

.tupicon-content-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 10% 20%, rgba(250, 204, 21, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 90% 80%, rgba(249, 115, 22, 0.03) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
}

.tupicon-content-tab {
  animation: tupicon-fade-in 0.8s ease;
}

@keyframes tupicon-fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.tupicon-section-title {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  font-weight: 800;
  color: var(--tupicon-text-light);
  position: relative;
  display: inline-block;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.tupicon-section-title::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent, rgba(250, 204, 21, 0.1), transparent);
  z-index: -1;
  transform: skewX(-15deg);
  border-radius: 0.5rem;
}

.tupicon-section-title::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 0;
  width: 80px;
  height: 6px;
  background: linear-gradient(90deg, var(--tupicon-yellow), var(--tupicon-orange));
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(250, 204, 21, 0.5);
}

/* Content Main */
.tupicon-content-main {
  font-size: 1.05rem;
  line-height: 1.7;
}

.tupicon-event-description {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 0.8rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid var(--tupicon-yellow);
}

.tupicon-description-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--tupicon-yellow), var(--tupicon-orange));
  border-radius: 50%;
  font-size: 1.2rem;
  color: var(--tupicon-black);
  flex-shrink: 0;
}

.tupicon-description-content {
  flex: 1;
}

/* Official Links */
.tupicon-official-links {
  margin-bottom: 1.5rem;
}

.tupicon-links-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: var(--tupicon-text-light);
}

.tupicon-links-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.tupicon-event-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.8rem;
  text-decoration: none;
  color: var(--tupicon-text-light);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tupicon-event-link:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-3px);
  box-shadow: var(--tupicon-shadow);
}

.tupicon-event-link i {
  font-size: 1.2rem;
  color: #4C75A3;
}

/* Features Section */
.tupicon-features-section {
  margin: 2rem 0;
}

.tupicon-features-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
  color: var(--tupicon-text-light);
}

.tupicon-features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.tupicon-feature-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.03);
  padding: 1.2rem;
  border-radius: 0.8rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.tupicon-feature-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-5px);
  box-shadow: var(--tupicon-shadow);
}

.tupicon-feature-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--tupicon-yellow), var(--tupicon-orange));
  border-radius: 50%;
  font-size: 1.2rem;
  color: var(--tupicon-black);
  flex-shrink: 0;
}

.tupicon-feature-content h5 {
  font-size: 1.1rem;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: var(--tupicon-text-light);
}

.tupicon-feature-content p {
  font-size: 0.95rem;
  color: var(--tupicon-text-muted);
  margin: 0;
  line-height: 1.5;
}

/* Friends Section */
.tupicon-friends-section {
  margin: 2.5rem 0;
}

.tupicon-friends-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
  color: var(--tupicon-text-light);
}

.tupicon-friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.tupicon-friend-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.8rem;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.tupicon-friend-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--tupicon-shadow);
  background: rgba(255, 255, 255, 0.08);
}

.tupicon-friend-image {
  height: 150px;
  overflow: hidden;
}

.tupicon-friend-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.tupicon-friend-card:hover .tupicon-friend-img img {
  transform: scale(1.05);
}

.tupicon-friend-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 123, 37, 0.3), rgba(76, 175, 80, 0.3));
  font-size: 3rem;
  color: rgba(255, 255, 255, 0.7);
}

.tupicon-friend-info {
  padding: 1rem;
}

.tupicon-friend-name {
  font-size: 1.1rem;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: var(--tupicon-text-light);
}

.tupicon-friend-desc {
  font-size: 0.9rem;
  color: var(--tupicon-text-muted);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.tupicon-friend-social {
  display: flex;
  gap: 0.5rem;
}

.tupicon-social-link {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: var(--tupicon-text-light);
  font-size: 1rem;
  transition: all 0.3s ease;
  text-decoration: none;
}

.tupicon-social-link:hover {
  transform: translateY(-3px);
  background: linear-gradient(135deg, var(--tupicon-yellow), var(--tupicon-orange));
  color: var(--tupicon-black);
}

/* Gallery */
.tupicon-gallery-intro {
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 0.8rem;
  margin-bottom: 2rem;
  border-left: 4px solid var(--tupicon-yellow);
}

.tupicon-gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.tupicon-gallery-item {
  position: relative;
  border-radius: 0.8rem;
  overflow: hidden;
  box-shadow: var(--tupicon-shadow);
  aspect-ratio: 1 / 1;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tupicon-gallery-item:hover {
  transform: translateY(-5px);
  box-shadow: var(--tupicon-shadow-hover);
}

.tupicon-gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.tupicon-gallery-item:hover img {
  transform: scale(1.05);
}

.tupicon-gallery-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tupicon-gallery-item:hover .tupicon-gallery-overlay {
  opacity: 1;
}

.tupicon-gallery-actions {
  display: flex;
  gap: 1rem;
}

.tupicon-gallery-btn {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tupicon-gallery-btn:hover {
  background: linear-gradient(135deg, var(--tupicon-yellow), var(--tupicon-orange));
  color: var(--tupicon-black);
  transform: scale(1.1);
}

/* Purchases */
.tupicon-purchases-intro {
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 0.8rem;
  margin-bottom: 2rem;
  border-left: 4px solid var(--tupicon-yellow);
}

.tupicon-purchases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.tupicon-purchase-card {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.8rem;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
  height: 100%;
}

.tupicon-purchase-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--tupicon-shadow);
  background: rgba(255, 255, 255, 0.08);
}

.tupicon-purchase-image {
  height: 200px;
  overflow: hidden;
}

.tupicon-purchase-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.tupicon-purchase-card:hover .tupicon-purchase-image img {
  transform: scale(1.05);
}

.tupicon-purchase-info {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.tupicon-purchase-title {
  font-size: 1.3rem;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
  color: var(--tupicon-text-light);
}

.tupicon-purchase-author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: var(--tupicon-text-muted);
}

.tupicon-purchase-author i {
  color: var(--tupicon-yellow);
}

.tupicon-purchase-desc {
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  flex-grow: 1;
  color: var(--tupicon-text-light);
}

.tupicon-purchase-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--tupicon-green);
  align-self: flex-end;
}

.tupicon-purchases-summary {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.8rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.tupicon-summary-content h4 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--tupicon-text-light);
}

.tupicon-total-spent {
  color: var(--tupicon-green);
  font-weight: 700;
}

.tupicon-summary-content p {
  color: var(--tupicon-text-light);
  line-height: 1.6;
}

/* Impressions */
.tupicon-impressions-content {
  background: rgba(255, 255, 255, 0.03);
  border-left: 4px solid var(--tupicon-yellow);
  padding: 2rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.tupicon-impression-intro {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.8rem;
  border-left: 4px solid var(--tupicon-yellow);
}

.tupicon-intro-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--tupicon-yellow), var(--tupicon-orange));
  border-radius: 50%;
  font-size: 1.2rem;
  color: var(--tupicon-black);
  flex-shrink: 0;
}

.tupicon-impression-intro p {
  font-size: 1.1rem;
  line-height: 1.7;
  margin: 0;
  color: var(--tupicon-text-light);
}

/* Rating Section */
.tupicon-rating-section {
  margin-bottom: 2.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.8rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.tupicon-rating-title {
  font-size: 1.3rem;
  margin-bottom: 1.2rem;
  font-weight: 600;
  color: var(--tupicon-text-light);
}

.tupicon-rating-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.tupicon-rating-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.tupicon-rating-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-3px);
}

.tupicon-rating-category {
  font-size: 0.9rem;
  color: var(--tupicon-text-muted);
  margin-bottom: 0.5rem;
}

.tupicon-rating-stars {
  display: flex;
  justify-content: center;
  gap: 0.3rem;
  margin-bottom: 0.5rem;
}

.tupicon-rating-stars i {
  color: rgba(255, 255, 255, 0.2);
  font-size: 1.2rem;
}

.tupicon-rating-stars i.tupicon-active {
  color: #FFD700;
}

.tupicon-rating-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--tupicon-yellow);
}

.tupicon-rating-overall {
  text-align: right;
  font-size: 1.2rem;
  font-weight: 600;
}

.tupicon-overall-label {
  color: var(--tupicon-text-muted);
  margin-right: 0.5rem;
}

.tupicon-overall-value {
  color: var(--tupicon-yellow);
  font-weight: 700;
  font-size: 1.3rem;
}

/* Critique Section */
.tupicon-critique-section {
  margin-bottom: 2.5rem;
}

.tupicon-critique-title {
  font-size: 1.3rem;
  margin-bottom: 1.2rem;
  font-weight: 600;
  color: var(--tupicon-text-light);
}

.tupicon-likes-dislikes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.tupicon-likes-section,
.tupicon-dislikes-section {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.8rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.tupicon-section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tupicon-likes-header .tupicon-thumb-icon {
  color: var(--tupicon-green);
}

.tupicon-dislikes-header .tupicon-tool-icon {
  color: var(--tupicon-red);
}

.tupicon-section-subtitle {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--tupicon-text-light);
  margin: 0;
}

.tupicon-likes-list,
.tupicon-dislikes-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tupicon-like-item,
.tupicon-dislike-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.7rem;
  color: var(--tupicon-text-light);
  line-height: 1.5;
  font-size: 0.95rem;
}

.tupicon-like-bullet {
  width: 8px;
  height: 8px;
  background: var(--tupicon-green);
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 0.4rem;
}

.tupicon-dislike-bullet {
  width: 8px;
  height: 8px;
  background: var(--tupicon-red);
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 0.4rem;
}

/* Highlight Moments */
.tupicon-highlight-moments {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.8rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 2rem;
}

.tupicon-moments-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.tupicon-fire-icon {
  color: var(--tupicon-orange);
  animation: tupicon-fire-flicker 1s ease-in-out infinite alternate;
}

@keyframes tupicon-fire-flicker {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0.8; transform: scale(1.05); }
}

.tupicon-moments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.tupicon-moment-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.03);
  padding: 1.5rem;
  border-radius: 0.8rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.tupicon-moment-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-5px);
  box-shadow: var(--tupicon-shadow);
}

.tupicon-moment-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--tupicon-yellow), var(--tupicon-orange));
  border-radius: 50%;
  font-size: 1.2rem;
  color: var(--tupicon-black);
  flex-shrink: 0;
}

.tupicon-moment-title {
  font-size: 1.1rem;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: var(--tupicon-text-light);
}

.tupicon-moment-description {
  font-size: 0.95rem;
  color: var(--tupicon-text-light);
  margin: 0;
  line-height: 1.6;
}

/* Event Conclusion */
.tupicon-event-conclusion {
  margin-top: 2.5rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.tupicon-conclusion-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: var(--tupicon-text-light);
}

.tupicon-conclusion-text {
  font-size: 1.05rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  color: var(--tupicon-text-light);
}

.tupicon-next-events h5 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: var(--tupicon-text-light);
}

.tupicon-next-events-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.tupicon-next-event-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2rem;
  text-decoration: none;
  color: var(--tupicon-text-light);
  transition: all 0.3s ease;
  font-weight: 500;
}

.tupicon-next-event-link:hover {
  background: linear-gradient(45deg, var(--tupicon-yellow), var(--tupicon-orange));
  color: var(--tupicon-black);
  transform: translateY(-3px);
  box-shadow: var(--tupicon-glow-yellow);
}

.tupicon-next-event-link i {
  color: var(--tupicon-yellow);
}

.tupicon-next-event-link:hover i {
  color: var(--tupicon-black);
}

/* Thank You Section */
.tupicon-thank-you-section {
  padding: 3rem 0;
}

.tupicon-thank-you-card {
  position: relative;
  background: linear-gradient(135deg, var(--tupicon-yellow), var(--tupicon-orange));
  color: var(--tupicon-black);
  padding: 2rem;
  border-radius: 1rem;
  transform: rotate(-1deg);
  box-shadow: var(--tupicon-shadow);
  overflow: hidden;
  border: 3px solid var(--tupicon-yellow-dark);
}

.tupicon-thank-you-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: tupicon-rotate 10s linear infinite;
}

@keyframes tupicon-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.tupicon-thank-you-title {
  font-size: 1.8rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  text-transform: uppercase;
  position: relative;
  z-index: 1;
}

.tupicon-heart {
  color: var(--tupicon-red);
  filter: brightness(0.8);
  animation: tupicon-heart-beat 1.5s ease-in-out infinite;
}

@keyframes tupicon-heart-beat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.tupicon-thank-you-text {
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
  line-height: 1.6;
  position: relative;
  z-index: 1;
}

/* Footer */
.tupicon-footer-section {
  padding: 3rem 0 2rem 0;
  margin-bottom: 20px;
}

.tupicon-footer-content {
  text-align: center;
}

.tupicon-footer-card {
  position: relative;
  background: linear-gradient(135deg, var(--tupicon-yellow), var(--tupicon-orange));
  color: var(--tupicon-black);
  padding: 2rem;
  border-radius: 1rem;
  transform: rotate(-1deg);
  margin-bottom: 2rem;
  display: inline-block;
  box-shadow: var(--tupicon-shadow);
  overflow: hidden;
  border: 3px solid var(--tupicon-yellow-dark);
}

.tupicon-footer-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: tupicon-rotate 15s linear infinite;
}

.tupicon-footer-title {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  position: relative;
  z-index: 1;
}

.tupicon-footer-subtitle {
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
  position: relative;
  z-index: 1;
}

.tupicon-footer-copyright {
  color: var(--tupicon-text-muted);
}

/* Floating Elements */
.tupicon-floating-elements {
  position: fixed;
  pointer-events: none;
  z-index: 50;
}

.tupicon-floating-icon {
  position: fixed;
  background: linear-gradient(135deg, var(--tupicon-yellow), var(--tupicon-orange));
  color: var(--tupicon-black);
  padding: 1.2rem;
  border-radius: 50%;
  font-weight: 800;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(250, 204, 21, 0.3);
  border: 3px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.tupicon-floating-icon::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.3), transparent, rgba(255, 255, 255, 0.1));
  z-index: -1;
}

.tupicon-floating-icon-1 {
  bottom: 2rem;
  right: 2rem;
  font-size: 1.3rem;
  animation: tupicon-float-bounce 3s ease-in-out infinite;
}

.tupicon-floating-icon-2 {
  top: 140px;
  right: 2rem;
  transform: rotate(12deg);
  font-size: 0.85rem;
  border-radius: 0.8rem;
  padding: 1rem 1.2rem;
  display: none;
  animation: tupicon-float-sway 4s ease-in-out infinite;
}

@keyframes tupicon-float-bounce {
  0%, 100% { 
    transform: translateY(0) scale(1); 
    box-shadow: 
      0 10px 30px rgba(0, 0, 0, 0.4),
      0 0 20px rgba(250, 204, 21, 0.3);
  }
  50% { 
    transform: translateY(-20px) scale(1.05); 
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.3),
      0 0 30px rgba(250, 204, 21, 0.5);
  }
}

@keyframes tupicon-float-sway {
  0%, 100% { 
    transform: translateX(0) rotate(12deg); 
  }
  50% { 
    transform: translateX(15px) rotate(-8deg); 
  }
}

/* Decorative corner elements */
.tupicon-wrapper::after {
  content: '';
  position: fixed;
  top: 50%;
  left: -10px;
  width: 20px;
  height: 100px;
  background: linear-gradient(to right, transparent, rgba(250, 204, 21, 0.1));
  transform: translateY(-50%) rotate(45deg);
  z-index: 1;
}

/* Add construction grid pattern */
.tupicon-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(250, 204, 21, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(250, 204, 21, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: -1;
  opacity: 0.5;
}

/* Enhanced card styles */
.tupicon-feature-card,
.tupicon-friend-card,
.tupicon-purchase-card,
.tupicon-moment-card {
  position: relative;
  overflow: hidden;
}

.tupicon-feature-card::before,
.tupicon-friend-card::before,
.tupicon-purchase-card::before,
.tupicon-moment-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 30px;
  height: 30px;
  background: linear-gradient(-45deg, var(--tupicon-yellow), transparent);
  transform: rotate(45deg) translate(15px, -15px);
  opacity: 0.3;
}

/* Enhanced gallery items */
.tupicon-gallery-item::after {
  content: '';
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, var(--tupicon-yellow), var(--tupicon-orange));
  border-radius: 50%;
  opacity: 0.8;
  transform: scale(0);
  transition: transform 0.3s ease;
}

.tupicon-gallery-item:hover::after {
  transform: scale(1);
}

/* Improved section dividers */
.tupicon-event-stats::after,
.tupicon-content-section::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--tupicon-yellow), transparent);
  opacity: 0.4;
}

/* Enhanced button styles */
.tupicon-gallery-btn,
.tupicon-next-event-link {
  position: relative;
  overflow: hidden;
}

.tupicon-gallery-btn::before,
.tupicon-next-event-link::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s ease, height 0.6s ease;
}

.tupicon-gallery-btn:hover::before,
.tupicon-next-event-link:hover::before {
  width: 200px;
  height: 200px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .tupicon-floating-icon-2 {
    display: block;
  }
}

@media (max-width: 768px) {
  .tupicon-container {
    padding: 0 1rem;
  }
  
  .tupicon-hero-section {
    height: 300px;
  }
  
  .tupicon-event-title {
    font-size: 2rem;
  }
  
  .tupicon-back-button {
    top: 1rem;
    left: 1rem;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
  
  .tupicon-event-info-grid {
    grid-template-columns: 1fr;
  }
  
  .tupicon-nav-tabs {
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
  
  .tupicon-nav-tab {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
  
  .tupicon-section-title {
    font-size: 1.8rem;
  }
  
  .tupicon-features-grid,
  .tupicon-friends-grid,
  .tupicon-moments-grid {
    grid-template-columns: 1fr;
  }
  
  .tupicon-gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  .tupicon-purchases-grid {
    grid-template-columns: 1fr;
  }
  
  .tupicon-likes-dislikes-grid {
    grid-template-columns: 1fr;
  }
  
  .tupicon-rating-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .tupicon-thank-you-title {
    font-size: 1.5rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .tupicon-event-description,
  .tupicon-impression-intro {
    flex-direction: column;
    text-align: center;
  }
  
  .tupicon-floating-icon-2 {
    display: none;
  }
}

@media (max-width: 480px) {
  .tupicon-hero-section {
    height: 250px;
  }
  
  .tupicon-event-title {
    font-size: 1.6rem;
  }
  
  .tupicon-event-subtitle {
    font-size: 1rem;
  }
  
  .tupicon-section-title {
    font-size: 1.6rem;
  }
  
  .tupicon-gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .tupicon-floating-icon-1 {
    bottom: 1rem;
    right: 1rem;
    padding: 0.8rem;
    font-size: 1rem;
  }
  
  .tupicon-impressions-content,
  .tupicon-thank-you-card,
  .tupicon-event-conclusion {
    padding: 1.5rem;
  }
  
  .tupicon-rating-grid {
    grid-template-columns: 1fr;
  }
}

/* High contrast and accessibility */
@media (prefers-contrast: high) {
  .tupicon-wrapper {
    --tupicon-yellow: #ffff00;
    --tupicon-black: #000000;
    --tupicon-text-light: #ffffff;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tupicon-wrapper *,
  .tupicon-wrapper *::before,
  .tupicon-wrapper *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

</style>