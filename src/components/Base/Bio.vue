<template>
  <div class="section bio-section" id="bio">
    <h2 class="section-title">О себе</h2>
    <!-- Навигация -->
    <div class="bio-tabs">
      <div 
        v-for="(tab, index) in tabs" 
        :key="index"
        class="tab-item"
        :class="{ 'active': activeTab === index }"
        @click="setActiveTab(index)"
      >
        <div class="tab-icon">
          <i :class="tab.icon"></i>
        </div>
        <span class="tab-text">{{ tab.name }}</span>
      </div>
    </div>
    
    <!-- Контент -->
    <div class="bio-container">
      <transition name="fade" mode="out-in">
        <div class="bio-content" :key="activeTab">
          <div class="content-header">
            <h3>{{ tabs[activeTab].name }}</h3>
            <div class="accent-line"></div>
          </div>
          
          <div class="content-body">
            <p>{{ tabs[activeTab].description }}</p>
            <p v-if="tabs[activeTab].extraDescription">{{ tabs[activeTab].extraDescription }}</p>
          </div>
          
          <!-- Единый формат профильных карточек -->
          <div class="profile-cards">
            <a 
              :href="tabs[activeTab].profileCard.link"
              target="_blank"
              rel="noopener noreferrer"
              class="profile-card"
              :class="tabs[activeTab].profileCard.type"
            >
              <div class="profile-logo">
                <i :class="tabs[activeTab].profileCard.icon"></i>
              </div>
              
              <div class="profile-info">
                <h4 class="profile-title">{{ tabs[activeTab].profileCard.title }}</h4>
                <div class="profile-subtitle">{{ tabs[activeTab].profileCard.subtitle }}</div>
                
                <div class="profile-stats">
                  <div 
                    v-for="(stat, statIndex) in tabs[activeTab].profileCard.stats" 
                    :key="'stat-'+statIndex"
                    class="profile-stat"
                  >
                    <i :class="stat.icon"></i>
                    <span>{{ stat.value }}</span>
                  </div>
                </div>
                
                <div v-if="tabs[activeTab].profileCard.tags && tabs[activeTab].profileCard.tags.length > 0" class="profile-tags">
                  <span 
                    v-for="(tag, tagIndex) in tabs[activeTab].profileCard.tags" 
                    :key="'tag-'+tagIndex"
                    class="profile-tag"
                  >
                    {{ tag }}
                  </span>
                </div>
                
              </div>
            </a>
            
            <!-- Второй аккаунт Steam (только для вкладки Игры) -->
            <a 
              v-if="activeTab === 1 && tabs[activeTab].secondProfileCard"
              :href="tabs[activeTab].secondProfileCard.link"
              target="_blank"
              rel="noopener noreferrer"
              class="profile-card"
              :class="tabs[activeTab].secondProfileCard.type"
            >
              <div class="profile-logo">
                <i :class="tabs[activeTab].secondProfileCard.icon"></i>
              </div>
              
              <div class="profile-info">
                <h4 class="profile-title">{{ tabs[activeTab].secondProfileCard.title }}</h4>
                <div class="profile-subtitle">{{ tabs[activeTab].secondProfileCard.subtitle }}</div>
                
                <div class="profile-stats">
                  <div 
                    v-for="(stat, statIndex) in tabs[activeTab].secondProfileCard.stats" 
                    :key="'stat2-'+statIndex"
                    class="profile-stat"
                  >
                    <i :class="stat.icon"></i>
                    <span>{{ stat.value }}</span>
                  </div>
                </div>
                
                <div v-if="tabs[activeTab].secondProfileCard.tags && tabs[activeTab].secondProfileCard.tags.length > 0" class="profile-tags">
                  <span 
                    v-for="(tag, tagIndex) in tabs[activeTab].secondProfileCard.tags" 
                    :key="'tag2-'+tagIndex"
                    class="profile-tag"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </transition>
    </div>
    
    <!-- Статистика -->
    <div class="bio-stats">
      <div 
        v-for="(stat, statIndex) in stats" 
        :key="statIndex"
        class="stat-item"
      >
        <div class="stat-icon">
          <i :class="stat.icon"></i>
        </div>
        <div class="stat-data">
          <h4 :id="'counter-'+statIndex">{{ stat.value }}</h4>
          <span>{{ stat.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BioSection',
  data() {
    return {
      activeTab: 0, // По умолчанию открыта первая вкладка
      tabs: [
        {
          name: 'Род занятий',
          icon: 'fas fa-laptop',
          description: 'Разработчик и UX/UI дизайнер. Создатель социальной сети FurCup. Люблю творческие и инновационные проекты.',
          profileCard: {
            type: 'github',
            title: 'FoxTaffy',
            subtitle: 'Web-разработчик',
            icon: 'fab fa-github',
            link: 'https://github.com/FoxTaffy',
            stats: [
              { icon: 'fas fa-code-branch', value: 'Репозитории: 5' },
              { icon: 'fas fa-star', value: 'Звёзды: 0' },
              { icon: 'fas fa-users', value: 'Подписчики: 0' }
            ],
            tags: ['JavaScript', 'Vue.js', 'HTML/CSS', 'Node.js']
          }
        },
        {
          name: 'Игры',
          icon: 'fas fa-gamepad',
          description: 'Большой фанат CS2 и Call of Duty — часто провожу время, совершенствуя свои навыки в этих играх. Для расслабления выбираю Marvel Rivals и Cities Skylines II, где могу проявить свою креативность.',
          extraDescription: 'Коллекционирую игры с фурри-тематикой и поддерживаю инди-разработчиков, создающих контент для фурри-сообщества.',
          profileCard: {
            type: 'steam',
            title: 'Fox Taffy',
            subtitle: 'Основной аккаунт',
            icon: 'fab fa-steam',
            link: 'https://steamcommunity.com/id/FoxTaffy/',
            stats: [
              { icon: 'fas fa-chart-line', value: 'Уровень: 43' },
              { icon: 'fas fa-gamepad', value: 'Игр: 100+' },
              { icon: 'fas fa-users', value: 'Друзей: 100+' }
            ],
            tags: ['Counter-Strike 2', 'Project Zomboid', 'Sons Of The Forest']
          },
          secondProfileCard: {
            type: 'steam',
            title: 'Boykisser',
            subtitle: 'Альтернативный аккаунт',
            icon: 'fab fa-steam',
            link: 'https://steamcommunity.com/profiles/76561199555842792',
            stats: [
              { icon: 'fas fa-chart-line', value: 'Уровень: 22' },
              { icon: 'fas fa-gamepad', value: 'Игр: 10+' },
              { icon: 'fas fa-users', value: 'Друзей: 30' }
            ],
            tags: ['The Last Of Us Part 2', 'Marvel Rivals', 'Cities: Skylines II']
          }
        },
        {
          name: 'Музыка',
          icon: 'fas fa-music',
          description: 'Слушаю поп-музыку и lo-fi. Из любимых исполнителей: Полматери, Grillyazh и Nirvana.',
          profileCard: {
            type: 'yandex-music',
            title: 'Fox Taffy',
            subtitle: 'Яндекс Музыка',
            icon: 'fab fa-yandex',
            link: 'https://music.yandex.ru/users/fox.taffy/playlists/3?utm_source=web&utm_medium=copy_link',
            linkText: 'Слушать плейлисты',
            stats: [
              { icon: 'fas fa-headphones-alt', value: 'Плейлистов: 45' },
              { icon: 'fas fa-music', value: 'Треков: 150+' },
              { icon: 'fas fa-clock', value: 'Время прослушивания: 1500+ ч' }
            ],
            tags: ['Полматери', 'Grillyazh', 'Nirvana', 'Lo-fi', 'Поп']
          }
        },
        {
          name: 'Кухня',
          icon: 'fas fa-utensils',
          description: 'Люблю готовить кондитерские изделия, сладости, пряности, торты, десерты. Сладкоежка — не могу устоять перед хорошим гоголь-моголем.',
          profileCard: {
            type: 'notion',
            title: 'Книга рецептов',
            subtitle: 'Моя коллекция в Notion',
            icon: 'fas fa-book-open',
            link: 'https://www.notion.so/1336ff3d2c158022bb94d6af4e5f9634?v=1336ff3d2c1581538b9a000c3f72913f&pvs=4',
            linkText: 'Открыть книгу рецептов',
            stats: [
              { icon: 'fas fa-birthday-cake', value: 'Десертов: 34' },
              { icon: 'fas fa-cookie', value: 'Выпечки: 21' },
              { icon: 'fas fa-pepper-hot', value: 'Основных блюд: 15' }
            ],
            tags: ['Торты', 'Печенье', 'Гоголь-моголь', 'Десерты']
          }
        },
        {
          name: 'Интересы',
          icon: 'fas fa-palette',
          description: 'Увлекаюсь рисованием фурри в свободное время. Занимаюсь фурсьютингом, путешествую и гуляю. Люблю играть в игры.',
          profileCard: {
            type: 'furaffinity',
            title: 'Fox Taffy',
            subtitle: 'FurAffinity',
            icon: 'fas fa-paw',
            link: 'https://www.furaffinity.net/user/foxtaffy/',
            linkText: 'Смотреть галерею',
            stats: [
              { icon: 'fas fa-image', value: 'Работ: 120+' },
              { icon: 'fas fa-heart', value: 'Подписчиков: 100+' },
              { icon: 'fas fa-star', value: 'Избранное: 420' }
            ],
            tags: ['Фурри-арт', 'Цифровая графика', 'Рисунки', 'Персонажи']
          }
        }
      ],
    }
  },
  methods: {
    setActiveTab(index) {
      this.activeTab = index;
    },
    animateCounters() {
      this.stats.forEach((stat, index) => {
        const target = parseInt(stat.value.replace(/\D/g, ''));
        const element = document.getElementById('counter-' + index);
        if (!element) return;
        
        let current = 0;
        const increment = Math.ceil(target / 50);
        const duration = 2000;
        const stepTime = duration / 50;
        
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            clearInterval(timer);
            element.textContent = stat.value;
          } else {
            element.textContent = current + (stat.value.includes('+') ? '+' : '');
          }
        }, stepTime);
      });
    },
    initIntersectionObserver() {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
      };
      
      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateCounters();
            observer.unobserve(entry.target);
          }
        });
      }, options);
      
      const statsSection = document.querySelector('.bio-stats');
      if (statsSection) observer.observe(statsSection);
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initIntersectionObserver();
    });
  }
}
</script>