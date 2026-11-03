<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal-backdrop" @mousedown.self="!persistent && $emit('close')">
        <section
          ref="dialog"
          class="modal"
          :class="[size && `modal-${size}`, { 'is-danger': danger }]"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          tabindex="-1"
          @keydown.esc.stop="$emit('close')"
        >
          <header class="modal-head">
            <h2 :id="titleId">{{ title }}</h2>
            <button type="button" class="icon-btn" aria-label="Закрыть" @click="$emit('close')">
              <i class="fas fa-times"></i>
            </button>
          </header>

          <div class="modal-body"><slot /></div>

          <footer v-if="$slots.footer" class="modal-foot"><slot name="footer" /></footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  size: { type: String, default: '' },
  danger: { type: Boolean, default: false },
  // Модалка с вводом: клик по фону не закрывает, чтобы не потерять данные
  persistent: { type: Boolean, default: false }
})
defineEmits(['close'])

const dialog = ref(null)
const titleId = useId()
let previousFocus = null

const lockScroll = (locked) => document.documentElement.classList.toggle('scroll-lock', locked)

watch(() => props.open, async (open) => {
  lockScroll(open)
  if (open) {
    previousFocus = document.activeElement
    await nextTick()
    dialog.value?.focus()
  } else {
    previousFocus?.focus?.()
  }
})

onBeforeUnmount(() => lockScroll(false))
</script>
