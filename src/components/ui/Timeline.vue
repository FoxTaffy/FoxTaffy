<template>
  <div class="timeline-wrapper">
    <div class="timeline">
      <div
        v-for="(item, index) in data"
        :key="index"
        class="timeline-item"
      >
        <div class="timeline-content">
          <div class="timeline-header">
            <div class="timeline-circle"></div>
            <h3 class="timeline-title">{{ item.title }}</h3>
          </div>
          <div class="timeline-body">
            <slot :item="item" :index="index">
              <div v-html="item.content"></div>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Timeline',
  props: {
    data: {
      type: Array,
      required: true,
      default: () => []
    }
  }
}
</script>

<style scoped>
.timeline-wrapper {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  padding: 80px 20px;
}

.timeline {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(
    to bottom,
    rgba(99, 102, 241, 0.1) 0%,
    rgba(99, 102, 241, 0.5) 50%,
    rgba(99, 102, 241, 0.1) 100%
  );
  transform: translateX(-50%);
}

.timeline-item {
  position: relative;
  margin-bottom: 100px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-content {
  position: relative;
  width: 45%;
  margin-left: 55%;
}

.timeline-item:nth-child(even) .timeline-content {
  margin-left: 0;
  margin-right: 55%;
}

.timeline-header {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.timeline-circle {
  position: absolute;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 50%;
  border: 4px solid #0f0f23;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
  z-index: 10;
}

.timeline-item:nth-child(odd) .timeline-circle {
  left: -65px;
}

.timeline-item:nth-child(even) .timeline-circle {
  right: -65px;
}

.timeline-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0;
  padding: 8px 16px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 8px;
  border-left: 3px solid #6366f1;
}

.timeline-body {
  background: rgba(30, 30, 46, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(99, 102, 241, 0.2);
  transition: all 0.3s ease;
}

.timeline-body:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 48px rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .timeline::before {
    left: 20px;
  }

  .timeline-content {
    width: calc(100% - 60px);
    margin-left: 60px !important;
    margin-right: 0 !important;
  }

  .timeline-item:nth-child(odd) .timeline-circle,
  .timeline-item:nth-child(even) .timeline-circle {
    left: 11px;
    right: auto;
  }
}

/* Global content styles */
.timeline-body :deep(p) {
  color: #cbd5e0;
  font-size: 0.95rem;
  line-height: 1.8;
  margin-bottom: 20px;
}

.timeline-body :deep(p:last-child) {
  margin-bottom: 0;
}

.timeline-body :deep(.grid) {
  display: grid;
  gap: 16px;
  margin-top: 20px;
}

.timeline-body :deep(.grid-cols-2) {
  grid-template-columns: repeat(2, 1fr);
}

.timeline-body :deep(img) {
  width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s ease;
}

.timeline-body :deep(img:hover) {
  transform: scale(1.05);
}

.timeline-body :deep(.flex) {
  display: flex;
}

.timeline-body :deep(.gap-2) {
  gap: 8px;
}

.timeline-body :deep(.items-center) {
  align-items: center;
}

.timeline-body :deep(.mb-8) {
  margin-bottom: 32px;
}

.timeline-body :deep(.mb-4) {
  margin-bottom: 16px;
}

@media (max-width: 640px) {
  .timeline-body :deep(.grid-cols-2) {
    grid-template-columns: 1fr;
  }
}
</style>
