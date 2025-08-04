<template>
  <!-- Мероприятия - компактная версия с таблетками -->
  <div class="section events-section">
    <h2 class="section-title">Мероприятия</h2>
    <p class="section-description">События, которые я посетил и планирую посетить. Присоединяйтесь!</p>
    
    <!-- Таблетки для переключения между предстоящими и прошедшими -->
    <div class="events-tabs">
      <div class="tabs-container">
        <div 
          class="tab" 
          :class="{ 'active': activeTab === 'upcoming' }" 
          @click="activeTab = 'upcoming'"
        >
          <i class="fas fa-calendar-alt"></i>
          <span>Предстоящие</span>
        </div>
        <div 
          class="tab" 
          :class="{ 'active': activeTab === 'past' }" 
          @click="activeTab = 'past'"
        >
          <i class="fas fa-history"></i>
          <span>Прошедшие</span>
        </div>
      </div>
    </div>
    
    <!-- Контейнер для списка мероприятий -->
    <div class="events-container">
      <!-- Предстоящие мероприятия -->
      <div class="events-list" v-show="activeTab === 'upcoming'">
        <div 
          v-for="(event, index) in visibleUpcomingEvents" 
          :key="'upcoming-' + index" 
          class="event-card upcoming"
        >
          <div class="event-banner" :style="{ backgroundImage: `url(${event.imageUrl})` }">
            <div class="event-overlay"></div>
            <div class="event-date">
              <span class="month">{{ getMonthShort(event.date) }}</span>
              <span class="day">{{ getDayOfMonth(event.date) }}</span>
              <span class="year">{{ getYear(event.date) }}</span>
            </div>
            <div class="event-badges">
              <span class="event-status">{{ event.status }}</span>
              <span 
                v-if="event.badge" 
                class="event-badge" 
                :class="event.badgeClass"
              >{{ event.badgeText }}</span>
            </div>
          </div>
          
          <div class="event-content">
            <h3 class="event-name">{{ event.name }}</h3>
            <div class="event-meta">
              <div class="meta-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>{{ event.location }}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-users"></i>
                <span>{{ event.attendees }}</span>
              </div>
            </div>
            <p class="event-desc">{{ event.description }}</p>
            
            <div class="event-countdown">
              <i class="fas fa-clock"></i>
              <span>До начала: {{ getDaysUntil(event.date) }}</span>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: getProgressWidth(event.date, event.announcedDate) }"></div>
              </div>
            </div>

            <!-- Кнопки действий -->
            <div class="event-actions">
              <!-- Ссылка на официальный сайт -->
              <a v-if="event.officialUrl" :href="event.officialUrl" target="_blank" class="official-link-btn">
                <i class="fas fa-external-link-alt"></i>
                <span>Официальный сайт</span>
              </a>
              
              <!-- Кнопка "Скоро..." если нет официального сайта -->
              <div v-else class="coming-soon-btn">
                <span>Скоро...</span>
                <i class="fas fa-hourglass-half"></i>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Кнопка "Загрузить ещё" для предстоящих событий -->
        <div v-if="hasMoreUpcomingEvents" class="load-more-container">
          <button class="load-more-btn" @click="loadMoreUpcoming">
            <i class="fas fa-plus"></i>
            <span>Загрузить ещё</span>
          </button>
        </div>
      </div>
      
      <!-- Прошедшие мероприятия -->
      <div class="events-list" v-show="activeTab === 'past'">
        <div 
          v-for="(event, index) in visiblePastEvents" 
          :key="'past-' + index" 
          class="event-card"
        >
          <div class="event-banner" :style="{ backgroundImage: `url(${event.imageUrl})` }">
            <div class="event-overlay"></div>
            <div class="event-date">
              <span class="month">{{ getMonthShort(event.date) }}</span>
              <span class="day">{{ getDayOfMonth(event.date) }}</span>
              <span class="year">{{ getYear(event.date) }}</span>
            </div>
            <div class="event-badges">
              <span class="event-status visited">{{ event.status }}</span>
              <span 
                v-if="event.badge" 
                class="event-badge" 
                :class="event.badgeClass"
              >{{ event.badgeText }}</span>
            </div>
          </div>
          
          <div class="event-content">
            <h3 class="event-name">{{ event.name }}</h3>
            <div class="event-meta">
              <div class="meta-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>{{ event.location }}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-users"></i>
                <span>{{ event.attendees }}</span>
              </div>
            </div>
            <p class="event-desc">{{ event.description }}</p>
            
            <!-- Кнопки действий для прошедших событий -->
            <div class="event-actions">
              <!-- Ссылка на официальный сайт -->
              <a v-if="event.officialUrl" :href="event.officialUrl" target="_blank" class="official-link-btn secondary">
                <i class="fas fa-external-link-alt"></i>
                <span>Официальный сайт</span>
              </a>
              
              <!-- Кнопка "Подробнее" или "Скоро..." в зависимости от готовности страницы -->
              <div v-if="event.detailsReady" class="details-btn-container">
                <router-link :to="event.detailsUrl" class="details-btn">
                  <span>Подробнее</span>
                  <i class="fas fa-arrow-right"></i>
                </router-link>
              </div>
              <div v-else class="details-btn-container">
                <div class="coming-soon-btn">
                  <span>Скоро...</span>
                  <i class="fas fa-hourglass-half"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Кнопка "Загрузить ещё" для прошедших событий -->
        <div v-if="hasMorePastEvents" class="load-more-container">
          <button class="load-more-btn" @click="loadMorePast">
            <i class="fas fa-plus"></i>
            <span>Загрузить ещё</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Импортируем изображения для событий
import foxwoodImage from '@/assets/events/foxwood.jpg';
import twopikonImage from '@/assets/events/2p.jpg';
import furmarketImage from '@/assets/events/furmarket.jpg';
import affImage from '@/assets/events/aff5.jpg';
import fffImage from '@/assets/events/fff.jpg';
import SFBImage from '@/assets/events/SFB.jpg';
import TourFurrImage from '@/assets/events/TourFurr.jpg';
import TrashConImage from '@/assets/events/TrashCon.jpg';

export default {
  name: 'EventsSection',
  data() {
    return {
      activeTab: 'upcoming',
      eventsPerPage: 3,
      visibleUpcomingCount: 3,
      visiblePastCount: 3,
      events: [
      {
          name: "TrashCon",
          date: "2025-11-14",
          announcedDate: "2025-01-14",
          description: "Эпический конвент, посвященный вселенной Игры Престолов",
          imageUrl: TrashConImage,
          location: "Ленинградская область",
          attendees: "140+",
          status: "Буду участвовать",
          badge: false,
          detailsUrl: "/events/TrashCon",
          badgeClass: "volunteer",
          badgeText: "Волонтёр",
          detailsReady: false,
          officialUrl: "http://skyfurrburg.ru"
        },
      {
          name: "FurrMarket 4",
          date: "2025-08-2",
          announcedDate: "2025-01-2",
          description: "Это ежегодный кемпинг-кон для любителей фурри-культуры, где каждый год новая тематика.",
          imageUrl: furmarketImage,
          location: "Москва",
          attendees: "100+",
          status: "Посетил",
          badge: false,
          detailsUrl: "/events/FurrMarket4",
          badgeClass: "volunteer",
          badgeText: "Волонтёр",
          detailsReady: false,
          officialUrl: "https://vk.com/furrmarket"
        },
        {
          name: "TourFurr",
          date: "2025-08-7",
          announcedDate: "2025-01-7",
          description: "Это ежегодный кемпинг-кон для любителей фурри-культуры, где каждый год новая тематика.",
          imageUrl: TourFurrImage,
          location: "Московская область",
          attendees: "140+",
          status: "Буду участвовать",
          badge: false,
          detailsUrl: "/events/TourFurr",
          badgeClass: "volunteer",
          badgeText: "Волонтёр",
          detailsReady: false,
          officialUrl: "http://skyfurrburg.ru"
        },
        {
          name: "SkyFurrBurg",
          date: "2025-07-5",
          announcedDate: "2025-01-7",
          description: "Конвент, который погрузит вас в пышные сады Эллады. Новый Скайфурр будет проведён в античном сеттинге.",
          imageUrl: SFBImage,
          location: "Московская область",
          attendees: "70",
          status: "Посетил",
          badge: false,
          detailsUrl: "/events/SkyFurrBurg",
          badgeClass: "volunteer",
          badgeText: "Волонтёр",
          detailsReady: true,
          officialUrl: "http://skyfurrburg.ru"
        },
        {
          name: "Foxwood: Back to 2000s",
          date: "2025-05-15",
          announcedDate: "2025-01-15",
          description: "Крупнейшая фурри-конвенция России с тематикой 2000-х годов. Вечеринки, конкурсы и мастер-классы!",
          imageUrl: foxwoodImage,
          location: "Подмосковье",
          attendees: "140+",
          status: "Посетил",
          badge: true,
          detailsUrl: "/events/foxwood",
          badgeClass: "volunteer",
          badgeText: "Волонтёр",
          detailsReady: true,
          officialUrl: "https://foxwood.camp"
        },
        {
          name: "Fox Family Fest",
          date: "2025-05-31",
          announcedDate: "2025-01-31",
          description: "Ежегодная образовательная выставка-фестиваль домашних лис",
          imageUrl: fffImage,
          location: "Москва",
          attendees: "100+",
          status: "Посетил",
          detailsUrl: "/events/fff",
          detailsReady: true,
          officialUrl: "https://foxfamilyfest.ru"
        },
        {
          name: "Тупикон",
          date: "2025-09-5",
          announcedDate: "2025-01-05",
          description: "Конвент, который мы создаём так, как сами хотели бы его увидеть.",
          imageUrl: twopikonImage,
          location: "Калужская область",
          attendees: "200+",
          status: "Буду учавствовать",
          badge: false,
          detailsUrl: "/events/PCON",
          detailsReady: false,
          officialUrl: "https://sillycon.ru"
        },
        {
          name: "FurrMarket 3",
          date: "2025-03-22",
          description: "Маркет на фурри-тематику",
          imageUrl: furmarketImage,
          location: "Москва",
          attendees: "200+",
          status: "Посетил",
          badge: true,
          badgeClass: "vip",
          badgeText: "VIP",
          detailsUrl: "/events/furmarket",
          detailsReady: true,
          officialUrl: "https://vk.com/furrmarket"
        },
        {
          name: "AnyFurry Fest V",
          date: "2024-10-19",
          description: "Фурри-фестиваль, на котором мы соберем всех пушистых.",
          imageUrl: affImage,
          location: "Москва",
          attendees: "350+",
          status: "Посетил",
          badge: true,
          badgeClass: "vip",
          badgeText: "VIP",
          detailsUrl: "/events/aff5",
          detailsReady: true,
          officialUrl: "https://vk.com/anyfurryfest"
        },
      ]
    };
  },
  computed: {
    // Автоматически сортирует события на предстоящие и прошедшие
    upcomingEvents() {
      const now = new Date();
      return this.events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= now;
      }).sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    
    pastEvents() {
      const now = new Date();
      return this.events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate < now;
      }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Сортировка по убыванию для прошедших
    },
    
    // Видимые события с учетом пагинации
    visibleUpcomingEvents() {
      return this.upcomingEvents.slice(0, this.visibleUpcomingCount);
    },
    
    visiblePastEvents() {
      return this.pastEvents.slice(0, this.visiblePastCount);
    },
    
    // Флаги для отображения кнопки "Загрузить ещё"
    hasMoreUpcomingEvents() {
      return this.visibleUpcomingCount < this.upcomingEvents.length;
    },
    
    hasMorePastEvents() {
      return this.visiblePastCount < this.pastEvents.length;
    }
  },
  methods: {
    // Загрузить больше событий
    loadMoreUpcoming() {
      this.visibleUpcomingCount += this.eventsPerPage;
    },
    
    loadMorePast() {
      this.visiblePastCount += this.eventsPerPage;
    },
    
    // Форматирование даты
    getMonthShort(dateString) {
      const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
      const date = new Date(dateString);
      return months[date.getMonth()];
    },
    
    getDayOfMonth(dateString) {
      const date = new Date(dateString);
      return date.getDate();
    },
    
    getYear(dateString) {
      const date = new Date(dateString);
      return date.getFullYear();
    },
    
    // Расчет дней до события
    getDaysUntil(dateString) {
      const eventDate = new Date(dateString);
      const currentDate = new Date();
      
      // Устанавливаем время на начало дня для корректного расчета
      eventDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);
      
      // Разница в днях
      const diffTime = eventDate - currentDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 0) return "Сегодня!";
      if (diffDays === 1) return "1 день";
      if (diffDays >= 2 && diffDays <= 4) return `${diffDays} дня`;
      return `${diffDays} дней`;
    },
    
    // Расчет ширины полосы прогресса
    getProgressWidth(eventDate, announcedDate) {
      const event = new Date(eventDate);
      const now = new Date();
      const announced = announcedDate ? new Date(announcedDate) : new Date(event.getTime() - 100 * 24 * 60 * 60 * 1000); // Если дата анонса не указана, используем дефолт 100 дней до события
      
      // Если событие уже прошло
      if (now > event) return '100%';
      
      // Общее количество дней от анонса до события
      const totalPrepDays = (event - announced) / (1000 * 60 * 60 * 24);
      
      // Дней прошло с момента анонса
      const daysPassed = (now - announced) / (1000 * 60 * 60 * 24);
      
      // Вычисляем процент прогресса
      const progress = (daysPassed / totalPrepDays) * 100;
      
      // Ограничиваем значение от 0 до 100
      return `${Math.max(0, Math.min(100, progress))}%`;
    },
    
    // Метод для добавления нового события 
    // Использование: this.$refs.eventsSection.addEvent({ ... })
    addEvent(eventData) {
      // Проверка на обязательные поля
      const requiredFields = ['name', 'date', 'description', 'imageUrl', 'location', 'attendees', 'status'];
      for (const field of requiredFields) {
        if (!eventData[field]) {
          console.error(`Ошибка: отсутствует обязательное поле "${field}"`);
          return false;
        }
      }
      
      // Добавляем дефолтные значения для необязательных полей
      const event = {
        badge: false,
        detailsReady: false,
        ...eventData
      };
      
      // Добавляем событие в список
      this.events.push(event);
      
      // Сортируем события
      return true;
    },
    
    // Метод для обновления данных события
    // Использование: this.$refs.eventsSection.updateEvent('Название события', { detailsReady: true })
    updateEvent(eventName, updateData) {
      const eventIndex = this.events.findIndex(event => event.name === eventName);
      if (eventIndex === -1) {
        console.error(`Ошибка: событие "${eventName}" не найдено`);
        return false;
      }
      
      // Обновляем данные события
      this.events[eventIndex] = {
        ...this.events[eventIndex],
        ...updateData
      };
      
      return true;
    }
  }
};
</script>

<style scoped>
/* Основные стили секции */
.events-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.tabs-container {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2rem;
  padding: 0.35rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.tab {
  padding: 0.6rem 1.3rem;
  cursor: pointer;
  border-radius: 1.5rem;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  color: var(--text-muted);
  user-select: none;
}

.tab i {
  font-size: 0.9rem;
}

.tab:hover:not(.active) {
  color: var(--text-light);
  background: rgba(255, 255, 255, 0.05);
}

.tab.active {
  background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
  color: #fff;
  box-shadow: 0 5px 15px rgba(255, 123, 37, 0.3);
}

/* Контейнер мероприятий */
.events-container {
  position: relative;
  overflow: hidden;
}

.events-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Карточки мероприятий */
.event-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.8rem;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(255, 255, 255, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 123, 37, 0.3);
}

.event-card.upcoming {
  border-color: rgba(255, 123, 37, 0.2);
  background: rgba(255, 123, 37, 0.05);
}

.event-banner {
  height: 140px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.event-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.7));
}

.event-date {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
  border-radius: 0.5rem;
  padding: 0.4rem;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 40px;
  text-align: center;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.event-date .month {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}

.event-date .day {
  font-size: 1.2rem;
  font-weight: 800;
  line-height: 1;
}

.event-date .year {
  font-size: 0.7rem;
  opacity: 0.9;
}

.event-badges {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  gap: 0.5rem;
  z-index: 1;
}

.event-status {
  background: rgba(255, 123, 37, 0.9);
  color: white;
  padding: 0.3rem 0.7rem;
  border-radius: 2rem;
  font-size: 0.7rem;
  font-weight: 600;
  backdrop-filter: blur(5px);
}

.event-status.visited {
  background: rgba(76, 175, 80, 0.9);
}

.event-status.interested {
  background: rgba(33, 150, 243, 0.9);
}

.event-badge {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 0.3rem 0.7rem;
  border-radius: 2rem;
  font-size: 0.7rem;
  font-weight: 600;
  backdrop-filter: blur(5px);
}

.event-badge.vip {
  background: rgba(255, 215, 0, 0.9);
  color: #000;
}

.event-badge.volunteer {
  background: rgba(156, 39, 176, 0.9);
  color: white;
}

.event-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 0.75rem;
}

.event-name {
  font-size: 1.1rem;
  margin-bottom: 0;
  font-weight: 700;
  color: var(--text-light);
}

.event-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.meta-item i {
  color: var(--accent-orange);
  font-size: 0.75rem;
}

.event-desc {
  font-size: 0.85rem;
  color: var(--text-light);
  margin-bottom: 0;
  flex-grow: 1;
  line-height: 1.4;
}

.event-countdown {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  margin-top: auto;
  font-size: 0.85rem;
}

.event-countdown i {
  color: var(--accent-orange);
  margin-right: 0.5rem;
}

.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-orange), var(--accent-green));
  border-radius: 2px;
  transition: width 1.5s cubic-bezier(0.075, 0.82, 0.165, 1);
}

/* Новые стили для кнопок действий */
.event-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: auto;
  padding-top: 0.5rem;
}

/* Кнопка официального сайта */
.official-link-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-light);
  padding: 0.6rem 0.8rem;
  border-radius: 0.4rem;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.official-link-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.1);
  color: var(--accent-orange);
  border-color: rgba(255, 123, 37, 0.3);
}

.official-link-btn.secondary {
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed rgba(255, 255, 255, 0.1);
}

.official-link-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.08);
  border-style: solid;
}

.official-link-btn i {
  transition: transform 0.3s ease;
  font-size: 0.8rem;
}

.official-link-btn:hover i {
  transform: scale(1.1);
}

/* Контейнер кнопки подробнее */
.details-btn-container {
  margin-top: 0;
}

.details-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
  color: white;
  padding: 0.6rem 0.8rem;
  border-radius: 0.4rem;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  box-shadow: 0 3px 8px rgba(255, 123, 37, 0.2);
}

.details-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 12px rgba(255, 123, 37, 0.3);
}

.details-btn i {
  transition: transform 0.3s ease;
  font-size: 0.8rem;
}

.details-btn:hover i {
  transform: translateX(3px);
}

.coming-soon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-light);
  padding: 0.6rem 0.8rem;
  border-radius: 0.4rem;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  cursor: default;
  border: 1px dashed rgba(255, 255, 255, 0.2);
}

.coming-soon-btn i {
  animation: pulse 1.5s infinite;
  color: var(--accent-orange);
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* Кнопка "Загрузить ещё" */
.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  grid-column: 1 / -1;
}

.load-more-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-light);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.8rem 1.5rem;
  border-radius: 2rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.load-more-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.load-more-btn i {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.load-more-btn:hover i {
  transform: rotate(90deg);
}

/* Адаптивные стили */
@media (max-width: 992px) {
  .events-list {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .events-list {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
  
  .tab {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
  
  .event-actions {
    gap: 0.5rem;
  }
  
  .official-link-btn,
  .details-btn,
  .coming-soon-btn {
    font-size: 0.8rem;
    padding: 0.5rem 0.7rem;
  }
}

@media (max-width: 576px) {
  .events-list {
    grid-template-columns: 1fr;
  }
  
  .tabs-container {
    width: 100%;
    justify-content: space-between;
  }
  
  .tab {
    flex: 1;
    justify-content: center;
  }
  
  .event-actions {
    flex-direction: column;
  }
  
  .official-link-btn,
  .details-btn {
    width: 100%;
  }
}
</style>