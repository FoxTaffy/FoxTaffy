<template>
  <div class="fireworks-container" v-if="active">
    <canvas ref="fireworksCanvas" class="fireworks-canvas"></canvas>
    <div class="celebration-message">
      <h1 class="celebration-title">🎉 С Новым Годом! 🎊</h1>
      <p class="celebration-subtitle">{{ new Date().getFullYear() }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Fireworks',
  props: {
    active: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      canvas: null,
      ctx: null,
      particles: [],
      animationId: null
    }
  },
  watch: {
    active(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.initCanvas()
          this.startFireworks()
        })
      } else {
        this.stopFireworks()
      }
    }
  },
  mounted() {
    if (this.active) {
      this.initCanvas()
      this.startFireworks()
    }
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    this.stopFireworks()
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    initCanvas() {
      this.canvas = this.$refs.fireworksCanvas
      if (!this.canvas) return

      this.ctx = this.canvas.getContext('2d')
      this.canvas.width = window.innerWidth
      this.canvas.height = window.innerHeight
    },
    handleResize() {
      if (this.canvas) {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
      }
    },
    startFireworks() {
      this.animate()
      // Запускаем фейерверки каждые 500мс
      this.fireworkInterval = setInterval(() => {
        this.createFirework()
      }, 500)
    },
    stopFireworks() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId)
        this.animationId = null
      }
      if (this.fireworkInterval) {
        clearInterval(this.fireworkInterval)
        this.fireworkInterval = null
      }
      this.particles = []
    },
    createFirework() {
      const colors = [
        '#00ff41', // Ярко-зелёный
        '#39ff14', // Лаймовый
        '#0fff50', // Мятный
        '#52ff00', // Салатовый
        '#7fff00', // Шартрез
        '#adff2f', // Желто-зелёный
        '#00ffff', // Циановый
        '#ffffff', // Белый
        '#ff00ff', // Пурпурный
        '#ffff00'  // Жёлтый
      ]

      const x = Math.random() * this.canvas.width
      const y = Math.random() * (this.canvas.height * 0.5) + this.canvas.height * 0.1
      const color = colors[Math.floor(Math.random() * colors.length)]
      const particleCount = 60 + Math.random() * 40

      // Создаём взрыв
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount
        const velocity = 2 + Math.random() * 4

        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: 1,
          color: color,
          size: 2 + Math.random() * 3,
          decay: 0.005 + Math.random() * 0.01,
          gravity: 0.05
        })
      }

      // Добавляем искры
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2
        const velocity = 1 + Math.random() * 2

        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: 1,
          color: '#ffffff',
          size: 1 + Math.random() * 2,
          decay: 0.01 + Math.random() * 0.02,
          gravity: 0.1,
          trail: true
        })
      }
    },
    animate() {
      this.ctx.fillStyle = 'rgba(10, 10, 15, 0.15)'
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

      // Обновляем и рисуем частицы
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i]

        // Обновляем позицию
        p.x += p.vx
        p.y += p.vy
        p.vy += p.gravity
        p.life -= p.decay

        // Удаляем мёртвые частицы
        if (p.life <= 0) {
          this.particles.splice(i, 1)
          continue
        }

        // Рисуем частицу
        this.ctx.globalAlpha = p.life
        this.ctx.fillStyle = p.color

        if (p.trail) {
          // Рисуем след
          this.ctx.shadowBlur = 15
          this.ctx.shadowColor = p.color
        } else {
          this.ctx.shadowBlur = 10
          this.ctx.shadowColor = p.color
        }

        this.ctx.beginPath()
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        this.ctx.fill()
      }

      this.ctx.globalAlpha = 1
      this.ctx.shadowBlur = 0

      this.animationId = requestAnimationFrame(this.animate)
    }
  }
}
</script>

<style scoped>
.fireworks-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  pointer-events: none;
  background: linear-gradient(180deg,
    rgba(10, 10, 15, 0.8) 0%,
    rgba(5, 15, 10, 0.9) 100%
  );
}

.fireworks-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.celebration-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  animation: celebrationPulse 2s ease-in-out infinite;
}

.celebration-title {
  font-size: 4rem;
  font-weight: 900;
  margin: 0;
  background: linear-gradient(135deg,
    #00ff41 0%,
    #adff2f 25%,
    #7fff00 50%,
    #39ff14 75%,
    #00ff41 100%
  );
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow:
    0 0 40px rgba(0, 255, 65, 0.8),
    0 0 80px rgba(0, 255, 65, 0.5);
  animation: gradientMove 3s ease infinite, textGlowPulse 1.5s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(0, 255, 65, 0.6));
}

.celebration-subtitle {
  font-size: 3rem;
  font-weight: 800;
  color: #00ffff;
  margin: 1rem 0 0 0;
  text-shadow:
    0 0 30px rgba(0, 255, 255, 0.8),
    0 0 60px rgba(0, 255, 255, 0.5);
  animation: numberPulse 1s ease-in-out infinite;
}

@keyframes celebrationPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.05);
  }
}

@keyframes gradientMove {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes textGlowPulse {
  0%, 100% {
    filter: drop-shadow(0 0 20px rgba(0, 255, 65, 0.6));
  }
  50% {
    filter: drop-shadow(0 0 40px rgba(0, 255, 65, 1));
  }
}

@keyframes numberPulse {
  0%, 100% {
    text-shadow:
      0 0 30px rgba(0, 255, 255, 0.8),
      0 0 60px rgba(0, 255, 255, 0.5);
  }
  50% {
    text-shadow:
      0 0 50px rgba(0, 255, 255, 1),
      0 0 100px rgba(0, 255, 255, 0.8);
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .celebration-title {
    font-size: 3rem;
  }

  .celebration-subtitle {
    font-size: 2.5rem;
  }
}

@media (max-width: 480px) {
  .celebration-title {
    font-size: 2rem;
  }

  .celebration-subtitle {
    font-size: 1.8rem;
  }
}
</style>
