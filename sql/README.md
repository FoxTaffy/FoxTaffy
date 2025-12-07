# SQL Миграции и Скрипты

Эта папка содержит SQL-скрипты для базы данных Supabase проекта FoxTaffy.

## Как применить миграции

### Через Supabase Dashboard (рекомендуется)

1. Откройте [Supabase Dashboard](https://app.supabase.com)
2. Выберите ваш проект FoxTaffy
3. Перейдите в SQL Editor
4. Скопируйте содержимое нужного SQL-файла
5. Вставьте в редактор и нажмите "Run"

### Через Supabase CLI

```bash
# Установите Supabase CLI (если ещё не установлен)
# macOS/Linux
brew install supabase/tap/supabase

# Войдите в Supabase
supabase login

# Подключитесь к проекту
supabase link --project-ref ваш-project-id

# Выполните миграцию
supabase db execute --file sql/имя_файла.sql
```

## Список миграций

### fix_image_url_nullable.sql
**Статус:** ✅ Требуется применить

**Цель:** Исправление ограничения NOT NULL для поля `image_url` в таблице `con_photos`

**Проблема:**
- Поле `image_url` было обязательным (NOT NULL)
- При загрузке фото через `file_path` поле `image_url` может быть NULL
- Возникала ошибка: "null value in column image_url violates not-null constraint"

**Решение:**
- Убираем ограничение NOT NULL с поля `image_url`
- Теперь можно хранить фото либо через URL, либо через file_path

**Как применить:**
```sql
-- Скопируйте и выполните содержимое файла fix_image_url_nullable.sql
ALTER TABLE con_photos ALTER COLUMN image_url DROP NOT NULL;
```

### Другие скрипты

- `remove_duplicate_photos.sql` - Очистка дубликатов фотографий
- `add_ratings_system.sql` - Добавление системы рейтингов
- `add_review_completed_field.sql` - Добавление поля review_completed
- `add_participation_statuses.sql` - Добавление статусов участия
- `setup_storage_policies.sql` - Настройка политик хранилища

## Порядок применения миграций

Если вы настраиваете проект с нуля, применяйте миграции в следующем порядке:

1. Основные таблицы (см. SETUP.md)
2. `fix_image_url_nullable.sql`
3. `add_ratings_system.sql`
4. `add_review_completed_field.sql`
5. `add_participation_statuses.sql`
6. `setup_storage_policies.sql`

## Откат миграций

Если миграция вызвала проблемы, используйте откат:

```sql
-- Откат fix_image_url_nullable.sql
ALTER TABLE con_photos ALTER COLUMN image_url SET NOT NULL;
```

⚠️ **Внимание:** Откат может привести к ошибкам, если данные уже используют новую схему.

## Проверка применения миграции

После применения миграции проверьте её успешность:

```sql
-- Проверка структуры таблицы con_photos
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'con_photos';
```

## Поддержка

Если возникли проблемы с миграциями:
1. Проверьте логи в Supabase Dashboard
2. Убедитесь, что у вас есть права на изменение схемы
3. Создайте Issue в репозитории GitHub
