# 🚀 Настройка проекта FoxTaffy.fun

## 📋 Быстрый старт

### 1. Клонируйте репозиторий
```bash
git clone https://github.com/yourusername/FoxTaffy.fun.git
cd FoxTaffy.fun
```

### 2. Установите зависимости
```bash
npm install
```

### 3. Настройте переменные окружения
```bash
# Скопируйте шаблон
cp .env.example .env

# Отредактируйте .env файл
nano .env
```

### 4. Заполните обязательные переменные в `.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ADMIN_SECRET_CODE=your_secret_password
```

### 5. Запустите проект
```bash
npm run dev
```

## 🔧 Подробная настройка

### Получение ключей Supabase

1. Зайдите на [supabase.com](https://supabase.com)
2. Создайте новый проект или используйте существующий
3. Перейдите в Settings → API
4. Скопируйте:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon/Public key** → `VITE_SUPABASE_ANON_KEY`

⚠️ **ВАЖНО**: НЕ используйте Service Role key в `.env` файле!

### Настройка базы данных

Если у вас новый проект Supabase, создайте необходимые таблицы:

```sql
-- Таблица художников
CREATE TABLE persons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  is_friend BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица тегов
CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица персонажей
CREATE TABLE fursonas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  person_id UUID REFERENCES persons(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица артов
CREATE TABLE arts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_nsfw BOOLEAN DEFAULT false,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  artist_id UUID REFERENCES persons(id)
);

-- Связи арт-теги
CREATE TABLE art_tags (
  art_id UUID REFERENCES arts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (art_id, tag_id)
);

-- Связи арт-персонажи
CREATE TABLE art_fursonas (
  art_id UUID REFERENCES arts(id) ON DELETE CASCADE,
  fursona_id UUID REFERENCES fursonas(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 1,
  PRIMARY KEY (art_id, fursona_id)
);
```

### Настройка RLS (Row Level Security)

```sql
-- Включаем RLS
ALTER TABLE arts ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE fursonas ENABLE ROW LEVEL SECURITY;

-- Публичное чтение для всех
CREATE POLICY "Allow public read" ON arts FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON persons FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON tags FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON fursonas FOR SELECT USING (true);
```

## 🔒 Безопасность

### Что НИКОГДА не коммитить:
- `.env` файлы
- Приватные ключи (*.key, *.pem)
- FTP конфигурации
- Пароли и секреты

### Проверка безопасности:
```bash
# Проверить что .env не отслеживается
git ls-files | grep .env
# Должно быть пустым!

# Запустить проверку безопасности
npm run security-check
```

### Переменные окружения

**БЕЗОПАСНО** (с `VITE_` префиксом):
- `VITE_SUPABASE_URL` - публичный URL Supabase
- `VITE_SUPABASE_ANON_KEY` - публичный ключ Supabase
- `VITE_ADMIN_SECRET_CODE` - пароль админки (не критично)

**ОПАСНО** (БЕЗ `VITE_` префикса):
- Service Role ключи Supabase
- S3 Secret Access Keys
- Пароли баз данных
- API ключи платежных систем

## 🚀 Деплой

### Vercel (рекомендуется)
```bash
# Установите Vercel CLI
npm i -g vercel

# Деплой
vercel

# Добавьте переменные окружения в Vercel Dashboard
```

### Netlify
```bash
# Установите Netlify CLI
npm i -g netlify-cli

# Деплой
netlify deploy --prod
```

### Настройка переменных в hosting

В панели управления хостинга добавьте:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_SECRET_CODE`
- `VITE_APP_BASE_URL`

## 🛠️ Команды разработки

```bash
# Разработка
npm run dev

# Сборка
npm run build

# Превью сборки
npm run preview

# Проверка безопасности
npm run security-check

# Обновление зависимостей
npm update

# Аудит безопасности
npm audit
npm audit fix
```

## 📱 Структура проекта

```
FoxTaffy.fun/
├── src/
│   ├── components/      # Vue компоненты
│   ├── config/         # Конфигурация (Supabase, etc)
│   ├── assets/         # Статические файлы
│   └── main.js         # Точка входа
├── public/             # Публичные файлы
├── .env.example        # Шаблон переменных
├── .gitignore          # Игнорируемые файлы
└── vite.config.js      # Конфигурация Vite
```

## 🐛 Решение проблем

### Ошибка "Supabase variables not found"
```bash
# Проверьте .env файл
cat .env | grep SUPABASE

# Перезапустите dev сервер
npm run dev
```

### Ошибка доступа к базе данных
1. Проверьте RLS политики в Supabase
2. Убедитесь что anon key правильный
3. Проверьте URL проекта

### Ошибка сборки
```bash
# Очистите кеш
rm -rf node_modules package-lock.json
npm install

# Пересоберите
npm run build
```

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте этот файл
2. Посмотрите в консоль браузера
3. Создайте issue в GitHub
4. Напишите в Telegram: [@foxtaffy](https://t.me/foxtaffy)

## ✅ Чеклист готовности

- [ ] Склонирован репозиторий
- [ ] Установлены зависимости (`npm install`)
- [ ] Скопирован `.env.example` в `.env`
- [ ] Заполнены Supabase переменные
- [ ] Установлен admin пароль
- [ ] Проект запускается (`npm run dev`)
- [ ] Нет ошибок в консоли
- [ ] Галерея загружается
- [ ] Admin панель доступна

Готово! 🦊✨