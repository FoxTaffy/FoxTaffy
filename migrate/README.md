# 🦊 FoxTaffy — Миграция с Supabase на VPS

## Что куда переезжает

| Было | Стало |
|------|-------|
| Supabase PostgreSQL | `foxtaffy-db` (PostgreSQL 16, порт **5433**) |
| Supabase Storage (`Convent`) | MinIO бакет `convent` (порт **9100**) |
| Supabase Storage (`gallery`) | MinIO бакет `gallery` (порт **9100**) |
| Vercel/Netlify hosting | Nginx на VPS (статика из `dist/`) |
| Supabase PostgREST | `foxtaffy-postgrest` (порт **3001**) |
| Supabase Storage API | `foxtaffy-upload-api` (порт **3002**) |

## Сервисы

```
foxtaffy-db           PostgreSQL 16     localhost:5433
foxtaffy-minio        MinIO S3          localhost:9100  (console: 9101)
foxtaffy-postgrest    PostgREST         localhost:3001
foxtaffy-upload-api   Upload API        localhost:3002
```

## Пошаговая миграция

### 1. Запусти собственные контейнеры

```bash
cd /var/www/FoxTaffy
docker compose up -d
docker compose ps  # убедись что все healthy
```

### 2. Заполни Supabase credentials

```bash
nano migrate/supabase-creds.sh
# Заполни все YOUR_* значения из Supabase Dashboard
```

**Где найти данные в Supabase:**
- `SUPABASE_URL` → Settings → General → `https://{ref}.supabase.co`
- `SUPABASE_SERVICE_KEY` → Settings → API → `service_role` (secret)
- `SUPABASE_DB_HOST` → Settings → Database → Host
- `SUPABASE_DB_PASSWORD` → Settings → Database → Database password

### 3. Установи `pg_dump` клиент

```bash
apt-get install -y postgresql-client-16
```

### 4. Экспортируй данные из Supabase

```bash
./migrate/01-export-supabase.sh
```

### 5. Импортируй в foxtaffy-db

```bash
./migrate/02-import-to-local.sh
```

### 6. Перенеси файлы в MinIO

```bash
./migrate/03-migrate-storage.sh
```

### 7. Задеплой

```bash
bash deploy.sh
```

## Проверка

```bash
# PostgREST
curl http://localhost:3001/cons | head -c 200

# Upload API health
curl http://localhost:3002/health

# MinIO (публичный файл)
curl -I http://localhost:9100/convent/
```


## Пошаговая миграция

### 1. Заполни credentials

```bash
nano migrate/supabase-creds.sh
# Заполни все YOUR_* значения из Supabase Dashboard
```

**Где найти данные в Supabase:**
- `SUPABASE_URL` → Settings → General → Reference ID → `https://{ref}.supabase.co`
- `SUPABASE_SERVICE_KEY` → Settings → API → `service_role` (secret)
- `SUPABASE_DB_HOST` → Settings → Database → Host
- `SUPABASE_DB_PASSWORD` → Settings → Database → Database password

### 2. Установи `pg_dump` на VPS

```bash
apt-get install -y postgresql-client-16
```

### 3. Запусти экспорт из Supabase

```bash
chmod +x migrate/*.sh
./migrate/01-export-supabase.sh
```

### 4. Импортируй в локальную БД

```bash
./migrate/02-import-to-local.sh
```

### 5. Загрузи файлы в MinIO

```bash
./migrate/03-migrate-storage.sh
```

### 6. Запусти PostgREST и Upload API

```bash
cd /var/www/FoxTaffy
docker compose up -d
```

### 7. Собери фронтенд

```bash
cp .env .env.local  # если нужны изменения для dev
npm run build
```

### 8. Настрой Nginx и SSL

```bash
# Копируй nginx конфиг
sudo cp /var/www/FoxTaffy/nginx/foxtaffy.conf /etc/nginx/sites-available/foxtaffy
sudo ln -s /etc/nginx/sites-available/foxtaffy /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# SSL
sudo certbot --nginx -d foxtaffy.gay -d www.foxtaffy.gay
```

## Проверка работоспособности

```bash
# PostgREST должен ответить списком таблиц
curl https://foxtaffy.gay/rest/v1/

# Upload API
curl https://foxtaffy.gay/upload/health

# MinIO файлы (должен вернуть 200 или 403)
curl -I https://foxtaffy.gay/s3/convent/
```

## Откат на Supabase

Достаточно вернуть прежние значения в `.env`:
```
VITE_SUPABASE_URL=https://YOUR_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ORIGINAL_KEY
```
