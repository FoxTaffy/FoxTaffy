<template>
  <div class="countdown-container" v-if="showCountdown">
    <div class="countdown-card">
      <div class="countdown-header">
        <div class="snowflake">❄️</div>
        <h2 class="countdown-title">До Нового Года</h2>
        <div class="snowflake">❄️</div>
      </div>

      <div class="countdown-timer">
        <div class="time-block">
          <div class="time-value">{{ timeLeft.days }}</div>
          <div class="time-label">{{ getDaysLabel(timeLeft.days) }}</div>
        </div>
        <div class="separator">:</div>
        <div class="time-block">
          <div class="time-value">{{ formatNumber(timeLeft.hours) }}</div>
          <div class="time-label">{{ getHoursLabel(timeLeft.hours) }}</div>
        </div>
        <div class="separator">:</div>
        <div class="time-block">
          <div class="time-value">{{ formatNumber(timeLeft.minutes) }}</div>
          <div class="time-label">{{ getMinutesLabel(timeLeft.minutes) }}</div>
        </div>
        <div class="separator">:</div>
        <div class="time-block">
          <div class="time-value">{{ formatNumber(timeLeft.seconds) }}</div>
          <div class="time-label">{{ getSecondsLabel(timeLeft.seconds) }}</div>
        </div>
      </div>

      <div class="countdown-message">
        <span class="tree-emoji">🎄</span>
        {{ getMessage() }}
        <span class="tree-emoji">🎄</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NewYearCountdown',
  data() {
    return {
      timeLeft: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      interval: null,
      showCountdown: true
    }
  },
  mounted() {
    this.updateCountdown()
    this.interval = setInterval(this.updateCountdown, 1000)
  },
  beforeUnmount() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  },
  methods: {
    updateCountdown() {
      const now = new Date()
      const currentYear = now.getFullYear()
      const newYear = new Date(currentYear + 1, 0, 1, 0, 0, 0)

      const diff = newYear - now

      if (diff <= 0) {
        // Новый год наступил!
        this.$emit('new-year-started')
        this.showCountdown = false
        return
      }

      this.timeLeft = {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      }
    },
    formatNumber(num) {
      return num.toString().padStart(2, '0')
    },
    getDaysLabel(days) {
      const lastDigit = days % 10
      const lastTwoDigits = days % 100

      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'дней'
      }
      if (lastDigit === 1) {
        return 'день'
      }
      if (lastDigit >= 2 && lastDigit <= 4) {
        return 'дня'
      }
      return 'дней'
    },
    getHoursLabel(hours) {
      const lastDigit = hours % 10
      const lastTwoDigits = hours % 100

      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'часов'
      }
      if (lastDigit === 1) {
        return 'час'
      }
      if (lastDigit >= 2 && lastDigit <= 4) {
        return 'часа'
      }
      return 'часов'
    },
    getMinutesLabel(minutes) {
      const lastDigit = minutes % 10
      const lastTwoDigits = minutes % 100

      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'минут'
      }
      if (lastDigit === 1) {
        return 'минута'
      }
      if (lastDigit >= 2 && lastDigit <= 4) {
        return 'минуты'
      }
      return 'минут'
    },
    getSecondsLabel(seconds) {
      const lastDigit = seconds % 10
      const lastTwoDigits = seconds % 100

      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'секунд'
      }
      if (lastDigit === 1) {
        return 'секунда'
      }
      if (lastDigit >= 2 && lastDigit <= 4) {
        return 'секунды'
      }
      return 'секунд'
    },
    getMessage() {
      const { days, hours } = this.timeLeft

      if (days === 0 && hours < 1) {
        return 'Скоро Новый Год! 🎉'
      }
      if (days === 0) {
        return 'Сегодня Новый Год! 🎊'
      }
      if (days <= 7) {
        return 'Совсем скоро праздник! ✨'
      }
      return 'Готовимся к празднику! 🎁'
    }
  }
}
</script>

<style scoped>
.countdown-container {
  position: fixed;
  top: 140px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 998;
  animation: slideDown 0.8s ease-out;
}

.countdown-card {
  background: linear-gradient(135deg, rgba(0, 20, 10, 0.95), rgba(10, 40, 20, 0.95));
  border: 2px solid rgba(0, 255, 65, 0.3);
  border-radius: 20px;
  padding: 1.5rem 2.5rem;
  box-shadow:
    0 10px 40px rgba(0, 255, 65, 0.2),
    0 0 60px rgba(0, 255, 65, 0.1),
    inset 0 0 30px rgba(0, 255, 65, 0.05);
  backdrop-filter: blur(10px);
  animation: glow 2s ease-in-out infinite;
}

.countdown-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.snowflake {
  font-size: 1.5rem;
  animation: rotate 4s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.countdown-title {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #00ff41, #adff2f, #7fff00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(0, 255, 65, 0.5);
  animation: textGlow 2s ease-in-out infinite;
}

.countdown-timer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.time-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(0, 255, 65, 0.1);
  border: 1px solid rgba(0, 255, 65, 0.3);
  border-radius: 12px;
  min-width: 80px;
  box-shadow:
    0 4px 15px rgba(0, 255, 65, 0.1),
    inset 0 0 15px rgba(0, 255, 65, 0.05);
  transition: all 0.3s ease;
}

.time-block:hover {
  transform: translateY(-5px);
  box-shadow:
    0 8px 25px rgba(0, 255, 65, 0.2),
    inset 0 0 20px rgba(0, 255, 65, 0.1);
  border-color: rgba(0, 255, 65, 0.5);
}

.time-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: #00ff41;
  text-shadow:
    0 0 10px rgba(0, 255, 65, 0.8),
    0 0 20px rgba(0, 255, 65, 0.5),
    0 0 30px rgba(0, 255, 65, 0.3);
  font-family: 'Courier New', monospace;
  line-height: 1;
}

.time-label {
  font-size: 0.85rem;
  color: #adff2f;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(173, 255, 47, 0.5);
}

.separator {
  font-size: 2.5rem;
  font-weight: 800;
  color: #7fff00;
  text-shadow: 0 0 20px rgba(127, 255, 0, 0.6);
  animation: blink 1s ease-in-out infinite;
}

.countdown-message {
  text-align: center;
  font-size: 1.1rem;
  color: #adff2f;
  font-weight: 600;
  margin-top: 1rem;
  text-shadow: 0 0 10px rgba(173, 255, 47, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.tree-emoji {
  font-size: 1.3rem;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes glow {
  0%, 100% {
    box-shadow:
      0 10px 40px rgba(0, 255, 65, 0.2),
      0 0 60px rgba(0, 255, 65, 0.1),
      inset 0 0 30px rgba(0, 255, 65, 0.05);
  }
  50% {
    box-shadow:
      0 10px 50px rgba(0, 255, 65, 0.3),
      0 0 80px rgba(0, 255, 65, 0.15),
      inset 0 0 40px rgba(0, 255, 65, 0.08);
  }
}

@keyframes textGlow {
  0%, 100% {
    text-shadow: 0 0 30px rgba(0, 255, 65, 0.5);
  }
  50% {
    text-shadow: 0 0 50px rgba(0, 255, 65, 0.8);
  }
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .countdown-container {
    top: 110px;
  }

  .countdown-card {
    padding: 1rem 1.5rem;
  }

  .countdown-title {
    font-size: 1.4rem;
  }

  .time-block {
    min-width: 60px;
    padding: 0.75rem;
  }

  .time-value {
    font-size: 2rem;
  }

  .time-label {
    font-size: 0.7rem;
  }

  .separator {
    font-size: 2rem;
  }

  .countdown-message {
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .countdown-container {
    top: 100px;
    left: 10px;
    right: 10px;
    transform: none;
  }

  .countdown-card {
    padding: 0.75rem 1rem;
  }

  .countdown-title {
    font-size: 1.2rem;
  }

  .snowflake {
    font-size: 1.2rem;
  }

  .time-block {
    min-width: 50px;
    padding: 0.5rem;
    gap: 0.3rem;
  }

  .time-value {
    font-size: 1.5rem;
  }

  .time-label {
    font-size: 0.6rem;
  }

  .separator {
    font-size: 1.5rem;
    margin: 0 0.2rem;
  }

  .countdown-timer {
    gap: 0.5rem;
  }

  .countdown-message {
    font-size: 0.85rem;
  }

  .tree-emoji {
    font-size: 1rem;
  }
}
</style>
