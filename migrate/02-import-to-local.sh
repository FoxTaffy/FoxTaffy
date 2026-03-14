#!/usr/bin/env bash
# ================================================
# FOXTAFFY MIGRATION — Шаг 2: Импорт в локальную БД
# ================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DUMP_DIR="$SCRIPT_DIR/dumps"

# Параметры локальной БД (собственный foxtaffy-db контейнер)
LOCAL_DB_HOST="localhost"
LOCAL_DB_PORT="5433"
LOCAL_DB_USER="foxtaffy"
LOCAL_DB_PASSWORD="2O7JUsEbAKxbn6hD8g6HfJ6itC_16QXj"
LOCAL_DB_NAME="foxtaffy"

export PGPASSWORD="$LOCAL_DB_PASSWORD"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🦊 FoxTaffy Migration — Импорт в foxtaffy-db"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📡 Local: $LOCAL_DB_USER@$LOCAL_DB_HOST:$LOCAL_DB_PORT/$LOCAL_DB_NAME"
echo ""
echo "⚠️  Убедись что контейнеры запущены: docker compose up -d"
echo ""

PG_CMD="psql -h $LOCAL_DB_HOST -p $LOCAL_DB_PORT -U $LOCAL_DB_USER -d $LOCAL_DB_NAME"

# ── Применяем схему ──────────────────────────────
if [[ -f "$DUMP_DIR/schema.sql" ]]; then
    echo "📋 Применяем схему..."
    # Убираем Supabase-специфичные расширения из дампа
    grep -v "^CREATE EXTENSION\|^COMMENT ON EXTENSION\|^ALTER EXTENSION\|supabase_\|pg_net\|moddatetime\|pgsodium\|vault\|extensions\.\|graphql" \
        "$DUMP_DIR/schema.sql" > /tmp/foxtaffy_schema_clean.sql || true
    
    $PG_CMD -f /tmp/foxtaffy_schema_clean.sql 2>&1 | grep -v "^--\|^SET\|already exists\|NOTICE" || true
    echo "✅ Схема применена"
else
    echo "❌ Файл схемы не найден: $DUMP_DIR/schema.sql"
    echo "   Запусти сначала: ./01-export-supabase.sh"
    exit 1
fi

# ── Гарантируем права для ролей PostgREST ────────
echo ""
echo "🔑 Устанавливаем права для ролей..."
$PG_CMD << 'SQL'
GRANT USAGE ON SCHEMA public TO anon, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, service_role;
SQL
echo "✅ Права установлены"

# ── Импортируем данные ───────────────────────────
echo ""
echo "📦 Импорт данных таблиц..."

TABLES="persons fursonas tags cons con_features con_links con_photos con_purchases arts art_collaborators art_fursonas art_tags"

for TABLE in $TABLES; do
    DATA_FILE="$DUMP_DIR/data_${TABLE}.sql"
    if [[ -f "$DATA_FILE" ]]; then
        echo "  → $TABLE"
        $PG_CMD -f "$DATA_FILE" 2>&1 | grep -v "^--\|^SET\|NOTICE" || true
    else
        echo "  ⚠️  Нет данных для $TABLE (пропуск)"
    fi
done

# ── Обновляем sequences ──────────────────────────
echo ""
echo "🔢 Обновляем sequences..."
$PG_CMD << 'SQL'
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT schemaname, tablename FROM pg_tables WHERE schemaname='public' LOOP
        BEGIN
            EXECUTE format('SELECT setval(pg_get_serial_sequence(%L, %L), COALESCE(MAX(id), 0) + 1, false) FROM %I.%I',
                r.tablename, 'id', r.schemaname, r.tablename);
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
END $$;
SQL
echo "✅ Sequences обновлены"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Импорт БД завершён! Теперь запусти:"
echo "   ./03-migrate-storage.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
