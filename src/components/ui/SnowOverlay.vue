<template>
  <div class="snow-overlay">
    <!-- Снег сверху экрана -->
    <div class="snow-top">
      <svg class="snow-svg" viewBox="0 0 1200 100" preserveAspectRatio="none">
        <path d="M0,0 Q50,30 100,20 T200,15 T300,25 T400,15 T500,30 T600,20 T700,25 T800,15 T900,30 T1000,20 T1100,25 T1200,20 L1200,100 L0,100 Z"
              fill="url(#snowGradient)" />
        <defs>
          <linearGradient id="snowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#e8f4ff;stop-opacity:0.9" />
            <stop offset="100%" style="stop-color:#d0e8ff;stop-opacity:0.6" />
          </linearGradient>
        </defs>
      </svg>
      <!-- Сосульки -->
      <div v-for="(icicle, index) in topIcicles" :key="'top-' + index"
           class="icicle"
           :style="{ left: icicle.position + '%', height: icicle.height + 'px', animationDelay: icicle.delay + 's' }">
      </div>
    </div>

    <!-- Снег снизу экрана -->
    <div class="snow-bottom">
      <svg class="snow-svg" viewBox="0 0 1200 80" preserveAspectRatio="none">
        <path d="M0,80 Q50,50 100,60 T200,65 T300,55 T400,65 T500,50 T600,60 T700,55 T800,65 T900,50 T1000,60 T1100,55 T1200,60 L1200,0 L0,0 Z"
              fill="url(#snowGradientBottom)" />
        <defs>
          <linearGradient id="snowGradientBottom" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#e8f4ff;stop-opacity:0.9" />
            <stop offset="100%" style="stop-color:#d0e8ff;stop-opacity:0.5" />
          </linearGradient>
        </defs>
      </svg>
    </div>

    <!-- Снег слева -->
    <div class="snow-left">
      <svg class="snow-svg-side" viewBox="0 0 80 800" preserveAspectRatio="none">
        <path d="M80,0 Q50,100 60,200 T55,400 T60,600 T55,800 L0,800 L0,0 Z"
              fill="url(#snowGradientLeft)" />
        <defs>
          <linearGradient id="snowGradientLeft" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#d0e8ff;stop-opacity:0.4" />
          </linearGradient>
        </defs>
      </svg>
    </div>

    <!-- Снег справа -->
    <div class="snow-right">
      <svg class="snow-svg-side" viewBox="0 0 80 800" preserveAspectRatio="none">
        <path d="M0,0 Q30,100 20,200 T25,400 T20,600 T25,800 L80,800 L80,0 Z"
              fill="url(#snowGradientRight)" />
        <defs>
          <linearGradient id="snowGradientRight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#d0e8ff;stop-opacity:0.4" />
          </linearGradient>
        </defs>
      </svg>
    </div>

    <!-- Снежинки на снегу -->
    <div class="sparkles">
      <div v-for="(sparkle, index) in sparkles"
           :key="'sparkle-' + index"
           class="sparkle"
           :style="{
             top: sparkle.top + '%',
             left: sparkle.left + '%',
             animationDelay: sparkle.delay + 's'
           }">✨</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SnowOverlay',
  data() {
    return {
      topIcicles: [],
      sparkles: []
    }
  },
  mounted() {
    this.generateIcicles()
    this.generateSparkles()
  },
  methods: {
    generateIcicles() {
      // Генерируем сосульки сверху
      for (let i = 0; i < 15; i++) {
        this.topIcicles.push({
          position: Math.random() * 100,
          height: 20 + Math.random() * 40,
          delay: Math.random() * 2
        })
      }
    },
    generateSparkles() {
      // Генерируем блёстки на снегу
      for (let i = 0; i < 30; i++) {
        this.sparkles.push({
          top: Math.random() < 0.5 ? Math.random() * 10 : 90 + Math.random() * 10,
          left: Math.random() * 100,
          delay: Math.random() * 3
        })
      }
    }
  }
}
</script>

<style scoped>
.snow-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 996;
}

/* Снег сверху */
.snow-top {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100px;
  filter: drop-shadow(0 5px 10px rgba(135, 206, 250, 0.4));
}

.snow-svg {
  width: 100%;
  height: 100%;
  display: block;
}

/* Сосульки */
.icicle {
  position: absolute;
  top: 0;
  width: 8px;
  background: linear-gradient(180deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(200, 230, 255, 0.8) 50%,
    rgba(150, 200, 255, 0.6) 100%
  );
  border-radius: 0 0 50% 50%;
  box-shadow:
    inset 2px 0 4px rgba(255, 255, 255, 0.8),
    inset -2px 0 4px rgba(135, 206, 250, 0.6),
    0 2px 6px rgba(135, 206, 250, 0.4);
  animation: icicleDrip 3s ease-in-out infinite;
}

@keyframes icicleDrip {
  0%, 100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(1.1);
  }
}

/* Снег снизу */
.snow-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 80px;
  filter: drop-shadow(0 -5px 10px rgba(135, 206, 250, 0.3));
}

/* Снег слева */
.snow-left {
  position: absolute;
  top: 0;
  left: 0;
  width: 80px;
  height: 100%;
  filter: drop-shadow(5px 0 10px rgba(135, 206, 250, 0.3));
}

/* Снег справа */
.snow-right {
  position: absolute;
  top: 0;
  right: 0;
  width: 80px;
  height: 100%;
  filter: drop-shadow(-5px 0 10px rgba(135, 206, 250, 0.3));
}

.snow-svg-side {
  width: 100%;
  height: 100%;
  display: block;
}

/* Блёстки на снегу */
.sparkles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.sparkle {
  position: absolute;
  font-size: 1rem;
  animation: sparkle 2s ease-in-out infinite;
  filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.8));
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* Мобильная адаптация */
@media (max-width: 768px) {
  .snow-top {
    height: 60px;
  }

  .snow-bottom {
    height: 50px;
  }

  .snow-left,
  .snow-right {
    width: 40px;
  }

  .icicle {
    width: 5px;
  }

  .sparkle {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .snow-top {
    height: 40px;
  }

  .snow-bottom {
    height: 30px;
  }

  .snow-left,
  .snow-right {
    width: 20px;
  }

  .sparkle {
    font-size: 0.5rem;
  }
}
</style>
