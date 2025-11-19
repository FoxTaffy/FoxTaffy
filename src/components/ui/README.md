# BentoGallery Component Integration Guide

## Описание задачи

Интеграция интерактивного компонента BentoGallery в Vue 3 проект для отображения галереи изображений в формате Bento Grid с горизонтальной прокруткой.

## Требования к проекту

Проект должен поддерживать:
- **Vue 3** (Composition API)
- **TypeScript**
- **Vite** (сборщик)

### Проверка текущей структуры проекта

✅ **Vue 3** - установлен (`vue: ^3.5.13`)
✅ **TypeScript** - настроен (`tslib: ^2.8.1`)
✅ **Vite** - настроен (`vite: ^6.3.1`)

## Структура компонентов

Путь по умолчанию для UI компонентов: `/src/components/ui/`

**Важно:** Папка `/src/components/ui/` создана специально для переиспользуемых UI компонентов, которые могут быть использованы в разных частях приложения. Это соответствует best practices Vue 3 проектов.

## Установка компонента

### 1. Скопируйте компонент в папку `/src/components/ui/`

Файл: `src/components/ui/BentoGallery.vue`

```vue
<template>
  <div class="bento-gallery-container">
    <div class="bento-header">
      <h2 class="bento-title">{{ title }}</h2>
      <p class="bento-description">{{ description }}</p>
    </div>

    <div
      class="bento-grid"
      ref="gridRef"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <div
        v-for="(item, index) in imageItems"
        :key="item.id"
        :class="['bento-item', item.span || '', { 'expanded': expandedItem === item.id }]"
        @click="toggleExpand(item.id)"
        :style="{ cursor: isDragging ? 'grabbing' : 'pointer' }"
      >
        <div class="bento-image-wrapper">
          <img
            :src="item.url"
            :alt="item.title"
            class="bento-image"
            loading="lazy"
            decoding="async"
            draggable="false"
          />
          <div class="bento-overlay">
            <div class="bento-content">
              <h3 class="bento-item-title">{{ item.title }}</h3>
              <p class="bento-item-desc">{{ item.desc }}</p>
            </div>
            <div class="expand-icon">
              <i :class="expandedItem === item.id ? 'fas fa-compress' : 'fas fa-expand'"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox для развернутого изображения -->
    <Transition name="lightbox">
      <div
        v-if="expandedItem !== null"
        class="lightbox"
        @click.self="toggleExpand(null)"
      >
        <div class="lightbox-content">
          <button class="lightbox-close" @click="toggleExpand(null)">
            <i class="fas fa-times"></i>
          </button>
          <img
            :src="getCurrentExpandedItem()?.url"
            :alt="getCurrentExpandedItem()?.title"
            class="lightbox-image"
          />
          <div class="lightbox-info">
            <h3>{{ getCurrentExpandedItem()?.title }}</h3>
            <p>{{ getCurrentExpandedItem()?.desc }}</p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface BentoItem {
  id: number
  title: string
  desc: string
  url: string
  span?: string
}

interface Props {
  imageItems: BentoItem[]
  title?: string
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Галерея',
  description: 'Коллекция наших моментов'
})

const gridRef = ref<HTMLElement | null>(null)
const expandedItem = ref<number | null>(null)
const isDragging = ref(false)
const startX = ref(0)
const scrollLeft = ref(0)

const getCurrentExpandedItem = () => {
  return props.imageItems.find(item => item.id === expandedItem.value)
}

const toggleExpand = (id: number | null) => {
  if (!isDragging.value) {
    expandedItem.value = expandedItem.value === id ? null : id
  }
}

const handleMouseDown = (e: MouseEvent) => {
  if (!gridRef.value) return
  isDragging.value = true
  startX.value = e.pageX - gridRef.value.offsetLeft
  scrollLeft.value = gridRef.value.scrollLeft
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value || !gridRef.value) return
  e.preventDefault()
  const x = e.pageX - gridRef.value.offsetLeft
  const walkX = (x - startX.value) * 2
  gridRef.value.scrollLeft = scrollLeft.value - walkX
}

const handleMouseUp = () => {
  isDragging.value = false
}

const handleTouchStart = (e: TouchEvent) => {
  if (!gridRef.value || e.touches.length === 0) return
  isDragging.value = true
  startX.value = e.touches[0].pageX - gridRef.value.offsetLeft
  scrollLeft.value = gridRef.value.scrollLeft
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value || !gridRef.value || e.touches.length === 0) return
  const x = e.touches[0].pageX - gridRef.value.offsetLeft
  const walkX = (x - startX.value) * 2
  gridRef.value.scrollLeft = scrollLeft.value - walkX
}

const handleTouchEnd = () => {
  isDragging.value = false
}
</script>

<style scoped>
/* Полные стили смотрите в файле BentoGallery.vue */
</style>
```

### 2. Зависимости

**FontAwesome иконки** (уже установлено):
```json
"@fortawesome/fontawesome-svg-core": "^6.7.2",
"@fortawesome/free-solid-svg-icons": "^6.7.2",
"@fortawesome/vue-fontawesome": "^3.0.8"
```

**Не требуется дополнительных npm пакетов** - компонент использует только встроенные возможности Vue 3.

### 3. Пример использования

**Файл: `src/components/Felix.vue`**

```vue
<template>
  <div>
    <!-- Другой контент -->

    <section id="gallery" class="gallery-section">
      <BentoGallery
        :imageItems="bentoGalleryItems"
        title="Галерея воспоминаний"
        description="Наши особенные моменты в интерактивном формате. Перетащите для исследования, нажмите для увеличения."
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BentoGallery from '@/components/ui/BentoGallery.vue'

// Ваши данные изображений
const galleryPhotos = ref([
  {
    src: "https://example.com/image1.jpg",
    caption: "Описание изображения 1",
    title: "Заголовок 1"
  },
  // ... больше изображений
])

// Преобразование данных для BentoGallery
const bentoGalleryItems = computed(() => {
  const spanPatterns = [
    'md:col-span-2 md:row-span-2',
    'md:row-span-1',
    'md:row-span-1',
    'md:row-span-2',
    'md:row-span-1',
    'md:col-span-2 md:row-span-1'
  ]

  return galleryPhotos.value.map((photo, index) => ({
    id: index + 1,
    title: photo.title || photo.caption || `Память ${index + 1}`,
    desc: photo.caption || 'Особенный момент',
    url: photo.src,
    span: spanPatterns[index % spanPatterns.length]
  }))
})
</script>
```

## Возможности компонента

### 🎨 Визуальные особенности
- **Горизонтальная прокрутка** во всю ширину экрана
- **Различные размеры элементов** (500×500px, 400×500px, 350×400px, 600×350px)
- **Адаптивный дизайн** для мобильных устройств (280×350px)
- **Градиентный overlay** с заголовками и описаниями
- **Стильный scrollbar** с градиентом

### 🖱️ Интерактивность
- **Drag-to-scroll** - перетаскивание для навигации
- **Click-to-expand** - клик для открытия lightbox
- **Touch поддержка** для мобильных устройств
- **Плавные анимации** и hover эффекты

### 📱 Responsive дизайн
- Desktop: различные размеры элементов (bento layout)
- Mobile: одинаковые размеры (280×350px)
- Smooth scroll с touch support

## Кастомизация

### Props компонента

```typescript
interface Props {
  imageItems: BentoItem[]  // Массив изображений (обязательно)
  title?: string           // Заголовок галереи (опционально)
  description?: string     // Описание галереи (опционально)
}

interface BentoItem {
  id: number              // Уникальный ID
  title: string           // Заголовок изображения
  desc: string            // Описание изображения
  url: string             // URL изображения
  span?: string           // CSS класс для размера (опционально)
}
```

### Размеры элементов (span patterns)

```javascript
'md:col-span-2 md:row-span-2'  // Большой: 500×500px
'md:row-span-1'                 // Стандартный: 350×400px
'md:row-span-2'                 // Вертикальный: 400×500px
'md:col-span-2 md:row-span-1'  // Горизонтальный: 600×350px
```

## Стилизация

Компонент использует scoped стили с CSS переменными. Все стили инкапсулированы внутри компонента.

### Основные цвета

```css
/* Gradient colors */
#667eea (фиолетовый)
#764ba2 (розовый)

/* Фон и границы */
rgba(255, 255, 255, 0.1) - borders
rgba(0, 0, 0, 0.95) - lightbox background
```

## Troubleshooting

### Иконки не отображаются

Убедитесь что FontAwesome установлен и настроен в `main.ts`:

```typescript
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(fas)
app.component('font-awesome-icon', FontAwesomeIcon)
```

### Изображения не загружаются

Проверьте что URLs изображений корректны и доступны. Используйте атрибуты `loading="lazy"` и `decoding="async"` для оптимизации.

### Прокрутка не работает

Убедитесь что родительский контейнер имеет достаточную ширину для горизонтальной прокрутки:

```css
.gallery-section {
  width: 100%;
  overflow: visible;
}
```

## Производительность

- ✅ Lazy loading для изображений
- ✅ Async декодирование
- ✅ Оптимизированный re-render
- ✅ CSS transitions вместо JS анимаций
- ✅ Touch events optimization

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Лицензия

ISC - Fox Taffy Team
