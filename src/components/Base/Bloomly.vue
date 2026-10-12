<template>
  <div class="section bloomly-section" id="bloomly">
    <div class="section-header">
      <p class="section-kicker">Проект</p>
      <h2 class="section-title">Bloomly</h2>
    </div>

    <div class="bloomly-layout">
      <div class="bloomly-copy">
        <p class="section-description">
          Bloomly — это AI-сервис для роста бренда в соцсетях. Он помогает бизнесам
          быстро находить актуальные темы, создавать контент под тренды TikTok,
          Instagram и X и автоматически публиковать его без постоянной ручной работы.
        </p>

        <p>
          Проще говоря, Bloomly нужен тем, кто хочет, чтобы контент работал на
          привлечение клиентов, а не просто висел в ленте. Сервис объединяет
          анализ трендов, генерацию постов и публикацию — чтобы увеличить охват,
          заявки и продажи с минимальными усилиями.
        </p>

        <div class="bloomly-points">
          <div class="bloomly-point">
            <i class="fas fa-chart-line"></i>
            <span>Анализирует, что сейчас набирает популярность в нише</span>
          </div>
          <div class="bloomly-point">
            <i class="fas fa-wand-sparkles"></i>
            <span>Создаёт контент в нужном формате и стиле</span>
          </div>
          <div class="bloomly-point">
            <i class="fas fa-rocket"></i>
            <span>Публикует и помогает масштабировать рост аккаунта</span>
          </div>
        </div>

        <a
          class="bloomly-button"
          href="https://bloomly.ai"
          target="_blank"
          rel="noopener noreferrer"
        >
          Узнать про Bloomly
        </a>
      </div>

      <div class="bloomly-showcase">
        <div class="bloomly-card">
          <div class="bloomly-card-header">
            <div class="bloomly-logo">B</div>
            <div>
              <div class="bloomly-name">Bloomly</div>
              <div class="bloomly-tag">AI Growth</div>
            </div>
          </div>

          <div class="bloomly-metrics">
            <div class="metric-item">
              <span class="metric-label">Views</span>
              <strong>128.4K</strong>
            </div>
            <div class="metric-item">
              <span class="metric-label">Leads</span>
              <strong>27</strong>
            </div>
            <div class="metric-item">
              <span class="metric-label">Posts</span>
              <strong>62</strong>
            </div>
          </div>

          <div class="bloomly-graph" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BloomlySection'
}
</script>

<style scoped>
.section {
  position: relative;
  margin: 0 auto 64px;
  max-width: 1200px;
  padding: 56px 28px;
}

.section-header {
  margin-bottom: 28px;
  text-align: center;
}

.section-kicker {
  margin: 0 0 8px;
  color: #a8f0b5;
  font-size: 0.76rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 700;
}

.section-title {
  margin: 0;
  color: #f4f6ff;
  font-size: clamp(2rem, 3vw, 3rem);
  line-height: 1.1;
}

.bloomly-layout {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 32px;
  align-items: center;
}

.bloomly-copy,
.bloomly-card {
  background: rgba(15, 20, 35, 0.72);
  border: 1px solid rgba(168, 240, 181, 0.2);
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18);
}

.bloomly-copy {
  padding: 28px;
}

.section-description,
.bloomly-copy p {
  color: rgba(245, 247, 255, 0.88);
  font-size: 1.03rem;
  line-height: 1.75;
  margin: 0 0 18px;
}

.bloomly-points {
  display: grid;
  gap: 14px;
  margin: 26px 0 28px;
}

.bloomly-point {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(122, 95, 255, 0.08);
  border: 1px solid rgba(168, 240, 181, 0.14);
  color: #eef4ff;
}

.bloomly-point i {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, #a8f0b5, #7aa3ff);
  color: #0f172a;
  font-size: 0.9rem;
}

.bloomly-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  border-radius: 999px;
  background: linear-gradient(135deg, #a8f0b5, #7aa3ff);
  color: #0d1320;
  font-weight: 800;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 12px 24px rgba(122, 163, 255, 0.3);
}

.bloomly-button:hover {
  transform: translateY(-1px);
}

.bloomly-showcase {
  display: flex;
  justify-content: center;
}

.bloomly-card {
  width: min(100%, 420px);
  padding: 22px;
  background: linear-gradient(180deg, rgba(18, 22, 35, 0.92), rgba(9, 12, 18, 0.94));
}

.bloomly-card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.bloomly-logo {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: linear-gradient(135deg, #a8f0b5, #8ec5ff);
  color: #101827;
  font-size: 1.6rem;
  font-weight: 900;
}

.bloomly-name {
  color: #f4f6ff;
  font-size: 1.2rem;
  font-weight: 800;
}

.bloomly-tag {
  color: #a8f0b5;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.bloomly-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 22px;
}

.metric-item {
  padding: 14px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  text-align: center;
}

.metric-label {
  display: block;
  color: rgba(245, 247, 255, 0.65);
  font-size: 0.72rem;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.metric-item strong {
  color: #f4f6ff;
  font-size: 1.2rem;
}

.bloomly-graph {
  display: flex;
  align-items: end;
  gap: 10px;
  height: 140px;
  padding-top: 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(122, 95, 255, 0.08), rgba(168, 240, 181, 0.03));
  border: 1px solid rgba(122, 163, 255, 0.2);
  overflow: hidden;
}

.bloomly-graph span {
  flex: 1;
  display: block;
  border-radius: 10px 10px 0 0;
  background: linear-gradient(180deg, #a8f0b5, #7aa3ff);
  animation: pulseBars 2.4s ease-in-out infinite alternate;
}

.bloomly-graph span:nth-child(1) { height: 28%; }
.bloomly-graph span:nth-child(2) { height: 42%; animation-delay: 0.1s; }
.bloomly-graph span:nth-child(3) { height: 65%; animation-delay: 0.2s; }
.bloomly-graph span:nth-child(4) { height: 52%; animation-delay: 0.3s; }
.bloomly-graph span:nth-child(5) { height: 84%; animation-delay: 0.4s; }
.bloomly-graph span:nth-child(6) { height: 72%; animation-delay: 0.5s; }
.bloomly-graph span:nth-child(7) { height: 100%; animation-delay: 0.6s; }

@keyframes pulseBars {
  0% { opacity: 0.7; transform: scaleY(0.96); }
  100% { opacity: 1; transform: scaleY(1); }
}

@media (max-width: 900px) {
  .bloomly-layout {
    grid-template-columns: 1fr;
  }

  .bloomly-copy,
  .bloomly-card {
    padding: 22px 18px;
  }
}
</style>
