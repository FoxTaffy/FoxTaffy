<template>
  <div class="fireworks-container" v-if="show">
    <canvas ref="fireworksCanvas" class="fireworks-canvas"></canvas>
  </div>
</template>

<script>
export default {
  name: 'Fireworks',
  props: {
    show: {
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
    show(newVal) {
      if (newVal) {
        this.startFireworks()
      } else {
        this.stopFireworks()
      }
    }
  },
  mounted() {
    if (this.show) {
      this.startFireworks()
    }
  },
  beforeUnmount() {
    this.stopFireworks()
  },
  methods: {
    startFireworks() {
      this.$nextTick(() => {
        this.canvas = this.$refs.fireworksCanvas
        if (!this.canvas) return

        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        this.ctx = this.canvas.getContext('2d')

        window.addEventListener('resize', this.handleResize)
        this.animate()

        setInterval(() => {
          this.createFirework()
        }, 400)
      })
    },
    stopFireworks() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId)
        this.animationId = null
      }
      window.removeEventListener('resize', this.handleResize)
      this.particles = []
    },
    handleResize() {
      if (this.canvas) {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
      }
    },
    createFirework() {
      const x = Math.random() * this.canvas.width
      const y = Math.random() * (this.canvas.height / 2)
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
        '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
        '#FFD54F', '#81C784', '#FF7043', '#64B5F6'
      ]
      const color = colors[Math.floor(Math.random() * colors.length)]
      const particleCount = 50 + Math.floor(Math.random() * 50)

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount
        const velocity = 2 + Math.random() * 4
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: 1,
          color,
          size: 2 + Math.random() * 2
        })
      }
    },
    animate() {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i]

        p.x += p.vx
        p.y += p.vy
        p.vy += 0.1
        p.life -= 0.01

        if (p.life <= 0) {
          this.particles.splice(i, 1)
          continue
        }

        this.ctx.globalAlpha = p.life
        this.ctx.fillStyle = p.color
        this.ctx.shadowBlur = 15
        this.ctx.shadowColor = p.color
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
  background: rgba(0, 0, 0, 0.3);
}

.fireworks-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
