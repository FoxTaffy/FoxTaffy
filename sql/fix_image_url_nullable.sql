-- ============================================
-- ИСПРАВЛЕНИЕ: Сделать image_url nullable в con_photos
-- Причина: image_url может быть null при использовании file_path
-- ============================================

-- Убираем ограничение NOT NULL с поля image_url
ALTER TABLE con_photos
ALTER COLUMN image_url DROP NOT NULL;

-- Проверяем результат
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'con_photos'
  AND column_name = 'image_url';

-- Готово!
SELECT '✅ Поле image_url теперь может быть NULL!' as status;
