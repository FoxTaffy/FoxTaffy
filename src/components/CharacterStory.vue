<template>
    <div class="character-story">
      <!-- Прогресс-бар навигации -->
      <div class="progress-bar" :style="{ width: scrollProgress + '%' }"></div>
      
      <!-- Анимированный фон с частицами -->
      <div class="animated-background">
        <div class="particle" v-for="i in 20" :key="i" :style="getParticleStyle(i)"></div>
      </div>
  
      <!-- Героическая секция с 3D эффектами -->
      <section class="hero-section" ref="heroSection">
        <div class="hero-background">
          <div class="parallax-layer layer-1" ref="parallaxLayer1"></div>
          <div class="parallax-layer layer-2" ref="parallaxLayer2"></div>
          <div class="parallax-layer layer-3" ref="parallaxLayer3"></div>
          <div class="gradient-overlay"></div>
        </div>
        
        <!-- 3D карточка персонажа -->
        <div class="hero-content" @mousemove="handleMouseMove">
          <div class="character-3d-card" ref="card3d" :style="cardStyle">
            <div class="card-inner">
              <h1 class="hero-title glitch" data-text="История Fox Taffy">
                <span class="title-accent">История</span> Fox Taffy
              </h1>
              <p class="hero-subtitle">
                Путь лиса, ставшего частью большой семьи
              </p>
              <div class="hero-stats">
                <div class="stat-item" v-for="(stat, index) in stats" :key="index" :style="{ animationDelay: index * 0.1 + 's' }">
                  <div class="stat-icon">
                    <i :class="stat.icon"></i>
                  </div>
                  <span class="stat-value">{{ stat.value }}</span>
                  <span class="stat-label">{{ stat.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Анимированный индикатор скролла -->
        <div class="scroll-indicator" @click="scrollToContent">
          <div class="mouse">
            <div class="wheel"></div>
          </div>
          <div class="arrows">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </section>
  
      <!-- Секция "О персонаже" с интерактивными элементами -->
      <section class="story-section" id="about">
        <div class="container">
          <div class="section-header" v-scroll-animation>
            <h2 class="section-title magnetic-text">
              <span class="title-accent">О персонаже</span>
              <span class="title-decoration"></span>
            </h2>
          </div>
          
          <div class="story-content-wrapper">
            <!-- Интерактивная биография -->
            <div class="biography-card" v-scroll-animation>
              <div class="bio-content">
                <p class="bio-text highlight-on-hover">
                  Привет! Я <span class="text-accent">Fox Taffy</span> — антропоморфный лис с яркой рыжей шерстью 
                  и характерными зелёными акцентами. Мой путь в фурри-сообществе начался несколько лет назад, 
                  и с тех пор я нашёл не только своё призвание в творчестве, но и встретил самых важных в моей жизни людей.
                </p>
                <p class="bio-text highlight-on-hover">
                  Мой рост <span class="text-accent">177 см</span> позволяет мне чувствовать себя комфортно как в фурсьюте, 
                  так и в повседневной жизни. В свои <span class="text-accent">21 год</span> я успел поучаствовать 
                  во множестве мероприятий, завести друзей по всему миру и создать собственную маленькую, 
                  но очень важную для меня семью.
                </p>
              </div>
              
              <!-- Интерактивные черты характера -->
              <div class="traits-showcase">
                <h3 class="traits-title">Мои черты характера</h3>
                <div class="traits-carousel">
                  <div class="trait-card" v-for="(trait, index) in characterTraits" :key="index" 
                       @click="selectTrait(index)" 
                       :class="{ active: selectedTrait === index }">
                    <div class="trait-icon-wrapper">
                      <i :class="trait.icon"></i>
                    </div>
                    <h4>{{ trait.name }}</h4>
                    <p>{{ trait.description }}</p>
                    <div class="trait-progress">
                      <div class="progress-fill" :style="{ width: trait.level + '%' }"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 3D модель персонажа -->
            <div class="character-showcase" v-scroll-animation>
              <div class="showcase-container" @mouseenter="startRotation" @mouseleave="stopRotation">
                <div class="character-model" :style="{ transform: `rotateY(${modelRotation}deg)` }">
                  <img src="https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/reference.png" 
                       alt="Fox Taffy" 
                       class="model-image">
                  <div class="model-glow"></div>
                  <div class="model-particles">
                    <span v-for="i in 10" :key="i" class="particle-small"></span>
                  </div>
                </div>
                <div class="showcase-info">
                  <button class="info-button" @click="toggleInfo">
                    <i class="fas fa-info-circle"></i>
                    Детали персонажа
                  </button>
                  <transition name="slide-fade">
                    <div v-if="showCharacterInfo" class="character-details">
                      <div class="detail-item" v-for="(detail, index) in characterDetails" :key="index">
                        <span class="detail-label">{{ detail.label }}:</span>
                        <span class="detail-value">{{ detail.value }}</span>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- Интерактивная история с Феликсом -->
      <section class="felix-section" id="felix">
        <div class="container">
          <div class="felix-header" v-scroll-animation>
            <h2 class="section-title love-title">
              <i class="fas fa-heart pulse-heart"></i>
              История любви: Феликс
              <i class="fas fa-heart pulse-heart"></i>
            </h2>
            <p class="section-subtitle">Как две половинки нашли друг друга</p>
          </div>
          
          <!-- Интерактивная временная линия -->
          <div class="love-timeline">
            <div class="timeline-progress" :style="{ height: timelineProgress + '%' }"></div>
            
            <!-- Точки на временной линии -->
            <div class="timeline-point" 
                 v-for="(event, index) in loveStoryEvents" 
                 :key="index"
                 :class="{ active: activeEvent >= index, current: activeEvent === index }"
                 @click="setActiveEvent(index)"
                 :style="{ top: (index * 25) + '%' }">
              <div class="point-marker">
                <i :class="event.icon"></i>
              </div>
              <div class="point-content">
                <h3>{{ event.title }}</h3>
                <span class="event-date">{{ event.date }}</span>
              </div>
            </div>
            
            <!-- Детальное описание события -->
            <transition name="fade-slide" mode="out-in">
              <div class="event-details" :key="activeEvent">
                <div class="details-card">
                  <div class="card-header">
                    <div class="header-icon">
                      <i :class="loveStoryEvents[activeEvent].icon"></i>
                    </div>
                    <div class="header-content">
                      <h3>{{ loveStoryEvents[activeEvent].title }}</h3>
                      <p class="event-date">{{ loveStoryEvents[activeEvent].date }}</p>
                    </div>
                  </div>
                  <div class="card-body">
                    <p>{{ loveStoryEvents[activeEvent].description }}</p>
                    <div v-if="loveStoryEvents[activeEvent].image" class="event-image">
                      <img :src="loveStoryEvents[activeEvent].image" :alt="loveStoryEvents[activeEvent].title">
                      <div class="image-overlay">
                        <i class="fas fa-search-plus"></i>
                      </div>
                    </div>
                    <blockquote v-if="loveStoryEvents[activeEvent].quote" class="event-quote">
                      <i class="fas fa-quote-left"></i>
                      <p>{{ loveStoryEvents[activeEvent].quote }}</p>
                      <i class="fas fa-quote-right"></i>
                    </blockquote>
                  </div>
                  <div class="card-navigation">
                    <button @click="previousEvent" :disabled="activeEvent === 0" class="nav-btn prev">
                      <i class="fas fa-chevron-left"></i>
                    </button>
                    <div class="nav-dots">
                      <span v-for="(event, index) in loveStoryEvents" 
                            :key="index" 
                            :class="{ active: activeEvent === index }"
                            @click="setActiveEvent(index)"></span>
                    </div>
                    <button @click="nextEvent" :disabled="activeEvent === loveStoryEvents.length - 1" class="nav-btn next">
                      <i class="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            </transition>
          </div>
          
          <!-- Интерактивная галерея моментов -->
          <div class="moments-gallery" v-scroll-animation>
            <h3 class="gallery-title">Наши счастливые моменты</h3>
            <div class="gallery-grid">
              <div class="gallery-item" 
                   v-for="(photo, index) in felixGallery" 
                   :key="index"
                   @click="openLightbox(index)"
                   :style="{ animationDelay: index * 0.1 + 's' }">
                <img :src="photo.thumbnail" :alt="photo.caption">
                <div class="item-overlay">
                  <i class="fas fa-expand"></i>
                  <p>{{ photo.caption }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- Секция о Фелли с анимациями -->
      <section class="felli-section" id="felli">
        <div class="container">
          <div class="felli-header" v-scroll-animation>
            <div class="header-animation">
              <div class="star" v-for="i in 5" :key="i" :style="{ animationDelay: i * 0.2 + 's' }">
                <i class="fas fa-star"></i>
              </div>
            </div>
            <h2 class="section-title">
              <span class="title-icon"><i class="fas fa-baby"></i></span>
              Фелли: наш маленький лучик света
            </h2>
            <p class="section-subtitle">История о том, как наша семья стала полной</p>
          </div>
          
          <!-- Интерактивная история Фелли -->
          <div class="felli-story-container">
            <!-- Книга историй -->
            <div class="story-book">
              <div class="book-cover" :class="{ open: bookOpen }" @click="toggleBook">
                <div class="cover-front">
                  <h3>История Фелли</h3>
                  <i class="fas fa-book-open"></i>
                  <p>Нажмите, чтобы открыть</p>
                </div>
                <div class="cover-back">
                  <p>Наша семейная история</p>
                </div>
              </div>
              
              <transition name="book-pages">
                <div v-if="bookOpen" class="book-pages">
                  <div class="page" v-for="(page, index) in felliStoryPages" :key="index" 
                       v-show="currentPage === index">
                    <h3>{{ page.title }}</h3>
                    <div class="page-content">
                      <p>{{ page.content }}</p>
                      <div v-if="page.illustration" class="page-illustration">
                        <component :is="page.illustration"></component>
                      </div>
                    </div>
                  </div>
                  
                  <div class="page-navigation">
                    <button @click="previousPage" :disabled="currentPage === 0">
                      <i class="fas fa-chevron-left"></i>
                    </button>
                    <span class="page-counter">{{ currentPage + 1 }} / {{ felliStoryPages.length }}</span>
                    <button @click="nextPage" :disabled="currentPage === felliStoryPages.length - 1">
                      <i class="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              </transition>
            </div>
            
            <!-- Семейные традиции с анимацией -->
            <div class="family-traditions" v-scroll-animation>
              <h3 class="traditions-title">Наши семейные традиции</h3>
              <div class="traditions-wheel">
                <div class="wheel-center">
                  <i class="fas fa-home"></i>
                </div>
                <div class="tradition-item" 
                     v-for="(tradition, index) in familyTraditions" 
                     :key="index"
                     :style="getTraditionStyle(index)"
                     @mouseenter="highlightTradition(index)"
                     @mouseleave="unhighlightTradition">
                  <div class="tradition-icon">
                    <i :class="tradition.icon"></i>
                  </div>
                  <div class="tradition-tooltip" v-if="highlightedTradition === index">
                    <h4>{{ tradition.title }}</h4>
                    <p>{{ tradition.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Интерактивное семейное древо -->
          <div class="family-tree" v-scroll-animation>
            <h3 class="tree-title">Наша семья</h3>
            <div class="tree-container">
              <svg class="tree-svg" viewBox="0 0 800 400">
                <!-- Линии связей -->
                <path class="tree-line" d="M200,100 Q400,150 600,100" />
                <line class="tree-line" x1="400" y1="150" x2="400" y2="250" />
                
                <!-- Узлы семьи -->
                <g class="tree-node" transform="translate(200, 100)">
                  <circle r="60" />
                  <text y="5">Fox Taffy</text>
                  <image href="https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/reference.png" 
                         x="-40" y="-40" width="80" height="80" clip-path="circle(40px)" />
                </g>
                
                <g class="tree-node" transform="translate(600, 100)">
                  <circle r="60" />
                  <text y="5">Феликс</text>
                  <image href="https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Felix.jpg" 
                         x="-40" y="-40" width="80" height="80" clip-path="circle(40px)" />
                </g>
                
                <g class="tree-node child" transform="translate(400, 250)">
                  <circle r="50" />
                  <text y="5">Фелли</text>
                  <foreignObject x="-30" y="-30" width="60" height="60">
                    <div class="child-icon">
                      <i class="fas fa-child"></i>
                    </div>
                  </foreignObject>
                </g>
                
                <!-- Анимированные сердечки -->
                <g class="floating-hearts">
                  <text v-for="i in 5" :key="i" class="heart" :x="getHeartX(i)" :y="getHeartY(i)">❤️</text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>
  
      <!-- Плавающая навигация с прогрессом -->
      <nav class="floating-nav" :class="{ visible: showNav }">
        <div class="nav-progress">
          <div class="progress-fill" :style="{ height: scrollProgress + '%' }"></div>
        </div>
        <a v-for="(section, index) in navSections" 
           :key="index"
           :href="'#' + section.id" 
           class="nav-link" 
           :class="{ active: activeSection === section.id }"
           @click.prevent="scrollToSection(section.id)">
          <span class="nav-icon">
            <i :class="section.icon"></i>
          </span>
          <span class="nav-label">{{ section.label }}</span>
          <span class="nav-indicator"></span>
        </a>
      </nav>
  
      <!-- Лайтбокс для галереи -->
      <transition name="lightbox">
        <div v-if="lightboxOpen" class="lightbox" @click="closeLightbox">
          <div class="lightbox-content" @click.stop>
            <img :src="felixGallery[lightboxIndex].full" :alt="felixGallery[lightboxIndex].caption">
            <p class="lightbox-caption">{{ felixGallery[lightboxIndex].caption }}</p>
            <button class="lightbox-close" @click="closeLightbox">
              <i class="fas fa-times"></i>
            </button>
            <button class="lightbox-prev" @click="previousPhoto" v-if="lightboxIndex > 0">
              <i class="fas fa-chevron-left"></i>
            </button>
            <button class="lightbox-next" @click="nextPhoto" v-if="lightboxIndex < felixGallery.length - 1">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </transition>
  
      <!-- Кнопка "Наверх" -->
      <transition name="fade">
        <button v-if="showScrollTop" class="scroll-top" @click="scrollToTop">
          <i class="fas fa-arrow-up"></i>
        </button>
      </transition>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
  
  // ===== ТИПЫ И ИНТЕРФЕЙСЫ =====
  interface Stat {
    icon: string
    value: string
    label: string
  }
  
  interface CharacterTrait {
    icon: string
    name: string
    description: string
    level: number
  }
  
  interface CharacterDetail {
    label: string
    value: string
  }
  
  interface LoveStoryEvent {
    icon: string
    title: string
    date: string
    description: string
    image?: string
    quote?: string
  }
  
  interface GalleryPhoto {
    thumbnail: string
    full: string
    caption: string
  }
  
  interface StoryPage {
    title: string
    content: string
    illustration?: any
  }
  
  interface FamilyTradition {
    icon: string
    title: string
    description: string
  }
  
  interface NavSection {
    id: string
    icon: string
    label: string
  }
  
  // ===== РЕАКТИВНЫЕ ПЕРЕМЕННЫЕ =====
  // Состояние скролла и навигации
  const scrollProgress = ref(0)
  const showNav = ref(false)
  const showScrollTop = ref(false)
  const activeSection = ref('about')
  
  // 3D эффекты для карточки
  const mouseX = ref(0)
  const mouseY = ref(0)
  const cardStyle = computed(() => {
    const tiltX = (mouseY.value - 0.5) * 20
    const tiltY = (mouseX.value - 0.5) * -20
    return {
      transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
    }
  })
  
  // Ротация модели персонажа
  const modelRotation = ref(0)
  const isRotating = ref(false)
  const showCharacterInfo = ref(false)
  
  // Состояние компонентов истории
  const selectedTrait = ref(0)
  const activeEvent = ref(0)
  const timelineProgress = ref(0)
  const bookOpen = ref(false)
  const currentPage = ref(0)
  const highlightedTradition = ref<number | null>(null)
  
  // Лайтбокс
  const lightboxOpen = ref(false)
  const lightboxIndex = ref(0)
  
  // Ссылки на элементы
  const heroSection = ref<HTMLElement>()
  const parallaxLayer1 = ref<HTMLElement>()
  const parallaxLayer2 = ref<HTMLElement>()
  const parallaxLayer3 = ref<HTMLElement>()
  const card3d = ref<HTMLElement>()
  
  // ===== ДАННЫЕ =====
  // Статистика персонажа
  const stats: Stat[] = [
    { icon: 'fas fa-ruler-vertical', value: '177', label: 'см' },
    { icon: 'fas fa-birthday-cake', value: '21', label: 'год' },
    { icon: 'fas fa-paw', value: 'Лис', label: 'вид' }
  ]
  
  // Черты характера
  const characterTraits: CharacterTrait[] = [
    {
      icon: 'fas fa-heart',
      name: 'Дружелюбный',
      description: 'Всегда рад новым знакомствам и готов помочь',
      level: 95
    },
    {
      icon: 'fas fa-palette',
      name: 'Творческий',
      description: 'Люблю создавать и воплощать новые идеи',
      level: 90
    },
    {
      icon: 'fas fa-users',
      name: 'Общительный',
      description: 'Легко нахожу общий язык с разными людьми',
      level: 85
    },
    {
      icon: 'fas fa-smile',
      name: 'Оптимист',
      description: 'Вижу положительные стороны в любой ситуации',
      level: 92
    }
  ]
  
  // Детали персонажа
  const characterDetails: CharacterDetail[] = [
    { label: 'Цвет глаз', value: 'Зелёный / Голубой (гетерохромия)' },
    { label: 'Цвет шерсти', value: 'Рыжий с зелёными акцентами' },
    { label: 'Особые приметы', value: 'Градиентный хвост' },
    { label: 'Любимое время года', value: 'Лето' }
  ]
  
  // События истории любви
  const loveStoryEvents: LoveStoryEvent[] = [
    {
      icon: 'fas fa-star',
      title: 'Первая встреча',
      date: 'Весна 2022',
      description: 'Наша первая встреча произошла на фурри-мероприятии. Феликс привлёк моё внимание своей невероятной энергией и заразительной улыбкой. Мы оказались в одной команде во время квеста, и с первых минут я понял — передо мной особенный человек.',
      image: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Felix.jpg',
      quote: 'Иногда одного взгляда достаточно, чтобы понять — это судьба'
    },
    {
      icon: 'fas fa-comments',
      title: 'Начало общения',
      date: 'Лето 2022',
      description: 'После мероприятия мы обменялись контактами и начали переписываться. Каждый день приносил новые темы для разговоров. Оказалось, у нас много общих интересов — от любви к играм до философских размышлений о жизни.',
      quote: 'Расстояние — это просто цифры, когда души находят друг друга'
    },
    {
      icon: 'fas fa-heart',
      title: 'Признание в чувствах',
      date: 'Осень 2022',
      description: 'Через несколько месяцев мы поняли, что наши чувства переросли дружбу. Признание произошло во время прогулки в парке, под шум осенних листьев. Это был один из самых волнующих моментов в моей жизни.',
      quote: 'Любовь не спрашивает разрешения — она просто приходит'
    },
    {
      icon: 'fas fa-home',
      title: 'Начало совместной жизни',
      date: 'Зима 2023',
      description: 'Мы решили жить вместе и создавать общее будущее. Каждый день наполнен счастьем, поддержкой и взаимопониманием. Феликс стал не просто моей половинкой, но и лучшим другом.',
      quote: 'Дом там, где твоё сердце, а моё сердце — с тобой'
    }
  ]
  
  // Галерея с Феликсом
  const felixGallery: GalleryPhoto[] = [
    {
      thumbnail: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Felix.jpg',
      full: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Felix.jpg',
      caption: 'Наша первая совместная фотография'
    },
    {
      thumbnail: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/fursuit1.jpg',
      full: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/fursuit1.jpg',
      caption: 'На фурри-мероприятии'
    },
    {
      thumbnail: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/fursuit2.jpg',
      full: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/fursuit2.jpg',
      caption: 'Счастливые моменты'
    },
    {
      thumbnail: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/fursuit3.jpg',
      full: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/fursuit3.jpg',
      caption: 'Вместе навсегда'
    }
  ]
  
  // Страницы истории Фелли
  const felliStoryPages: StoryPage[] = [
    {
      title: 'Глава 1: Мечта',
      content: 'Мы с Феликсом долго мечтали о ребёнке. Это желание росло с каждым днём, наполняя наши сердца надеждой и любовью. Мы представляли, как будем учить его первым словам, как будем вместе играть и исследовать мир.'
    },
    {
      title: 'Глава 2: Чудо',
      content: 'И вот это произошло — в нашей жизни появился Фелли. Его имя — это сочетание наших имён, символ нашей любви и единства. С первого дня он стал центром нашей вселенной, наполнив дом детским смехом и радостью.'
    },
    {
      title: 'Глава 3: Первые шаги',
      content: 'Каждый день с Фелли — это новое открытие. Его первая улыбка заставила наши сердца замереть от счастья. Первые шаги были неуверенными, но полными решимости исследовать мир. Мы были рядом, поддерживая и оберегая.'
    },
    {
      title: 'Глава 4: Растём вместе',
      content: 'Фелли унаследовал лучшее от нас обоих — мою любознательность и творческую жилку, энергию и жизнерадостность Феликса. Наблюдать, как он растёт и развивается — самое удивительное приключение в нашей жизни.'
    }
  ]
  
  // Семейные традиции
  const familyTraditions: FamilyTradition[] = [
    {
      icon: 'fas fa-book',
      title: 'Вечерние сказки',
      description: 'Каждый вечер читаем сказки и придумываем свои истории'
    },
    {
      icon: 'fas fa-paint-brush',
      title: 'Творческие выходные',
      description: 'Рисуем, лепим и создаём поделки всей семьёй'
    },
    {
      icon: 'fas fa-tree',
      title: 'Прогулки на природе',
      description: 'Исследуем парки и леса, изучаем окружающий мир'
    },
    {
      icon: 'fas fa-gamepad',
      title: 'Игровые вечера',
      description: 'Настольные игры — время веселья и единства'
    },
    {
      icon: 'fas fa-utensils',
      title: 'Семейные ужины',
      description: 'Готовим вместе и делимся историями за столом'
    },
    {
      icon: 'fas fa-camera',
      title: 'Фотолетопись',
      description: 'Запечатлеваем важные моменты нашей жизни'
    }
  ]
  
  // Секции навигации
  const navSections: NavSection[] = [
    { id: 'about', icon: 'fas fa-user', label: 'О персонаже' },
    { id: 'felix', icon: 'fas fa-heart', label: 'Феликс' },
    { id: 'felli', icon: 'fas fa-child', label: 'Фелли' }
  ]
  
  // ===== ФУНКЦИИ =====
  /**
   * Генерирует стили для частиц фона
   */
  const getParticleStyle = (index: number) => {
    const size = Math.random() * 4 + 2
    const duration = Math.random() * 20 + 10
    const delay = Math.random() * 5
    const startX = Math.random() * 100
    const startY = Math.random() * 100
    
    return {
      width: `${size}px`,
      height: `${size}px`,
      left: `${startX}%`,
      top: `${startY}%`,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`
    }
  }
  
  /**
   * Обработка движения мыши для 3D эффекта
   */
  const handleMouseMove = (event: MouseEvent) => {
    if (!heroSection.value) return
    
    const rect = heroSection.value.getBoundingClientRect()
    mouseX.value = (event.clientX - rect.left) / rect.width
    mouseY.value = (event.clientY - rect.top) / rect.height
  }
  
  /**
   * Обработка скролла страницы
   */
  const handleScroll = () => {
    const scrollY = window.scrollY
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight
    
    // Прогресс скролла
    scrollProgress.value = (scrollY / documentHeight) * 100
    
    // Показ/скрытие элементов
    showNav.value = scrollY > 300
    showScrollTop.value = scrollY > 600
    
    // Параллакс эффект
    if (parallaxLayer1.value && parallaxLayer2.value && parallaxLayer3.value) {
      parallaxLayer1.value.style.transform = `translateY(${scrollY * 0.5}px)`
      parallaxLayer2.value.style.transform = `translateY(${scrollY * 0.3}px)`
      parallaxLayer3.value.style.transform = `translateY(${scrollY * 0.1}px)`
    }
    
    // Определение активной секции
    const sections = ['about', 'felix', 'felli']
    for (const section of sections) {
      const element = document.getElementById(section)
      if (element) {
        const rect = element.getBoundingClientRect()
        if (rect.top <= 100 && rect.bottom >= 100) {
          activeSection.value = section
          break
        }
      }
    }
    
    // Прогресс временной линии
    const felixSection = document.getElementById('felix')
    if (felixSection) {
      const rect = felixSection.getBoundingClientRect()
      const sectionProgress = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)))
      timelineProgress.value = sectionProgress * 100
    }
  }
  
  /**
   * Плавная прокрутка к секции
   */
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    section?.scrollIntoView({ behavior: 'smooth' })
  }
  
  /**
   * Прокрутка к контенту
   */
  const scrollToContent = () => {
    const aboutSection = document.getElementById('about')
    aboutSection?.scrollIntoView({ behavior: 'smooth' })
  }
  
  /**
   * Прокрутка наверх
   */
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  /**
   * Управление ротацией модели
   */
  const startRotation = () => {
    isRotating.value = true
    animateRotation()
  }
  
  const stopRotation = () => {
    isRotating.value = false
  }
  
  const animateRotation = () => {
    if (isRotating.value) {
      modelRotation.value += 1
      requestAnimationFrame(animateRotation)
    }
  }
  
  /**
   * Переключение информации о персонаже
   */
  const toggleInfo = () => {
    showCharacterInfo.value = !showCharacterInfo.value
  }
  
  /**
   * Выбор черты характера
   */
  const selectTrait = (index: number) => {
    selectedTrait.value = index
  }
  
  /**
   * Навигация по событиям истории любви
   */
  const setActiveEvent = (index: number) => {
    activeEvent.value = index
  }
  
  const previousEvent = () => {
    if (activeEvent.value > 0) {
      activeEvent.value--
    }
  }
  
  const nextEvent = () => {
    if (activeEvent.value < loveStoryEvents.length - 1) {
      activeEvent.value++
    }
  }
  
  /**
   * Управление книгой историй
   */
  const toggleBook = () => {
    bookOpen.value = !bookOpen.value
    if (bookOpen.value) {
      currentPage.value = 0
    }
  }
  
  const previousPage = () => {
    if (currentPage.value > 0) {
      currentPage.value--
    }
  }
  
  const nextPage = () => {
    if (currentPage.value < felliStoryPages.length - 1) {
      currentPage.value++
    }
  }
  
  /**
   * Подсветка традиций
   */
  const highlightTradition = (index: number) => {
    highlightedTradition.value = index
  }
  
  const unhighlightTradition = () => {
    highlightedTradition.value = null
  }
  
  /**
   * Расчёт позиции традиций на круге
   */
  const getTraditionStyle = (index: number) => {
    const total = familyTraditions.length
    const angle = (360 / total) * index - 90
    const radius = 120
    const x = Math.cos(angle * Math.PI / 180) * radius
    const y = Math.sin(angle * Math.PI / 180) * radius
    
    return {
      transform: `translate(${x}px, ${y}px)`
    }
  }
  
  /**
   * Управление лайтбоксом
   */
  const openLightbox = (index: number) => {
    lightboxIndex.value = index
    lightboxOpen.value = true
    document.body.style.overflow = 'hidden'
  }
  
  const closeLightbox = () => {
    lightboxOpen.value = false
    document.body.style.overflow = ''
  }
  
  const previousPhoto = () => {
    if (lightboxIndex.value > 0) {
      lightboxIndex.value--
    }
  }
  
  const nextPhoto = () => {
    if (lightboxIndex.value < felixGallery.length - 1) {
      lightboxIndex.value++
    }
  }
  
  /**
   * Позиции сердечек для SVG
   */
  const getHeartX = (index: number) => {
    return 300 + Math.sin(index * 0.5) * 100
  }
  
  const getHeartY = (index: number) => {
    return 150 + Math.cos(index * 0.5) * 50
  }
  
  // ===== ХУКИ ЖИЗНЕННОГО ЦИКЛА =====
  onMounted(() => {
    // Слушатели событий
    window.addEventListener('scroll', handleScroll)
    
    // Инициализация наблюдателя для анимаций
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    }, observerOptions)
    
    // Наблюдение за элементами с анимацией
    document.querySelectorAll('[v-scroll-animation]').forEach(el => {
      observer.observe(el)
    })
    
    // Начальная проверка скролла
    handleScroll()
  })
  
  onUnmounted(() => {
    // Очистка слушателей
    window.removeEventListener('scroll', handleScroll)
    document.body.style.overflow = ''
  })
  </script>
  
  <style scoped>
  /* ===== ИМПОРТЫ И ПЕРЕМЕННЫЕ ===== */
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800;900&display=swap');
  
  :root {
    /* Основные цвета темы */
    --bg-dark: #0a0a0a;
    --bg-section: #0f0f0f;
    --bg-card: #1a1a1a;
    --bg-card-hover: #222222;
    
    /* Цвета текста */
    --text-primary: #f2f2f2;
    --text-secondary: #b0b0b0;
    --text-muted: #808080;
    
    /* Акцентные цвета */
    --accent-orange: #ff7b25;
    --accent-green: #4caf50;
    --accent-red: #ff4757;
    
    /* Градиенты */
    --gradient-primary: linear-gradient(135deg, var(--accent-orange), var(--accent-green));
    --gradient-secondary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --gradient-love: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
    
    /* Тени и эффекты */
    --shadow-soft: 0 4px 20px rgba(0, 0, 0, 0.3);
    --shadow-hard: 0 8px 32px rgba(0, 0, 0, 0.4);
    --shadow-glow: 0 0 30px rgba(255, 123, 37, 0.3);
    --shadow-glow-green: 0 0 30px rgba(76, 175, 80, 0.3);
    
    /* Анимации */
    --transition-fast: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    --transition-slow: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  /* ===== ГЛОБАЛЬНЫЕ СТИЛИ ===== */
  * {
    box-sizing: border-box;
  }
  
  .character-story {
    font-family: 'Nunito', sans-serif;
    color: var(--text-primary);
    background-color: var(--bg-dark);
    overflow-x: hidden;
    position: relative;
  }
  
  /* ===== ПРОГРЕСС-БАР ===== */
  .progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    height: 4px;
    background: var(--gradient-primary);
    z-index: 1000;
    transition: width 0.3s ease;
    box-shadow: 0 0 10px rgba(255, 123, 37, 0.5);
  }
  
  /* ===== АНИМИРОВАННЫЙ ФОН ===== */
  .animated-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }
  
  .particle {
    position: absolute;
    background: radial-gradient(circle, rgba(255, 123, 37, 0.5) 0%, transparent 70%);
    border-radius: 50%;
    animation: float 20s infinite ease-in-out;
  }
  
  @keyframes float {
    0%, 100% {
      transform: translate(0, 0) scale(1);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    50% {
      transform: translate(100px, -100px) scale(1.5);
    }
  }
  
  /* ===== ГЕРОИЧЕСКАЯ СЕКЦИЯ ===== */
  .hero-section {
    position: relative;
    height: 100vh;
    min-height: 700px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  
  .hero-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }
  
  .parallax-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    will-change: transform;
  }
  
  .parallax-layer.layer-1 {
    background-image: url('https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/reference.png');
    filter: blur(8px) brightness(0.3);
    transform: scale(1.2);
  }
  
  .parallax-layer.layer-2 {
    background: radial-gradient(ellipse at center, transparent 0%, rgba(10, 10, 10, 0.8) 100%);
  }
  
  .parallax-layer.layer-3 {
    background: linear-gradient(to bottom, transparent 0%, rgba(10, 10, 10, 0.9) 80%, var(--bg-dark) 100%);
  }
  
  .gradient-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at center, transparent 0%, rgba(10, 10, 10, 0.4) 100%);
  }
  
  /* ===== 3D КАРТОЧКА ГЕРОЯ ===== */
  .hero-content {
    position: relative;
    z-index: 1;
    text-align: center;
    padding: 2rem;
    perspective: 1000px;
  }
  
  .character-3d-card {
    transform-style: preserve-3d;
    transition: transform 0.1s ease;
  }
  
  .card-inner {
    background: rgba(26, 26, 26, 0.8);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 2rem;
    padding: 3rem;
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  
  .hero-title {
    font-size: clamp(3rem, 8vw, 5rem);
    font-weight: 900;
    margin-bottom: 1rem;
    letter-spacing: -2px;
    animation: fadeInUp 1s ease forwards;
    opacity: 0;
    transform: translateY(30px);
  }
  
  /* Glitch эффект для заголовка */
  .glitch {
    position: relative;
  }
  
  .glitch::before,
  .glitch::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.8;
  }
  
  .glitch::before {
    animation: glitch-1 0.5s infinite;
    color: var(--accent-orange);
    z-index: -1;
  }
  
  .glitch::after {
    animation: glitch-2 0.5s infinite;
    color: var(--accent-green);
    z-index: -2;
  }
  
  @keyframes glitch-1 {
    0%, 100% {
      transform: translate(0);
    }
    20% {
      transform: translate(-2px, 2px);
    }
    40% {
      transform: translate(-2px, -2px);
    }
    60% {
      transform: translate(2px, 2px);
    }
    80% {
      transform: translate(2px, -2px);
    }
  }
  
  @keyframes glitch-2 {
    0%, 100% {
      transform: translate(0);
    }
    20% {
      transform: translate(2px, -2px);
    }
    40% {
      transform: translate(2px, 2px);
    }
    60% {
      transform: translate(-2px, -2px);
    }
    80% {
      transform: translate(-2px, 2px);
    }
  }
  
  .title-accent {
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 20px rgba(255, 123, 37, 0.5));
  }
  
  .hero-subtitle {
    font-size: clamp(1.2rem, 3vw, 1.8rem);
    font-weight: 300;
    color: var(--text-secondary);
    margin-bottom: 3rem;
    animation: fadeInUp 1s ease 0.2s forwards;
    opacity: 0;
    transform: translateY(30px);
  }
  
  /* ===== СТАТИСТИКА ГЕРОЯ ===== */
  .hero-stats {
    display: flex;
    gap: 2rem;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 1rem;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    min-width: 120px;
    opacity: 0;
    transform: translateY(30px);
    animation: fadeInUp 0.8s ease forwards;
    transition: var(--transition);
  }
  
  .stat-item:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-5px);
    box-shadow: var(--shadow-glow);
  }
  
  .stat-icon {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--gradient-primary);
    border-radius: 50%;
    font-size: 1.5rem;
    color: white;
    box-shadow: 0 4px 15px rgba(255, 123, 37, 0.4);
  }
  
  .stat-value {
    font-size: 2rem;
    font-weight: 800;
    color: var(--text-primary);
  }
  
  .stat-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  /* ===== ИНДИКАТОР СКРОЛЛА ===== */
  .scroll-indicator {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    cursor: pointer;
    transition: var(--transition);
  }
  
  .scroll-indicator:hover {
    transform: translateX(-50%) translateY(-5px);
  }
  
  .mouse {
    width: 30px;
    height: 50px;
    border: 2px solid var(--text-secondary);
    border-radius: 25px;
    position: relative;
  }
  
  .wheel {
    width: 4px;
    height: 10px;
    background: var(--text-secondary);
    border-radius: 2px;
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    animation: wheel 1.5s infinite;
  }
  
  @keyframes wheel {
    0% {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
  }
  
  .arrows {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  
  .arrows span {
    display: block;
    width: 20px;
    height: 2px;
    background: var(--text-secondary);
    transform: rotate(45deg);
    transform-origin: right;
    animation: arrow 1.5s infinite;
  }
  
  .arrows span:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  .arrows span:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  @keyframes arrow {
    0% {
      opacity: 0;
      transform: rotate(45deg) translate(0, 0);
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: rotate(45deg) translate(5px, 5px);
    }
  }
  
  /* ===== ОСНОВНЫЕ СЕКЦИИ ===== */
  .story-section,
  .felix-section,
  .felli-section {
    position: relative;
    padding: 6rem 0;
    background-color: var(--bg-section);
    z-index: 1;
  }
  
  .felix-section {
    background-color: var(--bg-dark);
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }
  
  /* ===== ЗАГОЛОВКИ СЕКЦИЙ ===== */
  .section-header {
    text-align: center;
    margin-bottom: 4rem;
  }
  
  .section-title {
    font-size: clamp(2.5rem, 5vw, 3.5rem);
    font-weight: 800;
    margin-bottom: 1rem;
    position: relative;
    display: inline-block;
  }
  
  .magnetic-text {
    transition: var(--transition);
  }
  
  .magnetic-text:hover {
    transform: scale(1.05);
  }
  
  .title-decoration {
    display: block;
    width: 100px;
    height: 4px;
    background: var(--gradient-primary);
    margin: 1rem auto 0;
    border-radius: 2px;
    position: relative;
    overflow: hidden;
  }
  
  .title-decoration::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
    animation: shimmer 3s infinite;
  }
  
  @keyframes shimmer {
    to {
      left: 100%;
    }
  }
  
  .section-subtitle {
    font-size: 1.3rem;
    color: var(--text-secondary);
    font-weight: 300;
  }
  
  /* ===== ИСТОРИЯ ПЕРСОНАЖА ===== */
  .story-content-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: start;
  }
  
  .biography-card {
    background: var(--bg-card);
    border-radius: 1.5rem;
    padding: 2.5rem;
    box-shadow: var(--shadow-soft);
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: var(--transition);
  }
  
  .biography-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-hard);
  }
  
  .bio-text {
    font-size: 1.1rem;
    line-height: 1.8;
    margin-bottom: 1.5rem;
    color: var(--text-secondary);
    transition: var(--transition);
  }
  
  .bio-text:hover {
    color: var(--text-primary);
  }
  
  .text-accent {
    color: var(--accent-orange);
    font-weight: 700;
  }
  
  /* ===== ЧЕРТЫ ХАРАКТЕРА ===== */
  .traits-showcase {
    margin-top: 3rem;
  }
  
  .traits-title {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    color: var(--accent-green);
    text-align: center;
  }
  
  .traits-carousel {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  .trait-card {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 1rem;
    padding: 1.5rem;
    text-align: center;
    cursor: pointer;
    transition: var(--transition);
    border: 2px solid transparent;
  }
  
  .trait-card:hover,
  .trait-card.active {
    background: rgba(255, 255, 255, 0.08);
    border-color: var(--accent-orange);
    transform: translateY(-5px);
    box-shadow: var(--shadow-glow);
  }
  
  .trait-icon-wrapper {
    width: 60px;
    height: 60px;
    background: rgba(255, 123, 37, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    font-size: 1.5rem;
    color: var(--accent-orange);
    transition: var(--transition);
  }
  
  .trait-card:hover .trait-icon-wrapper {
    background: var(--gradient-primary);
    color: white;
    transform: rotate(360deg);
  }
  
  .trait-card h4 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }
  
  .trait-card p {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 1rem;
  }
  
  .trait-progress {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    background: var(--gradient-primary);
    border-radius: 3px;
    transition: width 1s ease;
  }
  
  /* ===== 3D МОДЕЛЬ ПЕРСОНАЖА ===== */
  .character-showcase {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }
  
  .showcase-container {
    position: relative;
    perspective: 1000px;
  }
  
  .character-model {
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.1s linear;
  }
  
  .model-image {
    display: block;
    max-width: 400px;
    height: auto;
    border-radius: 1rem;
    box-shadow: var(--shadow-hard);
  }
  
  .model-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 120%;
    height: 120%;
    background: radial-gradient(circle, rgba(255, 123, 37, 0.3) 0%, transparent 60%);
    transform: translate(-50%, -50%);
    z-index: -1;
    filter: blur(40px);
  }
  
  .model-particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  
  .particle-small {
    position: absolute;
    width: 4px;
    height: 4px;
    background: var(--accent-orange);
    border-radius: 50%;
    opacity: 0;
    animation: particle-float 3s infinite;
  }
  
  .particle-small:nth-child(1) { top: 10%; left: 20%; animation-delay: 0s; }
  .particle-small:nth-child(2) { top: 20%; left: 80%; animation-delay: 0.5s; }
  .particle-small:nth-child(3) { top: 60%; left: 10%; animation-delay: 1s; }
  .particle-small:nth-child(4) { top: 80%; left: 70%; animation-delay: 1.5s; }
  .particle-small:nth-child(5) { top: 30%; left: 50%; animation-delay: 2s; }
  
  @keyframes particle-float {
    0% {
      opacity: 0;
      transform: translate(0, 20px);
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translate(0, -20px);
    }
  }
  
  .showcase-info {
    text-align: center;
  }
  
  .info-button {
    background: var(--gradient-primary);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 2rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    box-shadow: 0 4px 15px rgba(255, 123, 37, 0.3);
  }
  
  .info-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(255, 123, 37, 0.4);
  }
  
  .info-button i {
    margin-right: 0.5rem;
  }
  
  .character-details {
    margin-top: 2rem;
    background: var(--bg-card);
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: var(--shadow-soft);
  }
  
  .detail-item {
    display: flex;
    justify-content: space-between;
    padding: 0.8rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .detail-item:last-child {
    border-bottom: none;
  }
  
  .detail-label {
    color: var(--text-secondary);
    font-weight: 600;
  }
  
  .detail-value {
    color: var(--accent-green);
    font-weight: 700;
  }
  
  /* ===== ИСТОРИЯ ЛЮБВИ ===== */
  .love-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }
  
  .pulse-heart {
    color: var(--accent-red);
    animation: pulse 1.5s infinite;
  }
  
  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }
  
  .love-timeline {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 4rem;
    margin-top: 4rem;
    position: relative;
  }
  
  .timeline-progress {
    position: absolute;
    left: 100px;
    top: 0;
    width: 4px;
    background: var(--gradient-love);
    border-radius: 2px;
    transition: height 0.3s ease;
    box-shadow: 0 0 20px rgba(255, 71, 87, 0.5);
  }
  
  .timeline-point {
    position: absolute;
    left: 80px;
    display: flex;
    align-items: center;
    gap: 1rem;
    cursor: pointer;
    transition: var(--transition);
  }
  
  .point-marker {
    width: 40px;
    height: 40px;
    background: var(--bg-card);
    border: 3px solid var(--text-muted);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    transition: var(--transition);
  }
  
  .timeline-point.active .point-marker,
  .timeline-point:hover .point-marker {
    background: var(--gradient-love);
    border-color: transparent;
    color: white;
    transform: scale(1.2);
    box-shadow: 0 0 20px rgba(255, 71, 87, 0.5);
  }
  
  .timeline-point.current .point-marker {
    animation: pulse 1.5s infinite;
  }
  
  .point-content {
    opacity: 0;
    transform: translateX(-20px);
    transition: var(--transition);
  }
  
  .timeline-point:hover .point-content,
  .timeline-point.active .point-content {
    opacity: 1;
    transform: translateX(0);
  }
  
  .point-content h3 {
    font-size: 1.1rem;
    margin-bottom: 0.2rem;
    color: var(--text-primary);
  }
  
  .event-date {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }
  
  /* ===== ДЕТАЛИ СОБЫТИЯ ===== */
  .event-details {
    grid-column: 2;
  }
  
  .details-card {
    background: var(--bg-card);
    border-radius: 1.5rem;
    overflow: hidden;
    box-shadow: var(--shadow-hard);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 2rem;
    background: rgba(255, 71, 87, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .header-icon {
    width: 80px;
    height: 80px;
    background: var(--gradient-love);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    color: white;
    box-shadow: 0 4px 20px rgba(255, 71, 87, 0.4);
  }
  
  .header-content h3 {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }
  
  .card-body {
    padding: 2rem;
  }
  
  .card-body p {
    font-size: 1.1rem;
    line-height: 1.8;
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }
  
  .event-image {
    position: relative;
    border-radius: 1rem;
    overflow: hidden;
    margin: 1.5rem 0;
    cursor: pointer;
    transition: var(--transition);
  }
  
  .event-image:hover {
    transform: scale(1.02);
  }
  
  .event-image img {
    width: 100%;
    height: auto;
    display: block;
  }
  
  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: var(--transition);
    color: white;
    font-size: 2rem;
  }
  
  .event-image:hover .image-overlay {
    opacity: 1;
  }
  
  .event-quote {
    background: rgba(255, 71, 87, 0.05);
    border-left: 4px solid var(--accent-red);
    padding: 1.5rem;
    margin: 1.5rem 0;
    border-radius: 0.5rem;
    position: relative;
  }
  
  .event-quote i {
    position: absolute;
    color: var(--accent-red);
    opacity: 0.2;
    font-size: 2rem;
  }
  
  .event-quote i:first-child {
    top: 0.5rem;
    left: 0.5rem;
  }
  
  .event-quote i:last-child {
    bottom: 0.5rem;
    right: 0.5rem;
  }
  
  .event-quote p {
    font-style: italic;
    font-size: 1.2rem;
    text-align: center;
    margin: 0;
    padding: 0 2rem;
    color: var(--text-primary);
  }
  
  .card-navigation {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 2rem;
    background: rgba(255, 255, 255, 0.02);
  }
  
  .nav-btn {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    color: var(--text-primary);
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .nav-btn:hover:not(:disabled) {
    background: var(--gradient-love);
    transform: scale(1.1);
  }
  
  .nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  .nav-dots {
    display: flex;
    gap: 0.5rem;
  }
  
  .nav-dots span {
    width: 10px;
    height: 10px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    cursor: pointer;
    transition: var(--transition);
  }
  
  .nav-dots span.active {
    background: var(--accent-red);
    transform: scale(1.3);
  }
  
  /* ===== ГАЛЕРЕЯ МОМЕНТОВ ===== */
  .moments-gallery {
    margin-top: 6rem;
  }
  
  .gallery-title {
    font-size: 2rem;
    text-align: center;
    margin-bottom: 3rem;
    color: var(--text-primary);
  }
  
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  .gallery-item {
    position: relative;
    border-radius: 1rem;
    overflow: hidden;
    cursor: pointer;
    opacity: 0;
    transform: translateY(30px);
    animation: fadeInUp 0.8s ease forwards;
    box-shadow: var(--shadow-soft);
    transition: var(--transition);
  }
  
  .gallery-item:hover {
    transform: translateY(-10px);
    box-shadow: var(--shadow-glow);
  }
  
  .gallery-item img {
    width: 100%;
    height: 250px;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  .gallery-item:hover img {
    transform: scale(1.1);
  }
  
  .item-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.8) 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: var(--transition);
    color: white;
    padding: 1rem;
    text-align: center;
  }
  
  .gallery-item:hover .item-overlay {
    opacity: 1;
  }
  
  .item-overlay i {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  .item-overlay p {
    font-size: 0.9rem;
    font-weight: 600;
  }
  
  /* ===== СЕКЦИЯ ФЕЛЛИ ===== */
  .felli-header {
    text-align: center;
    margin-bottom: 4rem;
    position: relative;
  }
  
  .header-animation {
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 1rem;
  }
  
  .star {
    font-size: 1.5rem;
    color: #ffd700;
    opacity: 0;
    transform: translateY(20px) rotate(0deg);
    animation: starAppear 1s ease forwards;
  }
  
  @keyframes starAppear {
    to {
      opacity: 1;
      transform: translateY(0) rotate(360deg);
    }
  }
  
  .title-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background: var(--gradient-primary);
    border-radius: 50%;
    margin-right: 1rem;
    color: white;
    box-shadow: 0 4px 20px rgba(255, 123, 37, 0.4);
  }
  
  /* ===== КНИГА ИСТОРИЙ ===== */
  .story-book {
    max-width: 600px;
    margin: 0 auto 4rem;
    perspective: 1000px;
  }
  
  .book-cover {
    position: relative;
    background: var(--bg-card);
    border-radius: 1rem;
    padding: 3rem;
    text-align: center;
    cursor: pointer;
    transition: transform 0.6s;
    transform-style: preserve-3d;
    box-shadow: var(--shadow-hard);
    border: 2px solid rgba(255, 123, 37, 0.3);
  }
  
  .book-cover.open {
    transform: rotateY(10deg);
  }
  
  .cover-front,
  .cover-back {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }
  
  .cover-back {
    transform: rotateY(180deg);
  }
  
  .cover-front h3 {
    font-size: 2rem;
    margin-bottom: 1rem;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .cover-front i {
    font-size: 3rem;
    color: var(--accent-orange);
    margin-bottom: 1rem;
  }
  
  .cover-front p {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }
  
  .book-pages {
    background: var(--bg-card);
    border-radius: 1rem;
    padding: 3rem;
    margin-top: 2rem;
    box-shadow: var(--shadow-soft);
    min-height: 400px;
    position: relative;
  }
  
  .page h3 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: var(--accent-orange);
    text-align: center;
  }
  
  .page-content p {
    font-size: 1.1rem;
    line-height: 1.8;
    color: var(--text-secondary);
    text-align: justify;
  }
  
  .page-illustration {
    margin-top: 2rem;
    text-align: center;
  }
  
  .page-navigation {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 2rem;
  }
  
  .page-navigation button {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    color: var(--text-primary);
    cursor: pointer;
    transition: var(--transition);
  }
  
  .page-navigation button:hover:not(:disabled) {
    background: var(--gradient-primary);
    transform: scale(1.1);
  }
  
  .page-navigation button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  .page-counter {
    font-weight: 600;
    color: var(--text-secondary);
  }
  
  /* ===== СЕМЕЙНЫЕ ТРАДИЦИИ ===== */
  .family-traditions {
    margin: 4rem 0;
  }
  
  .traditions-title {
    font-size: 2rem;
    text-align: center;
    margin-bottom: 3rem;
    color: var(--text-primary);
  }
  
  .traditions-wheel {
    position: relative;
    width: 300px;
    height: 300px;
    margin: 0 auto;
  }
  
  .wheel-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    background: var(--gradient-primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    color: white;
    box-shadow: 0 0 30px rgba(255, 123, 37, 0.5);
    z-index: 2;
  }
  
  .tradition-item {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 60px;
    height: 60px;
    background: var(--bg-card);
    border: 2px solid var(--accent-green);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: var(--transition);
    z-index: 1;
  }
  
  .tradition-item:hover {
    transform: translate(-50%, -50%) scale(1.2);
    background: var(--gradient-primary);
    border-color: transparent;
    z-index: 3;
  }
  
  .tradition-icon {
    font-size: 1.5rem;
    color: var(--accent-green);
    transition: var(--transition);
  }
  
  .tradition-item:hover .tradition-icon {
    color: white;
  }
  
  .tradition-tooltip {
    position: absolute;
    top: -120px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--bg-card);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.8rem;
    padding: 1rem;
    min-width: 200px;
    text-align: center;
    box-shadow: var(--shadow-soft);
    z-index: 10;
  }
  
  .tradition-tooltip h4 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    color: var(--accent-green);
  }
  
  .tradition-tooltip p {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin: 0;
  }
  
  /* ===== СЕМЕЙНОЕ ДРЕВО ===== */
  .family-tree {
    margin-top: 6rem;
    text-align: center;
  }
  
  .tree-title {
    font-size: 2rem;
    margin-bottom: 3rem;
    color: var(--text-primary);
  }
  
  .tree-container {
    background: var(--bg-card);
    border-radius: 1.5rem;
    padding: 3rem;
    box-shadow: var(--shadow-soft);
    overflow: hidden;
  }
  
  .tree-svg {
    width: 100%;
    max-width: 800px;
    height: auto;
  }
  
  .tree-line {
    stroke: var(--accent-green);
    stroke-width: 3;
    fill: none;
    opacity: 0.5;
  }
  
  .tree-node circle {
    fill: var(--bg-card);
    stroke: var(--accent-orange);
    stroke-width: 3;
    transition: var(--transition);
  }
  
  .tree-node:hover circle {
    fill: var(--gradient-primary);
    filter: drop-shadow(0 0 20px rgba(255, 123, 37, 0.5));
  }
  
  .tree-node text {
    fill: var(--text-primary);
    font-size: 14px;
    font-weight: 600;
    text-anchor: middle;
    dominant-baseline: middle;
  }
  
  .tree-node.child circle {
    stroke: var(--accent-green);
  }
  
  .child-icon {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    color: var(--accent-green);
  }
  
  .floating-hearts .heart {
    font-size: 20px;
    opacity: 0.8;
    animation: floatHeart 4s infinite ease-in-out;
  }
  
  .floating-hearts .heart:nth-child(1) { animation-delay: 0s; }
  .floating-hearts .heart:nth-child(2) { animation-delay: 0.8s; }
  .floating-hearts .heart:nth-child(3) { animation-delay: 1.6s; }
  .floating-hearts .heart:nth-child(4) { animation-delay: 2.4s; }
  .floating-hearts .heart:nth-child(5) { animation-delay: 3.2s; }
  
  @keyframes floatHeart {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }
  
  /* ===== ПЛАВАЮЩАЯ НАВИГАЦИЯ ===== */
  .floating-nav {
    position: fixed;
    top: 50%;
    right: 2rem;
    transform: translateY(-50%);
    z-index: 100;
    opacity: 0;
    visibility: hidden;
    transition: var(--transition);
  }
  
  .floating-nav.visible {
    opacity: 1;
    visibility: visible;
  }
  
  .nav-progress {
    position: absolute;
    top: 0;
    left: -10px;
    width: 4px;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
  }
  
  .nav-progress .progress-fill {
    width: 100%;
    background: var(--gradient-primary);
    transition: height 0.3s ease;
    border-radius: 2px;
  }
  
  .nav-link {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    margin-bottom: 1rem;
    background: rgba(26, 26, 26, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 2rem;
    color: var(--text-secondary);
    text-decoration: none;
    transition: var(--transition);
    position: relative;
    overflow: hidden;
  }
  
  .nav-link:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
    transform: translateX(-5px);
  }
  
  .nav-link.active {
    background: var(--gradient-primary);
    color: white;
    border-color: transparent;
  }
  
  .nav-icon {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
  }
  
  .nav-label {
    font-weight: 600;
    white-space: nowrap;
  }
  
  .nav-indicator {
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    background: var(--accent-orange);
    transform: scaleY(0);
    transition: var(--transition);
  }
  
  .nav-link.active .nav-indicator {
    transform: scaleY(1);
  }
  
  /* ===== ЛАЙТБОКС ===== */
  .lightbox {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 2rem;
  }
  
  .lightbox-content {
    position: relative;
    max-width: 90%;
    max-height: 90%;
  }
  
  .lightbox-content img {
    max-width: 100%;
    max-height: 80vh;
    display: block;
    border-radius: 1rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }
  
  .lightbox-caption {
    text-align: center;
    margin-top: 1rem;
    color: white;
    font-size: 1.1rem;
  }
  
  .lightbox-close,
  .lightbox-prev,
  .lightbox-next {
    position: absolute;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    transition: var(--transition);
  }
  
  .lightbox-close {
    top: -60px;
    right: 0;
  }
  
  .lightbox-prev {
    top: 50%;
    left: -70px;
    transform: translateY(-50%);
  }
  
  .lightbox-next {
    top: 50%;
    right: -70px;
    transform: translateY(-50%);
  }
  
  .lightbox-close:hover,
  .lightbox-prev:hover,
  .lightbox-next:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1) translateY(-50%);
  }
  
  .lightbox-close:hover {
    transform: scale(1.1);
  }
  
  /* ===== КНОПКА НАВЕРХ ===== */
  .scroll-top {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 50px;
    height: 50px;
    background: var(--gradient-primary);
    border: none;
    border-radius: 50%;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(255, 123, 37, 0.4);
    transition: var(--transition);
    z-index: 99;
  }
  
  .scroll-top:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 30px rgba(255, 123, 37, 0.5);
  }
  
  /* ===== АНИМАЦИИ ПРИ СКРОЛЛЕ ===== */
  [v-scroll-animation] {
    opacity: 0;
    transform: translateY(50px);
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  [v-scroll-animation].visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  /* ===== СПЕЦИАЛЬНЫЕ АНИМАЦИИ ===== */
  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Анимации для переходов */
  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: all 0.5s ease;
  }
  
  .fade-slide-enter-from {
    opacity: 0;
    transform: translateX(-30px);
  }
  
  .fade-slide-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }
  
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: all 0.3s ease;
  }
  
  .slide-fade-enter-from {
    transform: translateY(-20px);
    opacity: 0;
  }
  
  .slide-fade-leave-to {
    transform: translateY(20px);
    opacity: 0;
  }
  
  .lightbox-enter-active,
  .lightbox-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .lightbox-enter-from,
  .lightbox-leave-to {
    opacity: 0;
  }
  
  .book-pages-enter-active,
  .book-pages-leave-active {
    transition: all 0.5s ease;
  }
  
  .book-pages-enter-from {
    opacity: 0;
    transform: translateY(30px);
  }
  
  .book-pages-leave-to {
    opacity: 0;
    transform: translateY(-30px);
  }
  
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  
  /* ===== АДАПТИВНОСТЬ ===== */
  @media (max-width: 1200px) {
    .story-content-wrapper {
      grid-template-columns: 1fr;
      gap: 3rem;
    }
    
    .character-showcase {
      order: -1;
    }
    
    .love-timeline {
      grid-template-columns: 100px 1fr;
      gap: 2rem;
    }
    
    .timeline-progress {
      left: 50px;
    }
    
    .timeline-point {
      left: 30px;
    }
  }
  
  @media (max-width: 992px) {
    .floating-nav {
      right: 1rem;
    }
    
    .nav-label {
      display: none;
    }
    
    .nav-link {
      padding: 1rem;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      justify-content: center;
    }
    
    .traits-carousel {
      grid-template-columns: 1fr;
    }
    
    .gallery-grid {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    }
  }
  
  @media (max-width: 768px) {
    .hero-title {
      font-size: 3rem;
    }
    
    .hero-subtitle {
      font-size: 1.2rem;
    }
    
    .hero-stats {
      gap: 1rem;
    }
    
    .stat-item {
      min-width: 100px;
      padding: 1rem;
    }
    
    .stat-icon {
      width: 40px;
      height: 40px;
      font-size: 1.2rem;
    }
    
    .stat-value {
      font-size: 1.5rem;
    }
    
    .section-title {
      font-size: 2rem;
    }
    
    .love-timeline {
      display: block;
    }
    
    .timeline-progress {
      display: none;
    }
    
    .timeline-point {
      position: relative;
      left: 0;
      margin-bottom: 2rem;
    }
    
    .point-content {
      opacity: 1;
      transform: none;
    }
    
    .family-tree {
      overflow-x: auto;
    }
    
    .lightbox-prev {
      left: 10px;
    }
    
    .lightbox-next {
      right: 10px;
    }
  }
  
  @media (max-width: 480px) {
    .container {
      padding: 0 1rem;
    }
    
    .hero-title {
      font-size: 2.5rem;
    }
    
    .hero-subtitle {
      font-size: 1rem;
    }
    
    .card-inner {
      padding: 2rem 1.5rem;
    }
    
    .section-title {
      font-size: 1.8rem;
    }
    
    .biography-card {
      padding: 1.5rem;
    }
    
    .bio-text {
      font-size: 1rem;
    }
    
    .model-image {
      max-width: 100%;
    }
    
    .details-card {
      border-radius: 1rem;
    }
    
    .card-header {
      flex-direction: column;
      text-align: center;
      padding: 1.5rem;
    }
    
    .header-icon {
      width: 60px;
      height: 60px;
      font-size: 1.5rem;
    }
    
    .header-content h3 {
      font-size: 1.5rem;
    }
    
    .card-body {
      padding: 1.5rem;
    }
    
    .card-body p {
      font-size: 1rem;
    }
    
    .event-quote p {
      font-size: 1.1rem;
    }
    
    .gallery-grid {
      grid-template-columns: 1fr;
    }
    
    .gallery-item {
      height: 200px;
    }
    
    .book-cover {
      padding: 2rem;
    }
    
    .book-pages {
      padding: 2rem 1.5rem;
    }
    
    .traditions-wheel {
      transform: scale(0.8);
    }
    
    .tradition-tooltip {
      min-width: 150px;
      top: -100px;
    }
    
    .floating-nav {
      bottom: 1rem;
      right: 50%;
      transform: translateX(50%);
      flex-direction: row;
      gap: 0.5rem;
    }
    
    .scroll-top {
      bottom: 5rem;
    }
  }
  
  /* ===== ОПТИМИЗАЦИЯ ПРОИЗВОДИТЕЛЬНОСТИ ===== */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
    
    .parallax-layer {
      transform: none !important;
    }
    
    .character-3d-card {
      transform: none !important;
    }
  }
  
  /* ===== ТЁМНАЯ ТЕМА (по умолчанию) ===== */
  @media (prefers-color-scheme: dark) {
    :root {
      --bg-dark: #0a0a0a;
      --bg-section: #0f0f0f;
      --bg-card: #1a1a1a;
    }
  }
  
  /* ===== ПЕЧАТЬ ===== */
  @media print {
    .floating-nav,
    .scroll-top,
    .progress-bar,
    .animated-background,
    .scroll-indicator {
      display: none !important;
    }
    
    .character-story {
      background: white;
      color: black;
    }
    
    .section-title,
    .text-accent {
      color: black !important;
      -webkit-text-fill-color: black !important;
    }
    
    .hero-section {
      height: auto;
      min-height: auto;
      page-break-after: always;
    }
    
    .story-section,
    .felix-section,
    .felli-section {
      page-break-inside: avoid;
    }
  }
</style>