-- ============================================
-- НАСТРОЙКА RLS ПОЛИТИК ДЛЯ ТАБЛИЦ МЕРОПРИЯТИЙ
-- ============================================
--
-- Этот скрипт настраивает политики безопасности на уровне строк (RLS)
-- для таблиц мероприятий в Fox Taffy
--
-- ВАЖНО: Выполните этот скрипт в Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ВКЛЮЧЕНИЕ RLS ДЛЯ ТАБЛИЦ
-- ============================================

-- Включаем RLS для таблицы мероприятий
ALTER TABLE cons ENABLE ROW LEVEL SECURITY;

-- Включаем RLS для связанных таблиц
ALTER TABLE con_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE con_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE con_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE con_purchases ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. УДАЛЕНИЕ СТАРЫХ ПОЛИТИК (если существуют)
-- ============================================

-- Удаляем старые политики для таблицы cons
DROP POLICY IF EXISTS "Public read access for cons" ON cons;
DROP POLICY IF EXISTS "Public insert access for cons" ON cons;
DROP POLICY IF EXISTS "Public update access for cons" ON cons;
DROP POLICY IF EXISTS "Public delete access for cons" ON cons;

-- Удаляем старые политики для таблицы con_links
DROP POLICY IF EXISTS "Public read access for con_links" ON con_links;
DROP POLICY IF EXISTS "Public insert access for con_links" ON con_links;
DROP POLICY IF EXISTS "Public update access for con_links" ON con_links;
DROP POLICY IF EXISTS "Public delete access for con_links" ON con_links;

-- Удаляем старые политики для таблицы con_features
DROP POLICY IF EXISTS "Public read access for con_features" ON con_features;
DROP POLICY IF EXISTS "Public insert access for con_features" ON con_features;
DROP POLICY IF EXISTS "Public update access for con_features" ON con_features;
DROP POLICY IF EXISTS "Public delete access for con_features" ON con_features;

-- Удаляем старые политики для таблицы con_photos
DROP POLICY IF EXISTS "Public read access for con_photos" ON con_photos;
DROP POLICY IF EXISTS "Public insert access for con_photos" ON con_photos;
DROP POLICY IF EXISTS "Public update access for con_photos" ON con_photos;
DROP POLICY IF EXISTS "Public delete access for con_photos" ON con_photos;

-- Удаляем старые политики для таблицы con_purchases
DROP POLICY IF EXISTS "Public read access for con_purchases" ON con_purchases;
DROP POLICY IF EXISTS "Public insert access for con_purchases" ON con_purchases;
DROP POLICY IF EXISTS "Public update access for con_purchases" ON con_purchases;
DROP POLICY IF EXISTS "Public delete access for con_purchases" ON con_purchases;

-- ============================================
-- 3. СОЗДАНИЕ ПОЛИТИК ДЛЯ ТАБЛИЦЫ CONS
-- ============================================

-- Политика чтения (публичный доступ)
CREATE POLICY "Public read access for cons"
ON cons FOR SELECT
TO public
USING (true);

-- Политика вставки (публичная вставка)
CREATE POLICY "Public insert access for cons"
ON cons FOR INSERT
TO public
WITH CHECK (true);

-- Политика обновления (публичное обновление)
CREATE POLICY "Public update access for cons"
ON cons FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Политика удаления (публичное удаление)
CREATE POLICY "Public delete access for cons"
ON cons FOR DELETE
TO public
USING (true);

-- ============================================
-- 4. СОЗДАНИЕ ПОЛИТИК ДЛЯ ТАБЛИЦЫ CON_LINKS
-- ============================================

CREATE POLICY "Public read access for con_links"
ON con_links FOR SELECT
TO public
USING (true);

CREATE POLICY "Public insert access for con_links"
ON con_links FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Public update access for con_links"
ON con_links FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Public delete access for con_links"
ON con_links FOR DELETE
TO public
USING (true);

-- ============================================
-- 5. СОЗДАНИЕ ПОЛИТИК ДЛЯ ТАБЛИЦЫ CON_FEATURES
-- ============================================

CREATE POLICY "Public read access for con_features"
ON con_features FOR SELECT
TO public
USING (true);

CREATE POLICY "Public insert access for con_features"
ON con_features FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Public update access for con_features"
ON con_features FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Public delete access for con_features"
ON con_features FOR DELETE
TO public
USING (true);

-- ============================================
-- 6. СОЗДАНИЕ ПОЛИТИК ДЛЯ ТАБЛИЦЫ CON_PHOTOS
-- ============================================

CREATE POLICY "Public read access for con_photos"
ON con_photos FOR SELECT
TO public
USING (true);

CREATE POLICY "Public insert access for con_photos"
ON con_photos FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Public update access for con_photos"
ON con_photos FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Public delete access for con_photos"
ON con_photos FOR DELETE
TO public
USING (true);

-- ============================================
-- 7. СОЗДАНИЕ ПОЛИТИК ДЛЯ ТАБЛИЦЫ CON_PURCHASES
-- ============================================

CREATE POLICY "Public read access for con_purchases"
ON con_purchases FOR SELECT
TO public
USING (true);

CREATE POLICY "Public insert access for con_purchases"
ON con_purchases FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Public update access for con_purchases"
ON con_purchases FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Public delete access for con_purchases"
ON con_purchases FOR DELETE
TO public
USING (true);

-- ============================================
-- 8. ПРОВЕРКА СОЗДАННЫХ ПОЛИТИК
-- ============================================

-- Проверяем включен ли RLS
SELECT
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('cons', 'con_links', 'con_features', 'con_photos', 'con_purchases')
ORDER BY tablename;

-- Проверяем созданные политики
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('cons', 'con_links', 'con_features', 'con_photos', 'con_purchases')
ORDER BY tablename, policyname;

-- ============================================
-- ИНСТРУКЦИИ ПО ИСПОЛЬЗОВАНИЮ
-- ============================================
--
-- 1. Откройте Supabase Dashboard
-- 2. Перейдите в SQL Editor
-- 3. Создайте новый запрос
-- 4. Скопируйте и вставьте содержимое этого файла
-- 5. Нажмите "Run" для выполнения
-- 6. Проверьте результаты запроса
--
-- ВАЖНО: Эти политики дают ПУБЛИЧНЫЙ доступ ко всем операциям.
-- Если вам нужна аутентификация, измените условия в политиках.
--
-- Пример политики с аутентификацией:
-- CREATE POLICY "Authenticated users can insert"
-- ON cons FOR INSERT
-- TO authenticated
-- WITH CHECK (auth.uid() IS NOT NULL);
--
-- ============================================

COMMENT ON POLICY "Public read access for cons" ON cons IS
'Разрешает публичное чтение всех мероприятий';

COMMENT ON POLICY "Public insert access for cons" ON cons IS
'Разрешает публичное создание новых мероприятий';

COMMENT ON POLICY "Public update access for cons" ON cons IS
'Разрешает публичное обновление мероприятий';

COMMENT ON POLICY "Public delete access for cons" ON cons IS
'Разрешает публичное удаление мероприятий';

-- ============================================
-- ГОТОВО!
-- ============================================

SELECT '✅ RLS политики успешно настроены!' AS status;
SELECT '📋 Таблицы cons, con_links, con_features, con_photos, con_purchases защищены' AS info;
SELECT '🔐 Публичный доступ настроен для всех операций' AS access;
SELECT '🎉 Можно начинать работу с мероприятиями!' AS ready;
