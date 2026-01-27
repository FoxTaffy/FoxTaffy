-- ============================================
-- НАСТРОЙКА STORAGE ПОЛИТИК ДЛЯ FOX TAFFY
-- ============================================
--
-- Этот скрипт настраивает политики безопасности для Supabase Storage
-- для бакетов Convent (мероприятия) и gallery (общая галерея)
--
-- ВАЖНО: Выполните этот скрипт в Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. СОЗДАНИЕ БАКЕТОВ (если не существуют)
-- ============================================

-- Создаем бакет Convent для мероприятий
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'Convent',
  'Convent',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Создаем бакет gallery для общих файлов
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery',
  'gallery',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. УДАЛЕНИЕ СТАРЫХ ПОЛИТИК (если существуют)
-- ============================================

-- Удаляем старые политики для бакета Convent
DROP POLICY IF EXISTS "Public read access for Convent" ON storage.objects;
DROP POLICY IF EXISTS "Public write access for Convent" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access for Convent" ON storage.objects;
DROP POLICY IF EXISTS "Public update access for Convent" ON storage.objects;

-- Удаляем старые политики для бакета gallery
DROP POLICY IF EXISTS "Public read access for gallery" ON storage.objects;
DROP POLICY IF EXISTS "Public write access for gallery" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access for gallery" ON storage.objects;
DROP POLICY IF EXISTS "Public update access for gallery" ON storage.objects;

-- ============================================
-- 3. СОЗДАНИЕ ПОЛИТИК ДЛЯ БАКЕТА CONVENT
-- ============================================

-- Политика чтения (публичный доступ)
CREATE POLICY "Public read access for Convent"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'Convent');

-- Политика загрузки (публичная загрузка)
CREATE POLICY "Public write access for Convent"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'Convent');

-- Политика обновления (публичное обновление)
CREATE POLICY "Public update access for Convent"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'Convent')
WITH CHECK (bucket_id = 'Convent');

-- Политика удаления (публичное удаление)
CREATE POLICY "Public delete access for Convent"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'Convent');

-- ============================================
-- 4. СОЗДАНИЕ ПОЛИТИК ДЛЯ БАКЕТА GALLERY
-- ============================================

-- Политика чтения (публичный доступ)
CREATE POLICY "Public read access for gallery"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gallery');

-- Политика загрузки (публичная загрузка)
CREATE POLICY "Public write access for gallery"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'gallery');

-- Политика обновления (публичное обновление)
CREATE POLICY "Public update access for gallery"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'gallery')
WITH CHECK (bucket_id = 'gallery');

-- Политика удаления (публичное удаление)
CREATE POLICY "Public delete access for gallery"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'gallery');

-- ============================================
-- 5. ПРОВЕРКА СОЗДАННЫХ ПОЛИТИК
-- ============================================

-- Проверяем список бакетов
SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id IN ('Convent', 'gallery');

-- Проверяем политики для бакетов
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
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND (policyname LIKE '%Convent%' OR policyname LIKE '%gallery%')
ORDER BY policyname;

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
-- 7. Перейдите в Storage и убедитесь, что бакеты созданы
--
-- СТРУКТУРА ХРАНЕНИЯ:
--
-- Convent (бакет для мероприятий):
--   └── events/
--       ├── {event-id}/
--       │   ├── original/         - Оригинальные фотографии
--       │   ├── thumbnails/       - Миниатюры фотографий
--       │   ├── avatar/           - Аватар мероприятия
--       │   └── banner/           - Баннер мероприятия
--       └── temp/                 - Временные файлы
--
-- gallery (бакет для общих файлов):
--   └── arts/                     - Артворки и прочее
--
-- ============================================

COMMENT ON POLICY "Public read access for Convent" ON storage.objects IS
'Разрешает публичное чтение всех файлов в бакете Convent';

COMMENT ON POLICY "Public write access for Convent" ON storage.objects IS
'Разрешает публичную загрузку файлов в бакет Convent';

COMMENT ON POLICY "Public update access for Convent" ON storage.objects IS
'Разрешает публичное обновление файлов в бакете Convent';

COMMENT ON POLICY "Public delete access for Convent" ON storage.objects IS
'Разрешает публичное удаление файлов из бакета Convent';

-- ============================================
-- ГОТОВО!
-- ============================================

SELECT '✅ Storage политики успешно настроены!' AS status;
SELECT '📁 Бакеты Convent и gallery готовы к использованию' AS info;
SELECT '🔐 Публичный доступ настроен для всех операций' AS access;
SELECT '📸 Можно начинать загрузку фотографий!' AS ready;
