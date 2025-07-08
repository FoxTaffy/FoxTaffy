<template>
  <!-- Header Section -->
  <div class="header">
    <div class="header-content">
      <div class="avatar-section">
        <div class="avatar-container">
          <img class="profile-pic" :src="avatarImage" alt="Fox Taffy">
        </div>
      </div>
      <div class="name-container">
        <h1 class="first-name">Fox Taffy 🔜 Тупикон</h1>
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
import avatarImage from '@/assets/Image/Avatar.jpg'
export default {
  name: 'HeaderSection',
  data() {
    return {
      birthDate: new Date(2004, 7, 2), // 02.08.2004 (месяцы в JavaScript начинаются с 0)
      avatarImage: avatarImage // Использование импортированного изображения
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