<template>
  <img v-if="src && !failed" :src="src" :alt="name" class="avatar" :class="sizeClass" loading="lazy" @error="failed = true">
  <span v-else class="avatar" :class="sizeClass" aria-hidden="true">{{ initial }}</span>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  src: { type: String, default: '' },
  name: { type: String, default: '' },
  size: { type: String, default: 'md' }
})

const failed = ref(false)
watch(() => props.src, () => { failed.value = false })

const sizeClass = computed(() => (props.size === 'md' ? '' : `avatar-${props.size}`))
const initial = computed(() => props.name.trim().charAt(0).toUpperCase() || '?')
</script>
