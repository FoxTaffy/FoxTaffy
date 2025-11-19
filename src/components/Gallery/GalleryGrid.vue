<template>
  <div class="ft-furry-gallery-grid">
    <GalleryCard
      v-for="art in arts"
      :key="art.id"
      v-memo="[art.id, art.is_nsfw, showNsfw, isNsfwUnlocked(art.id)]"
      :art="art"
      :show-nsfw="showNsfw"
      :is-unlocked="isNsfwUnlocked(art.id)"
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
.ft-furry-gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .ft-furry-gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }
}
</style>
