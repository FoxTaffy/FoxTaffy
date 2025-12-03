<template>
  <div class="avatar-uploader">
    <label v-if="label" class="avatar-label">{{ label }}</label>

    <div class="avatar-container">
      <div class="avatar-preview" :class="{ 'is-uploading': isUploading }">
        <img
          v-if="previewUrl || modelValue"
          :src="previewUrl || modelValue"
          alt="Avatar preview"
          class="avatar-image"
        >
        <div v-else class="avatar-placeholder">
          <i class="fas fa-user"></i>
        </div>

        <div
          class="upload-overlay"
          @click="triggerFileInput"
          @dragover.prevent="onDragOver"
          @dragleave.prevent="onDragLeave"
          @drop.prevent="onDrop"
          :class="{ 'drag-over': isDragOver }"
        >
          <template v-if="isUploading">
            <div class="upload-spinner"></div>
            <span>{{ uploadProgress }}%</span>
          </template>
          <template v-else>
            <i class="fas fa-camera"></i>
            <span>Загрузить</span>
          </template>
        </div>
      </div>

      <div class="avatar-actions">
        <button
          v-if="modelValue && !isUploading"
          type="button"
          class="remove-btn"
          @click="removeAvatar"
          title="Удалить аватар"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
      @change="handleFileSelect"
      hidden
    >

    <div v-if="compressionInfo" class="compression-info">
      <i class="fas fa-compress-arrows-alt"></i>
      <span>Сжато: {{ compressionInfo.original }} → {{ compressionInfo.compressed }} ({{ compressionInfo.ratio }})</span>
    </div>

    <div v-if="errorMessage" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      <span>{{ errorMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { imageCompressionUtils } from '@/utils/imageCompressionUtils.js'
import { s3Api } from '@/config/s3.js'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: 'Аватар'
  },
  folder: {
    type: String,
    default: 'avatars'
  },
  maxSize: {
    type: Number,
    default: 512
  }
})

const emit = defineEmits(['update:modelValue', 'uploaded', 'removed', 'error'])

const fileInput = ref(null)
const previewUrl = ref('')
const isUploading = ref(false)
const uploadProgress = ref(0)
const compressionInfo = ref(null)
const errorMessage = ref('')
const isDragOver = ref(false)

const triggerFileInput = () => {
  if (!isUploading.value) {
    fileInput.value?.click()
  }
}

const onDragOver = () => {
  isDragOver.value = true
}

const onDragLeave = () => {
  isDragOver.value = false
}

const onDrop = (event) => {
  isDragOver.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
  // Reset input to allow selecting the same file again
  event.target.value = ''
}

const processFile = async (file) => {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    errorMessage.value = 'Неподдерживаемый формат. Разрешены: JPG, PNG, WebP, GIF'
    emit('error', new Error(errorMessage.value))
    return
  }

  // Validate file size (max 10MB before compression)
  const maxFileSize = 10 * 1024 * 1024
  if (file.size > maxFileSize) {
    errorMessage.value = 'Файл слишком большой. Максимум: 10MB'
    emit('error', new Error(errorMessage.value))
    return
  }

  errorMessage.value = ''
  compressionInfo.value = null
  isUploading.value = true
  uploadProgress.value = 0

  try {
    // Create preview immediately
    const reader = new FileReader()
    reader.onload = (e) => {
      previewUrl.value = e.target.result
    }
    reader.readAsDataURL(file)

    // Compress avatar
    uploadProgress.value = 10
    const originalSize = file.size
    const compressedBlob = await imageCompressionUtils.compressImage(file, {
      maxWidth: props.maxSize,
      maxHeight: props.maxSize,
      quality: 0.85,
      format: 'image/jpeg'
    })
    const compressedSize = compressedBlob.size

    // Store compression info
    compressionInfo.value = {
      original: imageCompressionUtils.formatFileSize(originalSize),
      compressed: imageCompressionUtils.formatFileSize(compressedSize),
      ratio: imageCompressionUtils.getCompressionRatio(originalSize, compressedSize)
    }

    uploadProgress.value = 30

    // Create File object from compressed blob
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const compressedFile = new File(
      [compressedBlob],
      `avatar_${timestamp}_${randomString}.jpg`,
      { type: 'image/jpeg' }
    )

    // Upload to S3
    const onProgress = (progress) => {
      uploadProgress.value = 30 + Math.round(progress * 0.7)
    }

    const result = await s3Api.uploadFile(compressedFile, props.folder, onProgress)

    uploadProgress.value = 100
    previewUrl.value = result.url

    emit('update:modelValue', result.url)
    emit('uploaded', {
      url: result.url,
      originalSize,
      compressedSize,
      compressionRatio: compressionInfo.value.ratio
    })

  } catch (error) {
    console.error('Avatar upload error:', error)
    errorMessage.value = error.message || 'Ошибка загрузки аватара'
    previewUrl.value = ''
    emit('error', error)
  } finally {
    isUploading.value = false
  }
}

const removeAvatar = () => {
  previewUrl.value = ''
  compressionInfo.value = null
  errorMessage.value = ''
  emit('update:modelValue', '')
  emit('removed')
}
</script>

<style scoped>
.avatar-uploader {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.avatar-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.avatar-container {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.avatar-preview {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 123, 37, 0.2);
  background: linear-gradient(135deg, rgba(255, 123, 37, 0.1), rgba(255, 123, 37, 0.05));
  flex-shrink: 0;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(255, 123, 37, 0.15);
}

.avatar-preview:hover {
  border-color: rgba(255, 123, 37, 0.5);
  box-shadow: 0 8px 30px rgba(255, 123, 37, 0.25);
  transform: scale(1.05);
}

.avatar-preview.is-uploading {
  border-color: #FF7B25;
  box-shadow: 0 0 0 4px rgba(255, 123, 37, 0.2);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 2rem;
  color: rgba(255, 123, 37, 0.4);
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
  color: white;
  font-size: 0.85rem;
}

.avatar-preview:hover .upload-overlay,
.avatar-preview.is-uploading .upload-overlay,
.upload-overlay.drag-over {
  opacity: 1;
}

.upload-overlay.drag-over {
  background: rgba(255, 123, 37, 0.8);
}

.upload-overlay i {
  font-size: 1.5rem;
}

.upload-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #FF7B25;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.remove-btn {
  padding: 0.5rem;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 8px;
  color: #f44336;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
}

.remove-btn:hover {
  background: rgba(244, 67, 54, 0.2);
  border-color: rgba(244, 67, 54, 0.5);
}

.compression-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;
  font-size: 0.8rem;
  color: #4caf50;
}

.compression-info i {
  font-size: 0.9rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 8px;
  font-size: 0.8rem;
  color: #f44336;
}

.error-message i {
  font-size: 0.9rem;
}
</style>
