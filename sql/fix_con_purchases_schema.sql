-- ================================================
-- 🛒 ИСПРАВЛЕНИЕ СХЕМЫ ТАБЛИЦЫ CON_PURCHASES
-- Проверка и обновление структуры таблицы покупок
-- ================================================

-- 1. Проверяем текущую структуру таблицы
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'con_purchases'
ORDER BY ordinal_position;

-- 2. Если колонка 'name' существует вместо 'item_name', переименовываем её
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
  END IF;

  -- Проверяем что item_name существует
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'con_purchases'
    AND column_name = 'item_name'
  ) THEN
    -- Создаём колонку item_name если её нет
    ALTER TABLE con_purchases ADD COLUMN item_name TEXT NOT NULL;
    RAISE NOTICE '✅ Колонка item_name создана';
  END IF;
END $$;

-- 3. Проверяем что все обязательные колонки существуют
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
END $$;

-- 4. Очищаем кэш схемы Supabase (PostgREST)
NOTIFY pgrst, 'reload schema';

-- 5. Показываем финальную структуру
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'con_purchases'
ORDER BY ordinal_position;

-- 6. Показываем пример правильной вставки
SELECT 'Пример корректной вставки:' as info;
SELECT
  '  con_id: UUID' as field
UNION ALL SELECT '  item_name: TEXT NOT NULL (название товара)'
UNION ALL SELECT '  price: DECIMAL(10,2) NOT NULL (цена)'
UNION ALL SELECT '  image_url: TEXT (опционально - фото товара)';

SELECT '✅ Схема таблицы con_purchases проверена и обновлена!' as status;
