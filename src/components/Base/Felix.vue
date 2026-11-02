<template>
  <!-- Моя половинка -->
  <div class="section felix-section" id="felix">
    <h2 class="section-title">Моя половинка</h2>
    <div class="felix-container">
      <div class="felix-gallery">
        <div class="felix-main-image-container">
          <img :src="currentPartnerImage" alt="Felix Law" class="felix-main-image">
          <div class="felix-badge">
            <i class="fas fa-heart"></i>
            <span>{{ relationshipDuration }}</span>
          </div>
        </div>
        <div class="felix-thumbnails">
          <div 
            v-for="(image, index) in partnerImages" 
            :key="index" 
            class="felix-thumbnail" 
            :class="{ active: currentPartnerIndex === index }"
            @click="setCurrentPartnerImage(index)"
          >
            <img :src="image" :alt="`Felix Law ${index + 1}`">
          </div>
        </div>
        
        <router-link to="/felix" class="link-card">
          <span class="icon-badge icon-badge-round"><i class="fas fa-book-open"></i></span>
          <span class="link-card-body">
            <span class="link-card-title">История любви</span>
            <span class="link-card-text">Как начиналась наша история</span>
          </span>
          <i class="fas fa-arrow-right"></i>
        </router-link>
      </div>
      
      <div class="felix-details">
        <div class="felix-header">
          <h3 class="felix-name">Felix Law</h3>
          <div class="felix-species">
            <i class="fas fa-paw"></i>
            <span>Енот</span>
          </div>
        </div>
        
        <div class="felix-quote">
          <i class="fas fa-quote-left felix-quote-icon"></i>
          <p class="felix-quote-text">"Вместе создаём наш пушистый мир, полный приключений!"</p>
        </div>
        
        <div class="felix-bio">
          <p>Мой любимый енотик Felix всегда поддерживает мои творческие идеи и приключения. Вместе мы участвуем в фурри-конвенциях, путешествуем и создаем множество ярких воспоминаний.</p>
        </div>
        
        <div class="felix-features">
          <div class="felix-feature-item">
            <div class="felix-feature-icon">
              <i class="fas fa-laptop-code"></i>
            </div>
            <div class="felix-feature-text">
              <span>IT специалист</span>
            </div>
          </div>
          
          <div class="felix-feature-item">
            <div class="felix-feature-icon">
              <i class="fas fa-gamepad"></i>
            </div>
            <div class="felix-feature-text">
              <span>Геймер</span>
            </div>
          </div>
          
          <div class="felix-feature-item">
            <div class="felix-feature-icon">
              <i class="fas fa-globe-americas"></i>
            </div>
            <div class="felix-feature-text">
              <span>Путешественник</span>
            </div>
          </div>
        </div>
        
        <div class="felix-memories">
          <h4 class="felix-memories-title">Памятные моменты</h4>
          <div class="felix-memory-list">
            <div class="felix-memory-item">
              <i class="fas fa-mountain"></i>
              <span>Путешествие на Таганай (2024)</span>
            </div>
            <div class="felix-memory-item">
              <i class="fas fa-home"></i>
              <span>Первый совместный переезд (2023)</span>
            </div>
            <div class="felix-memory-item">
              <i class="fas fa-pencil-alt"></i>
              <span>Создание совместного персонажа (2022)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import felix1 from '@/assets/Felix/Felix.jpg'
import felix2 from '@/assets/Felix/Felix2.jpg'
import felix3 from '@/assets/Felix/Felix3.jpg'
import { elapsedYearsMonths, pluralize } from '@/utils/format'

const RELATIONSHIP_START = new Date(2020, 6, 27) // 27 июля 2020

export default {
  name: 'PartnerSection',
  data() {
    return {
      currentPartnerIndex: 0,
      partnerImages: [felix1, felix2, felix3],
      now: new Date(),
      midnightTimer: null
    }
  },
  computed: {
    currentPartnerImage() {
      return this.partnerImages[this.currentPartnerIndex]
    },
    relationshipDuration() {
      const { years, months } = elapsedYearsMonths(RELATIONSHIP_START, this.now)
      const parts = []
      if (years > 0) parts.push(`${years} ${pluralize(years, ['год', 'года', 'лет'])}`)
      if (months > 0 || years === 0) parts.push(`${months} ${pluralize(months, ['месяц', 'месяца', 'месяцев'])}`)
      return parts.join(' ')
    }
  },
  mounted() {
    this.scheduleMidnightRefresh()
  },
  beforeUnmount() {
    clearTimeout(this.midnightTimer)
  },
  methods: {
    setCurrentPartnerImage(index) {
      this.currentPartnerIndex = index
    },
    // Счётчик отношений пересчитывается в полночь
    scheduleMidnightRefresh() {
      const now = new Date()
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      this.midnightTimer = setTimeout(() => {
        this.now = new Date()
        this.scheduleMidnightRefresh()
      }, nextMidnight - now)
    }
  }
}
</script>
