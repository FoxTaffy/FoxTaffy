-- ============================================
-- УСТАНОВКА ДЕФОЛТНОГО СТАТУСА УЧАСТИЯ
-- Для мероприятий без установленного статуса
-- ============================================

-- Обновляем записи без статуса участия на дефолтный 'planning'
UPDATE cons
SET attendance_status = 'planning'
WHERE attendance_status IS NULL;

-- Проверяем результат
SELECT
  id,
  name,
  event_date,
  attendance_status,
  event_date > NOW() as is_upcoming
FROM cons
WHERE event_date > NOW()
ORDER BY event_date ASC
LIMIT 10;
