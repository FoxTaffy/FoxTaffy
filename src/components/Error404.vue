<template>
    <div class="error-page">
      <!-- Фоновое видео -->
      <div class="video-background">
        <video autoplay loop muted playsinline>
          <source src="https://5e9762b1-f4cb-456c-a5a1-ee0773e66d88.selstorage.ru/404.mp4" type="video/mp4">
        </video>
        <div class="video-overlay"></div>
      </div>
      
      <!-- Эффект дождя -->
      <div class="rain-container"></div>
      
      <!-- Текст ошибки и навигация -->
      <div class="error-content">
        <div class="error-code">
          <span class="digit">4</span>
          <span class="digit middle">0</span>
          <span class="digit">4</span>
        </div>
        
        <div class="error-message">
          <h2>Заблудились в лесу</h2>
          <p>Дождь размыл все следы, и тропинка исчезла в тумане...</p>
        </div>
        
        <div class="quotes-container">
          <div class="quote">WHERE AM I...?</div>
        </div>
        
        <div class="navigation">
          <router-link to="/" class="home-button">
            <div class="button-light"></div>
            <span>Выбраться из леса</span>
          </router-link>
        </div>
      </div>
      
      <!-- Декоративные элементы -->
      <div class="forest-elements">
        <div class="puddle puddle-1"></div>
        <div class="puddle puddle-2"></div>
        <div class="lightning"></div>
      </div>
      
      <!-- Виньетка по краям -->
      <div class="vignette"></div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Error404Page',
    
    mounted() {
      this.createRaindrops();
      this.initLightning();
      this.initPuddles();
      this.ensureVideoPlayback();
    },
    
    methods: {
      createRaindrops() {
        const container = document.querySelector('.rain-container');
        const rainCount = window.innerWidth < 768 ? 100 : 200;
        
        for (let i = 0; i < rainCount; i++) {
          const drop = document.createElement('div');
          drop.className = 'raindrop';
          
          // Случайные параметры для реалистичности
          const size = Math.random() * 1.5 + 0.5;
          const posX = Math.floor(Math.random() * window.innerWidth);
          const duration = Math.random() * 0.7 + 0.3;
          const delay = Math.random() * 5;
          const opacity = Math.random() * 0.4 + 0.2;
          
          drop.style.width = `${size}px`;
          drop.style.height = `${size * 15}px`;
          drop.style.left = `${posX}px`;
          drop.style.animationDuration = `${duration}s`;
          drop.style.animationDelay = `${delay}s`;
          drop.style.opacity = opacity;
          
          container.appendChild(drop);
        }
      },
      
      initLightning() {
        const lightning = document.querySelector('.lightning');
        
        // Функция для создания вспышки молнии
        const flash = () => {
          lightning.style.opacity = '1';
          
          // Имитация нескольких вспышек молнии
          setTimeout(() => { lightning.style.opacity = '0.3'; }, 50);
          setTimeout(() => { lightning.style.opacity = '0.8'; }, 100);
          setTimeout(() => { lightning.style.opacity = '0.2'; }, 175);
          setTimeout(() => { lightning.style.opacity = '1'; }, 200);
          setTimeout(() => { lightning.style.opacity = '0'; }, 250);
          
          // Случайное время до следующей молнии
          const nextFlash = Math.random() * 8000 + 5000;
          setTimeout(flash, nextFlash);
        };
        
        // Запускаем первую молнию с задержкой
        setTimeout(flash, 2000);
      },
      
      initPuddles() {
        const puddles = document.querySelectorAll('.puddle');
        
        // Анимация "капель" в лужах
        puddles.forEach(puddle => {
          const createRipple = () => {
            puddle.classList.add('ripple');
            setTimeout(() => {
              puddle.classList.remove('ripple');
            }, 600);
            
            // Следующая "капля" через случайное время
            const nextRipple = Math.random() * 3000 + 1000;
            setTimeout(createRipple, nextRipple);
          };
          
          // Запуск с небольшой случайной задержкой
          setTimeout(createRipple, Math.random() * 2000);
        });
      },
      
      ensureVideoPlayback() {
        const video = document.querySelector('video');
        
        // Обработка проблем с автовоспроизведением
        video.addEventListener('canplay', () => {
          if (video.paused) {
            video.play().catch(err => {
              console.log('Автовоспроизведение отключено в браузере', err);
              
              // Создаем кнопку для активации видео
              const playButton = document.createElement('button');
              playButton.className = 'video-play-button';
              playButton.innerHTML = '<i class="fas fa-play"></i>';
              playButton.addEventListener('click', () => {
                video.play();
                playButton.remove();
              });
              
              document.querySelector('.video-background').appendChild(playButton);
            });
          }
        });
      }
    },
    
    beforeDestroy() {
      // Очистка интервалов при уничтожении компонента
      const interval = window.setInterval(() => {}, 0);
      for (let i = 0; i <= interval; i++) {
        window.clearInterval(i);
      }
    }
  }
  </script>
  
  <style scoped>
  /* Импорт шрифтов для мокрого/туманного эффекта */
  @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&family=Source+Sans+Pro:wght@300;400;600;700&display=swap');
  
  /* Основные стили страницы */
  .error-page {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #000;
    color: #fff;
    font-family: 'Quicksand', 'Nunito', sans-serif;
  }
  
  /* Видео-фон */
  .video-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
  
  .video-background video {
    position: absolute;
    min-width: 70%;
    min-height: 70%;
    width: auto;
    height: auto;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    object-fit: cover;
  }
  
  .video-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    z-index: 2;
  }
  
  /* Эффект затемнения по краям */
  .vignette {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    box-shadow: inset 0 0 180px 80px rgba(0, 0, 0, 0.85);
    pointer-events: none;
    z-index: 5;
  }
  
  /* Эффект дождя */
  .rain-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    pointer-events: none;
  }
  
  .raindrop {
    position: absolute;
    top: -20px;
    background: linear-gradient(
      to bottom,
      rgba(188, 212, 230, 0.1),
      rgba(188, 212, 230, 0.5)
    );
    filter: blur(0.7px);
    animation: rain linear infinite both;
  }
  
  @keyframes rain {
    0% {
      transform: translateY(-20px) rotate(2deg);
    }
    100% {
      transform: translateY(calc(100vh + 50px)) rotate(2deg);
    }
  }
  
  /* Контент ошибки */
  .error-content {
    position: absolute;
    top: -262px;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding-left: 10%;
    z-index: 15;
  }
  
  .error-code {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .digit {
    font-size: 8rem;
    font-weight: 700;
    line-height: 1;
    text-shadow: 
      0 0 15px rgba(148, 175, 220, 0.8),
      0 0 25px rgba(148, 175, 220, 0.5);
    animation: glowPulse 3s ease-in-out infinite;
    background: linear-gradient(135deg, #86a8d9 30%, #a4c2aa 70%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    opacity: 0.8;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
    letter-spacing: -5px;
  }
  
  .digit.middle {
    position: relative;
    animation: glowAndRotate 3s ease-in-out infinite;
    margin: 0 -0.5rem;
  }
  
  .digit.middle::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 110%;
    height: 110%;
    border: 3px solid;
    border-color: rgba(148, 175, 220, 0.7) rgba(164, 194, 170, 0.7) rgba(164, 194, 170, 0.7) rgba(148, 175, 220, 0.7);
    border-radius: 50%;
    animation: rotate 10s linear infinite;
    opacity: 0.6;
    filter: blur(1px);
  }
  
  @keyframes glowPulse {
    0%, 100% {
      text-shadow: 
        0 0 15px rgba(148, 175, 220, 0.8),
        0 0 25px rgba(148, 175, 220, 0.5);
      opacity: 0.7;
    }
    50% {
      text-shadow: 
        0 0 20px rgba(164, 194, 170, 0.8),
        0 0 30px rgba(164, 194, 170, 0.5);
      opacity: 0.9;
    }
  }
  
  @keyframes glowAndRotate {
    0%, 100% {
      text-shadow: 
        0 0 15px rgba(148, 175, 220, 0.8),
        0 0 25px rgba(148, 175, 220, 0.5);
      transform: rotate(-5deg);
      filter: brightness(0.9);
    }
    50% {
      text-shadow: 
        0 0 20px rgba(164, 194, 170, 0.8),
        0 0 30px rgba(164, 194, 170, 0.5);
      transform: rotate(5deg);
      filter: brightness(1.1);
    }
  }
  
  @keyframes rotate {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }
  
  .error-message {
    max-width: 500px;
    margin-bottom: 2rem;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    padding: 1.5rem 2rem;
    border-radius: 0.5rem;
    background: rgba(40, 50, 65, 0.4);
    border-left: 3px solid rgba(148, 175, 220, 0.5);
    position: relative;
    overflow: hidden;
  }
  
  .error-message::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      45deg,
      rgba(188, 212, 230, 0.05) 25%,
      transparent 25%,
      transparent 50%,
      rgba(188, 212, 230, 0.05) 50%,
      rgba(188, 212, 230, 0.05) 75%,
      transparent 75%
    );
    opacity: 0.2;
    background-size: 20px 20px;
    pointer-events: none;
    z-index: -1;
  }
  
  .error-message h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: rgba(224, 238, 255, 0.9);
    font-weight: 600;
    letter-spacing: 1px;
    text-shadow: 
      0 0 8px rgba(0, 20, 40, 0.6),
      0 2px 4px rgba(0, 0, 0, 0.8);
    position: relative;
  }
  
  .error-message h2::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 100px;
    height: 2px;
    background: linear-gradient(90deg, rgba(148, 175, 220, 0.8), transparent);
    border-radius: 2px;
  }
  
  .error-message p {
    font-size: 1.2rem;
    color: rgba(224, 238, 255, 0.8);
    line-height: 1.7;
    font-weight: 400;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    letter-spacing: 0.5px;
  }
  
  /* Цитата */
  .quotes-container {
    position: absolute;
    top: 45%;
    right: 15%;
    transform: translateY(-50%);
    perspective: 500px;
  }
  
  .quote {
    font-size: 3.2rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.08);
    letter-spacing: 3px;
    font-family: 'Source Sans Pro', 'Nunito', sans-serif;
    text-transform: lowercase;
    filter: blur(1px);
    animation: floatText 8s ease-in-out infinite;
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
    padding: 1rem;
    transform-style: preserve-3d;
    position: relative;
  }
  
  .quote::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to bottom,
      rgba(188, 212, 230, 0.05),
      transparent
    );
    z-index: -1;
    transform: translateZ(-10px);
    opacity: 0.8;
    filter: blur(5px);
  }
  
  @keyframes floatText {
    0% {
      opacity: 0.08;
      transform: translateY(0) rotateX(10deg) rotateY(-5deg);
      filter: blur(1px);
    }
    50% {
      opacity: 0.15;
      transform: translateY(-15px) rotateX(-5deg) rotateY(5deg);
      filter: blur(0.8px);
    }
    100% {
      opacity: 0.08;
      transform: translateY(0) rotateX(10deg) rotateY(-5deg);
      filter: blur(1px);
    }
  }
  
  /* Навигация */
  .navigation {
    margin-top: 1rem;
  }
  
  .home-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    padding: 0.8rem 2rem;
    background: rgba(40, 50, 65, 0.6);
    color: rgba(224, 238, 255, 0.9);
    text-decoration: none;
    border-radius: 3rem;
    font-size: 1.1rem;
    font-weight: 500;
    overflow: hidden;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(188, 212, 230, 0.2);
    transition: all 0.3s ease;
    letter-spacing: 0.5px;
  }
  
  .home-button:hover {
    transform: translateY(-5px);
    box-shadow: 
      0 8px 25px rgba(0, 0, 0, 0.4),
      0 0 15px rgba(148, 175, 220, 0.4);
    color: rgba(224, 238, 255, 1);
    border-color: rgba(188, 212, 230, 0.4);
  }
  
  .button-light {
    position: absolute;
    top: 0;
    left: 0;
    width: 20px;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(188, 212, 230, 0.3),
      transparent
    );
    filter: blur(5px);
    transform: skewX(-15deg) translateX(-20px);
    animation: lightMove 3s ease-in-out infinite;
  }
  
  @keyframes lightMove {
    0% {
      transform: skewX(-15deg) translateX(-150%);
    }
    100% {
      transform: skewX(-15deg) translateX(250%);
    }
  }
  
  /* Декоративные элементы */
  .forest-elements {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 4;
    pointer-events: none;
  }
  
  .puddle {
    position: absolute;
    background: radial-gradient(
      ellipse at center,
      rgba(188, 212, 230, 0.2),
      rgba(188, 212, 230, 0.1)
    );
    border-radius: 50%;
    transform: perspective(200px) rotateX(45deg);
    box-shadow: 0 0 20px rgba(188, 212, 230, 0.1);
    opacity: 0.5;
    filter: blur(1px);
    transition: all 0.5s ease;
  }
  
  .puddle-1 {
    width: 180px;
    height: 70px;
    bottom: 15%;
    left: 20%;
  }
  
  .puddle-2 {
    width: 150px;
    height: 60px;
    bottom: 10%;
    right: 25%;
  }
  
  .puddle.ripple {
    box-shadow: 0 0 30px rgba(188, 212, 230, 0.3);
    opacity: 0.7;
  }
  
  .lightning {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(188, 212, 230, 0.03);
    opacity: 0;
    transition: opacity 0.1s ease;
    z-index: 3;
  }
  
  /* Кнопка для запуска видео (на случай проблем с автовоспроизведением) */
  .video-play-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(148, 175, 220, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
    border: none;
    cursor: pointer;
    z-index: 100;
    box-shadow: 0 0 30px rgba(148, 175, 220, 0.5);
    animation: pulse 2s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: translate(-50%, -50%) scale(1);
      box-shadow: 0 0 30px rgba(148, 175, 220, 0.5);
    }
    50% {
      transform: translate(-50%, -50%) scale(1.1);
      box-shadow: 0 0 40px rgba(148, 175, 220, 0.7);
    }
  }
  
  /* Адаптивность */
  @media (max-width: 1200px) {
    .quotes-container {
      right: 10%;
    }
  }
  
  @media (max-width: 992px) {
    .error-content {
      align-items: center;
      padding-left: 0;
      text-align: center;
    }
    
    .quotes-container {
      position: relative;
      top: auto;
      right: auto;
      transform: none;
      margin: 1rem 0 3rem;
    }
  }
  
  @media (max-width: 768px) {
    .digit {
      font-size: 6rem;
    }
    
    .error-message h2 {
      font-size: 2rem;
    }
    
    .error-message p {
      font-size: 1rem;
    }
    
    .quote {
      font-size: 2rem;
    }
  }
  
  @media (max-width: 480px) {
    .digit {
      font-size: 4rem;
    }
    
    .error-message {
      padding: 1rem;
      max-width: 90%;
    }
  }
  </style>