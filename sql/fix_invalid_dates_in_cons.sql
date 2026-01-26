-- ============================================
-- ИСПРАВЛЕНИЕ НЕВАЛИДНЫХ ДАТ В ТАБЛИЦЕ CONS
-- ============================================
--
-- Этот скрипт исправляет невалидные даты в таблице cons
-- (пустые строки, строки с пробелами и т.д.)
--
-- ВАЖНО: Выполните этот скрипт в Supabase SQL Editor для production БД
-- ============================================

-- ============================================
-- 1. ПРОВЕРКА ТЕКУЩЕГО СОСТОЯНИЯ
-- ============================================

-- Посмотрим, сколько записей с проблемными датами
SELECT
  'Записи с пустыми event_date' as issue,
  COUNT(*) as count
FROM cons
WHERE event_date IS NULL OR event_date = '' OR TRIM(event_date::text) = '';

SELECT
  'Записи с пустыми event_end_date' as issue,
  COUNT(*) as count
FROM cons
WHERE event_end_date IS NOT NULL AND (event_end_date = '' OR TRIM(event_end_date::text) = '');

SELECT
  'Записи с пустыми announced_date' as issue,
  COUNT(*) as count
FROM cons
WHERE announced_date IS NOT NULL AND (announced_date = '' OR TRIM(announced_date::text) = '');

-- ============================================
-- 2. ИСПРАВЛЕНИЕ НЕВАЛИДНЫХ ДАТ
-- ============================================

-- Конвертируем пустые строки в NULL для event_date
UPDATE cons
SET event_date = NULL
WHERE event_date IS NOT NULL
  AND (TRIM(event_date::text) = '' OR event_date::text = '');

-- Конвертируем пустые строки в NULL для event_end_date
UPDATE cons
SET event_end_date = NULL
WHERE event_end_date IS NOT NULL
  AND (TRIM(event_end_date::text) = '' OR event_end_date::text = '');

-- Конвертируем пустые строки в NULL для announced_date
UPDATE cons
SET announced_date = NULL
WHERE announced_date IS NOT NULL
  AND (TRIM(announced_date::text) = '' OR announced_date::text = '');

-- ============================================
-- 3. ПРОВЕРКА РЕЗУЛЬТАТОВ
-- ============================================

-- Проверяем, что все пустые строки преобразованы в NULL
SELECT
  'После исправления - пустые event_date' as check_result,
  COUNT(*) as count
FROM cons
WHERE event_date IS NOT NULL AND (event_date = '' OR TRIM(event_date::text) = '');

SELECT
  'После исправления - пустые event_end_date' as check_result,
  COUNT(*) as count
FROM cons
WHERE event_end_date IS NOT NULL AND (event_end_date = '' OR TRIM(event_end_date::text) = '');

SELECT
  'После исправления - пустые announced_date' as check_result,
  COUNT(*) as count
FROM cons
WHERE announced_date IS NOT NULL AND (announced_date = '' OR TRIM(announced_date::text) = '');

-- Показываем статистику по датам
SELECT
  COUNT(*) as total_events,
  COUNT(event_date) as events_with_date,
  COUNT(*) - COUNT(event_date) as events_without_date,
  COUNT(event_end_date) as events_with_end_date,
  COUNT(announced_date) as events_with_announced_date
FROM cons;

-- ============================================
-- 4. ДОБАВЛЕНИЕ CONSTRAINT ДЛЯ ПРЕДОТВРАЩЕНИЯ ПРОБЛЕМ В БУДУЩЕМ
-- ============================================

-- Удаляем старые constraint если есть
ALTER TABLE cons DROP CONSTRAINT IF EXISTS check_event_date_not_empty;
ALTER TABLE cons DROP CONSTRAINT IF EXISTS check_event_end_date_not_empty;
ALTER TABLE cons DROP CONSTRAINT IF EXISTS check_announced_date_not_empty;

-- Добавляем constraint: дата должна быть либо NULL, либо валидной (не пустая строка)
ALTER TABLE cons ADD CONSTRAINT check_event_date_not_empty
  CHECK (event_date IS NULL OR TRIM(event_date::text) != '');

ALTER TABLE cons ADD CONSTRAINT check_event_end_date_not_empty
  CHECK (event_end_date IS NULL OR TRIM(event_end_date::text) != '');

ALTER TABLE cons ADD CONSTRAINT check_announced_date_not_empty
  CHECK (announced_date IS NULL OR TRIM(announced_date::text) != '');

-- ============================================
-- ГОТОВО!
-- ============================================

SELECT '✅ Невалидные даты успешно исправлены!' AS status;
SELECT '📋 Добавлены constraints для предотвращения пустых строк в будущем' AS info;
SELECT '🎉 Теперь приложение должно работать без ошибок!' AS ready;

-- ============================================
-- ИНСТРУКЦИИ ПО ИСПОЛЬЗОВАНИЮ
-- ============================================
--
-- 1. Откройте Supabase Dashboard для PRODUCTION базы данных
-- 2. Перейдите в SQL Editor
-- 3. Создайте новый запрос
-- 4. Скопируйте и вставьте содержимое этого файла
-- 5. Нажмите "Run" для выполнения
-- 6. Проверьте результаты выполнения
-- 7. Обновите страницу приложения (Ctrl+Shift+R)
--
-- ВАЖНО: После применения этой миграции все пустые строки в датах
-- будут преобразованы в NULL, что предотвратит ошибку getDay()
--
-- ============================================
