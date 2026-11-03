<script setup>
defineProps({
  image: { type: String, required: true }
})
</script>

<template>
  <header class="event-hero is-tall">
    <img class="hero-image" :src="image" alt="" fetchpriority="high" decoding="async" referrerpolicy="no-referrer">
    <div class="hero-overlay"></div>
    <div class="hero-content reveal">
      <slot />
    </div>
  </header>
</template>
