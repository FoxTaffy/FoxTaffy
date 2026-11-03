<template>
  <section class="stack">
    <div class="toolbar">
      <label class="field">
        <i class="fas fa-search"></i>
        <input v-model="search" type="search" :placeholder="`Поиск: ${meta.many.toLowerCase()}`" :aria-label="`Поиск: ${meta.many.toLowerCase()}`">
        <button v-if="search" type="button" class="icon-btn" aria-label="Очистить поиск" @click="search = ''"><i class="fas fa-times"></i></button>
      </label>
      <button type="button" class="btn btn-primary" @click="openForm(null)"><i class="fas fa-plus"></i> Добавить</button>
    </div>

    <div class="tab-row" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="tab"
        :class="{ active: catalog.filters[kind] === tab.key }"
        role="tab"
        :aria-selected="catalog.filters[kind] === tab.key"
        @click="catalog.filters[kind] = tab.key"
      >
        {{ tab.label }} <small>{{ tab.count }}</small>
      </button>
    </div>

    <div v-if="!items.length" class="state-box">
      <i :class="meta.icon"></i>
      <h3>Ничего не найдено</h3>
      <p>{{ search || catalog.filters[kind] !== 'all' ? 'Измените поиск или фильтр.' : 'Список пока пуст.' }}</p>
    </div>

    <div v-else class="grid-cards">
      <article v-for="item in items" :key="item.id" class="entity">
        <AdminAvatar v-if="kind !== 'tag'" :src="item.avatar_url" :name="item.name" />
        <span v-else class="icon-badge"><i class="fas fa-tag"></i></span>

        <div class="entity-body">
          <h3 class="entity-title">{{ item.name }}</h3>
          <div class="entity-meta">
            {{ item.count || 0 }} {{ pluralize(item.count || 0, meta.usage) }}
            <span v-if="item.is_friend" class="status-pill is-gold"><i class="fas fa-star"></i>Друг</span>
          </div>
        </div>

        <span class="entity-actions">
          <button type="button" class="icon-btn icon-btn-sm" :aria-label="`Изменить ${item.name}`" @click="openForm(item)"><i class="fas fa-edit"></i></button>
          <button type="button" class="icon-btn icon-btn-sm is-danger" :aria-label="`Удалить ${item.name}`" @click="pendingDelete = item"><i class="fas fa-trash"></i></button>
        </span>
      </article>
    </div>

    <EntityModal :open="form.open" :kind="kind" :item="form.item" @close="form.open = false" />

    <ConfirmDialog
      :open="!!pendingDelete"
      :title="`Удалить ${meta.genitive}?`"
      :message="deleteMessage"
      confirm-text="Удалить"
      danger
      :busy="busy"
      :confirm-disabled="blocked"
      @confirm="confirmDelete"
      @cancel="pendingDelete = null"
    />
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { KINDS, useCatalog } from '@/composables/useAdminCatalog.js'
import { useCatalogInsights } from '@/composables/useCatalogInsights.js'
import { pluralize } from '@/utils/format.js'
import { matchesFuzzySearch } from '@/utils/searchUtils.js'
import AdminAvatar from './AdminAvatar.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import EntityModal from './EntityModal.vue'

const props = defineProps({ kind: { type: String, required: true } })

const catalog = useCatalog()
const { duplicates } = useCatalogInsights(catalog)

const meta = computed(() => KINDS[props.kind])
const search = ref('')
const form = reactive({ open: false, item: null })
const pendingDelete = ref(null)
const busy = ref(false)

const FILTERS = {
  all: () => true,
  unused: item => !item.count,
  duplicates: item => duplicates.value[props.kind].has(item.id)
}
const FILTER_LABELS = { all: 'Все', unused: 'Не используются', duplicates: 'Похожие имена' }

const list = computed(() => catalog.lists[props.kind])
const tabs = computed(() => Object.keys(FILTERS).map(key => ({
  key, label: FILTER_LABELS[key], count: list.value.filter(FILTERS[key]).length
})))
const items = computed(() => list.value.filter(item =>
  FILTERS[catalog.filters[props.kind]](item) && matchesFuzzySearch(search.value, item.name)))

function openForm(item) {
  Object.assign(form, { open: true, item })
}

// У художника с артами удаление опасно: связи каскадно исчезнут, арты пропадут из галереи (она строится через художника)
const blocked = computed(() => props.kind === 'artist' && (pendingDelete.value?.count || 0) > 0)
const deleteMessage = computed(() => {
  const item = pendingDelete.value
  if (!item) return ''
  if (blocked.value) return `У «${item.name}» ${item.count} ${pluralize(item.count, meta.value.usage)}. Сначала переназначьте или удалите арты, иначе они пропадут из галереи.`
  return props.kind === 'artist'
    ? `«${item.name}» будет удалён без возможности восстановления.`
    : `«${item.name}» будет убран со всех артов (${item.count || 0}) и удалён.`
})

async function confirmDelete() {
  busy.value = true
  const { ok } = await catalog.removeEntity(props.kind, pendingDelete.value)
  busy.value = false
  if (ok) pendingDelete.value = null
}
</script>
