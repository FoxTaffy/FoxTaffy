#!/usr/bin/env bash
# ================================================
# FOXTAFFY.GAY — Deploy Script
# Запуск: bash /var/www/FoxTaffy/deploy.sh
# ================================================
set -euo pipefail

SITE_DIR="/var/www/FoxTaffy"
CERTBOT_WEBROOT="/var/www/certbot"
cd "$SITE_DIR"

# Защита .env — только root может читать (исправляем до любых операций)
chmod 600 "$SITE_DIR/.env" 2>/dev/null || true

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🦊 FoxTaffy Deploy"
echo "   $(date '+%Y-%m-%d %H:%M:%S')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 1. Docker контейнеры ─────────────────────────
echo ""
echo "🐳 Запуск Docker контейнеров..."
# Обновляем только внешние образы, не собираемые локально
docker compose pull --quiet db minio postgrest 2>/dev/null || true
docker compose up -d --build
echo "✅ Контейнеры запущены"

# ── 2. Фронтенд ──────────────────────────────────
echo ""
echo "📦 Установка зависимостей..."
npm install --prefer-offline 2>/dev/null || npm install

echo "🔨 Сборка фронтенда..."
npm run build
echo "✅ Сборка готова: dist/"

# ── 3. Nginx ─────────────────────────────────────
echo ""
NGINX_CONF="/etc/nginx/sites-available/foxtaffy"

if [[ ! -f "$NGINX_CONF" ]]; then
    echo "🔧 Устанавливаю nginx конфиг..."

    # Создаём директорию для certbot webroot (нужна для ACME-challenge)
    mkdir -p "$CERTBOT_WEBROOT"

    cp "$SITE_DIR/nginx/foxtaffy.conf" "$NGINX_CONF"
    ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/foxtaffy

    # Временный HTTP-only конфиг для Certbot
    cat > /etc/nginx/sites-available/foxtaffy-tmp << TMPEOF
server {
    listen 80;
    server_name foxtaffy.gay www.foxtaffy.gay;
    root /var/www/FoxTaffy/dist;
    location /.well-known/acme-challenge/ {
        root $CERTBOT_WEBROOT;
        try_files \$uri =404;
    }
    location / { try_files \$uri /index.html; }
}
TMPEOF
    ln -sf /etc/nginx/sites-available/foxtaffy-tmp /etc/nginx/sites-enabled/foxtaffy-tmp
    rm -f /etc/nginx/sites-enabled/foxtaffy
    nginx -t && systemctl reload nginx

    echo "🔒 Получаем SSL сертификат..."
    certbot certonly --webroot --webroot-path="$CERTBOT_WEBROOT" \
        -d foxtaffy.gay -d www.foxtaffy.gay \
        --non-interactive --agree-tos -m webmaster@foxtaffy.gay || \
    certbot --nginx \
        -d foxtaffy.gay -d www.foxtaffy.gay \
        --non-interactive --agree-tos -m webmaster@foxtaffy.gay || \
        echo "⚠️  Certbot: запусти вручную — certbot --nginx -d foxtaffy.gay -d www.foxtaffy.gay"

    rm -f /etc/nginx/sites-enabled/foxtaffy-tmp
    ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/foxtaffy
fi

nginx -t && systemctl reload nginx
echo "✅ Nginx перезагружен"

# ── 4. Статус ─────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deploy завершён!"
echo ""
docker compose ps
echo ""
echo "🌐 https://foxtaffy.gay"
echo "🗄️  PostgREST:  http://localhost:3001"
echo "📤 Upload API: http://localhost:3002"
echo "🪣  MinIO API:  http://localhost:9100"
echo "🖥️  MinIO UI:   http://localhost:9101"
echo ""
echo "Логи: docker compose -f $SITE_DIR/docker-compose.yml logs -f"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
