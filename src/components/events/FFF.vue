<template>
    <div class="event-details-page">
      <!-- Героическая секция с баннером -->
      <div class="event-hero">
        <div class="hero-overlay"></div>
        <div class="hero-image" :style="{ backgroundImage: `url('${eventBannerImage}')` }"></div>
        <div class="hero-content">
          <router-link to="/" class="back-button">
            <i class="fas fa-arrow-left"></i>
            <span>Назад на главную</span>
          </router-link>
          <div class="event-badges">
            <span class="event-status visited">Посетил</span>
            <span v-if="eventBadge" class="event-badge" :class="eventBadgeClass">{{ eventBadgeText }}</span>
          </div>
          <h1 class="event-title">{{ eventName }}</h1>
          <div class="event-subtitle">{{ eventSubtitle }}</div>
        </div>
      </div>
      
      <div class="container">
        <!-- Краткая информация о мероприятии -->
        <div class="event-info-grid">
          <div class="event-info-card">
            <div class="info-icon"><i class="fas fa-calendar-alt"></i></div>
            <div class="info-content">
              <div class="info-label">Дата проведения</div>
              <div class="info-value">{{ eventDate }}</div>
            </div>
          </div>
          
          <div class="event-info-card">
            <div class="info-icon"><i class="fas fa-clock"></i></div>
            <div class="info-content">
              <div class="info-label">Время</div>
              <div class="info-value">{{ eventTime }}</div>
            </div>
          </div>
          
          <div class="event-info-card">
            <div class="info-icon"><i class="fas fa-map-marker-alt"></i></div>
            <div class="info-content">
              <div class="info-label">Место проведения</div>
              <div class="info-value">{{ eventLocation }}</div>
            </div>
          </div>
          
          <div class="event-info-card">
            <div class="info-icon"><i class="fas fa-users"></i></div>
            <div class="info-content">
              <div class="info-label">Участников</div>
              <div class="info-value">{{ eventAttendees }}</div>
            </div>
          </div>
        </div>
        
        <!-- Вкладки для навигации по секциям мероприятия -->
        <div class="event-navigation">
          <div class="nav-tabs">
            <a href="#overview" class="nav-tab" :class="{ 'active': activeTab === 'overview' }" @click.prevent="activeTab = 'overview'">
              <i class="fas fa-info-circle"></i>
              <span>Обзор</span>
            </a>
            
            <a href="#gallery" class="nav-tab" :class="{ 'active': activeTab === 'gallery' }" @click.prevent="activeTab = 'gallery'">
              <i class="fas fa-images"></i>
              <span>Фотографии</span>
            </a>
            
            <a v-if="hasPurchases" href="#purchases" class="nav-tab" :class="{ 'active': activeTab === 'purchases' }" @click.prevent="activeTab = 'purchases'">
              <i class="fas fa-shopping-bag"></i>
              <span>Покупки</span>
            </a>
            
            <a href="#impressions" class="nav-tab" :class="{ 'active': activeTab === 'impressions' }" @click.prevent="activeTab = 'impressions'">
              <i class="fas fa-heart"></i>
              <span>Впечатления</span>
            </a>
          </div>
        </div>
        
        <!-- Контент для вкладок -->
        <div class="event-content-container">
          <!-- Обзор -->
          <div class="event-section" id="overview" v-show="activeTab === 'overview'">
            <h2 class="section-title">О мероприятии</h2>
            <div class="section-content">
              <p class="event-description">{{ eventDescription }}</p>
              
              <!-- Официальные ресурсы -->
              <div v-if="officialLinks.length > 0" class="event-links">
                <h3 class="links-title">Официальные ресурсы:</h3>
                <div class="links-container">
                  <a v-for="(link, index) in officialLinks" :key="index" :href="link.url" target="_blank" class="event-link">
                    <i :class="link.icon"></i>
                    <span>{{ link.text }}</span>
                  </a>
                </div>
              </div>
              
              <!-- Особенности мероприятия -->
              <div class="features-container">
                <h3 class="features-title">{{ featuresTitle }}</h3>
                <div class="features-grid">
                  <div v-for="(feature, index) in features" :key="index" class="feature-card">
                    <div class="feature-icon">
                      <i :class="feature.icon"></i>
                    </div>
                    <div class="feature-content">
                      <h4>{{ feature.title }}</h4>
                      <p>{{ feature.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Знакомые на мероприятии -->
              <div v-if="friends.length > 0" class="friends-container">
                <h3 class="friends-title">{{ friendsTitle }}</h3>
                <div class="friends-grid">
                  <div v-for="(friend, index) in friends" :key="index" class="friend-card">
                    <div class="friend-image">
                      <div v-if="friend.image" class="friend-img">
                        <img :src="friend.image" :alt="friend.name">
                      </div>
                      <div v-else class="friend-placeholder">
                        <i :class="friend.icon || 'fas fa-paw'"></i>
                      </div>
                    </div>
                    <div class="friend-info">
                      <h4>{{ friend.name }}</h4>
                      <p>{{ friend.description }}</p>
                      <div v-if="friend.socialLinks" class="friend-social">
                        <a v-for="(social, idx) in friend.socialLinks" :key="idx" :href="social.url" class="social-link" target="_blank">
                          <i :class="social.icon"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Галерея -->
          <div class="event-section" id="gallery" v-show="activeTab === 'gallery'">
            <h2 class="section-title">Фотографии</h2>
            <div class="gallery-grid">
              <div v-for="(photo, index) in galleryImages" :key="index" class="gallery-item">
                <img :src="photo.src" :alt="photo.alt || `Фото ${index + 1}`">
              </div>
            </div>
          </div>
          
          <!-- Покупки (если были) -->
          <div v-if="hasPurchases" class="event-section" id="purchases" v-show="activeTab === 'purchases'">
            <h2 class="section-title">Мои покупки</h2>
            <div class="purchases-content">
              <p class="purchases-intro">{{ purchasesIntro }}</p>
              
              <div class="purchases-grid">
                <div v-for="(purchase, index) in purchases" :key="index" class="purchase-card">
                  <div class="purchase-image">
                    <img :src="purchase.image" :alt="purchase.title">
                  </div>
                  <div class="purchase-info">
                    <h3 class="purchase-title">{{ purchase.title }}</h3>
                    <div class="purchase-author">
                      <i :class="purchase.authorIcon || 'fas fa-user'"></i>
                      <span>{{ purchase.author }}</span>
                    </div>
                    <p class="purchase-desc">{{ purchase.description }}</p>
                    <div class="purchase-price">{{ purchase.price }}</div>
                  </div>
                </div>
              </div>
              
              <div v-if="purchasesSummary" class="purchases-summary">
                <div class="summary-content">
                  <h3>Итого потрачено: <span class="total-spent">{{ totalSpent }}</span></h3>
                  <p>{{ purchasesSummary }}</p>
                </div>
                <div v-if="nextEvent" class="next-market">
                  <div class="next-event-info">
                    <i class="fas fa-calendar-alt"></i>
                    <div class="next-event-details">
                      <h4>{{ nextEvent.title }}</h4>
                      <p>{{ nextEvent.timeplace }}</p>
                    </div>
                  </div>
                  <div class="next-event-reminder">
                    <button class="reminder-btn" @click="setReminder">
                      <i class="fas fa-bell"></i>
                      <span>Напомнить</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Впечатления -->
          <div class="event-section" id="impressions" v-show="activeTab === 'impressions'">
            <h2 class="section-title">Впечатления</h2>
            <div class="impressions-content">
              <p class="impression-intro">{{ impressionsIntro }}</p>
              
              <!-- Моя оценка -->
              <div class="rating-section">
                <h3 class="rating-title">Моя оценка</h3>
                <div class="rating-grid">
                  <div v-for="(category, index) in ratingCategories" :key="index" class="rating-item">
                    <div class="rating-category">{{ category.name }}</div>
                    <div class="rating-stars">
                      <i v-for="star in 5" :key="star" class="fas fa-star" :class="{ 'active': star <= category.rating }"></i>
                    </div>
                    <div class="rating-value">{{ category.rating }}/5</div>
                  </div>
                </div>
                <div class="rating-overall">
                  <span class="overall-label">Общая оценка:</span>
                  <span class="overall-value">{{ overallRating }}/5</span>
                </div>
              </div>
              
              <!-- Критика -->
              <div class="critique-section">
                <h3 class="critique-title">Мое мнение</h3>
                <div class="likes-dislikes">
                  <div class="likes">
                    <h4><i class="fas fa-thumbs-up"></i> Плюсы</h4>
                    <ul class="likes-list">
                      <li v-for="(like, index) in likes" :key="index">{{ like }}</li>
                    </ul>
                  </div>
                  
                  <div class="dislikes">
                    <h4><i class="fas fa-thumbs-down"></i> Минусы</h4>
                    <ul class="dislikes-list">
                      <li v-for="(dislike, index) in dislikes" :key="index">{{ dislike }}</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <!-- Яркие моменты -->
              <div class="highlight-moments">
                <h3 class="moments-title">Запоминающиеся моменты</h3>
                <div class="moments-grid">
                  <div v-for="(moment, index) in highlightMoments" :key="index" class="moment-card">
                    <div class="moment-icon"><i :class="moment.icon"></i></div>
                    <div class="moment-text">
                      <h4>{{ moment.title }}</h4>
                      <p>{{ moment.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Заключение -->
              <div class="event-conclusion">
                <h3>{{ conclusionTitle }}</h3>
                <p v-html="conclusion"></p>
                
                <div v-if="nextEvents.length > 0" class="next-events">
                  <h4>{{ nextEventsTitle }}</h4>
                  <div class="next-events-list">
                    <router-link 
                      v-for="(nextEvent, index) in nextEvents" 
                      :key="index" 
                      :to="nextEvent.path" 
                      class="next-event-link"
                    >
                      <i class="fas fa-calendar-alt"></i>
                      <span>{{ nextEvent.title }}</span>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'PastEventTemplate',
    data() {
      return {
        // ===============================================================
        // НАСТРОЙКА ДАННЫХ МЕРОПРИЯТИЯ - ЗДЕСЬ ВНОСИТЕ ИЗМЕНЕНИЯ
        // ===============================================================
        
        // Основные данные мероприятия
        eventName: 'Fox Family Fest',
        eventSubtitle: 'Выстовка-фестиваль домашних лис',
        eventDescription: 'Ежегодная образовательная выставка-фестиваль домашних лис. Вас ждут лекции о правильном отношении к дикой природе, о сложностях содержания экзотических животных в домашних условиях, о нюансах ветеринарного сопровождения и кормления, а также мастер-классы, тематическая ярмарка и фотозона с экзотическими питомцами',
        eventDate: '31 мая 2025',
        eventTime: '11:00–18:45',
        eventLocation: 'Москва',
        eventAttendees: '50+',
        
        // Баннер мероприятия (главное изображение)
        eventBannerImage: 'https://sun9-25.userapi.com/impg/byVulheK0fyG1IXoOLWwzcBFuE5bwNtkuDvEnQ/BWwZGQpoook.jpg?size=2560x1920&quality=95&sign=1d776f5dfecccff8f2071f40aca28a90&type=album',
        
        // Бейджик (VIP или Волонтёр)
        eventBadge: false,
        eventBadgeClass: 'vip',  // 'vip' или 'volunteer'
        eventBadgeText: 'VIP',
        
        // Показывать ли вкладку "Покупки"
        hasPurchases: false,
        
        // Официальные ссылки на соцсети мероприятия
        officialLinks: [
          {
            url: 'https://vk.com/ff_fest',
            icon: 'fab fa-vk',
            text: 'Группа ВКонтакте'
          },
          {
            url: 'https://foxfamilyfest.ru/',
            icon: 'fab fa-bandcamp',
            text: 'Официальный сайт'
          }
          // Добавить другие ссылки при необходимости
        ],
        
        // Особенности мероприятия
        featuresTitle: 'Что было на мероприятии:',
        features: [
          {
            title: 'Лекции и мастер-классы',
            description: 'Обучающие сессии по уходу за лисами и экзотическими питомцами.',
            icon: 'fas fa-chalkboard-teacher'
          },
          {
            title: 'Общее фото участников',
            description: 'Тёплый момент единения всех гостей фестиваля.',
            icon: 'fas fa-camera-retro'
          },
          {
            title: 'Соревнования норок',
            description: 'Весёлые заплывы с номинациями и призами.',
            icon: 'fas fa-swimmer'
          },
          {
            title: 'Интервью с владельцами лис',
            description: 'Открытый диалог и живое общение с опытными хозяевами.',
            icon: 'fas fa-comments'
          },
          {
            title: 'Тематическая ярмарка',
            description: 'Ярмарка с сувенирами и товарами для любителей лис и экзотики.',
            icon: 'fas fa-store'
          },
          {
            title: 'Фотозона с лисами',
            description: 'Уникальная возможность сделать фото с домашними лисами и другими животными.',
            icon: 'fas fa-camera'
          }
        ],
        // Встреченные знакомые/новые друзья
        friendsTitle: 'Мои знакомые на мероприятии:',
        friends: [
          {
            name: 'Sif',
            description: 'Встретились Впервые за долгое время.',
            icon: 'fas fa-cat',
            image: null,  // Если нет фото, будет использована иконка
          },
          {
            name: 'Kaoshi & Hosty',
            description: 'Друзьяшки милашки.',
            icon: 'fas fa-fox',
            image: 'https://sun9-36.userapi.com/impg/06gByzL2mV8e8EYuYNdroKYf55RcvLyUk5Ilsw/FG6b4dt0hcY.jpg?size=1080x1156&quality=95&sign=aeadbf59cb7fd8b50ec9ec3ed21d6772&type=album'
          },
          {
            name: 'Felix',
            description: 'Познакомились на FoxWood, очень приятный собеседник и милашка.',
            icon: 'fas fa-fox',
            image: 'https://sun9-42.userapi.com/impg/CDRFrQU6BWmjU8eDCmWxBrImrA01sOIv776VLw/BufGWCSTI7k.jpg?size=1620x2160&quality=95&sign=bbc60e94871eb36c924a64dce668152f&type=album'
          }
        ],
        
        // ===============================================================
        // ФОТОГРАФИИ - УДОБНОЕ ДОБАВЛЕНИЕ
        // ===============================================================
        galleryImages: [
          { 
            src: 'https://sun9-40.userapi.com/impg/JRAPVDMZBtwLTk9XV1Frk-qvsmdT1dfSgNvkUQ/69LGTK6aUbI.jpg?size=1620x2160&quality=95&sign=863e1978ba15d48c889efb82d583b50c&type=album', 
            alt: 'C Феньком' 
          },
          { 
            src: 'https://sun9-40.userapi.com/impg/eAc-sgAgfk8edlB8RRrkRSeitvOanZpaFrKIRw/kFHZhVtVywg.jpg?size=1620x2160&quality=95&sign=11b9cdbc411bd9ccb42d2aa3982676fe&type=album', 
            alt: 'Главная сцена' 
          },
          { 
            src: 'https://sun9-38.userapi.com/impg/dG-dG-fLPM6FaR60QnW5l_m6RNYkTkPORcMdiA/yzP8ZrkShqA.jpg?size=1620x2160&quality=95&sign=0132d013e1d4eb30473e1960ebd97ed8&type=album', 
            alt: 'Выступление ведущих' 
          },
          { 
            src: 'https://sun9-71.userapi.com/impg/CHjZawmu-JB9Hv9l8YjVYjhDEuKo0N1yilD8Wg/-ssfWPQZUsE.jpg?size=2560x1920&quality=95&sign=9a6c9c390a9f151f825a30fbb37135ca&type=album', 
            alt: 'С друзьями у входа' 
          },
          { 
            src: 'https://sun9-23.userapi.com/impg/nuDvYxXo8C_I1eIrmWn4krwo0rO363YGTsTPpA/Ki0D79aEgwQ.jpg?size=1620x2160&quality=95&sign=7035cf19daa326a3aa1300d226efcb94&type=album', 
            alt: 'Групповое фото на фоне баннера' 
          },
          { 
            src: 'https://sun9-5.userapi.com/impg/GFnR0PJXOyoCwa1BacWP3sGni8cAUMoaKXKLTA/clKXy3M6mvA.jpg?size=2560x1920&quality=95&sign=9dce3c87c9b9dd4c8e8cdb917a631545&type=album', 
            alt: 'Групповое фото на фоне баннера' 
          },
          { 
            src: 'https://sun9-52.userapi.com/impg/UBoCfIGVehKe6-WL2riqevG4QWjMAIZZGazJmw/cKeAPszCnVM.jpg?size=2560x1920&quality=95&sign=f9b54969d2ac90ed52d5226ba0159804&type=album', 
            alt: 'Групповое фото на фоне баннера' 
          },
          { 
            src: 'https://sun9-25.userapi.com/impg/byVulheK0fyG1IXoOLWwzcBFuE5bwNtkuDvEnQ/BWwZGQpoook.jpg?size=2560x1920&quality=95&sign=1d776f5dfecccff8f2071f40aca28a90&type=album', 
            alt: 'Групповое фото на фоне баннера' 
          },
          { 
            src: 'https://sun9-28.userapi.com/impg/pNYiMhv8hrNXV9VXcgSkq_Aw8j-pwo6NLi4hng/yrJhLVV1atU.jpg?size=2560x1920&quality=95&sign=4d8e8b7c89893e30cc654b1d691cb777&type=album', 
            alt: 'Групповое фото на фоне баннера' 
          },
          { 
            src: 'https://sun9-70.userapi.com/impg/oFm1FJ3KX6ksXuGLejtxx7sZgkQHKHy1bmTAmg/YdOQ5YifemM.jpg?size=1620x2160&quality=95&sign=e98703a378ea3020e2f43f51074345da&type=album', 
            alt: 'Групповое фото на фоне баннера' 
          },
          { 
            src: 'https://sun9-18.userapi.com/impg/wY7vRbt6gTV4W1AjhkhbATVJgiVtkP7Ev9glxg/Pbryhd_i42g.jpg?size=1620x2160&quality=95&sign=25499ab42c50aa5cabd6f8659e54b4de&type=album', 
            alt: 'Групповое фото на фоне баннера' 
          },
          { 
            src: 'https://sun9-49.userapi.com/impg/ZXg4KBVZdYXzZF6IcJIspcWvPS4cc7FHICeDSw/y50GKCiIy4U.jpg?size=1620x2160&quality=95&sign=5573dfc9f2e85db2c4f1df3ab5c8c7ad&type=album', 
            alt: 'Групповое фото на фоне баннера' 
          },
          { 
            src: 'https://sun9-10.userapi.com/impg/QsYjHEk92rxF8uykTbFtziJwEhJSfl72u2wsnw/ktszpPIXj0Y.jpg?size=1620x2160&quality=95&sign=28d5d0e0c539c49b425415318c5cb89b&type=album', 
            alt: 'Групповое фото на фоне баннера' 
          },
          { 
            src: 'https://sun9-25.userapi.com/impg/byVulheK0fyG1IXoOLWwzcBFuE5bwNtkuDvEnQ/BWwZGQpoook.jpg?size=2560x1920&quality=95&sign=1d776f5dfecccff8f2071f40aca28a90&type=album', 
            alt: 'Групповое фото на фоне баннера' 
          },
          { 
            src: 'https://sun9-44.userapi.com/impg/b9U2euTPvFdwwbzXFlemsKsrt7C8gVV4Dp_N4w/hMQT1t5KUD4.jpg?size=1620x2160&quality=95&sign=5d6e546fb903f5930e5c581946b9fae0&type=album', 
            alt: 'Групповое фото на фоне баннера' 
          },
          { 
            src: 'https://sun9-51.userapi.com/impg/IBFk1Hsu-BnYLEd50PUYixfLooVxqVzoVkgJlg/pwtT6DdqucE.jpg?size=1620x2160&quality=95&sign=8e29f42446053d6d9d41dec42dfad1ab&type=album', 
            alt: 'Арт-зона с художниками' 
          }
        ],
        
        // ===============================================================
        // ПОКУПКИ
        // ===============================================================
        purchasesIntro: 'На этом мероприятии я приобрел несколько отличных товаров от талантливых художников и крафтеров.',
        purchases: [
          {
            title: 'Значок с моей фурсоной',
            author: 'PinMaker',
            authorIcon: 'fas fa-paint-brush',
            description: 'Красивый металлический значок с изображением моей фурсоны. Отличное качество и детализация!',
            image: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/reference.png',
            price: '800₽'
          },
          {
            title: 'Фурсьют пропуск',
            author: 'BadgeMaker',
            authorIcon: 'fas fa-id-card',
            description: 'Ламинированный пропуск с красивым дизайном и удобным креплением.',
            image: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Illustration4_6.jpg',
            price: '500₽'
          }
        ],
        totalSpent: '1300₽',
        purchasesSummary: 'Я остался очень доволен своими покупками. Качество всех приобретений на высоте, а цены были достаточно разумными для авторских работ.',
        nextEvent: {
          title: 'FurMarket Mini',
          timeplace: '22 июля 2025 | Москва',
        },
        
        // ===============================================================
        // ВПЕЧАТЛЕНИЯ И КРИТИКА
        // ===============================================================
        impressionsIntro: 'Это мероприятие оставило у меня яркие и тёплые впечатления! Несмотря на жаркое помещение, всё прошло интересно и увлекательно. Вот моя детальная оценка:',
        ratingCategories: [
          { name: 'Организация', rating: 5 },
          { name: 'Программа', rating: 5 },
          { name: 'Атмосфера', rating: 3 },
          { name: 'Локация', rating: 3 },
          { name: 'Участники', rating: 4 }
        ],
        
        // Плюсы и минусы
        likes: [
          'Разнообразная и насыщенная программа: лекции, мастер-классы и выставки животных',
          'Интерактивные зоны: фотозона с лисами',
          'Много диких животных',
          '',
          'Качественный маркет с разнообразными товарами'
        ],
        
        dislikes: [
          'Жаркое помещение с недостаточной вентиляцией',
          'Высокие цены на еду и напитки в фудкорте, мало бюджетных вариантов',
          'Локация относительно транспорта неудобна: до метро пешком около 15–20 минут'
        ],
        // Запоминающиеся моменты
        highlightMoments: [
          {
            title: 'Фотосессия с лисами',
            description: 'Тёплый и символичный момент — общее фото со всеми участниками фестиваля. Настоящее чувство единства и лисьей радости!',
            icon: 'fas fa-camera-retro'
          },
          {
            title: 'Интервью с владельцами лис',
            description: 'Открытая беседа, где можно было задать любые вопросы и услышать личный опыт содержания лис. Живое общение и важные инсайты.',
            icon: 'fas fa-microphone-alt'
          },
          {
            title: 'Знакомство с енотовидными собаками',
            description: 'Редкая возможность увидеть этих удивительных животных вживую.',
            icon: 'fas fa-paw'
          },
          {
            title: 'Лекция о хорьках',
            description: 'Увлекательная лекция от «Приюта хоря» — много полезной информации и живое знакомство с милыми хорьками.',
            icon: 'fas fa-book-reader'
          }
        ],
        // Заключение
        conclusionTitle: 'Общее впечатление',
        conclusion: 'Fox Family Fest — это праздник для всех, кто любит животных, учится заботе о них и хочет провести день в тёплой, душевной обстановке',
        nextEventsTitle: 'Похожее мероприятия:',
        nextEvents: [
          { path: '/events/AFF5', title: 'Any Furry Fest V' },
          { path: '/events/FurMarket', title: 'FurMarket' }
        ],
        
        // ===============================================================
        // СИСТЕМНЫЕ НАСТРОЙКИ (не менять)
        // ===============================================================
        activeTab: 'overview'
      }
    },
    computed: {
      overallRating() {
        if (this.ratingCategories.length === 0) return 0;
        
        const sum = this.ratingCategories.reduce((total, category) => total + category.rating, 0);
        const average = sum / this.ratingCategories.length;
        return Math.round(average * 10) / 10;
      }
    },
    mounted() {
      // Проверяем, есть ли хеш в URL и если есть, активируем соответствующую вкладку
      const hash = window.location.hash;
      if (hash) {
        const tab = hash.replace('#', '');
        const availableTabs = ['overview', 'gallery', 'purchases', 'impressions'];
        if (availableTabs.includes(tab)) {
          this.activeTab = tab;
        }
      }
    },
    methods: {
      // Открытие изображения в галерее
      openGalleryImage(index) {
        alert(`Открытие изображения ${index + 1} в галерее`);
        // Здесь можно реализовать открытие лайтбокса или модального окна с изображением
      },
      
      // Метод для установки напоминания
      setReminder() {
        alert(`Напоминание о мероприятии "${this.nextEvent.title}" установлено!`);
        // Здесь можно реализовать логику для настройки напоминания
      }
    }
  }
  </script>
  
  <style scoped>
  .event-details-page {
    color: var(--text-light);
  }
  
  /* Героическая секция */
  .event-hero {
    position: relative;
    height: 450px;
    overflow: hidden;
    margin-bottom: 2rem;
  }
  
  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.8));
    z-index: 1;
  }
  
  .hero-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    filter: blur(3px);
    transform: scale(1.05);
  }
  
  .hero-content {
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
  
  .back-button {
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
  }
  
  .back-button:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateX(-5px);
  }
  
  .event-badges {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .event-status {
    background: rgba(255, 123, 37, 0.9);
    color: white;
    padding: 0.4rem 0.8rem;
    border-radius: 2rem;
    font-size: 0.9rem;
    font-weight: 600;
    backdrop-filter: blur(5px);
  }
  
  .event-status.visited {
    background: rgba(76, 175, 80, 0.9);
  }
  
  .event-badge {
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 0.4rem 0.8rem;
    border-radius: 2rem;
    font-size: 0.9rem;
    font-weight: 600;
    backdrop-filter: blur(5px);
  }
  
  .event-badge.vip {
    background: rgba(255, 215, 0, 0.9);
    color: #000;
  }
  
  .event-badge.volunteer {
    background: rgba(156, 39, 176, 0.9);
  }
  
  .event-title {
    font-size: 3rem;
    font-weight: 800;
    margin: 0 0 0.5rem 0;
    color: white;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  }
  
  .event-subtitle {
    font-size: 1.5rem;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
  }
  
  /* Контейнер для содержимого */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }
  
  /* Сетка с информацией о мероприятии */
  .event-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2.5rem;
  }
  
  .event-info-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.05);
    padding: 1.2rem;
    border-radius: 0.8rem;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .event-info-card:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }
  
  .info-icon {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--accent-orange), var(--accent-green));
    border-radius: 50%;
    font-size: 1.2rem;
    color: white;
    flex-shrink: 0;
  }
  
  .info-content {
    display: flex;
    flex-direction: column;
  }
  
  .info-label {
    font-size: 0.8rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 0.3rem;
  }
  
  .info-value {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-light);
  }
  
  /* Навигация по секциям */
  .event-navigation {
    margin-bottom: 2rem;
  }
  
  .nav-tabs {
    display: flex;
    gap: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 1rem;
    overflow-x: auto;
  }
  
  .nav-tab {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.8rem 1.2rem;
    border-radius: 0.5rem;
    text-decoration: none;
    color: var(--text-muted);
    transition: all 0.3s ease;
    font-weight: 600;
    white-space: nowrap;
  }
  
  .nav-tab:hover:not(.active) {
    color: var(--text-light);
    background: rgba(255, 255, 255, 0.05);
  }
  
  .nav-tab.active {
    background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
    color: white;
    box-shadow: 0 5px 15px rgba(255, 123, 37, 0.2);
  }
  
  /* Стили для разделов контента */
  .event-section {
    margin-bottom: 3rem;
    animation: fadeIn 0.5s ease;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .section-title {
    font-size: 2rem;
    margin-bottom: 1.5rem;
    font-weight: 700;
    color: var(--text-light);
    position: relative;
    display: inline-block;
  }
  
  .section-title::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 50px;
    height: 4px;
    background: linear-gradient(90deg, var(--accent-orange), var(--accent-green));
    border-radius: 4px;
  }
  
  .section-content {
    font-size: 1.05rem;
    line-height: 1.7;
  }
  
  .event-description {
    background: rgba(255, 255, 255, 0.05);
    padding: 1.5rem;
    border-radius: 0.8rem;
    margin-bottom: 1.5rem;
    border-left: 4px solid var(--accent-orange);
  }
  
  /* Ссылки на официальные ресурсы */
  .event-links {
    margin-bottom: 1.5rem;
  }
  
  .links-title {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    font-weight: 600;
  }
  
  .links-container {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .event-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.8rem 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.8rem;
    text-decoration: none;
    color: var(--text-light);
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .event-link:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }
  
  .event-link i {
    font-size: 1.5rem;
    color: #4C75A3; /* Цвет для ВКонтакте */
  }
  
  /* Особенности мероприятия */
  .features-container {
    margin-top: 2rem;
    margin-bottom: 2.5rem;
  }
  
  .features-title {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    font-weight: 600;
  }
  
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }
  
  .feature-card {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.03);
    padding: 1.2rem;
    border-radius: 0.8rem;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .feature-card:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }
  
  .feature-icon {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--accent-orange), var(--accent-green));
    border-radius: 50%;
    font-size: 1.2rem;
    color: white;
    flex-shrink: 0;
  }
  
  .feature-content h4 {
    font-size: 1.1rem;
    margin: 0 0 0.5rem 0;
    font-weight: 600;
  }
  
  .feature-content p {
    font-size: 0.95rem;
    color: var(--text-muted);
    margin: 0;
    line-height: 1.5;
  }
  
  /* Знакомые на мероприятии */
  .friends-container {
    margin-top: 2.5rem;
  }
  
  .friends-title {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    font-weight: 600;
  }
  
  .friends-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  .friend-card {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 0.8rem;
    overflow: hidden;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .friend-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
    background: rgba(255, 255, 255, 0.08);
  }
  
  .friend-image {
    height: 150px;
    overflow: hidden;
  }
  
  .friend-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  .friend-card:hover .friend-image img {
    transform: scale(1.05);
  }
  
  .friend-placeholder {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(255, 123, 37, 0.3), rgba(76, 175, 80, 0.3));
    font-size: 3rem;
    color: rgba(255, 255, 255, 0.7);
  }
  
  .friend-info {
    padding: 1rem;
  }
  
  .friend-info h4 {
    font-size: 1.1rem;
    margin: 0 0 0.5rem 0;
    font-weight: 600;
  }
  
  .friend-info p {
    font-size: 0.9rem;
    color: var(--text-muted);
    margin-bottom: 1rem;
    line-height: 1.5;
  }
  
  .friend-social {
    display: flex;
    gap: 0.5rem;
  }
  
  .social-link {
    width: 35px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    color: var(--text-light);
    font-size: 1rem;
    transition: all 0.3s ease;
    text-decoration: none;
  }
  
  .social-link:hover {
    transform: translateY(-3px);
    background: linear-gradient(135deg, var(--accent-orange), var(--accent-green));
  }
  
  /* Галерея */
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }
  
  .gallery-item {
    position: relative;
    border-radius: 0.8rem;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
    aspect-ratio: 1 / 1;
    cursor: pointer;
  }
  
  .gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  .gallery-item:hover img {
    transform: scale(1.05);
  }
  
  .gallery-overlay {
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
  
  .gallery-item:hover .gallery-overlay {
    opacity: 1;
  }
  
  .gallery-actions {
    display: flex;
    gap: 1rem;
  }
  
  .gallery-action-btn {
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
  
  .gallery-action-btn:hover {
    background: linear-gradient(135deg, var(--accent-orange), var(--accent-green));
    transform: scale(1.1);
  }
  
  /* Покупки */
  .purchases-content {
    padding: 0.5rem;
  }
  
  .purchases-intro {
    font-size: 1.1rem;
    line-height: 1.7;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.8rem;
    border-left: 4px solid var(--accent-orange);
  }
  
  .purchases-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 2rem;
    margin-bottom: 2.5rem;
  }
  
  .purchase-card {
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 0.8rem;
    overflow: hidden;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.05);
    height: 100%;
  }
  
  .purchase-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
    background: rgba(255, 255, 255, 0.08);
  }
  
  .purchase-image {
    height: 200px;
    overflow: hidden;
  }
  
  .purchase-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  .purchase-card:hover .purchase-image img {
    transform: scale(1.05);
  }
  
  .purchase-info {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
  
  .purchase-title {
    font-size: 1.3rem;
    margin: 0 0 0.5rem 0;
    font-weight: 700;
  }
  
  .purchase-author {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    color: var(--text-muted);
  }
  
  .purchase-author i {
    color: var(--accent-orange);
  }
  
  .purchase-desc {
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 1rem;
    flex-grow: 1;
  }
  
  .purchase-price {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--accent-green);
    align-self: flex-end;
  }
  
  .purchases-summary {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 0.8rem;
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .summary-content {
    margin-bottom: 1.5rem;
  }
  
  .summary-content h3 {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
  
  .total-spent {
    color: var(--accent-green);
    font-weight: 700;
  }
  
  .next-market {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.05);
    padding: 1rem 1.5rem;
    border-radius: 0.8rem;
  }
  
  .next-event-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .next-event-info i {
    font-size: 1.5rem;
    color: var(--accent-orange);
  }
  
  .next-event-details h4 {
    font-size: 1.1rem;
    margin: 0 0 0.2rem 0;
    font-weight: 600;
  }
  
  .next-event-details p {
    font-size: 0.9rem;
    color: var(--text-muted);
    margin: 0;
  }
  
  .next-event-reminder {
    flex-shrink: 0;
  }
  
  .reminder-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
    color: white;
    padding: 0.6rem 1.2rem;
    border-radius: 2rem;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .reminder-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(255, 123, 37, 0.3);
  }
  
  /* Впечатления */
  .impressions-content {
    padding: 0.5rem;
  }
  
  .impression-intro {
    font-size: 1.1rem;
    line-height: 1.7;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.8rem;
    border-left: 4px solid var(--accent-orange);
  }
  
  /* Оценки */
  .rating-section {
    margin-bottom: 2.5rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 0.8rem;
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .rating-title {
    font-size: 1.3rem;
    margin-bottom: 1.2rem;
    font-weight: 600;
  }
  
  .rating-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .rating-item {
    background: rgba(255, 255, 255, 0.05);
    padding: 1rem;
    border-radius: 0.5rem;
    text-align: center;
    transition: all 0.3s ease;
  }
  
  .rating-item:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-3px);
  }
  
  .rating-category {
    font-size: 0.9rem;
    color: var(--text-muted);
    margin-bottom: 0.5rem;
  }
  
  .rating-stars {
    display: flex;
    justify-content: center;
    gap: 0.3rem;
    margin-bottom: 0.5rem;
  }
  
  .rating-stars i {
    color: rgba(255, 255, 255, 0.2);
    font-size: 1.2rem;
  }
  
  .rating-stars i.active {
    color: #FFD700;
  }
  
  .rating-value {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--accent-orange);
  }
  
  .rating-overall {
    text-align: right;
    font-size: 1.2rem;
    font-weight: 600;
  }
  
  .overall-label {
    color: var(--text-muted);
    margin-right: 0.5rem;
  }
  
  .overall-value {
    color: var(--accent-orange);
    font-weight: 700;
    font-size: 1.3rem;
  }
  
  /* Плюсы и минусы */
  .critique-section {
    margin-bottom: 2.5rem;
  }
  
  .critique-title {
    font-size: 1.3rem;
    margin-bottom: 1.2rem;
    font-weight: 600;
  }
  
  .likes-dislikes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  .likes, .dislikes {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 0.8rem;
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .likes h4, .dislikes h4 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.1rem;
    margin-bottom: 1rem;
    font-weight: 600;
  }
  
  .likes h4 i {
    color: #4CAF50;
  }
  
  .dislikes h4 i {
    color: #F44336;
  }
  .likes-list, .dislikes-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  
  .likes-list li, .dislikes-list li {
    position: relative;
    padding-left: 1.5rem;
    margin-bottom: 0.7rem;
    font-size: 0.95rem;
    line-height: 1.5;
  }
  
  .likes-list li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #4CAF50;
    font-weight: 700;
  }
  
  .dislikes-list li::before {
    content: '✗';
    position: absolute;
    left: 0;
    color: #F44336;
    font-weight: 700;
  }
  
  /* Запоминающиеся моменты */
  .highlight-moments {
    margin-bottom: 2.5rem;
  }
  
  .moments-title {
    font-size: 1.3rem;
    margin-bottom: 1.2rem;
    font-weight: 600;
  }
  
  .moments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .moment-card {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.03);
    padding: 1.5rem;
    border-radius: 0.8rem;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .moment-card:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }
  
  .moment-icon {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--accent-orange), var(--accent-green));
    border-radius: 50%;
    font-size: 1.2rem;
    color: white;
    flex-shrink: 0;
  }
  
  .moment-text h4 {
    font-size: 1.1rem;
    margin: 0 0 0.5rem 0;
    font-weight: 600;
  }
  
  .moment-text p {
    font-size: 0.95rem;
    color: var(--text-light);
    margin: 0;
    line-height: 1.6;
  }
  
  /* Заключение */
  .event-conclusion {
    margin-top: 2.5rem;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 0.8rem;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .event-conclusion h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    font-weight: 600;
  }
  
  .event-conclusion p {
    font-size: 1.05rem;
    line-height: 1.7;
    margin-bottom: 1.5rem;
  }
  
  .next-events h4 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    font-weight: 600;
  }
  
  .next-events-list {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .next-event-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.8rem 1.2rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 2rem;
    text-decoration: none;
    color: var(--text-light);
    transition: all 0.3s ease;
    font-weight: 500;
  }
  
  .next-event-link:hover {
    background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
    color: white;
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(255, 123, 37, 0.2);
  }
  
  .next-event-link i {
    color: var(--accent-orange);
  }
  
  .next-event-link:hover i {
    color: white;
  }
  
  /* Адаптивность */
  @media (max-width: 992px) {
    .event-hero {
      height: 350px;
    }
    
    .event-title {
      font-size: 2.5rem;
    }
    
    .event-subtitle {
      font-size: 1.2rem;
    }
    
    .gallery-grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
    
    .purchases-grid {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }
  }
  
  @media (max-width: 768px) {
    .container {
      padding: 0 1rem;
    }
    
    .event-hero {
      height: 300px;
    }
    
    .event-title {
      font-size: 2rem;
    }
    
    .back-button {
      top: 1rem;
      left: 1rem;
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }
    
    .event-info-grid {
      grid-template-columns: 1fr;
    }
    
    .nav-tabs {
      overflow-x: auto;
      padding-bottom: 0.5rem;
    }
    
    .nav-tab {
      padding: 0.6rem 1rem;
      font-size: 0.9rem;
    }
    
    .section-title {
      font-size: 1.8rem;
    }
    
    .features-grid, 
    .friends-grid,
    .moments-grid {
      grid-template-columns: 1fr;
    }
    
    .gallery-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
    
    .purchases-grid {
      grid-template-columns: 1fr;
    }
    
    .next-market {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }
    
    .reminder-btn {
      width: 100%;
      justify-content: center;
    }
    
    .likes-dislikes {
      grid-template-columns: 1fr;
    }
  }
  
  @media (max-width: 480px) {
    .event-hero {
      height: 250px;
    }
    
    .event-title {
      font-size: 1.6rem;
    }
    
    .event-subtitle {
      font-size: 1rem;
    }
    
    .section-title {
      font-size: 1.6rem;
    }
    
    .rating-grid {
      grid-template-columns: 1fr;
    }
    
    .event-conclusion {
      padding: 1.5rem;
    }
  }
  </style>