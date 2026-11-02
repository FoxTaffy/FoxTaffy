<template>
  <!-- Референс фурсоны -->
  <div class="section reference-section" id="reference">
    <h2 class="section-title">Референс фурсоны</h2>
    <div class="reference-container">
      <!-- Основное изображение референса -->
      <div class="reference-main">
        <div class="reference-image" @click="openLightbox">
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
          <button type="button" class="btn palette-copy" @click="copyPalette">
            <i class="fas fa-copy"></i>
            <span>Скопировать всю палитру</span>
          </button>
          <div v-if="copiedMessage" class="color-copied-notification" role="status">
            {{ copiedMessage }}
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
            <div class="btn-actions">
              <router-link to="/taffy" class="btn btn-accent">
                <i class="fas fa-history"></i>
                <span>Полная история</span>
              </router-link>
              <router-link to="/gallery" class="btn">
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
    <Transition name="lightbox">
      <div v-if="showLightbox" class="lightbox-overlay" role="dialog" aria-modal="true" aria-label="Референс" @click="closeLightbox">
        <button class="lightbox-close" aria-label="Закрыть" @click="closeLightbox">
          <i class="fas fa-times"></i>
        </button>
        <img :src="ReferenceSFW" alt="Fox Taffy Ref Sheet" class="lightbox-image" @click.stop>
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
      copiedMessage: '',
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
    clearTimeout(this.copyTimeout);
    document.body.style.overflow = '';
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
    // Код цвета копируется без «#» — так его принимают редакторы и заказчики артов
    copyColorCode(colorHex) {
      this.copyText(colorHex.replace(/^#/, ''), 'Код цвета скопирован!')
    },
    copyPalette() {
      const lines = this.colorPalette.map(({ name, hex }) => `${name}: ${hex}`)
      this.copyText(lines.join('\n'), 'Палитра скопирована!')
    },
    async copyText(text, message) {
      try {
        await navigator.clipboard.writeText(text)
      } catch {
        return
      }
      this.copiedMessage = message
      clearTimeout(this.copyTimeout)
      this.copyTimeout = setTimeout(() => { this.copiedMessage = '' }, 2000)
    }
  }
}
</script>
