<template>
    <div class="fox-file-uploader">
      <!-- Область загрузки -->
      <div 
        class="fox-upload-area"
        :class="{ 
          'dragover': isDragOver, 
          'uploading': isUploading,
          'has-file': uploadedFile 
        }"
        @drop="handleDrop"
        @dragover.prevent="handleDragOver"
        @dragenter.prevent="handleDragEnter"
        @dragleave.prevent="handleDragLeave"
        @click="openFileDialog"
      >
        <!-- Скрытый input для выбора файлов -->
        <input 
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="handleFileSelect"
          style="display: none"
        >
        
        <!-- Контент области загрузки -->
        <div v-if="!uploadedFile && !isUploading" class="fox-upload-content">
          <div class="fox-upload-icon">
            <i class="fas fa-cloud-upload-alt"></i>
          </div>
          <h4 class="fox-upload-title">Загрузить изображение</h4>
          <p class="fox-upload-subtitle">
            Перетащите файл сюда или <span class="fox-upload-link">выберите файл</span>
          </p>
          <div class="fox-upload-formats">
            <span>JPG, PNG, GIF, WebP • Макс. 10MB</span>
          </div>
        </div>
        
        <!-- Состояние загрузки -->
        <div v-if="isUploading" class="fox-uploading-state">
          <div class="fox-upload-spinner">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <h4>Загружаем в Supabase...</h4>
          <div class="fox-progress-bar">
            <div 
              class="fox-progress-fill"
              :style="{ width: uploadProgress + '%' }"
            ></div>
          </div>
          <p>{{ uploadProgress }}% • {{ formatFileSize(fileSize) }}</p>
        </div>
        
        <!-- Загруженный файл -->
        <div v-if="uploadedFile && !isUploading" class="fox-uploaded-file">
          <div class="fox-file-preview">
            <img 
              :src="uploadedFile.url" 
              :alt="uploadedFile.fileName" 
              class="fox-preview-image"
            >
            <div class="fox-file-overlay">
              <button @click.stop="removeFile" class="fox-remove-btn">
                <i class="fas fa-trash"></i>
              </button>
              <button @click.stop="viewFile" class="fox-view-btn">
                <i class="fas fa-eye"></i>
              </button>
            </div>
          </div>
          <div class="fox-file-info">
            <h5 class="fox-file-name">{{ uploadedFile.fileName }}</h5>
            <p class="fox-file-details">
              {{ formatFileSize(uploadedFile.size) }} • 
              <span class="fox-s3-badge">Supabase</span>
            </p>
          </div>
        </div>
      </div>
      
      <!-- Ошибки -->
      <div v-if="error" class="fox-upload-error">
        <i class="fas fa-exclamation-triangle"></i>
        <span>{{ error }}</span>
        <button @click="clearError" class="fox-error-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <!-- Информация о Supabase Storage -->
      <div v-if="showInfo" class="fox-storage-info">
        <div class="fox-info-header">
          <i class="fas fa-info-circle"></i>
          <span>Supabase Storage</span>
        </div>
        <div class="fox-info-details">
          <div class="fox-info-item">
            <i class="fas fa-server"></i>
            <span>Хранилище: Supabase (S3-совместимый)</span>
          </div>
          <div class="fox-info-item">
            <i class="fas fa-shield-alt"></i>
            <span>Публичный доступ с CDN</span>
          </div>
          <div class="fox-info-item">
            <i class="fas fa-compress-alt"></i>
            <span>Автоматическая оптимизация</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch, onMounted } from 'vue'
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
    autoUpload: {
      type: Boolean,
      default: true
    },
    createThumbnail: {
      type: Boolean,
      default: false
    },
    showInfo: {
      type: Boolean,
      default: true
    }
  })
  
  const emit = defineEmits([
    'update:modelValue',
    'file-uploaded',
    'file-removed',
    'upload-progress',
    'error'
  ])
  
  // ============================================
  // СОСТОЯНИЕ
  // ============================================
  const fileInput = ref(null)
  const isDragOver = ref(false)
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const uploadedFile = ref(null)
  const error = ref('')
  const fileSize = ref(0)
  
  // ============================================
  // КОНСТАНТЫ
  // ============================================
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  
  // ============================================
  // МЕТОДЫ ВАЛИДАЦИИ
  // ============================================
  const validateFile = (file) => {
    const errors = []
    
    // Проверка размера
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`Файл слишком большой. Максимум: ${formatFileSize(MAX_FILE_SIZE)}`)
    }
    
    // Проверка типа
    if (!ALLOWED_TYPES.includes(file.type)) {
      errors.push('Неподдерживаемый формат. Разрешены: JPG, PNG, GIF, WebP')
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    }
  }
  
  // ============================================
  // ОБРАБОТЧИКИ DRAG & DROP
  // ============================================
  const handleDragOver = (e) => {
    e.preventDefault()
    isDragOver.value = true
  }
  
  const handleDragEnter = (e) => {
    e.preventDefault()
    isDragOver.value = true
  }
  
  const handleDragLeave = (e) => {
    e.preventDefault()
    // Проверяем, что мышь действительно покинула область
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      isDragOver.value = false
    }
  }
  
  const handleDrop = (e) => {
    e.preventDefault()
    isDragOver.value = false
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      processFile(files[0])
    }
  }
  
  // ============================================
  // ОБРАБОТЧИКИ ФАЙЛОВ
  // ============================================
  const openFileDialog = () => {
    if (isUploading.value) return
    fileInput.value?.click()
  }
  
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      processFile(files[0])
    }
  }
  
  const processFile = async (file) => {
    console.log('📁 Обрабатываем файл:', file.name)
    
    // Валидация
    const validation = validateFile(file)
    if (!validation.isValid) {
      error.value = validation.errors[0]
      emit('error', error.value)
      return
    }
    
    fileSize.value = file.size
    
    if (props.autoUpload) {
      await uploadFile(file)
    } else {
      // Если автозагрузка отключена, просто создаем превью
      createPreview(file)
    }
  }
  
  const createPreview = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedFile.value = {
        url: e.target.result,
        fileName: file.name,
        size: file.size,
        type: file.type,
        isPreview: true
      }
    }
    reader.readAsDataURL(file)
  }
  
  const uploadFile = async (file) => {
    if (isUploading.value) return
    
    isUploading.value = true
    uploadProgress.value = 0
    error.value = ''
    
    try {
      console.log('☁️ Загружаем файл в Supabase Storage...')
      
      // Callback для прогресса
      const onProgress = (progress) => {
        uploadProgress.value = progress
        emit('upload-progress', progress)
      }
      
      // Загружаем файл
      let result
      if (props.createThumbnail) {
        result = await s3Api.uploadImageWithThumbnail(file, props.folder, onProgress)
        uploadedFile.value = {
          url: result.original.url,
          thumbnailUrl: result.thumbnail.url,
          fileName: result.original.fileName,
          size: result.original.size,
          type: result.original.type,
          path: result.original.path
        }
      } else {
        result = await s3Api.uploadFile(file, props.folder, onProgress)
        uploadedFile.value = {
          url: result.url,
          fileName: result.fileName,
          size: result.size,
          type: result.type,
          path: result.path
        }
      }
      
      // Обновляем v-model
      emit('update:modelValue', uploadedFile.value.url)
      emit('file-uploaded', uploadedFile.value)
      
      console.log('✅ Файл успешно загружен:', result)
      
    } catch (err) {
      console.error('❌ Ошибка загрузки файла:', err)
      error.value = err.message || 'Ошибка загрузки файла'
      emit('error', error.value)
      uploadedFile.value = null
    } finally {
      isUploading.value = false
    }
  }
  
  // ============================================
  // ДЕЙСТВИЯ С ФАЙЛОМ
  // ============================================
  const removeFile = async () => {
    if (uploadedFile.value && uploadedFile.value.path && !uploadedFile.value.isPreview) {
      try {
        await s3Api.deleteFile(uploadedFile.value.path)
        console.log('🗑️ Файл удален из Supabase Storage')
      } catch (err) {
        console.warn('⚠️ Ошибка удаления файла:', err)
      }
    }
    
    uploadedFile.value = null
    uploadProgress.value = 0
    error.value = ''
    
    emit('update:modelValue', '')
    emit('file-removed')
    
    // Сбрасываем input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
  
  const viewFile = () => {
    if (uploadedFile.value?.url) {
      window.open(uploadedFile.value.url, '_blank', 'noopener,noreferrer')
    }
  }
  
  const clearError = () => {
    error.value = ''
  }
  
  // ============================================
  // WATCHERS
  // ============================================
  watch(() => props.modelValue, (newValue) => {
    if (!newValue && uploadedFile.value) {
      uploadedFile.value = null
      uploadProgress.value = 0
    }
  })
  
  // ============================================
  // ЖИЗНЕННЫЙ ЦИКЛ
  // ============================================
  onMounted(() => {
    console.log('✅ FileUploader инициализирован')
    console.log('📁 Папка загрузки:', props.folder)
    console.log('🔄 Автозагрузка:', props.autoUpload)
    console.log('🖼️ Создание превью:', props.createThumbnail)
  })
  </script>
  
  <style scoped>
  .fox-file-uploader {
    width: 100%;
  }
  
  .fox-upload-area {
    border: 2px dashed rgba(255, 255, 255, 0.2);
    border-radius: 1rem;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.02);
    position: relative;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .fox-upload-area:hover {
    border-color: rgba(255, 123, 37, 0.5);
    background: rgba(255, 123, 37, 0.05);
  }
  
  .fox-upload-area.dragover {
    border-color: #ff7b25;
    background: rgba(255, 123, 37, 0.1);
    transform: scale(1.02);
  }
  
  .fox-upload-area.uploading {
    border-color: rgba(33, 150, 243, 0.5);
    background: rgba(33, 150, 243, 0.05);
    cursor: not-allowed;
  }
  
  .fox-upload-area.has-file {
    border-color: rgba(76, 175, 80, 0.5);
    background: rgba(76, 175, 80, 0.05);
  }
  
  /* Контент загрузки */
  .fox-upload-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .fox-upload-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(255, 123, 37, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    color: #ff7b25;
    margin-bottom: 1rem;
  }
  
  .fox-upload-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: #f2f2f2;
    margin: 0;
  }
  
  .fox-upload-subtitle {
    color: #a0a0a0;
    margin: 0;
    font-size: 1rem;
  }
  
  .fox-upload-link {
    color: #ff7b25;
    font-weight: 500;
  }
  
  .fox-upload-formats {
    font-size: 0.85rem;
    color: #666;
    margin-top: 0.5rem;
  }
  
  /* Состояние загрузки */
  .fox-uploading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
  }
  
  .fox-upload-spinner {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: rgba(33, 150, 243, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: #2196f3;
  }
  
  .fox-uploading-state h4 {
    color: #f2f2f2;
    margin: 0;
    font-size: 1.1rem;
  }
  
  .fox-progress-bar {
    width: 100%;
    max-width: 300px;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
  }
  
  .fox-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #2196f3, #42a5f5);
    border-radius: 4px;
    transition: width 0.3s ease;
  }
  
  .fox-uploading-state p {
    color: #a0a0a0;
    margin: 0;
    font-size: 0.9rem;
  }
  
  /* Загруженный файл */
  .fox-uploaded-file {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    width: 100%;
    max-width: 400px;
  }
  
  .fox-file-preview {
    position: relative;
    width: 100px;
    height: 100px;
    border-radius: 0.75rem;
    overflow: hidden;
    flex-shrink: 0;
  }
  
  .fox-preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .fox-file-overlay {
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
  
  .fox-file-preview:hover .fox-file-overlay {
    opacity: 1;
  }
  
  .fox-remove-btn,
  .fox-view-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.9);
    color: #333;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    transition: all 0.3s ease;
  }
  
  .fox-remove-btn:hover {
    background: #f44336;
    color: white;
  }
  
  .fox-view-btn:hover {
    background: #2196f3;
    color: white;
  }
  
  .fox-file-info {
    flex: 1;
    text-align: left;
  }
  
  .fox-file-name {
    color: #f2f2f2;
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    word-break: break-word;
  }
  
  .fox-file-details {
    color: #a0a0a0;
    font-size: 0.85rem;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .fox-s3-badge {
    background: rgba(33, 150, 243, 0.2);
    color: #2196f3;
    padding: 0.2rem 0.5rem;
    border-radius: 0.5rem;
    font-size: 0.7rem;
    font-weight: 600;
  }
  
  /* Ошибки */
  .fox-upload-error {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    background: rgba(244, 67, 54, 0.1);
    border: 1px solid rgba(244, 67, 54, 0.2);
    border-radius: 0.75rem;
    color: #f44336;
    margin-top: 1rem;
  }
  
  .fox-upload-error i {
    font-size: 1.1rem;
  }
  
  .fox-upload-error span {
    flex: 1;
  }
  
  .fox-error-close {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: none;
    background: rgba(244, 67, 54, 0.2);
    color: #f44336;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
  }
  
  .fox-error-close:hover {
    background: rgba(244, 67, 54, 0.3);
  }
  
  /* Информация о хранилище */
  .fox-storage-info {
    margin-top: 1.5rem;
    padding: 1.5rem;
    background: rgba(33, 150, 243, 0.05);
    border: 1px solid rgba(33, 150, 243, 0.1);
    border-radius: 0.75rem;
  }
  
  .fox-info-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    color: #2196f3;
    font-weight: 600;
    font-size: 0.95rem;
  }
  
  .fox-info-details {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .fox-info-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #a0a0a0;
    font-size: 0.85rem;
  }
  
  .fox-info-item i {
    width: 16px;
    text-align: center;
    color: #2196f3;
  }
  
  /* Адаптивность */
  @media (max-width: 768px) {
    .fox-upload-area {
      padding: 1.5rem;
      min-height: 160px;
    }
    
    .fox-upload-icon {
      width: 60px;
      height: 60px;
      font-size: 1.5rem;
    }
    
    .fox-upload-title {
      font-size: 1.1rem;
    }
    
    .fox-uploaded-file {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }
    
    .fox-file-info {
      text-align: center;
    }
    
    .fox-storage-info {
      padding: 1rem;
    }
  }
  </style>