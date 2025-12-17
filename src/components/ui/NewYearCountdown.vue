<template>
  <div class="countdown-container" v-if="showCountdown">
    <div class="countdown-card">
      <div class="countdown-header">
        <span class="snowflake">❄️</span>
        <h2 class="countdown-title">До Нового Года:</h2>
        <span class="snowflake">❄️</span>
      </div>

      <div class="countdown-display">
        <span class="time-text">
          <span class="time-number">{{ timeLeft.days }}</span> {{ getDaysLabel(timeLeft.days) }}
          <span class="separator">:</span>
          <span class="time-number">{{ formatNumber(timeLeft.hours) }}</span> {{ getHoursLabel(timeLeft.hours) }}
          <span class="separator">:</span>
          <span class="time-number">{{ formatNumber(timeLeft.minutes) }}</span> {{ getMinutesLabel(timeLeft.minutes) }}
          <span class="separator">:</span>
          <span class="time-number">{{ formatNumber(timeLeft.seconds) }}</span> {{ getSecondsLabel(timeLeft.seconds) }}
        </span>
      </div>

      <div class="countdown-message">
        <span class="emoji">🎄</span>
        {{ getMessage() }}
        <span class="emoji">🎁</span>
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
  background: linear-gradient(135deg,
    rgba(139, 0, 0, 0.95),
    rgba(25, 80, 25, 0.95),
    rgba(139, 0, 0, 0.95)
  );
  border: 3px solid;
  border-image: linear-gradient(90deg,
    #ff0000, #ffd700, #00ff00, #0088ff, #ff00ff
  ) 1;
  border-radius: 20px;
  padding: 1.5rem 3rem;
  box-shadow:
    0 10px 50px rgba(255, 215, 0, 0.3),
    0 0 80px rgba(255, 0, 0, 0.2),
    inset 0 0 40px rgba(255, 215, 0, 0.1);
  backdrop-filter: blur(15px);
  animation: cardGlow 3s ease-in-out infinite;
}

.countdown-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  margin-bottom: 0.5rem;
}

.snowflake {
  font-size: 1.5rem;
  animation: rotate 4s linear infinite;
  filter: drop-shadow(0 0 5px rgba(135, 206, 250, 0.8));
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.countdown-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #ffd700, #ffffff, #ffd700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8));
}

.countdown-display {
  text-align: center;
  margin-bottom: 0.5rem;
}

.time-text {
  font-size: 1.8rem;
  font-weight: 800;
  font-family: 'Courier New', monospace;
  color: #ffffff;
  text-shadow:
    0 0 10px rgba(255, 255, 255, 0.8),
    0 0 20px rgba(255, 215, 0, 0.6),
    0 0 30px rgba(255, 0, 0, 0.4);
  display: inline-block;
}

.time-number {
  background: linear-gradient(135deg, #ff0000, #ffd700, #00ff00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 2.2rem;
  font-weight: 900;
  padding: 0 0.3rem;
  animation: numberPulse 1s ease-in-out infinite;
}

.separator {
  color: #ffd700;
  margin: 0 0.3rem;
  animation: blink 1.5s ease-in-out infinite;
}

.countdown-message {
  text-align: center;
  font-size: 1rem;
  color: #ffffff;
  font-weight: 600;
  margin-top: 0.5rem;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.emoji {
  font-size: 1.2rem;
  animation: bounce 2s ease-in-out infinite;
  filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.8));
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

@keyframes cardGlow {
  0%, 100% {
    box-shadow:
      0 10px 50px rgba(255, 215, 0, 0.3),
      0 0 80px rgba(255, 0, 0, 0.2),
      inset 0 0 40px rgba(255, 215, 0, 0.1);
  }
  50% {
    box-shadow:
      0 10px 60px rgba(255, 0, 0, 0.4),
      0 0 100px rgba(255, 215, 0, 0.3),
      inset 0 0 50px rgba(0, 255, 0, 0.15);
  }
}

@keyframes numberPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
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
    padding: 1rem 2rem;
  }

  .countdown-title {
    font-size: 1.1rem;
  }

  .time-text {
    font-size: 1.4rem;
  }

  .time-number {
    font-size: 1.7rem;
  }

  .countdown-message {
    font-size: 0.9rem;
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
    font-size: 0.9rem;
  }

  .snowflake {
    font-size: 1rem;
  }

  .time-text {
    font-size: 1rem;
    line-height: 1.4;
  }

  .time-number {
    font-size: 1.3rem;
  }

  .separator {
    margin: 0 0.1rem;
  }

  .countdown-message {
    font-size: 0.75rem;
  }

  .emoji {
    font-size: 1rem;
  }
}
</style>
