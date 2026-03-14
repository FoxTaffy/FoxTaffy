#!/usr/bin/env bash
# ================================================
# FOXTAFFY MIGRATION — Шаг 1: Экспорт данных из Supabase
# ================================================
# ПЕРЕД ЗАПУСКОМ: заполни файл migrate/supabase-creds.sh
# ================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/supabase-creds.sh"

DUMP_DIR="$SCRIPT_DIR/dumps"
mkdir -p "$DUMP_DIR"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🦊 FoxTaffy Migration — Экспорт из Supabase"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📡 Supabase Host: $SUPABASE_DB_HOST"
echo ""

# ── Дамп схемы (без данных) ──────────────────────
echo "📋 Экспорт схемы БД..."
PGPASSWORD="$SUPABASE_DB_PASSWORD" pg_dump \
  --host="$SUPABASE_DB_HOST" \
  --port="${SUPABASE_DB_PORT:-5432}" \
  --username="$SUPABASE_DB_USER" \
  --dbname="$SUPABASE_DB_NAME" \
  --schema=public \
  --schema-only \
  --no-owner \
  --no-acl \
  --exclude-schema=auth \
  --exclude-schema=storage \
  --exclude-schema=realtime \
  --exclude-schema=extensions \
  --exclude-schema=graphql_public \
  --exclude-schema=vault \
  --exclude-schema=pgsodium \
  -f "$DUMP_DIR/schema.sql" \
  2>&1 | grep -v "WARNING\|NOTICE" || true

echo "✅ Схема сохранена: $DUMP_DIR/schema.sql"

# ── Дамп данных ──────────────────────────────────
echo ""
echo "📦 Экспорт данных таблиц..."

TABLES="cons con_photos con_features con_links con_purchases arts art_collaborators art_fursonas art_tags fursonas persons tags"

for TABLE in $TABLES; do
  echo "  → $TABLE"
  PGPASSWORD="$SUPABASE_DB_PASSWORD" pg_dump \
    --host="$SUPABASE_DB_HOST" \
    --port="${SUPABASE_DB_PORT:-5432}" \
    --username="$SUPABASE_DB_USER" \
    --dbname="$SUPABASE_DB_NAME" \
    --schema=public \
    --data-only \
    --no-owner \
    --no-acl \
    --disable-triggers \
    --table="public.$TABLE" \
    -f "$DUMP_DIR/data_${TABLE}.sql" 2>/dev/null || echo "    ⚠️  Таблица $TABLE не найдена, пропуск"
done

echo ""
echo "✅ Данные сохранены в $DUMP_DIR/"
echo ""

# ── Экспорт Storage ──────────────────────────────
echo "🗂️  Экспорт файлов из Supabase Storage..."

STORAGE_DIR="$DUMP_DIR/storage"
mkdir -p "$STORAGE_DIR/convent"
mkdir -p "$STORAGE_DIR/gallery"

# Используем API Supabase для листинга и скачивания
python3 "$SCRIPT_DIR/download_storage.py" \
  --url "$SUPABASE_URL" \
  --key "$SUPABASE_SERVICE_KEY" \
  --out "$STORAGE_DIR"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Экспорт завершён! Теперь запусти:"
echo "   ./02-import-to-local.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
