<script setup>
import { reactive } from 'vue'
import { useReveal } from '@/composables/useReveal'

defineProps({
  // [{ id, year, date?, title, text?, image?, icon?, bullets?, note? }]
  items: { type: Array, required: true }
})
defineEmits(['open'])

const failed = reactive(new Set()) // картинки, которые не загрузились

useReveal({ selector: '.timeline-item', className: 'animate' })
</script>

<template>
  <div class="timeline">
    <article v-for="item in items" :id="item.id" :key="item.id" class="timeline-item">
      <div class="timeline-date">
        <div class="year">{{ item.year }}</div>
        <div v-if="item.date" class="date-label">{{ item.date }}</div>
      </div>

      <div class="timeline-content">
        <h3>{{ item.title }}</h3>

        <button
          v-if="item.image && !failed.has(item.id)"
          type="button"
          class="media-card-img"
          :aria-label="`Открыть: ${item.title}`"
          @click="$emit('open', item.id)"
        >
          <img :src="item.image" :alt="item.title" loading="lazy" decoding="async" referrerpolicy="no-referrer" @error="failed.add(item.id)">
        </button>
        <div v-else-if="!item.image" class="media-card-img is-compact" role="img" :aria-label="`${item.title}: референс скоро появится`">
          <div class="media-card-placeholder"><i :class="item.icon || 'fas fa-paint-brush'"></i></div>
        </div>

        <p v-if="item.text">{{ item.text }}</p>

        <ul v-if="item.bullets?.length" class="feature-list">
          <li v-for="bullet in item.bullets" :key="bullet" class="feature-list-item">
            <i class="fas fa-bolt text-accent"></i>
            <span>{{ bullet }}</span>
          </li>
        </ul>

        <blockquote v-if="item.note" class="callout"><p>{{ item.note }}</p></blockquote>
      </div>
    </article>
  </div>
</template>
