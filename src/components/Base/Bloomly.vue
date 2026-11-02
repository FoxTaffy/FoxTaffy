<template>
  <div class="section" id="bloomly">
    <h2 class="section-title">Bloomly</h2>

    <div class="split">
      <div>
        <p class="section-description">
          Bloomly — это социальная сеть и маркетплейс для творческих сообществ.
          Я разработал её как платформу, где художники, косплейщики, музыканты,
          создатели фурсьютов и участники фестивалей могут публиковать работы,
          находить единомышленников и безопасно продавать свои труды в одном месте.
        </p>

        <p>
          В отличие от обычных соцсетей, Bloomly объединяет контент, сообщества,
          события и экономику в одной экосистеме. Здесь есть лента публикаций,
          профили творцов, мероприятия, группы и встроенный рынок, где сделка
          проходит внутри платформы с учётом доверия и безопасности участников.
        </p>

        <div class="feature-list">
          <div v-for="point in points" :key="point.icon" class="feature-list-item">
            <span class="icon-badge"><i :class="point.icon"></i></span>
            <span>{{ point.text }}</span>
          </div>
        </div>

        <a
          class="btn btn-primary"
          href="https://github.com/FoxTaffy/Bloomly_MVP"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i class="fab fa-github"></i>
          <span>Посмотреть проект</span>
        </a>
      </div>

      <div class="card">
        <div class="stat-grid">
          <div v-for="metric in metrics" :key="metric.label" class="stat-tile">
            <span class="stat-tile-label">{{ metric.label }}</span>
            <strong class="stat-tile-value">{{ metric.value }}</strong>
          </div>
        </div>

        <div class="bar-chart" aria-hidden="true">
          <span v-for="height in bars" :key="height" :style="{ height: height + '%' }"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BloomlySection',
  data() {
    return {
      points: [
        { icon: 'fas fa-chart-line', text: 'Анализирует, что сейчас набирает популярность в нише' },
        { icon: 'fas fa-wand-sparkles', text: 'Создаёт контент в нужном формате и стиле' },
        { icon: 'fas fa-rocket', text: 'Публикует и помогает масштабировать рост аккаунта' }
      ],
      metrics: [
        { label: 'Views', value: '128.4K' },
        { label: 'Leads', value: '27' },
        { label: 'Posts', value: '62' }
      ],
      bars: [28, 42, 65, 52, 84, 72, 100]
    }
  }
}
</script>
