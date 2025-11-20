<template>
  <div class="ft-loading-skeleton">
    <div class="ft-skeleton-grid">
      <div
        v-for="i in count"
        :key="'skeleton-' + i"
        class="ft-skeleton-card"
      >
        <div class="ft-skeleton-image">
          <div class="ft-skeleton-paw">{{ paws[i % paws.length] }}</div>
        </div>
        <div class="ft-skeleton-content">
          <div class="ft-skeleton-line ft-skeleton-line-title"></div>
          <div class="ft-skeleton-line ft-skeleton-line-subtitle"></div>
          <div class="ft-skeleton-tags">
            <div class="ft-skeleton-tag"></div>
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
.ft-loading-skeleton {
  animation: pulse 1.5s ease-in-out infinite alternate;
}

.ft-skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.ft-skeleton-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.ft-skeleton-image {
  aspect-ratio: 1;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05),
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ft-skeleton-paw {
  font-size: 3rem;
  opacity: 0.3;
  animation: float 3s ease-in-out infinite;
}

.ft-skeleton-content {
  padding: 1.25rem;
}

.ft-skeleton-line {
  border-radius: 0.25rem;
  margin-bottom: 0.75rem;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05),
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

.ft-skeleton-line-title {
  height: 1.2rem;
  width: 80%;
}

.ft-skeleton-line-subtitle {
  height: 1rem;
  width: 60%;
}

.ft-skeleton-tags {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.ft-skeleton-tag {
  height: 1.5rem;
  width: 3rem;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05),
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 0.75rem;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  100% { opacity: 1; }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@media (max-width: 768px) {
  .ft-skeleton-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }

  .ft-skeleton-content {
    padding: 1rem;
  }
}
</style>
