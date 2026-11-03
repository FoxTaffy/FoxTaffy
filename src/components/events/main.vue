<template>
  <main class="container">
    <section class="section">
      <router-link to="/" class="btn icon-btn-corner" aria-label="На главную"><i class="fas fa-home"></i></router-link>

      <h1 class="section-title">Все мероприятия</h1>
      <p class="section-description">
        Конвенты, встречи и фестивали, которые я посетил и планирую посетить: отчёты, фотографии и впечатления.
      </p>

      <div v-if="stats.total" class="stat-grid">
        <div class="stat-tile"><span class="stat-tile-label">Всего</span><span class="stat-tile-value">{{ stats.total }}</span></div>
        <div class="stat-tile"><span class="stat-tile-label">Посещено</span><span class="stat-tile-value">{{ stats.completed }}</span></div>
        <div class="stat-tile"><span class="stat-tile-label">Планируется</span><span class="stat-tile-value">{{ stats.upcoming }}</span></div>
        <div v-if="stats.avgRating" class="stat-tile">
          <span class="stat-tile-label">Средняя оценка</span>
          <span class="stat-tile-value"><i class="fas fa-star text-success"></i> {{ stats.avgRating.toFixed(1) }}</span>
        </div>
      </div>

      <div v-if="years.length > 1" class="year-list" role="group" aria-label="Фильтр по годам">
        <button
          v-for="item in years"
          :key="item.year"
          type="button"
          class="year-row"
          :class="{ active: state.year === item.year }"
          :aria-pressed="state.year === item.year"
          @click="state.year = state.year === item.year ? null : item.year"
        >
          <b>{{ item.year }}</b>
          <progress class="meter" :value="item.share" max="1"></progress>
          <span>{{ item.count }}</span>
        </button>
      </div>
    </section>

    <section class="section">
      <div class="toolbar">
        <label class="field">
          <i class="fas fa-search"></i>
          <input v-model="searchInput" type="search" maxlength="80" placeholder="Название, город, площадка…" aria-label="Поиск мероприятий">
          <button v-if="searchInput" type="button" class="icon-btn" aria-label="Очистить поиск" @click="searchInput = ''">
            <i class="fas fa-times"></i>
          </button>
        </label>
        <label class="field field-sort">
          <i class="fas fa-sort"></i>
          <select v-model="state.sort" aria-label="Сортировка">
            <option v-for="(sort, key) in SORTS" :key="key" :value="key">{{ sort.label }}</option>
          </select>
        </label>
      </div>

      <div class="tab-row" role="tablist">
        <button
          v-for="tab in filterTabs"
          :key="tab.key"
          type="button"
          class="tab"
          :class="{ active: state.filter === tab.key }"
          role="tab"
          :aria-selected="state.filter === tab.key"
          @click="state.filter = tab.key"
        >
          <i :class="tab.icon"></i>{{ tab.label }} <small>{{ tab.count }}</small>
        </button>
      </div>

      <div v-if="loading" class="grid-cards" aria-busy="true">
        <div v-for="n in 6" :key="n" class="card skeleton"></div>
      </div>

      <div v-else-if="error" class="state-box" role="alert">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Что-то пошло не так</h3>
        <p>{{ error }}</p>
        <button type="button" class="btn btn-primary" @click="load"><i class="fas fa-redo"></i> Повторить</button>
      </div>

      <div v-else-if="!pageItems.length" class="state-box">
        <i class="fas fa-calendar-times"></i>
        <h3>Ничего не найдено</h3>
        <p>{{ hasActiveFilters ? 'Попробуйте изменить или сбросить фильтры.' : 'Список мероприятий пока пуст.' }}</p>
        <button v-if="hasActiveFilters" type="button" class="btn btn-accent" @click="reset"><i class="fas fa-eraser"></i> Сбросить фильтры</button>
      </div>

      <template v-else>
        <p class="section-description" aria-live="polite">Найдено: {{ filtered.length }}</p>
        <div class="grid-cards">
          <EventCard
            v-for="event in pageItems"
            :key="event.id"
            :event="event"
            :is-admin="isAdmin"
            @open="openEvent"
            @photos="openPhotos"
            @calendar="addToCalendar"
          />
        </div>

        <nav v-if="totalPages > 1" class="pager" aria-label="Страницы">
          <button type="button" class="icon-btn" :disabled="currentPage === 1" aria-label="Назад" @click="goToPage(currentPage - 1)">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            type="button"
            class="tab"
            :class="{ active: page === currentPage }"
            :aria-current="page === currentPage ? 'page' : undefined"
            @click="goToPage(page)"
          >{{ page }}</button>
          <button type="button" class="icon-btn" :disabled="currentPage === totalPages" aria-label="Вперёд" @click="goToPage(currentPage + 1)">
            <i class="fas fa-chevron-right"></i>
          </button>
        </nav>
      </template>
    </section>

    <Transition name="lightbox">
      <div v-if="lightbox.visible" class="lightbox-overlay" role="dialog" aria-modal="true" :aria-label="galleryTitle" @click.self="closeLightbox">
        <img class="lightbox-image" :src="lightbox.imageUrl" :alt="lightbox.art?.caption || galleryTitle">
        <button type="button" class="lightbox-close" aria-label="Закрыть" @click="closeLightbox"><i class="fas fa-times"></i></button>
        <button v-if="canGoPrevious" type="button" class="icon-btn lightbox-nav prev" aria-label="Предыдущее фото" @click.stop="previousArt"><i class="fas fa-chevron-left"></i></button>
        <button v-if="canGoNext" type="button" class="icon-btn lightbox-nav next" aria-label="Следующее фото" @click.stop="nextArt"><i class="fas fa-chevron-right"></i></button>
        <p class="lightbox-caption">{{ galleryTitle }} · {{ lightbox.currentIndex + 1 }} / {{ galleryPhotos.length }}</p>
      </div>
    </Transition>
  </main>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import EventCard from '@/components/events/EventCard.vue'
import { SORTS, useEventsCatalog } from '@/composables/useEventsCatalog.js'
import { useLightbox } from '@/composables/useLightbox.js'
import { furryApi } from '@/config/supabase.js'
import { getAdminSession } from '@/utils/adminAuth.js'
import { buildIcs, isReviewMissing } from '@/utils/eventUtils.js'
import { updateMetaTags } from '@/utils/meta.js'

const router = useRouter()
const {
  state, searchInput, loading, error, filtered, pageItems, totalPages, currentPage,
  stats, filterTabs, years, hasActiveFilters, load, reset
} = useEventsCatalog()

const isAdmin = ref(false)
const galleryPhotos = ref([])
const galleryTitle = ref('')
const { lightbox, canGoPrevious, canGoNext, openLightbox, closeLightbox, previousArt, nextArt, handleKeyDown } = useLightbox(galleryPhotos)

function openEvent(event) {
  if (isReviewMissing(event) && !isAdmin.value) return
  router.push(`/events/${event.slug || event.id}`)
}

async function openPhotos(event, index = 0) {
  try {
    const photos = await furryApi.getEventPhotos(event.id)
    if (!photos?.length) return
    galleryPhotos.value = photos
    galleryTitle.value = event.name
    openLightbox(photos[Math.min(index, photos.length - 1)])
  } catch {
    galleryPhotos.value = []
  }
}

function addToCalendar(event) {
  const ics = buildIcs(event)
  if (!ics) return
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }))
  const link = Object.assign(document.createElement('a'), { href: url, download: `${event.slug || event.id}.ics` })
  link.click()
  URL.revokeObjectURL(url)
}

function goToPage(page) {
  state.page = page
  document.querySelector('.grid-cards')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  getAdminSession().then(value => { isAdmin.value = !!value }).catch(() => {})
  load().then(() => updateMetaTags({
    title: 'Все мероприятия | FoxTaffy.gay',
    description: `Конвенты и мероприятия, которые посетил Fox Taffy: ${stats.value.total} событий, отчёты и фотографии.`,
    url: 'https://foxtaffy.gay/events'
  }))
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
  closeLightbox()
})
</script>
