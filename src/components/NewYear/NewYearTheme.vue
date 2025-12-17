<template>
  <div class="new-year-theme" :class="{ 'active': themeEnabled }">
    <!-- Кнопка переключения темы -->
    <button
      class="theme-toggle"
      @click="toggleTheme"
      :title="themeEnabled ? 'Выключить новогоднюю тему' : 'Включить новогоднюю тему'"
    >
      <span class="toggle-icon">{{ themeEnabled ? '🎄' : '🎅' }}</span>
    </button>

    <!-- Новогодние компоненты -->
    <transition name="fade">
      <div v-if="themeEnabled">
        <ChristmasLights />
        <Fireworks :show="showFireworks" />
      </div>
    </transition>
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
      themeEnabled: true,
      showFireworks: false
    }
  },
  mounted() {
    this.loadThemeState()
    this.checkNewYear()
    this.applyThemeStyles()
  },
  watch: {
    themeEnabled(newVal) {
      this.saveThemeState(newVal)
      this.applyThemeStyles()
    }
  },
  methods: {
    toggleTheme() {
      this.themeEnabled = !this.themeEnabled
    },
    saveThemeState(enabled) {
      localStorage.setItem('foxTaffy_newYear_theme', JSON.stringify(enabled))
    },
    loadThemeState() {
      const saved = localStorage.getItem('foxTaffy_newYear_theme')
      if (saved !== null) {
        this.themeEnabled = JSON.parse(saved)
      }
    },
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

      if (this.themeEnabled) {
        root.style.setProperty('--ny-primary', '#4CAF50')
        root.style.setProperty('--ny-secondary', '#81C784')
        root.style.setProperty('--ny-accent', '#FFD54F')
        root.style.setProperty('--ny-glow', 'rgba(76, 175, 80, 0.3)')
        root.classList.add('new-year-active')
      } else {
        root.style.removeProperty('--ny-primary')
        root.style.removeProperty('--ny-secondary')
        root.style.removeProperty('--ny-accent')
        root.style.removeProperty('--ny-glow')
        root.classList.remove('new-year-active')
      }
    }
  },
  provide() {
    return {
      newYearThemeEnabled: () => this.themeEnabled,
      onNewYearStart: this.handleNewYearStart
    }
  }
}
</script>

<style scoped>
.new-year-theme {
  position: relative;
}

.theme-toggle {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4CAF50, #81C784);
  border: 3px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    0 5px 20px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(76, 175, 80, 0.5);
  cursor: pointer;
  z-index: 9998;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: bounce 2s ease-in-out infinite;
}

.theme-toggle:hover {
  transform: scale(1.1);
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(76, 175, 80, 0.7);
}

.theme-toggle:active {
  transform: scale(0.95);
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.toggle-icon {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  animation: rotate 4s linear infinite;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(10deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Мобильная адаптация */
@media (max-width: 768px) {
  .theme-toggle {
    bottom: 1.5rem;
    right: 1.5rem;
    width: 50px;
    height: 50px;
  }

  .toggle-icon {
    font-size: 1.5rem;
  }
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
