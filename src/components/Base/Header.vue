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
      <router-link v-if="nextEvent && countdownLabel" :to="`/events/${nextEvent.slug}`" class="link-card">
        <span class="icon-badge icon-badge-round"><i class="fas fa-calendar-check"></i></span>
        <span class="link-card-body">
          <span class="link-card-title">{{ nextEvent.name }}</span>
          <span class="link-card-text">{{ countdownLabel }} · {{ nextEvent.city || nextEvent.location }}</span>
        </span>
        <i class="fas fa-arrow-right"></i>
      </router-link>
      <p class="bio-short">Привет! Я фурри-энтузиаст и путешественник. Люблю исследовать новые места, посещать фурри-конвенции и делиться своими приключениями с сообществом.</p>

      <div class="social-links">
        <a
          v-for="social in socials"
          :key="social.name"
          :href="social.url"
          :class="['social-btn', social.brand]"
          :title="social.name"
          :aria-label="social.name"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img v-if="social.image" :src="social.image" :alt="social.name">
          <i v-else :class="social.icon"></i>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import AvatarImage from '@/assets/Image/Avatar.jpg'
import { ageFrom } from '@/utils/format'
import { socials } from '@/config/navigation'
import { useNextEvent } from '@/composables/useNextEvent'

const BIRTH_DATE = new Date(2004, 7, 2) // 02.08.2004

export default {
  name: 'HeaderSection',
  setup() {
    return useNextEvent()
  },
  data() {
    return { avatarImage: AvatarImage, socials }
  },
  computed: {
    age() {
      return ageFrom(BIRTH_DATE)
    },
    isBirthdayToday() {
      const today = new Date()
      return today.getDate() === BIRTH_DATE.getDate() && today.getMonth() === BIRTH_DATE.getMonth()
    }
  }
}
</script>
