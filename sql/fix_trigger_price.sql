-- Исправление триггера recalculate_total_spent для работы без quantity

CREATE OR REPLACE FUNCTION recalculate_total_spent()
RETURNS TRIGGER AS $$
BEGIN
    -- Пересчитываем общую сумму покупок для мероприятия
    UPDATE cons
    SET total_spent = (
        SELECT COALESCE(SUM(CAST(price AS numeric)), 0)
        FROM con_purchases
        WHERE con_id = COALESCE(NEW.con_id, OLD.con_id)
    )
    WHERE id = COALESCE(NEW.con_id, OLD.con_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Триггер автоматически обновится, т.к. мы заменили функцию

SELECT '✅ Триггер recalculate_total_spent обновлен!' as status;
SELECT 'Теперь просто суммируются цены без умножения на quantity' as info;
