-- ===============================================
-- Миграция: Добавление системы детальных рейтингов
-- Дата: 2025-11-21
-- ===============================================

-- Добавляем поля для 6 категорий рейтингов
ALTER TABLE cons ADD COLUMN IF NOT EXISTS rating_organization INTEGER CHECK (rating_organization >= 1 AND rating_organization <= 5);
ALTER TABLE cons ADD COLUMN IF NOT EXISTS rating_program INTEGER CHECK (rating_program >= 1 AND rating_program <= 5);
ALTER TABLE cons ADD COLUMN IF NOT EXISTS rating_atmosphere INTEGER CHECK (rating_atmosphere >= 1 AND rating_atmosphere <= 5);
ALTER TABLE cons ADD COLUMN IF NOT EXISTS rating_location INTEGER CHECK (rating_location >= 1 AND rating_location <= 5);
ALTER TABLE cons ADD COLUMN IF NOT EXISTS rating_participants INTEGER CHECK (rating_participants >= 1 AND rating_participants <= 5);
ALTER TABLE cons ADD COLUMN IF NOT EXISTS rating_food INTEGER CHECK (rating_food >= 1 AND rating_food <= 5);

-- Добавляем флаг завершения обзора
ALTER TABLE cons ADD COLUMN IF NOT EXISTS review_completed BOOLEAN DEFAULT FALSE;

-- Добавляем поле для папки с фотографиями
ALTER TABLE cons ADD COLUMN IF NOT EXISTS photos_folder TEXT;

-- Добавляем поле для логотипа/аватара
ALTER TABLE cons ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Добавляем поля для плюсов и минусов (JSONB массивы)
ALTER TABLE cons ADD COLUMN IF NOT EXISTS pros_text JSONB DEFAULT '[]'::jsonb;
ALTER TABLE cons ADD COLUMN IF NOT EXISTS cons_text JSONB DEFAULT '[]'::jsonb;

-- Комментарии к полям
COMMENT ON COLUMN cons.rating_organization IS 'Оценка организации мероприятия (1-5)';
COMMENT ON COLUMN cons.rating_program IS 'Оценка программы мероприятия (1-5)';
COMMENT ON COLUMN cons.rating_atmosphere IS 'Оценка атмосферы мероприятия (1-5)';
COMMENT ON COLUMN cons.rating_location IS 'Оценка локации мероприятия (1-5)';
COMMENT ON COLUMN cons.rating_participants IS 'Оценка участников мероприятия (1-5)';
COMMENT ON COLUMN cons.rating_food IS 'Оценка питания на мероприятии (1-5)';
COMMENT ON COLUMN cons.review_completed IS 'Флаг завершения написания обзора';
COMMENT ON COLUMN cons.photos_folder IS 'URL папки с фотографиями в S3';
COMMENT ON COLUMN cons.logo_url IS 'URL логотипа/аватара мероприятия';
COMMENT ON COLUMN cons.pros_text IS 'Массив плюсов мероприятия';
COMMENT ON COLUMN cons.cons_text IS 'Массив минусов мероприятия';

-- Создаём функцию для расчёта общего рейтинга из 6 категорий
CREATE OR REPLACE FUNCTION calculate_event_rating(
  r_organization INTEGER,
  r_program INTEGER,
  r_atmosphere INTEGER,
  r_location INTEGER,
  r_participants INTEGER,
  r_food INTEGER
) RETURNS NUMERIC AS $$
DECLARE
  total INTEGER := 0;
  count INTEGER := 0;
BEGIN
  IF r_organization IS NOT NULL THEN
    total := total + r_organization;
    count := count + 1;
  END IF;
  IF r_program IS NOT NULL THEN
    total := total + r_program;
    count := count + 1;
  END IF;
  IF r_atmosphere IS NOT NULL THEN
    total := total + r_atmosphere;
    count := count + 1;
  END IF;
  IF r_location IS NOT NULL THEN
    total := total + r_location;
    count := count + 1;
  END IF;
  IF r_participants IS NOT NULL THEN
    total := total + r_participants;
    count := count + 1;
  END IF;
  IF r_food IS NOT NULL THEN
    total := total + r_food;
    count := count + 1;
  END IF;

  IF count = 0 THEN
    RETURN NULL;
  END IF;

  RETURN ROUND(total::NUMERIC / count, 1);
END;
$$ LANGUAGE plpgsql;

-- Создаём view для мероприятий с вычисленным рейтингом
CREATE OR REPLACE VIEW cons_with_rating AS
SELECT
  *,
  calculate_event_rating(
    rating_organization,
    rating_program,
    rating_atmosphere,
    rating_location,
    rating_participants,
    rating_food
  ) AS calculated_rating
FROM cons;

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_cons_review_completed ON cons(review_completed);
CREATE INDEX IF NOT EXISTS idx_cons_event_date ON cons(event_date);
