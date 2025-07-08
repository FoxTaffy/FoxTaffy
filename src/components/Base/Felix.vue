<template>
  <!-- Моя половинка -->
  <div class="section felix-section">
    <h2 class="section-title">Моя половинка</h2>
    <div class="felix-container">
      <div class="felix-gallery">
        <div class="felix-main-image-container">
          <img :src="currentPartnerImage" alt="Felix Law" class="felix-main-image">
          <div class="felix-badge">
            <i class="fas fa-heart"></i>
            <span id="relationship-time">{{ relationshipDuration }}</span>
          </div>
        </div>
        <div class="felix-thumbnails">
          <div 
            v-for="(image, index) in partnerImages" 
            :key="index" 
            class="felix-thumbnail" 
            :class="{ active: currentPartnerIndex === index }"
            @click="setCurrentPartnerImage(index)"
          >
            <img :src="image" :alt="`Felix Law ${index + 1}`">
          </div>
        </div>
        
        <!-- Кнопка истории перенесена под галерею -->
        <router-link to="/felix" class="story-button">
          <div class="story-icon-container">
            <i class="fas fa-book-heart"></i>
          </div>
          <div class="story-content">
            <div class="story-title">История любви</div>
            <div class="story-description">Как начиналась наша история</div>
          </div>
          <div class="arrow-container">
            <i class="fas fa-arrow-right"></i>
          </div>
          <div class="pulse-effect"></div>
        </router-link>
      </div>
      
      <div class="felix-details">
        <div class="felix-header">
          <h3 class="felix-name">Felix Law</h3>
          <div class="felix-species">
            <i class="fas fa-paw"></i>
            <span>Енот</span>
          </div>
        </div>
        
        <div class="felix-quote">
          <i class="fas fa-quote-left felix-quote-icon"></i>
          <p class="felix-quote-text">"Вместе создаём наш пушистый мир, полный приключений!"</p>
        </div>
        
        <div class="felix-bio">
          <p>Мой любимый енотик Felix всегда поддерживает мои творческие идеи и приключения. Вместе мы участвуем в фурри-конвенциях, путешествуем и создаем множество ярких воспоминаний.</p>
        </div>
        
        <div class="felix-features">
          <div class="felix-feature-item">
            <div class="felix-feature-icon">
              <i class="fas fa-laptop-code"></i>
            </div>
            <div class="felix-feature-text">
              <span>IT специалист</span>
            </div>
          </div>
          
          <div class="felix-feature-item">
            <div class="felix-feature-icon">
              <i class="fas fa-gamepad"></i>
            </div>
            <div class="felix-feature-text">
              <span>Геймер</span>
            </div>
          </div>
          
          <div class="felix-feature-item">
            <div class="felix-feature-icon">
              <i class="fas fa-globe-americas"></i>
            </div>
            <div class="felix-feature-text">
              <span>Путешественник</span>
            </div>
          </div>
        </div>
        
        <div class="felix-memories">
          <h4 class="felix-memories-title">Памятные моменты</h4>
          <div class="felix-memory-list">
            <div class="felix-memory-item">
              <i class="fas fa-mountain"></i>
              <span>Путешествие на Таганай (2024)</span>
            </div>
            <div class="felix-memory-item">
              <i class="fas fa-home"></i>
              <span>Первый совместный переезд (2023)</span>
            </div>
            <div class="felix-memory-item">
              <i class="fas fa-pencil-alt"></i>
              <span>Создание совместного персонажа (2022)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Импортируем изображения партнера
import felix1 from '@/assets/Felix/Felix.jpg';
import felix2 from '@/assets/Felix/Felix2.jpg';
import felix3 from '@/assets/Felix/Felix3.jpg';

export default {
  name: 'PartnerSection',
  data() {
    return {
      // Галерея партнера
      currentPartnerIndex: 0,
      // Используем импортированные изображения
      partnerImages: [
        felix1,
        felix2,
        felix3
      ]
    }
  },
  computed: {
    currentPartnerImage() {
      return this.partnerImages[this.currentPartnerIndex];
    },
    relationshipDuration() {
      return this.calculateRelationshipTime();
    }
  },
  methods: {
    // Методы для галереи партнера
    setCurrentPartnerImage(index) {
      this.currentPartnerIndex = index;
    },
    
    // Методы для расчета продолжительности отношений
    calculateRelationshipTime() {
      // Дата начала отношений (год, месяц-1, день)
      const startDate = new Date(2020, 6, 27); // 27 июля 2020 года
      const currentDate = new Date();
      
      let years = currentDate.getFullYear() - startDate.getFullYear();
      let months = currentDate.getMonth() - startDate.getMonth();
      
      // Корректировка, если текущий месяц раньше месяца начала отношений
      if (months < 0) {
        years--;
        months += 12;
      }
      
      // Форматируем строку в зависимости от значений
      let timeString = '';
      if (years > 0) {
        timeString += years + ' ' + this.pluralizeYears(years) + ' ';
      }
      if (months > 0 || years === 0) {
        timeString += months + ' ' + this.pluralizeMonths(months);
      }
      
      return timeString.trim();
    },
    
    pluralizeYears(count) {
      if (count === 1) return 'год';
      if (count >= 2 && count <= 4) return 'года';
      return 'лет';
    },
    
    pluralizeMonths(count) {
      if (count === 1) return 'месяц';
      if (count >= 2 && count <= 4) return 'месяца';
      return 'месяцев';
    },
    
    updateRelationshipTime() {
      const timeElement = document.getElementById('relationship-time');
      if (timeElement) {
        timeElement.textContent = this.calculateRelationshipTime();
      }
    }
  },
  mounted() {
    // Обновляем время отношений при загрузке
    this.updateRelationshipTime();
    
    // Устанавливаем таймер для обновления в полночь
    const setMidnightTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const timeToMidnight = tomorrow - now;
      
      setTimeout(() => {
        this.updateRelationshipTime();
        setMidnightTimer(); // Рекурсивно устанавливаем таймер на следующий день
      }, timeToMidnight);
    };
    
    setMidnightTimer();
    
    // Добавим анимацию для кнопки истории после загрузки компонента
    setTimeout(() => {
      const storyButton = document.querySelector('.story-button');
      if (storyButton) {
        storyButton.classList.add('animated');
      }
    }, 1000);
  }
}
</script>

<style scoped>
/* Стили кнопки истории */
.story-button {
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 1rem;
  background: linear-gradient(45deg, rgba(147, 112, 219, 0.2), rgba(64, 224, 208, 0.2));
  border-radius: 1rem;
  position: relative;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(147, 112, 219, 0.3);
  z-index: 2;
  margin-top: 1rem;
  width: 100%;
}

.story-button:hover {
  background: linear-gradient(45deg, rgba(147, 112, 219, 0.3), rgba(64, 224, 208, 0.3));
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 10px 25px rgba(147, 112, 219, 0.3);
}

.story-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    120deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transform: translateX(-100%);
  transition: all 0.8s ease;
}

.story-button:hover::before {
  transform: translateX(100%);
}

.story-icon-container {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #9370db, #40e0d0);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
  box-shadow: 0 5px 15px rgba(147, 112, 219, 0.4);
  position: relative;
  overflow: hidden;
  transition: all 0.5s ease;
}

.story-button:hover .story-icon-container {
  transform: rotate(15deg) scale(1.1);
}

.story-icon-container i {
  font-size: 1.3rem;
  color: white;
  position: relative;
  z-index: 2;
}

/* Используем Font Awesome, но создадим кастомную иконку сердца с книгой */
.fa-book-heart::before {
  content: '\f02d'; /* код иконки книги */
  position: relative;
}

.fa-book-heart::after {
  content: '\f004'; /* код иконки сердца */
  position: absolute;
  font-size: 0.6em;
  right: 0;
  bottom: 0;
  color: #ff7b7b;
  text-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
}

.story-content {
  flex: 1;
}

.story-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.2rem;
  color: #9370db;
  transition: all 0.3s ease;
}

.story-button:hover .story-title {
  color: #40e0d0;
}

.story-description {
  font-size: 0.85rem;
  color: var(--text-muted, #a0a0a0);
  transition: all 0.3s ease;
}

.story-button:hover .story-description {
  color: var(--text-light, #f2f2f2);
}

.arrow-container {
  width: 30px;
  height: 30px;
  background: rgba(147, 112, 219, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s ease;
  position: relative;
  flex-shrink: 0;
  margin-left: 0.75rem;
}

.arrow-container i {
  color: #9370db;
  transition: all 0.3s ease;
}

.story-button:hover .arrow-container {
  background: linear-gradient(135deg, #9370db, #40e0d0);
  transform: translateX(5px);
}

.story-button:hover .arrow-container i {
  color: white;
  transform: translateX(2px);
}

.pulse-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 1rem;
  box-shadow: 0 0 0 0 rgba(147, 112, 219, 0.7);
  animation: pulse 2s infinite;
  opacity: 0;
  z-index: 1;
  pointer-events: none;
}

.story-button.animated .pulse-effect {
  opacity: 1;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(147, 112, 219, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(147, 112, 219, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(147, 112, 219, 0);
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .story-button {
    flex-direction: column;
    text-align: center;
    padding: 0.75rem;
  }
  
  .story-icon-container {
    margin-right: 0;
    margin-bottom: 0.5rem;
    width: 40px;
    height: 40px;
  }
  
  .arrow-container {
    margin-left: 0;
    margin-top: 0.5rem;
  }
  
  .story-title {
    font-size: 1rem;
  }
  
  .story-description {
    font-size: 0.8rem;
  }
}

</style>