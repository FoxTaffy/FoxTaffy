<template>
    <div class="fox-file-uploader">
      <!-- Зона перетаскивания -->
      <div 
        class="fox-upload-zone"
        :class="{ 
          'fox-drag-over': isDragOver,
          'fox-uploading': isUploading,
          'fox-has-file': selectedFile || uploadedFile
        }"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
        @click="triggerFileInput"
      >
        <!-- Скрытый input для файлов -->
        <input 
          ref="fileInput"
          type="file"
          :accept="acceptedTypes.join(',')"
          @change="handleFileSelect"
          class="fox-file-input"
          hidden
        >
        
        <!-- Состояние загрузки -->
        <div v-if="isUploading" class="fox-upload-progress">
          <div class="fox-progress-circle">
            <div class="fox-progress-ring">
              <svg width="80" height="80">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="rgba(255, 255, 255, 0.1)"
                  stroke-width="8"
                  fill="none"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="#ff7b25"
                  stroke-width="8"
                  fill="none"
                  stroke-linecap="round"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="circumference - (uploadProgress / 100) * circumference"
                  transform="rotate(-90 40 40)"
                  class="fox-progress-bar"
                />
              </svg>
              <div class="fox-progress-text">
                <span class="fox-progress-percent">{{ uploadProgress }}%</span>
              </div>
            </div>
          </div>
          <div class="fox-upload-status">
            <h4>{{ uploadStatusText }}</h4>
            <p>{{ uploadSubtext }}</p>
          </div>
        </div>
        
        <!-- Превью загруженного файла -->
        <div v-else-if="uploadedFile || previewUrl" class="fox-file-preview">
          <div class="fox-preview-image">
            <img :src="previewUrl || uploadedFile?.url" :alt="selectedFile?.name || 'Превью'">
            <div class="fox-preview-overlay">
              <button @click.stop="removeFile" class="fox-remove-btn">
                <i class="fas fa-trash"></i>
              </button>
              <button @click.stop="viewFullSize" class="fox-view-btn">
                <i class="fas fa-eye"></i>
              </button>
            </div>
          </div>
          <div class="fox-file-info">
            <h4>{{ selectedFile?.name || uploadedFile?.fileName || 'Загружено' }}</h4>
            <div class="fox-file-meta">
              <span class="fox-file-size">{{ formatFileSize(selectedFile?.size || uploadedFile?.size || 0) }}</span>
              <span class="fox-file-type">{{ (selectedFile?.type || uploadedFile?.type || '').split('/')[1] }}</span>
              <span v-if="fileInfo?.width && fileInfo?.height" class="fox-file-dimensions">
                {{ fileInfo.width }}×{{ fileInfo.height }}
              </span>
            </div>
            <div class="fox-file-actions">
              <button @click.stop="uploadFile" class="fox-action-btn fox-primary" v-if="selectedFile && !uploadedFile">
                <i class="fas fa-cloud-upload-alt"></i>
                Загрузить
              </button>
              <button @click.stop="selectNewFile" class="fox-action-btn fox-secondary">
                <i class="fas fa-exchange-alt"></i>
                Заменить
              </button>
            </div>
          </div>
        </div>
        
        <!-- Пустое состояние -->
        <div v-else class="fox-upload-empty">
          <div class="fox-upload-icon">
            <i class="fas fa-cloud-upload-alt"></i>
          </div>
          <div class="fox-upload-text">
            <h4>Загрузить изображение</h4>
            <p>Перетащите файл сюда или нажмите для выбора</p>
            <div class="fox-upload-hints">
              <span>{{ acceptedTypesText }}</span>
              <span>Макс. размер: {{ maxSizeText }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Ошибки валидации -->
      <div v-if="validationErrors.length > 0" class="fox-upload-errors">
        <div v-for="(error, index) in validationErrors" :key="index" class="fox-error-item">
          <i class="fas fa-exclamation-triangle"></i>
          <span>{{ error }}</span>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue'
  import { s3Api, formatFileSize } from '@/config/s3.js'
  
  // ============================================
  // PROPS & EMITS
  // ============================================
  const props = defineProps({
    modelValue: {
      type: String,
      default: ''
    },
    folder: {
      type: String,
      default: 'arts'
    },
    maxSize: {
      type: Number,
      default: 10 * 1024 * 1024 // 10MB
    },
    acceptedTypes: {
      type: Array,
      default: () => ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    },
    autoUpload: {
      type: Boolean,
      default: false
    },
    createThumbnail: {
      type: Boolean,
      default: true
    }
  })
  
  const emit = defineEmits(['update:modelValue', 'file-uploaded', 'file-removed', 'upload-progress', 'error'])
  
  // ============================================
  // СОСТОЯНИЕ
  // ============================================
  const fileInput = ref(null)
  const selectedFile = ref(null)
  const uploadedFile = ref(null)
  const previewUrl = ref('')
  const fileInfo = ref(null)
  
  const isDragOver = ref(false)
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const uploadStatusText = ref('')
  const uploadSubtext = ref('')
  const validationErrors = ref([])
  
  // ============================================
  // ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
  // ============================================
  const acceptedTypesText = computed(() => {
    const extensions = props.acceptedTypes.map(type => type.split('/')[1].toUpperCase())
    return extensions.join(', ')
  })
  
  const maxSizeText = computed(() => {
    return formatFileSize(props.maxSize)
  })
  
  const circumference = computed(() => {
    return 2 * Math.PI * 36 // радиус 36px
  })
  
  // ============================================
  // МЕТОДЫ ЗАГРУЗКИ
  // ============================================
  const triggerFileInput = () => {
    if (!isUploading.value) {
      fileInput.value?.click()
    }
  }
  
  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      processFile(file)
    }
  }
  
  const handleDragOver = (event) => {
    isDragOver.value = true
  }
  
  const handleDragLeave = (event) => {
    isDragOver.value = false
  }
  
  const handleDrop = (event) => {
    isDragOver.value = false
    const file = event.dataTransfer.files[0]
    if (file) {
      processFile(file)
    }
  }
  
  const processFile = async (file) => {
    console.log('📁 Обрабатываем файл:', file.name)
    
    // Валидация файла
    const validation = s3Api.validateFile(file)
    if (!validation.isValid) {
      validationErrors.value = validation.errors
      return
    }
    
    validationErrors.value = []
    selectedFile.value = file
    
    // Создаем превью
    createPreview(file)
    
    // Получаем информацию о файле
    fileInfo.value = await s3Api.getFileInfo(file)
    
    // Автозагрузка если включена
    if (props.autoUpload) {
      await uploadFile()
    }
  }
  
  const createPreview = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        previewUrl.value = e.target.result
      }
      reader.readAsDataURL(file)
    }
  }
  
  const uploadFile = async () => {
    if (!selectedFile.value || isUploading.value) return
    
    isUploading.value = true
    uploadProgress.value = 0
    uploadStatusText.value = 'Подготавливаем загрузку...'
    uploadSubtext.value = 'Проверяем файл и соединение'
    
    try {
      emit('upload-progress', 0)
      
      const onProgress = (progress) => {
        uploadProgress.value = Math.round(progress)
        emit('upload-progress', uploadProgress.value)
        
        if (progress < 50) {
          uploadStatusText.value = 'Загружаем файл...'
          uploadSubtext.value = `${selectedFile.value.name}`
        } else if (progress < 90) {
          uploadStatusText.value = 'Обрабатываем изображение...'
          uploadSubtext.value = 'Создаем превью и оптимизируем'
        } else {
          uploadStatusText.value = 'Завершаем загрузку...'
          uploadSubtext.value = 'Почти готово!'
        }
      }
      
      let result
      
      if (props.createThumbnail && selectedFile.value.type.startsWith('image/')) {
        // Загружаем с превью
        uploadStatusText.value = 'Создаем превью...'
        result = await s3Api.uploadImageWithThumbnail(selectedFile.value, props.folder, onProgress)
        uploadedFile.value = {
          url: result.original.url,
          thumbnailUrl: result.thumbnail.url,
          fileName: result.original.fileName,
          size: result.original.size,
          type: result.original.type
        }
      } else {
        // Обычная загрузка
        result = await s3Api.uploadFile(selectedFile.value, props.folder, onProgress)
        uploadedFile.value = result
      }
      
      // Обновляем model value
      emit('update:modelValue', uploadedFile.value.url)
      emit('file-uploaded', uploadedFile.value)
      
      uploadStatusText.value = 'Загрузка завершена!'
      uploadSubtext.value = 'Файл успешно загружен'
      
      // Очищаем состояние через 1 секунду
      setTimeout(() => {
        isUploading.value = false
        uploadProgress.value = 0
      }, 1000)
      
    } catch (error) {
      console.error('❌ Ошибка загрузки:', error)
      isUploading.value = false
      uploadProgress.value = 0
      validationErrors.value = [error.message]
      emit('error', error)
    }
  }
  
  const removeFile = () => {
    selectedFile.value = null
    uploadedFile.value = null
    previewUrl.value = ''
    fileInfo.value = null
    validationErrors.value = []
    
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    
    emit('update:modelValue', '')
    emit('file-removed')
  }
  
  const selectNewFile = () => {
    removeFile()
    triggerFileInput()
  }
  
  const viewFullSize = () => {
    const url = uploadedFile.value?.url || previewUrl.value
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }
  
  // ============================================
  // WATCHERS
  // ============================================
  watch(() => props.modelValue, (newUrl) => {
    if (newUrl && !uploadedFile.value) {
      uploadedFile.value = {
        url: newUrl,
        fileName: 'Внешний файл',
        size: 0,
        type: 'image/jpeg'
      }
    } else if (!newUrl) {
      removeFile()
    }
  }, { immediate: true })
  </script>
  
  <style scoped>
  .fox-file-uploader {
    width: 100%;
    font-family: 'Nunito', sans-serif;
  }
  
  /* Зона загрузки */
  .fox-upload-zone {
    border: 2px dashed rgba(255, 255, 255, 0.2);
    border-radius: 1rem;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.02);
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }
  
  .fox-upload-zone:hover {
    border-color: rgba(255, 123, 37, 0.5);
    background: rgba(255, 123, 37, 0.05);
  }
  
  .fox-upload-zone.fox-drag-over {
    border-color: #ff7b25;
    background: rgba(255, 123, 37, 0.1);
    transform: scale(1.02);
  }
  
  .fox-upload-zone.fox-uploading {
    border-color: #ff7b25;
    cursor: default;
    pointer-events: none;
  }
  
  .fox-upload-zone.fox-has-file {
    border-style: solid;
    border-color: rgba(76, 175, 80, 0.5);
    background: rgba(76, 175, 80, 0.05);
  }
  
  /* Пустое состояние */
  .fox-upload-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }
  
  .fox-upload-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(255, 123, 37, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    color: #ff7b25;
    transition: all 0.3s ease;
  }
  
  .fox-upload-zone:hover .fox-upload-icon {
    background: rgba(255, 123, 37, 0.2);
    transform: scale(1.1);
  }
  
  .fox-upload-text h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1.3rem;
    font-weight: 600;
    color: #f2f2f2;
  }
  
  .fox-upload-text p {
    margin: 0 0 1rem 0;
    color: #a0a0a0;
    font-size: 1rem;
  }
  
  .fox-upload-hints {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .fox-upload-hints span {
    font-size: 0.85rem;
    color: #666;
  }
  
  /* Прогресс загрузки */
  .fox-upload-progress {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }
  
  .fox-progress-circle {
    position: relative;
  }
  
  .fox-progress-ring svg {
    transform: rotate(-90deg);
  }
  
  .fox-progress-bar {
    transition: stroke-dashoffset 0.3s ease;
  }
  
  .fox-progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }
  
  .fox-progress-percent {
    font-size: 1.2rem;
    font-weight: 700;
    color: #ff7b25;
  }
  
  .fox-upload-status h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: #f2f2f2;
  }
  
  .fox-upload-status p {
    margin: 0;
    color: #a0a0a0;
    font-size: 0.9rem;
  }
  
  /* Превью файла */
  .fox-file-preview {
    display: flex;
    gap: 2rem;
    align-items: center;
    width: 100%;
    text-align: left;
  }
  
  .fox-preview-image {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: 0.75rem;
    overflow: hidden;
    border: 2px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }
  
  .fox-preview-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .fox-preview-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .fox-preview-image:hover .fox-preview-overlay {
    opacity: 1;
  }
  
  .fox-remove-btn,
  .fox-view-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    font-size: 0.9rem;
  }
  
  .fox-remove-btn {
    background: rgba(244, 67, 54, 0.9);
  }
  
  .fox-remove-btn:hover {
    background: #f44336;
    transform: scale(1.1);
  }
  
  .fox-view-btn {
    background: rgba(33, 150, 243, 0.9);
  }
  
  .fox-view-btn:hover {
    background: #2196f3;
    transform: scale(1.1);
  }
  
  .fox-file-info {
    flex: 1;
  }
  
  .fox-file-info h4 {
    margin: 0 0 0.75rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #f2f2f2;
    word-break: break-all;
  }
  
  .fox-file-meta {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }
  
  .fox-file-meta span {
    font-size: 0.85rem;
    color: #a0a0a0;
    background: rgba(255, 255, 255, 0.05);
    padding: 0.25rem 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .fox-file-actions {
    display: flex;
    gap: 1rem;
  }
  
  .fox-action-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-family: inherit;
    font-weight: 500;
    transition: all 0.3s ease;
    font-size: 0.9rem;
  }
  
  .fox-action-btn.fox-primary {
    background: linear-gradient(135deg, #4caf50, #66bb6a);
    color: white;
  }
  
  .fox-action-btn.fox-primary:hover {
    background: linear-gradient(135deg, #66bb6a, #81c784);
    transform: translateY(-2px);
  }
  
  .fox-action-btn.fox-secondary {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #a0a0a0;
  }
  
  .fox-action-btn.fox-secondary:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #f2f2f2;
  }
  
  /* Ошибки */
  .fox-upload-errors {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .fox-error-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: rgba(244, 67, 54, 0.1);
    border: 1px solid rgba(244, 67, 54, 0.2);
    border-radius: 0.5rem;
    color: #f44336;
    font-size: 0.9rem;
  }
  
  /* Адаптивность */
  @media (max-width: 768px) {
    .fox-upload-zone {
      padding: 1.5rem;
      min-height: 150px;
    }
    
    .fox-file-preview {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }
    
    .fox-preview-image {
      width: 100px;
      height: 100px;
    }
    
    .fox-file-actions {
      justify-content: center;
    }
    
    .fox-upload-icon {
      width: 60px;
      height: 60px;
      font-size: 1.5rem;
    }
    
    .fox-upload-text h4 {
      font-size: 1.1rem;
    }
  }
  </style>