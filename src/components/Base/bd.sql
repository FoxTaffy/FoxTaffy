-- ===============================================
-- 🎪 FOXTAFFY.FUN - ПОЛНАЯ СХЕМА БД МЕРОПРИЯТИЙ
-- Создание с нуля всех таблиц и связей
-- ===============================================

-- Удаляем существующие таблицы если есть (осторожно!)
-- DROP TABLE IF EXISTS con_purchases CASCADE;
-- DROP TABLE IF EXISTS con_photos CASCADE;
-- DROP TABLE IF EXISTS con_features CASCADE;
-- DROP TABLE IF EXISTS con_links CASCADE;
-- DROP TABLE IF EXISTS cons CASCADE;

-- ===============================================
-- 📅 ОСНОВНАЯ ТАБЛИЦА МЕРОПРИЯТИЙ
-- ===============================================

CREATE TABLE cons (
  -- Системные поля
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Основная информация
  name TEXT NOT NULL CHECK (char_length(name) >= 2),
  slug TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),
  subtitle TEXT,
  description TEXT,
  short_description TEXT,
  
  -- Даты и время
  event_date TIMESTAMPTZ NOT NULL,
  announced_date TIMESTAMPTZ,
  registration_start TIMESTAMPTZ,
  registration_end TIMESTAMPTZ,
  
  -- Локация
  location TEXT NOT NULL,
  city TEXT,
  country TEXT DEFAULT 'Россия',
  address TEXT,
  venue_url TEXT,
  
  -- Медиа контент
  banner_url TEXT,
  logo_url TEXT,
  gallery_folder TEXT,
  
  -- Статусы и типы
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  event_type TEXT DEFAULT 'convention' CHECK (event_type IN ('convention', 'meeting', 'party', 'workshop', 'market', 'other')),
  attendance_status TEXT DEFAULT 'planning' CHECK (attendance_status IN ('planning', 'registered', 'attended', 'missed', 'cancelled')),
  
  -- Дополнительная информация
  attendees_count INTEGER CHECK (attendees_count >= 0),
  expected_visitors INTEGER CHECK (expected_visitors >= 0),
  my_role TEXT,
  
  -- Рейтинг и отзыв
  my_rating INTEGER CHECK (my_rating >= 1 AND my_rating <= 5),
  my_review TEXT,
  
  -- Особенности
  has_dealers_den BOOLEAN DEFAULT false,
  has_art_show BOOLEAN DEFAULT false,
  has_fursuit_parade BOOLEAN DEFAULT false,
  has_competitions BOOLEAN DEFAULT false,
  
  -- Финансы
  entrance_fee DECIMAL(10,2) CHECK (entrance_fee >= 0),
  total_spent DECIMAL(10,2) DEFAULT 0 CHECK (total_spent >= 0),
  currency TEXT DEFAULT 'RUB',
  
  -- Флаги
  is_featured BOOLEAN DEFAULT false,
  is_nsfw BOOLEAN DEFAULT false,
  is_online BOOLEAN DEFAULT false,
  
  -- SEO и метаданные
  meta_title TEXT,
  meta_description TEXT,
  og_image TEXT,
  
  -- Контакты и ссылки
  official_website TEXT,
  tickets_url TEXT,
  
  -- Дополнительные данные в JSON
  extra_data JSONB DEFAULT '{}'::jsonb
);

-- ===============================================
-- 🔗 ТАБЛИЦА ССЫЛОК НА РЕСУРСЫ
-- ===============================================

CREATE TABLE con_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  con_id UUID NOT NULL REFERENCES cons(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Тип ссылки
  link_type TEXT NOT NULL CHECK (link_type IN (
    'website',     -- Официальный сайт
    'telegram',    -- Telegram канал/группа
    'vk',          -- ВКонтакте
    'discord',     -- Discord сервер
    'twitter',     -- Twitter
    'youtube',     -- YouTube канал
    'twitch',      -- Twitch канал
    'instagram',   -- Instagram
    'facebook',    -- Facebook
    'furaffinity', -- FurAffinity
    'tickets',     -- Билеты
    'stream',      -- Прямая трансляция
    'other'        -- Другое
  )),
  
  -- Данные ссылки
  title TEXT NOT NULL,
  url TEXT NOT NULL CHECK (url ~ '^https?://'),
  description TEXT,
  icon_class TEXT, -- CSS класс для иконки (FontAwesome)
  
  -- Метаданные
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false, -- Главная ссылка типа
  is_active BOOLEAN DEFAULT true,
  
  -- Статистика (опционально)
  click_count INTEGER DEFAULT 0
);

-- ===============================================
-- ⭐ ТАБЛИЦА ОСОБЕННОСТЕЙ МЕРОПРИЯТИЙ
-- ===============================================

CREATE TABLE con_features (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  con_id UUID NOT NULL REFERENCES cons(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Тип особенности
  feature_type TEXT NOT NULL CHECK (feature_type IN (
    'activity',    -- Активность (игры, конкурсы, дефиле)
    'service',     -- Услуга (dealers den, art show)
    'amenity',     -- Удобство (Wi-Fi, парковка, питание)
    'guest',       -- Гости (художники, актёры озвучки)
    'workshop',    -- Мастер-классы
    'entertainment', -- Развлечения
    'facility',    -- Помещения и локации
    'special'      -- Особые события
  )),
  
  -- Данные особенности
  title TEXT NOT NULL,
  description TEXT,
  icon_class TEXT, -- CSS класс для иконки
  
  -- Дополнительная информация
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  location_details TEXT, -- Где именно проходит
  requirements TEXT,     -- Требования для участия
  max_participants INTEGER,
  
  -- Метаданные
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_free BOOLEAN DEFAULT true,
  price DECIMAL(10,2) CHECK (price >= 0)
);

-- ===============================================
-- 📸 ТАБЛИЦА ФОТОГРАФИЙ МЕРОПРИЯТИЙ
-- ===============================================

CREATE TABLE con_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  con_id UUID NOT NULL REFERENCES cons(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- URL изображений
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  alt_text TEXT, -- Для доступности
  
  -- Тип фотографии
  photo_type TEXT DEFAULT 'general' CHECK (photo_type IN (
    'general',     -- Общие фото
    'fursuit',     -- Фурсьюты
    'cosplay',     -- Косплей
    'dealers',     -- Торговая зона
    'art',         -- Арт-выставка
    'venue',       -- Площадка
    'badge',       -- Бейджи/значки
    'purchase',    -- Покупки
    'food',        -- Еда
    'stage',       -- Сцена и выступления
    'workshop',    -- Мастер-классы
    'behind_scenes', -- За кулисами
    'group',       -- Групповые фото
    'selfie'       -- Селфи
  )),
  
  -- Метаданные фото
  is_featured BOOLEAN DEFAULT false,
  is_avatar BOOLEAN DEFAULT false, -- Главное фото события
  taken_at TIMESTAMPTZ,
  taken_by TEXT, -- Кто сделал фото
  camera_info TEXT, -- Информация о камере
  
  -- Параметры изображения
  width INTEGER,
  height INTEGER,
  file_size INTEGER, -- В байтах
  format TEXT, -- jpeg, png, webp
  
  -- Геолокация (опционально)
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Порядок отображения
  display_order INTEGER DEFAULT 0,
  
  -- Права и лицензия
  copyright_holder TEXT,
  license TEXT DEFAULT 'personal_use',
  
  -- Дополнительные данные
  exif_data JSONB DEFAULT '{}'::jsonb
);

-- ===============================================
-- 🛒 ТАБЛИЦА ПОКУПОК НА МЕРОПРИЯТИЯХ
-- ===============================================

CREATE TABLE con_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  con_id UUID NOT NULL REFERENCES cons(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Информация о товаре
  item_name TEXT NOT NULL,
  description TEXT,
  brand TEXT, -- Бренд/производитель
  model TEXT, -- Модель товара
  
  -- Цена и валюта
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  currency TEXT DEFAULT 'RUB',
  original_price DECIMAL(10,2), -- Первоначальная цена (если была скидка)
  discount_percent INTEGER CHECK (discount_percent >= 0 AND discount_percent <= 100),
  
  -- Продавец и место покупки
  vendor_name TEXT,
  vendor_type TEXT CHECK (vendor_type IN ('artist', 'store', 'official', 'individual', 'unknown')),
  booth_number TEXT, -- Номер стенда
  
  -- Категория товара
  category TEXT CHECK (category IN (
    'art',         -- Арт (рисунки, принты)
    'badge',       -- Бейдж/значок
    'fursuit',     -- Фурсьют или части
    'accessory',   -- Аксессуары (уши, хвосты)
    'plushie',     -- Плюшевые игрушки
    'figurine',    -- Фигурки
    'book',        -- Книги, комиксы
    'sticker',     -- Наклейки
    'pin',         -- Значки
    'clothing',    -- Одежда
    'jewelry',     -- Украшения
    'keychain',    -- Брелоки
    'poster',      -- Постеры
    'food',        -- Еда/напитки
    'ticket',      -- Билеты на мероприятия
    'merch',       -- Официальный мерчандайз
    'craft',       -- Рукоделие
    'tech',        -- Технические товары
    'other'        -- Другое
  )),
  
  -- Изображения товара
  image_url TEXT,
  gallery_urls TEXT[], -- Массив дополнительных фото
  receipt_photo TEXT,  -- Фото чека
  
  -- Детали покупки
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  size TEXT,           -- Размер (для одежды, аксессуаров)
  color TEXT,          -- Цвет
  material TEXT,       -- Материал
  condition TEXT DEFAULT 'new' CHECK (condition IN ('new', 'used', 'vintage', 'damaged')),
  
  -- Оценка покупки
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  
  -- Временные метки
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  delivery_date TIMESTAMPTZ,
  
  -- Статус покупки
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled', 'refunded')),
  
  -- Дополнительная информация
  is_commission BOOLEAN DEFAULT false, -- Заказная работа
  is_limited_edition BOOLEAN DEFAULT false,
  is_signed BOOLEAN DEFAULT false,     -- С автографом
  is_gift BOOLEAN DEFAULT false,       -- Подарок
  
  -- Теги для поиска
  tags TEXT[],
  
  -- Дополнительные данные
  extra_data JSONB DEFAULT '{}'::jsonb
);

-- ===============================================
-- 🔧 СЛУЖЕБНЫЕ ФУНКЦИИ
-- ===============================================

-- Функция автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Функция пересчёта total_spent для мероприятия
CREATE OR REPLACE FUNCTION recalculate_total_spent()
RETURNS TRIGGER AS $$
BEGIN
    -- Пересчитываем общую сумму покупок для мероприятия
    UPDATE cons 
    SET total_spent = (
        SELECT COALESCE(SUM(price * quantity), 0)
        FROM con_purchases 
        WHERE con_id = COALESCE(NEW.con_id, OLD.con_id)
        AND status = 'completed'
    )
    WHERE id = COALESCE(NEW.con_id, OLD.con_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- ===============================================
-- ⚡ ТРИГГЕРЫ
-- ===============================================

-- Триггер обновления времени модификации для cons
CREATE TRIGGER update_cons_updated_at 
    BEFORE UPDATE ON cons
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Триггеры пересчёта total_spent при изменении покупок
CREATE TRIGGER recalc_spent_on_insert
    AFTER INSERT ON con_purchases
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_total_spent();

CREATE TRIGGER recalc_spent_on_update
    AFTER UPDATE ON con_purchases
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_total_spent();

CREATE TRIGGER recalc_spent_on_delete
    AFTER DELETE ON con_purchases
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_total_spent();

-- ===============================================
-- 📊 ПРЕДСТАВЛЕНИЯ (VIEWS)
-- ===============================================

-- Представление с полной статистикой мероприятий
CREATE OR REPLACE VIEW events_full_stats AS
SELECT 
    c.*,
    
    -- Счётчики связанных данных
    COALESCE(photo_stats.photos_count, 0) as photos_count,
    COALESCE(photo_stats.featured_photos, 0) as featured_photos_count,
    COALESCE(purchase_stats.purchases_count, 0) as purchases_count,
    COALESCE(purchase_stats.total_items, 0) as total_items_purchased,
    COALESCE(link_stats.links_count, 0) as links_count,
    COALESCE(feature_stats.features_count, 0) as features_count,
    
    -- Вычисляемый статус
    CASE 
        WHEN c.event_date > NOW() THEN 'upcoming'
        WHEN c.event_date <= NOW() AND c.event_date > NOW() - INTERVAL '1 day' THEN 'ongoing'
        ELSE 'completed'
    END as computed_status,
    
    -- Дни до/после события
    EXTRACT(epoch FROM (c.event_date - NOW())) / 86400 as days_difference,
    
    -- Прогресс события (от анонса до проведения)
    CASE 
        WHEN c.event_date > NOW() AND c.announced_date IS NOT NULL THEN
            GREATEST(0, LEAST(100, 
                (EXTRACT(epoch FROM (NOW() - c.announced_date)) / 
                 EXTRACT(epoch FROM (c.event_date - c.announced_date))) * 100
            ))
        ELSE 100
    END as progress_percent

FROM cons c

-- Статистика фотографий
LEFT JOIN (
    SELECT 
        con_id, 
        COUNT(*) as photos_count,
        COUNT(*) FILTER (WHERE is_featured = true) as featured_photos
    FROM con_photos 
    GROUP BY con_id
) photo_stats ON c.id = photo_stats.con_id

-- Статистика покупок
LEFT JOIN (
    SELECT 
        con_id, 
        COUNT(*) as purchases_count,
        SUM(quantity) as total_items
    FROM con_purchases 
    WHERE status = 'completed'
    GROUP BY con_id
) purchase_stats ON c.id = purchase_stats.con_id

-- Статистика ссылок
LEFT JOIN (
    SELECT con_id, COUNT(*) as links_count
    FROM con_links 
    WHERE is_active = true
    GROUP BY con_id
) link_stats ON c.id = link_stats.con_id

-- Статистика особенностей
LEFT JOIN (
    SELECT con_id, COUNT(*) as features_count
    FROM con_features 
    GROUP BY con_id
) feature_stats ON c.id = feature_stats.con_id;

-- ===============================================
-- 🔍 ИНДЕКСЫ ДЛЯ ПРОИЗВОДИТЕЛЬНОСТИ
-- ===============================================

-- Основные индексы для cons
CREATE INDEX idx_cons_event_date ON cons(event_date DESC);
CREATE INDEX idx_cons_slug ON cons(slug);
CREATE INDEX idx_cons_status ON cons(status);
CREATE INDEX idx_cons_event_type ON cons(event_type);
CREATE INDEX idx_cons_attendance_status ON cons(attendance_status);
CREATE INDEX idx_cons_is_featured ON cons(is_featured) WHERE is_featured = true;
CREATE INDEX idx_cons_city ON cons(city);
CREATE INDEX idx_cons_created_at ON cons(created_at DESC);

-- Полнотекстовый поиск
CREATE INDEX idx_cons_search ON cons USING gin(
    to_tsvector('russian', name || ' ' || COALESCE(subtitle, '') || ' ' || COALESCE(description, '') || ' ' || location)
);

-- Индексы для связанных таблиц
CREATE INDEX idx_con_links_con_id ON con_links(con_id);
CREATE INDEX idx_con_links_type ON con_links(link_type);
CREATE INDEX idx_con_links_active ON con_links(is_active) WHERE is_active = true;

CREATE INDEX idx_con_features_con_id ON con_features(con_id);
CREATE INDEX idx_con_features_type ON con_features(feature_type);
CREATE INDEX idx_con_features_featured ON con_features(is_featured) WHERE is_featured = true;

CREATE INDEX idx_con_photos_con_id ON con_photos(con_id);
CREATE INDEX idx_con_photos_type ON con_photos(photo_type);
CREATE INDEX idx_con_photos_featured ON con_photos(is_featured) WHERE is_featured = true;
CREATE INDEX idx_con_photos_taken_at ON con_photos(taken_at DESC);

CREATE INDEX idx_con_purchases_con_id ON con_purchases(con_id);
CREATE INDEX idx_con_purchases_category ON con_purchases(category);
CREATE INDEX idx_con_purchases_purchased_at ON con_purchases(purchased_at DESC);
CREATE INDEX idx_con_purchases_vendor ON con_purchases(vendor_name);
CREATE INDEX idx_con_purchases_status ON con_purchases(status);

-- ===============================================
-- 🔒 ROW LEVEL SECURITY (RLS)
-- ===============================================

-- Включаем RLS для всех таблиц
ALTER TABLE cons ENABLE ROW LEVEL SECURITY;
ALTER TABLE con_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE con_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE con_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE con_purchases ENABLE ROW LEVEL SECURITY;

-- Политики для публичного чтения
CREATE POLICY "Public read access" ON cons FOR SELECT USING (true);
CREATE POLICY "Public read access" ON con_links FOR SELECT USING (true);
CREATE POLICY "Public read access" ON con_features FOR SELECT USING (true);
CREATE POLICY "Public read access" ON con_photos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON con_purchases FOR SELECT USING (true);

-- Политики для администратора (нужно будет настроить auth)
-- CREATE POLICY "Admin full access" ON cons FOR ALL USING (auth.role() = 'admin');
-- CREATE POLICY "Admin full access" ON con_links FOR ALL USING (auth.role() = 'admin');
-- и т.д.

-- ===============================================
-- 📝 ПРИМЕРЫ ДАННЫХ ДЛЯ ТЕСТИРОВАНИЯ
-- ===============================================

-- Вставляем тестовое мероприятие
INSERT INTO cons (
    name, slug, subtitle, description,
    event_date, announced_date,
    location, city, country,
    event_type, attendance_status,
    attendees_count, expected_visitors,
    has_dealers_den, has_art_show, has_fursuit_parade,
    is_featured, entrance_fee,
    official_website, meta_title
) VALUES (
    'Any Furry Fest VII',
    'any-furry-fest-7',
    'Крупнейший российский фурри-фестиваль 2025',
    'Седьмой по счёту крупнейший российский фурри-фестиваль, объединяющий фурри со всей России и стран СНГ. Три дня незабываемых впечатлений, новых знакомств и творчества.',
    '2025-08-15 10:00:00+03',
    '2025-04-01 12:00:00+03',
    'Парк-отель "Воздвиженское"',
    'Москва',
    'Россия',
    'convention',
    'planning',
    450,
    500,
    true,
    true,
    true,
    true,
    3500.00,
    'https://anyfurryfest.ru',
    'Any Furry Fest VII - Самый большой фурри-фестиваль России'
) ON CONFLICT (slug) DO NOTHING;

-- Получаем ID вставленного события для примеров
DO $$
DECLARE
    event_id UUID;
BEGIN
    SELECT id INTO event_id FROM cons WHERE slug = 'any-furry-fest-7';
    
    -- Добавляем ссылки
    INSERT INTO con_links (con_id, link_type, title, url, icon_class) VALUES
    (event_id, 'telegram', 'Telegram канал', 'https://t.me/anyfurryfest', 'fab fa-telegram'),
    (event_id, 'vk', 'Группа ВКонтакте', 'https://vk.com/anyfurryfest', 'fab fa-vk'),
    (event_id, 'tickets', 'Купить билеты', 'https://anyfurryfest.ru/tickets', 'fas fa-ticket-alt');
    
    -- Добавляем особенности
    INSERT INTO con_features (con_id, feature_type, title, description, icon_class) VALUES
    (event_id, 'activity', 'Фурсьют парад', 'Торжественное шествие в фурсьютах по территории отеля', 'fas fa-mask'),
    (event_id, 'service', 'Dealers Den', 'Торговая зона с работами независимых художников', 'fas fa-store'),
    (event_id, 'activity', 'Конкурсы и игры', 'Разнообразные конкурсы с призами', 'fas fa-trophy'),
    (event_id, 'guest', 'Приглашённые артисты', 'Известные художники и создатели контента', 'fas fa-star');
    
END $$;

-- ===============================================
-- 🧪 ФУНКЦИИ ДЛЯ ТЕСТИРОВАНИЯ
-- ===============================================

-- Функция получения статистики по всем мероприятиям
CREATE OR REPLACE FUNCTION get_events_overview()
RETURNS TABLE (
    total_events INTEGER,
    upcoming_events INTEGER,
    completed_events INTEGER,
    total_photos INTEGER,
    total_purchases INTEGER,
    total_spent NUMERIC,
    avg_rating NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_events,
        COUNT(*) FILTER (WHERE event_date > NOW())::INTEGER as upcoming_events,
        COUNT(*) FILTER (WHERE event_date <= NOW())::INTEGER as completed_events,
        COALESCE(SUM(photos_count), 0)::INTEGER as total_photos,
        COALESCE(SUM(purchases_count), 0)::INTEGER as total_purchases,
        COALESCE(SUM(total_spent), 0) as total_spent,
        ROUND(AVG(my_rating), 2) as avg_rating
    FROM events_full_stats;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- ✅ ПРОВЕРКА СОЗДАНИЯ ТАБЛИЦ
-- ===============================================

-- Проверяем что все таблицы созданы
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN ('cons', 'con_links', 'con_features', 'con_photos', 'con_purchases')
ORDER BY tablename;

-- Проверяем индексы
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename LIKE 'con%'
ORDER BY tablename, indexname;

-- Проверяем функции
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN ('update_updated_at_column', 'recalculate_total_spent', 'get_events_overview')
ORDER BY routine_name;

-- ===============================================
-- 🎉 СХЕМА ГОТОВА К ИСПОЛЬЗОВАНИЮ!
-- ===============================================

SELECT 'FoxTaffy Events Database Schema created successfully! 🎪✨' as status;