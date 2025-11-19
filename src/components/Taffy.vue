<template>
  <div class="taffy-page">
    <Timeline :data="timelineData">
      <template #default="{ item }">
        <div class="timeline-content-wrapper">
          <p class="timeline-description" v-if="item.description">
            {{ item.description }}
          </p>

          <div class="changes-section" v-if="item.changes && item.changes.length > 0">
            <h4 class="section-title">Изменения и улучшения:</h4>
            <ul class="changes-list">
              <li v-for="(change, idx) in item.changes" :key="idx" class="change-item">
                ✓ {{ change }}
              </li>
            </ul>
          </div>

          <div class="images-grid" v-if="item.images && item.images.length > 0">
            <img
              v-for="(image, idx) in item.images"
              :key="idx"
              :src="image.src"
              :alt="image.alt"
              class="timeline-image"
            />
          </div>

          <div class="notes-section" v-if="item.notes">
            <p class="notes-text">{{ item.notes }}</p>
          </div>
        </div>
      </template>
    </Timeline>
  </div>
</template>

<script>
import Timeline from './ui/Timeline.vue'

export default {
  name: 'Taffy',
  components: {
    Timeline
  },
  data() {
    return {
      timelineData: [
        {
          title: '2018 - Начало',
          description: 'Всем привет! Сегодня я расскажу увлекательную историю эволюции моей фурсоны Fox Taffy — персонажа, который стал неотъемлемой частью моей жизни и идентичности в фурри-сообществе. За несколько лет мой персонаж прошел удивительный путь трансформации, отражая моё творческое развитие и поиск собственного стиля.',
          notes: 'Имя Fox Taffy было выбрано в честь русской писательницы Надежды Тэффи, которая славилась своим остроумием и уникальным стилем. Вид: Лиса.'
        },
        {
          title: '2019 - Первоначальный дизайн',
          description: 'Самая первая версия персонажа с уникальными чертами.',
          changes: [
            'Лаймово-голубые лапы и волосы',
            'Очки и цветки на шее',
            'Зелёное пузо'
          ],
          images: [
            {
              src: 'https://plugjsubjcfblzkabjia.supabase.co/storage/v1/object/public/gallery/Taffy/1taffy.jpg',
              alt: 'Fox Taffy - Первоначальный дизайн 2019'
            }
          ],
          notes: 'Был немного вдохновлён лапами маскота фифы 2018 Забиваки.'
        },
        {
          title: '2020 - Доработка и первый арт',
          description: 'После отзывов от сообщества и глубоких размышлений о дизайне, Тэффи ощутил первые серьёзные изменения.',
          changes: [
            'Нос с чёрного на голубой',
            'Волосы убраны',
            'Изменён хвост',
            'Белый цвет лап спущены до пальцев',
            'Белые руки'
          ],
          images: [
            {
              src: 'https://plugjsubjcfblzkabjia.supabase.co/storage/v1/object/public/gallery/Taffy/old.jpg',
              alt: 'Fox Taffy - Доработка 2020'
            }
          ],
          notes: 'Первые серьёзные изменения на основе обратной связи от сообщества.'
        },
        {
          title: '2022 - Новый стиль',
          description: 'Поиск собственного уникального стиля в изображении персонажа.',
          changes: [
            'Кардинально изменен художественный стиль',
            'Добавлены уникальные особенности',
            'Переработана цветовая палитра'
          ],
          images: [
            {
              src: 'https://plugjsubjcfblzkabjia.supabase.co/storage/v1/object/public/gallery/Taffy/2022_new_style.jpg',
              alt: 'Fox Taffy - Новый стиль 2022'
            }
          ]
        },
        {
          title: '2023 - Детализация',
          description: 'Фокус на деталях и создании глубокой истории персонажа.',
          changes: [
            'Добавлено множество мелких деталей',
            'Проработана текстура меха',
            'Создана backstory персонажа'
          ],
          images: [
            {
              src: 'https://plugjsubjcfblzkabjia.supabase.co/storage/v1/object/public/gallery/Taffy/2023_detailed.jpg',
              alt: 'Fox Taffy - Детализация 2023'
            }
          ]
        },
        {
          title: '2024 - Современная версия',
          description: 'Текущая версия персонажа с планами на будущее развитие.',
          changes: [
            'Финальные штрихи в дизайне',
            'Создание альтернативных образов',
            'Разработка мерчандайза'
          ],
          images: [
            {
              src: 'https://plugjsubjcfblzkabjia.supabase.co/storage/v1/object/public/gallery/Taffy/2024_current.jpg',
              alt: 'Fox Taffy - Современная версия 2024'
            }
          ]
        }
      ]
    }
  }
}
</script>

<style scoped>
.taffy-page {
  min-height: 100vh;
}

.timeline-content-wrapper {
  color: #e2e8f0;
}

.timeline-description {
  font-size: 1rem;
  line-height: 1.8;
  color: #cbd5e0;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(99, 102, 241, 0.3);
}

.changes-section {
  margin-bottom: 24px;
}

.changes-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.change-item {
  padding: 8px 0;
  color: #a0aec0;
  font-size: 0.95rem;
  line-height: 1.6;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.change-item::before {
  color: #6366f1;
  font-weight: bold;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.timeline-image {
  width: 100%;
  height: auto;
  min-height: 150px;
  max-height: 300px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.timeline-image:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
}

.notes-section {
  margin-top: 24px;
  padding: 16px;
  background: rgba(99, 102, 241, 0.1);
  border-left: 3px solid #6366f1;
  border-radius: 8px;
}

.notes-text {
  font-size: 0.9rem;
  font-style: italic;
  color: #9ca3af;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 640px) {
  .images-grid {
    grid-template-columns: 1fr;
  }

  .timeline-image {
    max-height: 250px;
  }
}
</style>
