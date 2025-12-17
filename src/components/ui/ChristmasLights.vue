<template>
  <div class="christmas-lights">
    <div class="lights-wire">
      <div
        v-for="(light, index) in lights"
        :key="index"
        class="light"
        :style="{
          '--delay': light.delay,
          '--color': light.color,
          left: light.position + '%'
        }"
      >
        <div class="bulb"></div>
        <div class="glow"></div>
      </div>
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
      const colors = [
        '#00ff41', // Ярко-зелёный неон
        '#39ff14', // Лаймовый неон
        '#0fff50', // Мятный неон
        '#52ff00', // Салатовый неон
        '#7fff00', // Шартрез неон
        '#adff2f', // Желто-зелёный
        '#00ffff', // Циановый (для разнообразия)
        '#ffffff'  // Белый
      ]

      const lightsCount = 30
      const spacing = 100 / lightsCount

      for (let i = 0; i < lightsCount; i++) {
        this.lights.push({
          position: i * spacing + (spacing / 2),
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 2 + 's'
        })
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
  height: 60px;
  z-index: 999;
  pointer-events: none;
  overflow: hidden;
}

.lights-wire {
  position: relative;
  width: 100%;
  height: 100%;
}

.light {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  animation: swing 3s ease-in-out infinite;
  animation-delay: var(--delay);
}

.bulb {
  width: 12px;
  height: 18px;
  background: var(--color);
  border-radius: 0 0 50% 50%;
  position: relative;
  box-shadow:
    0 0 10px var(--color),
    0 0 20px var(--color),
    inset 0 -2px 4px rgba(0, 0, 0, 0.3);
  animation: blink 1.5s ease-in-out infinite;
  animation-delay: var(--delay);
}

.bulb::before {
  content: '';
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 4px;
  background: #2a2a2a;
  border-radius: 2px;
}

.bulb::after {
  content: '';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 1px;
  height: 10px;
  background: #333;
}

.glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
  background: radial-gradient(circle, var(--color) 0%, transparent 70%);
  opacity: 0.6;
  animation: pulse 1.5s ease-in-out infinite;
  animation-delay: var(--delay);
  filter: blur(8px);
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
    filter: brightness(1.2);
  }
  50% {
    opacity: 0.5;
    filter: brightness(0.8);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

@keyframes swing {
  0%, 100% {
    transform: translateX(-50%) rotate(-2deg);
  }
  50% {
    transform: translateX(-50%) rotate(2deg);
  }
}

/* Добавляем провод между лампочками */
.lights-wire::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent 0%,
    #333 2%,
    #333 98%,
    transparent 100%
  );
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* Мобильная адаптация */
@media (max-width: 768px) {
  .christmas-lights {
    top: 60px;
    height: 40px;
  }

  .bulb {
    width: 8px;
    height: 14px;
  }

  .glow {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 480px) {
  .bulb {
    width: 6px;
    height: 12px;
  }

  .bulb::before {
    width: 6px;
    height: 3px;
  }

  .glow {
    width: 15px;
    height: 15px;
  }
}
</style>
