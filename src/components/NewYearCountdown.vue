<template>
  <div v-if="isHolidaySeason" class="new-year-countdown">
    <div class="countdown-header">
      <span class="countdown-decoration">✨</span>
      <h2 class="countdown-title">
        {{ countdownTitle }}
      </h2>
      <span class="countdown-decoration">✨</span>
    </div>

    <div v-if="!isNewYear" class="countdown-timer">
      <div class="countdown-block">
        <span class="countdown-number">{{ days }}</span>
        <span class="countdown-label">{{ getDaysLabel(days) }}</span>
      </div>
      <div class="countdown-block">
        <span class="countdown-number">{{ hours }}</span>
        <span class="countdown-label">{{ getHoursLabel(hours) }}</span>
      </div>
      <div class="countdown-block">
        <span class="countdown-number">{{ minutes }}</span>
        <span class="countdown-label">{{ getMinutesLabel(minutes) }}</span>
      </div>
      <div class="countdown-block">
        <span class="countdown-number">{{ seconds }}</span>
        <span class="countdown-label">{{ getSecondsLabel(seconds) }}</span>
      </div>
    </div>

    <p v-if="isNewYear" class="countdown-message">
      🎉 С Новым {{ currentYear }} Годом! 🎊
    </p>
    <p v-else class="countdown-message">
      {{ motivationalMessage }}
    </p>
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
      intervalId: null,
      currentYear: new Date().getFullYear(),
      motivationalMessages: [
        '✨ Скоро волшебство Нового года! ✨',
        '🎄 Готовимся к празднику! 🎄',
        '⭐ Новогоднее чудо уже близко! ⭐',
        '🎁 Время загадывать желания! 🎁',
        '❄️ Новый год не за горами! ❄️',
        '🎊 Праздничное настроение нарастает! 🎊'
      ]
    }
  },
  computed: {
    isHolidaySeason() {
      const now = new Date()
      const month = now.getMonth() + 1
      const day = now.getDate()

      // С 1 декабря по 1 февраля
      return (month === 12) || (month === 1 && day === 1)
    },
    isNewYear() {
      const now = new Date()
      const month = now.getMonth() + 1
      const day = now.getDate()

      // 1 января
      return month === 1 && day === 1
    },
    countdownTitle() {
      if (this.isNewYear) {
        return `🎊 С Новым ${this.currentYear} Годом! 🎊`
      }

      const nextYear = new Date().getMonth() === 11
        ? new Date().getFullYear() + 1
        : new Date().getFullYear()

      return `⏰ До Нового ${nextYear} года осталось:`
    },
    motivationalMessage() {
      return this.motivationalMessages[
        Math.floor(this.days / 5) % this.motivationalMessages.length
      ]
    }
  },
  mounted() {
    if (this.isHolidaySeason && !this.isNewYear) {
      this.updateCountdown()
      this.intervalId = setInterval(this.updateCountdown, 1000)
    }
  },
  beforeUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  },
  methods: {
    updateCountdown() {
      const now = new Date()
      const currentYear = now.getFullYear()
      const nextYear = now.getMonth() === 11 ? currentYear + 1 : currentYear
      const newYear = new Date(nextYear, 0, 1, 0, 0, 0)

      const diff = newYear - now

      if (diff <= 0) {
        this.days = 0
        this.hours = 0
        this.minutes = 0
        this.seconds = 0
        if (this.intervalId) {
          clearInterval(this.intervalId)
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
    }
  }
}
</script>
