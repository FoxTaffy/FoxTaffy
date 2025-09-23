<template>
  <div class="character-evolution">
    <!-- Заголовок -->
    <div class="hero-section">
      <div class="hero-background"></div>
      <div class="hero-content">
        <div class="character-avatar">
          <img :src="character.currentAvatar" :alt="character.name" />
          <div class="avatar-glow"></div>
        </div>
        <h1 class="character-name">{{ character.name }}</h1>
        <p class="character-description">{{ character.description }}</p>
        <div class="character-stats">
          <div class="stat">
            <span class="stat-label">Создан:</span>
            <span class="stat-value">{{ character.createdYear }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Версий:</span>
            <span class="stat-value">{{ evolutionSteps.length }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Вид:</span>
            <span class="stat-value">{{ character.species }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Временная шкала эволюции -->
    <div class="evolution-timeline">
      <h2 class="timeline-title">
        <span class="title-icon">🎨</span>
        История эволюции
      </h2>
      
      <div class="timeline-container">
        <div class="timeline-line"></div>
        
        <div 
          v-for="(step, index) in evolutionSteps" 
          :key="index"
          class="timeline-item"
          :class="{ 'timeline-item-reverse': index % 2 === 1 }"
        >
          <div class="timeline-marker">
            <div class="marker-dot"></div>
            <div class="marker-year">{{ step.year }}</div>
          </div>
          
          <div class="timeline-card">
            <div class="card-header">
              <h3 class="version-title">{{ step.version }}</h3>
              <div class="version-badge">v{{ index + 1 }}.0</div>
            </div>
            
            <div class="card-content">
              <div class="artwork-section">
                <div class="artwork-placeholder" v-if="!step.artwork">
                  <div class="placeholder-icon">🖼️</div>
                  <p>Место для арта</p>
                </div>
                <img 
                  v-else 
                  :src="step.artwork" 
                  :alt="`${character.name} - ${step.version}`"
                  class="artwork-image"
                />
              </div>
              
              <div class="changes-section">
                <h4 class="changes-title">Изменения и улучшения:</h4>
                <ul class="changes-list">
                  <li v-for="change in step.changes" :key="change" class="change-item">
                    <span class="change-dot"></span>
                    {{ change }}
                  </li>
                </ul>
              </div>
              
              <div class="notes-section" v-if="step.notes">
                <h4 class="notes-title">Заметки:</h4>
                <p class="notes-text">{{ step.notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Галерея сравнения -->
    <div class="comparison-gallery">
      <h2 class="gallery-title">
        <span class="title-icon">📸</span>
        Галерея сравнения
      </h2>
      
      <div class="gallery-grid">
        <div 
          v-for="(step, index) in evolutionSteps" 
          :key="index"
          class="gallery-item"
          @click="selectedImage = step"
        >
          <div class="gallery-card">
            <div class="gallery-image-container">
              <div class="image-placeholder" v-if="!step.artwork">
                <span>{{ step.year }}</span>
              </div>
              <img 
                v-else 
                :src="step.artwork" 
                :alt="step.version"
                class="gallery-image"
              />
            </div>
            <div class="gallery-info">
              <h4 class="gallery-version">{{ step.version }}</h4>
              <p class="gallery-year">{{ step.year }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно для просмотра -->
    <div v-if="selectedImage" class="modal-overlay" @click="selectedImage = null">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="selectedImage = null">✕</button>
        <div class="modal-image-container">
          <img 
            :src="selectedImage.artwork" 
            :alt="selectedImage.version"
            class="modal-image"
          />
        </div>
        <div class="modal-info">
          <h3>{{ selectedImage.version }}</h3>
          <p>{{ selectedImage.year }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CharacterEvolution',
  data() {
    return {
      selectedImage: null,
      character: {
        name: 'Fox Taffy',
        description: 'Всем привет! Сегодня я расскажу увлекательную историю эволюции моей фурсоны Fox Taffy — персонажа, который стал неотъемлемой частью моей жизни и идентичности в фурри-сообществе. За несколько лет мой персонаж прошел удивительный путь трансформации, отражая моё творческое развитие и поиск собственного стиля.',
        species: 'Лиса',
        createdYear: '2018',
        currentAvatar: 'src/assets/Image/Avatar.jpg'
      },
      evolutionSteps: [
        {
          year: '2019',
          version: 'Первоначальный дизайн',
          artwork: 'https://plugjsubjcfblzkabjia.supabase.co/storage/v1/object/public/gallery/Taffy/1taffy.jpg',
          changes: [
            'Лаймово-голубые лапы и волосы',
            'Очки и цветки на шее',
            'Зелёное пузо'
          ],
          notes: 'Был немного вдохнавлён лапами маскота фифы 2018 Забиваки. Имя было выбрано в честь русской писательницы Надежды Тэффи, которая славилась своим остроумием и уникальным стилем.'
        },
        {
          year: '2020',
          version: 'Доработка и первый арт',
          artwork: 'https://plugjsubjcfblzkabjia.supabase.co/storage/v1/object/public/gallery/Taffy/old.jpg',
          changes: [
            'Нос с чёрного на голубой',
            'Волосы убраны',
            'Изменён хвост',
            'Белый цвет лап спущены до пальцев',
            'Белые руки'
          ],
          notes: 'После отзывов от сообщества и глубоких размышлений о дизайне, в 2020 году Тэффи ощутил первые серьёзные изменения.'
        },
        {
          year: '2022',
          version: 'Новый стиль',
          artwork: 'https://plugjsubjcfblzkabjia.supabase.co/storage/v1/object/public/gallery/Taffy/2022_new_style.jpg',
          changes: [
            'Кардинально изменен художественный стиль',
            'Добавлены уникальные особенности',
            'Переработана цветовая палитра'
          ],
          notes: 'Поиск собственного уникального стиля в изображении персонажа.'
        },
        {
          year: '2023',
          version: 'Детализация',
          artwork: 'https://plugjsubjcfblzkabjia.supabase.co/storage/v1/object/public/gallery/Taffy/2023_detailed.jpg',
          changes: [
            'Добавлено множество мелких деталей',
            'Проработана текстура меха',
            'Создана backstory персонажа'
          ],
          notes: 'Фокус на деталях и создании глубокой истории персонажа.'
        },
        {
          year: '2024',
          version: 'Современная версия',
          artwork: 'https://plugjsubjcfblzkabjia.supabase.co/storage/v1/object/public/gallery/Taffy/2024_current.jpg',
          changes: [
            'Финальные штрихи в дизайне',
            'Создание альтернативных образов',
            'Разработка мерчандайза'
          ],
          notes: 'Текущая версия персонажа с планами на будущее развитие.'
        }
      ]
    }
  }
}
</script>

<style scoped>
.character-evolution {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #e2e8f0;
}

/* Hero Section */
.hero-section {
  position: relative;
  padding: 80px 20px;
  text-align: center;
  color: white;
  overflow: hidden;
  background: linear-gradient(135deg, #16a085 0%, #e67e22 100%);
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}

.character-avatar {
  position: relative;
  display: inline-block;
  margin-bottom: 30px;
}

.character-avatar img {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 5px solid rgba(255,255,255,0.3);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}

.avatar-glow {
  display: none;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.character-name {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 15px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.character-description {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 30px;
}

.character-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.stat {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
}

/* Timeline Section */
.evolution-timeline {
  background: #2d3748;
  padding: 80px 20px;
}

.timeline-title, .gallery-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 60px;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.title-icon {
  font-size: 2rem;
}

.timeline-container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
}

.timeline-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(to bottom, #16a085, #e67e22);
  transform: translateX(-50%);
}

.timeline-item {
  position: relative;
  margin-bottom: 100px;
  display: flex;
  align-items: center;
}

.timeline-item-reverse {
  flex-direction: row-reverse;
}

.timeline-marker {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 3;
}

.marker-dot {
  width: 20px;
  height: 20px;
  background: #16a085;
  border-radius: 50%;
  margin: 0 auto 10px;
  border: 4px solid #2d3748;
  box-shadow: 0 4px 8px rgba(0,0,0,0.4);
}

.marker-year {
  background: #2d3748;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  color: #16a085;
  border: 2px solid #16a085;
  font-size: 0.9rem;
}

.timeline-card {
  width: 45%;
  background: #1a202c;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  border: 1px solid #4a5568;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.timeline-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}

.timeline-item-reverse .timeline-card {
  margin-left: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.version-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0;
}

.version-badge {
  background: linear-gradient(135deg, #16a085, #e67e22);
  color: white;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.artwork-section {
  margin-bottom: 25px;
}

.artwork-placeholder {
  background: #4a5568;
  border: 2px dashed #718096;
  border-radius: 15px;
  padding: 40px;
  text-align: center;
  color: #a0aec0;
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: 10px;
}

.artwork-image {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.changes-title, .notes-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #cbd5e0;
  margin-bottom: 15px;
}

.changes-list {
  list-style: none;
  padding: 0;
}

.change-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
  padding-left: 20px;
  position: relative;
  color: #a0aec0;
}

.change-dot {
  position: absolute;
  left: 0;
  top: 8px;
  width: 8px;
  height: 8px;
  background: #16a085;
  border-radius: 50%;
}

.notes-text {
  color: #9ca3af;
  font-style: italic;
  line-height: 1.6;
}

/* Gallery Section */
.comparison-gallery {
  background: #1a202c;
  padding: 80px 20px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.gallery-item {
  cursor: pointer;
}

.gallery-card {
  background: #2d3748;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #4a5568;
}

.gallery-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.4);
}

.gallery-image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.image-placeholder {
  height: 100%;
  background: linear-gradient(135deg, #4a5568, #2d3748);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #cbd5e0;
  font-weight: 600;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gallery-card:hover .gallery-image {
  transform: scale(1.1);
}

.gallery-info {
  padding: 20px;
  text-align: center;
}

.gallery-version {
  font-size: 1.1rem;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 5px;
}

.gallery-year {
  color: #9ca3af;
  font-size: 0.9rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: #2d3748;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #4a5568;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0,0,0,0.7);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.modal-close:hover {
  background: rgba(0,0,0,0.9);
}

.modal-image {
  width: 100%;
  height: auto;
  max-height: 70vh;
  object-fit: contain;
}

.modal-info {
  padding: 20px;
  text-align: center;
  color: #e2e8f0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .character-name {
    font-size: 2rem;
  }
  
  .character-stats {
    gap: 20px;
  }
  
  .timeline-line {
    left: 30px;
  }
  
  .timeline-marker {
    left: 30px;
  }
  
  .timeline-card {
    width: calc(100% - 80px);
    margin-left: 80px;
  }
  
  .timeline-item-reverse .timeline-card {
    margin-left: 80px;
  }
  
  .gallery-grid {
    grid-template-columns: 1fr;
  }
}
</style>