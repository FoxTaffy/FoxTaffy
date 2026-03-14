#!/usr/bin/env bash
# ================================================
# FOXTAFFY MIGRATION — Шаг 3: Файлы Supabase → MinIO
# ================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STORAGE_DIR="$SCRIPT_DIR/dumps/storage"

if [[ ! -d "$STORAGE_DIR" ]]; then
    echo "❌ Папка $STORAGE_DIR не найдена"
    echo "   Сначала запусти: ./01-export-supabase.sh"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🦊 FoxTaffy Migration — Файлы → MinIO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

python3 "$SCRIPT_DIR/upload_to_minio.py" \
  --minio-endpoint "http://localhost:9100" \
  --minio-key "foxtaffy" \
  --minio-secret "nOEuZXvicgd0nZHNSdczD7wBD7gO6O5D" \
  --source "$STORAGE_DIR"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Всё готово! Теперь:"
echo "   1. Запусти: docker compose up -d"
echo "   2. Настрой nginx: cp /etc/nginx/sites-available/foxtaffy.conf"
echo "   3. Запусти certbot для SSL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
