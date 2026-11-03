<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  items: { type: Array, required: true } // [{ id, label, icon }]
})
const active = defineModel({ default: '' })

const progress = ref(0)
let spy = null
let frame = 0

const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

const updateProgress = () => {
  frame = 0
  const max = document.documentElement.scrollHeight - window.innerHeight
  progress.value = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0
}
const onScroll = () => { frame ||= requestAnimationFrame(updateProgress) }

onMounted(() => {
  spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) active.value = entry.target.id })
  }, { rootMargin: '-40% 0px -55% 0px' })
  props.items.forEach(({ id }) => {
    const el = document.getElementById(id)
    if (el) spy.observe(el)
  })
  window.addEventListener('scroll', onScroll, { passive: true })
  updateProgress()
})

onBeforeUnmount(() => {
  spy?.disconnect()
  window.removeEventListener('scroll', onScroll)
  cancelAnimationFrame(frame)
})
</script>

<template>
  <nav class="event-navigation is-sticky" aria-label="Разделы страницы">
    <div class="nav-tabs">
      <a
        v-for="item in items"
        :key="item.id"
        :href="`#${item.id}`"
        class="nav-tab"
        :class="{ active: active === item.id }"
        :aria-current="active === item.id ? 'location' : null"
        @click.prevent="go(item.id)"
      >
        <i :class="item.icon"></i>
        <span>{{ item.label }}</span>
      </a>
    </div>
    <progress class="meter" max="100" :value="progress" aria-label="Прогресс чтения"></progress>
  </nav>
</template>
