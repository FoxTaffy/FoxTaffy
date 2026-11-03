<script setup>
defineProps({
  items: { type: Array, required: true }, // [{ src, title, sub? }]
  loading: { type: Boolean, default: false },
  portrait: { type: Boolean, default: false }
})
defineEmits(['open'])
</script>

<template>
  <div class="grid-cards is-compact">
    <template v-if="loading">
      <div v-for="n in 6" :key="n" class="card skeleton"></div>
    </template>
    <template v-else>
      <button
        v-for="(item, i) in items"
        :key="item.src"
        type="button"
        class="card media-card reveal"
        @click="$emit('open', i)"
      >
        <div class="media-card-img" :class="{ 'is-portrait': portrait }">
          <img :src="item.src" :alt="item.title" loading="lazy" decoding="async" referrerpolicy="no-referrer">
        </div>
        <div class="media-card-body">
          <h3 class="media-card-title">{{ item.title }}</h3>
          <p v-if="item.sub" class="media-card-meta">{{ item.sub }}</p>
        </div>
      </button>
    </template>
  </div>
</template>
