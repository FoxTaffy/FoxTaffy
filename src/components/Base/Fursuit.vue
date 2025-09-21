<template>
  <!-- Мой фурсьют -->
  <div class="section fursuit-section" id="fursuit">
    <h2 class="section-title">Мой фурсьют</h2>
    <div class="fursuit-container">
      <div class="fursuit-gallery">
        <div class="main-fursuit-image">
          <img :src="currentFursuitImage" alt="Fox Taffy Fursuit">
        </div>
        <div class="fursuit-thumbnails">
          <div 
            v-for="(image, index) in fursuitImages" 
            :key="index" 
            class="thumbnail" 
            :class="{ active: currentFursuitIndex === index }"
            @click="setCurrentFursuitImage(index)"
          >
            <img :src="image" :alt="`Fox Taffy Fursuit ${index + 1}`">
          </div>
        </div>
      </div>
      <div class="fursuit-info">
        <div class="fursuit-details-grid">
          <div class="fursuit-detail-item">
            <div class="detail-icon">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="detail-content">
              <span class="detail-label">Создан</span>
              <span class="detail-value">Март 2025</span>
            </div>
          </div>
          <div class="fursuit-detail-item">
            <div class="detail-icon">
              <i class="fas fa-tag"></i>
            </div>
            <div class="detail-content">
              <span class="detail-label">Тип</span>
              <span class="detail-value">Патриал</span>
            </div>
          </div>
          
          <div class="fursuit-detail-item">
            <div class="detail-icon">
              <i class="fas fa-heart"></i>
            </div>
            <div class="detail-content">
              <span class="detail-label">Цена (да да)</span>
              <span class="detail-value">200,000 руб.</span>
            </div>
          </div>
        </div>
        
        <div class="fursuit-description">
          <p>Это моя реализация оригинального персонажа в виде фурсьюта. Особое внимание было уделено деталям и соответствию референсу. Костюм сделан из качественного меха (шегги) с использованием реалистичных цветов.</p>
        </div>
        
        <div class="studio-card">
          <div class="studio-avatar">
            <img :src="fireflyImage" alt="Мастерская FireFly" class="avatar-img">
          </div>
          <div class="studio-info">
            <h4 class="studio-name">Мастерская FireFly</h4>
            <p class="studio-desc">Fursuit Making Studio</p>
            <div class="studio-social-links">
              <a href="https://instagram.com/fireflystudiofurry" class="social-btn instagram" title="Instagram" target="_blank">
                <i class="fab fa-instagram"></i>
              </a>
              <a href="https://t.me/fireflystudiofurry" class="social-btn telegram" title="Telegram" target="_blank">
                <i class="fab fa-telegram"></i>
              </a>
              <a href="https://vk.com/fireflystudiofurry" class="social-btn vk" title="VK" target="_blank">
                <i class="fab fa-vk"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import fursuit1 from '@/assets/fursuit/fursuit1.jpg';
import fursuit2 from '@/assets/fursuit/fursuit2.jpg';
import fursuit3 from '@/assets/fursuit/fursuit3.jpg';
import fireflyImage from '@/assets/Image/FireFly.jpg';

export default {
  name: 'FursuitSection',
  data() {
    return {
      currentFursuitIndex: 0,
      // Используем импортированные изображения вместо URL
      fursuitImages: [
        fursuit1,
        fursuit2,
        fursuit3
      ],
      // Добавляем логотип мастерской
      fireflyImage
    }
  },
  computed: {
    currentFursuitImage() {
      return this.fursuitImages[this.currentFursuitIndex];
    }
  },
  methods: {
    setCurrentFursuitImage(index) {
      this.currentFursuitIndex = index;
    }
  }
}
</script>