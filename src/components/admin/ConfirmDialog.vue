<template>
  <ModalDialog :open="open" :title="title" size="sm" :danger="danger" @close="$emit('cancel')">
    <div class="stack">
      <p v-if="message">{{ message }}</p>
      <slot />
    </div>

    <template #footer>
      <button type="button" class="btn" :disabled="busy" @click="$emit('cancel')">{{ cancelText }}</button>
      <button
        type="button"
        class="btn"
        :class="danger ? 'btn-danger' : 'btn-primary'"
        :disabled="busy || confirmDisabled"
        @click="$emit('confirm')"
      >
        <span v-if="busy" class="spinner spinner-sm"></span>
        {{ confirmText }}
      </button>
    </template>
  </ModalDialog>
</template>

<script setup>
import ModalDialog from './ModalDialog.vue'

defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  confirmText: { type: String, default: 'Подтвердить' },
  cancelText: { type: String, default: 'Отмена' },
  danger: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
  confirmDisabled: { type: Boolean, default: false }
})
defineEmits(['confirm', 'cancel'])
</script>
