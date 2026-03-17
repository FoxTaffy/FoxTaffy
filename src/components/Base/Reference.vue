<template>
  <!-- Референс фурсоны -->
  <div class="section reference-section" id="reference">
    <h2 class="section-title">Референс фурсоны</h2>
    <div class="reference-container">
      <!-- Основное изображение референса -->
      <div class="reference-main">
        <div class="reference-image reference-image--clickable" @click="openLightbox">
          <img :src="ReferenceSFW" alt="Fox Taffy Ref Sheet">
          <div class="reference-image-overlay">
            <i class="fas fa-search-plus"></i>
            <span>Открыть</span>
          </div>
        </div>
        
        <!-- Цветовая палитра персонажа -->
        <div class="color-palette">
          <h4 class="palette-title">Цветовая палитра</h4>
          <div class="palette-container">
            <div 
              v-for="(color, index) in colorPalette" 
              :key="index" 
              class="color-swatch"
              :style="{ backgroundColor: color.hex }"
              @click="copyColorCode(color.hex)"
              @mouseover="activeColor = index"
              @mouseleave="activeColor = null"
            >
              <div class="color-tooltip" :class="{ active: activeColor === index }">
                <div class="color-name">{{ color.name }}</div>
                <div class="color-hex">{{ color.hex }}</div>
                <div class="color-copy-hint">Нажмите, чтобы скопировать</div>
              </div>
            </div>
          </div>
          <div v-if="colorCopied" class="color-copied-notification">
            Код цвета скопирован!
          </div>
        </div>
      </div>
      
      <div class="reference-info">
        <div class="ref-card">
          <div class="ref-header">
            <h3 class="ref-name">Fox Taffy</h3>
            <div class="ref-badges">
              <div class="ref-badge species">20 см</div>
              <div class="ref-badge age">Лис</div>
            </div>
          </div>
          
          <div class="ref-stats">
            <div class="ref-stat-item">
              <div class="stat-icon"><i class="fas fa-mars"></i></div>
              <div class="stat-info">
                <span class="stat-label">Пол</span>
                <span class="stat-value">Мужской (He/him)</span>
              </div>
            </div>
            <div class="ref-stat-item">
              <div class="stat-icon"><i class="fas fa-birthday-cake"></i></div>
              <div class="stat-info">
                <span class="stat-label">День создания фурсоны</span>
                <span class="stat-value">Лето 2020</span>
              </div>
            </div>
          </div>
          
          <div class="ref-description">
            <p>Fox Taffy - яркий, дружелюбный и энергичный лис с уникальной окраской. Его основные цвета - белый, оранжевый и зеленый, что отражается в его стиле и характере.</p>
          </div>
          
          <div class="ref-origin">
            <h4 class="origin-title">История персонажа</h4>
            <p>Персонаж Fox Taffy был создан в 2020 году как отражение моей личности в фурри-мире. С тех пор он постоянно эволюционирует, меняется и обретает новые черты.</p>
            <div class="origin-buttons">
              <router-link to="/taffy" class="origin-btn site">
                <i class="fas fa-history"></i>
                <span>Полная история</span>
              </router-link>
              <router-link to="/gallery" class="origin-btn gallery">
                <i class="fas fa-images"></i>
                <span>Галерея</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Лайтбокс для референса -->
  <Teleport to="body">
    <Transition name="ref-lightbox">
      <div v-if="showLightbox" class="ref-lightbox-overlay" @click="closeLightbox">
        <button class="ref-lightbox-close" @click="closeLightbox">
          <i class="fas fa-times"></i>
        </button>
        <div class="ref-lightbox-content" @click.stop>
          <img :src="ReferenceSFW" alt="Fox Taffy Ref Sheet" class="ref-lightbox-image">
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import ReferenceSFW from '@/assets/Ref/Reference.png';

export default {
  name: 'ReferenceSection',
  data() {
    return {
      ReferenceSFW: ReferenceSFW,
      showLightbox: false,
      activeColor: null,
      colorCopied: false,
      copyTimeout: null,
      colorPalette: [
        { name: 'Белый', hex: '#FFFFFF' },
        { name: 'Бирюзовый', hex: '#50DFA7' },
        { name: 'Зелёный', hex: '#00C400' },
        { name: 'Нос', hex: '#25BCBA' },
        { name: 'Органы', hex: '#008C83' },
        { name: 'Шерсть', hex: '#FB8700' }
      ]
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeyDown);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  },
  methods: {
    openLightbox() {
      this.showLightbox = true;
      document.body.style.overflow = 'hidden';
    },
    closeLightbox() {
      this.showLightbox = false;
      document.body.style.overflow = '';
    },
    handleKeyDown(e) {
      if (e.key === 'Escape' && this.showLightbox) {
        this.closeLightbox();
      }
    },
    copyColorCode(colorHex) {
      // Удаляем символ # из начала hex-кода, если он есть
      const colorCodeWithoutHash = colorHex.startsWith('#') ? colorHex.substring(1) : colorHex;
      
      // Копирование кода цвета в буфер обмена (без символа #)
      navigator.clipboard.writeText(colorCodeWithoutHash)
        .then(() => {
          // Показываем уведомление о копировании
          this.colorCopied = true;
          
          // Очищаем предыдущий таймаут, если он существует
          if (this.copyTimeout) {
            clearTimeout(this.copyTimeout);
          }
          
          // Устанавливаем новый таймаут для скрытия уведомления
          this.copyTimeout = setTimeout(() => {
            this.colorCopied = false;
          }, 2000);
        })
        .catch(err => {
          console.error('Не удалось скопировать текст: ', err);
        });
    }
  }
}
</script>

<style scoped>
/* Кнопка галереи */
.origin-btn.gallery {
  background: linear-gradient(135deg, rgba(78, 205, 196, 0.15), rgba(78, 205, 196, 0.05));
  border: 1px solid rgba(78, 205, 196, 0.4);
  color: #4ecdc4;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-left: 0.5rem;
}
.origin-btn.gallery:hover {
  background: linear-gradient(135deg, rgba(78, 205, 196, 0.3), rgba(78, 205, 196, 0.1));
  border-color: rgba(78, 205, 196, 0.7);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(78, 205, 196, 0.25);
}

/* Оверлей на картинке референса */
.reference-image--clickable {
  position: relative;
  cursor: pointer;
}
.reference-image-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.45);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: inherit;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  pointer-events: none;
}
.reference-image-overlay i {
  font-size: 2rem;
}
.reference-image--clickable:hover .reference-image-overlay {
  opacity: 1;
}

/* Лайтбокс */
.ref-lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  backdrop-filter: blur(8px);
  cursor: pointer;
}
.ref-lightbox-close {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #fff;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10001;
}
.ref-lightbox-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}
.ref-lightbox-content {
  max-width: 90vw;
  max-height: 90vh;
  cursor: default;
}
.ref-lightbox-image {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 0.75rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  display: block;
}

/* Анимации */
.ref-lightbox-enter-active,
.ref-lightbox-leave-active {
  transition: opacity 0.25s ease;
}
.ref-lightbox-enter-from,
.ref-lightbox-leave-to {
  opacity: 0;
}
</style>
