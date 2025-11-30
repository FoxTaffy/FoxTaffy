-- ================================================
-- 🔒 НАСТРОЙКА RLS ПОЛИТИК ДЛЯ CON_PURCHASES
-- Разрешаем операции с покупками
-- ================================================

-- 1. Проверяем текущий статус RLS
SELECT
  '=== ТЕКУЩИЙ СТАТУС RLS ===' as info;

SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'con_purchases';

-- 2. Показываем существующие политики
SELECT
  '=== СУЩЕСТВУЮЩИЕ ПОЛИТИКИ ===' as info;

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'con_purchases';

-- 3. Удаляем старые ограничительные политики (если есть)
DROP POLICY IF EXISTS "Public read access" ON con_purchases;
DROP POLICY IF EXISTS "Admin full access" ON con_purchases;
DROP POLICY IF EXISTS "Enable read access for all users" ON con_purchases;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON con_purchases;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON con_purchases;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON con_purchases;

-- 4. Создаём новые разрешающие политики

-- Политика для чтения (SELECT) - доступно всем
CREATE POLICY "Allow public read access"
ON con_purchases
FOR SELECT
USING (true);

-- Политика для вставки (INSERT) - доступно всем
CREATE POLICY "Allow public insert access"
ON con_purchases
FOR INSERT
WITH CHECK (true);

-- Политика для обновления (UPDATE) - доступно всем
CREATE POLICY "Allow public update access"
ON con_purchases
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Политика для удаления (DELETE) - доступно всем
CREATE POLICY "Allow public delete access"
ON con_purchases
FOR DELETE
USING (true);

-- 5. Убеждаемся что RLS включен
ALTER TABLE con_purchases ENABLE ROW LEVEL SECURITY;

-- 6. Показываем новые политики
SELECT
  '=== НОВЫЕ ПОЛИТИКИ ===' as info;

SELECT
  policyname,
  cmd as operation,
  CASE
    WHEN qual = 'true' OR qual IS NULL THEN '✅ Разрешено всем'
    ELSE qual
  END as policy
FROM pg_policies
WHERE tablename = 'con_purchases'
ORDER BY cmd;

-- 7. Проверяем что всё работает
SELECT
  '=== ПРОВЕРКА ===' as info;

SELECT
  'RLS включен:' as check_name,
  CASE WHEN rowsecurity THEN '✅ Да' ELSE '❌ Нет' END as status
FROM pg_tables
WHERE tablename = 'con_purchases'
UNION ALL
SELECT
  'Политики созданы:',
  CASE WHEN COUNT(*) >= 4 THEN '✅ Да (' || COUNT(*)::text || ' политик)' ELSE '⚠️  Недостаточно' END
FROM pg_policies
WHERE tablename = 'con_purchases';

-- 8. Итог
SELECT
  '=== ИТОГ ===' as info;

SELECT
  '✅✅✅ ПОЛИТИКИ RLS НАСТРОЕНЫ! ✅✅✅' as status
UNION ALL SELECT
  'Теперь покупки можно:'
UNION ALL SELECT
  '  ✅ Читать (SELECT)'
UNION ALL SELECT
  '  ✅ Добавлять (INSERT)'
UNION ALL SELECT
  '  ✅ Обновлять (UPDATE)'
UNION ALL SELECT
  '  ✅ Удалять (DELETE)'
UNION ALL SELECT
  ''
UNION ALL SELECT
  '⚠️  ВАЖНО: Это открытые политики для разработки!'
UNION ALL SELECT
  'В продакшене настройте аутентификацию и ограничьте доступ.';

SELECT 'Обновите страницу и попробуйте сохранить покупки!' as next_step;
