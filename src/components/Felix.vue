<template>
  <div class="felix" :class="{ 'is-ready': ready }">
    <!-- Боковая навигация по главам -->
    <nav class="rail" aria-label="Разделы">
      <button
        v-for="item in navigationItems"
        :key="item.id"
        class="rail-item"
        :class="{ active: activeSection === item.id }"
        :title="item.label"
        @click="scrollTo(item.id)"
      >
        <span class="rail-label">{{ item.label }}</span>
        <span class="rail-dot"><font-awesome-icon :icon="ico(item.icon)" /></span>
      </button>
    </nav>

    <!-- ===================== HERO ===================== -->
    <header class="hero" ref="heroRef" @pointermove="onHeroMove">
      <img :src="heroImage" alt="" class="hero-bg" aria-hidden="true" />
      <div class="hero-shade"></div>
      <div class="hero-glow hero-glow-a" :style="glowStyle(1)"></div>
      <div class="hero-glow hero-glow-b" :style="glowStyle(-1.6)"></div>
      <div class="hero-word" aria-hidden="true">FELIX</div>

      <div class="hero-inner">
        <p class="eyebrow reveal">Felix &amp; Taffy · 2020 — навсегда</p>
        <h1 class="hero-title reveal" style="--d: 100ms">
          История нашей <span class="grad-text">любви</span>
        </h1>
        <p class="hero-lead reveal" style="--d: 200ms">
          От случайной катки в CS:GO до путешествий, общего дома и нашего сына Фелли.
        </p>

        <ul class="hero-stats reveal" style="--d: 300ms">
          <li><strong>{{ yearsTogether }}</strong><span>лет вместе</span></li>
          <li><strong>{{ journeys.length }}</strong><span>путешествий</span></li>
          <li><strong>{{ factsData.length }}</strong><span>фактов о нас</span></li>
        </ul>

        <div class="hero-cta reveal" style="--d: 400ms">
          <a href="#beginning" class="btn btn-primary" @click.prevent="scrollTo('beginning')">
            Читать историю
            <font-awesome-icon :icon="['fas', 'chevron-down']" />
          </a>
          <router-link to="/taffy" class="btn btn-ghost">
            <font-awesome-icon :icon="['fas', 'paw']" />
            История Taffy
          </router-link>
        </div>
      </div>

      <button class="scroll-cue" aria-label="Прокрутить вниз" @click="scrollTo('beginning')">
        <span class="scroll-cue-dot"></span>
      </button>
    </header>

    <main>
      <!-- ===================== 01 НАЧАЛО ===================== -->
      <section id="beginning" class="section">
        <div class="wrap">
          <header class="chapter-head">
            <span class="chapter-num reveal">01</span>
            <div>
              <p class="eyebrow reveal">Discord · CS:GO · 2020</p>
              <h2 class="section-title reveal">Как всё <span class="grad-text">начиналось</span></h2>
            </div>
          </header>

          <div class="moments">
            <div class="moment-tabs reveal" role="tablist">
              <button
                v-for="(m, i) in storyMoments"
                :key="i"
                class="moment-tab"
                role="tab"
                :aria-selected="currentMomentIndex === i"
                :class="{ active: currentMomentIndex === i }"
                @click="currentMomentIndex = i"
              >
                <span class="moment-tab-ico">
                  <font-awesome-icon :icon="ico(m.icon || 'fas fa-quote-left')" />
                </span>
                <span class="moment-tab-text">
                  <small>Шаг {{ i + 1 }}</small>
                  {{ m.title || 'Цитата' }}
                </span>
              </button>
            </div>

            <Transition name="swap" mode="out-in">
              <article
                :key="currentMomentIndex"
                class="moment-card reveal"
                :class="{ 'is-quote': currentMoment.isQuote }"
              >
                <font-awesome-icon
                  :icon="ico(currentMoment.icon || 'fas fa-quote-left')"
                  class="moment-bg-ico"
                />
                <h3 v-if="currentMoment.title" class="moment-title">{{ currentMoment.title }}</h3>
                <blockquote v-if="currentMoment.isQuote">{{ currentMoment.text }}</blockquote>
                <p v-else>{{ currentMoment.text }}</p>
              </article>
            </Transition>
          </div>
        </div>
      </section>

      <!-- ===================== 02 ПУТЕШЕСТВИЯ ===================== -->
      <section id="travels" class="section section-alt">
        <div class="wrap">
          <header class="chapter-head">
            <span class="chapter-num reveal">02</span>
            <div>
              <p class="eyebrow reveal">{{ journeys.length }} незабываемых мест</p>
              <h2 class="section-title reveal">Наши <span class="grad-text">путешествия</span></h2>
            </div>
          </header>

          <div class="trip reveal">
            <Transition name="swap" mode="out-in">
              <div :key="currentJourneyIndex" class="trip-card">
                <figure class="trip-media">
                  <img
                    :src="currentJourney.image"
                    :alt="currentJourney.title"
                    @click="openLightbox(journeySlides, currentJourneyIndex)"
                  />
                  <figcaption class="trip-count">
                    {{ String(currentJourneyIndex + 1).padStart(2, '0') }}
                    <span>/ {{ String(journeys.length).padStart(2, '0') }}</span>
                  </figcaption>
                </figure>

                <div class="trip-body">
                  <div class="trip-meta">
                    <span class="pill pill-accent">{{ currentJourney.year }}</span>
                    <span class="trip-date">
                      <font-awesome-icon :icon="['fas', 'calendar-alt']" /> {{ currentJourney.date }}
                    </span>
                  </div>
                  <h3 class="trip-title">{{ currentJourney.title }}</h3>
                  <p class="trip-desc">{{ currentJourney.description }}</p>
                  <blockquote v-if="currentJourney.highlight" class="note">
                    <font-awesome-icon :icon="['fas', 'quote-left']" class="note-ico" />
                    <p>{{ currentJourney.highlight }}</p>
                  </blockquote>
                </div>
              </div>
            </Transition>

            <div class="trip-controls">
              <button class="round-btn" aria-label="Предыдущее путешествие" @click="prevJourney">
                <font-awesome-icon :icon="['fas', 'chevron-left']" />
              </button>
              <div class="trip-dots">
                <button
                  v-for="(j, i) in journeys"
                  :key="i"
                  class="trip-dot"
                  :class="{ active: currentJourneyIndex === i }"
                  :aria-label="`${j.title}, ${j.date}`"
                  :title="j.title"
                  @click="currentJourneyIndex = i"
                ></button>
              </div>
              <button class="round-btn" aria-label="Следующее путешествие" @click="nextJourney">
                <font-awesome-icon :icon="['fas', 'chevron-right']" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ===================== 03 ФЕЛЛИ ===================== -->
      <section id="felli" class="section">
        <div class="wrap">
          <header class="chapter-head">
            <span class="chapter-num reveal">03</span>
            <div>
              <p class="eyebrow reveal">Лис-енотовидный · воплощение нашей любви</p>
              <h2 class="section-title reveal">Наш сын <span class="grad-text">Фелли</span></h2>
            </div>
          </header>

          <div class="name-formula reveal">
            <span class="formula-part taffy">Taffy</span>
            <span class="formula-op">+</span>
            <span class="formula-part felix">Felix</span>
            <span class="formula-op">=</span>
            <span class="formula-part result">Felly</span>
          </div>
          <p class="formula-text reveal">
            Имя Фелли родилось из слияния наших имён, символизируя единство и крепкую связь между нами.
            Каждый слог несёт частичку нашей любви.
          </p>

          <div class="felli-grid">
            <figure class="felli-portrait reveal">
              <div class="felli-frame">
                <Transition name="swap" mode="out-in">
                  <img
                    :key="currentFelly.src"
                    :src="currentFelly.src"
                    :alt="currentFelly.title"
                    @click="openLightbox(fellySlides, currentFellyIndex)"
                  />
                </Transition>
                <span class="media-zoom"><font-awesome-icon :icon="['fas', 'search-plus']" /></span>
              </div>
              <figcaption>
                <strong>{{ currentFelly.title }}</strong>
                <span>{{ currentFelly.caption }}</span>
                <small>Автор: {{ currentFelly.author }}</small>
              </figcaption>
            </figure>

            <div class="felli-side">
              <h3 class="side-title">Варианты персонажа</h3>
              <div class="variants">
                <button
                  v-for="(a, i) in fellyArtworks"
                  :key="i"
                  class="variant"
                  :class="{ active: currentFellyIndex === i }"
                  :aria-label="a.title"
                  @click="currentFellyIndex = i"
                >
                  <img :src="a.src" :alt="a.title" loading="lazy" />
                  <span>{{ a.title }}</span>
                </button>
              </div>

              <h3 class="side-title">Что досталось от нас</h3>
              <div class="heritage">
                <div
                  v-for="h in heritageData"
                  :key="h.id"
                  class="heritage-card"
                  :class="h.className"
                >
                  <div class="heritage-head">
                    <span class="heritage-emoji">{{ h.emoji }}</span>
                    <h4>{{ h.title }}</h4>
                  </div>
                  <ul>
                    <li v-for="ab in h.abilities" :key="ab.name">
                      <font-awesome-icon :icon="ico(ab.icon)" />
                      {{ ab.name }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <blockquote class="big-quote reveal">
            <p>«В его глазах живёт наша история, а в улыбке — надежда на будущие приключения вместе»</p>
            <cite>— Fox Taffy &amp; Felix</cite>
          </blockquote>
        </div>
      </section>

      <!-- ===================== 04 ГАЛЕРЕЯ ===================== -->
      <section id="gallery" class="section section-alt">
        <div class="wrap">
          <header class="chapter-head">
            <span class="chapter-num reveal">04</span>
            <div>
              <p class="eyebrow reveal">{{ isGalleryLoading ? 'Загружаем воспоминания…' : `${galleryPhotos.length} воспоминаний` }}</p>
              <h2 class="section-title reveal">Галерея <span class="grad-text">воспоминаний</span></h2>
            </div>
            <router-link to="/gallery" class="btn btn-ghost reveal chapter-action">
              <font-awesome-icon :icon="['fas', 'images']" />
              Полная галерея
            </router-link>
          </header>

          <div v-if="isGalleryLoading" class="masonry" aria-busy="true">
            <div
              v-for="n in 6"
              :key="n"
              class="tile skeleton"
              :style="{ aspectRatio: skelRatios[n % skelRatios.length] }"
            ></div>
          </div>

          <div v-else class="masonry">
            <button
              v-for="(p, i) in galleryPhotos"
              :key="i"
              class="tile reveal"
              :style="{ '--d': `${(i % 3) * 70}ms` }"
              @click="openLightbox(gallerySlides, i)"
            >
              <img :src="p.src" :alt="p.title" loading="lazy" />
              <span class="tile-info">
                <strong>{{ p.title }}</strong>
                <em v-if="p.caption && p.caption !== p.title">{{ p.caption }}</em>
              </span>
            </button>
          </div>

          <p v-if="galleryError && !isGalleryLoading" class="gallery-note">
            <font-awesome-icon :icon="['fas', 'info-circle']" />
            Показываем избранные кадры: в базе пока нет артов с Felix.
          </p>
        </div>
      </section>

      <!-- ===================== 05 ФАКТЫ ===================== -->
      <section id="facts" class="section">
        <div class="wrap">
          <header class="chapter-head">
            <span class="chapter-num reveal">05</span>
            <div>
              <p class="eyebrow reveal">Интересные моменты нашей истории</p>
              <h2 class="section-title reveal">{{ factsData.length }} фактов <span class="grad-text">о нас</span></h2>
            </div>
          </header>

          <div class="facts">
            <div
              v-for="(f, i) in factsData"
              :key="i"
              class="fact reveal"
              :class="{ open: selectedFactIndex === i }"
              :style="{ '--d': `${(i % 2) * 70}ms` }"
            >
              <button
                class="fact-head"
                :aria-expanded="selectedFactIndex === i"
                @click="toggleFact(i)"
              >
                <span class="fact-num">{{ String(i + 1).padStart(2, '0') }}</span>
                <span class="fact-ico"><font-awesome-icon :icon="ico(f.icon)" /></span>
                <span class="fact-title">{{ f.title }}</span>
                <font-awesome-icon :icon="['fas', 'chevron-down']" class="fact-arrow" />
              </button>
              <div class="fact-body">
                <p>{{ f.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ===================== 06 ПИСЬМО ===================== -->
      <section id="letter" class="section section-alt">
        <div class="wrap letter-wrap">
          <header class="chapter-head center">
            <span class="chapter-num reveal">06</span>
            <div>
              <p class="eyebrow reveal">Письмо от сердца к сердцу</p>
              <h2 class="section-title reveal">Моя <span class="grad-text">половинка</span></h2>
            </div>
          </header>

          <article class="letter reveal">
            <div class="letter-hearts" aria-hidden="true">
              <span v-for="(h, i) in ['💙', '💜', '🧡']" :key="i" :style="{ animationDelay: `${i * 0.35}s` }">{{ h }}</span>
            </div>
            <h3 class="letter-to">Для Felix</h3>
            <p v-for="(p, i) in letterParagraphs" :key="i" class="letter-p">{{ p }}</p>
            <div class="letter-sign">
              <span>С любовью,</span>
              <strong>Fox Taffy</strong>
            </div>
          </article>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="wrap footer-in">
        <span>© 2025 Fox Taffy · <a href="https://foxtaffy.gay" target="_blank" rel="noopener noreferrer">FoxTaffy.gay</a> · v.3.0</span>
        <span class="footer-sub">Сделано с любовью для лучшего человека в моей жизни 💕</span>
      </div>
    </footer>

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
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useHead } from '@vueuse/head'
import { storageUrl } from '@/utils/storage'
import FelixImage from '@/assets/Felix/Felix.jpg'
import { furryApi } from '../config/supabase.js'
import { navItems as navigationItems, journeys, felly, facts as factsData, letter as letterParagraphs, moments, momentQuote, HERO_IMAGE, MET_YEAR, fallbackArts } from '@/data/felix'

const heroImage = HERO_IMAGE

useHead({
  title: 'Felix & Fox Taffy — История нашей любви',
  meta: [
    {
      name: 'description',
      content:
        'История любви Felix и Fox Taffy с 2020 года до бесконечности: первые встречи, путешествия, Фелли, воспоминания и письмо от сердца.'
    },
    { name: 'keywords', content: 'Felix, Fox Taffy, любовь, история, фурри, отношения, Фелли, путешествия, галерея, факты' },
    { property: 'og:title', content: 'Felix & Fox Taffy — История нашей любви' },
    { property: 'og:description', content: 'Путь двух сердец: от Discord и CS:GO до путешествий, сына Фелли и жизни вместе.' },
    { property: 'og:image', content: FelixImage },
    { property: 'og:type', content: 'article' },
    { property: 'og:site_name', content: 'FoxTaffy.gay' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Felix & Fox Taffy — История нашей любви' },
    { name: 'twitter:description', content: 'Наша история: встречи, путешествия, Фелли, факты и письмо от сердца ❤️' },
    { name: 'twitter:image', content: FelixImage }
  ],
  link: [{ rel: 'canonical', href: 'https://foxtaffy.gay/felix' }]
})

// "fas fa-heart" -> ['fas', 'heart'] для <font-awesome-icon>
const ico = cls => {
  const parts = cls.split(' ')
  return [parts[0], parts.find(p => p.startsWith('fa-') && p !== 'fa-fw').slice(3)]
}

// ============================================
// ДАННЫЕ (вынесены в src/data/felix.js)
// ============================================
const storyMoments = [...moments, { text: momentQuote, isQuote: true }]
const fellyArtworks = felly.artworks
const heritageData = felly.heritage.map((h, i) => ({
  ...h,
  id: `heritage-${i}`,
  className: ['from-felix', 'from-taffy', 'from-both'][i]
}))

const yearsTogether = computed(() => new Date().getFullYear() - MET_YEAR)

// ============================================
// СОСТОЯНИЕ СЕКЦИЙ
// ============================================
const currentMomentIndex = ref(0)
const currentJourneyIndex = ref(0)
const currentFellyIndex = ref(0)
const selectedFactIndex = ref(0)

const currentMoment = computed(() => storyMoments[currentMomentIndex.value])
const currentJourney = computed(() => ({ ...journeys[currentJourneyIndex.value], description: journeys[currentJourneyIndex.value].text, highlight: journeys[currentJourneyIndex.value].note }))
const currentFelly = computed(() => fellyArtworks[currentFellyIndex.value])

const prevJourney = () =>
  (currentJourneyIndex.value = (currentJourneyIndex.value - 1 + journeys.length) % journeys.length)
const nextJourney = () => (currentJourneyIndex.value = (currentJourneyIndex.value + 1) % journeys.length)
const toggleFact = i => (selectedFactIndex.value = selectedFactIndex.value === i ? null : i)

// ============================================
// ГАЛЕРЕЯ
// ============================================
const galleryPhotos = ref([])
const isGalleryLoading = ref(true)
const galleryError = ref(null)
const skelRatios = ['3/4', '1/1', '4/5', '4/3', '1/1', '3/4']

async function loadFelixGallery() {
  try {
    const all = await furryApi.getFurryArts({ limit: 500, showNsfw: false, sort: 'newest' })
    const arts = all.filter(
      a =>
        (a.characters || []).some(c => c.name?.toLowerCase().includes('felix')) ||
        (a.tags || []).some(t => t.toLowerCase() === 'felix')
    )
    if (arts.length) {
      return arts.map(a => ({
        src: a.thumbnail_url || a.image_url,
        full: a.image_url,
        title: a.title || 'Арт без названия',
        caption: a.title || ''
      }))
    }
    galleryError.value = 'empty'
  } catch (e) {
    console.error('Не удалось загрузить галерею Felix:', e)
    galleryError.value = 'error'
  }
  return fallbackArts.map(a => ({ src: a.src, full: a.full, title: a.title, caption: '' }))
}

// ============================================
// ЛАЙТБОКС
// ============================================
const lb = ref(null)
const current = computed(() => lb.value.list[lb.value.index])

const journeySlides = computed(() => journeys.map(j => ({ src: j.image, title: j.title, sub: j.date })))
const fellySlides = computed(() => fellyArtworks.map(a => ({ src: a.src, title: a.title, sub: `Автор: ${a.author}` })))
const gallerySlides = computed(() =>
  galleryPhotos.value.map(p => ({ src: p.full || p.src, title: p.title, sub: p.caption !== p.title ? p.caption : '' }))
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
const mouse = ref({ x: 0, y: 0 })
const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function onHeroMove(e) {
  if (reduceMotion || !heroRef.value) return
  const r = heroRef.value.getBoundingClientRect()
  mouse.value = { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 }
}
const glowStyle = k => ({ transform: `translate(${mouse.value.x * 80 * k}px, ${mouse.value.y * 80 * k}px)` })

// ============================================
// СКРОЛЛ: reveal и активная глава
// ============================================
const ready = ref(false)
const activeSection = ref('beginning')
let revealObs
let sectionObs

function observeReveals() {
  if (!revealObs) return
  document.querySelectorAll('.felix .reveal:not(.in)').forEach(el => revealObs.observe(el))
}

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
}

onMounted(async () => {
  revealObs = new IntersectionObserver(
    entries =>
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('in')
          revealObs.unobserve(en.target)
        }
      }),
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  )
  sectionObs = new IntersectionObserver(
    entries =>
      entries.forEach(en => {
        if (en.isIntersecting) activeSection.value = en.target.id
      }),
    { rootMargin: '-45% 0px -50% 0px' }
  )
  observeReveals()
  navigationItems.forEach(n => {
    const el = document.getElementById(n.id)
    if (el) sectionObs.observe(el)
  })
  requestAnimationFrame(() => (ready.value = true))
  window.addEventListener('keydown', onKey)

  galleryPhotos.value = await loadFelixGallery()
  isGalleryLoading.value = false
  await nextTick()
  observeReveals()
})

onBeforeUnmount(() => {
  revealObs?.disconnect()
  sectionObs?.disconnect()
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.felix {
  --c-orange: var(--accent-orange);
  --c-mint: #3ddc97;
  --c-blue: #6aa8ff;
  --c-violet: #b08cff;
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
  background: linear-gradient(95deg, var(--c-orange), #ff8fb1 40%, var(--c-violet) 75%, var(--c-blue));
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
  margin: 0;
  background: none;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  overflow: visible;
}
.section::before {
  display: none;
}
.section:hover {
  background: none;
}
.section-alt {
  background: linear-gradient(180deg, var(--bg-darker), #151515 50%, var(--bg-darker));
}
.section-alt:hover {
  background: linear-gradient(180deg, var(--bg-darker), #151515 50%, var(--bg-darker));
}
.section-title {
  display: block;
  margin: 0;
  padding: 0;
  font-size: clamp(1.9rem, 4.2vw, 3.2rem);
  line-height: 1.1;
  letter-spacing: -0.02em;
  background: none;
  -webkit-text-fill-color: currentColor;
}
.section-title::after {
  display: none;
}

.chapter-head {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 1.4rem;
  margin-bottom: clamp(2rem, 5vw, 3.5rem);
}
.chapter-head.center {
  justify-content: center;
  text-align: left;
}
.chapter-num {
  font-size: clamp(4rem, 10vw, 7.5rem);
  font-weight: 900;
  line-height: 0.85;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1.5px rgb(var(--white-rgb) / 0.16);
  user-select: none;
}
.chapter-action {
  margin-left: auto;
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

/* ---------- buttons / pills ---------- */
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
.pill {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: var(--radius-pill);
  font-size: 0.8rem;
  font-weight: 700;
}
.pill-accent {
  color: #101010;
  background: linear-gradient(95deg, var(--c-orange), #ffb457);
}
.round-btn {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 1px solid var(--border-color-strong);
  background: var(--surface-glass);
  color: var(--text-light);
  cursor: pointer;
  transition: background 0.2s, transform 0.2s, border-color 0.2s;
}
.round-btn:hover {
  background: rgb(var(--accent-orange-rgb) / 0.25);
  border-color: rgb(var(--accent-orange-rgb) / 0.6);
  transform: scale(1.08);
}

/* ---------- боковая навигация ---------- */
.rail {
  position: fixed;
  right: 1.1rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 40;
  display: grid;
  gap: 0.35rem;
}
.rail-item {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.6rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}
.rail-label {
  padding: 0.3rem 0.7rem;
  border-radius: var(--radius-pill);
  font-size: 0.78rem;
  font-weight: 600;
  background: rgb(18 18 18 / 0.85);
  border: 1px solid var(--border-color-strong);
  backdrop-filter: blur(8px);
  opacity: 0;
  transform: translateX(8px);
  transition: opacity 0.25s, transform 0.25s var(--ease-out);
  pointer-events: none;
  white-space: nowrap;
}
.rail-item:hover .rail-label,
.rail-item.active .rail-label {
  opacity: 1;
  transform: none;
}
.rail-dot {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  font-size: 0.85rem;
  background: rgb(18 18 18 / 0.7);
  border: 1px solid var(--border-color-strong);
  backdrop-filter: blur(8px);
  transition: all 0.25s var(--ease-out);
}
.rail-item.active .rail-dot {
  color: #101010;
  background: linear-gradient(135deg, var(--c-orange), #ff8fb1);
  border-color: transparent;
  box-shadow: 0 0 22px rgb(var(--accent-orange-rgb) / 0.5);
  transform: scale(1.12);
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
  background: var(--bg-darker);
}
.hero-bg {
  position: absolute;
  inset: 0;
  z-index: -3;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
  filter: saturate(1.1);
  transform: scale(1.06);
}
.hero-shade {
  position: absolute;
  inset: 0;
  z-index: -2;
  background:
    radial-gradient(900px 500px at 20% 100%, rgb(176 140 255 / 0.28), transparent 60%),
    linear-gradient(180deg, rgb(18 18 18 / 0.55) 0%, rgb(18 18 18 / 0.78) 55%, var(--bg-darker) 100%);
}
.hero-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.5;
  z-index: -1;
  transition: transform 0.6s var(--ease-out);
  will-change: transform;
}
.hero-glow-a {
  width: 500px;
  height: 500px;
  top: 6%;
  right: 8%;
  background: rgb(var(--accent-orange-rgb) / 0.4);
}
.hero-glow-b {
  width: 480px;
  height: 480px;
  bottom: 0;
  left: 4%;
  background: rgb(106 168 255 / 0.32);
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
  -webkit-text-stroke: 1.5px rgb(var(--white-rgb) / 0.09);
  user-select: none;
  white-space: nowrap;
}
.hero-inner {
  width: min(900px, 100% - 3rem);
  text-align: center;
  display: grid;
  justify-items: center;
}
.hero-title {
  margin: 0;
  font-size: clamp(2.8rem, 8vw, 6.2rem);
  line-height: 1;
  letter-spacing: -0.035em;
  text-wrap: balance;
}
.hero-lead {
  margin: 1.4rem 0 0;
  max-width: 36rem;
  font-size: clamp(1.02rem, 1.6vw, 1.2rem);
  line-height: 1.6;
  color: rgb(var(--white-rgb) / 0.78);
}
.hero-stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  list-style: none;
  padding: 0;
  margin: 2rem 0 0;
}
.hero-stats li {
  min-width: 128px;
  padding: 0.9rem 1.2rem;
  border-radius: var(--radius-md);
  background: rgb(18 18 18 / 0.45);
  border: 1px solid var(--border-color-strong);
  backdrop-filter: blur(12px);
}
.hero-stats strong {
  display: block;
  font-size: 1.9rem;
  line-height: 1;
  background: linear-gradient(95deg, var(--c-orange), var(--c-violet));
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
  justify-content: center;
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

/* ===================== 01 MOMENTS ===================== */
.moments {
  display: grid;
  grid-template-columns: minmax(260px, 0.8fr) 1.4fr;
  gap: clamp(1.2rem, 3vw, 2.5rem);
  align-items: stretch;
}
.moment-tabs {
  display: grid;
  gap: 0.7rem;
  align-content: start;
}
.moment-tab {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.2rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--surface-glass);
  color: var(--text-muted);
  font: inherit;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s var(--ease-out);
}
.moment-tab:hover {
  color: var(--text-light);
  border-color: var(--border-color-strong);
  transform: translateX(4px);
}
.moment-tab.active {
  color: var(--text-light);
  border-color: rgb(var(--accent-orange-rgb) / 0.6);
  background: linear-gradient(90deg, rgb(var(--accent-orange-rgb) / 0.16), rgb(176 140 255 / 0.08));
  box-shadow: 0 10px 30px rgb(0 0 0 / 0.3);
}
.moment-tab-ico {
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgb(var(--white-rgb) / 0.07);
  font-size: 1.05rem;
}
.moment-tab.active .moment-tab-ico {
  color: #101010;
  background: linear-gradient(135deg, var(--c-orange), #ff8fb1);
}
.moment-tab-text small {
  display: block;
  margin-bottom: 0.15rem;
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 600;
}
.moment-card {
  position: relative;
  overflow: hidden;
  padding: clamp(1.6rem, 4vw, 3rem);
  border-radius: var(--radius-lg);
  background: linear-gradient(160deg, rgb(var(--white-rgb) / 0.07), rgb(var(--white-rgb) / 0.02));
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 280px;
}
.moment-card:hover {
  transform: none;
  background: linear-gradient(160deg, rgb(var(--white-rgb) / 0.07), rgb(var(--white-rgb) / 0.02));
}
.moment-bg-ico {
  position: absolute;
  right: -1.5rem;
  bottom: -2rem;
  font-size: 12rem;
  color: rgb(var(--white-rgb) / 0.04);
  pointer-events: none;
}
.moment-title {
  margin: 0 0 1rem;
  font-size: clamp(1.5rem, 3vw, 2.1rem);
  letter-spacing: -0.01em;
}
.moment-card p,
.moment-card blockquote {
  position: relative;
  margin: 0;
  font-size: 1.12rem;
  line-height: 1.8;
  color: rgb(var(--white-rgb) / 0.85);
}
.moment-card.is-quote blockquote {
  font-size: clamp(1.3rem, 2.6vw, 1.9rem);
  line-height: 1.5;
  font-style: italic;
  font-weight: 500;
  padding-left: 1.4rem;
  border-left: 3px solid var(--c-orange);
}

/* ===================== 02 TRAVELS ===================== */
.trip-card {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  gap: clamp(1.4rem, 4vw, 3.5rem);
  align-items: center;
}
.trip-media {
  position: relative;
  margin: 0;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-color-strong);
  background: linear-gradient(135deg, rgb(var(--accent-orange-rgb) / 0.2), rgb(106 168 255 / 0.2)), var(--card-bg);
  box-shadow: 0 30px 70px rgb(0 0 0 / 0.5);
}
.trip-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: zoom-in;
  transition: transform 0.9s var(--ease-out);
}
.trip-media:hover img {
  transform: scale(1.04);
}
.trip-count {
  position: absolute;
  left: 1rem;
  bottom: 1rem;
  padding: 0.35rem 0.9rem;
  border-radius: var(--radius-pill);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-weight: 700;
  background: rgb(18 18 18 / 0.75);
  border: 1px solid var(--border-color-strong);
  backdrop-filter: blur(8px);
}
.trip-count span {
  color: var(--text-muted);
  font-weight: 500;
}
.trip-meta {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.9rem;
}
.trip-date {
  color: var(--text-muted);
  font-size: 0.9rem;
}
.trip-date svg {
  margin-right: 0.3rem;
  color: var(--c-orange);
}
.trip-title {
  margin: 0 0 1rem;
  font-size: clamp(1.6rem, 3.2vw, 2.4rem);
  line-height: 1.15;
  letter-spacing: -0.02em;
}
.trip-desc {
  margin: 0 0 1.4rem;
  line-height: 1.75;
  color: rgb(var(--white-rgb) / 0.8);
}
.note {
  position: relative;
  margin: 0;
  padding: 1.1rem 1.3rem 1.1rem 3.2rem;
  border-radius: var(--radius-md);
  border-left: 3px solid var(--c-orange);
  background: linear-gradient(90deg, rgb(var(--accent-orange-rgb) / 0.1), transparent);
}
.note p {
  margin: 0;
  line-height: 1.65;
  font-style: italic;
  color: rgb(var(--white-rgb) / 0.82);
}
.note-ico {
  position: absolute;
  left: 1.1rem;
  top: 1.2rem;
  color: var(--c-orange);
  opacity: 0.75;
}
.trip-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  margin-top: clamp(1.6rem, 4vw, 2.6rem);
}
.trip-dots {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.trip-dot {
  width: 10px;
  height: 10px;
  padding: 0;
  border: 0;
  border-radius: var(--radius-pill);
  background: rgb(var(--white-rgb) / 0.22);
  cursor: pointer;
  transition: all 0.35s var(--ease-out);
}
.trip-dot:hover {
  background: rgb(var(--white-rgb) / 0.5);
}
.trip-dot.active {
  width: 34px;
  background: linear-gradient(90deg, var(--c-orange), var(--c-violet));
}

/* ===================== 03 FELLI ===================== */
.name-formula {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: clamp(0.6rem, 2vw, 1.4rem);
  font-size: clamp(1.5rem, 4.4vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.02em;
}
.formula-part {
  padding: 0.35em 0.85em;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border-color-strong);
  background: var(--surface-glass);
}
.formula-part.taffy {
  color: var(--c-orange);
  border-color: rgb(var(--accent-orange-rgb) / 0.5);
}
.formula-part.felix {
  color: var(--c-blue);
  border-color: rgb(106 168 255 / 0.5);
}
.formula-part.result {
  color: #101010;
  border: 0;
  background: linear-gradient(95deg, var(--c-orange), #ff8fb1, var(--c-violet));
  box-shadow: 0 12px 40px rgb(176 140 255 / 0.35);
}
.formula-op {
  color: var(--text-muted);
}
.formula-text {
  max-width: 38rem;
  margin: 1.4rem auto 0;
  text-align: center;
  line-height: 1.7;
  color: var(--text-muted);
}
.felli-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  gap: clamp(1.6rem, 4vw, 3.5rem);
  margin-top: clamp(2.2rem, 5vw, 4rem);
  align-items: start;
}
.felli-portrait {
  margin: 0;
  position: sticky;
  top: 6rem;
}
.felli-frame {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-color-strong);
  background: var(--card-bg);
  box-shadow: 0 30px 70px rgb(0 0 0 / 0.5), 0 0 60px rgb(176 140 255 / 0.15);
  cursor: zoom-in;
}
.felli-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.9s var(--ease-out);
}
.felli-frame:hover img {
  transform: scale(1.04);
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
  transition: opacity 0.3s;
}
.felli-frame:hover .media-zoom {
  opacity: 1;
}
.felli-portrait figcaption {
  display: grid;
  gap: 0.25rem;
  margin-top: 1.1rem;
}
.felli-portrait figcaption strong {
  font-size: 1.2rem;
}
.felli-portrait figcaption span {
  color: rgb(var(--white-rgb) / 0.75);
  line-height: 1.5;
}
.felli-portrait figcaption small {
  color: var(--c-orange);
}
.side-title {
  margin: 0 0 1rem;
  font-size: 0.8rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.variants {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.7rem;
  margin-bottom: 2.2rem;
}
.variant {
  display: grid;
  gap: 0.45rem;
  padding: 0.4rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--surface-glass);
  color: var(--text-muted);
  font: inherit;
  font-size: 0.72rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s var(--ease-out);
}
.variant img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: calc(var(--radius-md) - 0.3rem);
}
.variant:hover {
  transform: translateY(-3px);
  border-color: var(--border-color-strong);
}
.variant.active {
  color: var(--text-light);
  border-color: var(--c-orange);
  box-shadow: 0 0 0 2px rgb(var(--accent-orange-rgb) / 0.25), 0 10px 26px rgb(0 0 0 / 0.35);
}
.heritage {
  display: grid;
  gap: 0.9rem;
}
.heritage-card {
  padding: 1.2rem 1.4rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--surface-glass);
  border-left-width: 3px;
}
.from-felix {
  border-left-color: var(--c-blue);
}
.from-taffy {
  border-left-color: var(--c-orange);
}
.from-both {
  border-left-color: var(--c-violet);
}
.heritage-head {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.8rem;
}
.heritage-head h4 {
  margin: 0;
  font-size: 1.05rem;
}
.heritage-emoji {
  font-size: 1.4rem;
}
.heritage ul {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}
.heritage li {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.8rem;
  border-radius: var(--radius-pill);
  background: rgb(var(--white-rgb) / 0.06);
  font-size: 0.86rem;
}
.from-felix li svg {
  color: var(--c-blue);
}
.from-taffy li svg {
  color: var(--c-orange);
}
.from-both li svg {
  color: var(--c-violet);
}
.big-quote {
  position: relative;
  max-width: 46rem;
  margin: clamp(3rem, 7vw, 5.5rem) auto 0;
  padding: 0 1rem;
  text-align: center;
}
.big-quote::before {
  content: '“';
  display: block;
  font-size: 6rem;
  line-height: 0.6;
  font-family: Georgia, serif;
  background: linear-gradient(95deg, var(--c-orange), var(--c-violet));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.big-quote p {
  margin: 0 0 1rem;
  font-size: clamp(1.25rem, 2.6vw, 1.8rem);
  line-height: 1.5;
  font-style: italic;
}
.big-quote cite {
  color: var(--text-muted);
}

/* ===================== 04 GALLERY ===================== */
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
  background: linear-gradient(to top, rgb(0 0 0 / 0.84), transparent);
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
  min-height: 0;
  border: 0;
  background: linear-gradient(100deg, var(--card-bg) 30%, var(--card-hover) 50%, var(--card-bg) 70%);
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
}
.gallery-note {
  margin: 1rem 0 0;
  text-align: center;
  font-size: 0.88rem;
  color: var(--text-muted);
}

/* ===================== 05 FACTS ===================== */
.facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem 1.2rem;
  align-items: start;
}
.fact {
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--surface-glass);
  overflow: hidden;
  transition: border-color 0.3s, background 0.3s, box-shadow 0.3s;
}
.fact.open {
  border-color: rgb(var(--accent-orange-rgb) / 0.5);
  background: linear-gradient(160deg, rgb(var(--accent-orange-rgb) / 0.1), rgb(176 140 255 / 0.05));
  box-shadow: var(--shadow-card);
}
.fact-head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 1rem 1.2rem;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.fact-num {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.8rem;
  color: var(--text-muted);
}
.fact-ico {
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgb(var(--white-rgb) / 0.07);
  color: var(--c-orange);
  transition: all 0.3s;
}
.fact.open .fact-ico {
  color: #101010;
  background: linear-gradient(135deg, var(--c-orange), #ff8fb1);
}
.fact-title {
  flex: 1;
  font-weight: 600;
}
.fact-arrow {
  color: var(--text-muted);
  transition: transform 0.35s var(--ease-out);
}
.fact.open .fact-arrow {
  transform: rotate(180deg);
  color: var(--c-orange);
}
.fact-body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.4s var(--ease-out);
}
.fact.open .fact-body {
  grid-template-rows: 1fr;
}
.fact-body p {
  overflow: hidden;
  min-height: 0;
  margin: 0;
  padding: 0 1.2rem;
  line-height: 1.7;
  color: rgb(var(--white-rgb) / 0.8);
}
.fact.open .fact-body p {
  padding-bottom: 1.2rem;
}

/* ===================== 06 LETTER ===================== */
.letter-wrap {
  max-width: 820px;
}
.letter {
  position: relative;
  padding: clamp(2rem, 5vw, 3.6rem);
  border-radius: var(--radius-lg);
  background:
    radial-gradient(500px 240px at 100% 0%, rgb(176 140 255 / 0.16), transparent 70%),
    radial-gradient(500px 240px at 0% 100%, rgb(var(--accent-orange-rgb) / 0.14), transparent 70%),
    linear-gradient(160deg, rgb(var(--white-rgb) / 0.07), rgb(var(--white-rgb) / 0.02));
  border: 1px solid var(--border-color-strong);
  box-shadow: 0 30px 80px rgb(0 0 0 / 0.45);
}
.letter-hearts {
  display: flex;
  gap: 0.6rem;
  font-size: 1.6rem;
}
.letter-hearts span {
  animation: beat 1.8s ease-in-out infinite;
}
.letter-to {
  margin: 1rem 0 1.4rem;
  font-size: clamp(1.7rem, 3.4vw, 2.4rem);
  letter-spacing: -0.02em;
}
.letter-p {
  margin: 0 0 1.2rem;
  font-size: 1.12rem;
  line-height: 1.85;
  color: rgb(var(--white-rgb) / 0.86);
}
.letter-sign {
  display: grid;
  gap: 0.2rem;
  margin-top: 2rem;
  padding-top: 1.4rem;
  border-top: 1px solid var(--border-color);
  text-align: right;
}
.letter-sign span {
  color: var(--text-muted);
}
.letter-sign strong {
  font-size: 1.5rem;
  font-style: italic;
  background: linear-gradient(95deg, var(--c-orange), var(--c-violet));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* ===================== FOOTER ===================== */
.felix .footer {
  margin: 0;
  padding: 2rem 0 2.6rem;
  border-top: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 0.88rem;
  text-align: left;
}
.footer-in {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.6rem 2rem;
}
.felix .footer a {
  color: var(--c-orange);
  text-decoration: none;
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

/* ---------- переключение контента ---------- */
.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.3s ease, transform 0.35s var(--ease-out);
}
.swap-enter-from {
  opacity: 0;
  transform: translateY(14px);
}
.swap-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ===================== KEYFRAMES ===================== */
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
@keyframes beat {
  0%,
  100% {
    transform: scale(1);
  }
  15% {
    transform: scale(1.25);
  }
  30% {
    transform: scale(1);
  }
  45% {
    transform: scale(1.15);
  }
}

/* ===================== RESPONSIVE ===================== */
@media (max-width: 1100px) {
  .rail {
    display: none;
  }
}
@media (max-width: 960px) {
  .moments,
  .trip-card,
  .felli-grid {
    grid-template-columns: 1fr;
  }
  .moment-tabs {
    grid-auto-flow: column;
    grid-auto-columns: minmax(220px, 1fr);
    overflow-x: auto;
    scrollbar-width: none;
    padding-bottom: 0.3rem;
  }
  .felli-portrait {
    position: static;
  }
  .masonry {
    column-count: 2;
  }
  .facts {
    grid-template-columns: 1fr;
  }
  .chapter-action {
    display: none;
  }
}
@media (max-width: 560px) {
  .wrap {
    width: calc(100% - 2rem);
  }
  .chapter-head {
    gap: 0.9rem;
  }
  .variants {
    grid-template-columns: repeat(2, 1fr);
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
  .trip-dot.active {
    width: 22px;
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
