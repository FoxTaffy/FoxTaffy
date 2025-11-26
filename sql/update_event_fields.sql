-- SQL миграция для обновления полей мероприятий
-- Выполните этот скрипт в Supabase SQL Editor

-- Удаление поля event_time (время начала)
ALTER TABLE cons DROP COLUMN IF EXISTS event_time;

-- Добавление поля event_end_date для диапазона дат КОНов
ALTER TABLE cons ADD COLUMN IF NOT EXISTS event_end_date DATE;

-- Комментарии к изменениям
COMMENT ON COLUMN cons.event_end_date IS 'Дата окончания мероприятия (для КОНов и многодневных мероприятий)';

-- Примечание: поле event_time удалено, так как время начала не используется
