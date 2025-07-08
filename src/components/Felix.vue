<template>
  <div class="memories-page">
    <!-- Полноэкранный hero-раздел с параллакс-эффектом -->
    <section class="hero-section">
      <div class="hero-image" ref="parallaxImage"></div>
      <div class="hero-overlay"></div>
      <div class="sticker sticker-heart"></div>
      <div class="container">
        <nav class="main-nav">
          <div class="logo">Fox Taffy</div>
          <div class="nav-links">
            <a href="/" class="nav-link">Главная</a>
            <a href="#" class="nav-link">Галерея</a>
            <a href="#" class="nav-link">Тэффи</a>
          </div>
        </nav>
        
        <div class="hero-content">
          <h1 class="hero-title">ПАМЯТНЫЕ<br>МОМЕНТЫ</h1>
          <div class="title-accent">История нашей любви и приключений с Felix</div>
        </div>
        
        <div class="scroll-indicator">
          <span>ЛИСТАЙ ВНИЗ</span>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path d="M12 5L12 19M12 19L19 12M12 19L5 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </section>
    
    <!-- Секция "Как всё начиналось" с фотографией -->
    <section class="intro-section">
      <div class="container">
        <div class="section-grid">
          <div class="text-content">
            <span class="section-number">01</span>
            <h2 class="section-title">КАК ВСЁ НАЧИНАЛОСЬ</h2>
            <p class="section-text">
              Наша история началась неожиданно в 2020 году, когда мы встретились в Discord сервере когда играли в CS:GO. 
              Felix — замечательный и солнечный человек, понравивший его характером и геймплеем. 
              С первых минут знакомства и общаясь после 2х каток он мне очень понравился.
            </p>
            <p class="section-text">
              Наше общение быстро переросло в нечто большее — сначала долгие разговоры до ночи, затем совместные 
              напарные игры в ксго, и вот уже мы не представляли своих дней друг без друга. Наша связь крепла с каждой 
              встречей, и вскоре мы поняли, что хотим разделить не только моменты, но и жизнь.
            </p>
            <blockquote class="quote">
              Иногда один взгляд говорит больше тысячи слов, а встреча с правильным человеком меняет всю твою жизнь
            </blockquote>
          </div>
          <div class="image-content">
            <div class="section-image">
              <img src="https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Felix%2FLodkaFIN.png" alt="Felix и Fox Taffy вместе">
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Широкий слайдер с нашими путешествиями -->
    <section class="journeys-section">
      <div class="sticker sticker-star"></div>
      <div class="section-header">
        <h2 class="section-title large-title">НАШИ ПУТЕШЕСТВИЯ</h2>
        <div class="slider-controls">
          <button class="slider-arrow prev" @click="prevSlide">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="slider-counter">
            <span class="current-slide">{{ currentSlide + 1 }}</span> / <span class="total-slides">{{ journeys.length }}</span>
          </div>
          <button class="slider-arrow next" @click="nextSlide">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="journeys-slider" ref="journeysSlider">
        <div class="slider-track" :style="{ transform: `translateX(${-currentSlide * 100}%)` }">
          <div class="journey-slide" v-for="(journey, index) in journeys" :key="index">
            <div class="journey-image">
              <img :src="journey.image" :alt="journey.title">
              <div class="journey-overlay"></div>
            </div>
            <div class="journey-content">
              <div class="journey-date">{{ journey.date }}</div>
              <h3 class="journey-title">{{ journey.title }}</h3>
              <p class="journey-description">{{ journey.description }}</p>
              <div class="journey-highlight">
                <span class="highlight-label">ОСОБЫЙ МОМЕНТ</span>
                <p class="highlight-text">{{ journey.highlight }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
<!-- Секция о нашем общем "сыне" Фелли -->
<section class="family-section">
      <div class="container">
        <div class="floating-elements">
          <div class="float-heart"></div>
          <div class="float-star"></div>
          <div class="float-paw"></div>
        </div>
        
        <div class="section-header centered">
          <span class="section-number">03</span>
          <h2 class="section-title gradient-text">НАШ ОБЩИЙ СЫН</h2>
          <div class="section-subtitle">Знакомьтесь с нашим творением</div>
        </div>
        
        <div class="family-hero">
          <div class="family-main-image">
            <div class="image-glow"></div>
            <img src="https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/referencefelly.png" alt="Фелли - референс нашего персонажа">
            <div class="image-frame"></div>
          </div>
          
          <div class="family-intro">
            <div class="name-badge">
              <h3 class="family-name">ФЕЛЛИ</h3>
              <div class="name-sparkles">✨</div>
            </div>
            <div class="family-subtitle">🦊 Лис-енотовидный • Наш гордость и радость 🦝</div>
            
            <div class="intro-text">
              <p>
                Познакомьтесь с нашим особенным малышом! Фелли — это не просто персонаж, это воплощение нашей любви 
                и творческой энергии. Каждая деталь его образа продумана с заботой и несёт частичку наших сердец.
              </p>
            </div>
          </div>
        </div>

        <!-- Галерея с артами Фелли -->
        <div class="felly-gallery">
          <h4 class="gallery-title">🎨 Галерея наших творений</h4>
          <div class="gallery-grid-felly">
            <div class="gallery-item-felly" v-for="(art, index) in fellyGallery" :key="index" @click="openFellyPhoto(index)">
              <img :src="art.src" :alt="art.caption">
              <div class="art-overlay">
                <div class="art-info">
                  <span class="art-title">{{ art.title }}</span>
                  <span class="art-author">{{ art.author }}</span>
                </div>
                <div class="view-icon">👁️</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Черты характера в новом стиле -->
        <div class="personality-section">
          <h4 class="personality-title">💫 Что делает Фелли особенным</h4>
          
          <div class="parent-inheritance">
            <div class="inheritance-card felix-card">
              <div class="card-header">
                <div class="parent-avatar felix-avatar">
                  <span>🌿</span>
                </div>
                <div class="parent-info">
                  <h5>От Felix</h5>
                  <span>Спокойствие и творчество</span>
                </div>
              </div>
              <div class="traits-showcase">
                <div class="trait-badge">🎨 Художественный дар</div>
                <div class="trait-badge">😌 Мудрость</div>
                <div class="trait-badge">💚 Природная гармония</div>
                <div class="trait-badge">🌟 Внутренний свет</div>
              </div>
            </div>

            <div class="inheritance-card taffy-card">
              <div class="card-header">
                <div class="parent-avatar taffy-avatar">
                  <span>🔥</span>
                </div>
                <div class="parent-info">
                  <h5>От Fox Taffy</h5>
                  <span>Энергия и страсть</span>
                </div>
              </div>
              <div class="traits-showcase">
                <div class="trait-badge">⚡ Активность</div>
                <div class="trait-badge">🎮 Игривость</div>
                <div class="trait-badge">🦊 Хитрость</div>
                <div class="trait-badge">🌈 Яркость</div>
              </div>
            </div>
          </div>

          <!-- Уникальные особенности -->
          <div class="unique-section">
            <h5 class="unique-header">🌟 Его собственная магия</h5>
            <div class="unique-grid">
              <div class="unique-card">
                <div class="unique-emoji">🦝</div>
                <h6>Енотовидность</h6>
                <p>Идеальный баланс между лисьей грацией и енотовой игривостью</p>
              </div>
              <div class="unique-card">
                <div class="unique-emoji">💫</div>
                <h6>Творческая аура</h6>
                <p>Вдохновляет на новые арты и истории одним своим присутствием</p>
              </div>
              <div class="unique-card">
                <div class="unique-emoji">❤️</div>
                <h6>Связующее звено</h6>
                <p>Символизирует нашу любовь и единство в каждой линии</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="family-message">
          <div class="message-bubble">
            <p>"Фелли — это не просто персонаж. Это кусочек нашей души, воплощённый в творчестве. 
            В его глазах живёт наша история, а в улыбке — надежда на будущие приключения вместе."</p>
            <div class="message-signature">
              <span>💕 С любовью, Fox Taffy & Felix</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Лайтбокс для галереи Фелли -->
      <div class="lightbox felly-lightbox" v-if="fellyLightboxOpen">
        <div class="lightbox-overlay" @click="closeFellyLightbox"></div>
        <button class="lightbox-close" @click="closeFellyLightbox">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="lightbox-container">
          <button class="lightbox-nav prev" @click="prevFellyPhoto" v-if="currentFellyPhoto > 0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="lightbox-content">
            <img :src="fellyGallery[currentFellyPhoto].src" :alt="fellyGallery[currentFellyPhoto].caption">
            <div class="lightbox-caption">
              <div class="caption-title">{{ fellyGallery[currentFellyPhoto].title }}</div>
              <div class="caption-author">Автор: {{ fellyGallery[currentFellyPhoto].author }}</div>
              <div class="caption-description">{{ fellyGallery[currentFellyPhoto].caption }}</div>
            </div>
          </div>
          <button class="lightbox-nav next" @click="nextFellyPhoto" v-if="currentFellyPhoto < fellyGallery.length - 1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 6L15 12L9 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
    
    <!-- Фотогалерея в стиле сетки -->
    <section class="gallery-section">
      <div class="container">
        <div class="sticker sticker-camera"></div>
        <div class="section-header centered">
          <span class="section-number">03</span>
          <h2 class="section-title">НАС ЗАПЕЧАТЛЕЛИ</h2>
        </div>
        
        <div class="gallery-grid">
          <div class="gallery-item" v-for="(photo, index) in gallery" :key="index" @click="openPhoto(index)">
            <img :src="photo.src" :alt="photo.caption">
            <div class="gallery-overlay">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      
      
      <!-- Лайтбокс для просмотра фотографий -->
      <div class="lightbox" v-if="lightboxOpen">
        <div class="lightbox-overlay" @click="closeLightbox"></div>
        <button class="lightbox-close" @click="closeLightbox">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="lightbox-container">
          <button class="lightbox-nav prev" @click="prevPhoto" v-if="currentPhoto > 0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="lightbox-content">
            <img :src="gallery[currentPhoto].src" :alt="gallery[currentPhoto].caption">
            <div class="lightbox-caption">{{ gallery[currentPhoto].caption }}</div>
          </div>
          <button class="lightbox-nav next" @click="nextPhoto" v-if="currentPhoto < gallery.length - 1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 6L15 12L9 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
    
    <!-- Интерактивные карточки с фактами -->
    <section class="facts-section">
      <div class="facts-bg"></div>
      <div class="sticker sticker-sparkle"></div>
      <div class="container">
        <div class="section-header centered">
          <h2 class="section-title large-title">10 ФАКТОВ О НАС</h2>
        </div>
        
        <div class="facts-grid">
          <div class="fact-card" v-for="(fact, index) in facts" :key="index" @click="toggleFact(index)">
            <div class="card-front" :class="{ 'hidden': selectedFact === index }">
              <div class="fact-icon">
                <i :class="fact.icon"></i>
              </div>
              <h3 class="fact-title">{{ fact.title }}</h3>
              <div class="view-more">ПОДРОБНЕЕ</div>
            </div>
            <div class="card-back" :class="{ 'shown': selectedFact === index }">
              <p class="fact-description">{{ fact.description }}</p>
              <button class="close-fact" @click.stop="selectedFact = null">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Записка о любви -->
    <section class="love-note-section">
      <div class="container narrow">
        <div class="sticker sticker-envelope"></div>
        <div class="love-note">
          <h2 class="note-title">МОЯ ПОЛОВИНКА</h2>
          <div class="note-content">
            <p>
              Felix, ты наполнил мою жизнь красками, смыслом и радостью. Каждый день рядом с тобой — это дар. 
              Твоя улыбка освещает даже самые темные дни, а твоя поддержка дает силы двигаться вперед.
            </p>
            <p>
              Наша история только начинается, и я с нетерпением жду каждой новой главы, каждого нового приключения, 
              каждого нового дня, проведенного вместе. Спасибо, что ты есть в моей жизни, моя любовь.
            </p>
            <div class="signature">
              <span>С любовью, твой</span>
              <span class="name">Fox Taffy</span>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Футер -->
    <footer class="site-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-copyright">
            © 2025 Fox Taffy | FoxTaffy.fun<br>
            <span class="made-with-love">Сделано с <span class="heart-icon-inline"><svg viewBox="0 0 32 32" width="16" height="16"><path d="M16 28C16 28 27 22 27 14C27 8.47715 22.5228 4 17 4C13.4228 4 10.3129 5.9713 8.6129 8.8459C7.6429 7.6908 6.3059 7 4.85 7C2.1722 7 0 9.1722 0 11.85C0 12.6784 0.1979 13.4631 0.5465 14.1631C1.5459 16.1923 3.1299 17.614 5.0212 18.6354C8.2856 20.5921 16 28 16 28Z" fill="#4caf50"/></svg></span> для лучшего человека в моей жизни</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'FelixMemories',
  data() {
    return {
      currentSlide: 0,
      currentPhoto: 0,
      lightboxOpen: false,
      selectedFact: null,
      
      // Данные для путешествий
      journeys: [
        {
          title: "Первая встреча",
          date: "Август 2022",
          description: "Наша первая встреча началась в Челябинске. Мы много гуляли по городу, часто купались на карьерах. По пути в Екатеринбург заехали в Кыштым, где провели время с Фиском. В Екатеринбурге гуляли с Простиксом, посетили аквапарк и киберклуб, где провели незабываемую ночь. Также мы гуляли в национальном парке Челябинска, где увидели контактный зоопарк. Потискали енотов и даже спящих лисят.",
          highlight: "Лето с любимым человеком — это незабываемое время. Хочется, чтобы оно длилось вечно.",
          image: "https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/IMG20220812161755.jpg"
        },
        {
          title: "Поездка в Санкт-Петербург",
          date: "Декабрь 2022",
          description: "Зима в Петербурге оказалась суровой. Прогулки давались тяжело, но нас ждал тёплый приём. Вовик приютил нас на всё время поездки. Город раскрылся во всей своей романтической красе. В нём множество ресторанов, кафе и уникальных мест. ",
          highlight: "Первая ночь в нашей квартире: ужин при свечах на полу среди коробок и планы на будущее.",
          image: "https://sun9-41.userapi.com/impg/5VQxr_0GrCyYoUTa6xdOU21brbom_6lGzV2K2w/YtEmSuXRJ-w.jpg?size=1280x960&quality=96&sign=a9975827c9e8f7994bd974d896cc2beb&type=album"
        },
        {
          title: "Переезд в Челябинск",
          date: "Январь 2024 - Август 2024",
          description: "",
          highlight: "",
          image: "https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/IMG20240110163945.jpg"
        },
        {
          title: "Зимняя сказка в Таганае",
          date: "Февраль 2024",
          description: "Зимние каникулы мы решили провести в заснеженном Таганае. Катание на собачьих упряжках, ледяные пещеры, северное сияние и горячий глинтвейн у камина — это путешествие подарило нам столько незабываемых воспоминаний и фотографий.",
          highlight: "Felix впервые встал на лыжи и, несмотря на множество падений, продолжал пробовать с таким энтузиазмом, что к концу дня уже уверенно спускался.",
          image: "https://sun9-37.userapi.com/impg/mu692ERc9kJ5iPk5Oh9Qh9As2Sfdv6GkO-UIiw/GUq0EqcQekk.jpg?size=2560x1440&quality=95&sign=71298950d9d4e701681bcc4be71e5870&type=album"
        },
        {
          title: "Новый год в Москве",
          date: "Апрель 2024",
          description: "Поездка на Байкал в период ледохода была давней мечтой Felix. Мы наблюдали, как просыпается великое озеро, прогулки по берегу среди ледяных торосов и знакомство с местными традициями. Байкал покорил наши сердца своей мощью и красотой.",
          highlight: "Мы нашли уединенную бухту, где лед создавал причудливые формы, и провели там целый день, делая невероятные фотографии.",
          image: "https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/20241229_162506.jpg"
        },
        {
          title: "Новые горизонты",
          date: "Скоро...",
          description: "Наши планы на будущее полны новых маршрутов и приключений. Мы мечтаем о поездке в Японию, исследовании Норвегии и путешествии по Транссибирской магистрали. Каждый день с Felix — это новое приключение.",
          highlight: "Самое важное не место, а человек, с которым ты разделяешь эти моменты.",
          image: "https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/IMG20230723080549.jpg"
        }
      ],
      
      // Данные для галереи
      gallery: [
        { 
          src: "https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Felix%2F444kk.png", 
          caption: "Наша первая совместная поездка в лес" 
        },
        { 
          src: "https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Felix%2F%D0%B1%D0%B5%D1%80%D0%B5%D0%B3%D0%B8%D1%81%D1%8C%20.png", 
          caption: "Felix сделал этот снимок во время фотосессии" 
        },
        { 
          src: "https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Felix%2Fzoktef3_5_1.png", 
          caption: "Подготовка к фурри-конвенту заняла два месяца" 
        },
        { 
          src: "https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Felix%2Fzakaz__20250222081635.png", 
          caption: "Романтический вечер на побережье Финского залива" 
        },
        { 
          src: "https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Felix%2Fmoskva2.png", 
          caption: "Felix помогал мне с созданием этого референса" 
        },
        { 
          src: "https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Felix%2F6G7LwzjFE90.jpg", 
          caption: "Арт, который Felix заказал на нашу годовщину" 
        }
      ],
      
      // Данные для фактов
      facts: [
        {
          icon: "fas fa-film",
          title: "Киномарафоны",
          description: "Люблю показывать смешные видео с тик тока Феликсу."
        },
        {
          icon: "fas fa-palette",
          title: "Творчество",
          description: "Felix талантливый художник, а я помогаю с идеями и организацией выставок. Вместе мы создали уже более 50 артов."
        },
        {
          icon: "fas fa-gamepad",
          title: "Геймеры",
          description: "Обожаем играть вместе в кооперативные игры. Наши любимые — Minecraft и CS2."
        },
        {
          icon: "fas fa-utensils",
          title: "Кулинария",
          description: "Каждые выходные мы готовим что-то новое. Felix отвечает за основные блюда, я — за десерты."
        },
        {
          icon: "fas fa-paw",
          title: "Фурсьюты",
          description: "Наши фурсьюты часто появляются на конвентах вместе."
        },
        {
          icon: "fas fa-music",
          title: "Плейлисты",
          description: "У нас общий плейлист из 500+ песен. Мы оба любим синтвейв, инди-рок и саундтреки из аниме."
        },
        {
          icon: "fas fa-birthday-cake",
          title: "Дни рождения",
          description: "Наши дни рождения с разницей всего в месяц, поэтому мы часто устраиваем одно большое совместное празднование."
        },
        {
          icon: "fas fa-star",
          title: "Загадывание желаний",
          description: "У нас есть традиция загадывать желания на падающие звезды. Пока сбылось 7 из 12 загаданных."
        }
      ]
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
    this.initParallax();
  },
  methods: {
    // Параллакс для фоновых изображений
    handleScroll() {
      this.initParallax();
    },
    
    initParallax() {
      const scrollPosition = window.scrollY;
      if (this.$refs.parallaxImage) {
        this.$refs.parallaxImage.style.transform = `translateY(${scrollPosition * 0.4}px)`;
      }
    },
    
    // Методы для слайдера путешествий
    nextSlide() {
      if (this.currentSlide < this.journeys.length - 1) {
        this.currentSlide++;
      } else {
        this.currentSlide = 0;
      }
    },
    
    prevSlide() {
      if (this.currentSlide > 0) {
        this.currentSlide--;
      } else {
        this.currentSlide = this.journeys.length - 1;
      }
    },
    
    // Методы для лайтбокса фотографий
    openPhoto(index) {
      this.currentPhoto = index;
      this.lightboxOpen = true;
      document.body.style.overflow = 'hidden';
    },
    
    closeLightbox() {
      this.lightboxOpen = false;
      document.body.style.overflow = '';
    },
    
    nextPhoto() {
      if (this.currentPhoto < this.gallery.length - 1) {
        this.currentPhoto++;
      }
    },
    
    prevPhoto() {
      if (this.currentPhoto > 0) {
        this.currentPhoto--;
      }
    },
    
    // Методы для фактов
    toggleFact(index) {
      if (this.selectedFact === index) {
        this.selectedFact = null;
      } else {
        this.selectedFact = index;
      }
    }
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
  }
}
</script>

<style scoped>

/* ===== ОСНОВНЫЕ ПЕРЕМЕННЫЕ И СБРОС СТИЛЕЙ ===== */
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

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--bg-dark);
  color: var(--text-light);
  font-family: 'Noto Sans', sans-serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

/* ===== СЕКЦИЯ О СЕМЬЕ (ФЕЛЛИ) - НОВЫЙ ДИЗАЙН ===== */
.family-section {
  padding: 8rem 0;
  background: radial-gradient(ellipse at top, 
    rgba(78, 205, 196, 0.1) 0%, 
    var(--bg-darker) 50%, 
    rgba(255, 123, 37, 0.1) 100%);
  position: relative;
  overflow: hidden;
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.float-heart,
.float-star,
.float-paw {
  position: absolute;
  font-size: 2rem;
  opacity: 0.3;
  animation: float 6s ease-in-out infinite;
}

.float-heart {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.float-heart::before {
  content: '💖';
}

.float-star {
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.float-star::before {
  content: '⭐';
}

.float-paw {
  bottom: 30%;
  left: 20%;
  animation-delay: 4s;
}

.float-paw::before {
  content: '🐾';
}

.gradient-text {
  background: linear-gradient(45deg, 
    var(--accent-teal), 
    var(--accent-orange), 
    var(--accent-green), 
    #ff6b9d);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: gradient-shift 3s ease-in-out infinite;
}

@keyframes gradient-shift {
  0%, 100% { filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(30deg); }
}

.section-subtitle {
  font-size: 1.2rem;
  color: var(--text-muted);
  font-style: italic;
  margin-top: 1rem;
}

.family-hero {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 4rem;
  align-items: center;
  margin: 4rem 0;
  position: relative;
  z-index: 2;
}

.family-main-image {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  transform: perspective(1000px) rotateY(-5deg);
  transition: transform 0.5s ease;
}

.family-main-image:hover {
  transform: perspective(1000px) rotateY(0deg) scale(1.05);
}

.image-glow {
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  background: linear-gradient(45deg, 
    var(--accent-teal), 
    var(--accent-orange), 
    var(--accent-green));
  border-radius: 25px;
  z-index: -1;
  opacity: 0.6;
  filter: blur(20px);
  animation: glow-pulse 2s ease-in-out infinite alternate;
}

@keyframes glow-pulse {
  0% { opacity: 0.4; transform: scale(0.98); }
  100% { opacity: 0.8; transform: scale(1.02); }
}

.family-main-image img {
  width: 100%;
  height: auto;
  display: block;
  position: relative;
  z-index: 2;
}

.image-frame {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 3px solid transparent;
  background: linear-gradient(45deg, var(--accent-teal), var(--accent-orange)) border-box;
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask-composite: subtract;
  border-radius: 20px;
  z-index: 3;
}

.name-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.family-name {
  font-size: 3.5rem;
  font-weight: 900;
  background: linear-gradient(45deg, var(--accent-teal), var(--accent-orange));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-family: 'Cormorant', serif;
  text-transform: uppercase;
  letter-spacing: 3px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.name-sparkles {
  font-size: 2rem;
  animation: sparkle 1.5s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(180deg); }
}

.family-subtitle {
  font-size: 1.3rem;
  color: var(--text-light);
  background: rgba(78, 205, 196, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 25px;
  text-align: center;
  margin-bottom: 2rem;
  border: 1px solid rgba(78, 205, 196, 0.3);
}

.intro-text p {
  font-size: 1.2rem;
  line-height: 1.8;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.05);
  padding: 2rem;
  border-radius: 15px;
  border-left: 4px solid var(--accent-teal);
}

/* ===== ГАЛЕРЕЯ ФЕЛЛИ ===== */
.felly-gallery {
  margin: 6rem 0;
  position: relative;
  z-index: 2;
}

.gallery-title {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 3rem;
  background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 700;
}

.gallery-grid-felly {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.gallery-item-felly {
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  transform: scale(1);
  transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.gallery-item-felly:hover {
  transform: scale(1.05) translateY(-10px);
  box-shadow: 0 20px 50px rgba(78, 205, 196, 0.4);
}

.gallery-item-felly img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.gallery-item-felly:hover img {
  transform: scale(1.1);
}

.art-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    transparent 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.gallery-item-felly:hover .art-overlay {
  opacity: 1;
}

.art-info {
  align-self: flex-end;
}

.art-title {
  display: block;
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.art-author {
  display: block;
  color: var(--accent-teal);
  font-size: 0.9rem;
}

.view-icon {
  align-self: flex-start;
  font-size: 1.5rem;
  background: rgba(78, 205, 196, 0.8);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ===== ЧЕРТЫ ХАРАКТЕРА ===== */
.personality-section {
  margin: 6rem 0;
  position: relative;
  z-index: 2;
}

.personality-title {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 4rem;
  color: white;
  font-weight: 700;
}

.parent-inheritance {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 4rem;
}

.inheritance-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.inheritance-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--accent-green), #66bb6a);
}

.felix-card::before {
  background: linear-gradient(90deg, var(--accent-green), #66bb6a);
}

.taffy-card::before {
  background: linear-gradient(90deg, var(--accent-orange), #ff9800);
}

.inheritance-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}


/* ===== КОНТЕЙНЕРЫ ===== */
.container {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 4rem;
}

.container.narrow {
  max-width: 1000px;
}

.memories-page {
  background-color: var(--bg-dark);
  min-height: 100vh;
}

/* ===== HERO СЕКЦИЯ ===== */
.hero-section {
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.hero-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Felix%2F444kk.png');
  background-size: cover;
  background-position: center;
  z-index: 1;
  transform: scale(1.1);
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, 
    rgba(12, 18, 23, 0.7) 0%,
    rgba(12, 18, 23, 0.8) 100%);
  z-index: 2;
}

/* ===== НАВИГАЦИЯ ===== */
.main-nav {
  position: absolute;
  top: 2rem;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 10;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-light);
  letter-spacing: 1px;
  font-family: 'Cormorant', serif;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: var(--text-light);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  padding-bottom: 0.3rem;
  transition: var(--transition);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background-color: var(--accent-teal);
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 100%;
}

/* ===== HERO КОНТЕНТ ===== */
.hero-content {
  position: relative;
  z-index: 3;
  max-width: 80%;
}

.hero-title {
  font-size: 6rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 1.5rem;
  color: white;
  letter-spacing: -1px;
  text-transform: uppercase;
}

.title-accent {
  font-size: 1.5rem;
  position: relative;
  padding-left: 0;
  margin-top: 2rem;
  opacity: 1;
  color: white;
  font-weight: 400;
}

.scroll-indicator {
  position: absolute;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
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
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

/* ===== ОБЩИЕ СТИЛИ СЕКЦИЙ ===== */
.section-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.section-number {
  font-size: 1rem;
  color: var(--accent-teal);
  display: block;
  margin-bottom: 1rem;
  font-weight: 600;
  letter-spacing: 2px;
}

.section-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 2rem;
  line-height: 1.2;
  color: white;
}

.section-title.large-title {
  font-size: 4rem;
  text-align: center;
}

.section-title.gradient-title {
  background: linear-gradient(90deg, var(--accent-orange), var(--accent-green));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
  margin-bottom: 2rem;
}

.section-text {
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 1.5rem;
  color: var(--text-muted);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4rem;
  padding: 0 4rem;
}

.section-header.centered {
  flex-direction: column;
  text-align: center;
}

/* ===== СЕКЦИЯ ВВЕДЕНИЯ ===== */
.intro-section {
  padding: 8rem 0;
  position: relative;
}

.quote {
  font-size: 1.3rem;
  line-height: 1.6;
  font-style: italic;
  color: white;
  padding-left: 2rem;
  position: relative;
  margin: 3rem 0;
  font-weight: 400;
  font-family: 'Cormorant', serif;
}

.quote::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(to bottom, var(--accent-teal), var(--accent-teal-dark));
  border-radius: 2px;
}

.section-image {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.section-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
}

.section-image:hover img {
  transform: scale(1.05);
}

/* ===== СЕКЦИЯ ПУТЕШЕСТВИЙ ===== */
.journeys-section {
  padding: 4rem 0;
  background-color: var(--bg-darker);
  position: relative;
  overflow: hidden;
}

.slider-controls {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.slider-arrow {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
}

.slider-arrow:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-3px);
}

.slider-counter {
  font-size: 1.2rem;
  font-weight: 300;
}

.slider-counter .current-slide {
  font-weight: 700;
  color: var(--accent-teal);
}

.journeys-slider {
  width: 100%;
  overflow: hidden;
  position: relative;
  padding: 0 4rem;
}

.slider-track {
  display: flex;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.journey-slide {
  flex: 0 0 100%;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 4rem;
  padding: 2rem 0;
}

.journey-image {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  height: 500px;
}

.journey-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.journey-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  pointer-events: none;
}

.journey-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.journey-date {
  font-size: 1.2rem;
  color: var(--accent-teal);
  margin-bottom: 1rem;
  font-weight: 600;
}

.journey-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: white;
}

.journey-description {
  color: var(--text-muted);
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.8;
}

.journey-highlight {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border-left: 4px solid var(--accent-teal);
}

.highlight-label {
  font-size: 0.8rem;
  color: var(--accent-teal);
  margin-bottom: 0.5rem;
  display: block;
  letter-spacing: 2px;
  font-weight: 600;
}

.highlight-text {
  font-size: 1.1rem;
  color: white;
  line-height: 1.6;
}

/* ===== СЕКЦИЯ О СЕМЬЕ (ФЕЛЛИ) ===== */
.family-section {
  padding: 8rem 0;
  background: linear-gradient(135deg, var(--bg-dark) 0%, var(--bg-darker) 100%);
  position: relative;
}

.parent-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  position: relative;
  overflow: hidden;
}

.felix-avatar {
  background: linear-gradient(135deg, var(--accent-green), #66bb6a);
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.5);
}

.taffy-avatar {
  background: linear-gradient(135deg, var(--accent-orange), #ff9800);
  box-shadow: 0 0 20px rgba(255, 123, 37, 0.5);
}

.parent-info h5 {
  font-size: 1.5rem;
  color: white;
  margin: 0;
  font-weight: 600;
}

.parent-info span {
  color: var(--text-muted);
  font-size: 1rem;
}

.traits-showcase {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.trait-badge {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.6rem 1rem;
  border-radius: 25px;
  font-size: 0.9rem;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  cursor: default;
}

.felix-card .trait-badge:hover {
  background: rgba(76, 175, 80, 0.3);
  border-color: var(--accent-green);
  transform: translateY(-2px);
}

.taffy-card .trait-badge:hover {
  background: rgba(255, 123, 37, 0.3);
  border-color: var(--accent-orange);
  transform: translateY(-2px);
}

/* ===== УНИКАЛЬНЫЕ ОСОБЕННОСТИ ===== */
.unique-section {
  background: linear-gradient(135deg, 
    rgba(78, 205, 196, 0.1) 0%, 
    rgba(255, 123, 37, 0.1) 100%);
  border-radius: 20px;
  padding: 3rem;
  border: 1px solid rgba(78, 205, 196, 0.3);
  position: relative;
  overflow: hidden;
}

.unique-section::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, 
    rgba(78, 205, 196, 0.1) 0%, 
    transparent 70%);
  animation: rotate 20s linear infinite;
  z-index: 1;
}

.unique-header {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 2rem;
  color: var(--accent-teal);
  font-weight: 600;
  position: relative;
  z-index: 2;
}

.unique-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  position: relative;
  z-index: 2;
}

.unique-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  transition: all 0.4s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.unique-card:hover {
  transform: translateY(-15px) scale(1.05);
  box-shadow: 0 20px 40px rgba(78, 205, 196, 0.3);
  background: rgba(255, 255, 255, 0.12);
}

.unique-emoji {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
  animation: bounce-gentle 2s ease-in-out infinite;
}

.unique-card:nth-child(2) .unique-emoji {
  animation-delay: 0.5s;
}

.unique-card:nth-child(3) .unique-emoji {
  animation-delay: 1s;
}

@keyframes bounce-gentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.unique-card h6 {
  font-size: 1.3rem;
  color: white;
  margin-bottom: 1rem;
  font-weight: 600;
}

.unique-card p {
  color: var(--text-muted);
  line-height: 1.6;
  font-size: 0.95rem;
}

/* ===== СООБЩЕНИЕ О СЕМЬЕ ===== */
.family-message {
  margin: 6rem 0 2rem;
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.message-bubble {
  background: linear-gradient(135deg, 
    rgba(78, 205, 196, 0.15) 0%, 
    rgba(255, 123, 37, 0.15) 100%);
  border-radius: 25px;
  padding: 3rem;
  max-width: 800px;
  text-align: center;
  border: 2px solid rgba(78, 205, 196, 0.3);
  position: relative;
  backdrop-filter: blur(15px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.message-bubble::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  background: linear-gradient(45deg, 
    var(--accent-teal), 
    var(--accent-orange), 
    var(--accent-green));
  border-radius: 25px;
  z-index: -1;
  opacity: 0.5;
  filter: blur(5px);
}

.message-bubble p {
  font-size: 1.3rem;
  line-height: 1.8;
  color: white;
  margin-bottom: 2rem;
  font-style: italic;
  font-family: 'Cormorant', serif;
}

.message-signature {
  font-size: 1.1rem;
  color: var(--accent-teal);
  font-weight: 600;
}

/* ===== ЛАЙТБОКС ДЛЯ ФЕЛЛИ ===== */
.felly-lightbox .lightbox-caption {
  background: linear-gradient(135deg, 
    rgba(78, 205, 196, 0.9) 0%, 
    rgba(255, 123, 37, 0.9) 100%);
  border-radius: 15px;
  padding: 2rem;
  margin-top: 2rem;
  text-align: center;
  backdrop-filter: blur(20px);
}

.caption-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
}

.caption-author {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
  font-style: italic;
}

.caption-description {
  font-size: 1.1rem;
  color: white;
  line-height: 1.6;
}

/* ===== АДАПТИВНЫЙ ДИЗАЙН ДЛЯ СЕМЕЙНОЙ СЕКЦИИ ===== */
@media (max-width: 992px) {
  .family-hero {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  
  .family-main-image {
    transform: none;
    max-width: 500px;
    margin: 0 auto;
  }
  
  .family-name {
    font-size: 3rem;
    text-align: center;
  }
  
  .parent-inheritance {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .unique-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .gallery-grid-felly {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .family-name {
    font-size: 2.5rem;
  }
  
  .gallery-title {
    font-size: 2rem;
  }
  
  .personality-title {
    font-size: 2rem;
  }
  
  .unique-header {
    font-size: 1.5rem;
  }
  
  .message-bubble {
    padding: 2rem;
  }
  
  .message-bubble p {
    font-size: 1.1rem;
  }
  
  .intro-text p {
    font-size: 1.1rem;
    padding: 1.5rem;
  }
  
  .inheritance-card {
    padding: 1.5rem;
  }
  
  .unique-section {
    padding: 2rem;
  }
}

@media (max-width: 576px) {
  .family-name {
    font-size: 2rem;
  }
  
  .name-badge {
    flex-direction: column;
    text-align: center;
  }
  
  .gallery-grid-felly {
    grid-template-columns: 1fr;
  }
  
  .gallery-item-felly img {
    height: 200px;
  }
  
  .unique-card {
    padding: 1.5rem;
  }
  
  .unique-emoji {
    font-size: 2.5rem;
  }
  
  .message-bubble {
    padding: 1.5rem;
    margin: 4rem 1rem 2rem;
  }
  
  .traits-showcase {
    justify-content: center;
  }
  
  .floating-elements {
    display: none;
  }
}

/* ===== ДОПОЛНИТЕЛЬНЫЕ АНИМАЦИИ ===== */
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.gallery-item-felly {
  animation: fade-in-up 0.6s ease-out;
  animation-fill-mode: both;
}

.gallery-item-felly:nth-child(1) { animation-delay: 0.1s; }
.gallery-item-felly:nth-child(2) { animation-delay: 0.2s; }
.gallery-item-felly:nth-child(3) { animation-delay: 0.3s; }
.gallery-item-felly:nth-child(4) { animation-delay: 0.4s; }

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.inheritance-card {
  animation: fade-in-up 0.6s ease-out;
  animation-fill-mode: both;
}

.felix-card { animation-delay: 0.2s; }
.taffy-card { animation-delay: 0.4s; }

.unique-card {
  animation: fade-in-up 0.6s ease-out;
  animation-fill-mode: both;
}

.unique-card:nth-child(1) { animation-delay: 0.1s; }
.unique-card:nth-child(2) { animation-delay: 0.3s; }
.unique-card:nth-child(3) { animation-delay: 0.5s; }

/* ===== СЕКЦИЯ О СЕМЬЕ (ФЕЛЛИ) - СТАРЫЕ СТИЛИ (УДАЛИТЬ) ===== */

.family-quote {
  font-size: 1.2rem;
  line-height: 1.6;
  font-style: italic;
  color: white;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 4px solid var(--accent-green);
  margin-top: 2rem;
  font-family: 'Cormorant', serif;
}

/* ===== ФОТОГАЛЕРЕЯ ===== */
.gallery-section {
  padding: 8rem 0;
  position: relative;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 4rem;
}

.gallery-item {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  aspect-ratio: 3/2;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.gallery-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.gallery-item:hover img {
  transform: scale(1.05);
}

.gallery-item:hover .gallery-overlay {
  opacity: 1;
}

/* ===== ЛАЙТБОКС ===== */
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(8, 14, 18, 0.95);
  z-index: 1;
}

.lightbox-container {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  max-width: 90%;
  max-height: 90%;
}

.lightbox-content {
  position: relative;
}

.lightbox-content img {
  max-width: 100%;
  max-height: 80vh;
  display: block;
  border-radius: 4px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.lightbox-caption {
  position: absolute;
  bottom: -60px;
  left: 0;
  right: 0;
  text-align: center;
  color: white;
  font-size: 1.1rem;
  padding: 1rem 2rem;
  background: rgba(12, 18, 23, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 8px;
}

.lightbox-close {
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: transparent;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  z-index: 3;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  width: 50px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 3;
  transition: background 0.3s ease;
}

.lightbox-nav.prev {
  left: -100px;
  border-radius: 0 8px 8px 0;
}

.lightbox-nav.next {
  right: -100px;
  border-radius: 8px 0 0 8px;
}

.lightbox-nav:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* ===== СЕКЦИЯ С ФАКТАМИ ===== */
.facts-section {
  padding: 8rem 0;
  position: relative;
  background-color: var(--bg-darker);
  overflow: hidden;
}

.facts-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/dew.png');
  background-size: cover;
  background-position: center;
  opacity: 0.1;
  z-index: 1;
}

.facts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 4rem;
  position: relative;
  z-index: 2;
}

.fact-card {
  position: relative;
  height: 250px;
  perspective: 1000px;
  cursor: pointer;
}

.card-front,
.card-back {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  transition: transform 0.5s ease, opacity 0.5s ease;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.card-front {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  z-index: 2;
}

.card-front.hidden {
  opacity: 0;
  transform: rotateY(180deg);
}

.card-back {
  background: linear-gradient(135deg, var(--accent-teal-dark), var(--accent-teal));
  padding: 2rem;
  text-align: center;
  opacity: 0;
  transform: rotateY(-180deg);
  z-index: 1;
}

.card-back.shown {
  opacity: 1;
  transform: rotateY(0);
  z-index: 3;
}

.fact-icon {
  font-size: 2.5rem;
  color: var(--accent-teal);
  margin-bottom: 1.5rem;
}

.fact-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.view-more {
  position: absolute;
  bottom: 1.5rem;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-muted);
  letter-spacing: 1px;
}

.fact-description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: white;
}

.close-fact {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* ===== ЗАПИСКА О ЛЮБВИ ===== */
.love-note-section {
  padding: 8rem 0;
  position: relative;
}

.love-note {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 4rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.love-note::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/Felix%2Fmoskva2.png');
  background-size: cover;
  background-position: center;
  opacity: 0.05;
  z-index: 1;
}

.note-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: white;
  position: relative;
  z-index: 2;
  font-family: 'Cormorant', serif;
}

.note-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}

.note-content p {
  font-size: 1.2rem;
  line-height: 1.8;
  margin-bottom: 1.5rem;
  color: var(--text-muted);
}

.signature {
  margin-top: 3rem;
  font-style: italic;
  font-family: 'Cormorant', serif;
}

.signature .name {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent-teal);
  margin-top: 0.5rem;
}

/* ===== ФУТЕР ===== */
.site-footer {
  background-color: var(--bg-darker);
  padding: 2rem 0;
  position: relative;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-copyright {
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-muted);
  flex: 1;
}

.made-with-love {
  display: block;
  margin-top: 0.5rem;
  color: var(--text-light);
}

.heart-icon-inline {
  display: inline-flex;
  vertical-align: middle;
  margin: 0 4px;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  transition: var(--transition);
}

.social-link:hover {
  background: var(--accent-green);
  transform: translateY(-5px);
}

/* ===== СТИКЕРЫ ===== */
.sticker {
  position: absolute;
  width: 100px;
  height: 100px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  z-index: 10;
  pointer-events: none;
}

.sticker-heart {
  top: 20%;
  right: 5%;
  width: 120px;
  height: 120px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 85C50 85 15 65 15 35C15 20 25 10 40 10C45 10 50 15 50 15S55 10 60 10C75 10 85 20 85 35C85 65 50 85 50 85Z" fill="%23ff7b25"/></svg>');
  animation: float 6s ease-in-out infinite;
}

.sticker-paw {
  top: 10%;
  left: 5%;
  width: 80px;
  height: 80px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="30" cy="20" r="8" fill="%234ECDC4"/><circle cx="70" cy="20" r="8" fill="%234ECDC4"/><circle cx="20" cy="45" r="6" fill="%234ECDC4"/><circle cx="80" cy="45" r="6" fill="%234ECDC4"/><ellipse cx="50" cy="65" rx="15" ry="20" fill="%234ECDC4"/></svg>');
  animation: float 5s ease-in-out infinite;
  animation-delay: 1s;
}

.sticker-star {
  top: 15%;
  right: 10%;
  width: 70px;
  height: 70px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 10L60 40L90 40L68 58L78 88L50 70L22 88L32 58L10 40L40 40Z" fill="%234caf50"/></svg>');
  animation: rotate 10s linear infinite;
}

.sticker-camera {
  bottom: 10%;
  left: 5%;
  width: 90px;
  height: 90px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="25" width="80" height="50" rx="5" fill="%234ECDC4"/><circle cx="50" cy="50" r="15" fill="white"/><rect x="70" y="15" width="15" height="10" rx="2" fill="%234ECDC4"/></svg>');
  animation: float 7s ease-in-out infinite;
  animation-delay: 0.5s;
}

.sticker-sparkle {
  top: 20%;
  left: 8%;
  width: 60px;
  height: 60px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 10L55 40L85 45L55 50L50 80L45 50L15 45L45 40Z" fill="%23ff7b25"/><circle cx="25" cy="25" r="3" fill="%234ECDC4"/><circle cx="75" cy="25" r="2" fill="%234caf50"/><circle cx="75" cy="75" r="3" fill="%23ff7b25"/></svg>');
  animation: pulse 3s ease-in-out infinite;
}

.sticker-envelope {
  bottom: 15%;
  right: 5%;
  width: 100px;
  height: 100px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="15" y="25" width="70" height="50" rx="3" fill="%234ECDC4"/><path d="M15 25L50 50L85 25" stroke="white" stroke-width="2" fill="none"/><circle cx="75" cy="20" r="5" fill="%23ff7b25"/></svg>');
  animation: float 8s ease-in-out infinite;
  animation-delay: 1.5s;
}

/* ===== АНИМАЦИИ ===== */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
}

/* ===== АДАПТИВНЫЙ ДИЗАЙН ===== */

/* Большие экраны (1200px и выше) */
@media (max-width: 1200px) {
  .container {
    padding: 0 2rem;
  }
  
  .hero-title {
    font-size: 5rem;
  }
  
  .section-grid {
    gap: 3rem;
  }
  
  .journey-slide {
    gap: 3rem;
  }
  
  .facts-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

/* Планшеты (992px и ниже) */
@media (max-width: 992px) {
  .hero-title {
    font-size: 4rem;
  }
  
  .section-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .section-title.large-title {
    font-size: 3rem;
  }
  
  .journey-slide {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .journey-image {
    height: 400px;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .love-note {
    padding: 3rem 2rem;
  }
  
  .family-content {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  
  .family-name {
    font-size: 2.5rem;
    text-align: center;
  }
  
  .parent-traits {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .unique-list {
    gap: 1rem;
  }
  
  .unique-item {
    padding: 1rem;
  }
}

/* Мобильные устройства (768px и ниже) */
@media (max-width: 768px) {
  .container {
    padding: 0 1.5rem;
  }
  
  .hero-title {
    font-size: 3rem;
  }
  
  .title-accent {
    font-size: 1.2rem;
    padding-left: 2rem;
  }
  
  .section-title {
    font-size: 2.5rem;
  }
  
  .section-title.large-title {
    font-size: 2.5rem;
  }
  
  .facts-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
  
  .gallery-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 2rem;
  }
  
  .lightbox-nav.prev {
    left: 1rem;
  }
  
  .lightbox-nav.next {
    right: 1rem;
  }
  
  .lightbox-caption {
    position: relative;
    bottom: 0;
    margin-top: 1rem;
  }
  
  .nav-links {
    gap: 1rem;
  }
  
  .nav-link {
    font-size: 0.8rem;
  }
  
  .main-nav {
    padding: 0 1rem;
  }
  
  .section-header {
    padding: 0 1.5rem;
  }
  
  .journeys-slider {
    padding: 0 1.5rem;
  }
}

/* Маленькие мобильные (576px и ниже) */
@media (max-width: 576px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .title-accent {
    font-size: 1rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .section-title.large-title {
    font-size: 2rem;
  }
  
  .section-number {
    font-size: 0.9rem;
  }
  
  .fact-card {
    height: 220px;
  }
  
  .fact-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  .fact-title {
    font-size: 1.2rem;
  }
  
  .fact-description {
    font-size: 1rem;
  }
  
  .note-title {
    font-size: 2.5rem;
  }
  
  .family-name {
    font-size: 2rem;
  }
  
  .inheritance-title {
    font-size: 1.5rem;
  }
  
  .unique-title {
    font-size: 1.2rem;
  }
  
  .parent-traits {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .parent-block {
    padding: 1rem;
  }
  
  .unique-traits {
    padding: 1.5rem;
  }
  
  .unique-item {
    flex-direction: column;
    text-align: center;
    gap: 0.8rem;
  }
  
  .unique-item:hover {
    transform: none;
  }
  
  .family-subtitle {
    font-size: 1rem;
  }
}
/* Очень маленькие экраны (480px и ниже) */
@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
    line-height: 1.1;
  }
  
  .section-title {
    font-size: 1.8rem;
  }
  
  .section-title.large-title {
    font-size: 1.8rem;
  }
  
  .journey-image {
    height: 300px;
  }
  
  .family-name {
    font-size: 1.8rem;
  }
  
  .note-title {
    font-size: 2rem;
  }
  
  .signature .name {
    font-size: 1.5rem;
  }
  
  .quote {
    font-size: 1.1rem;
    padding-left: 1.5rem;
  }
  
  .family-quote {
    font-size: 1rem;
    padding: 1.5rem;
  }
  
  .section-text {
    font-size: 1rem;
  }
  
  .note-content p {
    font-size: 1.1rem;
  }
}

/* ===== ДОПОЛНИТЕЛЬНЫЕ УЛУЧШЕНИЯ ===== */

/* Плавная прокрутка */
html {
  scroll-behavior: smooth;
}

/* Улучшенные переходы для всех интерактивных элементов */
button,
.nav-link,
.gallery-item,
.fact-card,
.social-link {
  transition: var(--transition);
}

/* Стили для фокуса (доступность) */
button:focus,
.nav-link:focus,
.gallery-item:focus,
.lightbox-close:focus,
.lightbox-nav:focus {
  outline: 2px solid var(--accent-teal);
  outline-offset: 2px;
}

/* Улучшенная типографика */
h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;
}

p {
  margin-bottom: 1rem;
}

/* Стили для скрытия скроллбара, но сохранения функциональности */
.journeys-slider::-webkit-scrollbar {
  display: none;
}

.journeys-slider {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Улучшенные тени для карточек */
.fact-card,
.gallery-item,
.section-image,
.family-image,
.love-note {
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.08);
}

.fact-card:hover,
.gallery-item:hover,
.section-image:hover,
.family-image:hover {
  box-shadow: 
    0 20px 25px rgba(0, 0, 0, 0.15),
    0 10px 10px rgba(0, 0, 0, 0.04);
}

/* Стили для состояния загрузки изображений */
img {
  transition: opacity 0.3s ease;
}

img:not([src]) {
  opacity: 0;
}

/* Улучшенные градиенты */
.hero-overlay {
  background: linear-gradient(
    to bottom,
    rgba(12, 18, 23, 0.6) 0%,
    rgba(12, 18, 23, 0.8) 70%,
    rgba(12, 18, 23, 0.9) 100%
  );
}

/* Стили для печати */
@media print {
  .sticker,
  .lightbox,
  .scroll-indicator,
  .slider-controls {
    display: none !important;
  }
  
  .hero-section {
    height: auto;
    min-height: 50vh;
  }
  
  .section-title {
    color: #000 !important;
  }
  
  .section-text,
  .family-description p,
  .note-content p {
    color: #333 !important;
  }
}
</style>