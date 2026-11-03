<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const SHOW_AFTER = 800 // px прокрутки, после которых кнопка нужна

const visible = ref(false)
let frame = 0

const update = () => {
  frame = 0
  visible.value = window.scrollY > SHOW_AFTER
}
const onScroll = () => { frame ||= requestAnimationFrame(update) }
const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  update()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  cancelAnimationFrame(frame)
})
</script>

<template>
  <Transition name="fade">
    <button v-if="visible" type="button" class="icon-btn scroll-top" aria-label="Наверх" @click="toTop">
      <span><i class="fas fa-arrow-up"></i></span>
    </button>
  </Transition>
</template>
