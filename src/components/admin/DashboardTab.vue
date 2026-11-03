<template>
  <section class="stack">
    <div class="stat-grid">
      <div v-for="tile in tiles" :key="tile.label" class="stat-tile">
        <span class="stat-tile-label"><i :class="tile.icon"></i> {{ tile.label }}</span>
        <span class="stat-tile-value">{{ tile.value }}</span>
      </div>
    </div>

    <div class="split is-stretch">
      <section class="card stack">
        <h3><i class="fas fa-chart-area"></i> Активность за 12 месяцев</h3>
        <svg class="chart" :viewBox="`0 0 ${W} ${H}`" role="img" :aria-label="`Загрузки артов по месяцам, всего ${total}`">
          <line v-for="y in GRID" :key="y" class="chart-grid" x1="0" x2="300" :y1="y" :y2="y" />
          <path class="chart-area" :d="areaPath(points, H)" />
          <path class="chart-line" :d="smoothPath(points)" />
          <circle v-for="(point, i) in points" :key="i" class="chart-dot" :cx="point.x" :cy="point.y" r="3.5">
            <title>{{ activity[i].label }}: {{ activity[i].count }}</title>
          </circle>
        </svg>
        <div class="chart-labels" aria-hidden="true"><span v-for="(month, i) in activity" :key="i">{{ month.label }}</span></div>
      </section>

      <section class="card stack">
        <h3><i class="fas fa-shield-alt"></i> Контент</h3>
        <div v-for="row in contentRows" :key="row.label" class="stack">
          <div class="row is-between"><span>{{ row.label }}: <b>{{ row.value }}</b></span><span class="text-muted">{{ row.percent }}%</span></div>
          <progress class="meter" :value="row.value" :max="Math.max(stats.arts, 1)"></progress>
        </div>
      </section>
    </div>

    <section class="card stack">
      <div class="row is-between is-wrap">
        <h3><i class="fas fa-heart-pulse"></i> Здоровье каталога</h3>
        <span class="status-pill" :class="audit.health >= 80 ? 'is-success' : 'is-accent'">{{ audit.health }}% артов размечено</span>
      </div>
      <progress class="meter" :value="audit.health" max="100"></progress>

      <p v-if="!audit.issues.length" class="issue is-ok"><i class="fas fa-check-circle"></i> Всё в порядке: теги, персонажи и имена заполнены.</p>
      <button v-for="issue in audit.issues" :key="issue.key" type="button" class="issue" @click="$emit('open', issue.tab, issue.filter)">
        <i :class="issue.icon"></i>
        <span class="grow"><b>{{ issue.count }}</b> {{ issue.text }}</span>
        <span class="text-muted">Разобрать <i class="fas fa-arrow-right"></i></span>
      </button>
    </section>

    <div class="split is-stretch">
      <section class="card stack">
        <div class="row is-between"><h3><i class="fas fa-clock"></i> Последние арты</h3><button type="button" class="btn btn-sm" @click="$emit('open', 'gallery', 'all')">Вся галерея</button></div>
        <div class="thumb-row">
          <button v-for="art in recentArts" :key="art.id" type="button" class="thumb" :aria-label="art.title" @click="$emit('open', 'gallery', 'all')">
            <img :src="art.thumbnail_url || art.image_url" :alt="art.title" loading="lazy">
          </button>
        </div>
      </section>

      <section class="card stack">
        <h3><i class="fas fa-crown"></i> Топ художников</h3>
        <div v-for="(artist, i) in topArtists" :key="artist.id" class="row">
          <b>{{ i + 1 }}</b>
          <AdminAvatar :src="artist.avatar_url" :name="artist.name" size="sm" />
          <span class="grow">{{ artist.name }}</span>
          <progress class="meter" :value="artist.count" :max="Math.max(topArtists[0]?.count, 1)"></progress>
          <b>{{ artist.count }}</b>
        </div>
      </section>
    </div>

    <section class="card stack">
      <h3><i class="fas fa-fire"></i> Популярные теги</h3>
      <div class="tag-row">
        <span v-for="tag in popularTags" :key="tag.id" class="tag">{{ tag.name }} · {{ tag.count }}</span>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useCatalog } from '@/composables/useAdminCatalog.js'
import { useCatalogInsights } from '@/composables/useCatalogInsights.js'
import { areaPath, smoothPath, toPoints } from '@/utils/chartUtils.js'
import AdminAvatar from './AdminAvatar.vue'

defineEmits(['open'])

const W = 300
const H = 90
const GRID = [20, 45, 70]

const catalog = useCatalog()
const { activity, lastMonth, topArtists, popularTags, recentArts, audit } = useCatalogInsights(catalog)
const stats = catalog.stats

const points = computed(() => toPoints(activity.value.map(month => month.count), { width: W, height: H }))
const total = computed(() => activity.value.reduce((sum, month) => sum + month.count, 0))
const percent = (value) => Math.round((value / Math.max(stats.value.arts, 1)) * 100)

const tiles = computed(() => [
  { icon: 'fas fa-images', label: 'Артов', value: stats.value.arts },
  { icon: 'fas fa-palette', label: 'Художников', value: stats.value.artists },
  { icon: 'fas fa-tags', label: 'Тегов', value: stats.value.tags },
  { icon: 'fas fa-paw', label: 'Персонажей', value: stats.value.characters },
  { icon: 'fas fa-calendar-alt', label: 'За месяц', value: lastMonth.value },
  { icon: 'fas fa-server', label: 'В хранилище', value: stats.value.stored }
])

const contentRows = computed(() => [
  { label: 'SFW', value: stats.value.arts - stats.value.nsfw, percent: percent(stats.value.arts - stats.value.nsfw) },
  { label: 'NSFW', value: stats.value.nsfw, percent: percent(stats.value.nsfw) }
])
</script>
