<template>
  <div class="stack">
    <div class="form-grid">
      <label class="form-field">
        <span class="form-label is-required">Название</span>
        <input v-model="form.title" class="input" type="text" placeholder="Название арта" required maxlength="200">
      </label>

      <div class="form-field">
        <span class="form-label is-required">Художник</span>
        <EntityPicker
          v-model="form.artist"
          :items="lists.artist"
          icon="fas fa-palette"
          placeholder="Выбрать художника"
          search-placeholder="Поиск художников…"
          avatars
          :create="name => quickCreate('artist', name)"
        />
      </div>
    </div>

    <div class="form-grid">
      <div class="form-field">
        <span class="form-label">Теги</span>
        <EntityPicker
          v-model="form.tags"
          :items="lists.tag"
          multiple
          icon="fas fa-tags"
          placeholder="Выбрать теги"
          search-placeholder="Поиск тегов…"
          :create="name => quickCreate('tag', name)"
        />
      </div>

      <div class="form-field">
        <span class="form-label">Персонажи</span>
        <EntityPicker
          v-model="form.characters"
          :items="lists.character"
          multiple
          icon="fas fa-paw"
          placeholder="Выбрать персонажей"
          search-placeholder="Поиск персонажей…"
          avatars
          :create="name => quickCreate('character', name)"
        />
      </div>
    </div>

    <div class="row is-wrap is-between">
      <label class="switch">
        <input v-model="form.isNsfw" type="checkbox" role="switch">
        <span><i class="fas fa-exclamation-triangle text-danger"></i> Контент 18+ (NSFW)</span>
      </label>

      <label v-if="showDate" class="form-field">
        <span class="form-label">Дата публикации</span>
        <input v-model="form.date" class="input" type="date">
      </label>
    </div>
  </div>
</template>

<script setup>
import { useCatalog } from '@/composables/useAdminCatalog.js'
import EntityPicker from './EntityPicker.vue'

defineProps({ showDate: { type: Boolean, default: false } })

// Форма принадлежит родителю (вкладка «Добавить арт» или окно редактирования)
const form = defineModel({ type: Object, required: true })
const { lists, quickCreate } = useCatalog()
</script>
