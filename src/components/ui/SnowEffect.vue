<template>
  <div class="snow-container">
    <div
      v-for="(flake, index) in snowflakes"
      :key="index"
      class="snowflake"
      :style="{
        left: flake.left + '%',
        animationDuration: flake.duration + 's',
        animationDelay: flake.delay + 's',
        fontSize: flake.size + 'px',
        opacity: flake.opacity
      }"
    >
      {{ flake.char }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'SnowEffect',
  data() {
    return {
      snowflakes: []
    }
  },
  mounted() {
    this.generateSnowflakes()
  },
  methods: {
    generateSnowflakes() {
      const flakeChars = ['❄', '❅', '❆', '✻', '✼', '❉']
      const count = 50 // Количество снежинок

      for (let i = 0; i < count; i++) {
        this.snowflakes.push({
          left: Math.random() * 100,
          duration: 5 + Math.random() * 10, // 5-15 секунд
          delay: Math.random() * 5, // 0-5 секунд задержка
          size: 10 + Math.random() * 20, // 10-30px
          opacity: 0.3 + Math.random() * 0.7, // 0.3-1
          char: flakeChars[Math.floor(Math.random() * flakeChars.length)]
        })
      }
    }
  }
}
</script>

<style scoped>
.snow-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 997;
  overflow: hidden;
}

.snowflake {
  position: absolute;
  top: -50px;
  color: #ffffff;
  text-shadow:
    0 0 5px rgba(255, 255, 255, 0.8),
    0 0 10px rgba(173, 255, 47, 0.3);
  animation: fall linear infinite, sway ease-in-out infinite;
  user-select: none;
}

@keyframes fall {
  to {
    transform: translateY(100vh);
  }
}

@keyframes sway {
  0%, 100% {
    transform: translateX(-20px);
  }
  50% {
    transform: translateX(20px);
  }
}
</style>
