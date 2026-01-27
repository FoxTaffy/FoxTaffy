<template>
  <div class="star-rating" :class="[sizeClass, { 'show-value': showValue }]">
    <div class="stars">
      <i
        v-for="n in 5"
        :key="n"
        class="star-icon"
        :class="getStarClass(n)"
      ></i>
    </div>
    <span v-if="showValue && numericRating > 0" class="rating-value">{{ formattedRating }}/5</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  rating: {
    type: [Number, String],
    required: true,
    default: 0
  },
  size: {
    type: String,
    default: 'medium', // 'small', 'medium', 'large'
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  showValue: {
    type: Boolean,
    default: false
  }
})

// Преобразуем rating в число и валидируем
const numericRating = computed(() => {
  const num = typeof props.rating === 'string' ? parseFloat(props.rating) : props.rating

  // Валидация: должно быть число от 0 до 5
  if (isNaN(num) || num < 0) return 0
  if (num > 5) return 5

  return num
})

// Форматированное значение для отображения
const formattedRating = computed(() => {
  return numericRating.value.toFixed(1)
})

const sizeClass = computed(() => `size-${props.size}`)

/**
 * Определяет класс для звезды на позиции n
 * @param {number} n - позиция звезды (1-5)
 * @returns {string} класс для звезды
 */
const getStarClass = (n) => {
  const rating = numericRating.value

  // Полная звезда
  if (n <= Math.floor(rating)) {
    return 'fas fa-star filled'
  }

  // Половинная звезда (если есть дробная часть >= 0.25 и < 0.75)
  if (n === Math.ceil(rating)) {
    const decimal = rating - Math.floor(rating)
    if (decimal >= 0.25 && decimal < 0.75) {
      return 'fas fa-star-half-alt half'
    } else if (decimal >= 0.75) {
      return 'fas fa-star filled'
    }
  }

  // Пустая звезда
  return 'far fa-star empty'
}
</script>

<style scoped>
.star-rating {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.stars {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
}

.star-icon {
  transition: all 0.2s ease;
}

/* Размеры */
.size-small .star-icon {
  font-size: 0.875rem;
}

.size-medium .star-icon {
  font-size: 1.125rem;
}

.size-large .star-icon {
  font-size: 1.5rem;
}

/* Цвета звезд */
.star-icon.filled {
  color: #ffc107;
  filter: drop-shadow(0 0 2px rgba(255, 193, 7, 0.5));
}

.star-icon.half {
  color: #ffc107;
  filter: drop-shadow(0 0 2px rgba(255, 193, 7, 0.5));
}

.star-icon.empty {
  color: rgba(255, 193, 7, 0.25);
}

/* Значение рейтинга */
.rating-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
  white-space: nowrap;
}

.size-large .rating-value {
  font-size: 1.125rem;
}

/* Hover эффект */
.star-rating:hover .star-icon.filled,
.star-rating:hover .star-icon.half {
  transform: scale(1.1);
}

/* Темная тема */
@media (prefers-color-scheme: dark) {
  .star-icon.empty {
    color: rgba(255, 193, 7, 0.2);
  }

  .rating-value {
    color: #aaa;
  }
}
</style>
