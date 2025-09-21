<template>
  <!-- Референс фурсоны -->
  <div class="section reference-section" id="reference">
    <h2 class="section-title">Референс фурсоны</h2>
    <div class="reference-container">
      <!-- Основное изображение референса с переходом в галерею -->
      <div class="reference-main">
        <div class="reference-image" @click="$router.push('/gallery')">
          <img src="https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/reference.png" alt="Fox Taffy Ref Sheet">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReferenceSection',
  data() {
    return {
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
  methods: {
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