<template>
  <div class="section countdown-section" id="countdown">
    <h2 class="section-title">
      <span class="snowflake-left">❄</span>
      До Нового Года осталось
      <span class="snowflake-right">❄</span>
    </h2>

    <div class="countdown-container" v-if="!isNewYear">

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
        <span class="celebration-icon">🎉</span>
        Готовьтесь к празднику!
        <span class="celebration-icon">🎉</span>
      </div>
    </div>

    <div class="new-year-message" v-else>
      <h3 class="celebration-title">🎊 С Новым 2026 Годом! 🎊</h3>
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
.countdown-section {
  position: relative;
  overflow: visible;
}

/* Снежинки в заголовке */
.snowflake-left,
.snowflake-right {
  display: inline-block;
  font-size: 1.5rem;
  animation: snowflakeFloat 3s ease-in-out infinite;
  margin: 0 1rem;
}

.snowflake-right {
  animation-delay: 1.5s;
}

@keyframes snowflakeFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-5px) rotate(180deg);
  }
}

.countdown-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem 1rem;
}

.countdown-timer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.time-block {
  background: rgba(34, 34, 34, 0.6);
  border: 2px solid rgba(76, 175, 80, 0.3);
  border-radius: 12px;
  padding: 1.5rem 1rem;
  min-width: 110px;
  text-align: center;
  box-shadow:
    0 4px 10px rgba(0, 0, 0, 0.3),
    0 0 15px rgba(76, 175, 80, 0.15);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.time-block::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, transparent, rgba(76, 175, 80, 0.2), transparent);
  border-radius: 12px;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s ease;
}

.time-block:hover::before {
  opacity: 1;
  animation: borderShine 2s linear infinite;
}

.time-block:hover {
  transform: translateY(-3px);
  border-color: rgba(76, 175, 80, 0.5);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.4),
    0 0 25px rgba(76, 175, 80, 0.3);
}

@keyframes borderShine {
  0% {
    filter: hue-rotate(0deg);
  }
  100% {
    filter: hue-rotate(360deg);
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
  font-size: 1.1rem;
  color: #FFD54F;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.celebration-icon {
  display: inline-block;
  animation: bounce 1s ease-in-out infinite;
}

.celebration-icon:nth-child(1) {
  animation-delay: 0s;
}

.celebration-icon:nth-child(3) {
  animation-delay: 0.5s;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-5px) scale(1.1);
  }
}

.new-year-message {
  text-align: center;
  padding: 2rem;
  animation: celebration 1s ease-in-out;
}

@keyframes celebration {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.celebration-title {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #FFD54F, #FFA726, #FF7043);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 1rem 0;
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
  font-size: 1.3rem;
  color: #81C784;
  font-weight: 600;
  margin: 0;
}

/* Мобильная адаптация */
@media (max-width: 768px) {
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
    font-size: 1.1rem;
  }

  .snowflake-left,
  .snowflake-right {
    font-size: 1.2rem;
    margin: 0 0.5rem;
  }
}

@media (max-width: 480px) {
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

  .celebration-title {
    font-size: 1.5rem;
  }

  .celebration-subtitle {
    font-size: 1rem;
  }
}
</style>
