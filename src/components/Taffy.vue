<template>
  <div class="character-evolution">
    <!-- Hero Section с градиентом -->
    <div class="hero-section" ref="heroSection">
      <!-- Анимированный фон с пульсирующими кругами -->
      <div class="hero-particles-animated">
        <div class="particle-circle" v-for="i in 50" :key="i" :style="getParticleStyle(i)"></div>
      </div>

      <div class="hero-content fade-in">
        <div class="character-avatar-container">
          <div class="avatar-ring"></div>
          <div class="character-avatar">
            <img :src="avatarImage" alt="Fox Taffy" loading="lazy" />
          </div>
        </div>
        <h1 class="character-name">Fox Taffy</h1>
        <p class="character-tagline">Эволюция дизайна с 2019 по 2025</p>
        <div class="character-stats">
          <div class="stat-card">
            <i class="fas fa-calendar-alt stat-icon"></i>
            <div class="stat-value">{{ character.createdYear }}</div>
            <div class="stat-label">Год создания</div>
          </div>
          <div class="stat-card">
            <i class="fas fa-palette stat-icon"></i>
            <div class="stat-value">{{ evolutionSteps.length }}</div>
            <div class="stat-label">Версий дизайна</div>
          </div>
          <div class="stat-card">
            <i class="fas fa-paw stat-icon"></i>
            <div class="stat-value">{{ character.species }}</div>
            <div class="stat-label">Вид</div>
          </div>
        </div>
      </div>
    </div>

    <!-- О персонаже -->
    <div class="about-section">
      <div class="container">
        <h2 class="section-title fade-in-up">
          <i class="fas fa-star title-icon"></i>
          История создания
        </h2>
        <p class="about-text fade-in-up">{{ character.description }}</p>
      </div>
    </div>

    <!-- Временная линия эволюции -->
    <div class="timeline-section" ref="timelineSection">
      <div class="container">
        <h2 class="section-title fade-in-up">
          <i class="fas fa-paint-brush title-icon"></i>
          Эволюция дизайна
        </h2>

        <div class="timeline-wrapper">
          <div class="timeline-line"></div>

          <div
            v-for="(step, index) in evolutionSteps"
            :key="index"
            class="timeline-item"
            :class="{
              'timeline-item-left': index % 2 === 0,
              'timeline-item-right': index % 2 === 1
            }"
            :ref="el => { if (el) timelineItems[index] = el }"
          >
            <!-- Маркер года -->
            <div class="timeline-marker">
              <div class="marker-circle">
                <div class="marker-inner"></div>
              </div>
              <div class="marker-year">{{ step.year }}</div>
            </div>

            <!-- Контент -->
            <div class="timeline-content">
              <div class="timeline-card">
                <!-- Изображение -->
                <div class="card-image-wrapper">
                  <div v-if="!step.artwork" class="card-image-placeholder">
                    <i class="fas fa-image placeholder-icon"></i>
                    <p class="placeholder-text">Изображение скоро появится</p>
                  </div>
                  <div v-else class="card-image-container">
                    <img
                      :src="step.artwork"
                      :alt="`${character.name} - ${step.version}`"
                      class="card-image"
                      @click="openLightbox(step)"
                      loading="lazy"
                    />
                    <div class="image-overlay" @click="openLightbox(step)">
                      <i class="fas fa-search-plus overlay-icon"></i>
                    </div>
                  </div>
                </div>

                <!-- Информация -->
                <div class="card-body">
                  <div class="card-header">
                    <h3 class="card-title">{{ step.version }}</h3>
                    <div class="version-badge">v{{ index + 1 }}.0</div>
                  </div>

                  <div class="card-changes">
                    <h4 class="changes-heading">
                      <i class="fas fa-bolt heading-icon"></i>
                      Ключевые изменения
                    </h4>
                    <ul class="changes-list">
                      <li v-for="(change, cIndex) in step.changes" :key="cIndex" class="change-item">
                        <span class="change-bullet"></span>
                        <span class="change-text">{{ change }}</span>
                      </li>
                    </ul>
                  </div>

                  <div v-if="step.notes" class="card-notes">
                    <i class="fas fa-lightbulb notes-icon"></i>
                    <p class="notes-text">{{ step.notes }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Галерея артов из БД -->
    <div class="gallery-section" ref="gallerySection">
      <div class="container">
        <h2 class="section-title fade-in-up">
          <i class="fas fa-images title-icon"></i>
          Галерея артов
        </h2>
        <p class="section-subtitle fade-in-up">Все арты персонажа Taffy</p>

        <!-- Загрузка -->
        <div v-if="loadingArts" class="gallery-loading">
          <div class="loading-spinner"></div>
          <p>Загрузка артов...</p>
        </div>

        <!-- Ошибка -->
        <div v-else-if="artsError" class="gallery-error">
          <i class="fas fa-exclamation-triangle error-icon"></i>
          <p>{{ artsError }}</p>
        </div>

        <!-- Карусель -->
        <div v-else-if="taffyArts.length > 0" class="gallery-carousel-wrapper">
          <button
            class="carousel-nav carousel-nav-left"
            @click="scrollCarousel('left')"
            :disabled="!canScrollLeft"
          >
            <i class="fas fa-chevron-left"></i>
          </button>

          <div class="gallery-carousel" ref="carouselRef">
            <div
              v-for="art in taffyArts"
              :key="art.id"
              class="carousel-item"
              @click="openArtLightbox(art)"
            >
              <div class="carousel-card">
                <img
                  :src="art.thumbnail_url || art.image_url"
                  :alt="art.title"
                  class="carousel-image"
                  loading="lazy"
                />
                <div class="carousel-overlay">
                  <div class="overlay-content">
                    <i class="fas fa-search-plus overlay-icon"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            class="carousel-nav carousel-nav-right"
            @click="scrollCarousel('right')"
            :disabled="!canScrollRight"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        <!-- Пустая галерея -->
        <div v-else class="gallery-empty">
          <i class="fas fa-folder-open empty-icon"></i>
          <p>Пока нет артов с персонажем Taffy</p>
        </div>
      </div>
    </div>

    <!-- Lightbox для просмотра изображений -->
    <Transition name="lightbox">
      <div v-if="lightboxImage" class="lightbox-overlay" @click="closeLightbox">
        <div class="lightbox-content" @click.stop>
          <button class="lightbox-close" @click="closeLightbox">
            <i class="fas fa-times"></i>
          </button>

          <div class="lightbox-image-wrapper">
            <img
              :src="lightboxImage.artwork || lightboxImage.image_url"
              :alt="lightboxImage.version || lightboxImage.title"
              class="lightbox-image"
            />
          </div>

          <div class="lightbox-info">
            <h3 class="lightbox-title">{{ lightboxImage.version || lightboxImage.title }}</h3>
            <p v-if="lightboxImage.year" class="lightbox-year">{{ lightboxImage.year }}</p>
            <p v-if="lightboxImage.artist_name" class="lightbox-artist">
              <i class="fas fa-user-artist artist-icon"></i> {{ lightboxImage.artist_name }}
            </p>
          </div>

          <!-- Навигация между артами -->
          <div v-if="lightboxIndex !== null" class="lightbox-nav">
            <button
              class="lightbox-nav-btn lightbox-prev"
              @click="navigateLightbox(-1)"
              :disabled="lightboxIndex === 0"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <button
              class="lightbox-nav-btn lightbox-next"
              @click="navigateLightbox(1)"
              :disabled="lightboxIndex === taffyArts.length - 1"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue'
import { furryApi } from '@/config/supabase.js'
import avatarImage from '@/assets/Image/Avatar.jpg'

// ============================================
// ДАННЫЕ ПЕРСОНАЖА
// ============================================
const character = reactive({
  name: 'Fox Taffy',
  description: 'Всем привет! Сегодня я расскажу увлекательную историю эволюции моей фурсоны Fox Taffy — персонажа, который стал неотъемлемой частью моей жизни и идентичности в фурри-сообществе. За несколько лет мой персонаж прошел удивительный путь трансформации, отражая моё творческое развитие и поиск собственного стиля.',
  species: 'Лиса',
  createdYear: '2019'
})

// Base URL для изображений в Main бакете S3
const MAIN_BUCKET_URL = '/s3/main/Taffy/'

const evolutionSteps = reactive([
  {
    year: '2019',
    version: 'Первоначальный дизайн',
    artwork: `${MAIN_BUCKET_URL}2019-first-design.jpg`,
    changes: [
      'Лаймово-голубые лапы и волосы',
      'Очки и цветки на шее',
      'Зелёное пузо',
      'Первые наброски характера'
    ],
    notes: 'Был немного вдохновлён лапами маскота FIFA 2018 Забиваки. Имя было выбрано в честь русской писательницы Надежды Тэффи, которая славилась своим остроумием и уникальным стилем.'
  },
  {
    year: '2020',
    version: 'Доработка и первый арт',
    artwork: `${MAIN_BUCKET_URL}2020-rework.jpg`,
    changes: [
      'Нос изменён с чёрного на голубой',
      'Волосы убраны для чистоты дизайна',
      'Изменена форма хвоста',
      'Белый цвет лап спущен до пальцев',
      'Белые руки для баланса'
    ],
    notes: 'После отзывов от сообщества и глубоких размышлений о дизайне, в 2020 году Тэффи ощутил первые серьёзные изменения. Это был период активного поиска идеального образа.'
  },
  {
    year: '2021',
    version: 'Упрощение палитры',
    artwork: null, // Шаблон для добавления через загрузку
    changes: [
      'Упрощена цветовая палитра',
      'Улучшена читаемость персонажа',
      'Добавлены характерные черты',
      'Работа над узнаваемостью силуэта'
    ],
    notes: 'Год экспериментов с минимализмом. Понял, что иногда меньше — значит лучше.'
  },
  {
    year: '2022',
    version: 'Новый художественный стиль',
    artwork: `${MAIN_BUCKET_URL}2022-new-style.jpg`,
    changes: [
      'Кардинально изменен художественный стиль',
      'Добавлены уникальные особенности меха',
      'Переработана цветовая палитра',
      'Создан фирменный образ',
      'Улучшена детализация'
    ],
    notes: 'Поиск собственного уникального стиля в изображении персонажа. Начал активно работать с различными художниками для поиска идеального воплощения.'
  },
  {
    year: '2023',
    version: 'Детализация и проработка',
    artwork: `${MAIN_BUCKET_URL}2023-detailed.jpg`,
    changes: [
      'Добавлено множество мелких деталей',
      'Проработана текстура и градиенты меха',
      'Создана полная backstory персонажа',
      'Разработаны позы и жесты',
      'Углублена индивидуальность'
    ],
    notes: 'Фокус на деталях и создании глубокой истории персонажа. В этом году Taffy обрёл настоящую душу и характер.'
  },
  {
    year: '2024',
    version: 'Современная версия',
    artwork: `${MAIN_BUCKET_URL}2024-current.jpg`,
    changes: [
      'Финальные штрихи в дизайне',
      'Создание альтернативных образов и аутфитов',
      'Разработка мерчандайза и стикеров',
      'Полировка всех деталей',
      'Создание reference sheet'
    ],
    notes: 'Текущая версия персонажа, который теперь представляет меня в сообществе. Taffy стал полноценным символом моего творческого пути.'
  },
  {
    year: '2025',
    version: 'Планы на будущее',
    artwork: null, // Шаблон для добавления через загрузку
    changes: [
      'Работа над 3D моделью',
      'Создание анимированных эмоций',
      'Разработка VRChat аватара',
      'Планирование фурсьюта',
      'Расширение вселенной персонажа'
    ],
    notes: 'Taffy продолжает развиваться! Впереди много интересных проектов и новых воплощений персонажа.'
  }
])

// ============================================
// АНИМАЦИЯ ЧАСТИЦ
// ============================================
const getParticleStyle = (index) => {
  // Цвета персонажа Taffy: оранжевый, зеленый, голубой
  const colors = [
    'rgba(255, 123, 37, 0.6)',   // Оранжевый
    'rgba(102, 255, 102, 0.6)',  // Зеленый
    'rgba(102, 204, 255, 0.6)',  // Голубой
    'rgba(255, 179, 102, 0.5)',  // Светло-оранжевый
    'rgba(153, 255, 153, 0.5)'   // Светло-зеленый
  ]

  const size = Math.random() * 100 + 30 // 30-130px
  const left = Math.random() * 100 // 0-100%
  const top = Math.random() * 100 // 0-100%
  const animationDuration = Math.random() * 4 + 3 // 3-7s
  const animationDelay = Math.random() * 3 // 0-3s
  const color = colors[Math.floor(Math.random() * colors.length)]

  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    top: `${top}%`,
    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
    animationDuration: `${animationDuration}s`,
    animationDelay: `${animationDelay}s`
  }
}

// ============================================
// ГАЛЕРЕЯ АРТОВ ИЗ БД
// ============================================
const taffyArts = ref([])
const loadingArts = ref(true)
const artsError = ref('')

// Загрузка артов по персонажу Taffy
const loadTaffyArts = async () => {
  try {
    loadingArts.value = true
    artsError.value = ''

    console.log('🎨 Загружаем арты персонажа Taffy...')

    // Загружаем все арты и фильтруем локально
    const allArts = await furryApi.getFurryArts({
      showNsfw: true, // Показываем все арты
      limit: 500, // Увеличиваем лимит для загрузки всех артов
      sort: 'newest'
    })

    console.log(`📊 Всего загружено артов: ${allArts.length}`)

    // Выводим ВСЕ уникальные персонажи из базы данных для отладки
    const allCharacters = [...new Set(allArts.flatMap(art =>
      (art.characters || []).map(char => char.name).filter(Boolean)
    ))]
    console.log('🔍 ВСЕ персонажи в базе данных:', allCharacters)
    console.log('🔍 Всего уникальных персонажей:', allCharacters.length)

    // Фильтруем арты с персонажем Taffy или Fox Taffy (без учета регистра)
    const filteredArts = allArts.filter(art =>
      art.characters && art.characters.some(char => {
        if (!char.name) return false
        const charName = char.name.toLowerCase()
        return charName.includes('taffy') || charName.includes('fox taffy') || charName === 'taffy'
      })
    )

    taffyArts.value = filteredArts
    console.log(`✅ Найдено ${filteredArts.length} артов с персонажем Taffy`)

    // Выводим информацию о найденных персонажах для отладки
    if (filteredArts.length > 0) {
      const uniqueCharacters = [...new Set(filteredArts.flatMap(art =>
        art.characters.map(char => char.name)
      ))]
      console.log('🦊 Найденные персонажи с Taffy:', uniqueCharacters)
    } else {
      console.warn('⚠️ Персонаж "Taffy" не найден в базе данных!')
      console.warn('💡 Подсказка: Проверьте, есть ли в БД персонаж с именем "Taffy" или "Fox Taffy"')
    }

  } catch (error) {
    console.error('❌ Ошибка загрузки артов:', error)
    artsError.value = 'Не удалось загрузить арты'
  } finally {
    loadingArts.value = false
  }
}

// ============================================
// КАРУСЕЛЬ
// ============================================
const carouselRef = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)

const scrollCarousel = (direction) => {
  if (!carouselRef.value) return

  const scrollAmount = 400
  const newScrollLeft = carouselRef.value.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)

  carouselRef.value.scrollTo({
    left: newScrollLeft,
    behavior: 'smooth'
  })
}

const updateScrollButtons = () => {
  if (!carouselRef.value) return

  const { scrollLeft, scrollWidth, clientWidth } = carouselRef.value
  canScrollLeft.value = scrollLeft > 0
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 10
}

// ============================================
// LIGHTBOX
// ============================================
const lightboxImage = ref(null)
const lightboxIndex = ref(null)

const openLightbox = (step) => {
  lightboxImage.value = step
  lightboxIndex.value = null
  document.body.style.overflow = 'hidden'
}

const openArtLightbox = (art) => {
  lightboxImage.value = art
  lightboxIndex.value = taffyArts.value.findIndex(a => a.id === art.id)
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  lightboxImage.value = null
  lightboxIndex.value = null
  document.body.style.overflow = ''
}

const navigateLightbox = (direction) => {
  if (lightboxIndex.value === null) return

  const newIndex = lightboxIndex.value + direction
  if (newIndex >= 0 && newIndex < taffyArts.value.length) {
    lightboxIndex.value = newIndex
    lightboxImage.value = taffyArts.value[newIndex]
  }
}

// ============================================
// АНИМАЦИИ ПРИ СКРОЛЛЕ
// ============================================
const timelineItems = ref([])
const heroSection = ref(null)
const timelineSection = ref(null)
const gallerySection = ref(null)

const observeElements = () => {
  const options = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
      }
    })
  }, options)

  // Наблюдаем за timeline items
  timelineItems.value.forEach(item => {
    if (item) observer.observe(item)
  })

  // Наблюдаем за секциями
  const sections = document.querySelectorAll('.fade-in-up, .timeline-item')
  sections.forEach(section => observer.observe(section))

  return observer
}

// ============================================
// ЖИЗНЕННЫЙ ЦИКЛ
// ============================================
let observer = null

onMounted(async () => {
  console.log('🚀 Инициализация страницы эволюции персонажа...')

  // Загружаем арты
  await loadTaffyArts()

  // Инициализируем анимации
  setTimeout(() => {
    observer = observeElements()
  }, 100)

  // Слушаем скролл карусели
  if (carouselRef.value) {
    carouselRef.value.addEventListener('scroll', updateScrollButtons)
  }

  // Клавиши для лайтбокса
  window.addEventListener('keydown', handleKeyDown)

  console.log('✅ Страница эволюции персонажа инициализирована')
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
  }

  if (carouselRef.value) {
    carouselRef.value.removeEventListener('scroll', updateScrollButtons)
  }

  window.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})

const handleKeyDown = (e) => {
  if (!lightboxImage.value) return

  if (e.key === 'Escape') {
    closeLightbox()
  } else if (e.key === 'ArrowLeft' && lightboxIndex.value !== null) {
    navigateLightbox(-1)
  } else if (e.key === 'ArrowRight' && lightboxIndex.value !== null) {
    navigateLightbox(1)
  }
}
</script>

<style scoped>
/* ============================================
   ОБЩИЕ СТИЛИ
   ============================================ */
.character-evolution {
  min-height: 100vh;
  background: linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  color: #ffffff;
  overflow-x: hidden;
}

/* Отмена глобальных стилей для иконок */
.character-evolution .fas,
.character-evolution .fa {
  background: none !important;
  border-radius: 0 !important;
  padding: 0 !important;
  width: auto !important;
  height: auto !important;
  line-height: 1 !important;
  display: inline-block !important;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* ============================================
   HERO SECTION
   ============================================ */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0c29 100%);
  overflow: hidden;
}

/* Анимированный фон с пульсирующими кругами */
.hero-particles-animated {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.particle-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  animation: particlePulse 5s ease-in-out infinite;
  pointer-events: none;
  mix-blend-mode: screen;
}

@keyframes particlePulse {
  0%, 100% {
    transform: scale(1) translateY(0);
    opacity: 0.6;
  }
  25% {
    transform: scale(1.2) translateY(-20px);
    opacity: 0.8;
  }
  50% {
    transform: scale(0.8) translateY(20px);
    opacity: 0.4;
  }
  75% {
    transform: scale(1.1) translateY(-10px);
    opacity: 0.7;
  }
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 2rem;
}

.character-avatar-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 3rem;
}

.avatar-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: linear-gradient(45deg, #ff7b25, #66ff66, #66ccff, #ff7b25);
  background-size: 300% 300%;
  animation: gradientRotate 8s ease infinite;
  filter: blur(12px);
  opacity: 0.7;
}

@keyframes gradientRotate {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.character-avatar {
  position: relative;
  width: 250px;
  height: 250px;
  border-radius: 50%;
  overflow: hidden;
  border: 6px solid rgba(255, 255, 255, 0.4);
  box-shadow:
    0 25px 50px rgba(0, 0, 0, 0.5),
    0 0 60px rgba(255, 123, 37, 0.3),
    inset 0 0 20px rgba(255, 255, 255, 0.1);
  animation: avatarFloat 6s ease-in-out infinite;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes avatarFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.character-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.character-name {
  font-size: 5rem;
  font-weight: 900;
  margin: 0 0 1rem 0;
  letter-spacing: -2px;
  color: #ffffff;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.character-tagline {
  font-size: 1.5rem;
  opacity: 0.95;
  margin-bottom: 3rem;
  font-weight: 300;
  letter-spacing: 1px;
}

.character-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  flex-wrap: wrap;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem 3rem;
  min-width: 160px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-8px);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(255, 123, 37, 0.3);
  border-color: rgba(255, 255, 255, 0.3);
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #ff7b25;
  filter: drop-shadow(0 2px 8px rgba(255, 123, 37, 0.5));
  background: none !important;
  border-radius: 0 !important;
  padding: 0 !important;
  width: auto !important;
  height: auto !important;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0.5rem 0;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.stat-label {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

/* ============================================
   ABOUT SECTION
   ============================================ */
.about-section {
  padding: 6rem 0;
  background: rgba(0, 0, 0, 0.2);
}

.about-text {
  max-width: 900px;
  margin: 0 auto;
  font-size: 1.25rem;
  line-height: 1.8;
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
}

/* ============================================
   TIMELINE SECTION
   ============================================ */
.timeline-section {
  padding: 8rem 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.4) 100%);
}

.section-title {
  text-align: center;
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  background: linear-gradient(135deg, #ff7b25 0%, #66ff66 50%, #66ccff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
}

.section-subtitle {
  text-align: center;
  font-size: 1.25rem;
  opacity: 0.8;
  margin-bottom: 4rem;
  color: rgba(255, 255, 255, 0.85);
}

.title-icon {
  font-size: 2.5rem;
  color: #ff7b25;
  filter: drop-shadow(0 4px 8px rgba(255, 123, 37, 0.6));
  background: none !important;
  border-radius: 0 !important;
  padding: 0 !important;
  width: auto !important;
  height: auto !important;
  -webkit-text-fill-color: #ff7b25;
}

.timeline-wrapper {
  position: relative;
  padding: 4rem 0;
}

.timeline-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg,
    #667eea 0%,
    #764ba2 33%,
    #f093fb 66%,
    #667eea 100%
  );
  transform: translateX(-50%);
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
}

.timeline-item {
  position: relative;
  margin-bottom: 6rem;
  opacity: 0;
  transform: translateY(50px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.timeline-item.visible {
  opacity: 1;
  transform: translateY(0);
}

.timeline-item-left .timeline-content {
  margin-right: calc(50% + 80px);
}

.timeline-item-right .timeline-content {
  margin-left: calc(50% + 80px);
}

.timeline-marker {
  position: absolute;
  left: 50%;
  top: 50px;
  transform: translateX(-50%);
  text-align: center;
  z-index: 10;
}

.marker-circle {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 8px rgba(102, 126, 234, 0.2);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 8px rgba(102, 126, 234, 0.2);
  }
  50% {
    box-shadow: 0 0 0 15px rgba(102, 126, 234, 0.1);
  }
}

.marker-inner {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
}

.marker-year {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
}

.timeline-content {
  width: 100%;
}

.timeline-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 25px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  transition: all 0.4s ease;
}

.timeline-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 255, 255, 0.2);
}

.card-image-wrapper {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  cursor: pointer;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.card-image-wrapper:hover .card-image {
  transform: scale(1.1);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card-image-wrapper:hover .image-overlay {
  opacity: 1;
}

.overlay-icon {
  font-size: 3rem;
  color: white;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
}

.card-image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.placeholder-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
  color: rgba(255, 255, 255, 0.3);
}

.placeholder-text {
  font-size: 1.2rem;
  opacity: 0.6;
}

.card-image-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.card-body {
  padding: 2.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.card-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.version-badge {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.card-changes {
  margin-bottom: 2rem;
}

.changes-heading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  opacity: 0.9;
}

.heading-icon {
  font-size: 1.5rem;
  color: #ff7b25;
}

.changes-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.change-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-left: 0.5rem;
}

.change-bullet {
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  margin-top: 0.5rem;
  flex-shrink: 0;
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
}

.change-text {
  font-size: 1.1rem;
  line-height: 1.6;
  opacity: 0.9;
}

.card-notes {
  background: rgba(102, 126, 234, 0.1);
  border-left: 4px solid #667eea;
  padding: 1.5rem;
  border-radius: 10px;
  display: flex;
  gap: 1rem;
}

.notes-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  color: #66ff66;
}

.notes-text {
  font-size: 1.05rem;
  line-height: 1.7;
  opacity: 0.85;
  font-style: italic;
  margin: 0;
}

/* ============================================
   GALLERY SECTION
   ============================================ */
.gallery-section {
  padding: 8rem 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%);
}

.gallery-loading,
.gallery-error,
.gallery-empty {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  margin: 0 auto 2rem;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon,
.empty-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  opacity: 0.6;
  color: #9ca3af;
}

.gallery-carousel-wrapper {
  position: relative;
  padding: 0 4rem;
}

.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-nav:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-50%) scale(1.1);
}

.carousel-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.carousel-nav-left {
  left: 0;
}

.carousel-nav-right {
  right: 0;
}

.gallery-carousel {
  display: flex;
  gap: 2rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 2rem 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(102, 126, 234, 0.5) rgba(255, 255, 255, 0.1);
}

.gallery-carousel::-webkit-scrollbar {
  height: 8px;
}

.gallery-carousel::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.gallery-carousel::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 10px;
}

.carousel-item {
  flex: 0 0 auto;
  width: 350px;
}

.carousel-card {
  position: relative;
  width: 100%;
  height: 450px;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.4s ease;
}

.carousel-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  border-color: rgba(255, 255, 255, 0.3);
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.carousel-card:hover .carousel-image {
  transform: scale(1.1);
}

.carousel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.8) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.carousel-card:hover .carousel-overlay {
  opacity: 1;
}

.overlay-content {
  text-align: center;
}

/* ============================================
   LIGHTBOX
   ============================================ */
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 2rem;
}

.lightbox-content {
  position: relative;
  max-width: 1200px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.lightbox-close {
  position: absolute;
  top: -60px;
  right: 0;
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.lightbox-image-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.5);
}

.lightbox-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 10px;
}

.lightbox-info {
  text-align: center;
  padding: 2rem 0 0;
}

.lightbox-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.lightbox-year {
  font-size: 1.25rem;
  opacity: 0.7;
}

.lightbox-artist {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  font-size: 1.1rem;
}

.artist-icon {
  font-size: 1.25rem;
  color: #ff7b25;
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  pointer-events: none;
}

.lightbox-nav-btn {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  pointer-events: all;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-nav-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.lightbox-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.lightbox-prev {
  margin-left: -80px;
}

.lightbox-next {
  margin-right: -80px;
}

/* ============================================
   TRANSITIONS
   ============================================ */
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-enter-active .lightbox-content,
.lightbox-leave-active .lightbox-content {
  transition: transform 0.3s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

.lightbox-enter-from .lightbox-content {
  transform: scale(0.9);
}

.lightbox-leave-to .lightbox-content {
  transform: scale(0.9);
}

.fade-in {
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease;
}

.fade-in-up.visible {
  opacity: 1;
  transform: translateY(0);
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 1200px) {
  .timeline-line {
    left: 40px;
  }

  .timeline-marker {
    left: 40px;
  }

  .timeline-item-left .timeline-content,
  .timeline-item-right .timeline-content {
    margin-left: 120px;
    margin-right: 0;
  }
}

@media (max-width: 768px) {
  .character-name {
    font-size: 3rem;
  }

  .character-avatar-container {
    margin-bottom: 2rem;
  }

  .avatar-ring {
    width: 200px;
    height: 200px;
  }

  .character-avatar {
    width: 180px;
    height: 180px;
  }

  .character-stats {
    gap: 1.5rem;
  }

  .stat-card {
    padding: 1.5rem 2rem;
    min-width: 120px;
  }

  .section-title {
    font-size: 2.5rem;
  }

  .card-image-wrapper {
    height: 250px;
  }

  .card-body {
    padding: 1.5rem;
  }

  .card-title {
    font-size: 1.5rem;
  }

  .carousel-item {
    width: 280px;
  }

  .carousel-card {
    height: 380px;
  }

  .gallery-carousel-wrapper {
    padding: 0 3rem;
  }

  .carousel-nav {
    width: 45px;
    height: 45px;
  }

  .lightbox-prev {
    margin-left: 0;
  }

  .lightbox-next {
    margin-right: 0;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 1rem;
  }

  .character-name {
    font-size: 2.5rem;
  }

  .character-tagline {
    font-size: 1.1rem;
  }

  .about-text {
    font-size: 1.1rem;
  }

  .timeline-card {
    margin-left: 100px !important;
  }

  .marker-year {
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
  }

  .carousel-item {
    width: 240px;
  }

  .carousel-card {
    height: 320px;
  }

  .gallery-carousel-wrapper {
    padding: 0 2rem;
  }

  .carousel-nav {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
}
</style>
