-- ================================================
-- 🔍 ПОЛНАЯ ДИАГНОСТИКА ТАБЛИЦЫ CON_PURCHASES
-- Показывает ВСЮ информацию о таблице
-- ================================================

-- 1. Показываем ВСЕ колонки с деталями
SELECT
  '=== ПОЛНАЯ СТРУКТУРА ТАБЛИЦЫ ===' as info;

SELECT
  ordinal_position as "#",
  column_name,
  data_type,
  character_maximum_length as max_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'con_purchases'
ORDER BY ordinal_position;

-- 2. Показываем ограничения (constraints)
SELECT
  '=== ОГРАНИЧЕНИЯ (CONSTRAINTS) ===' as info;

SELECT
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'con_purchases';

-- 3. Показываем NOT NULL колонки
SELECT
  '=== ОБЯЗАТЕЛЬНЫЕ КОЛОНКИ (NOT NULL) ===' as info;

SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'con_purchases'
  AND is_nullable = 'NO'
ORDER BY ordinal_position;

-- 4. Показываем nullable колонки
SELECT
  '=== ОПЦИОНАЛЬНЫЕ КОЛОНКИ (NULLABLE) ===' as info;

SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'con_purchases'
  AND is_nullable = 'YES'
ORDER BY ordinal_position;

-- 5. Проверяем наличие конкретных колонок
SELECT
  '=== ПРОВЕРКА НУЖНЫХ НАМ КОЛОНОК ===' as info;

SELECT
  'con_id' as column_we_need,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'con_purchases' AND column_name = 'con_id'
  ) THEN '✅ ЕСТЬ' ELSE '❌ НЕТ' END as status,
  (SELECT data_type FROM information_schema.columns
   WHERE table_name = 'con_purchases' AND column_name = 'con_id') as type,
  (SELECT is_nullable FROM information_schema.columns
   WHERE table_name = 'con_purchases' AND column_name = 'con_id') as nullable
UNION ALL
SELECT
  'title',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'con_purchases' AND column_name = 'title'
  ) THEN '✅ ЕСТЬ' ELSE '❌ НЕТ' END,
  (SELECT data_type FROM information_schema.columns
   WHERE table_name = 'con_purchases' AND column_name = 'title'),
  (SELECT is_nullable FROM information_schema.columns
   WHERE table_name = 'con_purchases' AND column_name = 'title')
UNION ALL
SELECT
  'item_name',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'con_purchases' AND column_name = 'item_name'
  ) THEN '⚠️ ЕСТЬ (старое имя?)' ELSE '✅ НЕТ' END,
  (SELECT data_type FROM information_schema.columns
   WHERE table_name = 'con_purchases' AND column_name = 'item_name'),
  (SELECT is_nullable FROM information_schema.columns
   WHERE table_name = 'con_purchases' AND column_name = 'item_name')
UNION ALL
SELECT
  'name',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'con_purchases' AND column_name = 'name'
  ) THEN '⚠️ ЕСТЬ (старое имя?)' ELSE '✅ НЕТ' END,
  (SELECT data_type FROM information_schema.columns
   WHERE table_name = 'con_purchases' AND column_name = 'name'),
  (SELECT is_nullable FROM information_schema.columns
   WHERE table_name = 'con_purchases' AND column_name = 'name')
UNION ALL
SELECT
  'price',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'con_purchases' AND column_name = 'price'
  ) THEN '✅ ЕСТЬ' ELSE '❌ НЕТ' END,
  (SELECT data_type FROM information_schema.columns
   WHERE table_name = 'con_purchases' AND column_name = 'price'),
  (SELECT is_nullable FROM information_schema.columns
   WHERE table_name = 'con_purchases' AND column_name = 'price')
UNION ALL
SELECT
  'image_url',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'con_purchases' AND column_name = 'image_url'
  ) THEN '✅ ЕСТЬ' ELSE '❌ НЕТ' END,
  (SELECT data_type FROM information_schema.columns
   WHERE table_name = 'con_purchases' AND column_name = 'image_url'),
  (SELECT is_nullable FROM information_schema.columns
   WHERE table_name = 'con_purchases' AND column_name = 'image_url');

-- 6. Показываем текущие данные (если есть)
SELECT
  '=== ПРИМЕРЫ ДАННЫХ (первые 3 записи) ===' as info;

SELECT * FROM con_purchases LIMIT 3;

-- 7. Показываем количество записей
SELECT
  '=== СТАТИСТИКА ===' as info;

SELECT
  'Всего записей:' as metric,
  COUNT(*)::text as value
FROM con_purchases;

-- 8. Итоговая рекомендация
SELECT
  '=== ЧТО ИСПОЛЬЗОВАТЬ В КОДЕ ===' as recommendation;

SELECT
  'Вставка данных (INSERT INTO con_purchases):' as instruction
UNION ALL
SELECT
  '  con_id: ' ||
  COALESCE((SELECT data_type FROM information_schema.columns
   WHERE table_name = 'con_purchases' AND column_name = 'con_id'), 'НЕ НАЙДЕНО')
UNION ALL
SELECT
  '  title: ' ||
  COALESCE((SELECT data_type FROM information_schema.columns
   WHERE table_name = 'con_purchases' AND column_name = 'title'), 'НЕ НАЙДЕНО')
UNION ALL
SELECT
  '  price: ' ||
  COALESCE((SELECT data_type FROM information_schema.columns
   WHERE table_name = 'con_purchases' AND column_name = 'price'), 'НЕ НАЙДЕНО')
UNION ALL
SELECT
  '  image_url: ' ||
  COALESCE((SELECT data_type FROM information_schema.columns
   WHERE table_name = 'con_purchases' AND column_name = 'image_url'), 'НЕ НАЙДЕНО');
