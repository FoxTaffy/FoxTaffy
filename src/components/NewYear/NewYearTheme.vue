<template>
  <div class="new-year-theme active">
    <!-- Новогодние компоненты -->
    <ChristmasLights />
    <Fireworks :show="showFireworks" />
  </div>
</template>

<script>
import ChristmasLights from './ChristmasLights.vue'
import Fireworks from './Fireworks.vue'

export default {
  name: 'NewYearTheme',
  components: {
    ChristmasLights,
    Fireworks
  },
  data() {
    return {
      showFireworks: false
    }
  },
  mounted() {
    this.checkNewYear()
    this.applyThemeStyles()
  },
  methods: {
    checkNewYear() {
      const now = new Date()
      const currentYear = now.getFullYear()
      const newYear = new Date(`January 1, ${currentYear + 1} 00:00:00`)
      const diff = newYear - now

      if (diff <= 0 && diff > -86400000) {
        this.showFireworks = true
      }
    },
    handleNewYearStart() {
      this.showFireworks = true
    },
    applyThemeStyles() {
      const root = document.documentElement
      root.style.setProperty('--ny-primary', '#4CAF50')
      root.style.setProperty('--ny-secondary', '#81C784')
      root.style.setProperty('--ny-accent', '#FFD54F')
      root.style.setProperty('--ny-glow', 'rgba(76, 175, 80, 0.3)')
      root.classList.add('new-year-active')
    }
  }
}
</script>

<style scoped>
.new-year-theme {
  position: relative;
}
</style>

<style>
/* Глобальные стили для новогодней темы */
body.new-year-active {
  background:
    linear-gradient(135deg, rgba(26, 35, 126, 0.05) 0%, rgba(21, 101, 192, 0.05) 100%),
    radial-gradient(circle at 20% 50%, rgba(76, 175, 80, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 50%, rgba(255, 123, 37, 0.05) 0%, transparent 50%);
}

.new-year-active .nav-link.active {
  background: linear-gradient(45deg, #4CAF50, #81C784) !important;
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3) !important;
}

.new-year-active .social-link::before {
  background: linear-gradient(45deg, #4CAF50, #81C784) !important;
}

.new-year-active .section-title::after {
  background: linear-gradient(90deg, transparent, #4CAF50, transparent) !important;
}
</style>
