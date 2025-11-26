<template>
  <div class="event-details-page">
    <!-- Баннер -->
    <div class="event-hero">
      <div class="hero-overlay"></div>
      <div class="hero-image" :style="{ backgroundImage: `url(${event.banner_url})` }"></div>
      <div class="hero-content">
        <router-link to="/events" class="back-button">
          <i class="fas fa-arrow-left"></i>
          <span>Назад</span>
        </router-link>

        <div class="hero-info">
          <div class="event-badges">
            <span class="event-status completed">
              <i class="fas fa-check"></i>
              Посетил
            </span>
            <span class="event-type-badge">
              <i class="fas fa-crown"></i>
              Конвент
            </span>
          </div>

          <h1 class="event-title">{{ event.name }}</h1>
          <p class="event-subtitle">{{ event.subtitle }}</p>

          <div class="hero-meta">
            <span class="meta-item">
              <i class="fas fa-calendar-alt"></i>
              {{ formatDate(event.event_date) }}
            </span>
            <span class="meta-item">
              <i class="fas fa-map-marker-alt"></i>
              {{ event.location }}
            </span>
            <span class="meta-item">
              <i class="fas fa-users"></i>
              {{ event.attendees_count }}+ участников
            </span>
          </div>

          <div class="hero-rating">
            <div class="rating-stars-large">
              <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ 'active': n <= event.my_rating }"></i>
            </div>
            <span class="rating-value">{{ event.my_rating }}/5</span>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <!-- Блоки в ряд -->
      <div class="content-grid">
        <!-- Левая колонка -->
        <div class="content-left">
          <!-- О мероприятии -->
          <div class="event-card">
            <h3 class="card-title">
              <i class="fas fa-info-circle"></i>
              О мероприятии
            </h3>
            <p class="card-text">{{ event.description }}</p>
            <p class="card-text">Это была потрясающая вечеринка в ретро-стиле 2000-х! Организаторы создали невероятную атмосферу ностальгии с музыкой, играми и декорациями той эпохи.</p>
          </div>

          <!-- Фотографии -->
          <div class="event-card">
            <h3 class="card-title">
              <i class="fas fa-images"></i>
              Фотографии
              <span class="photos-count">{{ photos.length }}</span>
            </h3>
            <div class="photos-grid">
              <div
                v-for="(photo, index) in photos"
                :key="index"
                class="photo-item"
                @click="openPhoto(index)"
              >
                <img :src="photo" :alt="`Фото ${index + 1}`" />
                <div class="photo-overlay">
                  <i class="fas fa-search-plus"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Плюсы и минусы -->
          <div class="event-card">
            <h3 class="card-title">
              <i class="fas fa-balance-scale"></i>
              Мое мнение
            </h3>
            <div class="pros-cons-grid">
              <div class="pros-block">
                <h4 class="block-subtitle pros">
                  <i class="fas fa-thumbs-up"></i>
                  Плюсы
                </h4>
                <ul class="opinion-list">
                  <li v-for="(pro, i) in pros" :key="i">
                    <i class="fas fa-check"></i>
                    {{ pro }}
                  </li>
                </ul>
              </div>
              <div class="cons-block">
                <h4 class="block-subtitle cons">
                  <i class="fas fa-thumbs-down"></i>
                  Минусы
                </h4>
                <ul class="opinion-list">
                  <li v-for="(con, i) in cons" :key="i">
                    <i class="fas fa-times"></i>
                    {{ con }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Правая колонка -->
        <div class="content-right">
          <!-- Рейтинг по категориям -->
          <div class="event-card compact">
            <h3 class="card-title">
              <i class="fas fa-star"></i>
              Оценки
            </h3>
            <div class="ratings-list">
              <div v-for="rating in ratings" :key="rating.label" class="rating-row">
                <span class="rating-label">{{ rating.label }}</span>
                <div class="rating-bar">
                  <div class="rating-fill" :style="{ width: (rating.value / 5 * 100) + '%' }"></div>
                </div>
                <span class="rating-num">{{ rating.value }}</span>
              </div>
            </div>
            <div class="overall-score">
              <span>Общая оценка</span>
              <strong>{{ averageRating }}/5</strong>
            </div>
          </div>

          <!-- Особенности -->
          <div class="event-card compact">
            <h3 class="card-title">
              <i class="fas fa-star"></i>
              Особенности
            </h3>
            <div class="features-list">
              <div class="feature-item">
                <i class="fas fa-music"></i>
                <span>Музыка 2000-х</span>
              </div>
              <div class="feature-item">
                <i class="fas fa-gamepad"></i>
                <span>Ретро-игры</span>
              </div>
              <div class="feature-item">
                <i class="fas fa-tree"></i>
                <span>Лесная локация</span>
              </div>
              <div class="feature-item">
                <i class="fas fa-camera"></i>
                <span>Фотозоны</span>
              </div>
            </div>
          </div>

          <!-- Ссылки -->
          <div class="event-card compact">
            <h3 class="card-title">
              <i class="fas fa-link"></i>
              Ссылки
            </h3>
            <div class="links-list">
              <a href="#" class="link-item" target="_blank">
                <i class="fab fa-telegram"></i>
                <span>Telegram</span>
              </a>
              <a href="#" class="link-item" target="_blank">
                <i class="fab fa-vk"></i>
                <span>ВКонтакте</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно для фото -->
    <div v-if="selectedPhoto !== null" class="photo-modal" @click="closePhoto">
      <button class="modal-close" @click="closePhoto">
        <i class="fas fa-times"></i>
      </button>
      <img :src="photos[selectedPhoto]" alt="Фото" @click.stop />
      <button v-if="selectedPhoto > 0" class="modal-nav prev" @click.stop="selectedPhoto--">
        <i class="fas fa-chevron-left"></i>
      </button>
      <button v-if="selectedPhoto < photos.length - 1" class="modal-nav next" @click.stop="selectedPhoto++">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FW2000',

  data() {
    return {
      event: {
        id: '2',
        slug: 'foxwood-2000s',
        name: 'FoxWood: Back to 2000s',
        subtitle: 'Ретро-мероприятие в лесной тематике',
        event_date: '2024-09-08',
        city: 'Ленинградская область',
        location: 'Загородный клуб "Бор"',
        event_type: 'convention',
        my_rating: 5,
        attendees_count: 160,
        banner_url: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/events/foxwood_banner.jpg',
        description: 'Совершенно потрясающая концепция! Лесная тематика смешанная с ностальгией по нулевым.'
      },
      ratings: [
        { label: 'Организация', value: 5 },
        { label: 'Атмосфера', value: 5 },
        { label: 'Локация', value: 5 },
        { label: 'Участники', value: 5 }
      ],
      pros: [
        'Потрясающая атмосфера 2000-х',
        'Отличная музыка и активности',
        'Красивая лесная локация',
        'Дружелюбное комьюнити'
      ],
      cons: [
        'Далеко от города'
      ],
      photos: [
        'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/events/foxwood_banner.jpg',
        'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/events/foxwood_banner.jpg',
        'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/events/foxwood_banner.jpg',
        'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/events/foxwood_banner.jpg'
      ],
      selectedPhoto: null
    }
  },

  computed: {
    averageRating() {
      const sum = this.ratings.reduce((acc, r) => acc + r.value, 0)
      return (sum / this.ratings.length).toFixed(1)
    }
  },

  mounted() {
    document.title = `${this.event.name} | FoxTaffy.fun`
  },

  methods: {
    formatDate(dateStr) {
      const date = new Date(dateStr)
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    },
    openPhoto(index) {
      this.selectedPhoto = index
    },
    closePhoto() {
      this.selectedPhoto = null
    }
  }
}
</script>

<style scoped>
.event-details-page {
  min-height: 100vh;
  background: var(--bg-primary, #0a0a0f);
}

/* Баннер */
.event-hero {
  position: relative;
  height: 500px;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(0, 0, 0, 0.8) 100%);
  z-index: 1;
}

.hero-image {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(2px);
  transform: scale(1.05);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.back-button {
  position: absolute;
  top: 2rem;
  left: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  background: rgba(255,255,255,0.15);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  font-size: 0.875rem;
  transition: all 0.3s;
}

.back-button:hover {
  background: rgba(255,255,255,0.25);
  transform: translateX(-4px);
}

.hero-info {
  max-width: 600px;
}

.event-badges {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.event-status, .event-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.event-status.completed {
  background: rgba(34, 197, 94, 0.3);
  color: #4ade80;
}

.event-type-badge {
  background: rgba(139, 92, 246, 0.3);
  color: #a78bfa;
}

.event-title {
  font-size: 3rem;
  font-weight: 800;
  color: white;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 4px 20px rgba(0,0,0,0.5);
}

.event-subtitle {
  font-size: 1.125rem;
  color: rgba(255,255,255,0.8);
  margin: 0 0 1.5rem 0;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255,255,255,0.9);
  font-size: 0.9rem;
}

.meta-item i {
  color: #a78bfa;
}

.hero-rating {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.rating-stars-large i {
  font-size: 1.5rem;
  color: rgba(255,255,255,0.3);
}

.rating-stars-large i.active {
  color: #fbbf24;
}

.rating-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fbbf24;
}

/* Контейнер */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Сетка контента */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 1.5rem;
}

.content-left {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.content-right {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Карточки */
.event-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 1.5rem;
}

.event-card.compact {
  padding: 1.25rem;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  margin: 0 0 1rem 0;
}

.card-title i {
  color: #8b5cf6;
}

.card-text {
  color: rgba(255,255,255,0.7);
  line-height: 1.7;
  margin: 0 0 0.75rem 0;
}

.card-text:last-child {
  margin-bottom: 0;
}

/* Фотографии */
.photos-count {
  margin-left: auto;
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.photo-item:hover img {
  transform: scale(1.1);
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.photo-item:hover .photo-overlay {
  opacity: 1;
}

.photo-overlay i {
  color: white;
  font-size: 1.25rem;
}

/* Плюсы/Минусы */
.pros-cons-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.block-subtitle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
}

.block-subtitle.pros {
  color: #4ade80;
}

.block-subtitle.cons {
  color: #f87171;
}

.opinion-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.opinion-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.4rem 0;
  font-size: 0.875rem;
  color: rgba(255,255,255,0.8);
}

.pros-block .opinion-list i {
  color: #4ade80;
  font-size: 0.75rem;
  margin-top: 0.2rem;
}

.cons-block .opinion-list i {
  color: #f87171;
  font-size: 0.75rem;
  margin-top: 0.2rem;
}

/* Рейтинги */
.ratings-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.rating-label {
  flex: 0 0 90px;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.6);
}

.rating-bar {
  flex: 1;
  height: 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  overflow: hidden;
}

.rating-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6, #a78bfa);
  border-radius: 3px;
}

.rating-num {
  flex: 0 0 20px;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  text-align: right;
}

.overall-score {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255,255,255,0.1);
  font-size: 0.875rem;
  color: rgba(255,255,255,0.7);
}

.overall-score strong {
  color: #fbbf24;
  font-size: 1rem;
}

/* Особенности */
.features-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.8);
}

.feature-item i {
  color: #8b5cf6;
  font-size: 0.75rem;
}

/* Ссылки */
.links-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  font-size: 0.875rem;
  transition: all 0.3s;
}

.link-item:hover {
  background: rgba(139, 92, 246, 0.2);
  color: white;
}

.link-item i {
  font-size: 1rem;
  color: #8b5cf6;
}

/* Модальное окно */
.photo-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.95);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.photo-modal img {
  max-width: 90%;
  max-height: 90vh;
  border-radius: 8px;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.25rem;
}

.modal-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.25rem;
}

.modal-nav.prev {
  left: 1rem;
}

.modal-nav.next {
  right: 1rem;
}

/* Адаптив */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .content-right {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .event-hero {
    height: 400px;
  }

  .event-title {
    font-size: 2rem;
  }

  .hero-meta {
    gap: 1rem;
  }

  .photos-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .pros-cons-grid {
    grid-template-columns: 1fr;
  }

  .content-right {
    grid-template-columns: 1fr;
  }

  .features-list {
    grid-template-columns: 1fr;
  }
}
</style>
