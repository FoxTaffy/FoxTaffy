<template>
  <section class="stack">
    <div class="stat-grid">
      <div v-for="tile in tiles" :key="tile.label" class="stat-tile">
        <span class="stat-tile-label"><i :class="tile.icon"></i> {{ tile.label }}</span>
        <span class="stat-tile-value">{{ tile.value }}</span>
      </div>
    </div>

    <section v-if="needReview.length" class="card stack">
      <h3><i class="fas fa-pen-nib"></i> Ждут обзора: {{ needReview.length }}</h3>
      <button v-for="event in needReview.slice(0, 5)" :key="event.id" type="button" class="issue" @click="edit(event, 'review')">
        <i class="fas fa-exclamation-triangle"></i>
        <span class="grow">{{ event.name }}</span>
        <span class="text-muted">Написать <i class="fas fa-arrow-right"></i></span>
      </button>
    </section>

    <div class="toolbar">
      <label class="field">
        <i class="fas fa-search"></i>
        <input v-model="state.q" type="search" placeholder="Название, город, площадка…" aria-label="Поиск мероприятий">
        <button v-if="state.q" type="button" class="icon-btn" aria-label="Очистить поиск" @click="state.q = ''"><i class="fas fa-times"></i></button>
      </label>
      <label class="field field-sort">
        <i class="fas fa-sort"></i>
        <select v-model="state.sort" aria-label="Сортировка">
          <option v-for="(sort, key) in SORTS" :key="key" :value="key">{{ sort.label }}</option>
        </select>
      </label>
      <button type="button" class="btn btn-primary" @click="wizard.openFor()"><i class="fas fa-plus"></i> Создать</button>
    </div>

    <div class="tab-row" role="tablist">
      <button
        v-for="tab in tabs"
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

    <div v-if="loading" class="grid-cards" aria-busy="true"><div v-for="n in 6" :key="n" class="card skeleton"></div></div>

    <div v-else-if="error" class="state-box" role="alert">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>Не удалось загрузить</h3>
      <p>{{ error }}</p>
      <button type="button" class="btn btn-primary" @click="load()"><i class="fas fa-redo"></i> Повторить</button>
    </div>

    <div v-else-if="!filtered.length" class="state-box">
      <i class="fas fa-calendar-times"></i>
      <h3>Мероприятия не найдены</h3>
      <p>{{ state.q || state.filter !== 'all' ? 'Измените поиск или фильтр.' : 'Создайте первое мероприятие.' }}</p>
    </div>

    <div v-else class="grid-cards">
      <EventCard v-for="event in filtered" :key="event.id" :event="event" is-admin @open="edit($event)">
        <template #actions>
          <div class="stack">
            <div class="row is-between">
              <span class="hint">Карточка заполнена на {{ completeness.get(event.id).score }}%</span>
              <span class="entity-actions">
                <router-link :to="`/events/${event.slug}`" class="icon-btn icon-btn-sm" target="_blank" aria-label="Открыть на сайте" @click.stop><i class="fas fa-external-link-alt"></i></router-link>
                <button type="button" class="icon-btn icon-btn-sm" aria-label="Дублировать как шаблон" @click.stop="wizard.openCopy(event)"><i class="fas fa-copy"></i></button>
                <button type="button" class="icon-btn icon-btn-sm is-danger" aria-label="Удалить" @click.stop="pendingDelete = event"><i class="fas fa-trash"></i></button>
              </span>
            </div>
            <progress class="meter" :value="completeness.get(event.id).score" max="100"></progress>
            <div v-if="completeness.get(event.id).missing.length" class="tag-row">
              <button v-for="item in completeness.get(event.id).missing.slice(0, 4)" :key="item.key" type="button" class="tag" @click.stop="edit(event, item.step)">
                <i class="fas fa-plus"></i> {{ item.label }}
              </button>
            </div>
          </div>
        </template>
      </EventCard>
    </div>

    <EventWizard :wizard="wizard" @saved="onSaved" />

    <ConfirmDialog
      :open="!!pendingDelete"
      title="Удалить мероприятие?"
      :message="pendingDelete ? `«${pendingDelete.name}» будет удалено вместе с покупками, фотографиями и файлами в хранилище. Это нельзя отменить.` : ''"
      confirm-text="Удалить"
      danger
      :busy="deleting"
      @confirm="confirmDelete"
      @cancel="pendingDelete = null"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { notify } from '@/composables/useAdminNotify.js'
import { useEventForm } from '@/composables/useEventForm.js'
import { useEventsAdmin } from '@/composables/useEventsAdmin.js'
import EventCard from '@/components/events/EventCard.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import EventWizard from './events/EventWizard.vue'

const { state, loading, error, stats, needReview, completeness, averageCompleteness, tabs, filtered, load, remove, SORTS } = useEventsAdmin(notify)
const wizard = useEventForm(notify)

const pendingDelete = ref(null)
const deleting = ref(false)

const tiles = computed(() => [
  { icon: 'fas fa-layer-group', label: 'Всего', value: stats.value.total },
  { icon: 'fas fa-hourglass-half', label: 'Предстоящих', value: stats.value.upcoming },
  { icon: 'fas fa-flag-checkered', label: 'Завершённых', value: stats.value.completed },
  { icon: 'fas fa-pen-nib', label: 'Ждут обзора', value: needReview.value.length },
  { icon: 'fas fa-heart-pulse', label: 'Заполненность', value: `${averageCompleteness.value}%` }
])

const edit = (event, step) => wizard.openFor(event, step)

async function onSaved(saved) {
  await load({ silent: true })
  notify(`Мероприятие «${saved.name}» сохранено`, 'success')
}

async function confirmDelete() {
  deleting.value = true
  if (await remove(pendingDelete.value)) pendingDelete.value = null
  deleting.value = false
}

onMounted(load)
</script>
