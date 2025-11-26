-- SQL миграция для удаления поля event_time и добавления event_end_date
-- Выполните этот скрипт в Supabase SQL Editor

-- Удаление поля event_time
ALTER TABLE cons DROP COLUMN IF EXISTS event_time;

-- Добавление поля event_end_date для диапазона дат (для КОНов)
ALTER TABLE cons ADD COLUMN IF NOT EXISTS event_end_date DATE;

-- Комментарий к новому полю
COMMENT ON COLUMN cons.event_end_date IS 'Дата окончания мероприятия (для многодневных событий типа КОН)';
