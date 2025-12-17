<template>
  <div class="christmas-toggle-wrapper">
    <button
      class="christmas-toggle"
      @click="toggleTheme"
      :class="{ 'active': isChristmasTheme }"
      :title="isChristmasTheme ? 'Выключить новогоднюю тему' : 'Включить новогоднюю тему'"
    >
      <div class="toggle-icon">
        <span v-if="!isChristmasTheme" class="tree-icon">🎄</span>
        <span v-else class="normal-icon">🦊</span>
      </div>
      <div class="toggle-glow"></div>
    </button>
    <div class="toggle-tooltip">
      {{ isChristmasTheme ? 'Обычная тема' : 'Новогодняя тема' }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChristmasToggle',
  data() {
    return {
      isChristmasTheme: false
    }
  },
  mounted() {
    // Проверяем сохранённую настройку
    const saved = localStorage.getItem('foxTaffy_christmas_theme')
    if (saved === 'true') {
      this.isChristmasTheme = true
      this.$emit('theme-changed', true)
    }
  },
  methods: {
    toggleTheme() {
      this.isChristmasTheme = !this.isChristmasTheme
      localStorage.setItem('foxTaffy_christmas_theme', this.isChristmasTheme)
      this.$emit('theme-changed', this.isChristmasTheme)
    }
  }
}
</script>

<style scoped>
.christmas-toggle-wrapper {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1001;
}

.christmas-toggle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid rgba(255, 123, 37, 0.5);
  background: linear-gradient(135deg,
    rgba(26, 26, 26, 0.95),
    rgba(40, 40, 40, 0.95)
  );
  backdrop-filter: blur(10px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow:
    0 5px 25px rgba(255, 123, 37, 0.3),
    inset 0 0 20px rgba(255, 123, 37, 0.1);
  overflow: hidden;
}

.christmas-toggle:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow:
    0 8px 35px rgba(255, 123, 37, 0.5),
    inset 0 0 30px rgba(255, 123, 37, 0.2);
}

.christmas-toggle.active {
  border-color: rgba(0, 255, 65, 0.6);
  background: linear-gradient(135deg,
    rgba(10, 20, 16, 0.95),
    rgba(15, 31, 21, 0.95)
  );
  box-shadow:
    0 5px 25px rgba(0, 255, 65, 0.4),
    inset 0 0 20px rgba(0, 255, 65, 0.15);
  animation: christmasPulse 2s ease-in-out infinite;
}

.christmas-toggle.active:hover {
  box-shadow:
    0 8px 35px rgba(0, 255, 65, 0.6),
    inset 0 0 30px rgba(0, 255, 65, 0.25);
}

.toggle-icon {
  font-size: 2rem;
  position: relative;
  z-index: 2;
  animation: iconBounce 0.6s ease-out;
}

@keyframes iconBounce {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.toggle-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle,
    rgba(255, 123, 37, 0.3) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.christmas-toggle:hover .toggle-glow {
  opacity: 1;
  animation: glowPulse 1.5s ease-in-out infinite;
}

.christmas-toggle.active .toggle-glow {
  background: radial-gradient(circle,
    rgba(0, 255, 65, 0.4) 0%,
    transparent 70%
  );
}

@keyframes glowPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }
}

@keyframes christmasPulse {
  0%, 100% {
    box-shadow:
      0 5px 25px rgba(0, 255, 65, 0.4),
      inset 0 0 20px rgba(0, 255, 65, 0.15);
  }
  50% {
    box-shadow:
      0 5px 35px rgba(0, 255, 65, 0.6),
      inset 0 0 30px rgba(0, 255, 65, 0.25);
  }
}

.toggle-tooltip {
  position: absolute;
  bottom: 70px;
  right: 0;
  background: rgba(26, 26, 26, 0.95);
  color: #f2f2f2;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 123, 37, 0.3);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  pointer-events: none;
}

.christmas-toggle-wrapper:hover .toggle-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.christmas-toggle.active ~ .toggle-tooltip {
  border-color: rgba(0, 255, 65, 0.4);
  background: rgba(10, 20, 16, 0.95);
  color: #00ff41;
  text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

/* Мобильная адаптация */
@media (max-width: 768px) {
  .christmas-toggle-wrapper {
    bottom: 20px;
    right: 20px;
  }

  .christmas-toggle {
    width: 50px;
    height: 50px;
  }

  .toggle-icon {
    font-size: 1.6rem;
  }

  .toggle-tooltip {
    font-size: 0.75rem;
    bottom: 60px;
  }
}

@media (max-width: 480px) {
  .christmas-toggle {
    width: 45px;
    height: 45px;
  }

  .toggle-icon {
    font-size: 1.4rem;
  }
}
</style>
