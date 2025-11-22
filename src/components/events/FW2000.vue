<template>
  <div class="event-details-page">
    <!-- Героическая секция с баннером -->
    <div class="event-hero">
      <div class="hero-overlay"></div>
      <div class="hero-image" :style="{ backgroundImage: `url(${event.banner_url})` }"></div>
      <div class="hero-content">
        <router-link to="/events" class="back-button">
          <i class="fas fa-arrow-left"></i>
          <span>Назад к мероприятиям</span>
        </router-link>

        <div class="event-badges">
          <span class="event-status completed">Посетил</span>
          <span class="event-rating">
            <i class="fas fa-star"></i>
            {{ event.my_rating }}/5
          </span>
        </div>

        <h1 class="event-title">{{ event.name }}</h1>
        <div class="event-subtitle">{{ event.subtitle }}</div>
      </div>
    </div>

    <div class="container">
      <!-- Краткая информация о мероприятии -->
      <div class="event-info-grid">
        <div class="event-info-card">
          <div class="info-icon"><i class="fas fa-calendar-alt"></i></div>
          <div class="info-content">
            <div class="info-label">Дата проведения</div>
            <div class="info-value">{{ formatDate(event.event_date) }}</div>
          </div>
        </div>

        <div class="event-info-card">
          <div class="info-icon"><i class="fas fa-map-marker-alt"></i></div>
          <div class="info-content">
            <div class="info-label">Место проведения</div>
            <div class="info-value">{{ event.location }}</div>
            <div class="info-extra">{{ event.city }}</div>
          </div>
        </div>

        <div class="event-info-card">
          <div class="info-icon"><i class="fas fa-users"></i></div>
          <div class="info-content">
            <div class="info-label">Участников</div>
            <div class="info-value">{{ event.attendees_count }}+</div>
          </div>
        </div>

        <div class="event-info-card">
          <div class="info-icon"><i class="fas fa-tag"></i></div>
          <div class="info-content">
            <div class="info-label">Тип мероприятия</div>
            <div class="info-value">Конвент</div>
          </div>
        </div>
      </div>

      <!-- Основной контент -->
      <div class="event-content">
        <!-- Описание -->
        <div class="event-section">
          <h2 class="section-title">
            <i class="fas fa-info-circle"></i>
            О мероприятии
          </h2>
          <div class="event-description">
            <p>{{ event.description }}</p>
            <p>Это была потрясающая вечеринка в ретро-стиле 2000-х! Организаторы создали невероятную атмосферу ностальгии с музыкой, играми и декорациями той эпохи.</p>
          </div>
        </div>

        <!-- Рейтинг -->
        <div class="event-section">
          <h2 class="section-title">
            <i class="fas fa-star"></i>
            Моя оценка
          </h2>
          <div class="rating-display">
            <div class="rating-stars">
              <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ 'active': n <= event.my_rating }"></i>
            </div>
            <span class="rating-text">{{ event.my_rating }}/5</span>
          </div>

          <div class="multi-rating-section">
            <div class="rating-categories-grid">
              <div class="rating-cat-card">
                <span class="cat-label">Организация</span>
                <div class="cat-stars">
                  <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ 'active': n <= 5 }"></i>
                </div>
                <span class="cat-value">5/5</span>
              </div>
              <div class="rating-cat-card">
                <span class="cat-label">Атмосфера</span>
                <div class="cat-stars">
                  <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ 'active': n <= 5 }"></i>
                </div>
                <span class="cat-value">5/5</span>
              </div>
              <div class="rating-cat-card">
                <span class="cat-label">Локация</span>
                <div class="cat-stars">
                  <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ 'active': n <= 5 }"></i>
                </div>
                <span class="cat-value">5/5</span>
              </div>
              <div class="rating-cat-card">
                <span class="cat-label">Участники</span>
                <div class="cat-stars">
                  <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ 'active': n <= 5 }"></i>
                </div>
                <span class="cat-value">5/5</span>
              </div>
            </div>
            <div class="overall-rating-display">
              Общая оценка: <strong>5/5</strong>
            </div>
          </div>
        </div>

        <!-- Плюсы и минусы -->
        <div class="event-section">
          <h2 class="section-title">
            <i class="fas fa-balance-scale"></i>
            Мое мнение
          </h2>
          <div class="pros-cons-columns">
            <div class="pros-block">
              <h4 class="pros-title">
                <i class="fas fa-thumbs-up"></i>
                Плюсы
              </h4>
              <ul class="pros-list">
                <li><i class="fas fa-check"></i><span>Потрясающая атмосфера 2000-х</span></li>
                <li><i class="fas fa-check"></i><span>Отличная музыка и активности</span></li>
                <li><i class="fas fa-check"></i><span>Красивая лесная локация</span></li>
                <li><i class="fas fa-check"></i><span>Дружелюбное комьюнити</span></li>
              </ul>
            </div>
            <div class="cons-block">
              <h4 class="cons-title">
                <i class="fas fa-thumbs-down"></i>
                Минусы
              </h4>
              <ul class="cons-list">
                <li><i class="fas fa-times"></i><span>Далеко от города</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
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
        attendance_status: 'attended',
        my_rating: 5,
        total_spent: 7500,
        attendees_count: 160,
        photos_count: 32,
        is_featured: true,
        banner_url: 'https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/events/foxwood_banner.jpg',
        description: 'Совершенно потрясающая концепция! Лесная тематика смешанная с ностальгией по нулевым.'
      }
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
    }
  }
}
</script>

<style scoped>
.event-details-page {
  min-height: 100vh;
  background: var(--bg-primary, #0a0a0f);
}

.event-hero {
  position: relative;
  height: 400px;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%);
  z-index: 1;
}

.hero-image {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
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
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  transition: background 0.3s;
}

.back-button:hover {
  background: rgba(255,255,255,0.2);
}

.event-badges {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.event-status {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.event-status.completed {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.event-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #fbbf24;
}

.event-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.event-subtitle {
  font-size: 1.125rem;
  color: rgba(255,255,255,0.7);
  margin-top: 0.5rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.event-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.event-info-card {
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(139, 92, 246, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b5cf6;
}

.info-label {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: white;
}

.info-extra {
  font-size: 0.875rem;
  color: rgba(255,255,255,0.6);
}

.event-section {
  background: rgba(255,255,255,0.03);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0 0 1rem 0;
}

.section-title i {
  color: #8b5cf6;
}

.event-description {
  color: rgba(255,255,255,0.8);
  line-height: 1.7;
}

.event-description p {
  margin: 0 0 1rem 0;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.rating-stars i {
  font-size: 1.5rem;
  color: rgba(255,255,255,0.2);
}

.rating-stars i.active {
  color: #fbbf24;
}

.rating-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
}

.rating-categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.rating-cat-card {
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.cat-label {
  display: block;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.6);
  margin-bottom: 0.5rem;
}

.cat-stars i {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.2);
}

.cat-stars i.active {
  color: #fbbf24;
}

.cat-value {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  margin-top: 0.5rem;
}

.overall-rating-display {
  text-align: center;
  color: rgba(255,255,255,0.7);
  padding-top: 1rem;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.overall-rating-display strong {
  color: #fbbf24;
}

.pros-cons-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.pros-title, .cons-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  margin: 0 0 1rem 0;
}

.pros-title {
  color: #22c55e;
}

.cons-title {
  color: #ef4444;
}

.pros-list, .cons-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.pros-list li, .cons-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem 0;
  color: rgba(255,255,255,0.8);
}

.pros-list i {
  color: #22c55e;
  margin-top: 0.25rem;
}

.cons-list i {
  color: #ef4444;
  margin-top: 0.25rem;
}

@media (max-width: 768px) {
  .event-hero {
    height: 300px;
  }

  .event-title {
    font-size: 1.75rem;
  }

  .pros-cons-columns {
    grid-template-columns: 1fr;
  }
}
</style>
