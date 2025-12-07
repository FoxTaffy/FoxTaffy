-- ============================================
-- ДОБАВЛЕНИЕ НОВЫХ СТАТУСОВ УЧАСТИЯ
-- Необходимо для отображения меток на карточках
-- ============================================

-- Удаляем старое ограничение
ALTER TABLE cons
DROP CONSTRAINT IF EXISTS cons_attendance_status_check;

-- Добавляем новое ограничение с расширенным списком статусов
ALTER TABLE cons
ADD CONSTRAINT cons_attendance_status_check
CHECK (attendance_status IN (
  'planning',          -- Планирую
  'registered',        -- Зарегистрирован
  'ticket_purchased',  -- Билет куплен
  'vip',              -- VIP
  'sponsor',          -- Спонсор
  'volunteer',        -- Волонтёр
  'attended',         -- Посетил
  'missed',           -- Пропустил
  'cancelled'         -- Отменено
));

-- Проверяем результат
SELECT
  table_name,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'cons'
  AND constraint_name = 'cons_attendance_status_check';
