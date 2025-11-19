<template>
  <div
    class="ft-simple-art-card"
    :class="{ 'nsfw-content': art.is_nsfw }"
    @click="$emit('open-lightbox', art)"
  >
    <!-- Контейнер изображения с оптимизацией -->
    <div ref="imageContainerRef" class="ft-art-image-container">
      <!-- NSFW индикатор -->
      <div v-if="art.is_nsfw" class="ft-nsfw-indicator">
        <div class="ft-nsfw-badge">
          <i class="fas fa-exclamation-triangle"></i>
          <span>NSFW</span>
        </div>
      </div>

      <!-- NSFW blur overlay -->
      <div
        v-if="art.is_nsfw && !showNsfw && !isUnlocked"
        class="ft-nsfw-overlay"
        @click.stop="$emit('unlock-nsfw', art.id)"
      >
        <div class="ft-nsfw-overlay-content">
          <i class="fas fa-eye-slash"></i>
          <h4>Контент 18+</h4>
          <p>Нажмите чтобы показать</p>
        </div>
      </div>

      <!-- Оптимизированное изображение -->
      <img
        v-if="isInView"
        ref="imageRef"
        :src="optimizedImageUrl"
        :alt="art.title"
        class="ft-art-thumbnail"
        :class="{
          'nsfw-blurred': art.is_nsfw && !showNsfw && !isUnlocked,
          'is-loading': !isLoaded,
          'is-loaded': isLoaded
        }"
        loading="lazy"
        @load="handleImageLoad"
      >

      <!-- Placeholder пока изображение не в зоне видимости -->
      <div v-else class="ft-image-placeholder">
        <i class="fas fa-image"></i>
      </div>
    </div>

    <!-- Информация об арте -->
    <div class="ft-art-info">
      <h3 class="ft-art-title">{{ art.title }}</h3>

      <!-- Художник -->
      <div class="ft-artist-pill" @click.stop="$emit('filter-artist', art.artist_name)">
        <img
          :src="art.artist_avatar || getDefaultAvatar(art.artist_name)"
          :alt="art.artist_name"
          class="ft-artist-avatar"
        >
        <span class="ft-artist-name">{{ art.artist_name }}</span>
        <i v-if="art.artist_is_friend" class="fas fa-star ft-friend-star"></i>
      </div>

      <!-- Персонажи -->
      <div v-if="art.characters && art.characters.length > 0" class="ft-characters-section">
        <span class="ft-characters-label">
          {{ art.characters.length === 1 ? 'Персонаж:' : 'Персонажи:' }}
        </span>
        <div class="ft-characters-avatars">
          <img
            v-for="(character, index) in art.characters.slice(0, 3)"
            :key="character.name + index"
            :src="character.avatar || getDefaultCharacterAvatar(character.name)"
            :alt="character.name"
            class="ft-character-avatar"
            :title="character.name"
            @click.stop="$emit('filter-character', character.name)"
          >
          <div
            v-if="art.characters.length > 3"
            class="ft-more-characters"
            :title="`Еще ${art.characters.length - 3} персонажей`"
          >
            +{{ art.characters.length - 3 }}
          </div>
        </div>
      </div>

      <!-- Теги -->
      <div v-if="art.tags && art.tags.length > 0" class="ft-art-tags">
        <span
          v-for="(tagName, index) in art.tags"
          :key="tagName + index"
          class="ft-tag-pill"
          @click.stop="$emit('filter-tag', tagName)"
        >
          {{ tagName }}
        </span>
      </div>

      <!-- Дата -->
      <div class="ft-art-date">
        <i class="fas fa-calendar-alt"></i>
        <span>{{ formatDate(art.created_date) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useImageOptimization } from '@/composables/useImageOptimization'

const props = defineProps({
  art: { type: Object, required: true },
  showNsfw: { type: Boolean, default: false },
  isUnlocked: { type: Boolean, default: false }
})

defineEmits(['open-lightbox', 'unlock-nsfw', 'filter-artist', 'filter-character', 'filter-tag'])

// Оптимизация изображений
const { optimizeImageUrl, useLazyImage } = useImageOptimization()
const imageRef = ref(null)
const imageContainerRef = ref(null)

// Ленивая загрузка
const { isLoaded, isInView, handleImageLoad } = useLazyImage(imageContainerRef)

// Оптимизированный URL превью
const optimizedImageUrl = computed(() => {
  const url = props.art.thumbnail_url || props.art.image_url
  return optimizeImageUrl(url, { width: 600, quality: 85 })
})

// Аватары по умолчанию
const getDefaultAvatar = (name) => {
  const colors = ['FF7B25', '4CAF50', '2196F3', '9C27B0', 'FF5722']
  const colorIndex = name ? name.length % colors.length : 0
  const color = colors[colorIndex]
  const initial = name ? name.charAt(0).toUpperCase() : '?'
  return `https://ui-avatars.com/api/?name=${initial}&background=${color}&color=ffffff&size=64&bold=true&format=png`
}

const getDefaultCharacterAvatar = (name) => {
  const emojis = ['🦊', '🐱', '🐺', '🐲', '🦝', '🐰', '🐻', '🦌']
  const emojiIndex = name ? name.length % emojis.length : 0
  const emoji = emojis[emojiIndex]
  return `https://ui-avatars.com/api/?name=${emoji}&background=FF7B25&color=ffffff&size=64&bold=true&format=png`
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ru-RU')
}
</script>

<style scoped>
/* Карточка арта (Pinterest-style) */
.ft-simple-art-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  backdrop-filter: blur(10px);
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.ft-simple-art-card:hover {
  transform: translateY(-8px) scale(1.02);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 123, 37, 0.4);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 123, 37, 0.2);
}

/* Анимация появления карточки */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ft-simple-art-card {
  animation: fadeInUp 0.5s ease-out;
}

/* NSFW граница */
.ft-simple-art-card.nsfw-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid rgba(255, 107, 107, 0.3);
  border-radius: 1rem;
  pointer-events: none;
  z-index: 1;
}

/* Контейнер изображения (Pinterest-style: естественные пропорции) */
.ft-art-image-container {
  position: relative;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 1rem 1rem 0 0;
}

/* Изображение с естественными пропорциями */
.ft-art-image-container::before {
  content: '';
  display: block;
  padding-top: 100%; /* По умолчанию квадрат, но изображение может изменить пропорции */
}

.ft-art-thumbnail {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.5s ease;
}

/* Прогрессивная загрузка */
.ft-art-thumbnail.is-loading {
  filter: blur(10px);
  transform: scale(1.1);
}

.ft-art-thumbnail.is-loaded {
  filter: blur(0);
  transform: scale(1);
}

.ft-simple-art-card:hover .ft-art-thumbnail {
  transform: scale(1.1);
}

/* Overlay градиент при наведении */
.ft-art-image-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 50%,
    rgba(0, 0, 0, 0.3) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.ft-simple-art-card:hover .ft-art-image-container::after {
  opacity: 1;
}

/* Placeholder */
.ft-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.3);
  font-size: 3rem;
}

/* NSFW стили */
.ft-nsfw-indicator {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 10;
}

.ft-nsfw-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 107, 107, 0.9);
  color: white;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
  border: 1px solid rgba(255, 107, 107, 0.6);
  animation: nsfwPulse 2s ease-in-out infinite;
}

@keyframes nsfwPulse {
  0%, 100% { box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4); }
  50% { box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6); }
}

.ft-nsfw-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  cursor: pointer;
  backdrop-filter: blur(10px);
  border-radius: 1rem 1rem 0 0;
  transition: background 0.3s ease;
}

.ft-nsfw-overlay:hover {
  background: rgba(0, 0, 0, 0.9);
}

.ft-nsfw-overlay-content {
  text-align: center;
  color: white;
  padding: 2rem;
}

.ft-nsfw-overlay-content i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #ff6b6b;
  transition: all 0.3s ease;
}

.ft-nsfw-overlay:hover .ft-nsfw-overlay-content i {
  color: #ff8a80;
  transform: scale(1.1);
}

.ft-nsfw-overlay-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 700;
}

.ft-nsfw-overlay-content p {
  margin: 0;
  font-size: 0.9rem;
  color: #cccccc;
}

.ft-art-thumbnail.nsfw-blurred {
  filter: blur(20px);
  transform: scale(1.1);
}

/* Информация (Pinterest-style: компактная) */
.ft-art-info {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.02) 100%
  );
}

.ft-art-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f2f2f2;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  transition: color 0.3s ease;
}

.ft-simple-art-card:hover .ft-art-title {
  color: #ff7b25;
}

/* Художник */
.ft-artist-pill {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  width: fit-content;
}

.ft-artist-pill:hover {
  background: rgba(76, 175, 80, 0.2);
  transform: translateY(-2px);
}

.ft-artist-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  object-fit: cover;
}

.ft-artist-name {
  font-weight: 600;
  color: #f2f2f2;
  font-size: 0.9rem;
}

.ft-friend-star {
  color: #ffd700;
  font-size: 0.8rem;
}

/* Персонажи */
.ft-characters-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ft-characters-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

.ft-characters-avatars {
  display: flex;
  align-items: center;
}

.ft-character-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(255, 123, 37, 0.6);
  object-fit: cover;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.ft-character-avatar:not(:first-child) {
  margin-left: -12px;
}

.ft-character-avatar:hover {
  transform: scale(1.1) translateY(-2px);
  z-index: 10;
  border-color: rgba(255, 123, 37, 1);
}

.ft-more-characters {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 123, 37, 0.8), rgba(255, 152, 0, 0.8));
  border: 2px solid rgba(255, 123, 37, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: white;
  cursor: pointer;
  margin-left: -12px;
}

/* Теги */
.ft-art-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.ft-tag-pill {
  padding: 0.3rem 0.7rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 123, 37, 0.15);
  color: #ff7b25;
  border: 1px solid rgba(255, 123, 37, 0.3);
}

.ft-tag-pill:hover {
  transform: translateY(-2px);
  background: rgba(255, 123, 37, 0.25);
  border-color: rgba(255, 123, 37, 0.5);
}

.ft-more-tags-pill {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  padding: 0.3rem 0.7rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Дата */
.ft-art-date {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.5rem;
}

/* Адаптивность */
@media (max-width: 768px) {
  .ft-simple-art-card:hover {
    transform: translateY(-4px) scale(1.01);
  }

  .ft-art-info {
    padding: 0.875rem;
    gap: 0.625rem;
  }

  .ft-art-title {
    font-size: 1rem;
  }

  .ft-character-avatar,
  .ft-more-characters {
    width: 32px;
    height: 32px;
  }

  .ft-character-avatar:not(:first-child),
  .ft-more-characters {
    margin-left: -10px;
  }

  .ft-artist-pill {
    padding: 0.4rem 0.6rem;
    gap: 0.5rem;
  }

  .ft-artist-avatar {
    width: 28px;
    height: 28px;
  }

  .ft-artist-name {
    font-size: 0.85rem;
  }

  .ft-tag-pill {
    font-size: 0.7rem;
    padding: 0.25rem 0.6rem;
  }
}

/* Уменьшение motion для пользователей с prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .ft-simple-art-card,
  .ft-art-thumbnail,
  .ft-art-title,
  .ft-artist-pill {
    transition: none;
    animation: none;
  }

  .ft-simple-art-card:hover {
    transform: none;
  }
}
</style>
