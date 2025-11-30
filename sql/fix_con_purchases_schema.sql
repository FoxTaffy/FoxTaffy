-- ================================================
-- 🛒 ИСПРАВЛЕНИЕ СХЕМЫ ТАБЛИЦЫ CON_PURCHASES
-- Проверка и обновление структуры таблицы покупок
-- ================================================

-- 1. Проверяем текущую структуру таблицы
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'con_purchases'
ORDER BY ordinal_position;

-- 2. Безопасное переименование/создание колонки item_name
DO $$
BEGIN
  -- Проверяем существует ли колонка 'name'
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'con_purchases'
    AND column_name = 'name'
  ) THEN
    -- Переименовываем 'name' в 'item_name'
    ALTER TABLE con_purchases RENAME COLUMN name TO item_name;
    RAISE NOTICE '✅ Колонка name переименована в item_name';

  -- Проверяем что item_name НЕ существует
  ELSIF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'con_purchases'
    AND column_name = 'item_name'
  ) THEN
    -- Добавляем item_name как nullable сначала
    ALTER TABLE con_purchases ADD COLUMN item_name TEXT;
    RAISE NOTICE '⚠️  Колонка item_name создана (nullable)';

    -- Копируем данные из других колонок если они есть
    -- Например, если есть description или что-то другое
    UPDATE con_purchases
    SET item_name = COALESCE(description, 'Покупка без названия')
    WHERE item_name IS NULL;

    -- Теперь можем сделать NOT NULL
    ALTER TABLE con_purchases ALTER COLUMN item_name SET NOT NULL;
    RAISE NOTICE '✅ Колонка item_name теперь NOT NULL';
  ELSE
    RAISE NOTICE '✅ Колонка item_name уже существует';
  END IF;
END $$;

-- 3. Проверяем и создаём другие обязательные колонки
DO $$
BEGIN
  -- Проверяем price
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'con_purchases' AND column_name = 'price'
  ) THEN
    ALTER TABLE con_purchases ADD COLUMN price DECIMAL(10,2) NOT NULL DEFAULT 0;
    RAISE NOTICE '✅ Колонка price создана';
  END IF;

  -- Проверяем image_url (nullable)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'con_purchases' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE con_purchases ADD COLUMN image_url TEXT;
    RAISE NOTICE '✅ Колонка image_url создана';
  END IF;

  -- Проверяем con_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'con_purchases' AND column_name = 'con_id'
  ) THEN
    RAISE EXCEPTION '❌ КРИТИЧЕСКАЯ ОШИБКА: Отсутствует колонка con_id!';
  END IF;
END $$;

-- 4. Очищаем кэш схемы Supabase (PostgREST)
NOTIFY pgrst, 'reload schema';

-- 5. Показываем финальную структуру
SELECT
  '=== ФИНАЛЬНАЯ СТРУКТУРА ТАБЛИЦЫ CON_PURCHASES ===' as info;

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'con_purchases'
ORDER BY ordinal_position;

-- 6. Показываем количество записей
SELECT
  'Всего записей в таблице:' as info,
  COUNT(*) as count
FROM con_purchases;

-- 7. Показываем пример данных (первые 3 записи)
SELECT
  '=== ПРИМЕРЫ ДАННЫХ ===' as info;

SELECT
  id,
  con_id,
  item_name,
  price,
  image_url,
  created_at
FROM con_purchases
ORDER BY created_at DESC
LIMIT 3;

-- 8. Показываем пример правильной вставки
SELECT
  '=== ПРИМЕР КОРРЕКТНОЙ ВСТАВКИ ===' as info;

SELECT
  'INSERT INTO con_purchases (con_id, item_name, price, image_url) VALUES' as example
UNION ALL SELECT '  (''UUID-мероприятия'', ''Название товара'', 100.00, NULL);'
UNION ALL SELECT ''
UNION ALL SELECT 'Обязательные поля:'
UNION ALL SELECT '  ✅ con_id - UUID мероприятия'
UNION ALL SELECT '  ✅ item_name - TEXT NOT NULL (название товара)'
UNION ALL SELECT '  ✅ price - DECIMAL(10,2) NOT NULL (цена)'
UNION ALL SELECT '  ⚪ image_url - TEXT (опционально - фото товара)';

SELECT '✅ Схема таблицы con_purchases проверена и обновлена!' as status;
