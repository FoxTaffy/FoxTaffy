<template>
  <!-- Интерактивная история любви Felix & Taffy с оптимизированным дизайном -->
  <div class="felix-universe">
    <!-- Упрощенный космический фон с меньшим количеством элементов -->
    <div class="cosmic-background">
      <div class="stars-layer">
        <div 
          v-for="n in 15" 
          :key="`star-${n}`" 
          class="star" 
          :style="generateStarStyle()"
        ></div>
      </div>
      <div class="aurora-layer">
        <div class="aurora aurora-1"></div>
        <div class="aurora aurora-2"></div>
      </div>
    </div>

    <!-- Героический раздел с оптимизированным параллакс эффектом -->
    <section class="hero-universe">
      <div class="hero-background">
        <img 
          src="https://plugjsubjcfblzkabjia.supabase.co/storage/v1/object/public/gallery/arts/1755535026253_tqx7wooiy3.png" 
          alt="Felix & Fox Taffy" 
          class="hero-bg-image"
          loading="lazy"
          ref="parallaxImageRef"
        >
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-container">
        <div class="cosmic-title">
          <h1 class="universe-title">
            <span 
              v-for="(word, index) in titleWords" 
              :key="`title-${index}`"
              class="title-word" 
              :style="{ animationDelay: `${0.2 * (index + 1)}s` }"
            >
              {{ word }}
            </span>
          </h1>
          <div class="subtitle-constellation">
            <span class="constellation-text">Felix & Taffy</span>
            <div class="constellation-line"></div>
            <span class="year-badge">2020 - До конца жизни</span>
          </div>
          
          <div class="scroll-indicator">
            <span>ЛИСТАЙ ВНИЗ</span>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path d="M12 5L12 19M12 19L19 12M12 19L5 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- Закрепленная навигация с улучшенным дизайном -->
    <nav class="story-navigation fixed-nav">
      <div class="nav-glass">
        <div class="nav-items">
          <button
            v-for="navItem in navigationItems"
            :key="navItem.id"
            :class="['nav-link', { active: activeSection === navItem.id }]"
            @click="navigateToSection(navItem.id)"
          >
            <i :class="navItem.icon"></i>
            <span>{{ navItem.label }}</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Основной контент с улучшенной структурой -->
    <main class="story-cosmos">
      
      <!-- 1. Начало истории -->
      <section id="beginning" class="story-chapter">
        <div class="chapter-container">
          <div class="chapter-header">
            <div class="chapter-number">01</div>
            <h2 class="chapter-title">Как всё начиналось</h2>
            <div class="chapter-subtitle">Discord • CS:GO • 2020</div>
          </div>
          
          <div class="story-flow">
            <div 
              v-for="(moment, index) in storyMoments" 
              :key="`moment-${index}`"
              class="story-moment"
              :class="{ 'quote-moment': moment.isQuote }"
            >
              <div class="moment-content glass-panel" :class="{ 'quote-panel': moment.isQuote }">
                <div v-if="!moment.isQuote" class="moment-icon">
                  <i :class="moment.icon"></i>
                </div>
                <div v-if="moment.isQuote" class="quote-mark">"</div>
                <div class="moment-text">
                  <h3 v-if="!moment.isQuote">{{ moment.title }}</h3>
                  <blockquote v-if="moment.isQuote">{{ moment.text }}</blockquote>
                  <p v-else>{{ moment.text }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. Наши путешествия - оптимизированные -->
      <section id="travels" class="story-chapter">
        <div class="chapter-container">
          <div class="chapter-header">
            <div class="chapter-number">02</div>
            <h2 class="chapter-title">Наши путешествия</h2>
            <div class="chapter-subtitle">Карта наших приключений</div>
          </div>
          
          <div class="travels-showcase">
            <!-- Упрощенные элементы управления -->
            <div class="travels-controls">
              <button 
                class="control-btn prev" 
                @click="prevJourney" 
                :disabled="currentJourneyIndex === 0"
                aria-label="Previous journey"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              
              <div class="travels-dots">
                <button 
                  v-for="(journey, index) in journeys" 
                  :key="`dot-${index}`"
                  class="travel-dot" 
                  :class="{ active: currentJourneyIndex === index }"
                  @click="currentJourneyIndex = index"
                  :aria-label="`Journey ${journey.year}`"
                >
                  {{ journey.year }}
                </button>
              </div>
              
              <button 
                class="control-btn next" 
                @click="nextJourney" 
                :disabled="currentJourneyIndex === journeys.length - 1"
                aria-label="Next journey"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
            
            <!-- Оптимизированная карточка путешествия -->
            <div class="journey-display">
              <div class="journey-card glass-panel">
                <div class="journey-image">
                  <img 
                    :src="journeys[currentJourneyIndex].image" 
                    :alt="journeys[currentJourneyIndex].title"
                    loading="lazy"
                  >
                  <div class="journey-badge">{{ journeys[currentJourneyIndex].date }}</div>
                </div>
                <div class="journey-content">
                  <h3 class="journey-title">{{ journeys[currentJourneyIndex].title }}</h3>
                  <div class="journey-text">
                    <p class="journey-description">{{ journeys[currentJourneyIndex].description }}</p>
                    <div v-if="journeys[currentJourneyIndex].highlight" class="journey-highlight">
                      <div class="highlight-icon">✨</div>
                      <p class="highlight-text">{{ journeys[currentJourneyIndex].highlight }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. Фелли с происхождением имени и наследием -->
      <section id="felli" class="story-chapter felli-chapter">
        <div class="chapter-container">
          <div class="chapter-header">
            <div class="chapter-number">03</div>
            <h2 class="chapter-title">Наш сын Фелли</h2>
            <div class="chapter-subtitle">Лис-енотовидный • Воплощение нашей любви</div>
          </div>
          
          <div class="felli-showcase-new">
            <!-- Происхождение имени с анимированной формулой -->
            <div class="felli-origin glass-panel">
              <div class="origin-content">
                <div class="origin-icon">💡</div>
                <h3>Происхождение имени</h3>
                <div class="name-formula">
                  <span class="name-part taffy">Taffy</span>
                  <span class="plus">+</span>
                  <span class="name-part felix">Felix</span>
                  <span class="equals">=</span>
                  <span class="name-part result">Felly</span>
                </div>
                <p>Имя Фелли родилось из слияния наших имён, символизируя единство и крепкую связь между нами. Каждый слог несёт частичку нашей любви.</p>
              </div>
            </div>
            
            <!-- Портрет и варианты Фелли -->
            <div class="felli-hero glass-panel">
              <div class="felli-portrait">
                <div class="portrait-container">
                  <img 
                    :src="fellyArtworks[currentFellyIndex].src" 
                    :alt="fellyArtworks[currentFellyIndex].title" 
                    class="main-portrait"
                    loading="lazy"
                  >
                  <div class="portrait-ring"></div>
                </div>
                <div class="felli-info">
                  <h3 class="felli-name">ФЕЛЛИ</h3>
                  <span class="felli-type">🦊 Лис-енотовидный 🦌</span>
                  <p class="felli-intro">Воплощение нашей любви и творческой энергии. Каждая деталь продумана с заботой.</p>
                </div>
              </div>
              
              <!-- Варианты персонажа -->
              <div class="felli-variants">
                <h4>Варианты персонажа</h4>
                <div class="variants-grid">
                  <div 
                    v-for="(artwork, index) in fellyArtworks" 
                    :key="`artwork-${index}`"
                    class="variant-item" 
                    :class="{ active: currentFellyIndex === index }"
                    @click="currentFellyIndex = index"
                  >
                    <img 
                      :src="artwork.src" 
                      :alt="artwork.title"
                      loading="lazy"
                    >
                    <span class="variant-name">{{ artwork.title }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Наследие от родителей с иконками -->
            <div class="felli-heritage">
              <div 
                v-for="heritage in heritageData" 
                :key="heritage.id"
                class="heritage-card glass-panel"
                :class="heritage.className"
              >
                <div class="heritage-header">
                  <div class="heritage-icon">{{ heritage.emoji }}</div>
                  <h4>{{ heritage.title }}</h4>
                </div>
                <div class="heritage-abilities">
                  <div 
                    v-for="ability in heritage.abilities" 
                    :key="ability.name"
                    class="ability"
                  >
                    <i :class="ability.icon"></i>
                    <span>{{ ability.name }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Цитата о Фелли -->
            <div class="felli-quote glass-panel">
              <div class="quote-icon">💫</div>
              <blockquote>
                "В его глазах живёт наша история, а в улыбке — надежда на будущие приключения вместе"
              </blockquote>
              <cite>— Fox Taffy & Felix</cite>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. Галерея с оптимизированной загрузкой -->
      <section id="gallery" class="story-chapter gallery-chapter fullwidth">
        <div class="chapter-header">
          <div class="chapter-number">04</div>
          <h2 class="chapter-title">Галерея воспоминаний</h2>
          <div class="chapter-subtitle">Наши моменты в кадре</div>
        </div>
        
        <div class="gallery-showcase">
          <!-- Состояние загрузки -->
          <div v-if="isGalleryLoading" class="gallery-loading">
            <div class="loading-spinner">
              <div class="spinner"></div>
            </div>
            <p class="loading-text">Загружаем воспоминания...</p>
          </div>
          
          <!-- Состояние ошибки -->
          <div v-else-if="galleryError" class="gallery-error">
            <div class="error-icon">⚠️</div>
            <p class="error-text">{{ galleryError }}</p>
            <p class="error-subtext">Используем резервные изображения</p>
          </div>
          
          <!-- Упрощенная галерея изображений без лайтбокса -->
          <div v-else class="gallery-grid">
            <div 
              v-for="(photo, index) in galleryPhotos" 
              :key="`photo-${index}`"
              class="gallery-item"
            >
              <div class="gallery-image">
                <img 
                  :src="photo.src" 
                  :alt="photo.caption"
                  loading="lazy"
                  decoding="async"
                >
              </div>
              <div class="gallery-caption">
                <p>{{ photo.caption }}</p>
              </div>
            </div>
          </div>
          
          <div class="gallery-controls">
            <div class="gallery-info">
              <span class="gallery-count">{{ galleryPhotos.length }} воспоминаний</span>
            </div>
            <div class="gallery-buttons">
              <a 
                href="https://foxtaffy.fun/gallery" 
                target="_blank" 
                class="gallery-btn external"
                rel="noopener noreferrer"
              >
                <i class="fas fa-external-link-alt"></i>
                <span>Полная галерея</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. Факты с временной линией -->
      <section id="facts" class="story-chapter facts-section">
        <div class="chapter-container">
          <div class="chapter-header">
            <div class="chapter-number">05</div>
            <h2 class="chapter-title">10 фактов о нас</h2>
            <div class="chapter-subtitle">Интересные моменты нашей истории</div>
          </div>
          
          <div class="facts-timeline">
            <div class="timeline-line"></div>
            <div class="facts-list">
              <div 
                v-for="(fact, index) in factsData" 
                :key="`fact-${index}`"
                class="fact-item" 
                :class="{ active: selectedFactIndex === index }"
                @click="toggleFact(index)"
                role="button"
                tabindex="0"
                @keydown.enter="toggleFact(index)"
                @keydown.space="toggleFact(index)"
                :style="{ animationDelay: `${0.1 * (index + 1)}s` }"
              >
                <div class="fact-number">{{ String(index + 1).padStart(2, '0') }}</div>
                <div class="fact-icon">
                  <i :class="fact.icon"></i>
                </div>
                <div class="fact-content">
                  <h3 class="fact-title">{{ fact.title }}</h3>
                  <p v-if="selectedFactIndex === index" class="fact-description">
                    {{ fact.description }}
                  </p>
                </div>
                <div class="fact-arrow">
                  <i 
                    class="fas fa-chevron-down" 
                    :class="{ rotated: selectedFactIndex === index }"
                  ></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. Письмо любви -->
      <section id="letter" class="story-chapter letter-chapter">
        <div class="chapter-container">
          <div class="chapter-header">
            <div class="chapter-number">06</div>
            <h2 class="chapter-title">Моя половинка</h2>
            <div class="chapter-subtitle">Письмо от сердца к сердцу</div>
          </div>
          
          <div class="love-letter-cosmos">
            <div class="letter-paper glass-panel">
              <div class="letter-header">
                <div class="letter-hearts">
                  <span 
                    v-for="(heart, index) in ['💙', '💜', '🧡']" 
                    :key="`heart-${index}`"
                    class="heart" 
                    :style="{ animationDelay: `${index}s` }"
                  >
                    {{ heart }}
                  </span>
                </div>
                <h3>Для Felix</h3>
              </div>
              
              <div class="letter-content">
                <p 
                  v-for="(paragraph, index) in letterParagraphs" 
                  :key="`paragraph-${index}`"
                  class="letter-paragraph"
                >
                  {{ paragraph }}
                </p>
              </div>
              
              <div class="letter-signature">
                <div class="signature-line">
                  <span class="signature-text">С любовью,</span>
                  <span class="signature-name">Fox Taffy</span>
                </div>
                <div class="signature-emoji">🦊</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Обновленный футер -->
    <footer class="cosmos-footer">
      <div class="footer-content glass-panel">
        <div class="footer-copyright">
          <div class="copyright-text">
            <span>© 2025 Fox Taffy</span>
            <span class="separator">|</span>
            <a href="https://foxtaffy.fun" target="_blank" rel="noopener noreferrer">FoxTaffy.fun</a>
            <span class="separator">|</span>
            <span class="version">v.2.0</span>
          </div>
          <div class="footer-subtitle">
            Сделано с любовью для лучшего человека в моей жизни 💕
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useHead } from '@vueuse/head'
import FelixImage from '@/assets/Felix/Felix.jpg'
// ✅ Используем правильный API из supabase.js
import { furryApi } from '../config/supabase.js'

// Типизация для структур данных
interface NavigationItem {
  id: string
  label: string
  icon: string
}

interface StoryMoment {
  title?: string
  text: string
  icon?: string
  isQuote?: boolean
}

interface Journey {
  title: string
  date: string
  year: string
  description: string
  highlight?: string
  image: string
}

interface FellyArtwork {
  src: string
  title: string
  author: string
  caption: string
}

interface Heritage {
  id: string
  title: string
  emoji: string
  className: string
  abilities: Array<{ name: string; icon: string }>
}

interface Fact {
  icon: string
  title: string
  description: string
}

interface GalleryPhoto {
  src: string
  caption: string
  title?: string
}

// Реактивное состояние компонента
const activeSection = ref<string>('beginning')
const currentJourneyIndex = ref<number>(0)
const currentFellyIndex = ref<number>(0)
const selectedFactIndex = ref<number | null>(null)

// Состояние загрузки галереи
const isGalleryLoading = ref<boolean>(true)
const galleryError = ref<string | null>(null)

// Ссылки на DOM элементы
const parallaxImageRef = ref<HTMLImageElement>()

// Данные заголовка
const titleWords = ref<string[]>(['История', 'нашей', 'любви'])

useHead({
  title: "Felix & Fox Taffy — История нашей любви",
  meta: [
    {
      name: "description",
      content: "История любви Felix и Fox Taffy с 2020 года до бесконечности: первые встречи, путешествия, Фелли, воспоминания и письмо от сердца."
    },
    {
      name: "keywords",
      content: "Felix, Fox Taffy, любовь, история, фурри, отношения, Фелли, путешествия, галерея, факты"
    },
    {
      property: "og:title",
      content: "Felix & Fox Taffy — История нашей любви"
    },
    {
      property: "og:description",
      content: "Путь двух сердец: от Discord и CS:GO до путешествий, сына Фелли и жизни вместе."
    },
    {
      property: "og:image",
      content: FelixImage
    },
    {
      property: "og:type",
      content: "article"
    },
    {
      property: "og:site_name",
      content: "FoxTaffy.fun"
    },
    {
      name: "twitter:card",
      content: "summary_large_image"
    },
    {
      name: "twitter:title",
      content: "Felix & Fox Taffy — История нашей любви"
    },
    {
      name: "twitter:description",
      content: "Наша история: встречи, путешествия, Фелли, факты и письмо от сердца ❤️"
    },
    {
      name: "twitter:image",
      content: FelixImage
    }
  ],
  link: [
    {
      rel: "canonical",
      href: "https://foxtaffy.fun/felix"
    }
  ]
})

// Навигационные элементы
const navigationItems = ref<NavigationItem[]>([
  { id: 'beginning', label: 'Начало', icon: 'fas fa-play' },
  { id: 'travels', label: 'Путешествия', icon: 'fas fa-map-marked-alt' },
  { id: 'felli', label: 'Фелли', icon: 'fas fa-paw' },
  { id: 'gallery', label: 'Галерея', icon: 'fas fa-images' },
  { id: 'facts', label: 'Факты', icon: 'fas fa-star' },
  { id: 'letter', label: 'Послание', icon: 'fas fa-heart' }
])

// Моменты истории
const storyMoments = ref<StoryMoment[]>([
  {
    title: 'Первая встреча',
    text: 'Наша история началась неожиданно в 2020 году, когда мы встретились в Discord сервере во время игры в CS:GO. Felix — замечательный и солнечный человек, который понравился мне своим характером и геймплеем. С первых минут знакомства он покорил меня.',
    icon: 'fab fa-discord'
  },
  {
    title: 'Сердца сближаются',
    text: 'Наше общение быстро переросло в нечто большее — сначала долгие разговоры до ночи, затем совместные дуо игры, и вот уже мы не представляли своих дней друг без друга. Наша связь крепла с каждой встречей.',
    icon: 'fas fa-heart-pulse'
  },
  {
    text: 'Иногда один взгляд говорит больше тысячи слов, а встреча с правильным человеком меняет всю твою жизнь',
    isQuote: true
  }
])

// Данные путешествий с улучшенной читаемостью
const journeys = ref<Journey[]>([
  {
    title: "Первая встреча",
    date: "Август 2022",
    year: "2022",
    description: "Наша первая встреча началась в Челябинске. Мы много гуляли по городу, часто купались на карьерах. По пути в Екатеринбург заехали в Кыштым, где провели время с Фиском. В Екатеринбурге гуляли с Простиком, посетили аквапарк и кибер-клуб, где провели незабываемую ночь.",
    highlight: "Лето с любимым человеком — это незабываемое время. Хочется, чтобы оно длилось вечно.",
    image: "https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/IMG20220812161755.jpg"
  },
  {
    title: "Поездка в Санкт-Петербург",
    date: "Декабрь 2022",
    year: "2022",
    description: "Зима в Петербурге оказалась суровой. Прогулки давались тяжело, но нас ждал тёплый приём. Вовик приютил нас на всё время поездки. Город раскрылся во всей своей романтической красе. В нём множество ресторанов, кафе и уникальных мест.",
    highlight: "Суровый зимний Питер > Забота любимого Человека с 2х недельным пловом.",
    image: "https://sun9-41.userapi.com/impg/5VQxr_0GrCyYoUTa6xdOU21brbom_6lGzV2K2w/YtEmSuXRJ-w.jpg?size=1280x960&quality=96&sign=a9975827c9e8f7994bd974d896cc2beb&type=album"
  },
  {
    title: "Переезд в Челябинск",
    date: "Январь 2024 - Август 2024",
    year: "2024",
    description: "Важный этап в нашей жизни - совместный переезд и начало новой главы нашей истории в Челябинске. Время адаптации, новых открытий и укрепления наших отношений.",
    highlight: "Обустройство общего дома и создание нашего уютного пространства.",
    image: "https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/IMG20240110163945.jpg"
  },
  {
    title: "Зимняя сказка в Таганае",
    date: "Февраль 2024",
    year: "2024",
    description: "Зимние каникулы мы решили провести в заснеженном Таганае. Прогулки в заброшенную шахту, ледяные пещеры и уютно провести ночь просматривая фильмы — это путешествие подарило нам столько незабываемых воспоминаний.",
    highlight: "Я впервые встал на лыжи и, несмотря на множество падений, продолжал пробовать с таким энтузиазмом, что к концу дня уже уверенно спускался с пробитой печенью.",
    image: "https://sun9-37.userapi.com/impg/mu692ERc9kJ5iPk5Oh9Qh9As2Sfdv6GkO-UIiw/GUq0EqcQekk.jpg?size=2560x1440&quality=95&sign=71298950d9d4e701681bcc4be71e5870&type=album"
  },
  {
    title: "Новый год в Москве",
    date: "Апрель 2024",
    year: "2024",
    description: "Поездка Феликса в Москву в предновогодние праздники были для меня очень ошеломительными. Гулял по Москве вместе со своими друзьями и Ваней я даже не замечал что болел всё это время. Ночная Москва покорила наши сердца своей мощью и красотой.",
    highlight: "Новый год прошёл очень хорошо, вынесло конечно от егеря, но это того стоит.",
    image: "https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/20241229_162506.jpg"
  },
  {
    title: "Новые горизонты",
    date: "Скоро...",
    year: "2025",
    description: "Наши планы на будущее полны новых маршрутов и приключений. Мы мечтаем о поездке в Японию, исследовании Норвегии и путешествии по Транссибирской магистрали. Каждый день с Felix — это новое приключение.",
    highlight: "Самое важное не место, а человек, с которым ты разделяешь эти моменты.",
    image: "https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/IMG20230723080549.jpg"
  }
])

// Галерея артов Фелли
const fellyArtworks = ref<FellyArtwork[]>([
  { 
    src: "https://plugjsubjcfblzkabjia.supabase.co/storage/v1/object/public/gallery/avatars/Felly.jpg",
    title: "Основной дизайн",
    author: "Fox Taffy & Felix",
    caption: "Первый официальный арт нашего персонажа Фелли"
  },
  { 
    src: "https://plugjsubjcfblzkabjia.supabase.co/storage/v1/object/public/gallery/avatars/Felly1.jpg",
    title: "Игривая версия",
    author: "Fox Taffy",
    caption: "Фелли в игривом настроении, показывает свой характер"
  },
  { 
    src: "https://plugjsubjcfblzkabjia.supabase.co/storage/v1/object/public/gallery/avatars/Felly3.jpg",
    title: "Милый стиль",
    author: "Felix",
    caption: "Более мягкая и милая интерпретация персонажа"
  },
  {
    src: "https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/referencefelly.png",
    title: "Референс-лист",
    author: "Fox Taffy & Felix", 
    caption: "Полный референс персонажа со всеми деталями и цветовой схемой"
  }
])

// Наследие от родителей с иконками
const heritageData = ref<Heritage[]>([
  {
    id: 'felix-heritage',
    title: 'От Felix',
    emoji: '🦌',
    className: 'felix-heritage',
    abilities: [
      { name: 'Игривость', icon: 'fas fa-sun' },
      { name: 'Внутренний свет', icon: 'fas fa-star' },
      { name: 'Душевность', icon: 'fas fa-heart' }
    ]
  },
  {
    id: 'taffy-heritage',
    title: 'От Taffy',
    emoji: '🦊',
    className: 'taffy-heritage',
    abilities: [
      { name: 'Энергия', icon: 'fas fa-bolt' },
      { name: 'Активность', icon: 'fas fa-running' },
      { name: 'Хитрость', icon: 'fas fa-brain' },
      { name: 'Яркость', icon: 'fas fa-fire' }
    ]
  },
  {
    id: 'unique-heritage',
    title: 'Уникальная магия',
    emoji: '✨',
    className: 'unique-heritage',
    abilities: [
      { name: 'Енотовидность', icon: 'fas fa-yin-yang' },
      { name: 'Связующее звено', icon: 'fas fa-link' },
      { name: 'Геймерский дух', icon: 'fas fa-gamepad' }
    ]
  }
])

// Основная галерея фотографий - теперь загружается из Supabase
const galleryPhotos = ref<GalleryPhoto[]>([])

// Факты с временной линией
const factsData = ref<Fact[]>([
  {
    icon: "fas fa-gamepad",
    title: "Геймеры навсегда",
    description: "Обожаем играть вместе в кооперативные игры. Наши любимые — Minecraft и CS2. Познакомились именно через CS:GO!"
  },
  {
    icon: "fas fa-film",
    title: "Киномарафоны",
    description: "Люблю показывать смешные видео TikTok с Феликсом. Так же у нас есть традиция - смотреть фильмы по выходным с попкорном."
  },
  {
    icon: "fas fa-utensils",
    title: "Кулинарные эксперименты",
    description: "Каждые выходные мы готовим что-то новое. Felix отвечает за основные блюда, я — за десерты. Наша специальность — домашняя пицца!"
  },
  {
    icon: "fas fa-paw",
    title: "Фурри-культура",
    description: "Наши фурсьюты скоро будут часто попадаться на конвертах вместе."
  },
  {
    icon: "fas fa-music",
    title: "Общие плейлисты",
    description: "У нас общий плейлист из 500+ песен. Мы оба любим поп и инди-рок."
  },
  {
    icon: "fas fa-map-marked-alt",
    title: "Путешественники",
    description: "За время отношений мы посетили вместе 6 городов и планируем поездку в США. Каждое путешествие — новые воспоминания."
  },
  {
    icon: "fas fa-calendar-heart",
    title: "Особые даты",
    description: "Наша первая встреча была в августе 2022 года. С тех пор каждые полгода мы отмечаем маленькие годовщины."
  },
  {
    icon: "fas fa-star",
    title: "Загадывание желаний",
    description: "У нас есть традиция загадывать желания на падающие звезды. Пока сбылось 7 из 12 загаданных желаний!"
  },
  {
    icon: "fas fa-heart",
    title: "Язык любви",
    description: "Мы общаемся на особом языке мемов, внутренних шуток и нежных прозвищ. Felix называет меня 'Тиффани', а я его 'Ванька'."
  }
])

// Параграфы письма
const letterParagraphs = ref<string[]>([
  'Felix, ты наполнил мою жизнь красками, смыслом и радостью. Каждый день рядом с тобой — это дар. Твоя улыбка освещает даже самые темные дни, а твоя поддержка дает силы двигаться вперед.',
  'Наша история только начинается, и я с нетерпением жду каждой новой главы, каждого нового приключения, каждого нового дня, проведенного вместе. Спасибо, что ты есть в моей жизни, моя любовь.'
])

// Методы компонента

/**
 * Генерирует случайные стили для звезд в фоне (оптимизированная версия)
 * @returns Объект с CSS-стилями для позиционирования и анимации звезд
 */
const generateStarStyle = () => ({
  left: Math.random() * 100 + '%',
  top: Math.random() * 100 + '%',
  animationDelay: Math.random() * 3 + 's',
  animationDuration: (Math.random() * 2 + 1.5) + 's'
})

/**
 * Навигация к указанной секции с плавным скроллом
 * @param sectionId - ID целевой секции
 */
const navigateToSection = (sectionId: string) => {
  activeSection.value = sectionId
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

/**
 * Переключение на предыдущее путешествие в карусели
 */
const prevJourney = () => {
  if (currentJourneyIndex.value > 0) {
    currentJourneyIndex.value--
  } else {
    currentJourneyIndex.value = journeys.value.length - 1
  }
}

/**
 * Переключение на следующее путешествие в карусели
 */
const nextJourney = () => {
  if (currentJourneyIndex.value < journeys.value.length - 1) {
    currentJourneyIndex.value++
  } else {
    currentJourneyIndex.value = 0
  }
}

/**
 * Переключение отображения описания факта
 * @param index - Индекс факта
 */
const toggleFact = (index: number) => {
  selectedFactIndex.value = selectedFactIndex.value === index ? null : index
}

/**
 * Оптимизированный обработчик скролла для параллакс эффекта с throttling
 */
let ticking = false
const handleScroll = () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const scrollPosition = window.scrollY
      if (parallaxImageRef.value) {
        parallaxImageRef.value.style.transform = `translate3d(0, ${scrollPosition * 0.3}px, 0)`
      }
      ticking = false
    })
    ticking = true
  }
}

/**
 * Оптимизированная инициализация Intersection Observer
 */
const initializeIntersectionObserver = () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in')
        // Отключаем наблюдение после анимации для оптимизации
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  // Наблюдение за элементами для анимации - оптимизированный список
  nextTick(() => {
    document.querySelectorAll('.story-chapter, .story-moment, .fact-item').forEach(el => {
      observer.observe(el)
    })
  })
}

/**
 * ✅ ОПТИМИЗИРОВАННАЯ загрузка артов Felix (умный поиск)
 * @returns Promise с массивом артов
 */
const loadFelixGallery = async (): Promise<GalleryPhoto[]> => {
  try {
    isGalleryLoading.value = true
    galleryError.value = null

    console.log('🔍 Загрузка артов Felix...')

    // ✅ ШАГ 1: Пробуем поиск по тегу "Felix"
    let felixArts = await furryApi.getFurryArts({
      tags: ['Felix'],
      limit: 50,
      showNsfw: false,
      sort: 'newest'
    })

    // ✅ ШАГ 2: Если нет тега, ищем по названию
    if (felixArts.length === 0) {
      console.log('🔍 Поиск по тегам не дал результатов, ищем по названию...')
      felixArts = await furryApi.getFurryArts({
        search: 'Felix',
        limit: 50,
        showNsfw: false,
        sort: 'newest'
      })
    }

    // ✅ ШАГ 3: Если всё ещё пусто, ищем по персонажам
    if (felixArts.length === 0) {
      console.log('🦊 Ищем арты с персонажем Felix...')
      const allArts = await furryApi.getFurryArts({
        limit: 100,
        showNsfw: false,
        sort: 'newest'
      })
      
      felixArts = allArts.filter(art => 
        art.depicted_fursona_names?.some((name: string) => 
          name.toLowerCase().includes('felix')
        ) ||
        art.characters?.some((char: any) => 
          char.name?.toLowerCase().includes('felix')
        )
      )
      console.log(`🦊 По персонажам найдено: ${felixArts.length} артов`)
    }

    // ✅ РЕЗУЛЬТАТ
    if (felixArts.length > 0) {
      console.log(`✅ Успех! Найдено ${felixArts.length} артов Felix`)
      galleryError.value = null
      
      // Преобразуем данные из API в формат GalleryPhoto
      return felixArts.map((art: any) => ({
        src: art.thumbnail_url || art.image_url,
        caption: art.title || 'Арт без названия',
        title: art.title || 'Арт без названия'
      }))
    } else {
      console.log('🔭 Не найдено артов Felix ни по одному критерию')
      galleryError.value = 'В базе данных нет артов с персонажем Felix'
      
      // Возвращаем fallback данные
      return [
        { 
          src: "https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Felix%2F444kk.png", 
          caption: "Наша первая совместная поездка в лес",
          title: "Поездка в лес"
        },
        { 
          src: "https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Felix%2F%D0%B1%D0%B5%D1%80%D0%B5%D0%B3%D0%B8%D1%81%D1%8C%20.png", 
          caption: "Felix сделал этот снимок во время фотосессии",
          title: "Фотосессия на берегу"
        },
        { 
          src: "https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Felix%2Fzoktef3_5_1.png", 
          caption: "Подготовка к фурри-конвенту заняла два месяца",
          title: "Подготовка к конвенту"
        },
        { 
          src: "https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Felix%2Fzakaz__20250222081635.png", 
          caption: "Романтический вечер на побережье Финского залива",
          title: "Романтический вечер"
        },
        { 
          src: "https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Felix%2Fmoskva2.png", 
          caption: "Felix помогал мне с созданием этого референса",
          title: "Работа над референсом"
        },
        { 
          src: "https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Felix%2F6G7LwzjFE90.jpg", 
          caption: "Арт, который Felix заказал на нашу годовщину",
          title: "Подарок на годовщину"
        }
      ]
    }

  } catch (error) {
    console.error('💥 Ошибка при загрузке галереи:', error)
    galleryError.value = `Ошибка API: ${error.message}`
    
    // Возвращаем fallback данные при любой ошибке
    return [
      { 
        src: "https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Felix%2F444kk.png", 
        caption: "Наша первая совместная поездка в лес",
        title: "Поездка в лес"
      },
      { 
        src: "https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Felix%2F%D0%B1%D0%B5%D1%80%D0%B5%D0%B3%D0%B8%D1%81%D1%8C%20.png", 
        caption: "Felix сделал этот снимок во время фотосессии",
        title: "Фотосессия на берегу"
      },
      { 
        src: "https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Felix%2Fzoktef3_5_1.png", 
        caption: "Подготовка к фурри-конвенту заняла два месяца",
        title: "Подготовка к конвенту"
      },
      { 
        src: "https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Felix%2Fzakaz__20250222081635.png", 
        caption: "Романтический вечер на побережье Финского залива",
        title: "Романтический вечер"
      },
      { 
        src: "https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Felix%2Fmoskva2.png", 
        caption: "Felix помогал мне с созданием этого референса",
        title: "Работа над референсом"
      },
      { 
        src: "https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Felix%2F6G7LwzjFE90.jpg", 
        caption: "Арт, который Felix заказал на нашу годовщину",
        title: "Подарок на годовщину"
      }
    ]
  } finally {
    isGalleryLoading.value = false
  }
}

// Хуки жизненного цикла
onMounted(async () => {
  // Инициализация всех интерактивных элементов
  initializeIntersectionObserver()
  
  // Добавление обработчика скролла для параллакса - с оптимизацией
  window.addEventListener('scroll', handleScroll, { passive: true })
  
  // ✅ Загрузка данных галереи через правильный API
  console.log('🚀 Инициализация компонента, загрузка галереи через furryApi...')
  galleryPhotos.value = await loadFelixGallery()
  
  if (galleryPhotos.value.length > 0) {
    console.log(`📸 Галерея успешно загружена: ${galleryPhotos.value.length} изображений`)
  } else {
    console.log('🔭 Галерея пуста, возможно нет данных в БД')
  }
})

onUnmounted(() => {
  // Очистка обработчиков событий
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* Импорт внешних ресурсов */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

/* CSS-переменные для согласованного дизайна */
:root {
  --bg-dark: #0C1217;
  --bg-darker: #080E12;
  --text-light: #F2F2F2;
  --text-muted: #A0A0A0;
  --accent-teal: #4ECDC4;
  --accent-teal-dark: #35A29F;
  --accent-orange: #ff7b25;
  --accent-green: #4caf50;
  --shadow: rgba(0, 0, 0, 0.2);
  --transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

/* Базовые стили и сброс */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}



/* ОПТИМИЗИРОВАННЫЙ космический фон с меньшими ресурсами */
.cosmic-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 25%, #0f0f23 50%, #000 100%);
  will-change: transform;
}

.stars-layer {
  position: absolute;
  width: 100%;
  height: 100%;
}

.star {
  position: absolute;
  width: 1px;
  height: 1px;
  background: white;
  border-radius: 50%;
  animation: twinkle linear infinite;
  will-change: opacity, transform;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* ОПТИМИЗИРОВАННОЕ полярное сияние */
.aurora-layer {
  position: absolute;
  width: 100%;
  height: 100%;
}

.aurora {
  position: absolute;
  height: 100%;
  width: 150%;
  opacity: 0.1;
  animation: aurora-flow 25s ease-in-out infinite;
  will-change: transform;
}

.aurora-1 {
  background: linear-gradient(45deg, transparent, #667eea, transparent);
  left: -25%;
  animation-delay: 0s;
}

.aurora-2 {
  background: linear-gradient(135deg, transparent, #764ba2, transparent);
  right: -25%;
  animation-delay: 12s;
}

@keyframes aurora-flow {
  0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0.05; }
  50% { transform: translate3d(30px, 0, 0) rotate(1deg); opacity: 0.15; }
}

/* ОПТИМИЗИРОВАННЫЙ Glassmorphism эффект */
.glass-panel {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  contain: layout style;
}

.glass-panel:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* АДАПТИВНЫЙ героический раздел */
.hero-universe {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: clamp(1rem, 3vw, 2rem);
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.hero-bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(2px);
  will-change: transform;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, 
    rgba(0, 0, 0, 0.7) 0%, 
    rgba(26, 26, 46, 0.8) 25%, 
    rgba(22, 33, 62, 0.6) 50%, 
    rgba(15, 15, 35, 0.8) 100%);
  backdrop-filter: blur(1px);
}

.hero-container {
  max-width: clamp(300px, 90vw, 1000px);
  width: 100%;
  position: relative;
  z-index: 2;
  text-align: center;
}

.cosmic-title {
  text-align: center;
  margin-bottom: clamp(2rem, 6vw, 4rem);
}

/* МАСШТАБИРУЕМЫЕ размеры с clamp() */
.universe-title {
  font-size: clamp(2.5rem, 8vw, 6rem);
  font-weight: 900;
  line-height: 0.9;
  margin-bottom: clamp(1rem, 3vw, 2rem);
}

.title-word {
  display: block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #667eea 100%);
  background-size: 200% 200%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  animation: title-appear 0.8s ease forwards, cosmic-gradient 8s ease infinite;
  transform: translateY(50px);
  opacity: 0;
  will-change: transform, opacity;
}

@keyframes title-appear {
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes cosmic-gradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.subtitle-constellation {
  display: flex;
  flex-direction: column;
  gap: clamp(0.5rem, 2vw, 1rem);
  align-items: center;
}

.constellation-text {
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.constellation-line {
  width: clamp(120px, 30vw, 200px);
  height: 2px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 1px;
}

.year-badge {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  padding: clamp(0.4rem, 1.5vw, 0.5rem) clamp(1rem, 3vw, 1.5rem);
  border-radius: 50px;
  font-weight: 600;
  color: #667eea;
  backdrop-filter: blur(5px);
  font-size: clamp(0.8rem, 2vw, 1rem);
}

.scroll-indicator {
  margin-top: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.scroll-indicator span {
  font-size: 0.8rem;
  letter-spacing: 2px;
  font-weight: 500;
}

.scroll-indicator svg {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-8px); }
  60% { transform: translateY(-4px); }
}

/* АДАПТИВНАЯ навигация */
.story-navigation.fixed-nav {
  position: fixed;
  top: clamp(10px, 2vw, 20px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  margin: 0;
}

.nav-glass {
  background: rgba(12, 18, 23, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  padding: clamp(0.5rem, 1.5vw, 0.8rem);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.nav-items {
  display: flex;
  gap: clamp(0.2rem, 0.8vw, 0.3rem);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: clamp(0.4rem, 1vw, 0.6rem);
  padding: clamp(0.4rem, 1.2vw, 0.6rem) clamp(0.8rem, 2vw, 1.2rem);
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  border-radius: 40px;
  transition: all 0.3s ease;
  font-weight: 500;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: clamp(0.8rem, 1.8vw, 0.9rem);
}

.nav-link:hover,
.nav-link.active {
  background: rgba(102, 126, 234, 0.2);
  color: white;
  border: 1px solid rgba(102, 126, 234, 0.3);
  transform: translateY(-1px);
}

/* АДАПТИВНЫЙ основной контент */
.story-cosmos {
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(3rem, 8vw, 5rem) clamp(1rem, 3vw, 2rem) 0;
}

.story-chapter {
  margin-bottom: clamp(6rem, 15vw, 10rem);
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s ease;
}

.story-chapter.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.chapter-container {
  width: 100%;
}

.chapter-header {
  text-align: center;
  margin-bottom: clamp(2rem, 5vw, 3rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(0.5rem, 1.5vw, 0.8rem);
}

.chapter-number {
  font-size: clamp(0.9rem, 2vw, 1rem);
  color: #667eea;
  font-weight: 600;
  margin-bottom: clamp(0.3rem, 1vw, 0.5rem);
  opacity: 0.8;
}

.chapter-title {
  font-size: clamp(2rem, 6vw, 3.5rem);
  font-weight: 800;
  background: linear-gradient(135deg, #667eea, #764ba2);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  margin-bottom: clamp(0.3rem, 1vw, 0.5rem);
}

.chapter-subtitle {
  font-size: clamp(1rem, 2.5vw, 1.1rem);
  color: rgba(255, 255, 255, 0.6);
  font-weight: 400;
}

/* История */
.story-flow {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.story-moment {
  opacity: 0;
  transform: translateX(-30px);
  transition: all 0.5s ease;
}

.story-moment.animate-in {
  opacity: 1;
  transform: translateX(0);
}

.story-moment:nth-child(even) {
  transform: translateX(30px);
}

.story-moment:nth-child(even).animate-in {
  transform: translateX(0);
}

.moment-content {
  padding: 2rem;
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.moment-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.moment-text h3 {
  font-size: 1.6rem;
  margin-bottom: 0.8rem;
  color: white;
}

.moment-text p {
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
}

.quote-panel {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border-color: rgba(102, 126, 234, 0.2);
  text-align: center;
  flex-direction: column;
}

.quote-mark {
  font-size: 3rem;
  color: #667eea;
  opacity: 0.3;
  line-height: 1;
}

.quote-panel blockquote {
  font-size: 1.2rem;
  font-style: italic;
  color: rgba(255, 255, 255, 0.9);
  max-width: 600px;
}

/* ОПТИМИЗИРОВАННЫЕ путешествия */
.travels-showcase {
  max-width: 850px;
  margin: 0 auto;
}

.travels-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.control-btn {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  color: white;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.control-btn:hover:not(:disabled) {
  background: rgba(102, 126, 234, 0.2);
  transform: scale(1.05);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.travels-dots {
  display: flex;
  gap: 0.8rem;
}

.travel-dot {
  padding: 0.6rem 1rem;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  font-weight: 600;
  font-size: 0.85rem;
}

.travel-dot.active {
  background: rgba(102, 126, 234, 0.2);
  border-color: #667eea;
  color: white;
  transform: translateY(-1px);
}

.journey-display {
  max-width: 750px;
  margin: 0 auto;
}

.journey-card {
  padding: 0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.journey-card:hover {
  transform: translateY(-3px);
}

.journey-image {
  position: relative;
  height: 350px;
  overflow: hidden;
}

.journey-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.journey-card:hover .journey-image img {
  transform: scale(1.03);
}

.journey-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(102, 126, 234, 0.9);
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  backdrop-filter: blur(5px);
}

.journey-content {
  padding: 2rem;
}

.journey-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1.2rem;
}

.journey-text {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.journey-description {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  line-height: 1.6;
}

.journey-highlight {
  background: rgba(102, 126, 234, 0.15);
  border-radius: 12px;
  padding: 1.2rem;
  border-left: 3px solid #667eea;
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
}

.highlight-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.highlight-text {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.5;
  font-style: italic;
}

/* УЛУЧШЕННАЯ галерея без интерактивности */
.gallery-chapter.fullwidth {
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
  width: 100vw;
  max-width: none;
  padding: 0;
}

.gallery-chapter.fullwidth .chapter-header {
  margin-bottom: 2.5rem;
  padding: 0 2rem;
}

.gallery-showcase {
  width: 100%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.03), rgba(118, 75, 162, 0.03));
  padding: 3rem 0;
  position: relative;
}

/* АДАПТИВНАЯ СЕТКА ГАЛЕРЕИ */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  gap: clamp(1rem, 3vw, 2rem);
  padding: 0 clamp(1rem, 3vw, 2rem);
  max-width: 1400px;
  margin: 0 auto;
}

.gallery-item {
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 15px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.gallery-item:hover {
  transform: translateY(-5px);
}

.gallery-image {
  position: relative;
  width: 100%;
  height: clamp(250px, 40vw, 400px);
  overflow: hidden;
}

.gallery-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gallery-item:hover .gallery-image img {
  transform: scale(1.03);
}

.gallery-caption {
  padding: clamp(1rem, 2.5vw, 1.5rem);
  background: rgba(0, 0, 0, 0.8);
  color: white;
}

.gallery-caption p {
  font-size: clamp(0.85rem, 2vw, 0.95rem);
  line-height: 1.4;
  margin: 0;
  font-weight: 500;
}

/* Состояния загрузки для галереи */
.gallery-loading,
.gallery-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
}

.loading-spinner {
  margin-bottom: 1.2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(102, 126, 234, 0.2);
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  font-weight: 500;
}

.error-icon {
  font-size: 2.5rem;
  margin-bottom: 0.8rem;
}

.error-text {
  color: #ff6b6b;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
}

.error-subtext {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;
}

.gallery-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
}

.gallery-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.gallery-count {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  font-size: 1rem;
}

.gallery-buttons {
  display: flex;
  gap: 0.8rem;
}

.gallery-btn {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 500;
  text-decoration: none;
  backdrop-filter: blur(5px);
  font-family: inherit;
  font-size: 0.9rem;
}

.gallery-btn:hover {
  background: rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.5);
  transform: translateY(-1px);
}

/* Фелли секция - обновленная */
.felli-showcase-new {
  display: grid;
  gap: 2.5rem;
}

.felli-origin {
  padding: 2rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(240, 147, 251, 0.1));
  border-color: rgba(102, 126, 234, 0.3);
}

.origin-content {
  text-align: center;
}

.origin-icon {
  font-size: 2.5rem;
  margin-bottom: 1.2rem;
  display: block;
}

.origin-content h3 {
  font-size: 1.8rem;
  color: #667eea;
  margin-bottom: 1.5rem;
}

.name-formula {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.name-part {
  font-size: 1.3rem;
  font-weight: 700;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  backdrop-filter: blur(5px);
}

.name-part.taffy {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: white;
}

.name-part.felix {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.name-part.result {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  color: white;
  animation: glow 3s ease-in-out infinite;
}

.plus, .equals {
  font-size: 1.5rem;
  color: #667eea;
  font-weight: 700;
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 15px rgba(78, 205, 196, 0.3); }
  50% { box-shadow: 0 0 25px rgba(78, 205, 196, 0.6), 0 0 35px rgba(78, 205, 196, 0.3); }
}

.origin-content p {
  font-size: 1rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
  max-width: 550px;
  margin: 0 auto;
}

.felli-hero {
  padding: 2.5rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
  align-items: center;
}

.felli-portrait {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.portrait-container {
  position: relative;
  width: 250px;
  height: 250px;
}

.main-portrait {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.portrait-container:hover .main-portrait {
  transform: scale(1.03);
}

.portrait-ring {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border: 2px solid transparent;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2, #f093fb) border-box;
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask-composite: subtract;
  animation: rotate-ring 12s linear infinite;
}

@keyframes rotate-ring {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.felli-info {
  text-align: center;
}

.felli-name {
  font-size: 2.2rem;
  font-weight: 900;
  background: linear-gradient(45deg, #667eea, #764ba2);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  margin-bottom: 0.4rem;
}

.felli-type {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.8rem;
  display: block;
}

.felli-intro {
  font-size: 1rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.7);
}

.felli-variants h4 {
  font-size: 1.2rem;
  color: #667eea;
  margin-bottom: 1.2rem;
  text-align: center;
}

.variants-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;
}

.variant-item {
  padding: 0.8rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  border: 2px solid transparent;
  background: rgba(255, 255, 255, 0.02);
}

.variant-item.active,
.variant-item:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-3px);
}

.variant-item img {
  width: 100%;
  height: 70px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 0.4rem;
}

.variant-name {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.felli-heritage {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.heritage-card {
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.heritage-card:hover {
  transform: translateY(-5px);
}

.heritage-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
}

.heritage-icon {
  font-size: 2rem;
}

.heritage-card h4 {
  font-size: 1.2rem;
  color: white;
  margin: 0;
}

.heritage-abilities {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.ability {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.ability:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(3px);
}

.ability i {
  color: #667eea;
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.ability span {
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
}

.felix-heritage {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border-color: rgba(102, 126, 234, 0.3);
}

.taffy-heritage {
  background: linear-gradient(135deg, rgba(240, 147, 251, 0.1), rgba(245, 87, 108, 0.1));
  border-color: rgba(240, 147, 251, 0.3);
}

.unique-heritage {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(240, 147, 251, 0.1));
  border-color: rgba(102, 126, 234, 0.3);
}

.felli-quote {
  padding: 2.5rem;
  text-align: center;
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.1), rgba(102, 126, 234, 0.1));
  border-color: rgba(255, 107, 157, 0.3);
  position: relative;
}

.quote-icon {
  font-size: 2.5rem;
  margin-bottom: 1.2rem;
  display: block;
}

.felli-quote blockquote {
  font-size: 1.2rem;
  font-style: italic;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin-bottom: 1.2rem;
  max-width: 550px;
  margin-left: auto;
  margin-right: auto;
}

.felli-quote cite {
  color: #667eea;
  font-weight: 600;
  font-style: normal;
}

/* ОПТИМИЗИРОВАННЫЕ факты */
.facts-section {
  padding: 3rem 2rem;
  border-radius: 25px;
}

.facts-timeline {
  max-width: 750px;
  margin: 0 auto;
  position: relative;
}

.timeline-line {
  position: absolute;
  left: 25px;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, #667eea, #764ba2, #f093fb);
  border-radius: 2px;
  opacity: 0.3;
}

.facts-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.fact-item {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  position: relative;
  opacity: 0;
  transform: translateX(-20px);
  animation: fade-in-timeline 0.5s ease forwards;
}

@keyframes fade-in-timeline {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.fact-item:hover,
.fact-item.active {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateX(8px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
}

.fact-number {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  font-size: 1rem;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.fact-icon {
  width: 50px;
  height: 50px;
  background: rgba(102, 126, 234, 0.1);
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #667eea;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.fact-item:hover .fact-icon,
.fact-item.active .fact-icon {
  background: rgba(102, 126, 234, 0.2);
  border-color: #667eea;
  transform: scale(1.05);
}

.fact-content {
  flex: 1;
  min-width: 0;
}

.fact-title {
  font-size: 1.2rem;
  color: white;
  margin-bottom: 0.4rem;
  font-weight: 600;
}

.fact-description {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-top: 0.8rem;
  animation: expand-text 0.3s ease;
}

@keyframes expand-text {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fact-arrow {
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.1rem;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.fact-arrow .fa-chevron-down {
  transition: transform 0.3s ease;
}

.fact-arrow .fa-chevron-down.rotated {
  transform: rotate(180deg);
}

.fact-item:hover .fact-arrow {
  color: #667eea;
}

/* Письмо любви */
.love-letter-cosmos {
  display: flex;
  justify-content: center;
}

.letter-paper {
  max-width: 650px;
  padding: 2.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.letter-header {
  text-align: center;
  margin-bottom: 1.8rem;
}

.letter-hearts {
  display: flex;
  justify-content: center;
  gap: 0.8rem;
  margin-bottom: 0.8rem;
}

.heart {
  font-size: 1.3rem;
  animation: heart-float 2.5s ease infinite;
}

@keyframes heart-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.letter-header h3 {
  font-size: 1.8rem;
  color: #667eea;
}

.letter-content {
  margin-bottom: 1.8rem;
}

.letter-paragraph {
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
}

.letter-signature {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.8rem;
}

.signature-line {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.signature-text {
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
}

.signature-name {
  color: #f093fb;
  font-weight: 600;
  font-size: 1.1rem;
}

.signature-emoji {
  font-size: 1.8rem;
}

/* Обновленный футер */
.cosmos-footer {
  margin-top: 6rem;
  padding: 2.5rem 2rem;
  background: rgba(12, 18, 23, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-content {
  max-width: 750px;
  margin: 0 auto;
  padding: 1.8rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-copyright {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
}

.copyright-text {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.separator {
  color: rgba(255, 255, 255, 0.3);
}

.copyright-text a {
  color: #667eea;
  text-decoration: none;
  transition: all 0.3s ease;
}

.copyright-text a:hover {
  color: #f093fb;
  text-shadow: 0 0 8px rgba(240, 147, 251, 0.3);
}

.version {
  color: rgba(102, 126, 234, 0.8);
  font-weight: 600;
}

.footer-subtitle {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
  margin-top: 0.4rem;
}

/* АДАПТИВНЫЕ медиа-запросы */
@media (max-width: 1024px) {
  .nav-link span {
    display: none;
  }
  
  .nav-link {
    width: clamp(40px, 6vw, 45px);
    height: clamp(40px, 6vw, 45px);
    justify-content: center;
    padding: 0;
  }
  
  .felli-hero {
    grid-template-columns: 1fr;
    text-align: center;
    gap: clamp(1.5rem, 4vw, 2rem);
  }
  
  .facts-timeline {
    padding-left: clamp(0.5rem, 2vw, 0.8rem);
  }
  
  .timeline-line {
    left: clamp(8px, 2vw, 12px);
  }
  
  .fact-item {
    margin-left: clamp(1rem, 3vw, 1.5rem);
  }
}

@media (max-width: 768px) {
  .moment-content {
    flex-direction: column;
    text-align: center;
    padding: clamp(1rem, 3vw, 1.5rem);
  }
  
  .travels-controls {
    flex-direction: column;
    gap: clamp(1rem, 2.5vw, 1.2rem);
  }
  
  .control-btn {
    width: clamp(35px, 6vw, 40px);
    height: clamp(35px, 6vw, 40px);
  }
  
  .travels-dots {
    flex-wrap: wrap;
    justify-content: center;
    gap: clamp(0.4rem, 1.5vw, 0.6rem);
  }
  
  .travel-dot {
    padding: clamp(0.4rem, 1.2vw, 0.5rem) clamp(0.6rem, 2vw, 0.8rem);
    font-size: clamp(0.75rem, 1.8vw, 0.8rem);
  }
  
  .journey-content {
    padding: clamp(1.2rem, 3vw, 1.5rem);
  }
  
  .journey-title {
    font-size: clamp(1.3rem, 4vw, 1.5rem);
  }
  
  .journey-description {
    font-size: clamp(0.9rem, 2.2vw, 0.95rem);
  }
  
  .journey-highlight {
    padding: clamp(0.8rem, 2.5vw, 1rem);
  }
  
  .portrait-container {
    width: clamp(160px, 35vw, 200px);
    height: clamp(160px, 35vw, 200px);
  }
  
  .variants-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .felli-heritage {
    grid-template-columns: 1fr;
  }
  
  .fact-item {
    flex-direction: column;
    text-align: center;
    gap: clamp(0.8rem, 2vw, 1rem);
    margin-left: 0;
  }
  
  .timeline-line {
    display: none;
  }
  
  .copyright-text {
    flex-direction: column;
    gap: clamp(0.3rem, 1vw, 0.4rem);
  }
}

@media (max-width: 480px) {
  .glass-panel {
    padding: clamp(1rem, 3vw, 1.2rem);
  }
  
  .travels-showcase {
    padding: 0 clamp(0.5rem, 2vw, 0.8rem);
  }
  
  .control-btn {
    width: clamp(30px, 5vw, 35px);
    height: clamp(30px, 5vw, 35px);
  }
  
  .travels-dots {
    gap: clamp(0.3rem, 1vw, 0.4rem);
  }
  
  .travel-dot {
    padding: clamp(0.3rem, 1vw, 0.4rem) clamp(0.5rem, 1.5vw, 0.6rem);
    font-size: clamp(0.7rem, 1.5vw, 0.75rem);
  }
  
  .journey-content {
    padding: clamp(1rem, 2.5vw, 1.2rem);
  }
  
  .journey-title {
    font-size: clamp(1.2rem, 3.5vw, 1.3rem);
  }
  
  .journey-description {
    font-size: clamp(0.85rem, 2vw, 0.9rem);
  }
  
  .journey-highlight {
    padding: clamp(0.6rem, 2vw, 0.8rem);
    flex-direction: column;
    text-align: center;
  }
  
  .highlight-text {
    font-size: clamp(0.8rem, 1.8vw, 0.85rem);
  }
  
  .portrait-container {
    width: clamp(140px, 30vw, 160px);
    height: clamp(140px, 30vw, 160px);
  }
  
  .felli-name {
    font-size: clamp(1.6rem, 4vw, 1.8rem);
  }
  
  .variants-grid {
    grid-template-columns: 1fr;
  }
  
  .variant-item img {
    height: clamp(80px, 15vw, 100px);
  }
  
  .name-formula {
    flex-direction: column;
    gap: clamp(0.3rem, 1vw, 0.4rem);
  }
  
  .name-part {
    font-size: clamp(1rem, 2.5vw, 1.1rem);
  }
  
  .plus, .equals {
    font-size: clamp(1.2rem, 3vw, 1.3rem);
  }
  
  .gallery-controls {
    flex-direction: column;
    gap: clamp(0.6rem, 2vw, 0.8rem);
    text-align: center;
  }
  
  .gallery-buttons {
    justify-content: center;
  }
  
  .fact-number {
    width: clamp(30px, 5vw, 35px);
    height: clamp(30px, 5vw, 35px);
    font-size: clamp(0.8rem, 2vw, 0.9rem);
  }
  
  .fact-icon {
    width: clamp(40px, 6vw, 45px);
    height: clamp(40px, 6vw, 45px);
    font-size: clamp(1rem, 2.2vw, 1.1rem);
  }
  
  .fact-title {
    font-size: clamp(1rem, 2.5vw, 1.1rem);
  }
  
  .fact-description {
    font-size: clamp(0.8rem, 2vw, 0.85rem);
  }
  
  .letter-paper {
    padding: clamp(1.5rem, 4vw, 1.8rem);
  }
  
  .letter-paragraph {
    font-size: clamp(0.95rem, 2.2vw, 1rem);
  }
  
  .footer-content {
    padding: clamp(1rem, 3vw, 1.2rem);
  }
}

/* ОПТИМИЗАЦИОННЫЕ стили для производительности */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .star {
    animation: none;
  }
  
  .aurora {
    animation: none;
  }
  
  .portrait-ring {
    animation: none;
  }
  
  .heart {
    animation: none;
  }
}

/* Стили для высокого разрешения */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .hero-bg-image {
    image-rendering: -webkit-optimize-contrast;
  }
}

/* Плавная загрузка изображений */
img {
  transition: opacity 0.3s ease;
}

img:not([src]) {
  opacity: 0;
}

/* Стили для доступности - фокус */
button:focus,
.nav-link:focus,
.gallery-item:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

/* Стили для печати */
@media print {
  .scroll-indicator,
  .fixed-nav,
  .gallery-controls {
    display: none !important;
  }
  
  .hero-universe {
    height: auto;
    min-height: 40vh;
  }
  
  .chapter-title,
  .universe-title {
    color: #333 !important;
  }
  
  .story-cosmos {
    color: #333 !important;
  }
  
  .glass-panel {
    background: rgba(0, 0, 0, 0.05) !important;
    border: 1px solid #ddd !important;
  }
}

/* Оптимизация для GPU */
.star,
.aurora,
.hero-bg-image,
.portrait-ring {
  will-change: transform;
}

.glass-panel,
.journey-card,
.gallery-item,
.fact-item {
  will-change: transform;
}

/* Контейнеры для layout */
.felix-universe,
.story-cosmos,
.chapter-container {
  contain: layout style;
}

/* Улучшение производительности прокрутки */
.cosmic-background,
.hero-background {
  transform: translateZ(0);
}
</style>