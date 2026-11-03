<template>
  <section class="stack">
    <div class="toolbar">
      <label class="field">
        <i class="fas fa-search"></i>
        <input v-model="search" type="search" placeholder="Название, художник, тег, персонаж…" aria-label="Поиск артов">
        <button v-if="search" type="button" class="icon-btn" aria-label="Очистить поиск" @click="search = ''"><i class="fas fa-times"></i></button>
      </label>
      <label class="field field-sort">
        <i class="fas fa-sort"></i>
        <select v-model="sort" aria-label="Сортировка">
          <option value="newest">Новые сначала</option>
          <option value="oldest">Старые сначала</option>
          <option value="alphabetical">По алфавиту</option>
        </select>
      </label>
      <button type="button" class="btn" :class="{ 'btn-accent': selecting }" @click="toggleSelecting">
        <i class="fas fa-check-circle"></i> {{ selecting ? 'Готово' : 'Выбрать' }}
      </button>
    </div>

    <div class="tab-row" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="tab"
        :class="{ active: catalog.filters.gallery === tab.key }"
        role="tab"
        :aria-selected="catalog.filters.gallery === tab.key"
        @click="catalog.filters.gallery = tab.key"
      >
        {{ tab.label }} <small>{{ tab.count }}</small>
      </button>
    </div>

    <div v-if="catalog.loading.value" class="grid-cards" aria-busy="true">
      <div v-for="n in 6" :key="n" class="card skeleton"></div>
    </div>

    <div v-else-if="!pageItems.length" class="state-box">
      <i class="fas fa-images"></i>
      <h3>Ничего не найдено</h3>
      <p>{{ search || catalog.filters.gallery !== 'all' ? 'Измените поиск или фильтр.' : 'В галерее пока нет артов.' }}</p>
    </div>

    <template v-else>
      <div class="grid-cards">
        <article
          v-for="art in pageItems"
          :key="art.id"
          class="card media-card"
          :class="{ 'is-selected': selected.has(art.id) }"
          tabindex="0"
          @click="activate(art)"
          @keydown.enter.self="activate(art)"
        >
          <div class="media-card-img">
            <img :src="art.thumbnail_url || art.image_url" :alt="art.title" loading="lazy">
            <label v-if="selecting" class="corner-tl check" @click.stop>
              <input type="checkbox" :checked="selected.has(art.id)" :aria-label="`Выбрать «${art.title}»`" @change="toggle(art.id)">
            </label>
            <span v-if="art.is_nsfw" class="corner-tr status-pill is-danger">NSFW</span>
          </div>

          <div class="media-card-body">
            <h3 class="media-card-title">{{ art.title }}</h3>
            <div class="media-card-meta">
              <span><i class="fas fa-palette"></i>{{ art.artist_name }}</span>
              <span><i class="fas fa-calendar"></i>{{ formatDate(art.upload_date) }}</span>
            </div>
            <div v-if="art.tags.length" class="tag-row">
              <span v-for="tag in art.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
              <span v-if="art.tags.length > 3" class="tag">+{{ art.tags.length - 3 }}</span>
            </div>
            <div class="media-card-footer">
              <span class="grow"><i class="fas fa-paw"></i> {{ art.characters.length }}</span>
              <span class="entity-actions" @click.stop>
                <a v-if="originalUrl(art)" :href="originalUrl(art)" class="icon-btn icon-btn-sm" target="_blank" rel="noopener noreferrer" aria-label="Открыть оригинал"><i class="fas fa-external-link-alt"></i></a>
                <button type="button" class="icon-btn icon-btn-sm" aria-label="Редактировать" @click="editing = art"><i class="fas fa-edit"></i></button>
                <button type="button" class="icon-btn icon-btn-sm is-danger" aria-label="Удалить" @click="askDelete([art.id], `«${art.title}» будет удалён`)"><i class="fas fa-trash"></i></button>
              </span>
            </div>
          </div>
        </article>
      </div>

      <nav v-if="totalPages > 1" class="pager" aria-label="Страницы">
        <button type="button" class="icon-btn" :disabled="page === 1" aria-label="Назад" @click="page--"><i class="fas fa-chevron-left"></i></button>
        <button v-for="n in totalPages" :key="n" type="button" class="tab" :class="{ active: n === page }" :aria-current="n === page ? 'page' : undefined" @click="page = n">{{ n }}</button>
        <button type="button" class="icon-btn" :disabled="page === totalPages" aria-label="Вперёд" @click="page++"><i class="fas fa-chevron-right"></i></button>
      </nav>
    </template>

    <div v-if="selected.size" class="bulk-bar" role="toolbar" aria-label="Массовые действия">
      <strong>Выбрано: {{ selected.size }}</strong>
      <button type="button" class="btn btn-sm" @click="selectAllFiltered">Все найденные ({{ filtered.length }})</button>
      <span class="grow"></span>
      <label class="field">
        <i class="fas fa-tag"></i>
        <select v-model="bulkTag" aria-label="Тег для добавления">
          <option value="">Добавить тег…</option>
          <option v-for="tag in catalog.lists.tag" :key="tag.id" :value="tag.name">{{ tag.name }}</option>
        </select>
      </label>
      <button type="button" class="btn btn-sm" :disabled="!bulkTag || busy" @click="applyTag">Применить</button>
      <button type="button" class="btn btn-sm" :disabled="busy" @click="applyNsfw(true)"><i class="fas fa-eye-slash"></i> NSFW</button>
      <button type="button" class="btn btn-sm" :disabled="busy" @click="applyNsfw(false)"><i class="fas fa-eye"></i> SFW</button>
      <button type="button" class="btn btn-sm btn-danger" :disabled="busy" @click="askDelete([...selected], `Выбранные арты (${selected.size}) будут удалены`)"><i class="fas fa-trash"></i> Удалить</button>
    </div>

    <ArtModal :art="editing" @close="editing = null" />

    <ConfirmDialog
      :open="!!pendingDelete"
      title="Удалить арт?"
      :message="deleteMessage"
      confirm-text="Удалить"
      danger
      :busy="busy"
      @confirm="confirmDelete"
      @cancel="pendingDelete = null"
    />
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useCatalog } from '@/composables/useAdminCatalog.js'
import { buildSearchableText, matchesFuzzySearch } from '@/utils/searchUtils.js'
import { safeHttpUrl } from '@/utils/eventUtils.js'
import ArtModal from './ArtModal.vue'
import ConfirmDialog from './ConfirmDialog.vue'

const PAGE_SIZE = 24
const SORTS = {
  newest: (a, b) => new Date(b.upload_date) - new Date(a.upload_date),
  oldest: (a, b) => new Date(a.upload_date) - new Date(b.upload_date),
  alphabetical: (a, b) => a.title.localeCompare(b.title, 'ru')
}
const FILTERS = {
  all: () => true,
  sfw: art => !art.is_nsfw,
  nsfw: art => art.is_nsfw,
  untagged: art => !art.tags.length,
  'no-characters': art => !art.characters.length
}
const FILTER_LABELS = { all: 'Все', sfw: 'SFW', nsfw: 'NSFW', untagged: 'Без тегов', 'no-characters': 'Без персонажей' }

const catalog = useCatalog()
const search = ref('')
const sort = ref('newest')
const page = ref(1)
const selecting = ref(false)
const selected = ref(new Set())
const editing = ref(null)
const pendingDelete = ref(null)
const bulkTag = ref('')
const busy = ref(false)

const tabs = computed(() => Object.keys(FILTERS).map(key => ({
  key,
  label: FILTER_LABELS[key],
  count: catalog.arts.value.filter(FILTERS[key]).length
})))

const filtered = computed(() => catalog.arts.value
  .filter(art => FILTERS[catalog.filters.gallery](art) && matchesFuzzySearch(
    search.value,
    buildSearchableText(art.title, art.artist_name, art.tags.join(' '), art.characters.map(character => character.name).join(' '))
  ))
  .sort(SORTS[sort.value]))

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const pageItems = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

watch([search, sort, () => catalog.filters.gallery], () => { page.value = 1 })
watch(totalPages, (value) => { if (page.value > value) page.value = value })

const originalUrl = (art) => safeHttpUrl(art.image_url)
const formatDate = (value) => (value ? new Date(value).toLocaleDateString('ru-RU', { year: 'numeric', month: 'short', day: 'numeric' }) : '')

function toggle(id) {
  const next = new Set(selected.value)
  next.has(id) ? next.delete(id) : next.add(id)
  selected.value = next
}

function toggleSelecting() {
  selecting.value = !selecting.value
  if (!selecting.value) selected.value = new Set()
}

const activate = (art) => (selecting.value ? toggle(art.id) : (editing.value = art))
const selectAllFiltered = () => { selected.value = new Set(filtered.value.map(art => art.id)) }
const askDelete = (ids, label) => { pendingDelete.value = { ids, label } }
const deleteMessage = computed(() =>
  pendingDelete.value ? `${pendingDelete.value.label} без возможности восстановления. Файлы в хранилище останутся.` : '')

// Любая массовая операция: блокируем кнопки на время запроса и снимаем выделение при успехе
async function bulk(task) {
  busy.value = true
  const { ok } = await task()
  busy.value = false
  if (ok) selected.value = new Set()
  return ok
}

const applyNsfw = (flag) => bulk(() => catalog.setNsfw([...selected.value], flag))
const applyTag = async () => { if (await bulk(() => catalog.addTag([...selected.value], bulkTag.value))) bulkTag.value = '' }

async function confirmDelete() {
  const { ids } = pendingDelete.value
  if (await bulk(() => catalog.removeArts(ids))) pendingDelete.value = null
}
</script>
