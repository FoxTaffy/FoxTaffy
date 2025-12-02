-- ============================================
-- НАСТРОЙКА STORAGE ДЛЯ FOXTAFFY - УПРОЩЕННАЯ ВЕРСИЯ
-- ============================================
--
-- Выполните этот скрипт в Supabase SQL Editor:
-- 1. Откройте https://app.supabase.com
-- 2. Выберите проект
-- 3. SQL Editor → New query
-- 4. Вставьте этот код
-- 5. Нажмите Run
--
-- ============================================

-- ============================================
-- ШАГ 1: Удаляем старые политики (если есть)
-- ============================================

DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;

DROP POLICY IF EXISTS "Public access to Convent" ON storage.objects;
DROP POLICY IF EXISTS "Public read Convent" ON storage.objects;
DROP POLICY IF EXISTS "Public write Convent" ON storage.objects;
DROP POLICY IF EXISTS "Public delete Convent" ON storage.objects;

-- ============================================
-- ШАГ 2: Создаем новые политики для ВСЕХ бакетов
-- ============================================

-- Политика 1: Разрешить ЧТЕНИЕ для всех
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (true);

-- Политика 2: Разрешить ЗАГРУЗКУ для всех
CREATE POLICY "Allow public insert"
ON storage.objects FOR INSERT
TO public
WITH CHECK (true);

-- Политика 3: Разрешить ОБНОВЛЕНИЕ для всех
CREATE POLICY "Allow public update"
ON storage.objects FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Политика 4: Разрешить УДАЛЕНИЕ для всех
CREATE POLICY "Allow public delete"
ON storage.objects FOR DELETE
TO public
USING (true);

-- ============================================
-- ШАГ 3: Проверяем результат
-- ============================================

-- Показать все бакеты
SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets;

-- Показать все политики
SELECT
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;

-- ============================================
-- ГОТОВО!
-- ============================================

SELECT '✅ Политики настроены!' as status;
SELECT '📝 Теперь перейдите к созданию бакета Convent в Dashboard' as next_step;
