-- SQL миграция для добавления поля photos_folder в таблицу cons
-- Выполните этот скрипт в Supabase SQL Editor

-- Добавление нового поля
ALTER TABLE cons
ADD COLUMN IF NOT EXISTS photos_folder TEXT,
ADD COLUMN IF NOT EXISTS review_completed BOOLEAN DEFAULT false;

-- Комментарии к новым полям
COMMENT ON COLUMN cons.photos_folder IS 'Путь к папке с фотографиями в S3 (например: events/FW2025/)';
COMMENT ON COLUMN cons.review_completed IS 'Флаг завершения обзора мероприятия';

-- Пример структуры photos_folder:
-- 'events/FW2025/' -> https://supabase.../storage/v1/object/public/gallery/events/FW2025/

-- Обновление существующих записей - помечаем как review_completed если есть обзор
UPDATE cons
SET review_completed = true
WHERE my_review IS NOT NULL
   OR (rating_organization IS NOT NULL AND rating_organization > 0);
