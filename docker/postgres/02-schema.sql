-- =================================================================
-- FOXTAFFY.GAY — ПОЛНАЯ СХЕМА БД
-- Автогенерация из Base/bd.sql + Gallery/bd.sql
-- =================================================================
SET client_min_messages = WARNING;
SET search_path = public;

-- =================================================================
-- ЧАСТЬ 1: ГАЛЕРЕЯ (arts / gallery)
-- =================================================================

DROP VIEW IF EXISTS gallery_view CASCADE;
DROP TABLE IF EXISTS art_tags CASCADE;
DROP TABLE IF EXISTS art_fursonas CASCADE;
DROP TABLE IF EXISTS art_collaborators CASCADE;
DROP TABLE IF EXISTS arts CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS fursonas CASCADE;
DROP TABLE IF EXISTS persons CASCADE;
DROP FUNCTION IF EXISTS add_simple_art(TEXT, TEXT, TEXT, TEXT) CASCADE;

-- Художники
CREATE TABLE persons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nickname VARCHAR(255) NOT NULL UNIQUE,
    avatar_url TEXT,
    is_friend BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Персонажи
CREATE TABLE fursonas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fursonas_name_person_unique UNIQUE (person_id, name)
);

-- Теги
CREATE TABLE tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    color_hex CHAR(7) NOT NULL DEFAULT '#FF7B25',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Арты
CREATE TABLE arts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    upload_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    is_nsfw BOOLEAN NOT NULL DEFAULT false
);

-- Связи арт↔автор
CREATE TABLE art_collaborators (
    art_id UUID NOT NULL REFERENCES arts(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'artist' CHECK (role IN ('main_artist', 'artist')),
    PRIMARY KEY (art_id, person_id)
);

-- Связи арт↔персонаж
CREATE TABLE art_fursonas (
    art_id UUID NOT NULL REFERENCES arts(id) ON DELETE CASCADE,
    fursona_id UUID NOT NULL REFERENCES fursonas(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 1,
    PRIMARY KEY (art_id, fursona_id)
);

-- Связи арт↔тег
CREATE TABLE art_tags (
    art_id UUID NOT NULL REFERENCES arts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (art_id, tag_id)
);

-- RLS
ALTER TABLE persons            ENABLE ROW LEVEL SECURITY;
ALTER TABLE fursonas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags               ENABLE ROW LEVEL SECURITY;
ALTER TABLE arts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE art_collaborators  ENABLE ROW LEVEL SECURITY;
ALTER TABLE art_fursonas       ENABLE ROW LEVEL SECURITY;
ALTER TABLE art_tags           ENABLE ROW LEVEL SECURITY;

CREATE POLICY "persons_select"           ON persons           FOR SELECT USING (true);
CREATE POLICY "persons_insert"           ON persons           FOR INSERT WITH CHECK (true);
CREATE POLICY "persons_update"           ON persons           FOR UPDATE USING (true);
CREATE POLICY "persons_delete"           ON persons           FOR DELETE USING (true);

CREATE POLICY "fursonas_select"          ON fursonas          FOR SELECT USING (true);
CREATE POLICY "fursonas_insert"          ON fursonas          FOR INSERT WITH CHECK (true);
CREATE POLICY "fursonas_update"          ON fursonas          FOR UPDATE USING (true);
CREATE POLICY "fursonas_delete"          ON fursonas          FOR DELETE USING (true);

CREATE POLICY "tags_select"              ON tags              FOR SELECT USING (true);
CREATE POLICY "tags_insert"              ON tags              FOR INSERT WITH CHECK (true);
CREATE POLICY "tags_update"              ON tags              FOR UPDATE USING (true);
CREATE POLICY "tags_delete"              ON tags              FOR DELETE USING (true);

CREATE POLICY "arts_select"              ON arts              FOR SELECT USING (is_deleted = false);
CREATE POLICY "arts_insert"              ON arts              FOR INSERT WITH CHECK (true);
CREATE POLICY "arts_update"              ON arts              FOR UPDATE USING (true);
CREATE POLICY "arts_delete"              ON arts              FOR DELETE USING (true);

CREATE POLICY "art_collaborators_select" ON art_collaborators FOR SELECT USING (true);
CREATE POLICY "art_collaborators_insert" ON art_collaborators FOR INSERT WITH CHECK (true);
CREATE POLICY "art_collaborators_update" ON art_collaborators FOR UPDATE USING (true);
CREATE POLICY "art_collaborators_delete" ON art_collaborators FOR DELETE USING (true);

CREATE POLICY "art_fursonas_select"      ON art_fursonas      FOR SELECT USING (true);
CREATE POLICY "art_fursonas_insert"      ON art_fursonas      FOR INSERT WITH CHECK (true);
CREATE POLICY "art_fursonas_update"      ON art_fursonas      FOR UPDATE USING (true);
CREATE POLICY "art_fursonas_delete"      ON art_fursonas      FOR DELETE USING (true);

CREATE POLICY "art_tags_select"          ON art_tags          FOR SELECT USING (true);
CREATE POLICY "art_tags_insert"          ON art_tags          FOR INSERT WITH CHECK (true);
CREATE POLICY "art_tags_update"          ON art_tags          FOR UPDATE USING (true);
CREATE POLICY "art_tags_delete"          ON art_tags          FOR DELETE USING (true);

-- Индексы галереи
CREATE INDEX idx_fursonas_person_id        ON fursonas(person_id);
CREATE INDEX idx_art_collaborators_person  ON art_collaborators(person_id);
CREATE INDEX idx_art_fursonas_fursona      ON art_fursonas(fursona_id);
CREATE INDEX idx_art_tags_tag              ON art_tags(tag_id);
CREATE INDEX idx_arts_upload_date          ON arts(upload_date DESC);
CREATE INDEX idx_arts_nsfw                 ON arts(is_nsfw);

-- Только один главный художник на арт
CREATE UNIQUE INDEX idx_one_main_artist_per_art ON art_collaborators(art_id) WHERE role = 'main_artist';

-- Функция добавления арта
CREATE OR REPLACE FUNCTION add_simple_art(
    p_title TEXT,
    p_artist_nickname TEXT,
    p_image_url TEXT,
    p_thumbnail_url TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    artist_id UUID;
    new_art_id UUID;
BEGIN
    SELECT id INTO artist_id FROM persons WHERE nickname = p_artist_nickname;
    IF artist_id IS NULL THEN
        INSERT INTO persons (nickname) VALUES (p_artist_nickname) RETURNING id INTO artist_id;
    END IF;
    INSERT INTO arts (title, image_url, thumbnail_url)
    VALUES (p_title, p_image_url, p_thumbnail_url)
    RETURNING id INTO new_art_id;
    INSERT INTO art_collaborators (art_id, person_id, role)
    VALUES (new_art_id, artist_id, 'main_artist');
    RETURN new_art_id;
END;
$$;

-- Представление галереи
CREATE VIEW gallery_view AS
SELECT
    a.id,
    a.title,
    a.image_url,
    a.thumbnail_url,
    a.upload_date,
    a.is_nsfw,
    p.nickname  AS artist_name,
    p.avatar_url AS artist_avatar,
    p.is_friend  AS artist_is_friend,
    (
        SELECT COALESCE(json_agg(
            json_build_object('name', f.name, 'avatar', f.avatar_url)
            ORDER BY af.display_order
        ), '[]')
        FROM art_fursonas af
        JOIN fursonas f ON af.fursona_id = f.id
        WHERE af.art_id = a.id
    ) AS characters,
    (
        SELECT COALESCE(json_agg(
            json_build_object('name', t.name, 'color', t.color_hex)
        ), '[]')
        FROM art_tags at2
        JOIN tags t ON at2.tag_id = t.id
        WHERE at2.art_id = a.id
    ) AS tags
FROM arts a
JOIN art_collaborators ac ON a.id = ac.art_id AND ac.role = 'main_artist'
JOIN persons p ON ac.person_id = p.id
WHERE a.is_deleted = false;


-- =================================================================
-- ЧАСТЬ 2: МЕРОПРИЯТИЯ (cons / events)
-- =================================================================

DROP VIEW IF EXISTS events_full_stats CASCADE;
DROP TABLE IF EXISTS con_purchases CASCADE;
DROP TABLE IF EXISTS con_photos CASCADE;
DROP TABLE IF EXISTS con_features CASCADE;
DROP TABLE IF EXISTS con_links CASCADE;
DROP TABLE IF EXISTS cons CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS recalculate_total_spent() CASCADE;
DROP FUNCTION IF EXISTS get_events_overview() CASCADE;

CREATE TABLE cons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    name TEXT NOT NULL CHECK (char_length(name) >= 2),
    slug TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),
    subtitle TEXT,
    description TEXT,
    short_description TEXT,

    event_date TIMESTAMPTZ NOT NULL,
    announced_date TIMESTAMPTZ,
    registration_start TIMESTAMPTZ,
    registration_end TIMESTAMPTZ,

    location TEXT NOT NULL,
    city TEXT,
    country TEXT DEFAULT 'Россия',
    address TEXT,
    venue_url TEXT,

    banner_url TEXT,
    logo_url TEXT,
    gallery_folder TEXT,

    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    event_type TEXT DEFAULT 'convention' CHECK (event_type IN ('convention', 'meeting', 'party', 'workshop', 'market', 'other')),
    attendance_status TEXT NOT NULL DEFAULT 'planning',

    attendees_count INTEGER CHECK (attendees_count >= 0),
    expected_visitors INTEGER CHECK (expected_visitors >= 0),
    my_role TEXT,

    my_rating INTEGER CHECK (my_rating >= 1 AND my_rating <= 5),
    my_review TEXT,
    review_completed BOOLEAN DEFAULT false,

    has_dealers_den BOOLEAN DEFAULT false,
    has_art_show BOOLEAN DEFAULT false,
    has_fursuit_parade BOOLEAN DEFAULT false,
    has_competitions BOOLEAN DEFAULT false,

    entrance_fee DECIMAL(10,2) CHECK (entrance_fee >= 0),
    total_spent DECIMAL(10,2) DEFAULT 0 CHECK (total_spent >= 0),
    currency TEXT DEFAULT 'RUB',

    is_featured BOOLEAN DEFAULT false,
    is_nsfw BOOLEAN DEFAULT false,
    is_online BOOLEAN DEFAULT false,

    meta_title TEXT,
    meta_description TEXT,
    og_image TEXT,
    official_website TEXT,
    tickets_url TEXT,
    extra_data JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE con_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    con_id UUID NOT NULL REFERENCES cons(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    link_type TEXT NOT NULL CHECK (link_type IN (
        'website','telegram','vk','discord','twitter','youtube','twitch',
        'instagram','facebook','furaffinity','tickets','stream','other'
    )),
    title TEXT NOT NULL,
    url TEXT NOT NULL CHECK (url ~ '^https?://'),
    description TEXT,
    icon_class TEXT,
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    click_count INTEGER DEFAULT 0
);

CREATE TABLE con_features (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    con_id UUID NOT NULL REFERENCES cons(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    feature_type TEXT NOT NULL CHECK (feature_type IN (
        'activity','service','amenity','guest','workshop','entertainment','facility','special'
    )),
    title TEXT NOT NULL,
    description TEXT,
    icon_class TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    location_details TEXT,
    requirements TEXT,
    max_participants INTEGER,
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_free BOOLEAN DEFAULT true,
    price DECIMAL(10,2) CHECK (price >= 0)
);

CREATE TABLE con_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    con_id UUID NOT NULL REFERENCES cons(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    image_url TEXT,
    thumbnail_url TEXT,
    caption TEXT,
    alt_text TEXT,
    photo_type TEXT DEFAULT 'general' CHECK (photo_type IN (
        'general','fursuit','cosplay','dealers','art','venue','badge',
        'purchase','food','stage','workshop','behind_scenes','group','selfie'
    )),
    is_featured BOOLEAN DEFAULT false,
    is_avatar BOOLEAN DEFAULT false,
    taken_at TIMESTAMPTZ,
    taken_by TEXT,
    camera_info TEXT,
    width INTEGER,
    height INTEGER,
    file_size INTEGER,
    format TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    display_order INTEGER DEFAULT 0,
    copyright_holder TEXT,
    license TEXT DEFAULT 'personal_use',
    exif_data JSONB DEFAULT '{}'::jsonb,

    -- Поля метаданных (add_photo_metadata_columns.sql)
    storage_path TEXT,
    original_filename TEXT,
    mime_type TEXT,

    -- Поле папки (add_photos_folder.sql)
    folder TEXT
);

CREATE TABLE con_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    con_id UUID NOT NULL REFERENCES cons(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    item_name TEXT NOT NULL,
    description TEXT,
    brand TEXT,
    model TEXT,

    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    currency TEXT DEFAULT 'RUB',
    original_price DECIMAL(10,2),
    discount_percent INTEGER CHECK (discount_percent >= 0 AND discount_percent <= 100),

    vendor_name TEXT,
    vendor_type TEXT CHECK (vendor_type IN ('artist','store','official','individual','unknown')),
    booth_number TEXT,

    category TEXT CHECK (category IN (
        'art','badge','fursuit','accessory','plushie','figurine','book',
        'sticker','pin','clothing','jewelry','keychain','poster','food',
        'ticket','merch','craft','tech','other'
    )),

    image_url TEXT,
    gallery_urls TEXT[],
    receipt_photo TEXT,

    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    size TEXT,
    color TEXT,
    material TEXT,
    condition TEXT DEFAULT 'new' CHECK (condition IN ('new','used','vintage','damaged')),

    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    delivery_date TIMESTAMPTZ,

    status TEXT DEFAULT 'completed' CHECK (status IN ('completed','pending','cancelled','refunded')),

    is_commission BOOLEAN DEFAULT false,
    is_limited_edition BOOLEAN DEFAULT false,
    is_signed BOOLEAN DEFAULT false,
    is_gift BOOLEAN DEFAULT false,

    tags TEXT[],
    extra_data JSONB DEFAULT '{}'::jsonb
);

-- RLS для мероприятий
ALTER TABLE cons          ENABLE ROW LEVEL SECURITY;
ALTER TABLE con_links     ENABLE ROW LEVEL SECURITY;
ALTER TABLE con_features  ENABLE ROW LEVEL SECURITY;
ALTER TABLE con_photos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE con_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cons_select"          ON cons          FOR SELECT USING (true);
CREATE POLICY "cons_insert"          ON cons          FOR INSERT WITH CHECK (true);
CREATE POLICY "cons_update"          ON cons          FOR UPDATE USING (true);
CREATE POLICY "cons_delete"          ON cons          FOR DELETE USING (true);

CREATE POLICY "con_links_select"     ON con_links     FOR SELECT USING (true);
CREATE POLICY "con_links_insert"     ON con_links     FOR INSERT WITH CHECK (true);
CREATE POLICY "con_links_update"     ON con_links     FOR UPDATE USING (true);
CREATE POLICY "con_links_delete"     ON con_links     FOR DELETE USING (true);

CREATE POLICY "con_features_select"  ON con_features  FOR SELECT USING (true);
CREATE POLICY "con_features_insert"  ON con_features  FOR INSERT WITH CHECK (true);
CREATE POLICY "con_features_update"  ON con_features  FOR UPDATE USING (true);
CREATE POLICY "con_features_delete"  ON con_features  FOR DELETE USING (true);

CREATE POLICY "con_photos_select"    ON con_photos    FOR SELECT USING (true);
CREATE POLICY "con_photos_insert"    ON con_photos    FOR INSERT WITH CHECK (true);
CREATE POLICY "con_photos_update"    ON con_photos    FOR UPDATE USING (true);
CREATE POLICY "con_photos_delete"    ON con_photos    FOR DELETE USING (true);

CREATE POLICY "con_purchases_select" ON con_purchases FOR SELECT USING (true);
CREATE POLICY "con_purchases_insert" ON con_purchases FOR INSERT WITH CHECK (true);
CREATE POLICY "con_purchases_update" ON con_purchases FOR UPDATE USING (true);
CREATE POLICY "con_purchases_delete" ON con_purchases FOR DELETE USING (true);

-- Индексы для мероприятий
CREATE INDEX idx_cons_event_date       ON cons(event_date DESC);
CREATE INDEX idx_cons_slug             ON cons(slug);
CREATE INDEX idx_cons_status           ON cons(status);
CREATE INDEX idx_cons_attendance       ON cons(attendance_status);
CREATE INDEX idx_cons_featured         ON cons(is_featured) WHERE is_featured = true;
CREATE INDEX idx_cons_city             ON cons(city);
CREATE INDEX idx_cons_search ON cons USING gin(
    to_tsvector('russian', name || ' ' || COALESCE(subtitle,'') || ' ' || COALESCE(description,'') || ' ' || location)
);
CREATE INDEX idx_con_links_con_id      ON con_links(con_id);
CREATE INDEX idx_con_features_con_id   ON con_features(con_id);
CREATE INDEX idx_con_photos_con_id     ON con_photos(con_id);
CREATE INDEX idx_con_photos_folder     ON con_photos(folder);
CREATE INDEX idx_con_purchases_con_id  ON con_purchases(con_id);

-- Функция обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_cons_updated_at
    BEFORE UPDATE ON cons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Функция пересчёта total_spent
CREATE OR REPLACE FUNCTION recalculate_total_spent()
RETURNS TRIGGER AS $$
BEGIN
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
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER recalc_spent_on_insert AFTER INSERT ON con_purchases FOR EACH ROW EXECUTE FUNCTION recalculate_total_spent();
CREATE TRIGGER recalc_spent_on_update AFTER UPDATE ON con_purchases FOR EACH ROW EXECUTE FUNCTION recalculate_total_spent();
CREATE TRIGGER recalc_spent_on_delete AFTER DELETE ON con_purchases FOR EACH ROW EXECUTE FUNCTION recalculate_total_spent();

-- Представление полной статистики мероприятий
CREATE OR REPLACE VIEW events_full_stats AS
SELECT
    c.*,
    COALESCE(ph.photos_count, 0) AS photos_count,
    COALESCE(ph.featured_photos, 0) AS featured_photos_count,
    COALESCE(pu.purchases_count, 0) AS purchases_count,
    COALESCE(pu.total_items, 0) AS total_items_purchased,
    COALESCE(li.links_count, 0) AS links_count,
    COALESCE(fe.features_count, 0) AS features_count,
    CASE
        WHEN c.event_date > NOW() THEN 'upcoming'
        WHEN c.event_date <= NOW() AND c.event_date > NOW() - INTERVAL '1 day' THEN 'ongoing'
        ELSE 'completed'
    END AS computed_status,
    EXTRACT(epoch FROM (c.event_date - NOW())) / 86400 AS days_difference
FROM cons c
LEFT JOIN (
    SELECT con_id, COUNT(*) AS photos_count, COUNT(*) FILTER (WHERE is_featured) AS featured_photos
    FROM con_photos GROUP BY con_id
) ph ON c.id = ph.con_id
LEFT JOIN (
    SELECT con_id, COUNT(*) AS purchases_count, SUM(quantity) AS total_items
    FROM con_purchases WHERE status = 'completed' GROUP BY con_id
) pu ON c.id = pu.con_id
LEFT JOIN (
    SELECT con_id, COUNT(*) AS links_count FROM con_links WHERE is_active GROUP BY con_id
) li ON c.id = li.con_id
LEFT JOIN (
    SELECT con_id, COUNT(*) AS features_count FROM con_features GROUP BY con_id
) fe ON c.id = fe.con_id;


-- =================================================================
-- ЧАСТЬ 3: ГРАНТЫ ДЛЯ POSTGREST
-- =================================================================

-- anon — только чтение
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON gallery_view TO anon;
GRANT SELECT ON events_full_stats TO anon;

-- service_role — полный доступ
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON FUNCTION add_simple_art(TEXT, TEXT, TEXT, TEXT) TO service_role;

-- authenticator наследует оба
GRANT anon TO authenticator;
GRANT service_role TO authenticator;

-- =================================================================
SELECT '✅ FoxTaffy DB Schema — OK' AS status;
