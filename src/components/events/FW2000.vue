<template>
  <div class="fw-winxp-container">
    <!-- Фон Windows XP -->
    <div class="fw-winxp-background"></div>
    
    <!-- Главное окно в стиле Windows XP -->
    <div class="fw-winxp-window">
      <!-- Заголовок окна с кнопками -->
      <div class="fw-winxp-title-bar">
        <div class="fw-title-icon"><img :src="iconWinXP3" alt="Foxwood" /></div>
        <div class="fw-title-text">Foxwood: Back to 2000s - Internet Explorer</div>
        <div class="fw-window-controls">
          <button class="fw-minimize-btn">_</button>
          <button class="fw-maximize-btn">□</button>
          <button class="fw-close-btn">×</button>
        </div>
      </div>
      
      <!-- Меню и панель инструментов -->
      <div class="fw-winxp-menu-bar">
        <div class="fw-menu-item">Файл</div>
        <div class="fw-menu-item">Правка</div>
        <div class="fw-menu-item">Вид</div>
        <div class="fw-menu-item">Избранное</div>
        <div class="fw-menu-item">Сервис</div>
        <div class="fw-menu-item">Справка</div>
      </div>
      
      <div class="fw-winxp-toolbar">
        <button class="fw-toolbar-btn fw-back-btn" @click="navigateBack">
          <img :src="iconWxpB" alt="Назад" /> Назад
        </button>
        <button class="fw-toolbar-btn fw-forward-btn" @click="navigateTab('next')">
          <img :src="iconWxp290" alt="Вперед" /> Вперед
        </button>
        <div class="fw-toolbar-separator"></div>
        <button class="fw-toolbar-btn fw-home-btn" @click="goHome">
          <img :src="iconWxp259" alt="Домой" /> Домой
        </button>
        <div class="fw-toolbar-separator"></div>
        <div class="fw-address-bar">
          <span class="fw-address-label">Адрес:</span>
          <div class="fw-address-input">https://foxtaffy.fun/events/FoxWood.html</div>
          <button class="fw-address-go-btn">Переход</button>
        </div>
      </div>
      
      <!-- Основное содержимое -->
      <div class="fw-winxp-content">
        <!-- Героическая секция с баннером -->
        <div class="fw-event-hero">
          <div class="fw-hero-overlay"></div>
          <div class="fw-hero-image" :style="{ backgroundImage: `url(${eventBannerImage})` }"></div>
          <div class="fw-hero-content">
            <router-link to="/" class="fw-back-button">
              <img :src="iconWxp40" alt="Назад" class="fw-back-icon">
              <span>Назад на главную</span>
            </router-link>
            <h1 class="fw-event-title">{{ eventName }}</h1>
            <div class="fw-event-subtitle">{{ eventSubtitle }}</div>
          </div>
        </div>
        
        <div class="fw-event-container">
          <!-- Краткая информация о мероприятии -->
          <div class="fw-event-info-grid">
            <div class="fw-event-info-card">
              <div class="fw-info-icon">
                <img :src="iconW98Calendar" alt="Календарь" />
              </div>
              <div class="fw-info-content">
                <div class="fw-info-label">ДАТА ПРОВЕДЕНИЯ</div>
                <div class="fw-info-value">{{ eventDate }}</div>
              </div>
            </div>
            
            <div class="fw-event-info-card">
              <div class="fw-info-icon">
                <img :src="iconW98Clock" alt="Время" />
              </div>
              <div class="fw-info-content">
                <div class="fw-info-label">ВРЕМЯ</div>
                <div class="fw-info-value">{{ eventTime }}</div>
              </div>
            </div>
            
            <div class="fw-event-info-card">
              <div class="fw-info-icon">
                <img :src="iconW98GlobeMap" alt="Место" />
              </div>
              <div class="fw-info-content">
                <div class="fw-info-label">МЕСТО ПРОВЕДЕНИЯ</div>
                <div class="fw-info-value">{{ eventLocation }}</div>
              </div>
            </div>
            
            <div class="fw-event-info-card">
              <div class="fw-info-icon">
                <img :src="iconW98Users" alt="Участники" />
              </div>
              <div class="fw-info-content">
                <div class="fw-info-label">УЧАСТНИКОВ</div>
                <div class="fw-info-value">{{ eventAttendees }}</div>
              </div>
            </div>
          </div>
          
          <!-- Вкладки в стиле XP -->
          <div class="fw-winxp-tabs">
            <div 
              v-for="tab in tabs" 
              :key="tab.id" 
              class="fw-winxp-tab" 
              :class="{ 'fw-active': activeTab === tab.id }"
              @click="setActiveTab(tab.id)"
            >
              <img :src="getTabIcon(tab.icon)" :alt="tab.name" />
              <span>{{ tab.name }}</span>
            </div>
          </div>
          
          <div class="fw-winxp-tab-content">
            <!-- Обзор -->
            <div v-show="activeTab === 'overview'" class="fw-event-section">
              <div class="fw-winxp-content-box">
                <div class="fw-winxp-content-header">
                  <img :src="iconW98FileWindows" alt="Информация" />
                  <h2>О мероприятии</h2>
                </div>
                <div class="fw-winxp-content-body">
                  <p class="fw-event-description">{{ eventDescription }}</p>
                </div>
              </div>
              
              <!-- Ресурсы -->
              <div v-if="officialLinks.length > 0" class="fw-winxp-content-box">
                <div class="fw-winxp-content-header">
                  <img :src="iconW98Html" alt="Ссылки" />
                  <h3>Официальные ресурсы:</h3>
                </div>
                <div class="fw-links-container">
                  <a v-for="(link, index) in officialLinks" :key="index" :href="link.url" target="_blank" class="fw-event-link">
                    <img :src="getSocialIcon(link.icon)" :alt="link.text" />
                    <span>{{ link.text }}</span>
                  </a>
                </div>
              </div>
              
              <!-- Особенности мероприятия -->
              <div class="fw-winxp-content-box">
                <div class="fw-winxp-content-header">
                  <img :src="iconW98DirectoryExplorer" alt="Особенности" />
                  <h3>{{ featuresTitle }}</h3>
                </div>
                <div class="fw-features-grid">
                  <div v-for="(feature, index) in features" :key="index" class="fw-feature-card">
                    <div class="fw-feature-icon">
                      <img :src="getFeatureIcon(feature.icon)" :alt="feature.title" />
                    </div>
                    <div class="fw-feature-content">
                      <h4>{{ feature.title }}</h4>
                      <p>{{ feature.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Знакомые на мероприятии -->
              <div v-if="friends.length > 0" class="fw-winxp-content-box">
                <div class="fw-winxp-content-header">
                  <img :src="iconW98Users" alt="Друзья" />
                  <h3>{{ friendsTitle }}</h3>
                </div>
                <div class="fw-friends-grid">
                  <div v-for="(friend, index) in friends" :key="index" class="fw-friend-card">
                    <div class="fw-friend-image">
                      <div v-if="friend.image" class="fw-friend-img">
                        <img :src="friend.image" :alt="friend.name">
                      </div>
                      <div v-else class="fw-friend-placeholder">
                        <img :src="iconWxp269" :alt="friend.name" />
                      </div>
                    </div>
                    <div class="fw-friend-info">
                      <h4>{{ friend.name }}</h4>
                      <p>{{ friend.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Галерея -->
            <div v-show="activeTab === 'gallery'" class="fw-event-section">
              <div class="fw-winxp-content-box">
                <div class="fw-winxp-content-header">
                  <img :src="iconWxp248" alt="Фотографии" />
                  <h2>Фотографии</h2>
                </div>
                <div class="fw-gallery-toolbar">
                  <button class="fw-gallery-view-btn fw-active">
                    <img :src="iconWxp226" alt="Эскизы" />
                    <span>Эскизы</span>
                  </button>
                  <button class="fw-gallery-view-btn">
                    <img :src="iconWxp224" alt="Кинопленка" />
                    <span>Кинопленка</span>
                  </button>
                  <div class="fw-gallery-separator"></div>
                  <div class="fw-gallery-sort">
                    <span>Сортировка:</span>
                    <select>
                      <option>По имени</option>
                      <option>По дате</option>
                    </select>
                  </div>
                </div>
                <div class="fw-gallery-grid">
                  <div 
                    v-for="(photo, index) in galleryImages" 
                    :key="index" 
                    class="fw-gallery-item"
                    @click="openPhoto(index)"
                  >
                    <div class="fw-gallery-thumbnail">
                      <img :src="photo.src" :alt="photo.alt || `Фото ${index + 1}`">
                    </div>
                    <div class="fw-gallery-filename">
                      {{ `ФОТО_${index + 1}.JPG` }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Покупки -->
            <div v-show="activeTab === 'purchases'" class="fw-event-section">
              <div class="fw-winxp-content-box">
                <div class="fw-winxp-content-header">
                  <img :src="iconW2kClosedFolder" alt="Покупки" />
                  <h2>Мои покупки</h2>
                </div>
                <div class="fw-winxp-content-body">
                  <p class="fw-purchases-intro">{{ purchasesIntro }}</p>
                  
                  <div class="fw-purchases-explorer">
                    <div class="fw-explorer-sidebar">
                      <div class="fw-sidebar-section">
                        <div class="fw-sidebar-header">Категории</div>
                        <div class="fw-sidebar-item fw-active">
                          <img :src="iconW2kClosedFolder" alt="Папка" />
                          <span>Все покупки</span>
                        </div>
                        <div class="fw-sidebar-item">
                          <img :src="iconW2kClosedFolder" alt="Папка" />
                          <span>Арты</span>
                        </div>
                      </div>
                    </div>
                    <div class="fw-explorer-content">
                      <div class="fw-explorer-header">
                        <div class="fw-explorer-path">
                          <img :src="iconW2kClosedFolder" alt="Папка" />
                          <span>Foxwood 2000s</span>
                          <span class="fw-path-separator">&gt;</span>
                          <span>Покупки</span>
                        </div>
                      </div>
                      <div class="fw-purchases-grid">
                        <div v-for="(purchase, index) in purchases" :key="index" class="fw-purchase-card">
                          <div class="fw-purchase-image">
                            <img :src="purchase.image" :alt="purchase.title">
                          </div>
                          <div class="fw-purchase-info">
                            <h3 class="fw-purchase-title">{{ purchase.title }}</h3>
                            <div class="fw-purchase-author">
                              <img :src="iconW98Paintbrush" alt="Автор" />
                              <span>{{ purchase.author }}</span>
                            </div>
                            <p class="fw-purchase-desc">{{ purchase.description }}</p>
                            <div class="fw-purchase-price">{{ purchase.price }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Впечатления -->
            <div v-show="activeTab === 'impressions'" class="fw-event-section">
              <div class="fw-winxp-content-box">
                <div class="fw-winxp-content-header">
                  <img :src="iconW98Notepad" alt="Впечатления" />
                  <h2>Впечатления - Блокнот</h2>
                </div>
                <div class="fw-notepad-toolbar">
                  <div class="fw-notepad-menu">
                    <div class="fw-notepad-menu-item">Файл</div>
                    <div class="fw-notepad-menu-item">Правка</div>
                    <div class="fw-notepad-menu-item">Справка</div>
                  </div>
                </div>
                <div class="fw-notepad-content">
                  <div class="fw-impression-text">
                    <p class="fw-impression-intro">{{ impressionsIntro }}</p>
                    
                    <div class="fw-impression-section-title">== ОЦЕНКИ ==</div>
                    <div class="fw-rating-categories">
                      <div v-for="(category, index) in ratingCategories" :key="index" class="fw-rating-category">
                        <div class="fw-category-name">{{ category.name }}:</div>
                        <div class="fw-category-rating">
                          <span v-for="star in 5" :key="star" class="fw-star" :class="{ 'fw-active': star <= category.rating }">
                            {{ star <= category.rating ? '★' : '☆' }}
                          </span>
                          <span class="fw-rating-value">{{ category.rating }}/5</span>
                        </div>
                      </div>
                    </div>
                    <p class="fw-overall-rating">Общая оценка: {{ overallRating }}/5</p>
                    
                    <div class="fw-impression-section-title">== ПЛЮСЫ ==</div>
                    <ul class="fw-impression-list">
                      <li v-for="(like, index) in likes" :key="index">+ {{ like }}</li>
                    </ul>
                    
                    <div class="fw-impression-section-title">== МИНУСЫ ==</div>
                    <ul class="fw-impression-list">
                      <li v-for="(dislike, index) in dislikes" :key="index">- {{ dislike }}</li>
                    </ul>
                    
                    <div class="fw-impression-section-title">== ЗАКЛЮЧЕНИЕ ==</div>
                    <p class="fw-conclusion-text" v-html="conclusion"></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Панель состояния в стиле Windows XP -->
      <div class="fw-winxp-statusbar">
        <div class="fw-status-text">Готово</div>
        <div class="fw-security-zone">
          <img :src="iconW2kWmp55" alt="Безопасность" />
          <span>Зона Интернета | Защищенный режим: откл.</span>
        </div>
      </div>
    </div>
    
    <!-- Кнопка "Пуск" и панель задач в стиле Windows XP -->
    <div class="fw-winxp-taskbar">
      <button class="fw-start-button">
        <img :src="startButtonImage" alt="Пуск" />
        <span>Пуск</span>
      </button>
      <div class="fw-taskbar-items">
        <div class="fw-taskbar-item fw-active">
          <img :src="iconWinXP3" alt="Internet Explorer" />
          <span>Foxwood: Back to 2000s - Internet Explorer</span>
        </div>
      </div>
      <div class="fw-taskbar-tray">
        <div class="fw-tray-time">
          {{ currentTime }}
        </div>
      </div>
    </div>
    
    <!-- Лайтбокс для просмотра фотографий -->
    <div v-if="lightboxOpen" class="fw-photo-lightbox" @click="closeLightbox">
      <div class="fw-lightbox-content" @click.stop>
        <button class="fw-lightbox-close" @click="closeLightbox">×</button>
        <div class="fw-lightbox-title">{{ galleryImages[currentPhoto].alt || 'Просмотр фото' }}</div>
        <div class="fw-lightbox-image-container">
          <img :src="galleryImages[currentPhoto].src" :alt="galleryImages[currentPhoto].alt">
        </div>
        <div class="fw-lightbox-controls">
          <button class="fw-lightbox-prev" @click="prevPhoto" :disabled="currentPhoto === 0">
            <img :src="iconWxpB" alt="Назад">
          </button>
          <div class="fw-lightbox-count">{{ currentPhoto + 1 }} / {{ galleryImages.length }}</div>
          <button class="fw-lightbox-next" @click="nextPhoto" :disabled="currentPhoto === galleryImages.length - 1">
            <img :src="iconWxp290" alt="Вперед">
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * FW2000 - Компонент страницы мероприятия Foxwood: Back to 2000s
 * 
 * Реализует полноценную страницу мероприятия в стиле Windows XP/2000
 * с интерактивными элементами, галереей фотографий, информацией о покупках
 * и впечатлениях от мероприятия.
 * 
 * Особенности:
 * - Полная стилизация под Windows XP/Internet Explorer
 * - Адаптивный дизайн для всех устройств
 * - Система вкладок для навигации по контенту
 * - Интерактивная галерея с лайтбоксом
 * - SEO-оптимизация с динамическими метатегами
 * - Реалистичная имитация классического интерфейса
 */

export default {
  name: 'FW2000',
  data() {
    return {
      // Управление временем и UI состоянием
      currentTime: '',
      lightboxOpen: false,
      currentPhoto: 0,
      
      // Пути к ресурсам Windows XP иконок
      iconWinXP3: '/w98_msie1.ico',
      iconWxpB: '/wxpb.ico',
      iconWxp18: '/wxp_18.ico',
      iconWxp37: '/wxp_37.ico',
      iconWxp40: '/wxp_40.ico',
      iconWxp224: '/wxp_224.ico',
      iconWxp226: '/wxp_226.ico',
      iconWxp248: '/wxp_248.ico',
      iconWxp259: '/wxp_259.ico',
      iconWxp263: '/wxp_263.ico',
      iconWxp269: '/wxp_269.ico',
      iconWxp282: '/wxp_282.ico',
      iconWxp290: '/wxp_290.ico',
      iconW2kClosedFolder: '/w2k_closed_folder.ico',
      iconW2kInfo: '/w2k_info.ico',
      iconW2kWmp55: '/w2k_wmp_55.ico',
      iconW2kWupdate1: '/w2k_wupdate_1.ico',
      iconW98Calendar: '/w98_calendar.ico',
      iconW98Clock: '/w98_clock.ico',
      iconW98DirectoryExplorer: '/w98_directory_explorer.ico',
      iconW98FileWindows: '/w98_file_windows.ico',
      iconW98GlobeMap: '/w98_globe_map.ico',
      iconW98Html: '/w98_html.ico',
      iconW98Notepad: '/w98_notepad.ico',
      iconW98Paintbrush: '/w98_paintbrush.ico',
      iconW98Users: '/w98_users.ico',
      iconW98WorldStar: '/w98_world_star.ico',
      
      // Графические ресурсы
      startButtonImage: '/pusk.png',
      iconVK: '/vk.png',
      
      // Система навигации по вкладкам
      activeTab: 'overview',
      tabs: [
        { id: 'overview', name: 'Обзор', icon: 'info' },
        { id: 'gallery', name: 'Фотографии', icon: 'photos' },
        { id: 'purchases', name: 'Покупки', icon: 'shopping' },
        { id: 'impressions', name: 'Впечатления', icon: 'notepad' }
      ],
      
      // Основная информация о мероприятии
      eventName: 'Foxwood: Back to 2000s',
      eventSubtitle: 'Эпоха ярких красок, зажигательных хитов и незабываемой атмосферы 2000-х!',
      eventDescription: 'FoxWood — это ежегодный фурри-конвент с душой. Место, где собираются друзья, сообщество и вдохновение. Здесь царит уютная, теплая атмосфера, в которой каждый чувствует себя своим — будь ты в фурсьюте, с блокнотом художника или просто с открытым сердцем. В 2025 году мы перенеслись в яркие и свободные 2000-е — эпоху, когда музыка звучала с кассетников, пиксели грели душу, а дружба рождалась в оффлайне. Мы воссоздали стиль того времени через конкурсы, фотозоны, танцы, фандомные активности и море живого общения.',
      eventDate: '15–18 мая 2025',
      eventTime: '16:00',
      eventLocation: 'Подмосковье',
      eventAttendees: '140+',
      
      // Визуальное оформление
      eventBannerImage: 'https://sun9-50.userapi.com/impg/5iy95OwlAzXlcroe6l_mgUSz_WXaeM1j4A0GYg/T_MKUtoyPuk.jpg?size=2560x1928&quality=95&sign=808035378f0d8274376cd313473d6023&type=album',
      
      // Статус участника
      eventBadge: true,
      eventBadgeClass: 'fw-volunteer',
      eventBadgeText: 'Волонтёр',
      
      // Официальные ресурсы мероприятия
      officialLinks: [
        {
          url: 'https://vk.com/foxwood',
          icon: 'vk',
          text: 'Группа ВКонтакте'
        }
      ],
      
      // Ключевые особенности мероприятия
      featuresTitle: 'Что было на мероприятии:',
      features: [
        {
          title: 'Атмосфера 2000-х',
          description: 'Тематическая подача мероприятия ощущалась на каждом шагу — от музыкального оформления до формата игр, декораций и костюмов участников. Это действительно вызывало тёплые воспоминания и добавляло шарма.',
          icon: 'users'
        },
        {
          title: 'Настоящее сообщество',
          description: 'Сбор команд, командные игры, вечера знакомств, возможность свободного общения, фотосессии с плюшками и атмосфера доброжелательности способствовали появлению новых знакомств и чувству «своих братков 2000х».',
          icon: 'hotel'
        },
        {
          title: 'Продуманная программа',
          description: 'Днём — квесты, турниры, арт-мероприятия и спортивные активности. Вечером и ночью — концерты, вечеринки, конкурсы и даже "Фабрика звёзд" и "Острый Блейзер".',
          icon: 'food'
        },
        {
          title: 'Полноценное питание',
          description: 'Три приёма пищи в день + возможность отдохнуть в лаунж-зоне или сходить в бар — это важно, особенно при насыщенном расписании.',
          icon: 'spa'
        }
      ],
      
      // Новые знакомства и встречи
      friendsTitle: 'Знакомства на коне:',
      friends: [
        {
          name: 'Вольти',
          description: 'давний знакомый, с которым раньше общались, и тут вдруг неожиданно пересеклись',
          icon: 'fox',
          image: 'https://sun9-55.userapi.com/impg/qniBv4-8XfsXyZrRC0pK7nEnmlUTUTgYXg-Jew/X3E22wmMVcM.jpg?size=1280x960&quality=95&sign=fef0a84e55fd5b6de741aaf01fdcbd79&type=album',
        },
        {
          name: 'jaden',
          description: 'парень моего друга Гудвина, с которым я познакомился на прошлом мероприятии, оказался очень душевным и весёлым',
          icon: 'hyena',
          image: 'https://sun9-70.userapi.com/impg/oxFDm2iaS9JdiozsBy_nwC_jiTV4IvbXKZHFkQ/qCZUqT5_5rI.jpg?size=1620x2160&quality=95&sign=449278a055f83b14a7ca379a1f7e736d&type=album',
        },
        {
          name: 'Lucky Times',
          description: 'Мой персональный фотограф на весь фоксвуд, милый и общительный, обожаю его!',
          icon: 'goat',
          image: 'https://sun9-66.userapi.com/impg/h8iNWBHAUdMoXgS_QTew0wCYajuXQMPXfyci6g/p85gw3A92eU.jpg?size=640x640&quality=95&sign=be2ab01878f44f5b4a29a6c44ca986eb&type=album',
        },
        {
          name: 'Lapsha',
          description: 'общительный, кофеман, старый знакомый, с которым приятно пересечься снова',
          icon: 'fox',
          image: 'https://sun9-75.userapi.com/impg/mVupAjJO6adtyZFWDNFurl2f8jlwUiHfwb93KA/bP7-m8KhaQo.jpg?size=640x640&quality=95&sign=b83caa68327e8ae15eb291ef9b787d6d&type=album',
        },
        {
          name: 'Felix',
          description: 'милый пёсель, недавно получивший фурсьют, но уже танцует как профи, танцевал со мной очень красиво и уверенно, будто мы тренировались заранее',
          icon: 'dog',
          image: 'https://sun9-78.userapi.com/impg/DtYlUK5Se_wek9HK0lnFtIdedhsuWKX2IeknLQ/0awNLAD9Jzk.jpg?size=960x1280&quality=95&sign=7db439a866ccf3a8fca762b8bf966753&type=album',
        },
        {
          name: 'Ёся',
          description: 'милый волчик, всегда напрашивается на обнимашки, невозможно устоять!',
          icon: 'woolf',
          image: 'https://sun9-28.userapi.com/impg/35lN8yb_9n-O0AGOesWB03N4ciSSeqmcxrpvZA/3MT-auZaGkE.jpg?size=1620x2160&quality=95&sign=fb9db0a64cb365277214253d7c2fc2b4&type=album',
        },
        {
          name: 'Yang fox',
          description: 'вместе снимали TikTok-и прямо во время мероприятия, тусили, шутили и просто проводили классное время',
          icon: 'fox',
          image: 'https://sun9-36.userapi.com/impg/gJBuriFZFLBHVRXmwzl5X-UVklZRUt_GwKLOkA/zbN9K2QsJjk.jpg?size=960x1280&quality=95&sign=330863ee2936c8491cb03b01b4de7cb7&type=album',
        },
        {
          name: 'Лайкед',
          description: 'Легенда и душа компании, вместе играли в UNO с его парнем Yang fox',
          icon: 'wolf',
          image: 'https://sun9-33.userapi.com/impg/leCv-QnbrI1O6HCM5zfRqFrmpv7bFqb1bRc4ew/dUETBUqRyfQ.jpg?size=2560x1183&quality=95&sign=3102a79a8a657032236b2c969beeb3bd&type=album',
        },
        {
          name: 'Rem',
          description: 'Акула, которая в бассейне словно дома, плывёт как по волшебству',
          icon: 'shark',
          image: 'https://sun9-24.userapi.com/impg/UERlKnrUq-5hrLRJRo84mX0N5qrB4mxXYiaq4Q/qyHHoJmqB9c.jpg?size=1442x2160&quality=95&sign=abcd77b0ce8e927aa8b9f0f787d6dce3&type=album',
        },
        {
          name: 'Zurya Aoki',
          description: 'харизматичный и яркий персонаж, с невероятной энергетикой, всегда с шуткой на готове, поднимал настроение всем вокруг',
          icon: 'lynx',
          image: 'https://sun9-41.userapi.com/impg/pImHVWco9bQ5E-s3TquuJuzuHCvxVDEKkslG7w/3823vtUbze8.jpg?size=1620x2160&quality=95&sign=6f272634aa59ccea0a2392dc888bfde7&type=album',
        }
      ],
      
      // Коллекция фотографий с мероприятия (обширная галерея)
      galleryImages: [
        { src: 'https://sun9-80.userapi.com/impg/xhMjBPHdLKVOh8DceqjNDeeO7zgZv4WodMgrvg/_7KU9tlUuaY.jpg?size=960x1280&quality=95&sign=bfcb30d4e5405f5ff5a6fc0bfe0e205b&type=album', alt: 'Мордаха' },
        { src: 'https://sun9-74.userapi.com/impg/Dl_1n4Iptr07KPzX-9CUVrMU9pUVVZrLuIi3Sw/ks9C5NVTvAY.jpg?size=1442x2160&quality=95&sign=0defc459cfa429f1005e0c366a503146&type=album', alt: 'Спа с ремом' },
        { src: 'https://sun9-15.userapi.com/impg/cb2n7mflm45O-tUK3wwVAIOmqLxnAp3-ytxl3w/Wqan3aDLmT4.jpg?size=2560x1706&quality=95&sign=7bac7e9497e2e59eb9eade0e985d4941&type=album', alt: 'Спа' },
        { src: 'https://sun9-24.userapi.com/impg/UERlKnrUq-5hrLRJRo84mX0N5qrB4mxXYiaq4Q/qyHHoJmqB9c.jpg?size=1442x2160&quality=95&sign=abcd77b0ce8e927aa8b9f0f787d6dce3&type=album', alt: 'Спа' },
        { src: 'https://sun9-59.userapi.com/impg/_MZuCYi1V_o2cJ20rIUA5iEkJL9TzI9Lr8loiQ/7s_A65vxEDY.jpg?size=1620x2160&quality=95&sign=8b8668fbeac7a8a98180b9d09fd69daf&type=album', alt: 'Спа' },
        { src: 'https://sun9-16.userapi.com/impg/eiL2C2p-ABLHiA6HULWgetAGIK8Ou9JWhdvy-w/vxd9ARc0Q1k.jpg?size=1442x2160&quality=95&sign=0a0f11daa07f7ea76be8fee82a8d6efc&type=album', alt: 'Спа' },
        { src: 'https://sun9-44.userapi.com/impg/wxYllln3dd_aCGFqXKURjbM-w_5ybhJgPGgnrA/koAEakkfUCw.jpg?size=2560x1709&quality=95&sign=29f327b7710bb1b7bde037a8fc32f9ca&type=album', alt: 'Селфи с янгом' },
        { src: 'https://sun9-50.userapi.com/impg/gR4K78Jz15RQmLnu3JGkedJnscWpVOmSwdZNPA/mO7D0dRCpsw.jpg?size=1442x2160&quality=95&sign=4fe470dd5b925750bda5e9bf451c0c1c&type=album', alt: 'Селфи с рысью' },
        { src: 'https://sun9-61.userapi.com/impg/k3OmVmFL9Ga0n4OGE4_9w0_1zQYE4B8X2UvwrQ/hjCeIqMhN2k.jpg?size=2560x2438&quality=95&sign=b954acd50a1ee567d440b2b8f106c308&type=album', alt: 'Смешарик' },
        { src: 'https://sun9-72.userapi.com/impg/UGENBp5GNl7tt7EocaQYD2t2DfYTsH3VQfXW9A/jtQJNraGRtY.jpg?size=2560x2438&quality=95&sign=f876242995ba2f72d6dc1a05704b2053&type=album', alt: 'Смешарик и рем' },
        { src: 'https://sun9-70.userapi.com/impg/GiIC4p1bhFRaXoZK0nyaKvxe9FjBnI64tWJ_xg/Mv0DlR3mMRY.jpg?size=2560x2438&quality=95&sign=b9cbf954eaa9dde70e742c0447f2e0a6&type=album', alt: 'Видишь мой глаз?' },
        { src: 'https://sun9-8.userapi.com/impg/Td3u8iuYjPlvWvk_cQMjOBSINu2tC_Az7MHI-w/VL5tFCeoxqI.jpg?size=2560x2438&quality=95&sign=a33a6920914c1dc132e8ae2eb042a2c2&type=album', alt: 'Пузо' },
        { src: 'https://sun9-16.userapi.com/impg/JoCK7oNQ2eHoN3kXpjzN0mdB2e6qq0nn7fXkrg/NxREaUNz4qI.jpg?size=2560x2438&quality=95&sign=655c9a7b40705c2adc850af3bb56f203&type=album', alt: 'пов рост 160' },
        { src: 'https://sun9-36.userapi.com/impg/Nb11QeWonD2JM1FTSEnIMT2dK-TaXk-oXx8M1Q/gFB0_ukxr0Q.jpg?size=1280x960&quality=95&sign=f59380a8831093364f70b881b54e1979&type=album', alt: 'Сеофи с Вольти' },
        { src: 'https://sun9-49.userapi.com/impg/qULCkl9u3lNjwywszxM9m06mK6HPCeWFdT6X5w/aDG0Pfy2XaY.jpg?size=960x1280&quality=95&sign=cf6ed0e0da4c8105ec6e341a9ee6d41e&type=album', alt: 'Зажигаем на танц поле' },
        { src: 'https://sun9-68.userapi.com/impg/Tw6bdhluyl0pDs2wp_3Ej8yZ6Qc4pPA8Sa8hlQ/t3AvSJ7yYvg.jpg?size=960x1280&quality=95&sign=b0a1642c61fa3e3632a08eaf03785137&type=album', alt: 'Обнимашки' },
        { src: 'https://sun9-79.userapi.com/impg/Ry3YDUYDiF77OPATkZPE0yELfOsxbveILAL9UQ/FPBpOXXKLcM.jpg?size=2560x1920&quality=95&sign=720da30277ad931b580716400cecfb5c&type=album', alt: 'Фоточка' },
        { src: 'https://sun9-77.userapi.com/impg/D0Dg5-kUMjIgw8ek9KQfJWfimQCZl2-PLrh04A/N_E1riES5_E.jpg?size=1620x2160&quality=95&sign=ab7b003d8d923f546b0ef80336e09be1&type=album', alt: 'Наш номер' },
        { src: 'https://sun9-62.userapi.com/impg/pXWB1ePlehqWasoe4VLxd0UrcfrufI8Bc1ERsw/vsYtsaMGZmE.jpg?size=998x2160&quality=95&sign=844d5eb4c6c629587436dfbfb88ec6c5&type=album', alt: 'Заезд' },
        { src: 'https://sun9-22.userapi.com/impg/ZUozd9sh_uRny1XuSScieECer7A49ky0R8KGHw/c3cWeaz_cHg.jpg?size=2560x1920&quality=95&sign=559708a9f1655af127402203180a5344&type=album', alt: 'Кавоши' },
        { src: 'https://sun9-39.userapi.com/impg/QcJrrKIzWJyDbS9IILU6xuz95zPr_wesUmy8tQ/eFlcbnC2lYA.jpg?size=2560x1920&quality=95&sign=977f24ecf08fafdea475b89d144db7fb&type=album', alt: '2 Кавоши' },
        { src: 'https://sun9-42.userapi.com/impg/43wifGod1HMK88tfQqszEJXMxZfVaIRbpAfM2A/CVxMJjP5S8Q.jpg?size=1620x2160&quality=95&sign=7554cc75bc3a1a8f6bb0a8b428ec79cd&type=album', alt: 'Ручной Кавоши' },
        { src: 'https://sun9-78.userapi.com/impg/HNdeuyR6lt2buIONSQBIEVJJiLx8Hql3wRB8dw/OYlPtxqT1rQ.jpg?size=1620x2160&quality=95&sign=620894c538190228576f8e6ad334e092&type=album', alt: 'Режим спектора' },
        { src: 'https://sun9-1.userapi.com/impg/m9xv2SSqxOg8McTfkVb6DSBq8d5NFccO1_0qSA/rSgc78uygrE.jpg?size=2560x1718&quality=95&sign=ef390edfcb9c43dca9e09a19a92b61e2&type=album', alt: 'Кладбище домашних животных' },
        { src: 'https://sun9-23.userapi.com/impg/UKxHf1c-XMxymep75w8AJ_Cu4dQvFtgoDWqJdw/O8SA_6XZfxo.jpg?size=2560x1920&quality=95&sign=91116e933384334f57bf981293be4969&type=album', alt: 'Кладбище домашних животных' },
        { src: 'https://sun9-58.userapi.com/impg/Gzq5bekkKWkAC4k48GUG5nIjDnqDdyUsYPdcHw/ZA7lLikhvh0.jpg?size=2560x1183&quality=95&sign=993221eba31815ba57ecc6523c22a3c7&type=album', alt: 'Зажали оленя' },
        { src: 'https://sun9-17.userapi.com/impg/lk71Qh61_-hTkz08KO-Gqcr3330JcqnkxaZu8A/Ihm9hvxwsZY.jpg?size=2560x1183&quality=95&sign=9fc717c745b10b7150c7865ce9587ac9&type=album', alt: 'Селфи с Лайкедам' },
        { src: 'https://sun9-62.userapi.com/impg/qAidlyD1epvmlPLlDTfbxZzR8sEnWehEP1wNsw/ZFYDVDqIdpw.jpg?size=1620x2160&quality=95&sign=1374a6332a1bb9266e4912678623da80&type=album', alt: 'Феликс' },
        { src: 'https://sun9-75.userapi.com/impg/W5DpFsPp_G_02XrkI1Q1WXtc6jWhgXxmJUFltA/N-xX-8qbKLM.jpg?size=1620x2160&quality=95&sign=12233bf5940fbf571dd9de99314c8c0f&type=album', alt: 'Прогулка пушистиков' },
        { src: 'https://sun9-63.userapi.com/impg/Juln3IxQrIlaN4EH5KSpwvlTgNoX4rvZrpsYNg/VfPh6iNcm_Y.jpg?size=1620x2160&quality=95&sign=ffda202492159b604ed8b6b2e65bacd4&type=album', alt: 'Прогулка пушистиков' },
        { src: 'https://sun9-70.userapi.com/impg/oxFDm2iaS9JdiozsBy_nwC_jiTV4IvbXKZHFkQ/qCZUqT5_5rI.jpg?size=1620x2160&quality=95&sign=449278a055f83b14a7ca379a1f7e736d&type=album', alt: 'Прогулка пушистиков' },
        { src: 'https://sun9-6.userapi.com/impg/YwltKD86OYWdawfu552e48RrVhwJd2GkUfH3ww/FXcwpsh1bkw.jpg?size=1620x2160&quality=95&sign=ae4ad31d6786fa46ef0edfd004afda0f&type=album', alt: 'Прогулка пушистиков' },
        { src: 'https://sun9-26.userapi.com/impg/CsbnXA6pTlC-K2j27HjPd1_iq18yGEwbSi0tqw/vM_FzQjTvCQ.jpg?size=1620x2160&quality=95&sign=8264f2fac86c867315ce576e03069c31&type=album', alt: 'Прогулка пушистиков' },
        { src: 'https://sun9-37.userapi.com/impg/gWN5pEtGYzXXWNbe82ucEcORj8NOSAASQY4Uvw/XX_K4NGxZz4.jpg?size=1620x2160&quality=95&sign=f51983864abf683851b2e9e7fe5ab79c&type=album', alt: 'Прогулка пушистиков' },
        { src: 'https://sun9-14.userapi.com/impg/ljKlrSAEr7L6lAaZBD7Te3RtwJCExuI-4IWRAA/SbFElPpaOrg.jpg?size=1620x2160&quality=95&sign=37ce9ed6fd5f39c29e603ebe8530de70&type=album', alt: 'Прогулка пушистиков' },
        { src: 'https://sun9-75.userapi.com/impg/pjjT6zo2f2gk3eb2TWL9AkT1PPZheWVH_E4MUQ/Gbp-qyL8oe0.jpg?size=1620x2160&quality=95&sign=b2b0bd0c20bedba6a2a38d6e5ae60251&type=album', alt: 'Прогулка пушистиков' },
        { src: 'https://sun9-30.userapi.com/impg/P1iLCaQzuSUB-K2hnA1C49kB7aExDY2PMZqFEw/acsnq4WTdCk.jpg?size=1620x2160&quality=95&sign=82c7ed0d476fb72d91ac1a54ee83dc14&type=album', alt: 'Прогулка пушистиков с зурей' },
        { src: 'https://sun9-48.userapi.com/impg/31f3KHEqYkT9J7GVdJGG2ifus8yOcacI838g-A/86nRl924KL0.jpg?size=1620x2160&quality=95&sign=c9be895e16dcbb1d8d63cbc67f538a0c&type=album', alt: 'Прогулка пушистиков с зурей' },
        { src: 'https://sun9-47.userapi.com/impg/tNNaEWp1J75Z2vh78eD8myhDW7pSE7HVXZ74Dg/dGujkimQv1M.jpg?size=1620x2160&quality=95&sign=43cf9e42911d4eef57225f6a49101b90&type=album', alt: 'Прогулка пушистиков' },
        { src: 'https://sun9-24.userapi.com/impg/sK_rgFhzTJ_anlrSm94auNYvxaxsuo_Er4mXdA/3gXo6QIceB4.jpg?size=1620x2160&quality=95&sign=b5db79ff67fb426382b8ec9a5609b352&type=album', alt: 'Прогулка пушистиков с гудвином' },
        { src: 'https://sun9-49.userapi.com/impg/PPvCHnqUZnT5VqKmeBQXVUwSAMjymUP6xJMLnQ/_IPIlFKDKfg.jpg?size=1620x2160&quality=95&sign=3693dd89995a1f35fd3cf118c7ea2ba1&type=album', alt: 'Прогулка пушистиков с гудвином' },
        { src: 'https://sun9-2.userapi.com/impg/vByi_t8wvEAd5q0qn83X7kXo-W7dLM5v9S0qpQ/ChbKDoRhReM.jpg?size=1620x2160&quality=95&sign=3e6bf2317720ee24f0b062a0d3b3e07b&type=album', alt: 'Прогулка пушистиков' },
        { src: 'https://sun9-22.userapi.com/impg/9ctM0Z-UvLVU1DgwyDEHovHSMz3UMoqQgmzLLQ/RGqLtNST99Y.jpg?size=1620x2160&quality=95&sign=f28408b9791b8a860e46bec7fd0ebe54&type=album', alt: 'Прогулка пушистиков НА месте' },
        { src: 'https://sun9-14.userapi.com/impg/48ozjF-nq3l0u0Qu7TlZS8voKYEjUs9sUJ4iCA/u_7w3E7aDes.jpg?size=2560x1920&quality=95&sign=4b613cd44cadde838dd84709e5106229&type=album', alt: 'Прогулка пушистиков' },
        { src: 'https://sun9-19.userapi.com/impg/B1GPIbmAeI0Rvo6SnflxGxea5CWg1hj6350HoA/CpYxZMPQHOQ.jpg?size=1620x2160&quality=95&sign=52b45ca6be4379ed0f466d081034a5f9&type=album', alt: 'Прогулка пушистиков с яном' },
        { src: 'https://sun9-74.userapi.com/impg/6sOrvwWWb4cJWqJSHSyqkRJ_ID13GNe-CfHsfA/-LuMkQA4vkM.jpg?size=1620x2160&quality=95&sign=ffc99cf41edb6cf26b1fd421af00453e&type=album', alt: 'Прогулка пушистиков' },
        { src: 'https://sun9-48.userapi.com/impg/0dd7X5G-q-QXCoat0X8p7KBY_Y7J2S8ewm0ScA/i76az4_eOEQ.jpg?size=1620x2160&quality=95&sign=01901c38651cd870ead4ebef4fadf8c2&type=album', alt: 'Прогулка пушистиков с братом' },
        { src: 'https://sun9-79.userapi.com/impg/BOLwnfOhtmDKe6gnxaFFnK67hshe_DomoiiglQ/lA6ephEh_PY.jpg?size=2560x1920&quality=95&sign=48f6434fcb69a7061c8bc325a1d9c70d&type=album', alt: 'Прогулка пушистиков' },
        { src: 'https://sun9-36.userapi.com/impg/gJBuriFZFLBHVRXmwzl5X-UVklZRUt_GwKLOkA/zbN9K2QsJjk.jpg?size=960x1280&quality=95&sign=330863ee2936c8491cb03b01b4de7cb7&type=album', alt: 'Семки есть?' },
        { src: 'https://sun9-2.userapi.com/impg/e6iP3N8deRB53v_1EZLF0Lk4eyS-Qc2qySZvgA/7jkoefY3jgQ.jpg?size=1401x2160&quality=95&sign=26ecc0b182fecd6b7b9ce148911179da&type=album', alt: 'Семки есть?' },
        { src: 'https://sun9-15.userapi.com/impg/MRHEWr9aY1iHomgSn4DRSFwcv60EdnbADRp8Cw/Qm35uEzZ8wk.jpg?size=960x1280&quality=95&sign=a088ca85154bad7a0a27e1380fca238e&type=album', alt: 'Бугага' },
        { src: 'https://sun9-53.userapi.com/impg/4GDJeBIikLbrNnrTNlgpz7gJ2AURMMcDGvu5SQ/y1hAWSzB8mI.jpg?size=960x1280&quality=95&sign=d189c62947587541fe76d1c7af8291d5&type=album', alt: 'селфи с феликсом' },
        { src: 'https://sun9-50.userapi.com/impg/5iy95OwlAzXlcroe6l_mgUSz_WXaeM1j4A0GYg/T_MKUtoyPuk.jpg?size=2560x1928&quality=95&sign=808035378f0d8274376cd313473d6023&type=album', alt: 'Фотография всех' },
        { src: 'https://sun9-4.userapi.com/impg/06GuIz91p0RfWHNKp8UvxH0WawTDdZVkRx1hMA/jZp8p5HWAA0.jpg?size=2560x1928&quality=95&sign=cf5979c592cea438889d4224094953fd&type=album', alt: 'Фотография всех' },
        { src: 'https://sun9-50.userapi.com/impg/5iy95OwlAzXlcroe6l_mgUSz_WXaeM1j4A0GYg/jzuWfk1R6gE.jpg?size=2560x1928&quality=95&sign=65752ca7d4fe72d197c781ab9f5dfe58&type=album', alt: 'Фотография всех' },
        { src: 'https://sun9-13.userapi.com/impg/O1oaedZo5tzzOgp0Dy_nUXS5cFh0sMOGLK4zig/E2kcFFSPZzQ.jpg?size=1620x2160&quality=95&sign=0fe9ba0f62bfba0f74c5eac4ac3a347f&type=album', alt: 'Тэффи' },
        { src: 'https://sun9-1.userapi.com/impg/Qd1076sPYuiNTNEcqWlkPY_kEuV1Yw0dYO1Hkw/Set8XRvQw5c.jpg?size=1620x2160&quality=95&sign=5038a95da6bc91340896d638a37048b8&type=album', alt: 'Взгляд в будущее' },
        { src: 'https://sun9-6.userapi.com/impg/ZKwT6rxrzg6lIRoiCuOsXqas5M9P5TYEE_GUFg/Y73F0UuRWdc.jpg?size=1620x2160&quality=95&sign=f06f02e1e3b48e29f66a4c538b89029c&type=album', alt: 'Селфи' },
        { src: 'https://sun9-42.userapi.com/impg/6EdYXRx0tK5AkeqJcJSt7BdQe9qbq-hxR-f0jQ/Av8ml4XkR6M.jpg?size=1620x2160&quality=95&sign=2fb0e995f8b132e8273490667fb40689&type=album', alt: 'Селфи' },
        { src: 'https://sun9-63.userapi.com/impg/HgHB3yVMlbPwXcZP_6KfklEm3CPaZmJD7SRgqQ/H0FiUdnA0XE.jpg?size=1620x2160&quality=95&sign=9f4fb1a5554f984cc2d8ff7272669f82&type=album', alt: 'Селфи' },
        { src: 'https://sun9-35.userapi.com/impg/25LZfxMUU8GrWaixHCzolQj7GeIEbKbpjlOvKA/uLVT21CQZvY.jpg?size=1620x2160&quality=95&sign=01be28976e747877ace84c7802002b9c&type=album', alt: 'Селфи' },
        { src: 'https://sun9-21.userapi.com/impg/PrYxEaxB-YkL_HdKwyjirMmBITYymdWIn6khGw/oKlXxGj9Pws.jpg?size=1620x2160&quality=95&sign=c9acc091a5bb30e61ee598847f269de9&type=album', alt: 'Селфи' },
        { src: 'https://sun9-23.userapi.com/impg/swGZX4Xr1MMGg4TLYdCz8wrWpN_wSSOiFG2kwA/6Q_6d-6uu8A.jpg?size=1390x2160&quality=95&sign=050eda0d92d831a863dab6c0e23f64c4&type=album', alt: 'Селфи' },
        { src: 'https://sun9-62.userapi.com/impg/Af0kB6Yr4NuV9f13tX_l4QKeaMav-5qy7JoIjg/LPfgjgaKh2M.jpg?size=1543x2160&quality=95&sign=a90313e5764e87bdac9788778ef5759d&type=album', alt: 'Селфи' },
        { src: 'https://sun9-63.userapi.com/impg/rqxFNCp0D-fhmdZe9drXu7X0zc_puVbm9YM4Kw/97degHF83v0.jpg?size=1367x2160&quality=95&sign=91881e608a2ce8b1778ba466260f3dbf&type=album', alt: 'Селфи' },
        { src: 'https://sun9-42.userapi.com/impg/yiHIUGuDZzLPDf2CGN5z9KS260rHg4V4BmweUA/vIw4CB_3RXA.jpg?size=1620x2160&quality=95&sign=16ebf189cb72b2ac4b51d41897edf8b9&type=album', alt: 'Больница' }
      ],
      
      // Информация о покупках на мероприятии
      purchasesIntro: 'В первый день, выступая как волонтёр, я помогал с расстановкой столов и проведением ивентов. Потом у меня было время заглянуть на ярмарку и приобрести несколько замечательных вещей у талантливых художников и мастеров.',
      purchases: [
        {
          title: 'Традишка #1',
          author: 'Alna',
          description: 'Традиционный арт моей фурсоны с надписью, нарисованный фломиком.',
          image: 'https://sun9-28.userapi.com/impg/Bl9J3P6nPDbXFwVqws2VNUDr1j6k5Ou3kXbFYw/2vPcXRkbKkE.jpg?size=1620x2160&quality=95&sign=5d6f43c6af2d73c416a20da96d1728ab&type=album',
          price: '2000₽'
        },
        {
          title: 'Традишка #2',
          author: 'Alna',
          description: 'Традиционный арт фурсоны парня, нарисованный фломиком.',
          image: 'https://sun9-2.userapi.com/impg/OPGGKByp6Ygmakd9Ghi521Tt0J9mG1cVZHGwcA/HHRX2gNYAug.jpg?size=1570x2160&quality=95&sign=f8ad0e5343f1c296ceb8fdf57e603dfe&type=album',
          price: '2000₽'
        },
        {
          title: 'Традишка #3',
          author: 'Holt Odium',
          description: 'Традиционный арт моей фурсоны с надписью, нарисованный фломиком.',
          image: 'https://sun9-41.userapi.com/impg/mkoM9eFDC6dnnGn9sw_VxTiv0x7XDUxZeRFJ4w/HOkxoRKN8kc.jpg?size=960x1280&quality=95&sign=8b563d1f594ba6457a38447aa14bbb5a&type=album',
          price: '3000₽'
        },
        {
          title: 'Фотография',
          author: 'Holt-Odium',
          description: 'Фотография всех пушистиков с фоксвуда, в стиле 2000х',
          image: 'https://sun9-64.userapi.com/impg/i3BpQhkbpJcp9buevx3S5yhNl6QWIalzkX9_Gw/RnCXIMq_fUw.jpg?size=2560x1920&quality=95&sign=1e2f9ab392e7d38e9f98b7b3e3e1a1e4&type=album',
          price: '200₽'
        },
        {
          title: 'Тент',
          author: 'FoxWood',
          description: 'Выйграл на аукционе',
          image: 'https://sun9-41.userapi.com/impg/6mDAkKuO0sZ3y1Us8njHpA0bNRushlxx7AIMbQ/rFtXVH42OGI.jpg?size=1280x960&quality=95&sign=db4bbe203facc118def7334f2e762f5d&type=album',
          price: '7000₽'
        },
        {
          title: 'Смазка + значки',
          author: 'Aaron',
          description: 'Купил 4 значка - 2 мне, 2 феликса и смазку для машинного двигателя',
          image: 'https://sun9-64.userapi.com/impg/VjS8IPfpHVtD0_RqDUFAsYiyjuXa2gsOByHQYA/iJnD5M5i4QU.jpg?size=1620x2160&quality=95&sign=65d4e01c60acc0340ad16251e7207d01&type=album',
          price: '1000₽'
        },
        {
          title: 'Футболка',
          author: 'Aaron',
          description: 'Крутой мерч на тему 2000х',
          image: 'https://sun9-21.userapi.com/impg/jHFT-l2z265QZW7NLccDNFemJRiyeeLPovywfg/VdezDIRxQ2I.jpg?size=1620x2160&quality=95&sign=e3e0d329e5ec141cbc0f3d3354ab2a84&type=album',
          price: '1700₽'
        },
        {
          title: 'Футболка',
          author: 'Aaron',
          description: 'Красивая футболка который подарил парню',
          image: 'https://sun9-22.userapi.com/impg/ctDQHvNZ6r1VTez7hoMUH0CtgIOujlKzrVztEw/AebYV17myxI.jpg?size=1620x2160&quality=95&sign=289180feef2ff839dfe0ec33f57b1863&type=album',
          price: '2100₽'
        },
        {
          title: 'Балончик',
          author: 'Орг. Взнос',
          description: 'Нашли среди всех пустых балочиков 2 неиспользованных, повезло-повезло',
          image: 'https://sun9-75.userapi.com/impg/AXRDZEv0eCIa1D08AB6X-xLfaFuFd26iTLCy9Q/5zJN0sP1JeM.jpg?size=1080x1920&quality=95&sign=c6ced87c5534f9f2b45732ad750f44fd&type=album',
          price: 'Подарок'
        },
        {
          title: 'Бейджик',
          author: 'TiM FoxTail',
          description: 'Подарок от TiM FoxTail',
          image: 'https://sun9-7.userapi.com/impg/oveWt85Q-xFDyZbwdqNzxv2y95Jc3bEy2GN74g/k3EblPNkGvI.jpg?size=1620x2160&quality=95&sign=0131177fe7e8eafe66823659df7066b5&type=album',
          price: 'Подарок'
        }
      ],
      
      // Личные впечатления и эмоциональный опыт
      impressionsIntro: 'Это был один из лучших моментов моей жизни. Я хочу пережить это снова. Смех, музыка, танцы до утра. Эти моменты останутся в сердце навсегда. Уютные вечера в фурлаунже, где каждый мог почувствовать себя как дома. Наблюдать за тем, как друзья радуются подаркам, было бесценно. Каждое "привет!", каждый взгляд, каждое объятие — как глоток чистого воздуха. Это было волшебно. Это было по-настоящему. Я вернусь. Обязательно вернусь. И привезу новых друзей.',
      
      // Детализированная система оценок
      ratingCategories: [
        { name: 'Организация', rating: 5 },
        { name: 'Программа', rating: 5 },
        { name: 'Атмосфера', rating: 5 },
        { name: 'Локация', rating: 5 },
        { name: 'Участники', rating: 5 }
      ],
      
      // Критический анализ мероприятия
      likes: [
        'Организаторы вложили максимум усилий, чтобы всё прошло идеально',
        'Насыщенная программа с множеством игр и конкурсов',
        'Отличная атмосфера ностальгии по 2000-м',
        'Удобное размещение в комфортном отеле'
      ],
      
      dislikes: [
        'Минусов не обнаружено',
        'Организаторы предусмотрели всё до мелочей'
      ],
      
      // Итоговые размышления
      conclusion: 'Организаторы сделали всё на топовом уровне, они вкладывались по максимуму, чтобы всё прошло идеально для всех участников. Они постоянно работали, бегали туда-сюда, и в результате всё действительно прошло безупречно. Никаких проблем не возникло, всё было организовано настолько хорошо, что моя личная оценка — 1000 из 10!'
    }
  },
  computed: {
    /**
     * Автоматически вычисляет среднюю оценку мероприятия
     * на основе всех категорий рейтинга
     */
    overallRating() {
      if (this.ratingCategories.length === 0) return 0;
      const sum = this.ratingCategories.reduce((total, category) => total + category.rating, 0);
      return Math.round((sum / this.ratingCategories.length) * 10) / 10;
    }
  },
  mounted() {
    // Инициализация системы времени для панели задач
    this.updateClock();
    setInterval(this.updateClock, 60000);
    
    // SEO-оптимизация: обновляем метатеги для социальных сетей
    this.updatePageMeta();
  },
  methods: {
    /**
     * SEO-оптимизация: динамическое обновление метатегов
     * для корректного отображения в социальных сетях
     */
    updatePageMeta() {
      // Проверяем доступность глобальной функции обновления метатегов
      if (this.$updateMetaTags) {
        this.$updateMetaTags({
          title: `${this.eventName} - Мой опыт посещения | Fox Taffy`,
          description: this.eventDescription.substring(0, 160) + '...',
          image: this.eventBannerImage,
          url: `https://foxtaffy.fun${this.$route.path}`
        });
      }
    },
    
    /**
     * Обновление времени для панели задач в стиле Windows XP
     */
    updateClock() {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      hours = hours < 10 ? '0' + hours : hours;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      this.currentTime = `${hours}:${minutes}`;
    },
    
    /**
     * Маппинг иконок для вкладок навигации
     */
    getTabIcon(iconName) {
      const iconMap = {
        'info': '/wxp_263.ico',
        'photos': '/wxp_37.ico',
        'shopping': '/wxp_226.ico',
        'notepad': '/w2k_info.ico'
      };
      return iconMap[iconName] || '/wxp_3.ico';
    },
    
    /**
     * Маппинг иконок социальных сетей
     */
    getSocialIcon(iconName) {
      const iconMap = {
        'vk': '/vk.png',
      };
      return iconMap[iconName] || '/wxp_18.ico';
    },
    
    /**
     * Маппинг иконок для особенностей мероприятия
     */
    getFeatureIcon(iconName) {
      const iconMap = {
        'users': '/w98_users.ico',
        'hotel': '/wxp_259.ico',
        'food': '/wxp_282.ico',
        'spa': '/w2k_wupdate_1.ico'
      };
      return iconMap[iconName] || '/wxp_3.ico';
    },
    
    /**
     * Навигационные методы в стиле Windows XP браузера
     */
    goHome() {
      this.$router.push('/');
    },
    
    navigateBack() {
      this.$router.push('/');
    },
    
    /**
     * Система навигации по вкладкам с клавиатурной поддержкой
     */
    navigateTab(direction) {
      const tabOrder = ['overview', 'gallery', 'purchases', 'impressions'];
      const currentIndex = tabOrder.indexOf(this.activeTab);
      
      let nextIndex;
      if (direction === 'next' && currentIndex < tabOrder.length - 1) {
        nextIndex = currentIndex + 1;
      } else if (direction === 'prev' && currentIndex > 0) {
        nextIndex = currentIndex - 1;
      } else {
        return;
      }
      
      this.activeTab = tabOrder[nextIndex];
    },
    
    /**
     * Переключение активной вкладки
     */
    setActiveTab(tabId) {
      this.activeTab = tabId;
    },
    
    /**
     * Система управления лайтбоксом для просмотра фотографий
     */
    openPhoto(index) {
      this.currentPhoto = index;
      this.lightboxOpen = true;
    },
    
    closeLightbox() {
      this.lightboxOpen = false;
    },
    
    nextPhoto() {
      if (this.currentPhoto < this.galleryImages.length - 1) {
        this.currentPhoto++;
      }
    },
    
    prevPhoto() {
      if (this.currentPhoto > 0) {
        this.currentPhoto--;
      }
    }
  }
}
</script>
<style scoped>

.fw-winxp-container {
  --xp-blue: #0055EA;
  --xp-blue-light: #2683FF;
  --xp-blue-dark: #0A246A;
  --xp-title-start: #2A77E8;
  --xp-title-end: #2754B7;
  --xp-green: #36AD36;
  --xp-grey: #D4D0C8;
  --xp-grey-light: #ECE9D8;
  --xp-grey-dark: #808080;
  --xp-text: #000000;
}

/* Основной контейнер */
.fw-winxp-container * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Tahoma', 'Arial', sans-serif;
  color: var(--xp-text);
}

.fw-winxp-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Фон Windows XP */
.fw-winxp-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/FoxWood%2Fcover2.png');
  background-size: cover;
  background-position: center;
  z-index: -1;
  opacity: 0.9;
}

/* Окно Windows XP */
.fw-winxp-window {
  margin: auto;
  width: 90%;
  max-width: 1200px;
  height: calc(100vh - 50px);
  background-color: rgba(255, 255, 255, 0.97);
  border: 1px solid var(--xp-grey-dark);
  text-decoration: none;
  color: var(--xp-text);
  border-radius: 3px;
  font-size: 13px;
}

.fw-event-link:hover {
  background-color: var(--xp-grey);
}

.fw-event-link img {
  width: 16px;
  height: 16px;
}

.fw-event-link span {
  color: var(--xp-text);
}

/* Особенности мероприятия */
.fw-features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  padding: 15px;
}

.fw-feature-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background-color: var(--xp-grey-light);
  padding: 12px;
  border-radius: 3px;
  border: 1px solid var(--xp-grey-dark);
}

.fw-feature-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.fw-feature-icon img {
  max-width: 100%;
  max-height: 100%;
}

.fw-feature-content h4 {
  font-size: 14px;
  margin: 0 0 5px 0;
  color: var(--xp-blue-dark);
}

.fw-feature-content p {
  font-size: 12px;
  margin: 0;
  line-height: 1.4;
  color: var(--xp-text);
}

/* Знакомые на мероприятии */
.fw-friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  padding: 15px;
}

.fw-friend-card {
  background-color: var(--xp-grey-light);
  border: 1px solid var(--xp-grey-dark);
  border-radius: 3px;
  overflow: hidden;
}

.fw-friend-card:hover {
  border-color: var(--xp-blue-dark);
  box-shadow: 0 0 5px rgba(0, 85, 234, 0.3);
}

.fw-friend-image {
  height: 120px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fw-friend-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fw-friend-info {
  padding: 10px;
}

.fw-friend-info h4 {
  font-size: 14px;
  margin: 0 0 5px 0;
  color: var(--xp-blue-dark);
}

.fw-friend-info p {
  font-size: 12px;
  margin: 0;
  line-height: 1.4;
  color: var(--xp-text);
}

/* Галерея фотографий */
.fw-gallery-toolbar {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: var(--xp-grey-light);
  border-bottom: 1px solid var(--xp-grey-dark);
}

.fw-gallery-view-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 12px;
  color: var(--xp-text);
}

.fw-gallery-view-btn.fw-active {
  background-color: white;
  border: 1px solid var(--xp-grey-dark);
  border-radius: 3px;
}

.fw-gallery-view-btn:hover:not(.fw-active) {
  border: 1px solid var(--xp-grey-dark);
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 3px;
}

.fw-gallery-view-btn img {
  width: 16px;
  height: 16px;
}

.fw-gallery-view-btn span {
  color: var(--xp-text);
}

.fw-gallery-separator {
  width: 1px;
  height: 24px;
  background-color: var(--xp-grey-dark);
  margin: 0 10px;
}

.fw-gallery-sort {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
}

.fw-gallery-sort span {
  color: var(--xp-text);
}

.fw-gallery-sort select {
  padding: 2px 5px;
  font-size: 12px;
  border: 1px solid var(--xp-grey-dark);
  color: var(--xp-text);
}

.fw-gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  padding: 15px;
}

.fw-gallery-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.fw-gallery-thumbnail {
  width: 100%;
  height: 120px;
  border: 1px solid var(--xp-grey-dark);
  overflow: hidden;
}

.fw-gallery-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.fw-gallery-item:hover .fw-gallery-thumbnail {
  border-color: var(--xp-blue-dark);
}

.fw-gallery-item:hover .fw-gallery-thumbnail img {
  transform: scale(1.05);
}

.fw-gallery-filename {
  font-size: 11px;
  text-align: center;
  margin-top: 5px;
  color: var(--xp-text);
}

/* Лайтбокс для просмотра фотографий */
.fw-photo-lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(3px);
}

.fw-lightbox-content {
  background-color: white;
  border: 1px solid var(--xp-blue-dark);
  border-radius: 3px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fw-lightbox-title {
  background: linear-gradient(to right, var(--xp-title-start), var(--xp-title-end));
  color: white;
  padding: 10px 15px;
  font-weight: bold;
  font-size: 14px;
  position: relative;
}

.fw-lightbox-close {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
}

.fw-lightbox-close:hover {
  background: rgba(255, 0, 0, 0.8);
}

.fw-lightbox-image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  min-height: 400px;
  background-color: #f5f5f5;
  overflow: auto;
}

.fw-lightbox-image-container img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
}

.fw-lightbox-controls {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background-color: var(--xp-grey-light);
  border-top: 1px solid var(--xp-grey-dark);
}

.fw-lightbox-prev,
.fw-lightbox-next {
  background: transparent;
  border: 1px solid var(--xp-grey-dark);
  border-radius: 3px;
  padding: 5px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.fw-lightbox-prev:hover,
.fw-lightbox-next:hover {
  background-color: rgba(255, 255, 255, 0.8);
}

.fw-lightbox-prev:disabled,
.fw-lightbox-next:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.fw-lightbox-prev img,
.fw-lightbox-next img {
  width: 16px;
  height: 16px;
}

.fw-lightbox-count {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: var(--xp-text);
}

/* Покупки в стиле Проводника */
.fw-purchases-explorer {
  display: flex;
  height: 500px;
  border: 1px solid var(--xp-grey-dark);
}

.fw-explorer-sidebar {
  width: 200px;
  background-color: var(--xp-grey-light);
  border-right: 1px solid var(--xp-grey-dark);
  padding: 10px 0;
}

.fw-sidebar-section {
  margin-bottom: 15px;
}

.fw-sidebar-header {
  padding: 5px 10px;
  font-size: 12px;
  font-weight: bold;
  color: var(--xp-blue-dark);
}

.fw-sidebar-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 12px;
  color: var(--xp-text);
}

.fw-sidebar-item.fw-active {
  background-color: #CCE4FF;
}

.fw-sidebar-item img {
  width: 16px;
  height: 16px;
}

.fw-explorer-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.fw-explorer-header {
  padding: 10px;
  background-color: var(--xp-grey-light);
  border-bottom: 1px solid var(--xp-grey-dark);
  display: flex;
  align-items: center;
}

.fw-explorer-path {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--xp-text);
}

.fw-explorer-path img {
  width: 16px;
  height: 16px;
}

.fw-path-separator {
  margin: 0 2px;
  color: var(--xp-text);
}

.fw-purchases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  padding: 15px;
  overflow-y: auto;
  flex-grow: 1;
}

.fw-purchase-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  border: 1px solid transparent;
  padding: 10px;
  cursor: pointer;
}

.fw-purchase-card:hover {
  background-color: #E5F2FF;
  border: 1px solid #84ACDD;
}

.fw-purchase-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 5px;
}

.fw-purchase-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.fw-purchase-image {
  width: 100%;
  height: 120px;
  margin-bottom: 8px;
}

.fw-purchase-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fw-purchase-info {
  width: 100%;
  text-align: center;
}

.fw-purchase-title {
  font-size: 13px;
  font-weight: bold;
  margin-bottom: 5px;
  color: var(--xp-blue-dark);
}

.fw-purchase-author {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 11px;
  color: #808080;
  margin-bottom: 5px;
}

.fw-purchase-author img {
  width: 12px;
  height: 12px;
}

.fw-purchase-desc {
  font-size: 11px;
  margin-bottom: 5px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--xp-text);
}

.fw-purchase-price {
  font-size: 12px;
  font-weight: bold;
  color: #4a831b;
}

.fw-purchases-intro {
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #E5F2FF;
  border: 1px solid #84ACDD;
  border-radius: 3px;
  color: var(--xp-text);
}

/* Впечатления в стиле Блокнота */
.fw-notepad-toolbar {
  background-color: var(--xp-grey-light);
  border-bottom: 1px solid var(--xp-grey-dark);
}

.fw-notepad-menu {
  display: flex;
  padding: 2px 0;
}

.fw-notepad-menu-item {
  padding: 2px 8px;
  font-size: 12px;
  cursor: pointer;
  color: var(--xp-text);
}

.fw-notepad-menu-item:hover {
  background-color: var(--xp-blue-light);
  color: white;
}

.fw-notepad-content {
  background-color: white;
  padding: 15px;
  font-family: 'Lucida Console', monospace;
  font-size: 12px;
  line-height: 1.5;
  overflow-y: auto;
  height: 500px;
}

.fw-impression-text {
  white-space: pre-line;
  color: var(--xp-text);
}

.fw-impression-intro {
  margin-bottom: 20px;
  color: var(--xp-text);
}

.fw-impression-section-title {
  color: var(--xp-blue-dark);
  font-weight: bold;
  margin: 15px 0 10px;
}

.fw-rating-categories {
  margin-bottom: 15px;
}

.fw-rating-category {
  display: flex;
  margin-bottom: 5px;
}

.fw-category-name {
  width: 120px;
  color: var(--xp-text);
}

.fw-category-rating {
  display: flex;
  align-items: center;
}

.fw-star {
  color: #808080;
}

.fw-star.fw-active {
  color: gold;
}

.fw-rating-value {
  margin-left: 10px;
  font-weight: bold;
  color: var(--xp-text);
}

.fw-overall-rating {
  margin-bottom: 15px;
  font-weight: bold;
  color: var(--xp-text);
}

.fw-impression-list {
  list-style-type: none;
  margin: 0 0 15px 0;
  padding: 0;
}

.fw-impression-list li {
  margin-bottom: 5px;
  color: var(--xp-text);
}

.fw-conclusion-text {
  margin-bottom: 15px;
  color: var(--xp-text);
}

/* Адаптивные стили */
@media (max-width: 992px) {
  .fw-winxp-window {
    width: 95%;
  }
  
  .fw-event-hero {
    height: 250px;
  }
  
  .fw-explorer-sidebar {
    width: 160px;
  }
  
  .fw-purchases-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}

@media (max-width: 768px) {
  .fw-winxp-window {
    width: 100%;
    height: auto;
    min-height: calc(100vh - 40px);
    margin: 0;
    border-radius: 0;
  }
  
  .fw-winxp-content {
    max-height: none;
  }
  
  .fw-event-container {
    padding: 10px;
  }
  
  .fw-event-hero {
    height: 200px;
  }
  
  .fw-event-title {
    font-size: 24px;
  }
  
  .fw-event-subtitle {
    font-size: 14px;
  }
  
  /* Улучшенная сетка для информации */
  .fw-event-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  /* Более компактные вкладки */
  .fw-winxp-tabs {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .fw-winxp-tab {
    padding: 6px 10px;
    font-size: 12px;
    margin-bottom: 5px;
  }
  
  /* Адаптивные сетки для разных секций */
  .fw-features-grid,
  .fw-friends-grid,
  .fw-gallery-grid,
  .fw-purchases-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  /* Фиксируем панель задач */
  .fw-winxp-taskbar {
    height: 36px;
  }
  
  /* Уменьшаем иконки и текст на панели задач */
  .fw-start-button {
    padding: 0 5px;
    font-size: 12px;
  }
  
  .fw-start-button img {
    width: 20px;
    height: 20px;
  }
  
  .fw-taskbar-item {
    padding: 0 5px;
    margin: 0 1px;
    height: 28px;
  }
}

/* Еще более мелкие экраны */
@media (max-width: 576px) {
  .fw-winxp-toolbar {
    height: auto;
    flex-wrap: wrap;
    padding: 5px;
  }
  
  .fw-toolbar-btn {
    font-size: 11px;
    padding: 0 5px;
    margin-bottom: 5px;
  }
  
  .fw-address-bar {
    width: 100%;
    margin-top: 5px;
  }
  
  .fw-event-info-grid {
    grid-template-columns: 1fr;
  }
  
  .fw-features-grid,
  .fw-friends-grid,
  .fw-gallery-grid,
  .fw-purchases-grid {
    grid-template-columns: 1fr;
  }
  
  /* Упрощаем заголовок окна */
  .fw-winxp-title-bar {
    padding: 0 4px;
  }
  
  .fw-title-text {
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  /* Улучшаем лайтбокс */
  .fw-lightbox-content {
    width: 95%;
  }
  
  .fw-lightbox-image-container {
    padding: 10px;
  }
  
  /* Упрощаем проводник */
  .fw-purchases-explorer {
    flex-direction: column;
    height: auto;
  }
  
  .fw-explorer-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--xp-grey-dark);
  }
  
  .fw-explorer-content {
    height: 350px;
  }
  
  /* Улучшаем блокнот */
  .fw-notepad-content {
    height: 350px;
    padding: 10px;
  }
  
  /* Не показываем путь в проводнике */
  .fw-explorer-path span:not(:first-child):not(:last-child) {
    display: none;
  }
  
  /* Скрываем текст кнопок и оставляем только иконки */
  .fw-toolbar-btn span {
    display: none;
  }
  
  .fw-toolbar-btn img {
    margin-right: 0;
  }
}

/* Улучшения для очень маленьких экранов */
@media (max-width: 375px) {
  .fw-window-controls button {
    width: 18px;
    height: 18px;
    font-size: 12px;
  }
  
  .fw-title-icon, .fw-title-icon img {
    width: 12px;
    height: 12px;
  }
  
  .fw-event-hero {
    height: 150px;
  }
  
  .fw-event-title {
    font-size: 18px;
  }
  
  .fw-event-subtitle {
    font-size: 12px;
  }
  
  .fw-feature-content h4 {
    font-size: 12px;
  }
  
  .fw-feature-content p {
    font-size: 10px;
  }
  
  /* Дополнительные улучшения */
  .fw-winxp-tabs {
    padding: 5px 5px 0;
  }
  
  .fw-info-label {
    font-size: 10px;
  }
  
  .fw-info-value {
    font-size: 12px;
  }
}

/* Заголовок окна */
.fw-winxp-title-bar {
  height: 30px;
  background: linear-gradient(to right, var(--xp-title-start), var(--xp-title-end));
  display: flex;
  align-items: center;
  padding: 0 8px;
  color: white;
  user-select: none;
}

.fw-title-icon, .fw-title-icon img {
  height: 16px;
  width: 16px;
  margin-right: 5px;
}

.fw-title-text {
  flex-grow: 1;
  font-weight: bold;
  font-size: 12px;
  color: white;
}

.fw-window-controls {
  display: flex;
  gap: 4px;
}

.fw-window-controls button {
  width: 22px;
  height: 22px;
  border: 1px solid transparent;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-weight: bold;
}

.fw-window-controls button:hover {
  border: 1px solid rgba(255, 255, 255, 0.5);
  background-color: rgba(255, 255, 255, 0.2);
}

.fw-window-controls .fw-close-btn:hover {
  background-color: #FF0000;
}

/* Меню окна */
.fw-winxp-menu-bar {
  height: 24px;
  background-color: var(--xp-grey-light);
  display: flex;
  align-items: center;
  padding: 0 8px;
  font-size: 12px;
  border-bottom: 1px solid var(--xp-grey-dark);
}

.fw-menu-item {
  padding: 2px 8px;
  cursor: pointer;
  color: var(--xp-text);
}

.fw-menu-item:hover {
  background-color: var(--xp-blue-light);
  color: white;
}

/* Панель инструментов */
.fw-winxp-toolbar {
  height: 36px;
  background-color: var(--xp-grey-light);
  display: flex;
  align-items: center;
  padding: 0 8px;
  border-bottom: 1px solid var(--xp-grey-dark);
}

.fw-toolbar-btn {
  height: 28px;
  padding: 0 8px;
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: 3px;
  display: flex;
  align-items: center;
  font-size: 12px;
  cursor: pointer;
  color: var(--xp-text);
}

.fw-toolbar-btn:hover {
  border: 1px solid var(--xp-grey-dark);
  background-color: rgba(255, 255, 255, 0.5);
}

.fw-toolbar-btn img {
  width: 20px;
  height: 20px;
  margin-right: 4px;
}

.fw-toolbar-separator {
  width: 1px;
  height: 24px;
  background-color: var(--xp-grey-dark);
  margin: 0 8px;
}

.fw-address-bar {
  flex-grow: 1;
  height: 28px;
  display: flex;
  align-items: center;
  background-color: white;
  border: 1px solid var(--xp-grey-dark);
  padding: 0 4px;
}

.fw-address-label {
  font-size: 12px;
  margin-right: 8px;
  color: var(--xp-text);
}

.fw-address-input {
  flex-grow: 1;
  height: 22px;
  border: none;
  outline: none;
  font-size: 12px;
  background-color: transparent;
  color: var(--xp-text);
}

.fw-address-go-btn {
  width: 50px;
  height: 22px;
  background-color: var(--xp-grey);
  border: 1px solid var(--xp-grey-dark);
  border-radius: 2px;
  font-size: 11px;
  cursor: pointer;
  color: var(--xp-text);
}

/* Контент */
.fw-winxp-content {
  flex-grow: 1;
  overflow-y: auto;
  background-color: white;
  max-height: calc(100vh - 150px); /* Ограничение высоты для скролла */
}

/* Добавляем скроллбар в стиле Windows XP */
.fw-winxp-content::-webkit-scrollbar {
  width: 16px;
}

.fw-winxp-content::-webkit-scrollbar-track {
  background-color: white;
  border-left: 1px solid #CCCCCC;
}

.fw-winxp-content::-webkit-scrollbar-thumb {
  background: var(--xp-grey);
  border: 1px solid var(--xp-grey-dark);
  border-radius: 3px;
}

.fw-winxp-content::-webkit-scrollbar-thumb:hover {
  background: #BBBBBB;
}

/* Панель состояния */
.fw-winxp-statusbar {
  height: 24px;
  background-color: var(--xp-grey-light);
  display: flex;
  align-items: center;
  padding: 0 8px;
  font-size: 11px;
  border-top: 1px solid var(--xp-grey-dark);
}

.fw-status-text {
  flex-grow: 1;
  color: var(--xp-text);
}

.fw-security-zone {
  display: flex;
  align-items: center;
  margin-right: 16px;
}

.fw-security-zone img {
  width: 16px;
  height: 16px;
  margin-right: 4px;
}

.fw-security-zone span {
  color: var(--xp-text);
}

/* Панель задач Windows XP */
.fw-winxp-taskbar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40px;
  background: linear-gradient(to bottom, #2273E5, #235AD9);
  display: flex;
  z-index: 1000;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.5);
}

.fw-start-button {
  height: 100%;
  padding: 0 10px;
  display: flex;
  align-items: center;
  background: linear-gradient(to bottom, #3C993B, #2C7C2B);
  border: none;
  border-radius: 0 10px 10px 0;
  color: white;
  font-weight: bold;
  font-size: 14px;
  box-shadow: 1px 0 2px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}

.fw-start-button:hover {
  background: linear-gradient(to bottom, #4CAF50, #388E3C);
}

.fw-start-button img {
  width: 24px;
  height: 24px;
  margin-right: 4px;
}

.fw-start-button span {
  color: white;
}

.fw-taskbar-items {
  display: flex;
  margin-left: 10px;
  align-items: center;
  flex-grow: 1;
}

.fw-taskbar-item {
  height: 32px;
  padding: 0 10px;
  margin: 0 2px;
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 12px;
  border-radius: 3px;
  cursor: pointer;
  max-width: 200px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.fw-taskbar-item.fw-active {
  background-color: rgba(255, 255, 255, 0.3);
}

.fw-taskbar-item img {
  width: 16px;
  height: 16px;
  margin-right: 6px;
}

.fw-taskbar-item span {
  color: white;
}

.fw-taskbar-tray {
  display: flex;
  align-items: center;
  padding: 0 10px;
}

.fw-tray-time {
  background-color: #1F5BBE;
  border: 1px solid #3883FF;
  border-radius: 3px;
  padding: 2px 8px;
  color: white;
  font-size: 12px;
}

/* Содержимое страницы */
.fw-event-container {
  padding: 20px;
  color: var(--xp-text);
}

/* Героическая секция */
.fw-event-hero {
  position: relative;
  height: 300px;
  overflow: hidden;
  margin-bottom: 20px;
  border: 1px solid var(--xp-grey-dark);
}

.fw-hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.178), rgba(0, 0, 0, 0.9));
  z-index: 1;
}

.fw-hero-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  z-index: 0;
}

.fw-hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  padding: 20px;
}

.fw-back-button {
  position: absolute;
  top: 15px;
  left: 15px;
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 3px;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.fw-back-button:hover {
  background: rgba(0, 0, 0, 0.9);
}

.fw-back-button span {
  color: white;
}

.fw-back-icon {
  width: 16px;
  height: 16px;
}

.fw-event-badges {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 5px 10px;
  border-radius: 3px;
  display: inline-flex;
}

.fw-event-status {
  background: var(--xp-green);
  color: white;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: bold;
}

.fw-event-badge {
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: bold;
  background: #6A6A6A;
  color: white;
}

.fw-event-badge.fw-volunteer {
  background: #9C27B0;
}

.fw-event-title {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 5px 0;
  color: white;
  text-shadow: 0 2px 3px black;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 5px 10px;
  border-radius: 3px;
  display: inline-block;
}

.fw-event-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 3px black;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 5px 10px;
  border-radius: 3px;
  display: inline-block;
}

/* Информация о мероприятии */
.fw-event-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
}

.fw-event-info-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: var(--xp-grey-light);
  padding: 10px;
  border-radius: 3px;
  border: 1px solid var(--xp-grey-dark);
}

.fw-info-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.fw-info-icon img {
  max-width: 100%;
  max-height: 100%;
}

.fw-info-content {
  display: flex;
  flex-direction: column;
}

.fw-info-label {
  font-size: 11px;
  color: #808080;
  margin-bottom: 2px;
}

.fw-info-value {
  font-size: 14px;
  font-weight: bold;
  color: var(--xp-text);
}

/* Вкладки в стиле Windows XP */
.fw-winxp-tabs {
  display: flex;
  background-color: var(--xp-grey-light);
  padding: 10px 10px 0;
  border: 1px solid var(--xp-grey-dark);
  border-bottom: none;
}

.fw-winxp-tab {
  padding: 8px 15px;
  background-color: #EBEBEB;
  border: 1px solid var(--xp-grey-dark);
  border-bottom: none;
  border-radius: 3px 3px 0 0;
  margin-right: 2px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--xp-text);
}

.fw-winxp-tab.fw-active {
  background-color: white;
  border-bottom: 1px solid white;
  position: relative;
  z-index: 2;
}

.fw-winxp-tab img {
  width: 16px;
  height: 16px;
}

.fw-winxp-tab-content {
  border: 1px solid var(--xp-grey-dark);
  background-color: white;
  padding: 15px;
  position: relative;
  z-index: 1;
  margin-bottom: 20px;
}

/* Стили для контентных блоков */
.fw-winxp-content-box {
  margin-bottom: 20px;
  border: 1px solid var(--xp-blue-dark);
  border-radius: 3px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.97);
}

.fw-winxp-content-header {
  background: linear-gradient(to right, var(--xp-title-start), var(--xp-title-end));
  padding: 8px;
  color: white;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.fw-winxp-content-header img {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}

.fw-winxp-content-header h2, 
.fw-winxp-content-header h3 {
  color: white;
  font-size: 14px;
  margin: 0;
}

.fw-winxp-content-body {
  padding: 15px;
  background-color: white;
}

.fw-event-description {
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 15px;
  color: var(--xp-text);
}

/* Ссылки */
.fw-links-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 15px;
}

</style>