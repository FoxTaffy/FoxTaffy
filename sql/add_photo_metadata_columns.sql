-- ============================================
-- ОБНОВЛЕНИЕ ТАБЛИЦЫ CON_PHOTOS
-- Добавление колонок для хранения метаданных фотографий
-- ============================================

-- Добавляем новые колонки в таблицу con_photos
ALTER TABLE con_photos
ADD COLUMN IF NOT EXISTS file_path TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_path TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS file_name TEXT;

-- Проверяем результат
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'con_photos'
ORDER BY ordinal_position;

-- Показываем структуру таблицы
\d con_photos

-- Готово!
SELECT '✅ Колонки добавлены в таблицу con_photos!' as status;
