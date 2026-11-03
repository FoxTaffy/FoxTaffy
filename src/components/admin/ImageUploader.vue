<template>
  <div class="form-field">
    <span v-if="label" class="form-label">{{ label }}</span>

    <div
      class="dropzone"
      :class="[`dropzone-${variant}`, { 'is-drag': dragging, 'is-busy': busy }]"
      role="button"
      tabindex="0"
      :aria-label="modelValue ? `${label || 'Изображение'}: заменить` : `${label || 'Изображение'}: загрузить`"
      @click="pick"
      @keydown.enter.prevent="pick"
      @keydown.space.prevent="pick"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <img v-if="modelValue" :src="modelValue" alt="">
      <span v-else class="dropzone-hint">
        <i :class="variant === 'avatar' ? 'fas fa-user' : 'fas fa-cloud-upload-alt'"></i>
        <span v-if="hint">{{ hint }}</span>
      </span>

      <span v-if="modelValue && !busy" class="dropzone-actions">
        <button type="button" class="icon-btn icon-btn-sm" aria-label="Заменить" @click.stop="pick"><i class="fas fa-camera"></i></button>
        <button type="button" class="icon-btn icon-btn-sm is-danger" aria-label="Удалить" @click.stop="remove"><i class="fas fa-trash"></i></button>
      </span>

      <progress v-if="busy" class="meter" :value="progress" max="100"></progress>
    </div>

    <input ref="input" type="file" :accept="ALLOWED.join(',')" hidden @change="onPick">
    <p v-if="error" class="alert-error" role="alert"><i class="fas fa-exclamation-circle"></i>{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { s3Api } from '@/config/s3.js'
import { imageCompressionUtils } from '@/utils/imageCompressionUtils.js'

const props = defineProps({
  modelValue: { type: String, default: '' },
  folder: { type: String, required: true },
  variant: { type: String, default: 'photo' }, // photo | banner | avatar
  label: { type: String, default: '' },
  hint: { type: String, default: 'Перетащите файл или нажмите' },
  // true: рядом с оригиналом создаётся миниатюра (арты галереи)
  thumbnail: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'uploaded', 'removed', 'error'])

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_BYTES = 10 * 1024 * 1024
const PRESETS = {
  avatar: { side: 512, quality: 0.85 },
  banner: { side: 1920, quality: 0.9 },
  photo: { side: 2560, quality: 0.9 },
  thumb: { side: 1024, quality: 0.85 }
}

const input = ref(null)
const dragging = ref(false)
const busy = ref(false)
const progress = ref(0)
const error = ref('')

const pick = () => { if (!busy.value) input.value?.click() }
const onPick = (event) => upload(event.target.files?.[0])
const onDrop = (event) => {
  dragging.value = false
  upload(event.dataTransfer?.files?.[0])
}

function fail(message) {
  error.value = message
  emit('error', message)
}

async function send(file) {
  if (props.thumbnail) {
    const { original, thumbnail } = await s3Api.uploadImageWithThumbnail(file, props.folder, value => { progress.value = Math.round(value) })
    return { url: original.url, thumbnailUrl: thumbnail.url, size: original.size }
  }

  const { side, quality } = PRESETS[props.variant]
  const blob = await imageCompressionUtils.compressImage(file, { maxWidth: side, maxHeight: side, quality, format: 'image/jpeg' })
  progress.value = 30
  const name = `${props.variant}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`
  const result = await s3Api.uploadFile(new File([blob], name, { type: 'image/jpeg' }), props.folder, value => { progress.value = 30 + Math.round(value * 0.7) })
  return { url: result.url, size: blob.size }
}

async function upload(file) {
  if (!file || busy.value) return
  error.value = ''
  if (!ALLOWED.includes(file.type)) return fail('Допустимы JPG, PNG, WebP и GIF')
  if (file.size > MAX_BYTES) return fail('Файл больше 10 МБ')

  busy.value = true
  progress.value = 5
  try {
    const result = await send(file)
    emit('update:modelValue', result.url)
    emit('uploaded', result)
  } catch (err) {
    fail(err.message || 'Ошибка загрузки')
  } finally {
    busy.value = false
    progress.value = 0
    if (input.value) input.value.value = ''
  }
}

function remove() {
  error.value = ''
  emit('update:modelValue', '')
  emit('removed')
}
</script>
