<template>
  <div class="section bloomly-section" id="bloomly">
    <h2 class="section-title">Bloomly</h2>

    <div class="split bloomly-hero">
      <div>
        <p class="bloomly-tagline">Твоё творчество. Твои люди.</p>
        <p class="section-description">
          Bloomly — социальная сеть для тех, кто создаёт, и тех, кто ценит. Я разработал
          её как место, где художники, косплейщики, музыканты, создатели фурсьютов и
          участники фестивалей показывают работы, находят единомышленников и развивают
          своё дело. Контент, сообщества, события и ярмарка авторов — в одной экосистеме.
        </p>

        <div class="tag-row">
          <span v-for="topic in topics" :key="topic.name" class="tag">
            <i :class="topic.icon"></i>{{ topic.name }}
          </span>
        </div>

        <div class="btn-actions">
          <a class="btn btn-primary" href="https://bloomly.fun/" target="_blank" rel="noopener noreferrer">
            <i class="fas fa-rocket"></i>
            <span>Открыть Bloomly</span>
          </a>
          <a class="btn" href="https://github.com/FoxTaffy/Bloomly_MVP" target="_blank" rel="noopener noreferrer">
            <i class="fab fa-github"></i>
            <span>GitHub</span>
          </a>
          <a class="btn" href="https://t.me/Bloomly_news" target="_blank" rel="noopener noreferrer">
            <i class="fab fa-telegram-plane"></i>
            <span>Новости</span>
          </a>
        </div>
      </div>

      <div class="card">
        <div class="stat-grid">
          <div v-for="fact in facts" :key="fact.label" class="stat-tile">
            <strong class="stat-tile-value">{{ fact.value }}</strong>
            <span class="stat-tile-label">{{ fact.label }}</span>
          </div>
        </div>

        <ul class="bloomly-roles">
          <li v-for="role in roles" :key="role.title">
            <span class="icon-badge"><i :class="role.icon"></i></span>
            <span><strong>{{ role.title }}</strong>{{ role.text }}</span>
          </li>
        </ul>
      </div>
    </div>

    <h3 class="bloomly-subtitle">Что внутри</h3>
    <div class="bloomly-grid">
      <div v-for="feature in features" :key="feature.title" class="card bloomly-feature">
        <span class="icon-badge"><i :class="feature.icon"></i></span>
        <h4>{{ feature.title }}</h4>
        <p>{{ feature.text }}</p>
      </div>
    </div>

    <div class="card bloomly-den">
      <div class="split">
        <div>
          <span class="icon-badge"><i class="fas fa-store"></i></span>
          <h3 class="bloomly-subtitle">Dealers’ Den</h3>
          <p class="bloomly-tagline is-small">Увидел работу. Нашёл автора. Создал что-то своё.</p>
          <p class="section-description">
            Творческая ярмарка внутри Bloomly: здесь встречаются художники, мастера
            и люди, которые ищут особенные вещи — иллюстрации, фурсьюты, крафт, принты и мерч.
          </p>
          <a class="btn btn-accent" href="https://bloomly.fun/dealers-den" target="_blank" rel="noopener noreferrer">
            <i class="fas fa-external-link-alt"></i>
            <span>Открыть ярмарку авторов</span>
          </a>
        </div>

        <div class="feature-list">
          <div v-for="item in den" :key="item.title" class="feature-list-item">
            <span class="icon-badge"><i :class="item.icon"></i></span>
            <span><strong>{{ item.title }}</strong><small>{{ item.text }}</small></span>
          </div>
        </div>
      </div>
    </div>

    <h3 class="bloomly-subtitle">Как начать</h3>
    <p class="section-description">
      Необязательно быть профессиональным художником: можно шить первый костюм,
      придумывать персонажей, писать музыку или просто искать людей с похожими увлечениями.
    </p>
    <div class="bloomly-steps">
      <div v-for="(step, index) in steps" :key="step.title" class="card bloomly-step">
        <span class="bloomly-step-num">{{ index + 1 }}</span>
        <div>
          <h4>{{ step.title }}</h4>
          <p>{{ step.text }}</p>
        </div>
      </div>
    </div>

    <div class="btn-actions">
      <a class="btn btn-accent" href="https://bloomly.fun/explore" target="_blank" rel="noopener noreferrer">
        <i class="fas fa-globe"></i>
        <span>Открыть для себя новое</span>
      </a>
      <a class="btn" href="https://bloomly.fun/groups" target="_blank" rel="noopener noreferrer">
        <i class="fas fa-users"></i>
        <span>Найти сообщество</span>
      </a>
      <a class="btn" href="https://github.com/FoxTaffy/Bloomly_MVP/issues/new?template=bug_report.yml" target="_blank" rel="noopener noreferrer">
        <i class="fas fa-exclamation-circle"></i>
        <span>Сообщить об ошибке</span>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BloomlySection',
  data() {
    return {
      topics: [
        { name: 'Арт', icon: 'fas fa-palette' },
        { name: 'Фурри', icon: 'fas fa-paw' },
        { name: 'Косплей', icon: 'fas fa-mask' },
        { name: 'Музыка', icon: 'fas fa-music' },
        { name: 'Хендмейд', icon: 'fas fa-gem' },
        { name: 'Фестивали', icon: 'fas fa-glass-cheers' }
      ],
      facts: [
        { value: '6', label: 'направлений' },
        { value: '3', label: 'формата сделок' },
        { value: '3', label: 'шага до старта' }
      ],
      roles: [
        { icon: 'fas fa-lightbulb', title: 'Автор проекта', text: ' — идея и продукт' },
        { icon: 'fas fa-pen-nib', title: 'UX/UI дизайн', text: ' — интерфейс и бренд' },
        { icon: 'fas fa-code', title: 'Разработка', text: ' — от MVP до релизов' }
      ],
      features: [
        { icon: 'fas fa-images', title: 'Показывай работы', text: 'Арты, фотографии, видео, музыка и тексты. Делись результатом и процессом, собирай отклики и сохраняй вдохновение.' },
        { icon: 'fas fa-users', title: 'Собирай сообщество', text: 'Вступай в группы по интересам или создай свою. Обсуждай идеи, знакомься с авторами и придумывай совместные проекты.' },
        { icon: 'fas fa-comment-alt', title: 'Будь на связи', text: 'Личные сообщения, комментарии и стикеры помогают продолжить знакомство за пределами ленты.' },
        { icon: 'fas fa-id-card', title: 'Расскажи о себе', text: 'Оформи профиль, покажи своих персонажей и фурсьюты. Пусть тебя узнают по тому, что тебе близко.' },
        { icon: 'fas fa-store', title: 'Найди своего мастера', text: 'Открывай авторские вещи, выбирай работы и заказывай у творцов через Dealers’ Den.' },
        { icon: 'fas fa-calendar-alt', title: 'Встречайся вживую', text: 'Следи за событиями и фестивалями, узнавай об активностях и планируй встречи с сообществом.' }
      ],
      den: [
        { icon: 'fas fa-shopping-bag', title: 'Готовые работы и заказы', text: 'Иллюстрации, фурсьюты, крафт, принты и мерч.' },
        { icon: 'fas fa-tags', title: 'Разные форматы', text: 'Обычные продажи, аукционы и очередь заказов у автора.' },
        { icon: 'fas fa-shield-alt', title: 'Знакомство до заказа', text: 'Профиль мастера, отзывы и репутация помогают сделать выбор.' }
      ],
      steps: [
        { title: 'Расскажи о себе', text: 'Оформи профиль и поделись интересами.' },
        { title: 'Найди то, что нравится', text: 'Посмотри работы и сообщества.' },
        { title: 'Начни общение', text: 'Оставь комментарий, подпишись или покажи своё творчество.' }
      ]
    }
  }
}
</script>
