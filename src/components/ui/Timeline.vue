<template>
  <div ref="containerRef" class="timeline-wrapper">
    <div class="timeline-container">
      <!-- Background gradient line -->
      <div class="timeline-line">
        <!-- Animated scroll beam -->
        <div
          class="timeline-beam"
          :style="{ height: beamHeight + 'px' }"
        ></div>
      </div>

      <!-- Timeline items -->
      <div
        v-for="(item, index) in data"
        :key="index"
        :ref="el => itemRefs[index] = el"
        class="timeline-item"
      >
        <!-- Sticky title header -->
        <div class="timeline-header">
          <div class="timeline-dot"></div>
          <h3 class="timeline-title">{{ item.title }}</h3>
        </div>

        <!-- Content -->
        <div class="timeline-content">
          <slot :item="item" :index="index">
            <div v-html="item.content"></div>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useScroll } from '@vueuse/core'

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  }
})

const containerRef = ref(null)
const itemRefs = ref([])
const beamHeight = ref(0)

let animationFrame = null

const updateBeamHeight = () => {
  if (!containerRef.value) return

  const container = containerRef.value
  const rect = container.getBoundingClientRect()
  const scrollTop = window.scrollY || window.pageYOffset
  const containerTop = scrollTop + rect.top
  const containerHeight = container.offsetHeight
  const viewportHeight = window.innerHeight

  // Calculate scroll progress within the container
  const scrollProgress = (scrollTop + viewportHeight / 2 - containerTop) / containerHeight

  // Clamp between 0 and 1
  const progress = Math.max(0, Math.min(1, scrollProgress))

  // Apply to beam height
  beamHeight.value = progress * containerHeight
}

const handleScroll = () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  animationFrame = requestAnimationFrame(updateBeamHeight)
}

onMounted(() => {
  updateBeamHeight()
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', updateBeamHeight, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', updateBeamHeight)
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<script>
export default {
  name: 'Timeline'
}
</script>

<style scoped>
.timeline-wrapper {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0f 0%, #0f0f23 50%, #1a1a2e 100%);
  padding: 120px 20px 80px;
  position: relative;
}

.timeline-container {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  padding-left: 80px;
}

/* Timeline line and beam */
.timeline-line {
  position: absolute;
  left: 32px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(
    to bottom,
    rgba(139, 92, 246, 0.1) 0%,
    rgba(139, 92, 246, 0.3) 50%,
    rgba(139, 92, 246, 0.1) 100%
  );
  overflow: hidden;
}

.timeline-beam {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(
    to bottom,
    rgba(139, 92, 246, 0.8),
    rgba(99, 102, 241, 1),
    rgba(59, 130, 246, 0.8)
  );
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.6);
  transition: height 0.1s linear;
}

/* Timeline items */
.timeline-item {
  position: relative;
  margin-bottom: 120px;
  padding-left: 60px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

/* Sticky header */
.timeline-header {
  position: sticky;
  top: 80px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding: 12px 0;
  background: linear-gradient(
    to right,
    rgba(10, 10, 15, 0.95) 0%,
    rgba(10, 10, 15, 0.8) 50%,
    transparent 100%
  );
  backdrop-filter: blur(12px);
}

.timeline-dot {
  position: absolute;
  left: -53px;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  border-radius: 50%;
  border: 3px solid #0a0a0f;
  box-shadow:
    0 0 20px rgba(139, 92, 246, 0.6),
    0 0 40px rgba(139, 92, 246, 0.3);
  z-index: 10;
  transition: all 0.3s ease;
}

.timeline-header:hover .timeline-dot {
  transform: scale(1.3);
  box-shadow:
    0 0 30px rgba(139, 92, 246, 0.8),
    0 0 60px rgba(139, 92, 246, 0.5);
}

.timeline-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f3f4f6;
  margin: 0;
  padding: 10px 24px;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.15),
    rgba(99, 102, 241, 0.1)
  );
  border-radius: 12px;
  border-left: 4px solid #8b5cf6;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}

.timeline-header:hover .timeline-title {
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.25),
    rgba(99, 102, 241, 0.15)
  );
  border-left-color: #a78bfa;
  transform: translateX(8px);
}

/* Timeline content */
.timeline-content {
  background: linear-gradient(
    135deg,
    rgba(30, 30, 46, 0.7),
    rgba(26, 26, 46, 0.5)
  );
  backdrop-filter: blur(16px);
  border-radius: 20px;
  padding: 40px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 1px rgba(139, 92, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(139, 92, 246, 0.15);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.timeline-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(139, 92, 246, 0.5),
    transparent
  );
}

.timeline-content:hover {
  transform: translateY(-8px) translateX(8px);
  box-shadow:
    0 20px 60px rgba(139, 92, 246, 0.25),
    0 0 1px rgba(139, 92, 246, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border-color: rgba(139, 92, 246, 0.3);
}

/* Content styles */
.timeline-content :deep(p) {
  color: #cbd5e0;
  font-size: 1rem;
  line-height: 1.8;
  margin-bottom: 20px;
}

.timeline-content :deep(p:last-child) {
  margin-bottom: 0;
}

.timeline-content :deep(.grid) {
  display: grid;
  gap: 20px;
  margin-top: 24px;
}

.timeline-content :deep(.grid-cols-2) {
  grid-template-columns: repeat(2, 1fr);
}

.timeline-content :deep(img) {
  width: 100%;
  height: auto;
  border-radius: 16px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.5),
    0 0 1px rgba(139, 92, 246, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(139, 92, 246, 0.1);
}

.timeline-content :deep(img:hover) {
  transform: scale(1.05);
  box-shadow:
    0 12px 48px rgba(139, 92, 246, 0.3),
    0 0 1px rgba(139, 92, 246, 0.5);
  border-color: rgba(139, 92, 246, 0.3);
}

.timeline-content :deep(.flex) {
  display: flex;
}

.timeline-content :deep(.gap-2) {
  gap: 8px;
}

.timeline-content :deep(.items-center) {
  align-items: center;
}

.timeline-content :deep(.mb-8) {
  margin-bottom: 32px;
}

.timeline-content :deep(.mb-4) {
  margin-bottom: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .timeline-wrapper {
    padding: 80px 16px 60px;
  }

  .timeline-container {
    padding-left: 40px;
  }

  .timeline-line {
    left: 16px;
  }

  .timeline-item {
    padding-left: 40px;
    margin-bottom: 80px;
  }

  .timeline-dot {
    left: -33px;
    width: 12px;
    height: 12px;
    border-width: 2px;
  }

  .timeline-header {
    top: 60px;
  }

  .timeline-title {
    font-size: 1.25rem;
    padding: 8px 16px;
  }

  .timeline-content {
    padding: 24px;
  }

  .timeline-content :deep(.grid-cols-2) {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .timeline-title {
    font-size: 1.1rem;
  }

  .timeline-content {
    padding: 20px;
  }
}

/* Smooth scrolling */
@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
}
</style>
