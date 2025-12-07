-- ============================================
-- УСТАНОВКА ДЕФОЛТНОГО СТАТУСА УЧАСТИЯ
-- Для мероприятий без установленного статуса
-- ============================================

-- Обновляем записи без статуса участия на дефолтный 'planning'
UPDATE cons
SET attendance_status = 'planning'
WHERE attendance_status IS NULL;

-- Делаем поле обязательным с дефолтом
ALTER TABLE cons
ALTER COLUMN attendance_status SET DEFAULT 'planning';

ALTER TABLE cons
ALTER COLUMN attendance_status SET NOT NULL;

-- Проверяем результат
SELECT
  id,
  name,
  event_date,
  attendance_status,
  event_date > NOW() as is_upcoming
FROM cons
ORDER BY event_date DESC
LIMIT 20;
