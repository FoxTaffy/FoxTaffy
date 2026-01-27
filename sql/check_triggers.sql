-- Проверка триггеров и ограничений на таблице con_purchases

-- 1. Проверяем триггеры
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'con_purchases';

-- 2. Проверяем constraint'ы
SELECT
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'con_purchases';

-- 3. Проверяем все колонки с default values
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'con_purchases'
  AND column_default IS NOT NULL;
