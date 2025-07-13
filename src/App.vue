<template>
  <SpeedInsights />
  <router-view />
</template>

<script>
import { SpeedInsights } from '@vercel/speed-insights/vue';
export default {
  name: 'App'
}
</script>