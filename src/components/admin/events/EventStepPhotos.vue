<template>
  <div class="stack">
    <div
      class="dropzone"
      :class="{ 'is-drag': dragging, 'is-busy': uploading }"
      role="button"
      tabindex="0"
      aria-label="Загрузить фотографии"
      @click="input?.click()"
      @keydown.enter.prevent="input?.click()"
      @keydown.space.prevent="input?.click()"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <span class="dropzone-hint">
        <i class="fas fa-cloud-upload-alt"></i>
        <span>{{ uploading ? `Загрузка… ${progress}%` : 'Перетащите фотографии или нажмите' }}</span>
        <small class="hint">JPG, PNG, WebP · до 10 МБ · миниатюры создаются автоматически</small>
      </span>
      <progress v-if="uploading" class="meter" :value="progress" max="100"></progress>
    </div>
    <input ref="input" type="file" accept="image/*" multiple hidden @change="onPick">

    <div v-if="photos.length" class="stack">
      <p class="hint">Фото: {{ photos.length }}. Новые сохранятся вместе с мероприятием.</p>
      <div class="grid-cards is-compact">
        <div v-for="photo in photos" :key="photo.id || photo.image_url" class="media-card-img">
          <img :src="photo.thumbnail_url || photo.image_url" alt="" loading="lazy">
          <span v-if="photo.isNew" class="corner-tl status-pill is-success">Новое</span>
          <button type="button" class="corner-tr icon-btn icon-btn-sm is-danger" aria-label="Убрать фото" @click="removePhoto(photo)"><i class="fas fa-times"></i></button>
        </div>
      </div>
    </div>
    <div v-else class="state-box">
      <i class="fas fa-camera-retro"></i>
      <p>Фотографий пока нет</p>
    </div>
  </div>
</template>

<script setup>
import { inject, ref } from 'vue'
import { EVENT_FORM_KEY } from '@/composables/useEventForm.js'

const { photos, uploading, progress, uploadPhotos, removePhoto } = inject(EVENT_FORM_KEY)

const input = ref(null)
const dragging = ref(false)

function onPick(event) {
  uploadPhotos(event.target.files)
  event.target.value = ''
}

function onDrop(event) {
  dragging.value = false
  uploadPhotos(event.dataTransfer?.files || [])
}
</script>
