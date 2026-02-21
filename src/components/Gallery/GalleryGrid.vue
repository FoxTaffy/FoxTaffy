<template>
  <div class="ft-furry-gallery-grid">
    <GalleryCard
      v-for="(art, index) in arts"
      :key="art.id"
      v-memo="[art.id, art.is_nsfw, showNsfw, isNsfwUnlocked(art.id)]"
      :art="art"
      :show-nsfw="showNsfw"
      :is-unlocked="isNsfwUnlocked(art.id)"
      :card-index="index"
      @open-lightbox="$emit('open-lightbox', $event)"
      @unlock-nsfw="$emit('unlock-nsfw', $event)"
      @filter-artist="$emit('filter-artist', $event)"
      @filter-character="$emit('filter-character', $event)"
      @filter-tag="$emit('filter-tag', $event)"
    />
  </div>
</template>

<script setup>
import GalleryCard from './GalleryCard.vue'

defineProps({
  arts: { type: Array, required: true },
  showNsfw: { type: Boolean, default: false },
  isNsfwUnlocked: { type: Function, required: true }
})

defineEmits([
  'open-lightbox',
  'unlock-nsfw',
  'filter-artist',
  'filter-character',
  'filter-tag'
])
</script>

<style scoped>
/* Masonry Layout (Pinterest-style) via CSS columns */
.ft-furry-gallery-grid {
  columns: 3;
  column-gap: 1.5rem;
  column-fill: balance;
}

/* Prevent cards from breaking across columns */
.ft-furry-gallery-grid > :deep(.ft-simple-art-card) {
  break-inside: avoid;
  display: inline-block; /* needed for CSS columns masonry */
  width: 100%;
  margin-bottom: 1.5rem;
}

/* Staggered fade-in via nth-child */
.ft-furry-gallery-grid > :deep(.ft-simple-art-card:nth-child(1))  { animation-delay: 0ms; }
.ft-furry-gallery-grid > :deep(.ft-simple-art-card:nth-child(2))  { animation-delay: 40ms; }
.ft-furry-gallery-grid > :deep(.ft-simple-art-card:nth-child(3))  { animation-delay: 80ms; }
.ft-furry-gallery-grid > :deep(.ft-simple-art-card:nth-child(4))  { animation-delay: 120ms; }
.ft-furry-gallery-grid > :deep(.ft-simple-art-card:nth-child(5))  { animation-delay: 160ms; }
.ft-furry-gallery-grid > :deep(.ft-simple-art-card:nth-child(6))  { animation-delay: 200ms; }
.ft-furry-gallery-grid > :deep(.ft-simple-art-card:nth-child(7))  { animation-delay: 240ms; }
.ft-furry-gallery-grid > :deep(.ft-simple-art-card:nth-child(8))  { animation-delay: 280ms; }
.ft-furry-gallery-grid > :deep(.ft-simple-art-card:nth-child(9))  { animation-delay: 320ms; }
.ft-furry-gallery-grid > :deep(.ft-simple-art-card:nth-child(10)) { animation-delay: 360ms; }
.ft-furry-gallery-grid > :deep(.ft-simple-art-card:nth-child(11)) { animation-delay: 400ms; }
.ft-furry-gallery-grid > :deep(.ft-simple-art-card:nth-child(12)) { animation-delay: 440ms; }
.ft-furry-gallery-grid > :deep(.ft-simple-art-card:nth-child(n+13)) { animation-delay: 480ms; }

/* Responsive: fewer columns on smaller screens */
@media (max-width: 1024px) {
  .ft-furry-gallery-grid {
    columns: 2;
    column-gap: 1.25rem;
  }
  .ft-furry-gallery-grid > :deep(.ft-simple-art-card) {
    margin-bottom: 1.25rem;
  }
}

@media (max-width: 480px) {
  .ft-furry-gallery-grid {
    columns: 1;
    column-gap: 0;
  }
  .ft-furry-gallery-grid > :deep(.ft-simple-art-card) {
    margin-bottom: 1rem;
  }
}

/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .ft-furry-gallery-grid > :deep(.ft-simple-art-card) {
    animation: none !important;
  }
}
</style>
