<template>
  <div class="christmas-lights">
    <div class="lights-container">
      <div
        v-for="(light, index) in lights"
        :key="index"
        class="light"
        :style="getLightStyle(light, index)"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChristmasLights',
  data() {
    return {
      lights: []
    }
  },
  mounted() {
    this.generateLights()
  },
  methods: {
    generateLights() {
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2']
      const numLights = Math.floor(window.innerWidth / 50)

      this.lights = Array.from({ length: numLights }, (_, i) => ({
        color: colors[i % colors.length],
        delay: Math.random() * 2,
        duration: 1.5 + Math.random() * 1.5,
        size: 8 + Math.random() * 4
      }))
    },
    getLightStyle(light, index) {
      const position = (index / this.lights.length) * 100
      const yOffset = Math.sin(index * 0.5) * 15

      return {
        left: `${position}%`,
        top: `${yOffset}px`,
        backgroundColor: light.color,
        boxShadow: `
          0 0 10px ${light.color},
          0 0 20px ${light.color},
          0 0 30px ${light.color},
          0 0 40px ${light.color}
        `,
        width: `${light.size}px`,
        height: `${light.size}px`,
        animationDelay: `${light.delay}s`,
        animationDuration: `${light.duration}s`
      }
    }
  }
}
</script>

<style scoped>
.christmas-lights {
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  height: 50px;
  z-index: 999;
  pointer-events: none;
  overflow: hidden;
}

.lights-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.light {
  position: absolute;
  border-radius: 50%;
  animation: glow 2s ease-in-out infinite alternate, swing 3s ease-in-out infinite;
  filter: brightness(1.2);
  transition: all 0.3s ease;
}

@keyframes glow {
  0% {
    opacity: 0.6;
    transform: scale(1);
  }
  100% {
    opacity: 1;
    transform: scale(1.1);
  }
}

@keyframes swing {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(5px) rotate(5deg);
  }
}

/* Мобильная адаптация */
@media (max-width: 768px) {
  .christmas-lights {
    top: 60px;
    height: 40px;
  }

  .light {
    width: 6px !important;
    height: 6px !important;
  }
}
</style>
