<template>
  <div class="section bloomly-section" id="bloomly">
    <h2 class="section-title">Bloomly</h2>

    <div class="split bloomly-hero">
      <div>
        <p class="bloomly-tagline">Твоё творчество. Твои люди.</p>
        <p class="section-description">
          Bloomly — социальная сеть для творческих сообществ: арт, фурри, косплей,
          музыка, хендмейд и фестивали. Я разработчик проекта — проектирую и пишу
          платформу, где авторы показывают работы, находят единомышленников и
          продают свои труды.
        </p>

        <div class="tag-row">
          <span v-for="topic in topics" :key="topic.name" class="tag">
            <i :class="topic.icon"></i>{{ topic.name }}
          </span>
        </div>

        <div class="btn-actions">
          <a class="btn btn-primary" href="https://bloomly.fun/" target="_blank" rel="noopener noreferrer">
            <i class="fas fa-rocket"></i>
            <span>Открыть Bloomly</span>
          </a>
          <a class="btn" href="https://github.com/FoxTaffy/Bloomly_MVP" target="_blank" rel="noopener noreferrer">
            <i class="fab fa-github"></i>
            <span>GitHub</span>
          </a>
          <a class="btn" href="https://t.me/Bloomly_news" target="_blank" rel="noopener noreferrer">
            <i class="fab fa-telegram-plane"></i>
            <span>Новости</span>
          </a>
        </div>
      </div>

      <div class="card">
        <ul class="bloomly-roles">
          <li v-for="role in roles" :key="role.title">
            <span class="icon-badge"><i :class="role.icon"></i></span>
            <span><strong>{{ role.title }}</strong>{{ role.text }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="bloomly-grid">
      <div v-for="feature in features" :key="feature.title" class="card bloomly-feature">
        <span class="icon-badge"><i :class="feature.icon"></i></span>
        <h4>{{ feature.title }}</h4>
        <p>{{ feature.text }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BloomlySection',
  data() {
    return {
      topics: [
        { name: 'Арт', icon: 'fas fa-palette' },
        { name: 'Фурри', icon: 'fas fa-paw' },
        { name: 'Косплей', icon: 'fas fa-mask' },
        { name: 'Музыка', icon: 'fas fa-music' },
        { name: 'Хендмейд', icon: 'fas fa-gem' },
        { name: 'Фестивали', icon: 'fas fa-glass-cheers' }
      ],
      roles: [
        { icon: 'fas fa-code', title: 'Разработчик', text: ' — платформа от MVP до релизов' },
        { icon: 'fas fa-pen-nib', title: 'UX/UI дизайн', text: ' — интерфейс и бренд' }
      ],
      features: [
        { icon: 'fas fa-images', title: 'Работы', text: 'Арты, фото, видео, музыка и тексты в одной ленте.' },
        { icon: 'fas fa-users', title: 'Сообщества', text: 'Группы по интересам, комментарии и личные сообщения.' },
        { icon: 'fas fa-store', title: 'Dealers’ Den', text: 'Ярмарка авторов: продажи, аукционы и очередь заказов.' },
        { icon: 'fas fa-calendar-alt', title: 'События', text: 'Фестивали и встречи сообщества.' }
      ]
    }
  }
}
</script>
