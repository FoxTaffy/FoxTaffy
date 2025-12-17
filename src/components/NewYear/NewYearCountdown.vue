<template>
  <div class="countdown-wrapper">
    <div class="countdown-container" v-if="!isNewYear">
      <div class="countdown-header">
        <div class="snowflake">❄</div>
        <h2 class="countdown-title">До Нового Года осталось</h2>
        <div class="snowflake">❄</div>
      </div>

      <div class="countdown-timer">
        <div class="time-block">
          <div class="time-value">{{ days }}</div>
          <div class="time-label">{{ getDaysLabel(days) }}</div>
        </div>

        <div class="time-separator">:</div>

        <div class="time-block">
          <div class="time-value">{{ hours }}</div>
          <div class="time-label">{{ getHoursLabel(hours) }}</div>
        </div>

        <div class="time-separator">:</div>

        <div class="time-block">
          <div class="time-value">{{ minutes }}</div>
          <div class="time-label">{{ getMinutesLabel(minutes) }}</div>
        </div>

        <div class="time-separator">:</div>

        <div class="time-block">
          <div class="time-value">{{ seconds }}</div>
          <div class="time-label">{{ getSecondsLabel(seconds) }}</div>
        </div>
      </div>

      <div class="countdown-message">
        Готовьтесь к празднику! 🎉
      </div>
    </div>

    <div class="new-year-message" v-else>
      <h1 class="celebration-title">🎊 С Новым 2026 Годом! 🎊</h1>
      <p class="celebration-subtitle">Пусть этот год принесёт вам счастье и радость!</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NewYearCountdown',
  data() {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isNewYear: false,
      timer: null
    }
  },
  mounted() {
    this.updateCountdown()
    this.timer = setInterval(this.updateCountdown, 1000)
  },
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    updateCountdown() {
      const now = new Date()
      const currentYear = now.getFullYear()
      const newYear = new Date(`January 1, ${currentYear + 1} 00:00:00`)

      const diff = newYear - now

      if (diff <= 0) {
        this.isNewYear = true
        this.$emit('new-year-started')
        if (this.timer) {
          clearInterval(this.timer)
        }
        return
      }

      this.days = Math.floor(diff / (1000 * 60 * 60 * 24))
      this.hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      this.minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      this.seconds = Math.floor((diff % (1000 * 60)) / 1000)
    },
    getDaysLabel(days) {
      const lastDigit = days % 10
      const lastTwoDigits = days % 100

      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'дней'
      if (lastDigit === 1) return 'день'
      if (lastDigit >= 2 && lastDigit <= 4) return 'дня'
      return 'дней'
    },
    getHoursLabel(hours) {
      const lastDigit = hours % 10
      const lastTwoDigits = hours % 100

      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'часов'
      if (lastDigit === 1) return 'час'
      if (lastDigit >= 2 && lastDigit <= 4) return 'часа'
      return 'часов'
    },
    getMinutesLabel(minutes) {
      const lastDigit = minutes % 10
      const lastTwoDigits = minutes % 100

      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'минут'
      if (lastDigit === 1) return 'минута'
      if (lastDigit >= 2 && lastDigit <= 4) return 'минуты'
      return 'минут'
    },
    getSecondsLabel(seconds) {
      const lastDigit = seconds % 10
      const lastTwoDigits = seconds % 100

      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'секунд'
      if (lastDigit === 1) return 'секунда'
      if (lastDigit >= 2 && lastDigit <= 4) return 'секунды'
      return 'секунд'
    }
  }
}
</script>

<style scoped>
.countdown-wrapper {
  width: 100%;
  padding: 2rem 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, rgba(26, 35, 126, 0.1) 0%, rgba(21, 101, 192, 0.1) 100%);
  position: relative;
  overflow: hidden;
}

.countdown-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 50%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 50%, rgba(255, 123, 37, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.countdown-container {
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2.5rem 3rem;
  border: 2px solid rgba(76, 175, 80, 0.3);
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(76, 175, 80, 0.2),
    inset 0 0 20px rgba(76, 175, 80, 0.05);
  position: relative;
  z-index: 1;
  max-width: 900px;
  width: 100%;
}

.countdown-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.snowflake {
  font-size: 2rem;
  animation: snowflakeFloat 3s ease-in-out infinite;
}

.snowflake:nth-child(1) {
  animation-delay: 0s;
}

.snowflake:nth-child(3) {
  animation-delay: 1.5s;
}

@keyframes snowflakeFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(180deg);
  }
}

.countdown-title {
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, #4CAF50, #81C784, #FFD54F);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  text-align: center;
  text-shadow: 0 0 30px rgba(76, 175, 80, 0.3);
}

.countdown-timer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.time-block {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(129, 199, 132, 0.15));
  border: 2px solid rgba(76, 175, 80, 0.4);
  border-radius: 15px;
  padding: 1.5rem 1rem;
  min-width: 120px;
  text-align: center;
  box-shadow:
    0 5px 15px rgba(0, 0, 0, 0.2),
    0 0 15px rgba(76, 175, 80, 0.2),
    inset 0 0 15px rgba(76, 175, 80, 0.1);
  transition: all 0.3s ease;
  animation: pulse 2s ease-in-out infinite;
}

.time-block:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.3),
    0 0 25px rgba(76, 175, 80, 0.4),
    inset 0 0 20px rgba(76, 175, 80, 0.15);
  border-color: rgba(76, 175, 80, 0.6);
}

@keyframes pulse {
  0%, 100% {
    box-shadow:
      0 5px 15px rgba(0, 0, 0, 0.2),
      0 0 15px rgba(76, 175, 80, 0.2),
      inset 0 0 15px rgba(76, 175, 80, 0.1);
  }
  50% {
    box-shadow:
      0 5px 15px rgba(0, 0, 0, 0.2),
      0 0 25px rgba(76, 175, 80, 0.4),
      inset 0 0 20px rgba(76, 175, 80, 0.15);
  }
}

.time-value {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #4CAF50, #81C784);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 20px rgba(76, 175, 80, 0.3);
}

.time-label {
  font-size: 0.9rem;
  color: #81C784;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.time-separator {
  font-size: 3rem;
  font-weight: 700;
  color: #4CAF50;
  text-shadow: 0 0 20px rgba(76, 175, 80, 0.5);
  animation: blink 1.5s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.countdown-message {
  text-align: center;
  font-size: 1.2rem;
  color: #FFD54F;
  font-weight: 600;
  animation: messageGlow 2s ease-in-out infinite;
}

@keyframes messageGlow {
  0%, 100% {
    text-shadow: 0 0 10px rgba(255, 213, 79, 0.5);
  }
  50% {
    text-shadow: 0 0 20px rgba(255, 213, 79, 0.8);
  }
}

.new-year-message {
  text-align: center;
  padding: 3rem 2rem;
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 2px solid rgba(255, 213, 79, 0.5);
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(255, 213, 79, 0.3);
  animation: celebration 1s ease-in-out;
}

@keyframes celebration {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.celebration-title {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #FFD54F, #FFA726, #FF7043);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  animation: celebrationPulse 1.5s ease-in-out infinite;
}

@keyframes celebrationPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.celebration-subtitle {
  font-size: 1.5rem;
  color: #81C784;
  font-weight: 600;
}

/* Мобильная адаптация */
@media (max-width: 768px) {
  .countdown-container {
    padding: 2rem 1.5rem;
  }

  .countdown-title {
    font-size: 1.3rem;
  }

  .countdown-timer {
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .time-block {
    min-width: 80px;
    padding: 1rem 0.5rem;
  }

  .time-value {
    font-size: 2rem;
  }

  .time-label {
    font-size: 0.75rem;
  }

  .time-separator {
    font-size: 2rem;
    display: none;
  }

  .countdown-message {
    font-size: 1rem;
  }

  .celebration-title {
    font-size: 2rem;
  }

  .celebration-subtitle {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .countdown-title {
    font-size: 1.1rem;
  }

  .time-block {
    min-width: 70px;
    padding: 0.75rem 0.4rem;
  }

  .time-value {
    font-size: 1.5rem;
  }

  .time-label {
    font-size: 0.65rem;
  }

  .snowflake {
    font-size: 1.5rem;
  }
}
</style>
