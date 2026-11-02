<template>
  <section class="fox-taffy-reference-section">
    <h2 class="fox-taffy-section-title">Референс Fox Taffy</h2>
    
    <div class="fox-taffy-reference-container">
      <!-- Основное изображение референса -->
      <div class="fox-taffy-reference-image-container">
        <!-- Переключатель SFW/NSFW -->
        <div class="fox-taffy-reference-switch">
          <span class="fox-taffy-switch-label" :class="{ 'fox-taffy-active': !showNsfw }">SFW</span>
          <label class="fox-taffy-switch">
            <input
              type="checkbox"
              :checked="showNsfw"
              @change="toggleReferenceType"
              class="fox-taffy-switch-input"
            >
            <span class="fox-taffy-slider"></span>
          </label>
          <span class="fox-taffy-switch-label" :class="{ 'fox-taffy-active': showNsfw }">NSFW</span>
        </div>
        
        <!-- Изображение референса -->
        <div class="fox-taffy-image-wrapper">
          <img
            :src="currentReferenceUrl"
            alt="Fox Taffy Reference Sheet"
            class="fox-taffy-reference-image"
          >
        </div>
      </div>
      <!-- Цветовая палитра -->
      <div class="fox-taffy-color-palette">
        <h3 class="fox-taffy-palette-title">
          <i class="fas fa-palette fox-taffy-palette-icon"></i>
          Цветовая палитра
        </h3>
        <p class="fox-taffy-palette-description">
          Официальные цвета Fox Taffy для использования в артах
        </p>
        
        <div class="fox-taffy-colors-grid">
          <div 
            v-for="(color, index) in characterColors" 
            :key="index" 
            class="fox-taffy-color-item"
            :style="{ backgroundColor: '#' + color.hex }"
            @click="copyColor(color)"
            :title="`${color.name}: ${color.hex}`"
          >
            <div class="fox-taffy-color-info">
              <div class="fox-taffy-color-name">{{ color.name }}</div>
              <div class="fox-taffy-color-value">{{ color.hex }}</div>
            </div>
          </div>
        </div>
        
        <!-- Ссылки на художника -->
        <div class="fox-taffy-artist-links">
          <h4 class="fox-taffy-artist-title">Художник: KODY MOORE</h4>
          <div class="fox-taffy-social-links">
            <a 
              v-for="link in artist.socialLinks" 
              :key="link.platform"
              :href="link.url" 
              target="_blank"
              class="fox-taffy-social-link"
            >
              <i :class="link.icon + ' fox-taffy-social-icon'"></i>
              <span>{{ link.platform }}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  
    <!-- Уведомления -->
    <div v-if="notification.show" class="fox-taffy-notification" :class="'fox-taffy-' + notification.type">
      <div class="fox-taffy-notification-content">
        <i :class="getNotificationIcon() + ' fox-taffy-notification-icon'"></i>
        <span>{{ notification.message }}</span>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useNsfwToggle } from '@/composables/useNsfwToggle';
import ReferenceSFW from '@/assets/Ref/Reference.png';
import ReferenceNSFW from '@/assets/Ref/Reference_NSFW.png';

export default {
  name: 'FoxTaffyReference',
  setup() {
    // Состояние NSFW (синхронизировано с галереей)
    const { showNsfw, toggle: toggleNsfw } = useNsfwToggle();
    
    // Цвета персонажа
    const characterColors = ref([
      { 
        name: 'Основной мех', 
        hex: 'FB8700'
      },
      { 
        name: 'Живот и морда', 
        hex: 'FFFFFF'
      },
      { 
        name: 'Волосы', 
        hex: '00C400'
      },
      { 
        name: 'Левый глаз', 
        hex: '25BCB9'
      },
      { 
        name: 'Правый глаз', 
        hex: '03A9F4'
      },
      { 
        name: 'Подушечки лап', 
        hex: '50DFA7'
      }
    ]);
    
    // Информация о художнике
    const artist = reactive({
      name: 'FireFly Studio',
      socialLinks: [
        { 
          platform: 'VK', 
          url: 'https://vk.com/vladimirrbeast', 
          icon: 'fab fa-vk' 
        },
        { 
          platform: 'FurAffinity', 
          url: 'https://www.furaffinity.net/user/kodymoore', 
          icon: 'fas fa-paw' 
        }
      ]
    });
    
    // Состояние UI
    const notification = reactive({
      show: false,
      message: '',
      type: 'info',
      timeout: null
    });
    
    const colorCopied = ref(false);
    const copiedColorText = ref('');
    
    // Вычисляемые свойства
    const currentReferenceUrl = computed(() => {
      if (showNsfw.value) {
        return ReferenceNSFW;
      }
      return ReferenceSFW;
    });
    
    // Методы
    const toggleReferenceType = () => {
      console.log('🔄 Reference: toggleReferenceType вызван, текущее showNsfw:', showNsfw.value);
      toggleNsfw();
      console.log('✅ Reference: после toggle, новое showNsfw:', showNsfw.value);
    };
    
    const copyColor = (color) => {
      const colorValue = color.hex;
      
      navigator.clipboard.writeText(colorValue)
        .then(() => {
          copiedColorText.value = `${color.name}: ${colorValue}`;
          colorCopied.value = true;
          
          setTimeout(() => {
            colorCopied.value = false;
          }, 2000);
          
          showNotification(`Цвет скопирован: ${colorValue}`, 'success');
        })
        .catch(() => {
          showNotification('Не удалось скопировать цвет', 'error');
        });
    };
    
    const showNotification = (message, type = 'info') => {
      if (notification.timeout) {
        clearTimeout(notification.timeout);
        notification.timeout = null;
      }
      
      notification.message = message;
      notification.type = type;
      notification.show = true;
      
      notification.timeout = setTimeout(() => {
        notification.show = false;
        notification.timeout = null;
      }, 3000);
    };
    
    const getNotificationIcon = () => {
      switch (notification.type) {
        case 'success': return 'fas fa-check-circle';
        case 'error': return 'fas fa-exclamation-circle';
        case 'warning': return 'fas fa-exclamation-triangle';
        default: return 'fas fa-info-circle';
      }
    };
    
    // Хуки жизненного цикла (NSFW состояние инициализируется в composable)
    
    return {
      // Состояние референса
      showNsfw,
      currentReferenceUrl,
      
      // Данные персонажа
      characterColors,
      artist,
      
      // UI состояния
      notification,
      colorCopied,
      copiedColorText,
      
      // Методы
      toggleReferenceType,
      copyColor,
      showNotification,
      getNotificationIcon
    };
  }
};
</script>

<style scoped>
/* Сброс стилей только для этого компонента */
.fox-taffy-reference-section,
.fox-taffy-reference-section * {
  box-sizing: border-box;
}

.fox-taffy-reference-section {
  /* Сброс возможных наследованных стилей */
  all: initial;
  
  /* Установка базовых стилей */
  font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  padding: 0;
  margin-bottom: 3rem;
  
  /* Принудительное переопределение возможных глобальных стилей */
  color: initial !important;
  background: initial !important;
  border: initial !important;
}

.fox-taffy-section-title {
  font-size: 2.2rem;
  margin: 0 0 2rem 0;
  padding: 0;
  color: var(--text-light);
  text-align: center;
  font-weight: 700;
  background: var(--gradient-brand);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  line-height: 1.2;
}

.fox-taffy-section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: var(--gradient-brand);
  border-radius: 2px;
}

.fox-taffy-reference-container {
  margin: 0 0 2rem 0;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 2rem;
  align-items: start;
}

/* Контейнер изображения референса */
.fox-taffy-reference-image-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fox-taffy-reference-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background: rgb(var(--white-rgb) / 0.05);
  border-radius: 0.75rem;
  border: 1px solid rgb(var(--white-rgb) / 0.1);
  transition: var(--transition);
}

.fox-taffy-reference-switch:hover {
  background: rgb(var(--white-rgb) / 0.08);
  transform: scale(1.02);
}

.fox-taffy-switch-label {
  font-size: 1rem;
  color: var(--text-muted);
  font-weight: 600;
  margin: 0;
  padding: 0;
  transition: var(--transition);
}

.fox-taffy-switch-label.fox-taffy-active {
  color: var(--text-light);
  transform: scale(1.1);
}

.fox-taffy-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 32px;
}

.fox-taffy-switch-input {
  opacity: 0;
  width: 0;
  height: 0;
  margin: 0;
  padding: 0;
}

.fox-taffy-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgb(var(--accent-green-rgb) / 0.2);
  border-radius: 32px;
  border: 1px solid rgb(var(--accent-green-rgb) / 0.4);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fox-taffy-slider:hover {
  background: rgb(var(--accent-green-rgb) / 0.3);
  border-color: rgb(var(--accent-green-rgb) / 0.6);
}

.fox-taffy-slider:before {
  position: absolute;
  content: "";
  height: 24px;
  width: 24px;
  left: 4px;
  bottom: 3px;
  background: var(--accent-green);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgb(var(--accent-green-rgb) / 0.5);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fox-taffy-switch-input:checked + .fox-taffy-slider {
  background: rgba(255, 107, 107, 0.3);
  border-color: rgba(255, 107, 107, 0.6);
}

.fox-taffy-switch-input:checked + .fox-taffy-slider:hover {
  background: rgba(255, 107, 107, 0.4);
  border-color: rgba(255, 107, 107, 0.8);
}

.fox-taffy-switch-input:checked + .fox-taffy-slider:before {
  transform: translateX(28px);
  background: var(--danger);
  box-shadow: 0 2px 12px rgba(255, 107, 107, 0.6);
}

.fox-taffy-image-wrapper {
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  background: rgb(var(--white-rgb) / 0.05);
}

.fox-taffy-reference-image {
  width: 100%;
  height: auto;
  display: block;
  border: none;
  margin: 0;
  padding: 0;
}

/* Анимация переключения NSFW/SFW */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

/* Информация о референсе */
.fox-taffy-reference-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: rgb(var(--white-rgb) / 0.05);
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid rgb(var(--white-rgb) / 0.1);
}

.fox-taffy-info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0;
  padding: 0;
}

.fox-taffy-info-item span {
  margin: 0;
  padding: 0;
}

.fox-taffy-icon {
  color: var(--accent-orange);
  width: 16px;
  text-align: center;
}

/* Цветовая палитра */
.fox-taffy-color-palette {
  background: rgb(var(--white-rgb) / 0.05);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  border: 1px solid rgb(var(--white-rgb) / 0.1);
}

.fox-taffy-palette-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.3rem;
  margin: 0 0 0.5rem 0;
  padding: 0;
  color: var(--text-light);
  font-weight: 700;
  line-height: 1.2;
}

.fox-taffy-palette-icon {
  color: var(--accent-orange);
}

.fox-taffy-palette-description {
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 1.5rem 0;
  padding: 0;
}

.fox-taffy-colors-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.fox-taffy-color-item {
  position: relative;
  aspect-ratio: 1.5;
  border-radius: var(--radius-sm);
  cursor: pointer;
  border: 2px solid transparent;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: border-color 0.3s ease;
}

.fox-taffy-color-item:hover {
  border-color: rgb(var(--white-rgb) / 0.3);
}

.fox-taffy-color-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
  text-align: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.fox-taffy-color-item:hover .fox-taffy-color-info {
  opacity: 1;
}

.fox-taffy-color-name {
  font-size: 0.8rem;
  font-weight: 600;
  margin: 0 0 0.2rem 0;
  padding: 0;
}

.fox-taffy-color-value {
  font-size: 0.7rem;
  font-family: 'Courier New', 'Consolas', monospace;
  opacity: 0.9;
  margin: 0;
  padding: 0;
}

/* Ссылки на художника */
.fox-taffy-artist-links {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgb(var(--white-rgb) / 0.1);
}

.fox-taffy-artist-title {
  margin: 0 0 1rem 0;
  padding: 0;
  color: var(--text-light);
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.2;
}

.fox-taffy-social-links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.fox-taffy-social-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
  border-radius: var(--radius-sm);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid transparent;
  background: rgb(var(--white-rgb) / 0.05);
  color: var(--text-light);
  transition: var(--transition);
}

.fox-taffy-social-link:hover {
  background: rgb(var(--white-rgb) / 0.1);
  border-color: rgb(var(--white-rgb) / 0.2);
  text-decoration: none;
  color: var(--text-light);
}

.fox-taffy-social-icon {
  font-size: 1.2rem;
  width: 20px;
  text-align: center;
}

/* Уведомления */
.fox-taffy-notification {
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  z-index: 100;
  max-width: 360px;
  min-width: min(320px, calc(100vw - 2rem));
  padding: 0.9rem 1rem;
  border-radius: var(--radius-md);
  color: #fff;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.35);
  border: 1px solid rgb(var(--white-rgb) / 0.14);
  animation: fox-taffy-slide-in 0.28s ease-out;
}

@keyframes fox-taffy-slide-in {
  from {
    opacity: 0;
    transform: translateX(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

.fox-taffy-notification.fox-taffy-error {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.92), rgba(239, 68, 68, 0.82));
}

.fox-taffy-notification.fox-taffy-warning {
  background: linear-gradient(135deg, rgba(202, 138, 4, 0.95), rgba(245, 158, 11, 0.82));
}

.fox-taffy-notification.fox-taffy-info {
  background: linear-gradient(135deg, rgba(14, 116, 144, 0.92), rgba(59, 130, 246, 0.82));
}

.fox-taffy-notification.fox-taffy-success {
  background: linear-gradient(135deg, rgba(22, 163, 74, 0.9), rgba(34, 197, 94, 0.82));
}

.fox-taffy-notification-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  font-weight: 700;
}

.fox-taffy-notification-content span {
  margin: 0;
  padding: 0;
}

.fox-taffy-notification-icon {
  font-size: 1.1rem;
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: rgb(var(--white-rgb) / 0.14);
  color: #fff;
}

.fox-taffy-notification.fox-taffy-error .fox-taffy-notification-icon {
  color: #fff;
}

.fox-taffy-notification.fox-taffy-warning .fox-taffy-notification-icon {
  color: #fff;
}

.fox-taffy-notification.fox-taffy-info .fox-taffy-notification-icon {
  color: #fff;
}

.fox-taffy-notification.fox-taffy-success .fox-taffy-notification-icon {
  color: #fff;
}

/* Адаптивность */
@media (max-width: 1024px) {
  .fox-taffy-reference-container {
    grid-template-columns: 1fr 280px;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .fox-taffy-reference-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .fox-taffy-colors-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .fox-taffy-notification {
    left: 1rem;
    right: 1rem;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .fox-taffy-section-title {
    font-size: 1.8rem;
  }
  
  .fox-taffy-reference-switch {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .fox-taffy-colors-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
  
  .fox-taffy-color-palette {
    padding: 1rem;
  }
}
</style>