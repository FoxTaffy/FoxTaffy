-- SQL миграция для системы множественных оценок и улучшенных плюсов/минусов
-- Выполните этот скрипт в Supabase SQL Editor

-- Добавляем поля для множественных оценок
ALTER TABLE cons
ADD COLUMN IF NOT EXISTS rating_organization INTEGER CHECK (rating_organization >= 1 AND rating_organization <= 5),
ADD COLUMN IF NOT EXISTS rating_program INTEGER CHECK (rating_program >= 1 AND rating_program <= 5),
ADD COLUMN IF NOT EXISTS rating_atmosphere INTEGER CHECK (rating_atmosphere >= 1 AND rating_atmosphere <= 5),
ADD COLUMN IF NOT EXISTS rating_location INTEGER CHECK (rating_location >= 1 AND rating_location <= 5),
ADD COLUMN IF NOT EXISTS rating_participants INTEGER CHECK (rating_participants >= 1 AND rating_participants <= 5),
ADD COLUMN IF NOT EXISTS rating_food INTEGER CHECK (rating_food >= 1 AND rating_food <= 5);

-- Поле для статуса обзора
ALTER TABLE cons
ADD COLUMN IF NOT EXISTS review_completed BOOLEAN DEFAULT false;

-- Поле для URL папки фотографий в S3
ALTER TABLE cons
ADD COLUMN IF NOT EXISTS photos_folder TEXT;

-- Изменяем pros и cons_text на JSONB для хранения массивов
-- Сначала переименуем старые поля
ALTER TABLE cons RENAME COLUMN pros TO pros_old;
ALTER TABLE cons RENAME COLUMN cons_text TO cons_text_old;

-- Создаём новые поля как JSONB массивы
ALTER TABLE cons
ADD COLUMN pros JSONB DEFAULT '[]'::jsonb,
ADD COLUMN cons_text JSONB DEFAULT '[]'::jsonb;

-- Комментарии
COMMENT ON COLUMN cons.rating_organization IS 'Оценка организации (1-5)';
COMMENT ON COLUMN cons.rating_program IS 'Оценка программы (1-5)';
COMMENT ON COLUMN cons.rating_atmosphere IS 'Оценка атмосферы (1-5)';
COMMENT ON COLUMN cons.rating_location IS 'Оценка локации (1-5)';
COMMENT ON COLUMN cons.rating_participants IS 'Оценка участников (1-5)';
COMMENT ON COLUMN cons.rating_food IS 'Оценка питания (1-5)';
COMMENT ON COLUMN cons.review_completed IS 'Флаг завершённости обзора';
COMMENT ON COLUMN cons.pros IS 'Массив плюсов ["плюс1", "плюс2"]';
COMMENT ON COLUMN cons.cons_text IS 'Массив минусов ["минус1", "минус2"]';

-- Пример данных:
-- pros: ["Дружелюбная атмосфера", "Разнообразная программа"]
-- cons_text: ["Шум ночью", "Очереди в столовой"]
