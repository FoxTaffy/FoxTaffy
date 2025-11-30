-- ================================================
-- 🔒 НАСТРОЙКА RLS ПОЛИТИК ДЛЯ CON_PURCHASES
-- Разрешаем операции с покупками
-- ================================================

-- 1. Проверяем текущий статус RLS
SELECT
  '=== ШАГ 1: ТЕКУЩИЙ СТАТУС RLS ===' as info;

SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'con_purchases';

-- 2. Показываем существующие политики (ДО изменений)
SELECT
  '=== ШАГ 2: СУЩЕСТВУЮЩИЕ ПОЛИТИКИ (ДО) ===' as info;

SELECT
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename = 'con_purchases'
ORDER BY cmd;

-- 3. Удаляем ВСЕ существующие политики (безопасно с IF EXISTS)
DROP POLICY IF EXISTS "Public read access" ON con_purchases;
DROP POLICY IF EXISTS "Allow public read access" ON con_purchases;
DROP POLICY IF EXISTS "Allow public insert access" ON con_purchases;
DROP POLICY IF EXISTS "Allow public update access" ON con_purchases;
DROP POLICY IF EXISTS "Allow public delete access" ON con_purchases;
DROP POLICY IF EXISTS "Admin full access" ON con_purchases;
DROP POLICY IF EXISTS "Enable read access for all users" ON con_purchases;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON con_purchases;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON con_purchases;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON con_purchases;

SELECT '=== ШАГ 3: СТАРЫЕ ПОЛИТИКИ УДАЛЕНЫ ===' as info;

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

SELECT '=== ШАГ 4: НОВЫЕ ПОЛИТИКИ СОЗДАНЫ ===' as info;

-- 5. Убеждаемся что RLS включен
ALTER TABLE con_purchases ENABLE ROW LEVEL SECURITY;

-- 6. Очищаем кэш схемы Supabase (PostgREST)
NOTIFY pgrst, 'reload schema';

SELECT '=== ШАГ 5: КЭШ POSTGREST ОЧИЩЕН ===' as info;

-- 7. Показываем новые политики (ПОСЛЕ изменений)
SELECT
  '=== ШАГ 6: ФИНАЛЬНЫЕ ПОЛИТИКИ ===' as info;

SELECT
  policyname,
  cmd as operation,
  CASE
    WHEN qual = 'true' OR qual IS NULL THEN '✅ Разрешено всем'
    ELSE qual
  END as policy_rule
FROM pg_policies
WHERE tablename = 'con_purchases'
ORDER BY cmd;

-- 8. Проверяем что всё работает
SELECT
  '=== ШАГ 7: ПРОВЕРКА ===' as info;

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

-- 9. Итог
SELECT
  '=== ИТОГ ===' as info;

SELECT
  '✅✅✅ ПОЛИТИКИ RLS НАСТРОЕНЫ УСПЕШНО! ✅✅✅' as status
UNION ALL SELECT
  ''
UNION ALL SELECT
  'Операции с покупками разрешены:'
UNION ALL SELECT
  '  ✅ SELECT (чтение)'
UNION ALL SELECT
  '  ✅ INSERT (вставка) ← ТЕПЕРЬ РАБОТАЕТ!'
UNION ALL SELECT
  '  ✅ UPDATE (обновление)'
UNION ALL SELECT
  '  ✅ DELETE (удаление)'
UNION ALL SELECT
  ''
UNION ALL SELECT
  '⚠️  ВАЖНО: Это открытые политики для разработки!'
UNION ALL SELECT
  'В продакшене настройте аутентификацию через auth.uid()';

SELECT 'Обновите страницу админ-панели и попробуйте сохранить покупки!' as next_step;
