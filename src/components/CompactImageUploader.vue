<template>
  <div
    class="compact-uploader"
    :class="{
      'is-banner': variant === 'banner',
      'is-avatar': variant === 'avatar',
      'has-image': hasImage,
      'is-dragging': isDragging,
      'is-uploading': isUploading
    }"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
    @click="triggerUpload"
  >
    <!-- Preview -->
    <div class="preview-area" v-if="hasImage">
      <img :src="modelValue" alt="Preview" class="preview-image" />
      <div class="preview-overlay">
        <button type="button" class="overlay-btn change" @click.stop="triggerUpload" title="Изменить">
          <i class="fas fa-camera"></i>
        </button>
        <button type="button" class="overlay-btn remove" @click.stop="removeImage" title="Удалить">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>

    <!-- Upload placeholder -->
    <div class="upload-placeholder" v-else>
      <div v-if="isUploading" class="upload-progress">
        <i class="fas fa-spinner fa-spin"></i>
        <span>{{ uploadProgress }}%</span>
      </div>
      <div v-else class="upload-content">
        <i :class="placeholderIcon"></i>
        <span class="upload-label">{{ label }}</span>
      </div>
    </div>

    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
      @change="handleFileSelect"
      hidden
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { s3Api } from '@/config/s3.js'
import { imageCompressionUtils } from '@/utils/imageCompressionUtils.js'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'banner', // 'banner' или 'avatar'
    validator: v => ['banner', 'avatar'].includes(v)
  },
  folder: {
    type: String,
    default: 'events'
  },
  label: {
    type: String,
    default: 'Загрузить'
  }
})

const emit = defineEmits(['update:modelValue', 'uploaded', 'removed', 'error'])

const fileInput = ref(null)
const isDragging = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)

const hasImage = computed(() => !!props.modelValue)

const placeholderIcon = computed(() => {
  return props.variant === 'avatar' ? 'fas fa-user' : 'fas fa-image'
})

const triggerUpload = () => {
  if (!isUploading.value) {
    fileInput.value?.click()
  }
}

const onDragOver = (e) => {
  e.preventDefault()
  isDragging.value = true
}

const onDragLeave = () => {
  isDragging.value = false
}

const onDrop = (e) => {
  e.preventDefault()
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

const handleFileSelect = (e) => {
  const file = e.target.files?.[0]
  if (file) {
    processFile(file)
  }
  e.target.value = ''
}

const processFile = async (file) => {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    emit('error', 'Неподдерживаемый формат. Разрешены: JPG, PNG, WebP, GIF')
    return
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    emit('error', 'Файл слишком большой. Максимум: 10MB')
    return
  }

  isUploading.value = true
  uploadProgress.value = 0

  try {
    // Compress image
    uploadProgress.value = 10

    const maxSize = props.variant === 'avatar' ? 512 : 1920
    const compressedBlob = await imageCompressionUtils.compressImage(file, {
      maxWidth: maxSize,
      maxHeight: maxSize,
      quality: props.variant === 'avatar' ? 0.85 : 0.9,
      format: 'image/jpeg'
    })

    uploadProgress.value = 30

    // Create File object
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const compressedFile = new File(
      [compressedBlob],
      `${props.variant}_${timestamp}_${randomString}.jpg`,
      { type: 'image/jpeg' }
    )

    // Upload to S3
    const result = await s3Api.uploadFile(compressedFile, props.folder, (progress) => {
      uploadProgress.value = 30 + Math.round(progress * 0.7)
    })

    uploadProgress.value = 100
    emit('update:modelValue', result.url)
    emit('uploaded', { url: result.url, size: compressedBlob.size })

  } catch (error) {
    console.error('Upload error:', error)
    emit('error', error.message || 'Ошибка загрузки')
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

const removeImage = () => {
  emit('update:modelValue', '')
  emit('removed')
}
</script>

<style scoped>
.compact-uploader {
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.03);
}

.compact-uploader:hover {
  border-color: rgba(255, 123, 37, 0.5);
  background: rgba(255, 123, 37, 0.05);
}

.compact-uploader.is-dragging {
  border-color: #ff7b25;
  background: rgba(255, 123, 37, 0.15);
  transform: scale(1.02);
}

.compact-uploader.has-image {
  border-style: solid;
  border-color: rgba(76, 175, 80, 0.5);
}

.compact-uploader.is-uploading {
  border-color: rgba(33, 150, 243, 0.5);
  pointer-events: none;
}

/* Banner variant */
.compact-uploader.is-banner {
  width: 100%;
  height: 80px;
}

/* Avatar variant */
.compact-uploader.is-avatar {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  flex-shrink: 0;
}

/* Preview */
.preview-area {
  width: 100%;
  height: 100%;
  position: relative;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.preview-area:hover .preview-overlay {
  opacity: 1;
}

.overlay-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
}

.overlay-btn.change {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
}

.overlay-btn.change:hover {
  background: #ff7b25;
  color: white;
}

.overlay-btn.remove {
  background: rgba(244, 67, 54, 0.9);
  color: white;
}

.overlay-btn.remove:hover {
  background: #d32f2f;
}

/* Upload placeholder */
.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.5);
}

.is-banner .upload-content {
  flex-direction: row;
}

.is-avatar .upload-content {
  flex-direction: column;
  gap: 0.25rem;
}

.upload-content i {
  font-size: 1.2rem;
  color: rgba(255, 123, 37, 0.6);
}

.is-avatar .upload-content i {
  font-size: 1.5rem;
}

.upload-label {
  font-size: 0.75rem;
  font-weight: 500;
}

.is-avatar .upload-label {
  font-size: 0.65rem;
}

/* Upload progress */
.upload-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  color: #2196f3;
}

.upload-progress i {
  font-size: 1.2rem;
}

.upload-progress span {
  font-size: 0.75rem;
  font-weight: 600;
}
</style>
