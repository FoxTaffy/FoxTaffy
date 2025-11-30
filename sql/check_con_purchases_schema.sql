-- ================================================
-- 🔍 ДИАГНОСТИКА СХЕМЫ ТАБЛИЦЫ CON_PURCHASES
-- Только просмотр, без изменений
-- ================================================

-- 1. Показываем все колонки таблицы
SELECT
  '=== СТРУКТУРА ТАБЛИЦЫ CON_PURCHASES ===' as info;

SELECT
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'con_purchases'
ORDER BY ordinal_position;

-- 2. Показываем количество записей
SELECT
  '=== СТАТИСТИКА ===' as info;

SELECT
  'Всего записей:' as metric,
  COUNT(*)::text as value
FROM con_purchases;

-- 3. Проверяем наличие ключевых колонок
SELECT
  '=== ПРОВЕРКА КЛЮЧЕВЫХ КОЛОНОК ===' as info;

SELECT
  'con_id' as column_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'con_purchases' AND column_name = 'con_id'
  ) THEN '✅ Существует' ELSE '❌ Отсутствует' END as status
UNION ALL
SELECT
  'item_name',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'con_purchases' AND column_name = 'item_name'
  ) THEN '✅ Существует' ELSE '❌ Отсутствует' END
UNION ALL
SELECT
  'name',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'con_purchases' AND column_name = 'name'
  ) THEN '⚠️  Существует (нужно переименовать)' ELSE '✅ Отсутствует' END
UNION ALL
SELECT
  'price',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'con_purchases' AND column_name = 'price'
  ) THEN '✅ Существует' ELSE '❌ Отсутствует' END
UNION ALL
SELECT
  'image_url',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'con_purchases' AND column_name = 'image_url'
  ) THEN '✅ Существует' ELSE '❌ Отсутствует' END;

-- 4. Итоговая рекомендация
SELECT
  '=== РЕКОМЕНДАЦИЯ ===' as info;

SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'con_purchases' AND column_name = 'item_name'
    ) THEN '✅ Схема уже правильная! Колонка item_name существует. Возможно нужно просто очистить кэш PostgREST.'
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'con_purchases' AND column_name = 'name'
    ) THEN '⚠️  Нужно переименовать колонку "name" в "item_name". Запустите fix_con_purchases_schema.sql'
    ELSE '❌ Колонки item_name или name не существуют! Нужно создать item_name. Запустите fix_con_purchases_schema.sql'
  END as recommendation;
