-- ============================================
-- УДАЛЕНИЕ CHECK CONSTRAINT ДЛЯ ATTENDANCE_STATUS
-- Необходимо для поддержки мультивыбора и JSON формата
-- ============================================

-- Удаляем ограничение, которое блокирует сохранение JSON
ALTER TABLE cons
DROP CONSTRAINT IF EXISTS cons_attendance_status_check;

-- Проверяем, что constraint удален
SELECT
  table_name,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'cons'
  AND constraint_name = 'cons_attendance_status_check';

-- Должен вернуть пустой результат
