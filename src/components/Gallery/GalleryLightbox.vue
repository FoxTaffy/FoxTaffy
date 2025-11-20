<template>
  <Teleport to="body">
    <Transition name="ft-lightbox">
      <div v-if="lightbox.visible" class="ft-lightbox" @click="$emit('close')">
        <div class="ft-lightbox-content" @click.stop>
          <!-- Кнопка закрытия -->
          <button @click="$emit('close')" class="ft-lightbox-close">
            <i class="fas fa-times"></i>
          </button>

          <!-- Навигация -->
          <button
            v-if="canGoPrevious"
            @click="$emit('previous')"
            class="ft-lightbox-nav ft-lightbox-prev"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <button
            v-if="canGoNext"
            @click="$emit('next')"
            class="ft-lightbox-nav ft-lightbox-next"
          >
            <i class="fas fa-chevron-right"></i>
          </button>

          <!-- Изображение -->
          <img
            :src="lightbox.imageUrl"
            :alt="lightbox.title"
            class="ft-lightbox-image"
          >

          <!-- Информация -->
          <div class="ft-lightbox-info">
            <h3>{{ lightbox.title }}</h3>

            <div class="ft-lightbox-meta">
              <div class="ft-lightbox-artist">
                <img
                  :src="lightbox.art?.artist_avatar || getDefaultAvatar(lightbox.art?.artist_name)"
                  class="ft-lightbox-avatar"
                >
                <span class="ft-lightbox-artist-name">{{ lightbox.art?.artist_name }}</span>
                <i v-if="lightbox.art?.artist_is_friend" class="fas fa-star ft-friend-star"></i>
              </div>
              <div class="ft-lightbox-date">{{ formatDate(lightbox.art?.created_date) }}</div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  lightbox: { type: Object, required: true },
  canGoPrevious: { type: Boolean, default: false },
  canGoNext: { type: Boolean, default: false }
})

defineEmits(['close', 'previous', 'next'])

const getDefaultAvatar = (name) => {
  const colors = ['FF7B25', '4CAF50', '2196F3', '9C27B0', 'FF5722']
  const colorIndex = name ? name.length % colors.length : 0
  const color = colors[colorIndex]
  const initial = name ? name.charAt(0).toUpperCase() : '?'
  return `https://ui-avatars.com/api/?name=${initial}&background=${color}&color=ffffff&size=64&bold=true&format=png`
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ru-RU')
}
</script>

<style scoped>
.ft-lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.ft-lightbox-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ft-lightbox-close {
  position: absolute;
  top: -50px;
  right: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.3s ease;
}

.ft-lightbox-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.ft-lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  z-index: 10;
  transition: all 0.3s ease;
}

.ft-lightbox-nav:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-50%) scale(1.1);
}

.ft-lightbox-prev {
  left: -70px;
}

.ft-lightbox-next {
  right: -70px;
}

.ft-lightbox-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 0.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.ft-lightbox-info {
  margin-top: 1rem;
  text-align: center;
  color: white;
  max-width: 500px;
}

.ft-lightbox-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.ft-lightbox-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  font-size: 0.9rem;
  opacity: 0.7;
}

.ft-lightbox-artist {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ft-lightbox-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.ft-friend-star {
  color: #ffd700;
}

/* Анимации */
.ft-lightbox-enter-active,
.ft-lightbox-leave-active {
  transition: all 0.3s ease;
}

.ft-lightbox-enter-from,
.ft-lightbox-leave-to {
  opacity: 0;
}

.ft-lightbox-enter-from .ft-lightbox-content,
.ft-lightbox-leave-to .ft-lightbox-content {
  transform: scale(0.9);
}

@media (max-width: 768px) {
  .ft-lightbox-nav {
    display: none;
  }

  .ft-lightbox-close {
    top: -40px;
    right: 10px;
  }

  .ft-lightbox-info {
    padding: 0 1rem;
  }

  .ft-lightbox-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
