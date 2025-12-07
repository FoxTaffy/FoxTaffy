-- ============================================
-- ДОБАВЛЕНИЕ ПОЛЯ review_completed В ТАБЛИЦУ cons
-- Необходимо для работы блокировки карточек без обзора
-- ============================================

-- Добавляем поле review_completed
ALTER TABLE cons
ADD COLUMN IF NOT EXISTS review_completed BOOLEAN DEFAULT false;

-- Комментарий к полю
COMMENT ON COLUMN cons.review_completed IS 'Отметка о том, что обзор мероприятия написан и завершён';

-- Обновляем существующие записи: если есть рейтинги или текст обзора, считаем обзор завершённым
UPDATE cons
SET review_completed = true
WHERE (
  my_rating IS NOT NULL
  OR rating_organization IS NOT NULL
  OR rating_program IS NOT NULL
  OR rating_atmosphere IS NOT NULL
  OR rating_location IS NOT NULL
  OR rating_participants IS NOT NULL
  OR rating_food IS NOT NULL
  OR (my_review IS NOT NULL AND my_review != '')
)
AND review_completed = false;

-- Проверяем результат
SELECT
  id,
  name,
  event_date,
  review_completed,
  my_rating,
  my_review IS NOT NULL as has_review_text
FROM cons
WHERE event_date < NOW()
ORDER BY event_date DESC
LIMIT 10;
