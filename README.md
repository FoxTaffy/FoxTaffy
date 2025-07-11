# 🦊 FoxTaffy.fun

> **Персональный веб-сайт Fox Taffy — молодого лиса из фурри-сообщества**

[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

## 🌟 О проекте

**FoxTaffy.fun** — это персональный веб-сайт Fox Taffy, 21-летнего лиса ростом 177 см, участник фурри-сообщества. Сайт представляет собой интерактивное портфолио с информацией о фурсоне, его творчестве, конвентах и артами.

### ✨ Особенности

- 🎨 **Современный дизайн** с тёмной темой и яркими акцентами фурсоны
- 🎭 **Интерактивная галерея** с артами моей фурсоной
- 📱 **Полная адаптивность** для всех устройств
- ⚡ **Плавные анимации** при скролле и взаимодействии
- 🎪 **Секции о мероприятиях** с детальными отзывами
- 🔥 **История эволюции фурсоны** от 2019 до 2025 года

## 🚀 Быстрый старт

### Предварительные требования

- Node.js версии 16.0 или выше
- npm или yarn

### Установка

1. **Клонируйте репозиторий**
   ```bash
   git clone https://github.com/username/FoxTaffy.fun.git
   cd FoxTaffy.fun
   ```

2. **Установите зависимости**
   ```bash
   npm install
   # или
   yarn install
   ```

3. **Запустите сервер разработки**
   ```bash
   npm run dev
   # или
   yarn dev
   ```

4. **Откройте в браузере**
   ```
   http://localhost:5173
   ```

### Сборка для продакшена

```bash
npm run build
# далее
yarn build
```

## 🏗️ Архитектура проекта

```
FoxTaffy.fun/
├── 📁 public/              # Статические файлы
├── 📁 src/
│   ├── 📁 assets/          # Графические ресурсы
│   ├── 📁 components/      # Vue компоненты
│   │   ├── 📁 Base/        # Базовые секции главной страницы
│   │   │   ├── 📝 Bio.vue           # Секция "О себе"
│   │   │   ├── 👥 Communities.vue   # Мои каналы
│   │   │   ├── 🎪 Events.vue        # Список конов
│   │   │   ├── 💕 Felix.vue         # Секция о парне
│   │   │   ├── 🐺 Fursuit.vue       # Информация о фурсьюте
│   │   │   ├── 🏠 Header.vue        # Главное
│   │   │   └── 🎭 Reference.vue     # Референс персонажа
│   │   ├── 📁 events/      # Все посещёные мои коны
│   │   ├── 📁 Gallery/        # Компаненты галереи
│   │   │   ├── 📝 bd.vue         # Секция "О себе"
│   │   │   ├── 🏠 Filter.vue     # Главное
│   │   │   ├── 🖼️ Gallery.vue    # Фотогалерея
│   │   │   └── 🎭 Reference.vue  # Референс персонажа
│   │   ├── 🏠 HomeView.vue  # Главная страница
│   │   ├── 🏠 AdminPanel.vue  # Админ панель галереи
│   │   ├── 🎭 Taffy.vue     # История эволюции персонажа
│   │   ├── 
│   │   └── ❌ Error404.vue  # Страница ошибки 404
│   ├── 📁 config/          # Система
│   │   ├── ⚙️ s3.js        # Базовые секции главной страницы
│   │   └── ⚙️ supabase.js  # Базовые секции главной страницы
│   ├── 🛣️ router.js        # Конфигурация маршрутов
│   ├── ⚙️ main.js          # Точка входа приложения
│   ├── 📱 App.vue          # Корневой компонент
│   ├── 📱 Base.css         # Все стили Base
│   └── 🎨 style.css        # Глобальные стили
├── 📄 index.html           # HTML шаблон
└── 📋 README.md            # Этот файл
```

## 🎨 Дизайн-система

### Цветовая палитра

| Цвет | Hex | Применение |
|------|-----|------------|
| ![#1a1a1a](https://via.placeholder.com/15/1a1a1a/000000?text=+) | `#1a1a1a` | Основной фон |
| ![#ff7b25](https://via.placeholder.com/15/ff7b25/000000?text=+) | `#ff7b25` | Акцент оранжевый |
| ![#4caf50](https://via.placeholder.com/15/4caf50/000000?text=+) | `#4caf50` | Акцент зелёный |
| ![#f2f2f2](https://via.placeholder.com/15/f2f2f2/000000?text=+) | `#f2f2f2` | Основной текст |
| ![#a0a0a0](https://via.placeholder.com/15/a0a0a0/000000?text=+) | `#a0a0a0` | Приглушенный текст |
| ![#222222](https://via.placeholder.com/15/222222/000000?text=+) | `#222222` | Фон карточек |

### Типографика

- **Основной шрифт**: [Nunito](https://fonts.google.com/specimen/Nunito)
- **Размеры**: 300, 400, 600, 700, 800
- **Начертания**: Regular, Semi-Bold, Bold, Extra-Bold

## 🧩 Технологии

### Основной стек

- **[Vue.js 3](https://vuejs.org/)** — прогрессивный JavaScript фреймворк
- **[Vue Router](https://router.vuejs.org/)** — официальный роутер для Vue.js
- **[Vite](https://vitejs.dev/)** — быстрый инструмент сборки
- **[FontAwesome](https://fontawesome.com/)** — библиотека иконок

### Дополнительные библиотеки

- **CSS Animations** — плавные анимации при скролле
- **Intersection Observer API** — для анимаций при появлении элементов
- **LocalStorage** — сохранение лайков и настроек

### Хостинг медиа

- **Объектное хранилище** — `supabase.com`
- Все изображения и видео оптимизированы для веба

## 📱 Основные страницы

### 🏠 Главная страница (`/`)
- Основная информация
- Референс персонажа с детальным описанием
- Краткая информация о Fox Taffy
- Информация о фурсьюте от мастерской FireFly
- Секция о Felix
- Список посещённых мероприятий
- Мои сообщества и проекты

### 🎭 История персонажа (`/taffy`)
- Подробная эволюция дизайна с 2019 по 2025 год
- Философия создания персонажа
- Значение каждого элемента дизайна
- Временная шкала с иллюстрациями

### 🖼️ Галерея (`/gallery`)
- Все арты заказанный с моим персонажем
- Теги, художники, дата
- Интерактивная сетка артов
- Различные режимы отображения
- Модальные окна для просмотра

### 🎪 Коны (`/events/*`)
- **FurMarket** — обзор маркета фурри-товаров
- **Any Furry Fest V** — отчёт с крупнейшего фурри-фестиваля
- **Foxwood: Back to 2000s** — ретро-мероприятие в лесной тематике
- **Другое** — Остальные коны на которых был Тэффи

## 🔧 Разработка

### Структура компонентов

```vue
<!-- Пример базового компонента -->
<template>
  <div class="section" v-scroll-animation>
    <h2 class="section-title">{{ title }}</h2>
    <div class="section-content">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseSection',
  props: {
    title: {
      type: String,
      required: true
    }
  }
}
</script>
```

### Директивы

- `v-scroll-animation` — автоматические анимации при появлении элементов

## 🌟 Особенности реализации

### Анимации при скролле
```javascript
app.directive('scroll-animation', {
  mounted: function (el) {
    el.style.opacity = '0'
    el.style.transform = 'translateY(20px)'
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
          observer.unobserve(el)
        }
      })
    }, { threshold: 0.1 })
    
    observer.observe(el)
  }
})
```

### Сохранение позиции скролла
Маршрутизатор автоматически сохраняет позицию скролла при навигации между страницами.

## 📈 SEO и производительность

- ✅ Семантическая разметка HTML5
- ✅ Мета-теги для социальных сетей
- ✅ Адаптивные изображения
- ✅ Ленивая загрузка контента
- ✅ Оптимизированные шрифты
- ✅ Минификация CSS и JS

## 🚀 Деплой

### Подготовка к продакшену

1. Обновите базовые URL в конфигурации
2. Проверьте все ссылки на медиа-файлы
3. Запустите сборку: `npm run build`
4. Загрузите содержимое папки `dist/` на сервер

### Настройка сервера

Добавьте `.htaccess` для корректной работы Vue Router:

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

## 🤝 Участие в проекте

Если у вас есть предложения по улучшению сайта или вы нашли баг:

1. Создайте Issue с описанием проблемы
2. Для фикса — сделайте Fork и создайте Pull Request
3. Убедитесь, что код соответствует стилю проекта

## 📄 Лицензия

Этот проект является персональным портфолио. Код открыт для изучения, но контент защищён авторским правом.

## 📞 Контакты

- **Telegram**: [@foxtaffy](https://t.me/foxtaffy)
- **ВКонтакте**: [Fox Taffy](https://vk.com/foxtaffy)

---

<div align="center">

**Сделано с ❤️ и ☕ Fox Taffy**

*Версия 2.0 — Апрель 2025*

[![Открыть сайт](https://img.shields.io/badge/🌐_Открыть_сайт-FoxTaffy.fun-ff7b25?style=for-the-badge)](https://foxtaffy.fun)

</div>