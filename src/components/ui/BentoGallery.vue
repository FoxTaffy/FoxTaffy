<template>
  <div class="bento-gallery-container">
    <div class="bento-header">
      <h2 class="bento-title">{{ title }}</h2>
      <p class="bento-description">{{ description }}</p>
    </div>

    <div
      class="bento-grid"
      ref="gridRef"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <div
        v-for="(item, index) in imageItems"
        :key="item.id"
        :class="['bento-item', item.span || '', { 'expanded': expandedItem === item.id }]"
        @click="toggleExpand(item.id)"
        :style="{ cursor: isDragging ? 'grabbing' : 'pointer' }"
      >
        <div class="bento-image-wrapper">
          <img
            :src="item.url"
            :alt="item.title"
            class="bento-image"
            loading="lazy"
            decoding="async"
            draggable="false"
          />
          <div class="bento-overlay">
            <div class="bento-content">
              <h3 class="bento-item-title">{{ item.title }}</h3>
              <p class="bento-item-desc">{{ item.desc }}</p>
            </div>
            <div class="expand-icon">
              <i :class="expandedItem === item.id ? 'fas fa-compress' : 'fas fa-expand'"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox для развернутого изображения -->
    <Transition name="lightbox">
      <div
        v-if="expandedItem !== null"
        class="lightbox"
        @click.self="toggleExpand(null)"
      >
        <div class="lightbox-content">
          <button class="lightbox-close" @click="toggleExpand(null)">
            <i class="fas fa-times"></i>
          </button>
          <img
            :src="getCurrentExpandedItem()?.url"
            :alt="getCurrentExpandedItem()?.title"
            class="lightbox-image"
          />
          <div class="lightbox-info">
            <h3>{{ getCurrentExpandedItem()?.title }}</h3>
            <p>{{ getCurrentExpandedItem()?.desc }}</p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface BentoItem {
  id: number
  title: string
  desc: string
  url: string
  span?: string
}

interface Props {
  imageItems: BentoItem[]
  title?: string
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Галерея',
  description: 'Коллекция наших моментов'
})

const gridRef = ref<HTMLElement | null>(null)
const expandedItem = ref<number | null>(null)
const isDragging = ref(false)
const startX = ref(0)
const scrollLeft = ref(0)

const getCurrentExpandedItem = () => {
  return props.imageItems.find(item => item.id === expandedItem.value)
}

const toggleExpand = (id: number | null) => {
  if (!isDragging.value) {
    expandedItem.value = expandedItem.value === id ? null : id
  }
}

const handleMouseDown = (e: MouseEvent) => {
  if (!gridRef.value) return
  isDragging.value = true
  startX.value = e.pageX - gridRef.value.offsetLeft
  scrollLeft.value = gridRef.value.scrollLeft
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value || !gridRef.value) return
  e.preventDefault()
  const x = e.pageX - gridRef.value.offsetLeft
  const walkX = (x - startX.value) * 2
  gridRef.value.scrollLeft = scrollLeft.value - walkX
}

const handleMouseUp = () => {
  isDragging.value = false
}

const handleTouchStart = (e: TouchEvent) => {
  if (!gridRef.value || e.touches.length === 0) return
  isDragging.value = true
  startX.value = e.touches[0].pageX - gridRef.value.offsetLeft
  scrollLeft.value = gridRef.value.scrollLeft
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value || !gridRef.value || e.touches.length === 0) return
  const x = e.touches[0].pageX - gridRef.value.offsetLeft
  const walkX = (x - startX.value) * 2
  gridRef.value.scrollLeft = scrollLeft.value - walkX
}

const handleTouchEnd = () => {
  isDragging.value = false
}
</script>

<style scoped>
.bento-gallery-container {
  width: 100%;
  padding: 2rem 0;
  background: transparent;
  overflow: hidden;
}

.bento-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.bento-title {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.bento-description {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 600px;
  margin: 0 auto;
}

.bento-grid {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  overflow-y: hidden;
  cursor: grab;
  user-select: none;
  padding: 1rem 2rem;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  width: 100%;
}

.bento-grid:active {
  cursor: grabbing;
}

.bento-item {
  position: relative;
  border-radius: 1.5rem;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  flex-shrink: 0;
  height: 400px;
}

/* Различные размеры для элементов */
.bento-item.md\:col-span-2.md\:row-span-2 {
  width: 500px;
  height: 500px;
}

.bento-item.md\:row-span-1 {
  width: 350px;
  height: 400px;
}

.bento-item.md\:row-span-2 {
  width: 400px;
  height: 500px;
}

.bento-item.md\:col-span-2.md\:row-span-1 {
  width: 600px;
  height: 350px;
}

@media (max-width: 768px) {
  .bento-item {
    width: 280px !important;
    height: 350px !important;
  }
}

.bento-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
  border-color: rgba(102, 126, 234, 0.5);
}

.bento-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.bento-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.bento-item:hover .bento-image {
  transform: scale(1.05);
}

.bento-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.5) 50%, transparent 100%);
  padding: 1.5rem;
  transform: translateY(0);
  transition: transform 0.3s ease;
}

.bento-content {
  position: relative;
  z-index: 2;
}

.bento-item-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
}

.bento-item-desc {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.bento-item:hover .bento-item-desc {
  opacity: 1;
  transform: translateY(0);
}

.expand-icon {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 3;
}

.bento-item:hover .expand-icon {
  opacity: 1;
}

/* Lightbox Styles */
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.lightbox-close {
  position: absolute;
  top: -50px;
  right: 0;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.lightbox-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 1rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.lightbox-info {
  text-align: center;
  color: white;
  max-width: 600px;
}

.lightbox-info h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.lightbox-info p {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
}

/* Transitions */
.lightbox-enter-active,
.lightbox-leave-active {
  transition: all 0.3s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

.lightbox-enter-from .lightbox-content,
.lightbox-leave-to .lightbox-content {
  transform: scale(0.9);
}

/* Scrollbar styles */
.bento-grid::-webkit-scrollbar {
  height: 12px;
}

.bento-grid::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  margin: 0 2rem;
}

.bento-grid::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.6) 0%, rgba(118, 75, 162, 0.6) 100%);
  border-radius: 6px;
  border: 2px solid rgba(0, 0, 0, 0.1);
}

.bento-grid::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%);
}

/* Для Firefox */
.bento-grid {
  scrollbar-width: thin;
  scrollbar-color: rgba(102, 126, 234, 0.6) rgba(255, 255, 255, 0.05);
}
</style>
