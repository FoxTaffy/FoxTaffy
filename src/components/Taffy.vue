<template>
  <div class="taffy" :class="{ 'is-ready': ready }">
    <!-- ===================== HERO ===================== -->
    <header class="hero" ref="heroRef" @pointermove="onHeroMove">
      <div class="hero-glow hero-glow-a" :style="glowStyle(1)"></div>
      <div class="hero-glow hero-glow-b" :style="glowStyle(-1.6)"></div>
      <div class="hero-grid" aria-hidden="true"></div>
      <div class="hero-word" aria-hidden="true">TAFFY</div>

      <div class="hero-inner">
        <div class="hero-portrait reveal">
          <div class="portrait-ring"></div>
          <img :src="avatarImage" alt="Fox Taffy" class="portrait-img" />
          <span class="portrait-tag"><font-awesome-icon :icon="['fas', 'paw']" /> лис</span>
        </div>

        <div class="hero-text">
          <p class="eyebrow reveal" style="--d: 80ms">Character story · {{ character.createdYear }}–{{ lastYear }}</p>
          <h1 class="hero-title reveal" style="--d: 160ms">
            Fox <span class="grad-text">Taffy</span>
          </h1>
          <p class="hero-lead reveal" style="--d: 240ms">
            Как один рыжий лис с голубым носом прошёл путь от первых набросков до узнаваемого образа.
          </p>

          <ul class="hero-stats reveal" style="--d: 320ms">
            <li>
              <strong>{{ yearsActive }}</strong>
              <span>лет истории</span>
            </li>
            <li>
              <strong>{{ drawnCount }}</strong>
              <span>версий дизайна</span>
            </li>
            <li>
              <strong>{{ arts.length }}</strong>
              <span>артов в галерее</span>
            </li>
          </ul>

          <div class="hero-cta reveal" style="--d: 400ms">
            <a href="#evolution" class="btn btn-primary" @click.prevent="scrollTo('evolution')">
              Смотреть эволюцию
              <font-awesome-icon :icon="['fas', 'chevron-down']" />
            </a>
            <a href="#gallery" class="btn btn-ghost" @click.prevent="scrollTo('gallery')">Галерея</a>
          </div>
        </div>
      </div>

      <button class="scroll-cue" aria-label="Прокрутить вниз" @click="scrollTo('story')">
        <span class="scroll-cue-dot"></span>
      </button>
    </header>

    <!-- ===================== STORY ===================== -->
    <section id="story" class="section story">
      <div class="wrap story-grid">
        <div class="story-main">
          <p class="eyebrow reveal">История</p>
          <h2 class="section-title reveal">Фурсона, ставшая <span class="grad-text">частью меня</span></h2>
          <p class="story-text reveal" v-for="(p, i) in character.story" :key="i">{{ p }}</p>
        </div>

        <aside class="story-side">
          <div class="fact-card reveal">
            <h3 class="fact-title">Паспорт персонажа</h3>
            <dl class="facts">
              <div v-for="f in character.facts" :key="f.label" class="fact-row">
                <dt>{{ f.label }}</dt>
                <dd>{{ f.value }}</dd>
              </div>
            </dl>
          </div>

          <div class="palette-card reveal" style="--d: 100ms">
            <h3 class="fact-title">Палитра</h3>
            <div class="swatches">
              <button
                v-for="c in palette"
                :key="c.hex"
                class="swatch"
                :style="{ '--c': c.hex }"
                :title="`Скопировать ${c.hex}`"
                @click="copyColor(c.hex)"
              >
                <span class="swatch-dot"></span>
                <span class="swatch-name">{{ c.name }}</span>
                <span class="swatch-hex">{{ copied === c.hex ? 'Скопировано' : c.hex }}</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <!-- ===================== EVOLUTION ===================== -->
    <section id="evolution" class="section evolution">
      <div class="wrap">
        <p class="eyebrow reveal">Таймлайн</p>
        <h2 class="section-title reveal">Эволюция <span class="grad-text">дизайна</span></h2>
      </div>

      <nav class="year-rail" aria-label="Годы">
        <div class="year-rail-inner">
          <button
            v-for="(s, i) in steps"
            :key="s.year"
            class="year-pill"
            :class="{ active: activeStep === i }"
            @click="goToStep(i)"
          >
            {{ s.year }}
          </button>
          <span class="year-progress" :style="{ transform: `scaleX(${progress})` }"></span>
        </div>
      </nav>

      <div class="wrap chapters">
        <article
          v-for="(s, i) in steps"
          :key="s.year"
          :id="`step-${i}`"
          class="chapter"
          :class="{ flip: i % 2 === 1, future: s.future }"
          :ref="el => (chapterEls[i] = el)"
        >
          <span class="chapter-year" aria-hidden="true">{{ s.year }}</span>

          <figure class="chapter-media reveal">
            <button
              v-if="s.artwork && !broken[i]"
              class="media-frame"
              :aria-label="`Открыть: ${s.version}`"
              @click="openLightbox(stepSlides, stepSlideIndex[i])"
            >
              <img :src="s.artwork" :alt="`Fox Taffy — ${s.version}`" loading="lazy" @error="broken[i] = true" />
              <span class="media-zoom"><font-awesome-icon :icon="['fas', 'search-plus']" /></span>
            </button>
            <div v-else class="media-frame media-empty">
              <font-awesome-icon :icon="['fas', s.future ? 'rocket' : 'paint-brush']" class="empty-ico" />
              <span>{{ s.future ? 'Скоро' : 'Референс скоро появится' }}</span>
            </div>
            <figcaption class="media-badge">v{{ i + 1 }}.0</figcaption>
          </figure>

          <div class="chapter-body reveal" style="--d: 120ms">
            <p class="chapter-kicker">{{ s.year }} · {{ s.future ? 'Впереди' : `Глава ${i + 1}` }}</p>
            <h3 class="chapter-title">{{ s.version }}</h3>

            <ul class="changes">
              <li v-for="(c, ci) in s.changes" :key="ci">
                <span class="change-dot"></span>{{ c }}
              </li>
            </ul>

            <blockquote v-if="s.notes" class="chapter-note">
              <font-awesome-icon :icon="['fas', 'quote-left']" class="note-ico" />
              <p>{{ s.notes }}</p>
            </blockquote>
          </div>
        </article>
      </div>
    </section>

    <!-- ===================== GALLERY ===================== -->
    <section id="gallery" class="section gallery">
      <div class="wrap">
        <div class="gallery-head">
          <div>
            <p class="eyebrow reveal">Арты</p>
            <h2 class="section-title reveal">Taffy <span class="grad-text">глазами художников</span></h2>
          </div>
          <router-link to="/gallery" class="btn btn-ghost reveal">
            Вся галерея
            <font-awesome-icon :icon="['fas', 'arrow-right']" />
          </router-link>
        </div>

        <div v-if="loading" class="masonry" aria-busy="true">
          <div v-for="n in 8" :key="n" class="tile skeleton" :style="{ aspectRatio: skelRatios[n % skelRatios.length] }"></div>
        </div>

        <div v-else-if="arts.length" class="masonry">
          <button
            v-for="(a, i) in arts"
            :key="a.id"
            class="tile reveal"
            :style="{ '--d': `${(i % 4) * 60}ms` }"
            @click="openLightbox(artSlides, i)"
          >
            <img :src="a.thumbnail_url || a.image_url" :alt="a.title" loading="lazy" />
            <span class="tile-info">
              <strong>{{ a.title }}</strong>
              <em v-if="a.artist_name">{{ a.artist_name }}</em>
            </span>
          </button>
        </div>

        <div v-else class="gallery-empty">
          <font-awesome-icon :icon="['fas', 'folder-open']" />
          <p>Пока нет артов с персонажем Taffy</p>
        </div>
      </div>
    </section>

    <!-- ===================== LIGHTBOX ===================== -->
    <Transition name="lb">
      <div
        v-if="lb"
        class="lb"
        role="dialog"
        aria-modal="true"
        @click.self="closeLightbox"
        @pointerdown="onLbDown"
        @pointerup="onLbUp"
      >
        <button class="lb-btn lb-close" aria-label="Закрыть" @click="closeLightbox">
          <font-awesome-icon :icon="['fas', 'times']" />
        </button>
        <button class="lb-btn lb-prev" aria-label="Назад" :disabled="lb.index === 0" @click="stepLightbox(-1)">
          <font-awesome-icon :icon="['fas', 'chevron-left']" />
        </button>
        <button
          class="lb-btn lb-next"
          aria-label="Вперёд"
          :disabled="lb.index === lb.list.length - 1"
          @click="stepLightbox(1)"
        >
          <font-awesome-icon :icon="['fas', 'chevron-right']" />
        </button>

        <figure class="lb-figure">
          <img :key="current.src" :src="current.src" :alt="current.title" class="lb-img" draggable="false" />
          <figcaption class="lb-cap">
            <strong>{{ current.title }}</strong>
            <span v-if="current.sub">{{ current.sub }}</span>
            <small>{{ lb.index + 1 }} / {{ lb.list.length }}</small>
          </figcaption>
        </figure>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { storageUrl } from '@/utils/storage'
import { furryApi } from '@/config/supabase.js'
import avatarImage from '@/assets/Image/Avatar.jpg'

// ============================================
// ДАННЫЕ
// ============================================
const MAIN_BUCKET_URL = storageUrl('Main', 'Taffy/')
const lastYear = 2025

const character = {
  createdYear: 2019,
  story: [
    'Всем привет! Это история эволюции моей фурсоны Fox Taffy — персонажа, который стал неотъемлемой частью моей жизни и идентичности в фурри-сообществе.',
    'За несколько лет он прошёл удивительный путь: менялись палитра, форма, стиль рисовки — вместе со мной и моим творческим поиском.'
  ],
  facts: [
    { label: 'Вид', value: 'Лиса' },
    { label: 'Создан', value: '2019' },
    { label: 'Имя', value: 'В честь Надежды Тэффи' },
    { label: 'Фирменное', value: 'Голубой нос, зелёные акценты' }
  ]
}

const palette = [
  { name: 'Мех', hex: '#F2A03D' },
  { name: 'Нос', hex: '#3DDC97' },
  { name: 'Уши', hex: '#9FC4E8' },
  { name: 'Акцент', hex: '#7BD43A' },
  { name: 'Грудь', hex: '#FFFFFF' }
]

const steps = reactive([
  {
    year: '2019',
    version: 'Первоначальный дизайн',
    artwork: `${MAIN_BUCKET_URL}2019-first-design.jpg`,
    changes: ['Лаймово-голубые лапы и волосы', 'Очки и цветки на шее', 'Зелёное пузо', 'Первые наброски характера'],
    notes: 'Был немного вдохновлён лапами маскота FIFA 2018 Забиваки. Имя выбрано в честь русской писательницы Надежды Тэффи, славившейся остроумием и уникальным стилем.'
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
    notes: 'После отзывов сообщества и размышлений о дизайне Тэффи пережил первые серьёзные изменения — период активного поиска идеального образа.'
  },
  {
    year: '2021',
    version: 'Упрощение палитры',
    artwork: null,
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
      'Кардинально изменён художественный стиль',
      'Уникальные особенности меха',
      'Переработана цветовая палитра',
      'Создан фирменный образ',
      'Улучшена детализация'
    ],
    notes: 'Поиск собственного стиля. Начал активно работать с разными художниками, чтобы найти идеальное воплощение.'
  },
  {
    year: '2023',
    version: 'Детализация и проработка',
    artwork: `${MAIN_BUCKET_URL}2023-detailed.jpg`,
    changes: [
      'Множество мелких деталей',
      'Текстура и градиенты меха',
      'Полная backstory персонажа',
      'Разработаны позы и жесты',
      'Углублена индивидуальность'
    ],
    notes: 'Фокус на деталях и истории. В этом году Taffy обрёл настоящую душу и характер.'
  },
  {
    year: '2024',
    version: 'Современная версия',
    artwork: null,
    changes: [
      'Финальные штрихи в дизайне',
      'Альтернативные образы и аутфиты',
      'Мерч и стикеры',
      'Полировка всех деталей',
      'Reference sheet'
    ],
    notes: 'Текущая версия, которая теперь представляет меня в сообществе. Taffy стал символом моего творческого пути.'
  },
  {
    year: '2025',
    version: 'Планы на будущее',
    artwork: null,
    future: true,
    changes: [
      'Работа над 3D-моделью',
      'Анимированные эмоции',
      'VRChat-аватар',
      'Планирование фурсьюта',
      'Расширение вселенной персонажа'
    ],
    notes: 'Taffy продолжает развиваться! Впереди много интересных проектов и новых воплощений.'
  }
])

const broken = reactive({})
const drawnCount = computed(() => steps.filter(s => !s.future).length)
const yearsActive = computed(() => new Date().getFullYear() - character.createdYear)

// ============================================
// АРТЫ ИЗ БД (+ запасная подборка из бакета)
// ============================================
const FALLBACK_ARTS = [
  { file: '1000018849.jpg', title: 'Зимний патруль', artist_name: 'MAFI-Maken' },
  { file: '1000018852.jpg', title: 'Огни и снег', artist_name: 'FluffyWolfy' },
  { file: '1000018853.jpg', title: 'Акварель в худи', artist_name: 'Katafalk' },
  { file: '1000018854.jpg', title: 'Карандашный скетч', artist_name: '' }
].map(a => {
  const url = `${MAIN_BUCKET_URL}${a.file}`
  return { id: `fallback-${a.file}`, title: a.title, artist_name: a.artist_name, image_url: url, thumbnail_url: url }
})

const arts = ref([])
const loading = ref(true)
const skelRatios = ['3/4', '1/1', '4/5', '3/4', '1/1', '4/3', '4/5', '1/1']

async function loadArts() {
  try {
    const all = await furryApi.getFurryArts({ showNsfw: true, limit: 500, sort: 'newest' })
    const found = all.filter(art => (art.characters || []).some(c => c.name && c.name.toLowerCase().includes('taffy')))
    arts.value = found.length ? found : FALLBACK_ARTS
  } catch (e) {
    console.error('Не удалось загрузить арты Taffy:', e)
    arts.value = FALLBACK_ARTS
  } finally {
    loading.value = false
    await nextTick()
    observeReveals()
  }
}

// ============================================
// ЛАЙТБОКС
// ============================================
const lb = ref(null)
const current = computed(() => (lb.value ? lb.value.list[lb.value.index] : null))

const stepSlides = computed(() =>
  steps
    .filter((s, i) => s.artwork && !broken[i])
    .map(s => ({ src: s.artwork, title: s.version, sub: s.year }))
)
const stepSlideIndex = computed(() => {
  const map = {}
  let n = 0
  steps.forEach((s, i) => {
    if (s.artwork && !broken[i]) map[i] = n++
  })
  return map
})
const artSlides = computed(() =>
  arts.value.map(a => ({ src: a.image_url, title: a.title, sub: a.artist_name ? `Автор: ${a.artist_name}` : '' }))
)

function openLightbox(list, index) {
  lb.value = { list, index }
  document.body.style.overflow = 'hidden'
}
function closeLightbox() {
  lb.value = null
  document.body.style.overflow = ''
}
function stepLightbox(d) {
  if (!lb.value) return
  const n = lb.value.index + d
  if (n >= 0 && n < lb.value.list.length) lb.value.index = n
}

let downX = null
const onLbDown = e => (downX = e.clientX)
function onLbUp(e) {
  if (downX === null) return
  const dx = e.clientX - downX
  downX = null
  if (Math.abs(dx) > 60) stepLightbox(dx < 0 ? 1 : -1)
}
function onKey(e) {
  if (!lb.value) return
  if (e.key === 'Escape') closeLightbox()
  else if (e.key === 'ArrowLeft') stepLightbox(-1)
  else if (e.key === 'ArrowRight') stepLightbox(1)
}

// ============================================
// HERO: параллакс свечения
// ============================================
const heroRef = ref(null)
const mouse = reactive({ x: 0, y: 0 })
const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function onHeroMove(e) {
  if (reduceMotion || !heroRef.value) return
  const r = heroRef.value.getBoundingClientRect()
  mouse.x = (e.clientX - r.left) / r.width - 0.5
  mouse.y = (e.clientY - r.top) / r.height - 0.5
}
const glowStyle = k => ({ transform: `translate(${mouse.x * 80 * k}px, ${mouse.y * 80 * k}px)` })

// ============================================
// ПАЛИТРА
// ============================================
const copied = ref('')
let copyTimer
async function copyColor(hex) {
  try {
    await navigator.clipboard.writeText(hex)
    copied.value = hex
    clearTimeout(copyTimer)
    copyTimer = setTimeout(() => (copied.value = ''), 1400)
  } catch {
    /* буфер обмена недоступен */
  }
}

// ============================================
// СКРОЛЛ: reveal, scroll-spy, прогресс
// ============================================
const ready = ref(false)
const chapterEls = []
const activeStep = ref(0)
const progress = ref(0)
let revealObs

function observeReveals() {
  if (!revealObs) return
  document.querySelectorAll('.taffy .reveal:not(.in)').forEach(el => revealObs.observe(el))
}

function onScroll() {
  const mid = window.innerHeight * 0.45
  let idx = 0
  chapterEls.forEach((el, i) => {
    if (el && el.getBoundingClientRect().top <= mid) idx = i
  })
  activeStep.value = idx

  const first = chapterEls[0]
  const last = chapterEls[chapterEls.length - 1]
  if (first && last) {
    const top = first.getBoundingClientRect().top + window.scrollY
    const bottom = last.getBoundingClientRect().bottom + window.scrollY
    const y = window.scrollY + mid
    progress.value = Math.min(1, Math.max(0, (y - top) / (bottom - top)))
  }
}

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
}
function goToStep(i) {
  chapterEls[i]?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
}

onMounted(() => {
  revealObs = new IntersectionObserver(
    entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('in')
          revealObs.unobserve(en.target)
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  )
  observeReveals()
  requestAnimationFrame(() => (ready.value = true))

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKey)
  onScroll()
  loadArts()
})

onBeforeUnmount(() => {
  revealObs?.disconnect()
  clearTimeout(copyTimer)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.taffy {
  --c-orange: var(--accent-orange);
  --c-green: var(--accent-green);
  --c-mint: #3ddc97;
  position: relative;
  color: var(--text-light);
  background: var(--bg-darker);
  overflow-x: clip;
}

.wrap {
  width: min(1180px, 100% - 3rem);
  margin-inline: auto;
}

.grad-text {
  background: linear-gradient(95deg, var(--c-orange), #ffc05a 45%, var(--c-mint));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.eyebrow {
  margin: 0 0 0.75rem;
  font-size: 0.78rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--c-orange);
  font-weight: 600;
}

.section {
  padding: clamp(4rem, 9vw, 8rem) 0;
}
.section-title {
  margin: 0 0 2rem;
  font-size: clamp(1.9rem, 4.2vw, 3.2rem);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

/* ---------- reveal ---------- */
.reveal {
  opacity: 0;
  transform: translateY(26px);
  transition: opacity 0.8s var(--ease-out) var(--d, 0ms), transform 0.8s var(--ease-out) var(--d, 0ms);
}
.reveal.in,
.is-ready .hero .reveal {
  opacity: 1;
  transform: none;
}

/* ---------- buttons ---------- */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1.5rem;
  border-radius: var(--radius-pill);
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
  transition: transform 0.25s var(--ease-out), box-shadow 0.25s, background 0.25s, border-color 0.25s;
}
.btn:hover {
  transform: translateY(-2px);
}
.btn-primary {
  color: #101010;
  background: linear-gradient(95deg, var(--c-orange), #ffb457);
  box-shadow: 0 8px 28px rgb(var(--accent-orange-rgb) / 0.35);
}
.btn-primary:hover {
  box-shadow: 0 12px 36px rgb(var(--accent-orange-rgb) / 0.5);
}
.btn-ghost {
  color: var(--text-light);
  background: var(--surface-glass);
  border-color: var(--border-color-strong);
  backdrop-filter: blur(8px);
}
.btn-ghost:hover {
  background: var(--surface-glass-hover);
  border-color: rgb(var(--accent-orange-rgb) / 0.5);
}

/* ===================== HERO ===================== */
.hero {
  position: relative;
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: 7rem 0 5rem;
  overflow: hidden;
  isolation: isolate;
  background:
    radial-gradient(1200px 600px at 80% -10%, rgb(var(--accent-orange-rgb) / 0.14), transparent 60%),
    radial-gradient(900px 500px at 0% 100%, rgb(var(--accent-green-rgb) / 0.12), transparent 60%),
    var(--bg-darker);
}
.hero-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.55;
  z-index: -1;
  transition: transform 0.6s var(--ease-out);
  will-change: transform;
}
.hero-glow-a {
  width: 520px;
  height: 520px;
  top: 8%;
  left: 52%;
  background: rgb(var(--accent-orange-rgb) / 0.45);
}
.hero-glow-b {
  width: 460px;
  height: 460px;
  bottom: 0;
  left: 6%;
  background: rgb(61 220 151 / 0.3);
}
.hero-grid {
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image:
    linear-gradient(rgb(var(--white-rgb) / 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgb(var(--white-rgb) / 0.04) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse at 50% 40%, #000 20%, transparent 72%);
}
.hero-word {
  position: absolute;
  left: 50%;
  bottom: -0.12em;
  transform: translateX(-50%);
  z-index: -1;
  font-size: clamp(9rem, 30vw, 28rem);
  font-weight: 900;
  line-height: 0.8;
  letter-spacing: -0.04em;
  color: transparent;
  -webkit-text-stroke: 1.5px rgb(var(--white-rgb) / 0.07);
  user-select: none;
  white-space: nowrap;
}

.hero-inner {
  width: min(1100px, 100% - 3rem);
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: clamp(2rem, 6vw, 5rem);
}

.hero-portrait {
  position: relative;
  width: clamp(220px, 28vw, 340px);
  aspect-ratio: 1;
}
.portrait-ring {
  position: absolute;
  inset: -14px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, var(--c-orange), var(--c-mint), #9fc4e8, var(--c-orange));
  animation: spin 14s linear infinite;
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px));
}
.portrait-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: 0 30px 80px rgb(0 0 0 / 0.55), 0 0 0 8px rgb(var(--white-rgb) / 0.04);
}
.portrait-tag {
  position: absolute;
  right: -6px;
  bottom: 14px;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.9rem;
  border-radius: var(--radius-pill);
  font-size: 0.82rem;
  font-weight: 600;
  background: rgb(18 18 18 / 0.78);
  border: 1px solid var(--border-color-strong);
  backdrop-filter: blur(10px);
}

.hero-title {
  margin: 0;
  font-size: clamp(3rem, 8.5vw, 6.6rem);
  line-height: 0.95;
  letter-spacing: -0.035em;
}
.hero-lead {
  margin: 1.4rem 0 0;
  max-width: 34rem;
  font-size: clamp(1.02rem, 1.6vw, 1.2rem);
  line-height: 1.6;
  color: var(--text-muted);
}
.hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  list-style: none;
  padding: 0;
  margin: 2rem 0 0;
}
.hero-stats li {
  min-width: 128px;
  padding: 0.9rem 1.2rem;
  border-radius: var(--radius-md);
  background: var(--surface-glass);
  border: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
}
.hero-stats strong {
  display: block;
  font-size: 1.9rem;
  line-height: 1;
  background: var(--gradient-brand);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.hero-stats span {
  display: block;
  margin-top: 0.35rem;
  font-size: 0.78rem;
  color: var(--text-muted);
}
.hero-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 2rem;
}

.scroll-cue {
  position: absolute;
  bottom: 1.6rem;
  left: 50%;
  transform: translateX(-50%);
  width: 26px;
  height: 42px;
  border-radius: 14px;
  border: 1.5px solid var(--border-color-strong);
  background: transparent;
  cursor: pointer;
}
.scroll-cue-dot {
  position: absolute;
  top: 8px;
  left: 50%;
  width: 4px;
  height: 8px;
  margin-left: -2px;
  border-radius: 2px;
  background: var(--c-orange);
  animation: cue 1.8s ease-in-out infinite;
}

/* ===================== STORY ===================== */
.story-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: clamp(2rem, 5vw, 4.5rem);
  align-items: start;
}
.story-text {
  margin: 0 0 1.2rem;
  font-size: 1.12rem;
  line-height: 1.8;
  color: rgb(var(--white-rgb) / 0.82);
}
.story-text:first-of-type::first-letter {
  float: left;
  font-size: 4.2rem;
  line-height: 0.85;
  padding: 0.2rem 0.6rem 0 0;
  font-weight: 800;
  color: var(--c-orange);
}
.story-side {
  display: grid;
  gap: 1.2rem;
  position: sticky;
  top: 6rem;
}
.fact-card,
.palette-card {
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  background: linear-gradient(160deg, rgb(var(--white-rgb) / 0.06), rgb(var(--white-rgb) / 0.02));
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-card);
}
.fact-title {
  margin: 0 0 1rem;
  font-size: 0.8rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.facts {
  margin: 0;
}
.fact-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.7rem 0;
  border-top: 1px solid var(--border-color);
}
.fact-row:first-child {
  border-top: 0;
}
.fact-row dt {
  color: var(--text-muted);
  font-size: 0.9rem;
}
.fact-row dd {
  margin: 0;
  text-align: right;
  font-weight: 600;
  font-size: 0.95rem;
}
.swatches {
  display: grid;
  gap: 0.5rem;
}
.swatch {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.8rem;
  padding: 0.55rem 0.7rem;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s, border-color 0.2s;
}
.swatch:hover {
  background: var(--surface-glass);
  border-color: var(--border-color);
}
.swatch-dot {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--c);
  box-shadow: 0 0 0 3px rgb(var(--white-rgb) / 0.06), 0 6px 18px color-mix(in srgb, var(--c) 45%, transparent);
}
.swatch-name {
  font-weight: 600;
  font-size: 0.92rem;
}
.swatch-hex {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.78rem;
  color: var(--text-muted);
}

/* ===================== EVOLUTION ===================== */
.year-rail {
  position: sticky;
  top: 4.2rem;
  z-index: 20;
  margin: 1rem 0 3rem;
  padding: 0.6rem 0;
  background: rgb(18 18 18 / 0.72);
  backdrop-filter: blur(14px);
  border-block: 1px solid var(--border-color);
}
.year-rail-inner {
  position: relative;
  width: min(1180px, 100% - 3rem);
  margin-inline: auto;
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 6px;
}
.year-rail-inner::-webkit-scrollbar {
  display: none;
}
.year-pill {
  flex: 0 0 auto;
  padding: 0.45rem 1rem;
  border-radius: var(--radius-pill);
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-muted);
  font: inherit;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: color 0.25s, background 0.25s, border-color 0.25s;
}
.year-pill:hover {
  color: var(--text-light);
}
.year-pill.active {
  color: #101010;
  background: linear-gradient(95deg, var(--c-orange), #ffb457);
}
.year-progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: var(--gradient-brand);
  transform-origin: left;
  transition: transform 0.15s linear;
}

.chapters {
  display: grid;
  gap: clamp(4rem, 9vw, 8rem);
}
.chapter {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1fr);
  gap: clamp(1.8rem, 5vw, 4.5rem);
  align-items: center;
  scroll-margin-top: 9rem;
}
.chapter.flip .chapter-media {
  order: 2;
}
.chapter-year {
  position: absolute;
  top: -0.35em;
  left: -0.04em;
  z-index: 0;
  font-size: clamp(6rem, 17vw, 14rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1.5px rgb(var(--white-rgb) / 0.07);
  pointer-events: none;
  user-select: none;
}
.chapter.flip .chapter-year {
  left: auto;
  right: -0.04em;
}

.chapter-media {
  position: relative;
  z-index: 1;
  margin: 0;
}
.media-frame {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 4 / 5;
  padding: 0;
  border: 1px solid var(--border-color-strong);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--card-bg);
  box-shadow: 0 30px 70px rgb(0 0 0 / 0.5);
  cursor: zoom-in;
  transition: transform 0.5s var(--ease-out), box-shadow 0.5s;
}
.chapter-media::before {
  content: '';
  position: absolute;
  inset: 8% -6% -6% 8%;
  z-index: -1;
  border-radius: var(--radius-lg);
  background: var(--gradient-brand-diag);
  opacity: 0.22;
  filter: blur(2px);
  transition: opacity 0.4s, transform 0.5s var(--ease-out);
}
.chapter.flip .chapter-media::before {
  inset: 8% 8% -6% -6%;
}
.chapter-media:hover::before {
  opacity: 0.4;
  transform: translate(6px, 6px);
}
.media-frame:hover {
  transform: translateY(-6px);
  box-shadow: 0 40px 90px rgb(0 0 0 / 0.55), 0 0 40px rgb(var(--accent-orange-rgb) / 0.18);
}
.media-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  transition: transform 0.9s var(--ease-out);
}
.media-frame:hover img {
  transform: scale(1.05);
}
.media-zoom {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgb(18 18 18 / 0.7);
  border: 1px solid var(--border-color-strong);
  backdrop-filter: blur(8px);
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 0.3s, transform 0.3s var(--ease-out);
}
.media-frame:hover .media-zoom {
  opacity: 1;
  transform: none;
}
.media-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  cursor: default;
  color: var(--text-muted);
  font-size: 0.95rem;
  border-style: dashed;
  background:
    repeating-linear-gradient(45deg, rgb(var(--white-rgb) / 0.035) 0 12px, transparent 12px 24px),
    radial-gradient(circle at 50% 40%, rgb(var(--accent-orange-rgb) / 0.2), transparent 70%),
    var(--card-bg);
}
.media-empty:hover {
  transform: none;
}
.empty-ico {
  font-size: 2.6rem;
  color: var(--c-orange);
  opacity: 0.75;
}
.future .media-empty {
  border-color: rgb(61 220 151 / 0.4);
}
.future .empty-ico {
  color: var(--c-mint);
}
.media-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.3rem 0.75rem;
  border-radius: var(--radius-pill);
  font-size: 0.78rem;
  font-weight: 700;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  background: rgb(18 18 18 / 0.75);
  border: 1px solid var(--border-color-strong);
  backdrop-filter: blur(8px);
}

.chapter-body {
  position: relative;
  z-index: 1;
}
.chapter-kicker {
  margin: 0 0 0.6rem;
  font-size: 0.78rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--c-orange);
  font-weight: 600;
}
.future .chapter-kicker {
  color: var(--c-mint);
}
.chapter-title {
  margin: 0 0 1.5rem;
  font-size: clamp(1.7rem, 3.4vw, 2.6rem);
  line-height: 1.12;
  letter-spacing: -0.02em;
}
.changes {
  list-style: none;
  padding: 0;
  margin: 0 0 1.6rem;
  display: grid;
  gap: 0.55rem;
}
.changes li {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  padding: 0.7rem 1rem;
  border-radius: var(--radius-sm);
  background: var(--surface-glass);
  border: 1px solid var(--border-color);
  line-height: 1.45;
  transition: transform 0.3s var(--ease-out), border-color 0.3s, background 0.3s;
}
.changes li:hover {
  transform: translateX(6px);
  border-color: rgb(var(--accent-orange-rgb) / 0.45);
  background: var(--surface-glass-hover);
}
.change-dot {
  flex: 0 0 auto;
  width: 9px;
  height: 9px;
  margin-top: 0.45em;
  border-radius: 50%;
  background: var(--gradient-brand-diag);
  box-shadow: 0 0 10px rgb(var(--accent-orange-rgb) / 0.6);
}
.chapter-note {
  position: relative;
  margin: 0;
  padding: 1.2rem 1.4rem 1.2rem 3.4rem;
  border-radius: var(--radius-md);
  border-left: 3px solid var(--c-orange);
  background: linear-gradient(90deg, rgb(var(--accent-orange-rgb) / 0.1), transparent);
}
.future .chapter-note {
  border-left-color: var(--c-mint);
  background: linear-gradient(90deg, rgb(61 220 151 / 0.1), transparent);
}
.chapter-note p {
  margin: 0;
  line-height: 1.7;
  color: rgb(var(--white-rgb) / 0.8);
  font-style: italic;
}
.note-ico {
  position: absolute;
  left: 1.2rem;
  top: 1.3rem;
  font-size: 1.2rem;
  color: var(--c-orange);
  opacity: 0.7;
}
.future .note-ico {
  color: var(--c-mint);
}

/* ===================== GALLERY ===================== */
.gallery {
  background: linear-gradient(180deg, var(--bg-darker), #151515 60%, var(--bg-darker));
}
.gallery-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
.masonry {
  column-count: 3;
  column-gap: 1.2rem;
}
.tile {
  position: relative;
  display: block;
  width: 100%;
  margin: 0 0 1.2rem;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  break-inside: avoid;
  background: var(--card-bg);
  cursor: zoom-in;
  color: inherit;
  font: inherit;
  text-align: left;
}
.tile img {
  display: block;
  width: 100%;
  height: auto;
  transition: transform 0.8s var(--ease-out);
}
.tile:hover img {
  transform: scale(1.06);
}
.tile::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px transparent;
  transition: box-shadow 0.3s;
  pointer-events: none;
}
.tile:hover::after {
  box-shadow: inset 0 0 0 2px rgb(var(--accent-orange-rgb) / 0.7);
}
.tile-info {
  position: absolute;
  inset: auto 0 0 0;
  display: grid;
  gap: 0.15rem;
  padding: 2.5rem 1rem 0.9rem;
  background: linear-gradient(to top, rgb(0 0 0 / 0.82), transparent);
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.3s, transform 0.3s var(--ease-out);
}
.tile:hover .tile-info,
.tile:focus-visible .tile-info {
  opacity: 1;
  transform: none;
}
.tile-info em {
  font-size: 0.82rem;
  font-style: normal;
  color: var(--c-orange);
}
.skeleton {
  border: 0;
  background: linear-gradient(100deg, var(--card-bg) 30%, var(--card-hover) 50%, var(--card-bg) 70%);
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
}
.gallery-empty {
  padding: 4rem 1rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 1.1rem;
}
.gallery-empty svg {
  font-size: 2.6rem;
  margin-bottom: 0.8rem;
  opacity: 0.5;
}

/* ===================== LIGHTBOX ===================== */
.lb {
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay);
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(8 8 8 / 0.92);
  backdrop-filter: blur(14px);
  touch-action: pan-y;
}
.lb-figure {
  margin: 0;
  display: grid;
  gap: 1rem;
  justify-items: center;
  max-width: min(1100px, 100%);
}
.lb-img {
  max-width: 100%;
  max-height: 78vh;
  object-fit: contain;
  border-radius: var(--radius-md);
  box-shadow: 0 30px 90px rgb(0 0 0 / 0.7);
  animation: lbIn 0.45s var(--ease-out);
  user-select: none;
}
.lb-cap {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.4rem 1rem;
  text-align: center;
}
.lb-cap span {
  color: var(--c-orange);
}
.lb-cap small {
  color: var(--text-muted);
}
.lb-btn {
  position: absolute;
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 1px solid var(--border-color-strong);
  background: var(--surface-glass);
  color: var(--text-light);
  font-size: 1.05rem;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s, opacity 0.2s;
}
.lb-btn:hover:not(:disabled) {
  background: rgb(var(--accent-orange-rgb) / 0.3);
  transform: scale(1.08);
}
.lb-btn:disabled {
  opacity: 0.25;
  cursor: default;
}
.lb-close {
  top: 1.2rem;
  right: 1.2rem;
}
.lb-prev {
  left: 1.2rem;
  top: 50%;
  margin-top: -24px;
}
.lb-next {
  right: 1.2rem;
  top: 50%;
  margin-top: -24px;
}
.lb-enter-active,
.lb-leave-active {
  transition: opacity 0.3s;
}
.lb-enter-from,
.lb-leave-to {
  opacity: 0;
}

/* ===================== KEYFRAMES ===================== */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes cue {
  0%,
  100% {
    transform: translateY(0);
    opacity: 1;
  }
  60% {
    transform: translateY(14px);
    opacity: 0;
  }
}
@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}
@keyframes lbIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
}

/* ===================== RESPONSIVE ===================== */
@media (max-width: 960px) {
  .hero-inner {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }
  .hero-lead {
    margin-inline: auto;
  }
  .hero-stats,
  .hero-cta {
    justify-content: center;
  }
  .story-grid {
    grid-template-columns: 1fr;
  }
  .story-side {
    position: static;
  }
  .chapter {
    grid-template-columns: 1fr;
  }
  .chapter.flip .chapter-media {
    order: 0;
  }
  .media-frame {
    aspect-ratio: 1 / 1;
    max-height: 70vh;
  }
  .chapter-year,
  .chapter.flip .chapter-year {
    left: 0;
    right: auto;
  }
  .masonry {
    column-count: 2;
  }
}
@media (max-width: 560px) {
  .wrap {
    width: calc(100% - 2rem);
  }
  .masonry {
    column-gap: 0.7rem;
  }
  .tile {
    margin-bottom: 0.7rem;
  }
  .lb-prev,
  .lb-next {
    top: auto;
    bottom: 1.2rem;
    margin-top: 0;
  }
  .lb-prev {
    left: calc(50% - 60px);
  }
  .lb-next {
    right: calc(50% - 60px);
  }
  .lb-figure {
    margin-bottom: 3.5rem;
  }
  .year-pill {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }
}
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    transition-duration: 0.01ms !important;
  }
  .reveal {
    opacity: 1;
    transform: none;
  }
}
</style>
