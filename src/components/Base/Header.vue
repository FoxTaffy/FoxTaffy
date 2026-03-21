<template>
  <!-- Header Section -->
  <div class="header" id="header">
    <div class="header-content">
      <div class="avatar-section">
        <div class="avatar-container">
          <img class="profile-pic" :src="avatarImage" alt="Fox Taffy">
        </div>
      </div>
      <div class="name-container">
        <h1 class="first-name">Fox Taffy</h1>
        <div class="name-underline"></div>
      </div>
      <div class="personal-tags">
        <span class="tag">He/him</span>
        <span class="tag">Лис</span>
        <span class="tag">177 см</span>
        <span class="tag birthday-tag">
          <i class="fas fa-birthday-cake"></i>
          <span>{{ age }} лет</span>
          <span v-if="isBirthdayToday" class="birthday-badge">Сегодня!</span>
        </span>
        <span class="tag">Москва</span>
        <span class="tag">Гей</span>
      </div>
      <p class="bio-short">Привет! Я фурри-энтузиаст и путешественник. Люблю исследовать новые места, посещать фурри-конвенции и делиться своими приключениями с сообществом.</p>

      <div class="fav-track-widget">
        <div class="fav-track-label">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="var(--accent-orange)">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          Любимый трек
        </div>
        <iframe
          frameborder="0"
          allow="clipboard-write"
          style="border:none;width:520px;height:100px;"
          width="520"
          height="100"
          src="https://music.yandex.ru/iframe/album/39135564/track/145046235"
          title="ствол — плм на Яндекс Музыке"
        ></iframe>
      </div>

      <div class="social-links">
        <a href="https://x.com/Fox_Taffy621" class="social-btn x-twitter" title="X" target="_blank" rel="noopener">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>
        <a href="https://instagram.com/foxtaffy" class="social-btn instagram" title="Instagram" target="_blank" rel="noopener">
          <i class="fab fa-instagram"></i>
        </a>
        <a href="https://t.me/foxtaffy" class="social-btn telegram" title="Telegram" target="_blank" rel="noopener">
          <i class="fab fa-telegram"></i>
        </a>
        <a href="https://vk.com/foxtaffy" class="social-btn vk" title="VK" target="_blank" rel="noopener">
          <i class="fab fa-vk"></i>
        </a>
        <a href="https://discord.gg/foxtaffy" class="social-btn discord" title="Discord" target="_blank" rel="noopener">
          <i class="fab fa-discord"></i>
        </a>
        <a href="https://github.com/foxtaffy" class="social-btn github" title="GitHub" target="_blank" rel="noopener">
          <i class="fab fa-github"></i>
        </a>
        <a href="https://twitch.tv/foxtaffy" class="social-btn twitch" title="Twitch" target="_blank" rel="noopener">
          <i class="fab fa-twitch"></i>
        </a>
        <a href="https://tiktok.com/@foxtaffy" class="social-btn tiktok" title="TikTok" target="_blank" rel="noopener">
          <i class="fab fa-tiktok"></i>
        </a>
        <a href="https://steamcommunity.com/id/foxtaffy" class="social-btn steam" title="Steam" target="_blank" rel="noopener">
          <i class="fab fa-steam"></i>
        </a>
        <a href="https://boosty.to/foxtaffy" class="social-btn boosty" title="Boosty" target="_blank" rel="noopener">
          <img src="@/assets/Boosty.svg" alt="Boosty" style="width: 24px; height: 24px;">
        </a>
        <a href="https://onlyfans.wtf/foxtaffy" class="social-btn onlyfans" title="OnlyFans" target="_blank" rel="noopener">
          <img src="@/assets/OnlyFans.svg" alt="OnlyFans" style="width: 24px; height: 24px;">
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import AvatarImage from '@/assets/Image/Avatar.jpg'

export default {
  name: 'HeaderSection',
  data() {
    return {
      birthDate: new Date(2004, 7, 2), // 02.08.2004 (месяцы в JavaScript начинаются с 0)
      avatarImage: AvatarImage
    }
  },
  computed: {
    age() {
      const today = new Date();
      let age = today.getFullYear() - this.birthDate.getFullYear();
      const monthDiff = today.getMonth() - this.birthDate.getMonth();
      
      // Если текущий месяц меньше месяца рождения или текущий месяц равен месяцу рождения,
      // но текущий день меньше дня рождения, то вычитаем 1 год
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < this.birthDate.getDate())) {
        age--;
      }
      
      return age;
    },
    isBirthdayToday() {
      const today = new Date();
      return today.getDate() === this.birthDate.getDate() && 
             today.getMonth() === this.birthDate.getMonth();
    }
  }
}
</script>

<style scoped>
.fav-track-widget {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  margin: 1rem 0;
}

.fav-track-label {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.fav-track-widget iframe {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  transition: box-shadow 0.3s ease;
}

.fav-track-widget iframe:hover {
  box-shadow: 0 6px 28px rgba(255, 123, 37, 0.25);
}
</style>