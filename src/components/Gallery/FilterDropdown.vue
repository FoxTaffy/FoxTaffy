<template>
  <div class="filter-dropdown">
    <button
      class="filter-btn"
      :class="{ active: selectedCount > 0 }"
      @click="$emit('toggle')"
    >
      <i :class="icon"></i>
      <span>{{ label }}</span>
      <span v-if="selectedCount > 0" class="filter-count">{{ selectedCount }}</span>
      <i class="fas fa-chevron-down" :class="{ rotated: isOpen }"></i>
    </button>

    <div v-if="isOpen" class="dropdown-content">
      <slot name="header"></slot>
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  selectedCount: { type: Number, default: 0 },
  isOpen: { type: Boolean, default: false }
})

defineEmits(['toggle'])
</script>

<style scoped>
.filter-dropdown {
  position: relative;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  color: #f2f2f2;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  font-family: inherit;
  white-space: nowrap;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.filter-btn.active {
  background: rgba(255, 123, 37, 0.2);
  border-color: rgba(255, 123, 37, 0.5);
  color: #ff7b25;
}

.filter-count {
  background: #ff7b25;
  color: white;
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
  border-radius: 0.75rem;
  font-weight: 600;
  min-width: 1.2rem;
  text-align: center;
}

.filter-btn i.fa-chevron-down {
  transition: transform 0.3s ease;
}

.filter-btn i.fa-chevron-down.rotated {
  transform: rotate(180deg);
}

.dropdown-content {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  min-width: 280px;
  max-width: 400px;
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  backdrop-filter: blur(10px);
}

@media (max-width: 768px) {
  .filter-btn {
    justify-content: space-between;
    width: 100%;
  }

  .dropdown-content {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    max-width: 400px;
    max-height: 70vh;
  }
}
</style>
