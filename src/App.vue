<template>
  <div>
    <router-view />
    <SpeedInsights />
  </div>
</template>

<script>
import { SpeedInsights } from "@vercel/speed-insights/vue"

export default {
  name: 'App',
  components: {
    SpeedInsights
  }
}
</script>