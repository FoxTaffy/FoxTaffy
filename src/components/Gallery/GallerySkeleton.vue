<template>
  <div class="ft-loading-skeleton">
    <div class="ft-skeleton-grid">
      <div
        v-for="i in count"
        :key="'skeleton-' + i"
        class="ft-skeleton-card"
        :style="{ '--sk-index': i - 1 }"
      >
        <!-- Изображение с переменной высотой (masonry-feel) -->
        <div class="ft-skeleton-image" :class="`ft-skeleton-img-${((i - 1) % 5) + 1}`">
          <div class="ft-skeleton-paw">{{ paws[(i - 1) % paws.length] }}</div>
        </div>
        <!-- Контент -->
        <div class="ft-skeleton-content">
          <div class="ft-skeleton-line ft-skeleton-line-title"></div>
          <div class="ft-skeleton-line ft-skeleton-line-subtitle"></div>
          <!-- Художник-пилюля -->
          <div class="ft-skeleton-artist-pill">
            <div class="ft-skeleton-avatar"></div>
            <div class="ft-skeleton-line ft-skeleton-line-artist"></div>
          </div>
          <!-- Теги -->
          <div class="ft-skeleton-tags">
            <div class="ft-skeleton-tag"></div>
            <div class="ft-skeleton-tag ft-skeleton-tag-sm"></div>
            <div class="ft-skeleton-tag"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  count: {
    type: Number,
    default: 12
  }
})

const paws = ['🦊', '🦝', '🐱', '🐺', '🐲']
</script>

<style scoped>
/* ===================================================
   SKELETON — CSS COLUMNS MASONRY
   =================================================== */

.ft-loading-skeleton {
  /* Плавный pulse всего блока */
}

/* CSS columns — масонри без JS */
.ft-skeleton-grid {
  columns: 3;
  column-gap: 1.5rem;
  column-fill: balance;
}

/* Карточки не разбиваются по колонкам */
.ft-skeleton-card {
  break-inside: avoid;
  display: inline-block;
  width: 100%;
  margin-bottom: 1.5rem;

  background: rgb(var(--white-rgb) / 0.03);
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid rgb(var(--white-rgb) / 0.05);

  /* Staggered fade-in */
  animation: skFadeIn 0.4s ease-out both;
  animation-delay: calc(var(--sk-index, 0) * 50ms);
}

@keyframes skFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ===================================================
   ИЗОБРАЖЕНИЕ — переменная высота для masonry
   =================================================== */

.ft-skeleton-image {
  position: relative;
  background: linear-gradient(
    110deg,
    rgb(var(--white-rgb) / 0.04) 30%,
    rgb(var(--white-rgb) / 0.09) 50%,
    rgb(var(--white-rgb) / 0.04) 70%
  );
  background-size: 300% 100%;
  animation: shimmer 1.8s linear infinite;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Переменные высоты — симулируют masonry */
.ft-skeleton-img-1 { height: 220px; }
.ft-skeleton-img-2 { height: 300px; }
.ft-skeleton-img-3 { height: 180px; }
.ft-skeleton-img-4 { height: 260px; }
.ft-skeleton-img-5 { height: 240px; }

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.ft-skeleton-paw {
  font-size: 2.5rem;
  opacity: 0.15;
  animation: float 3.5s ease-in-out infinite;
  user-select: none;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50%       { transform: translateY(-10px) rotate(5deg); }
}

/* ===================================================
   КОНТЕНТ
   =================================================== */

.ft-skeleton-content {
  padding: 0.9rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

/* Базовые полоски */
.ft-skeleton-line {
  border-radius: 0.4rem;
  background: linear-gradient(
    110deg,
    rgb(var(--white-rgb) / 0.04) 30%,
    rgb(var(--white-rgb) / 0.09) 50%,
    rgb(var(--white-rgb) / 0.04) 70%
  );
  background-size: 300% 100%;
  animation: shimmer 1.8s linear infinite;
}

.ft-skeleton-line-title {
  height: 1.1rem;
  width: 80%;
  animation-delay: 0.1s;
}

.ft-skeleton-line-subtitle {
  height: 0.9rem;
  width: 55%;
  animation-delay: 0.2s;
}

/* Художник-пилюля */
.ft-skeleton-artist-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.65rem;
  background: rgb(var(--accent-green-rgb) / 0.05);
  border: 1px solid rgb(var(--accent-green-rgb) / 0.1);
  border-radius: 2rem;
  width: fit-content;
}

.ft-skeleton-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(
    110deg,
    rgb(var(--white-rgb) / 0.06) 30%,
    rgb(var(--white-rgb) / 0.12) 50%,
    rgb(var(--white-rgb) / 0.06) 70%
  );
  background-size: 300% 100%;
  animation: shimmer 1.8s linear infinite;
  flex-shrink: 0;
}

.ft-skeleton-line-artist {
  height: 0.8rem;
  width: 70px;
  animation-delay: 0.15s;
}

/* Теги */
.ft-skeleton-tags {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.ft-skeleton-tag {
  height: 1.3rem;
  width: 52px;
  border-radius: var(--radius-md);
  background: linear-gradient(
    110deg,
    rgb(var(--accent-orange-rgb) / 0.06) 30%,
    rgb(var(--accent-orange-rgb) / 0.12) 50%,
    rgb(var(--accent-orange-rgb) / 0.06) 70%
  );
  background-size: 300% 100%;
  animation: shimmer 1.8s linear infinite;
  animation-delay: 0.25s;
}

.ft-skeleton-tag-sm {
  width: 38px;
  animation-delay: 0.35s;
}

/* ===================================================
   АДАПТИВНОСТЬ
   =================================================== */

@media (max-width: 1024px) {
  .ft-skeleton-grid {
    columns: 2;
    column-gap: 1.25rem;
  }
  .ft-skeleton-card {
    margin-bottom: 1.25rem;
  }
}

@media (max-width: 480px) {
  .ft-skeleton-grid {
    columns: 1;
    column-gap: 0;
  }
  .ft-skeleton-card {
    margin-bottom: 1rem;
  }
}

/* Отключить анимации при prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .ft-skeleton-card,
  .ft-skeleton-image,
  .ft-skeleton-line,
  .ft-skeleton-avatar,
  .ft-skeleton-tag {
    animation: none;
  }
}
</style>
