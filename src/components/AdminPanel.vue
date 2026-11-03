<template>
  <AdminShell
    :model-value="activeTab"
    :title="view.title"
    :subtitle="view.subtitle"
    :groups="groups"
    @update:model-value="activeTab = $event"
    @ready="catalog.load()"
  >
    <template #side-actions>
      <button type="button" class="btn" title="Обновить данные" :disabled="catalog.loading.value" @click="refresh">
        <span v-if="catalog.loading.value" class="spinner spinner-sm"></span>
        <span v-else><i class="fas fa-sync-alt"></i></span>
      </button>
    </template>

    <div v-if="catalog.loading.value && !catalog.arts.value.length" class="state-box" aria-busy="true">
      <div class="spinner"></div>
      <p>Загружаем каталог…</p>
    </div>

    <KeepAlive v-else include="AddArtTab">
      <component :is="view.component" v-bind="view.props" @open="focusTab" @dirty="draftDirty = $event" @added="activeTab = 'gallery'" />
    </KeepAlive>
  </AdminShell>
</template>

<script setup>
import { computed, provide, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { CATALOG_KEY, useAdminCatalog } from '@/composables/useAdminCatalog.js'
import { notify } from '@/composables/useAdminNotify.js'
import AddArtTab from './admin/AddArtTab.vue'
import AdminShell from './admin/AdminShell.vue'
import DashboardTab from './admin/DashboardTab.vue'
import EntityTab from './admin/EntityTab.vue'
import GalleryTab from './admin/GalleryTab.vue'

const catalog = useAdminCatalog(notify)
provide(CATALOG_KEY, catalog)

const activeTab = ref('dashboard')
const draftDirty = ref(false)

const VIEWS = {
  dashboard: { component: DashboardTab, title: 'Дашборд', subtitle: 'Обзор каталога и здоровья данных' },
  'add-art': { component: AddArtTab, title: 'Добавить арт', subtitle: 'Файл или ссылка, художник, теги и персонажи' },
  gallery: { component: GalleryTab, title: 'Галерея', subtitle: 'Поиск, редактирование и массовые действия' },
  artists: { component: EntityTab, props: { kind: 'artist' }, title: 'Художники', subtitle: 'Авторы артов и друзья' },
  tags: { component: EntityTab, props: { kind: 'tag' }, title: 'Теги', subtitle: 'Категории и теги артов' },
  characters: { component: EntityTab, props: { kind: 'character' }, title: 'Персонажи', subtitle: 'Фурсоны на артах' }
}

const view = computed(() => VIEWS[activeTab.value])

const groups = computed(() => [
  {
    title: 'Основное',
    items: [
      { id: 'dashboard', name: 'Дашборд', icon: 'fas fa-tachometer-alt' },
      { id: 'add-art', name: 'Добавить арт', icon: 'fas fa-cloud-upload-alt' },
      { id: 'gallery', name: 'Галерея', icon: 'fas fa-images', count: catalog.stats.value.arts }
    ]
  },
  {
    title: 'Справочники',
    items: [
      { id: 'artists', name: 'Художники', icon: 'fas fa-palette', count: catalog.stats.value.artists },
      { id: 'tags', name: 'Теги', icon: 'fas fa-tags', count: catalog.stats.value.tags },
      { id: 'characters', name: 'Персонажи', icon: 'fas fa-paw', count: catalog.stats.value.characters }
    ]
  }
])

function focusTab(tab, filter) {
  const key = tab === 'gallery' ? 'gallery' : { artists: 'artist', tags: 'tag', characters: 'character' }[tab]
  if (key && filter) catalog.filters[key] = filter
  activeTab.value = tab
}

async function refresh() {
  await catalog.load({ silent: false })
  if (!catalog.error.value) notify('Данные обновлены', 'success')
}

onBeforeRouteLeave(() => !draftDirty.value || window.confirm('Форма добавления арта не отправлена. Уйти и потерять введённые данные?'))
</script>
