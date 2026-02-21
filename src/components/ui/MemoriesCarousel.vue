<template>
  <div class="memories-carousel-container">
    <div class="carousel-header">
      <h2 class="carousel-title">{{ title }}</h2>
      <p class="carousel-description">{{ description }}</p>
    </div>

    <!-- Carousel Navigation -->
    <div class="carousel-controls">
      <button
        class="carousel-btn prev"
        @click="prevSlide"
        :disabled="currentIndex === 0 && !infinite"
        aria-label="Предыдущий слайд"
      >
        <i class="fas fa-chevron-left"></i>
      </button>

      <div class="carousel-indicators">
        <button
          v-for="(item, index) in imageItems"
          :key="`indicator-${index}`"
          class="indicator-dot"
          :class="{ active: currentIndex === index }"
          @click="goToSlide(index)"
          :aria-label="`Слайд ${index + 1}`"
        ></button>
      </div>

      <button
        class="carousel-btn next"
        @click="nextSlide"
        :disabled="currentIndex === imageItems.length - 1 && !infinite"
        aria-label="Следующий слайд"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- Carousel Wrapper -->
    <div
      class="carousel-wrapper"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <transition-group
        name="carousel-slide"
        tag="div"
        class="carousel-track"
      >
        <div
          v-for="(item, index) in visibleItems"
          :key="`slide-${item.id}`"
          v-show="index === 1"
          class="carousel-slide"
          @click="openLightbox(item)"
        >
          <div class="slide-content">
            <div class="slide-image-wrapper">
              <img
                :src="item.url"
                :alt="item.title"
                class="slide-image"
                loading="lazy"
                decoding="async"
              />
              <div class="slide-overlay">
                <div class="overlay-content">
                  <h3 class="slide-title">{{ item.title }}</h3>
                  <p class="slide-desc">{{ item.desc }}</p>
                </div>
                <div class="expand-icon">
                  <i class="fas fa-expand-alt"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- Thumbnail Navigation -->
    <div class="carousel-thumbnails">
      <div
        v-for="(item, index) in imageItems"
        :key="`thumb-${item.id}`"
        class="thumbnail-item"
        :class="{ active: currentIndex === index }"
        @click="goToSlide(index)"
      >
        <img
          :src="item.url"
          :alt="item.title"
          loading="lazy"
        />
      </div>
    </div>

    <!-- Lightbox -->
    <Transition name="lightbox">
      <div
        v-if="lightboxOpen"
        class="lightbox"
        @click.self="closeLightbox"
      >
        <div class="lightbox-content">
          <button class="lightbox-close" @click="closeLightbox">
            <i class="fas fa-times"></i>
          </button>

          <button
            class="lightbox-nav lightbox-prev"
            @click.stop="prevSlide"
            v-if="imageItems.length > 1"
          >
            <i class="fas fa-chevron-left"></i>
          </button>

          <div class="lightbox-image-wrapper">
            <img
              :src="currentItem?.url"
              :alt="currentItem?.title"
              class="lightbox-image"
            />
          </div>

          <button
            class="lightbox-nav lightbox-next"
            @click.stop="nextSlide"
            v-if="imageItems.length > 1"
          >
            <i class="fas fa-chevron-right"></i>
          </button>

          <div class="lightbox-info">
            <h3>{{ currentItem?.title }}</h3>
            <p>{{ currentItem?.desc }}</p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface CarouselItem {
  id: number
  title: string
  desc: string
  url: string
  span?: string
}

interface Props {
  imageItems: CarouselItem[]
  title?: string
  description?: string
  infinite?: boolean
  autoplay?: boolean
  autoplayDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Галерея воспоминаний',
  description: 'Наши особенные моменты',
  infinite: true,
  autoplay: false,
  autoplayDelay: 5000
})

const currentIndex = ref(0)
const lightboxOpen = ref(false)
const touchStartX = ref(0)
const touchEndX = ref(0)
let autoplayInterval: ReturnType<typeof setInterval> | null = null

const currentItem = computed(() => props.imageItems[currentIndex.value])

const visibleItems = computed(() => {
  if (props.imageItems.length === 0) return []

  const items = []
  const prevIndex = currentIndex.value === 0
    ? props.imageItems.length - 1
    : currentIndex.value - 1
  const nextIndex = currentIndex.value === props.imageItems.length - 1
    ? 0
    : currentIndex.value + 1

  items.push(props.imageItems[prevIndex])
  items.push(props.imageItems[currentIndex.value])
  items.push(props.imageItems[nextIndex])

  return items
})

const goToSlide = (index: number) => {
  if (index >= 0 && index < props.imageItems.length) {
    currentIndex.value = index
  }
}

const nextSlide = () => {
  if (currentIndex.value < props.imageItems.length - 1) {
    currentIndex.value++
  } else if (props.infinite) {
    currentIndex.value = 0
  }
}

const prevSlide = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  } else if (props.infinite) {
    currentIndex.value = props.imageItems.length - 1
  }
}

const openLightbox = (item: CarouselItem) => {
  const index = props.imageItems.findIndex(i => i.id === item.id)
  if (index !== -1) {
    currentIndex.value = index
    lightboxOpen.value = true
    stopAutoplay()
  }
}

const closeLightbox = () => {
  lightboxOpen.value = false
  if (props.autoplay) {
    startAutoplay()
  }
}

const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0].clientX
}

const handleTouchMove = (e: TouchEvent) => {
  touchEndX.value = e.touches[0].clientX
}

const handleTouchEnd = () => {
  const diff = touchStartX.value - touchEndX.value

  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      nextSlide()
    } else {
      prevSlide()
    }
  }

  touchStartX.value = 0
  touchEndX.value = 0
}

const startAutoplay = () => {
  if (props.autoplay && !autoplayInterval) {
    autoplayInterval = setInterval(() => {
      nextSlide()
    }, props.autoplayDelay)
  }
}

const stopAutoplay = () => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
    autoplayInterval = null
  }
}

// Keyboard navigation
const handleKeydown = (e: KeyboardEvent) => {
  if (lightboxOpen.value) {
    if (e.key === 'ArrowLeft') {
      prevSlide()
    } else if (e.key === 'ArrowRight') {
      nextSlide()
    } else if (e.key === 'Escape') {
      closeLightbox()
    }
  }
}

watch(() => lightboxOpen.value, (isOpen) => {
  if (isOpen) {
    document.addEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
  }
})

// Autoplay lifecycle
watch(() => props.autoplay, (enabled) => {
  if (enabled) {
    startAutoplay()
  } else {
    stopAutoplay()
  }
}, { immediate: true })
</script>

<style scoped>
.memories-carousel-container {
  width: 100%;
  padding: 3rem 0;
  background: transparent;
  overflow: hidden;
}

.carousel-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 0 1rem;
}

.carousel-title {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.75rem;
}

.carousel-description {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 600px;
  margin: 0 auto;
}

/* Controls */
.carousel-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.carousel-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.5);
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.carousel-btn:hover:not(:disabled) {
  background: rgba(102, 126, 234, 0.4);
  transform: scale(1.1);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.carousel-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.carousel-indicators {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.indicator-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.indicator-dot.active {
  width: 14px;
  height: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 0 15px rgba(102, 126, 234, 0.6);
}

.indicator-dot:hover:not(.active) {
  background: rgba(255, 255, 255, 0.5);
  transform: scale(1.2);
}

/* Carousel */
.carousel-wrapper {
  position: relative;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 2rem;
  padding: 0 1rem;
}

.carousel-track {
  position: relative;
  width: 100%;
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-slide {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-content {
  width: 100%;
  height: 100%;
  position: relative;
}

.slide-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 1.5rem;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 2px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.slide-image-wrapper:hover {
  transform: scale(1.02);
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3);
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.slide-image-wrapper:hover .slide-image {
  transform: scale(1.05);
}

.slide-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.5) 50%, transparent 100%);
  padding: 2rem;
  transition: all 0.3s ease;
}

.overlay-content {
  position: relative;
  z-index: 2;
}

.slide-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
}

.slide-desc {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

.expand-icon {
  position: absolute;
  top: -450px;
  right: 1rem;
  width: 45px;
  height: 45px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 3;
}

.slide-image-wrapper:hover .expand-icon {
  opacity: 1;
}

/* Thumbnails */
.carousel-thumbnails {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  padding: 0 1rem;
  flex-wrap: wrap;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.thumbnail-item {
  width: 80px;
  height: 80px;
  border-radius: 0.75rem;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  opacity: 0.5;
}

.thumbnail-item.active {
  border-color: rgba(102, 126, 234, 0.8);
  opacity: 1;
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.thumbnail-item:hover {
  opacity: 1;
  transform: scale(1.1);
}

.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Lightbox */
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
  max-width: 95vw;
  max-height: 95vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.lightbox-close {
  position: absolute;
  top: -60px;
  right: 0;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.lightbox-image-wrapper {
  position: relative;
  max-width: 100%;
  max-height: 75vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-image {
  max-width: 100%;
  max-height: 75vh;
  object-fit: contain;
  border-radius: 1rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  z-index: 10;
}

.lightbox-nav:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-50%) scale(1.1);
}

.lightbox-prev {
  left: 1rem;
}

.lightbox-next {
  right: 1rem;
}

.lightbox-info {
  text-align: center;
  color: white;
  max-width: 700px;
  padding: 0 1rem;
}

.lightbox-info h3 {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.lightbox-info p {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

/* Transitions */
.carousel-slide-enter-active,
.carousel-slide-leave-active {
  transition: all 0.5s ease;
}

.carousel-slide-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.carousel-slide-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}

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

/* Mobile Responsive */
@media (max-width: 768px) {
  .carousel-title {
    font-size: 2rem;
  }

  .carousel-description {
    font-size: 1rem;
  }

  .carousel-controls {
    gap: 1rem;
  }

  .carousel-btn {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .carousel-track {
    height: 450px;
  }

  .slide-title {
    font-size: 1.2rem;
  }

  .slide-desc {
    font-size: 0.9rem;
  }

  .carousel-thumbnails {
    gap: 0.5rem;
  }

  .thumbnail-item {
    width: 60px;
    height: 60px;
  }

  .lightbox-nav {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .lightbox-info h3 {
    font-size: 1.4rem;
  }

  .lightbox-info p {
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .memories-carousel-container {
    padding: 2rem 0;
  }

  .carousel-header {
    margin-bottom: 2rem;
  }

  .carousel-title {
    font-size: 1.8rem;
  }

  .carousel-track {
    height: 350px;
  }

  .slide-overlay {
    padding: 1.5rem;
  }

  .slide-title {
    font-size: 1.1rem;
  }

  .slide-desc {
    font-size: 0.85rem;
  }

  .indicator-dot {
    width: 10px;
    height: 10px;
  }

  .indicator-dot.active {
    width: 12px;
    height: 12px;
  }

  .thumbnail-item {
    width: 50px;
    height: 50px;
  }

  .lightbox {
    padding: 1rem;
  }

  .lightbox-close {
    top: -50px;
    width: 40px;
    height: 40px;
  }

  .lightbox-nav {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }

  .lightbox-prev {
    left: 0.5rem;
  }

  .lightbox-next {
    right: 0.5rem;
  }
}
</style>
