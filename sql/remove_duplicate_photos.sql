-- ===============================================
-- 🧹 УДАЛЕНИЕ ДУБЛИКАТОВ ФОТОГРАФИЙ
-- Удаляет дублирующиеся записи фотографий (оригинал + миниатюра)
-- ===============================================

-- 1. Проверка дубликатов
SELECT
  '=== АНАЛИЗ ДУБЛИКАТОВ ===' as info;

-- Показываем мероприятия с дублирующимися фотографиями
SELECT
  con_id,
  COUNT(*) as total_photos,
  COUNT(DISTINCT SUBSTRING(image_url FROM '.*/([^/]+)$')) as unique_files,
  COUNT(*) - COUNT(DISTINCT SUBSTRING(image_url FROM '.*/([^/]+)$')) as duplicates
FROM con_photos
GROUP BY con_id
HAVING COUNT(*) > COUNT(DISTINCT SUBSTRING(image_url FROM '.*/([^/]+)$'))
ORDER BY duplicates DESC;

-- 2. Показываем примеры дубликатов
SELECT
  '=== ПРИМЕРЫ ДУБЛИКАТОВ ===' as info;

SELECT
  id,
  con_id,
  image_url,
  thumbnail_url,
  created_at
FROM con_photos
WHERE con_id IN (
  SELECT con_id
  FROM con_photos
  GROUP BY con_id
  HAVING COUNT(*) > COUNT(DISTINCT SUBSTRING(image_url FROM '.*/([^/]+)$'))
)
ORDER BY con_id, image_url
LIMIT 20;

-- 3. Удаление дубликатов (оставляем только записи с миниатюрами)
SELECT
  '=== НАЧИНАЕМ ОЧИСТКУ ===' as info;

-- Удаляем записи где image_url указывает на миниатюру (содержит thumb_)
-- но НЕ удаляем если это единственная запись для файла
DELETE FROM con_photos
WHERE id IN (
  SELECT p1.id
  FROM con_photos p1
  WHERE p1.image_url LIKE '%thumb_%'
    AND EXISTS (
      -- Проверяем что есть другая запись для того же файла
      SELECT 1 FROM con_photos p2
      WHERE p2.con_id = p1.con_id
        AND p2.id != p1.id
        AND (
          -- Либо тот же базовый файл
          REPLACE(p2.image_url, '/original/', '') = REPLACE(REPLACE(p1.image_url, '/thumbnails/', ''), 'thumb_', '')
          OR
          -- Либо thumbnail_url указывает на ту же миниатюру
          p2.thumbnail_url = p1.image_url
        )
    )
);

-- 4. Удаляем записи где нет миниатюры, но есть дубликат с миниатюрой
DELETE FROM con_photos
WHERE id IN (
  SELECT p1.id
  FROM con_photos p1
  WHERE (p1.thumbnail_url IS NULL OR p1.thumbnail_url = p1.image_url)
    AND p1.image_url NOT LIKE '%thumb_%'
    AND EXISTS (
      -- Есть другая запись с миниатюрой для того же мероприятия
      SELECT 1 FROM con_photos p2
      WHERE p2.con_id = p1.con_id
        AND p2.id != p1.id
        AND p2.thumbnail_url IS NOT NULL
        AND p2.thumbnail_url != p2.image_url
        AND (
          -- Проверяем что это тот же файл
          REPLACE(p2.image_url, '/original/', '') = REPLACE(p1.image_url, '/original/', '')
          OR
          SUBSTRING(p2.image_url FROM '.*/([^/]+)$') = SUBSTRING(p1.image_url FROM '.*/([^/]+)$')
        )
    )
);

-- 5. Проверка результатов
SELECT
  '=== РЕЗУЛЬТАТЫ ОЧИСТКИ ===' as info;

SELECT
  con_id,
  COUNT(*) as photos_after_cleanup
FROM con_photos
GROUP BY con_id
ORDER BY con_id;

-- 6. Статистика
SELECT
  '=== ОБЩАЯ СТАТИСТИКА ===' as info;

SELECT
  COUNT(*) as total_photos,
  COUNT(DISTINCT con_id) as events_with_photos,
  COUNT(CASE WHEN thumbnail_url IS NOT NULL AND thumbnail_url != image_url THEN 1 END) as photos_with_thumbnails,
  COUNT(CASE WHEN thumbnail_url IS NULL OR thumbnail_url = image_url THEN 1 END) as photos_without_thumbnails
FROM con_photos;

SELECT '✅ ОЧИСТКА ЗАВЕРШЕНА! Проверьте результаты выше.' as status;
