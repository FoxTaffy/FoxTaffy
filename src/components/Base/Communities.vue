<template>
  <!-- Мои сообщества -->
  <div class="section communities-section" id="communities">
    <h2 class="section-title">Мои сообщества</h2>
    <p class="section-description">Присоединяйтесь к моим сообществам в соцсетях, где я делюсь контентом и общаюсь с фурри-фэндомом</p>

    <div class="community-links">
      <a
        v-for="c in communities"
        :key="c.link"
        :href="c.link"
        :class="['community-card', c.platform]"
        target="_blank"
        rel="noopener"
      >
        <div class="community-banner" :style="{ '--cover': `url(${c.avatar})` }">
          <span class="community-platform">
            <i :class="c.icon"></i> {{ c.platformLabel }}
          </span>
          <span v-if="c.online" class="community-online">
            <span class="community-online-dot"></span> {{ c.online }} в сети
          </span>
        </div>

        <div class="community-avatar">
          <img :src="c.avatar" :alt="c.name" width="68" height="68" loading="lazy" />
          <span class="community-avatar-badge"><i :class="c.icon"></i></span>
        </div>

        <div class="community-body">
          <h3 class="community-name">{{ c.name }}</h3>
          <p class="community-description">{{ c.description }}</p>

          <ul class="community-stats">
            <li v-for="s in c.stats" :key="s.label" class="community-stat">
              <i :class="s.icon"></i>
              <span><b>{{ s.value }}</b> {{ s.label }}</span>
            </li>
          </ul>
        </div>

        <div class="community-footer">
          <span class="community-cta">{{ c.cta }}</span>
          <span class="community-arrow"><i class="fas fa-arrow-right"></i></span>
        </div>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommunitiesSection',
  data() {
    return {
      communities: [
        {
          platform: 'telegram',
          platformLabel: 'Telegram',
          icon: 'fab fa-telegram-plane',
          name: 'Тэффи во Florida',
          description: 'Мнение полуфабриката',
          link: 'https://t.me/FloridaOwO',
          avatar: '/communities/florida.png',
          cta: 'Читать канал',
          stats: [{ icon: 'fas fa-users', value: '257', label: 'подписчиков' }]
        },
        {
          platform: 'telegram',
          platformLabel: 'Telegram',
          icon: 'fab fa-telegram-plane',
          name: '🌿щитПосты/memes Taffuck 💚',
          description: 'Щит посты и всякие высеры плесени',
          link: 'https://t.me/+5H2IeKiA1R1kYWYy',
          avatar: '/communities/memes.png',
          cta: 'Читать канал',
          stats: [{ icon: 'fas fa-users', value: '43', label: 'подписчика' }]
        },
        {
          platform: 'discord',
          platformLabel: 'Discord',
          icon: 'fab fa-discord',
          name: 'Inferno femboys🔔',
          description: 'Discord сервер для общения и совместных игр в Counter-Strike 2',
          link: 'https://discord.gg/bpCRAqUvNm',
          avatar: '/communities/inferno.png',
          online: 30,
          cta: 'Вступить на сервер',
          stats: [
            { icon: 'fas fa-users', value: '208', label: 'участников' },
            { icon: 'fas fa-calendar-alt', value: 'авг. 2021', label: 'основан' }
          ]
        }
      ]
    }
  }
}
</script>
