-- SQL миграция для добавления новых полей в таблицу cons
-- Выполните этот скрипт в Supabase SQL Editor

-- Добавление новых полей
ALTER TABLE cons
ADD COLUMN IF NOT EXISTS event_time TIME,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS pros TEXT,
ADD COLUMN IF NOT EXISTS cons_text TEXT,
ADD COLUMN IF NOT EXISTS my_review TEXT,
ADD COLUMN IF NOT EXISTS purchase_items JSONB DEFAULT '[]'::jsonb;

-- Удаление устаревших полей (опционально - раскомментируйте если нужно)
-- ALTER TABLE cons DROP COLUMN IF EXISTS entrance_fee;
-- ALTER TABLE cons DROP COLUMN IF EXISTS total_spent;

-- Комментарии к новым полям
COMMENT ON COLUMN cons.event_time IS 'Время начала мероприятия';
COMMENT ON COLUMN cons.avatar_url IS 'URL логотипа/аватара для карточки мероприятия';
COMMENT ON COLUMN cons.pros IS 'Плюсы мероприятия';
COMMENT ON COLUMN cons.cons_text IS 'Минусы мероприятия';
COMMENT ON COLUMN cons.my_review IS 'Общее впечатление/отзыв о мероприятии';
COMMENT ON COLUMN cons.purchase_items IS 'Список покупок в формате JSON [{name, price, image}]';

-- Пример структуры purchase_items:
-- [
--   {"name": "Значок", "price": 500, "image": "https://..."},
--   {"name": "Футболка", "price": 1500, "image": "https://..."}
-- ]
