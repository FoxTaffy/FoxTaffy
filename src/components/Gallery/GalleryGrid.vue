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
/* Pinterest-style Masonry Grid */
.ft-furry-gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  grid-auto-flow: dense;
}

/* Автоматическая высота карточек для masonry эффекта */
.ft-furry-gallery-grid > * {
  grid-row: span 1;
}

/* Поддержка CSS Columns для лучшего masonry */
@supports (column-count: 3) {
  .ft-furry-gallery-grid {
    column-count: 4;
    column-gap: 1.5rem;
    grid-template-columns: unset;
  }

  .ft-furry-gallery-grid > * {
    break-inside: avoid;
    margin-bottom: 1.5rem;
    display: inline-block;
    width: 100%;
  }
}

/* Адаптивное количество колонок */
@media (max-width: 1400px) {
  @supports (column-count: 3) {
    .ft-furry-gallery-grid {
      column-count: 3;
    }
  }
}

@media (max-width: 1024px) {
  .ft-furry-gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.25rem;
  }

  @supports (column-count: 3) {
    .ft-furry-gallery-grid {
      column-count: 3;
      column-gap: 1.25rem;
    }

    .ft-furry-gallery-grid > * {
      margin-bottom: 1.25rem;
    }
  }
}

@media (max-width: 768px) {
  .ft-furry-gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }

  @supports (column-count: 2) {
    .ft-furry-gallery-grid {
      column-count: 2;
      column-gap: 1rem;
    }

    .ft-furry-gallery-grid > * {
      margin-bottom: 1rem;
    }
  }
}

@media (max-width: 480px) {
  .ft-furry-gallery-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  @supports (column-count: 1) {
    .ft-furry-gallery-grid {
      column-count: 1;
    }
  }
}
</style>
