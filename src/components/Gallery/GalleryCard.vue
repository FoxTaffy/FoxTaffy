<template>
  <div
    class="ft-simple-art-card"
    :class="{ 'nsfw-content': art.is_nsfw }"
    :style="{ '--card-index': cardIndex }"
    @click="$emit('open-lightbox', art)"
  >
    <!-- Контейнер изображения -->
    <div ref="imageContainerRef" class="ft-art-image-container">

      <!-- NSFW индикатор -->
      <div v-if="art.is_nsfw" class="ft-nsfw-indicator">
        <div class="ft-nsfw-badge">
          <i class="fas fa-exclamation-triangle"></i>
          <span>NSFW</span>
        </div>
      </div>

      <!-- Бейдж качества / HD -->
      <div v-if="qualityBadge" class="ft-quality-badge">
        <span>{{ qualityBadge }}</span>
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

      <!-- Glassmorphism hover overlay с быстрыми действиями -->
      <div class="ft-hover-overlay" v-if="!(art.is_nsfw && !showNsfw && !isUnlocked)">
        <div class="ft-hover-actions">
          <button
            class="ft-action-btn ft-action-like"
            title="Нравится"
            @click.stop="handleLike"
            :class="{ liked: isLiked }"
          >
            <i :class="isLiked ? 'fas fa-heart' : 'far fa-heart'"></i>
          </button>
          <button
            class="ft-action-btn ft-action-view"
            title="Открыть оригинал"
            @click.stop="openOriginal"
          >
            <i class="fas fa-expand-arrows-alt"></i>
          </button>
          <button
            class="ft-action-btn ft-action-tags"
            title="Фильтр по тегам"
            @click.stop="showTagsTooltip = !showTagsTooltip"
          >
            <i class="fas fa-tags"></i>
          </button>
        </div>

        <!-- Теги в оверлее -->
        <div v-if="showTagsTooltip && art.tags && art.tags.length > 0" class="ft-overlay-tags" @click.stop>
          <span
            v-for="(tagName, i) in art.tags.slice(0, 5)"
            :key="tagName + i"
            class="ft-overlay-tag"
            @click.stop="$emit('filter-tag', tagName)"
          >{{ tagName }}</span>
          <span v-if="art.tags.length > 5" class="ft-overlay-tag ft-overlay-tag-more">
            +{{ art.tags.length - 5 }}
          </span>
        </div>
      </div>

      <!-- Оптимизированное изображение -->
      <img
        v-if="isInView"
        ref="imageRef"
        :src="currentImageUrl"
        :alt="art.title"
        class="ft-art-thumbnail"
        :class="{
          'nsfw-blurred': art.is_nsfw && !showNsfw && !isUnlocked,
          'is-loading': !isLoaded,
          'is-loaded': isLoaded
        }"
        loading="lazy"
        @load="handleImageLoad"
        @error="handleImageError"
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

      <!-- Теги (компактно, до 3 штук) -->
      <div v-if="art.tags && art.tags.length > 0" class="ft-art-tags">
        <span
          v-for="(tagName, index) in art.tags.slice(0, 3)"
          :key="tagName + index"
          class="ft-tag-pill"
          @click.stop="$emit('filter-tag', tagName)"
        >
          {{ tagName }}
        </span>
        <span v-if="art.tags.length > 3" class="ft-more-tags-pill">
          +{{ art.tags.length - 3 }}
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
  isUnlocked: { type: Boolean, default: false },
  cardIndex: { type: Number, default: 0 }
})

defineEmits(['open-lightbox', 'unlock-nsfw', 'filter-artist', 'filter-character', 'filter-tag'])

// Оптимизация изображений
const { optimizeImageUrl, useLazyImage } = useImageOptimization()
const imageRef = ref(null)
const imageContainerRef = ref(null)

// Ленивая загрузка
const { isLoaded, isInView, handleImageLoad } = useLazyImage(imageContainerRef)

// Локальное состояние UI
const isLiked = ref(false)
const showTagsTooltip = ref(false)

// Оптимизированный URL превью
const thumbnailFailed = ref(false)
const optimizedImageUrl = computed(() => {
  const url = props.art.thumbnail_url || props.art.image_url
  return optimizeImageUrl(url, { width: 400, quality: 75 })
})
const currentImageUrl = computed(() => {
  if (thumbnailFailed.value) {
    return optimizeImageUrl(props.art.image_url, { width: 400, quality: 75 })
  }
  return optimizedImageUrl.value
})
const handleImageError = () => {
  if (!thumbnailFailed.value && props.art.thumbnail_url && props.art.thumbnail_url !== props.art.image_url) {
    thumbnailFailed.value = true
  }
}

// Бейдж качества: "HD" если есть оригинальный image_url, "GIF" для анимации
const qualityBadge = computed(() => {
  const url = props.art.image_url || props.art.thumbnail_url || ''
  if (url.toLowerCase().includes('.gif')) return 'GIF'
  if (props.art.image_url && props.art.thumbnail_url && props.art.image_url !== props.art.thumbnail_url) return 'HD'
  return null
})

// Лайк (локальный, без сохранения на сервер)
const handleLike = () => {
  isLiked.value = !isLiked.value
}

// Открыть оригинал в новой вкладке
const openOriginal = () => {
  const url = props.art.image_url || props.art.thumbnail_url
  if (url) window.open(url, '_blank', 'noopener,noreferrer')
}

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
/* ===================================================
   КАРТОЧКА АРТА — MASONRY + GLASSMORPHISM
   =================================================== */

.ft-simple-art-card {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  position: relative;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);

  /* Плавный переход всего */
  transition:
    transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.35s ease;

  /* Анимация появления с задержкой */
  animation: cardFadeIn 0.5s ease-out both;
  animation-delay: calc(var(--card-index, 0) * 40ms);
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Hover: scale + neon glow */
.ft-simple-art-card:hover {
  transform: translateY(-6px) scale(1.02);
  border-color: rgba(255, 123, 37, 0.5);
  box-shadow:
    0 20px 48px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(255, 123, 37, 0.25),
    0 0 30px rgba(255, 123, 37, 0.12);
}

/* NSFW граница */
.ft-simple-art-card.nsfw-content::before {
  content: '';
  position: absolute;
  inset: 0;
  border: 2px solid rgba(255, 107, 107, 0.25);
  border-radius: 1rem;
  pointer-events: none;
  z-index: 1;
}

/* ===================================================
   КОНТЕЙНЕР ИЗОБРАЖЕНИЯ — ЕСТЕСТВЕННАЯ ВЫСОТА
   =================================================== */

.ft-art-image-container {
  position: relative;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 1rem 1rem 0 0;
  min-height: 160px;
}

/* Изображение — естественные пропорции (масонри!) */
.ft-art-thumbnail {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), filter 0.4s ease;
  will-change: transform;
}

/* Увеличение изображения при наведении на карточку */
.ft-simple-art-card:hover .ft-art-thumbnail {
  transform: scale(1.05);
}

/* Прогрессивная загрузка */
.ft-art-thumbnail.is-loading {
  filter: blur(8px);
  transform: scale(1.08);
}

.ft-art-thumbnail.is-loaded {
  filter: blur(0);
  transform: scale(1);
}

.ft-simple-art-card:hover .ft-art-thumbnail.is-loaded {
  transform: scale(1.05);
}

/* Placeholder */
.ft-image-placeholder {
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.2);
  font-size: 3rem;
}

/* ===================================================
   GLASSMORPHISM HOVER OVERLAY + QUICK ACTIONS
   =================================================== */

.ft-hover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.3) 40%,
    transparent 70%
  );
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
  opacity: 0;
  transition:
    opacity 0.3s ease,
    backdrop-filter 0.3s ease;
  pointer-events: none;
  z-index: 4;
  border-radius: 1rem 1rem 0 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.75rem;
}

.ft-simple-art-card:hover .ft-hover-overlay {
  opacity: 1;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  pointer-events: auto;
}

/* Кнопки действий */
.ft-hover-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  transform: translateY(-8px);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.ft-simple-art-card:hover .ft-hover-actions {
  transform: translateY(0);
}

.ft-action-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(20, 20, 20, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

/* Лайк */
.ft-action-like:hover,
.ft-action-like.liked {
  background: rgba(255, 69, 80, 0.85);
  border-color: rgba(255, 69, 80, 0.7);
  box-shadow: 0 0 16px rgba(255, 69, 80, 0.6);
  transform: scale(1.15);
  color: #fff;
}

/* Просмотр */
.ft-action-view:hover {
  background: rgba(33, 150, 243, 0.85);
  border-color: rgba(33, 150, 243, 0.7);
  box-shadow: 0 0 16px rgba(33, 150, 243, 0.6);
  transform: scale(1.15);
}

/* Теги */
.ft-action-tags:hover {
  background: rgba(255, 123, 37, 0.85);
  border-color: rgba(255, 123, 37, 0.7);
  box-shadow: 0 0 16px rgba(255, 123, 37, 0.6);
  transform: scale(1.15);
}

/* Теги в оверлее */
.ft-overlay-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: auto;
  padding-top: 0.5rem;
}

.ft-overlay-tag {
  padding: 0.2rem 0.55rem;
  border-radius: 1rem;
  font-size: 0.7rem;
  font-weight: 600;
  background: rgba(255, 123, 37, 0.25);
  border: 1px solid rgba(255, 123, 37, 0.5);
  color: #ffb07a;
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease;
  backdrop-filter: blur(4px);
}

.ft-overlay-tag:hover {
  background: rgba(255, 123, 37, 0.45);
  box-shadow: 0 0 10px rgba(255, 123, 37, 0.4);
}

.ft-overlay-tag-more {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  cursor: default;
}

/* ===================================================
   БЕЙДЖ КАЧЕСТВА (HD / GIF)
   =================================================== */

.ft-quality-badge {
  position: absolute;
  bottom: 0.6rem;
  left: 0.6rem;
  z-index: 6;
  pointer-events: none;
}

.ft-quality-badge span {
  display: inline-block;
  padding: 0.15rem 0.45rem;
  border-radius: 0.3rem;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  background: rgba(10, 10, 10, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  text-transform: uppercase;
}

/* ===================================================
   NSFW СТИЛИ
   =================================================== */

.ft-nsfw-indicator {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  z-index: 10;
}

.ft-nsfw-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.65rem;
  background: rgba(200, 50, 50, 0.85);
  color: white;
  border-radius: 1rem;
  font-size: 0.7rem;
  font-weight: 700;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 12px rgba(255, 80, 80, 0.5);
  border: 1px solid rgba(255, 120, 120, 0.5);
  animation: nsfwPulse 2.5s ease-in-out infinite;
}

@keyframes nsfwPulse {
  0%, 100% { box-shadow: 0 0 12px rgba(255, 80, 80, 0.4); }
  50%       { box-shadow: 0 0 22px rgba(255, 80, 80, 0.7); }
}

.ft-nsfw-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  cursor: pointer;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-radius: 1rem 1rem 0 0;
  transition: background 0.3s ease;
}

.ft-nsfw-overlay:hover {
  background: rgba(0, 0, 0, 0.88);
}

.ft-nsfw-overlay-content {
  text-align: center;
  color: white;
  padding: 2rem;
}

.ft-nsfw-overlay-content i {
  font-size: 2.8rem;
  margin-bottom: 0.75rem;
  color: #ff6b6b;
  display: block;
  transition: transform 0.3s ease, color 0.3s ease;
}

.ft-nsfw-overlay:hover .ft-nsfw-overlay-content i {
  color: #ff8a80;
  transform: scale(1.1);
}

.ft-nsfw-overlay-content h4 {
  margin: 0 0 0.4rem 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.ft-nsfw-overlay-content p {
  margin: 0;
  font-size: 0.85rem;
  color: #ccc;
}

.ft-art-thumbnail.nsfw-blurred {
  filter: blur(22px);
  transform: scale(1.1);
}

/* ===================================================
   ИНФОРМАЦИЯ ОБ АРТЕ
   =================================================== */

.ft-art-info {
  padding: 0.9rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.04) 0%,
    rgba(255, 255, 255, 0.02) 100%
  );
}

.ft-art-title {
  font-size: 1rem;
  font-weight: 700;
  color: #f2f2f2;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  transition: color 0.25s ease;
}

.ft-simple-art-card:hover .ft-art-title {
  color: #ff9344;
}

/* Художник */
.ft-artist-pill {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.7rem;
  background: rgba(76, 175, 80, 0.08);
  border: 1px solid rgba(76, 175, 80, 0.18);
  border-radius: 2rem;
  cursor: pointer;
  transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
  width: fit-content;
  max-width: 100%;
}

.ft-artist-pill:hover {
  background: rgba(76, 175, 80, 0.18);
  border-color: rgba(76, 175, 80, 0.35);
  transform: translateY(-2px);
}

.ft-artist-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.25);
  object-fit: cover;
  flex-shrink: 0;
}

.ft-artist-name {
  font-weight: 600;
  color: #e8e8e8;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ft-friend-star {
  color: #ffd700;
  font-size: 0.75rem;
  flex-shrink: 0;
}

/* Персонажи */
.ft-characters-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ft-characters-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  white-space: nowrap;
}

.ft-characters-avatars {
  display: flex;
  align-items: center;
}

.ft-character-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(255, 123, 37, 0.5);
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.25s ease, border-color 0.25s ease, z-index 0s;
  position: relative;
}

.ft-character-avatar:not(:first-child) {
  margin-left: -10px;
}

.ft-character-avatar:hover {
  transform: scale(1.12) translateY(-2px);
  z-index: 10;
  border-color: #ff7b25;
}

.ft-more-characters {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 123, 37, 0.75), rgba(255, 152, 0, 0.75));
  border: 2px solid rgba(255, 123, 37, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  color: white;
  cursor: pointer;
  margin-left: -10px;
}

/* Теги */
.ft-art-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.ft-tag-pill {
  padding: 0.25rem 0.6rem;
  border-radius: 1rem;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  background: rgba(255, 123, 37, 0.12);
  color: #ff9344;
  border: 1px solid rgba(255, 123, 37, 0.25);
}

.ft-tag-pill:hover {
  transform: translateY(-2px);
  background: rgba(255, 123, 37, 0.22);
  border-color: rgba(255, 123, 37, 0.45);
  box-shadow: 0 0 8px rgba(255, 123, 37, 0.25);
}

.ft-more-tags-pill {
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.55);
  padding: 0.25rem 0.6rem;
  border-radius: 1rem;
  font-size: 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Дата */
.ft-art-date {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.45);
}

.ft-art-date i {
  color: rgba(255, 123, 37, 0.5);
}

/* ===================================================
   АДАПТИВНОСТЬ
   =================================================== */

@media (max-width: 768px) {
  .ft-art-info {
    padding: 0.75rem 0.875rem;
    gap: 0.55rem;
  }

  .ft-art-title {
    font-size: 0.95rem;
  }

  .ft-character-avatar,
  .ft-more-characters {
    width: 28px;
    height: 28px;
  }

  .ft-character-avatar:not(:first-child),
  .ft-more-characters {
    margin-left: -8px;
  }

  .ft-artist-pill {
    padding: 0.35rem 0.55rem;
  }

  .ft-artist-avatar {
    width: 24px;
    height: 24px;
  }

  .ft-action-btn {
    width: 34px;
    height: 34px;
    font-size: 0.8rem;
  }
}

/* ===================================================
   PREFERS-REDUCED-MOTION
   =================================================== */

@media (prefers-reduced-motion: reduce) {
  .ft-simple-art-card,
  .ft-art-thumbnail,
  .ft-hover-overlay,
  .ft-action-btn,
  .ft-tag-pill,
  .ft-artist-pill {
    transition: none;
    animation: none;
  }

  .ft-simple-art-card:hover {
    transform: none;
  }

  .ft-simple-art-card:hover .ft-art-thumbnail {
    transform: none;
  }
}
</style>
