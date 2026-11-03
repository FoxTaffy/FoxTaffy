<script setup>
import { computed } from 'vue'
import { useNotifications } from '@/composables/useNotifications'

const props = defineProps({
  viewer: { type: Object, required: true } // результат useSlideViewer()
})

const { current, index, slides, playing, close, step, togglePlay, share, swipeStart, swipeEnd } = props.viewer
const { notification, showNotification } = useNotifications()

const hasMany = computed(() => slides.value.length > 1)

const SHARE_RESULT = {
  copied: ['Ссылка на момент скопирована', 'success'],
  failed: ['Не удалось скопировать ссылку', 'error']
}

const onShare = async () => {
  const message = SHARE_RESULT[await share()]
  if (message) showNotification(...message)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div
        v-if="current"
        class="lightbox-overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="current.title"
        @click.self="close"
        @pointerdown="swipeStart"
        @pointerup="swipeEnd"
      >
        <img :key="current.src" class="lightbox-image" :src="current.src" :alt="current.title" referrerpolicy="no-referrer" draggable="false">

        <div class="lightbox-tools">
          <button v-if="hasMany" type="button" class="icon-btn" :aria-label="playing ? 'Остановить слайд-шоу' : 'Запустить слайд-шоу'" @click.stop="togglePlay">
            <font-awesome-icon :icon="playing ? 'pause' : 'play'" />
          </button>
          <button type="button" class="icon-btn" aria-label="Поделиться ссылкой на момент" @click.stop="onShare">
            <i class="fas fa-link"></i>
          </button>
        </div>

        <button type="button" class="lightbox-close" aria-label="Закрыть" @click.stop="close"><i class="fas fa-times"></i></button>
        <button v-if="index > 0" type="button" class="icon-btn lightbox-nav prev" aria-label="Назад" @click.stop="step(-1)"><i class="fas fa-chevron-left"></i></button>
        <button v-if="index < slides.length - 1" type="button" class="icon-btn lightbox-nav next" aria-label="Вперёд" @click.stop="step(1)"><i class="fas fa-chevron-right"></i></button>
        <p class="lightbox-caption">{{ current.title }}<template v-if="current.sub"> · {{ current.sub }}</template> · {{ index + 1 }} / {{ slides.length }}</p>
      </div>
    </Transition>

    <div class="toast-stack" aria-live="polite">
      <Transition name="toast">
        <div v-if="notification.show" class="toast" :class="`is-${notification.type}`" role="status">
          <font-awesome-icon :icon="notification.type === 'success' ? 'check-circle' : 'exclamation-circle'" />
          <span class="grow">{{ notification.message }}</span>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>
