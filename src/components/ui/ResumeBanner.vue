<script setup>
import { computed, watch } from 'vue'
import { useResume } from '@/composables/useResume'

const props = defineProps({
  items: { type: Array, required: true }, // главы: [{ id, label }]
  active: { type: String, default: '' },
  storageKey: { type: String, required: true }
})

const { resumeId, remember, forget } = useResume(props.storageKey)

// Предлагаем продолжить, только если читатель остановился не на первой главе
const target = computed(() => props.items.find((item) => item.id === resumeId.value && item.id !== props.items[0].id))

watch(() => props.active, (id) => {
  if (!id) return
  remember(id)
  forget()
})

const resume = () => {
  document.getElementById(target.value.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  forget()
}
</script>

<template>
  <button v-if="target" type="button" class="link-card" @click="resume">
    <span class="icon-badge icon-badge-round"><i class="fas fa-history"></i></span>
    <span class="link-card-body">
      <span class="link-card-title">Продолжить чтение</span>
      <span class="link-card-text">В прошлый раз вы остановились на разделе «{{ target.label }}»</span>
    </span>
    <i class="fas fa-arrow-right"></i>
  </button>
</template>
