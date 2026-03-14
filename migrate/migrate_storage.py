#!/usr/bin/env python3
"""
Скачивает файлы из Supabase Storage и загружает в MinIO
Обновляет URL в локальной БД
"""
import urllib.request
import json
import subprocess
import os
import re
import time
from pathlib import Path

SUPABASE_URL = "https://plugjsubjcfblzkabjia.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsdWdqc3ViamNmYmx6a2FiamlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDM0Mzg1NSwiZXhwIjoyMDY1OTE5ODU1fQ.jh-um9xqFiuRydPzRHRGj9hTFJXyGIHCOflk6NbXFBc"

MINIO_ENDPOINT = "http://localhost:9100"
MINIO_ACCESS = "foxtaffy"
MINIO_SECRET = "nOEuZXvicgd0nZHNSdczD7wBD7gO6O5D"

DOWNLOAD_DIR = "/var/www/FoxTaffy/migrate/files"
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

# Supabase bucket → MinIO bucket mapping
BUCKET_MAP = {
    "gallery": "gallery",
    "Convent": "convent",
}

# =====================================================
# 1. Получить список файлов из Supabase Storage
# =====================================================

def list_storage_files(bucket, prefix="", limit=1000, offset=0):
    url = f"{SUPABASE_URL}/storage/v1/object/list/{bucket}"
    payload = json.dumps({
        "limit": limit,
        "offset": offset,
        "prefix": prefix,
        "sortBy": {"column": "name", "order": "asc"}
    }).encode()
    req = urllib.request.Request(url, data=payload, headers={
        "Authorization": f"Bearer {SERVICE_KEY}",
        "apikey": SERVICE_KEY,
        "Content-Type": "application/json",
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.loads(r.read().decode())
    except Exception as e:
        print(f"  Error listing {bucket}/{prefix}: {e}")
        return []


def collect_all_files(bucket):
    """Рекурсивный обход папок bucket"""
    all_files = []
    folders_to_scan = [""]

    while folders_to_scan:
        prefix = folders_to_scan.pop(0)
        items = list_storage_files(bucket, prefix)
        for item in items:
            if item.get("id") is None:
                # Это папка
                sub = item["name"] if not prefix else f"{prefix}{item['name']}/"
                folders_to_scan.append(sub)
            else:
                # Это файл
                path = item["name"] if not prefix else f"{prefix}{item['name']}"
                all_files.append(path)
    return all_files


# =====================================================
# 2. Скачать файл из Supabase Storage
# =====================================================

def download_file(bucket, path, local_path):
    url = f"{SUPABASE_URL}/storage/v1/object/{bucket}/{path}"
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {SERVICE_KEY}",
        "apikey": SERVICE_KEY,
    })
    try:
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        with urllib.request.urlopen(req, timeout=30) as r:
            with open(local_path, "wb") as f:
                f.write(r.read())
        return True
    except Exception as e:
        print(f"    ⚠ Ошибка загрузки {path}: {e}")
        return False


# =====================================================
# 3. Загрузить файл в MinIO через mc (MinIO Client)
# =====================================================

def upload_to_minio(local_path, bucket, minio_path):
    # Используем docker exec mc cp
    result = subprocess.run([
        "docker", "exec", "foxtaffy-minio",
        "mc", "--help"
    ], capture_output=True)
    
    # mc нет в MinIO контейнере — загружаем через curl (MinIO S3 API)
    # Сначала получаем presigned URL или используем простой PUT
    
    with open(local_path, "rb") as f:
        data = f.read()
    
    # Определяем content-type по расширению
    ext = Path(local_path).suffix.lower()
    ctype = {
        ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
        ".png": "image/png", ".gif": "image/gif",
        ".webp": "image/webp", ".mp4": "video/mp4",
        ".svg": "image/svg+xml",
    }.get(ext, "application/octet-stream")
    
    url = f"{MINIO_ENDPOINT}/{bucket}/{minio_path}"
    
    # S3 подписанный PUT через Python
    # Используем простую авторизацию через mc alias
    result = subprocess.run([
        "docker", "exec", "-i", "foxtaffy-minio",
        "sh", "-c",
        f"mc alias set local {MINIO_ENDPOINT} {MINIO_ACCESS} {MINIO_SECRET} --quiet 2>/dev/null; echo ready"
    ], capture_output=True, text=True)
    
    # Копируем через mc cp (stdin → minio)
    result = subprocess.run([
        "docker", "exec", "-i", "foxtaffy-minio",
        "mc", "cp", "--quiet", "-",
        f"local/{bucket}/{minio_path}"
    ], input=data, capture_output=True)
    
    return result.returncode == 0


# =====================================================
# Альтернативный upload через Upload API
# =====================================================

def upload_via_api(local_path, bucket, minio_path):
    import urllib.parse
    
    UPLOAD_API = "http://localhost:3002"
    API_KEY = "z312xmvDhKLV4DWA185o94wtcPwcnRB9ZsxTUOLtUAk"
    
    filename = os.path.basename(minio_path)
    folder = os.path.dirname(minio_path)
    
    with open(local_path, "rb") as f:
        data = f.read()
    
    # Multipart form data
    boundary = "----formdata" + str(int(time.time()))
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        f"Content-Type: application/octet-stream\r\n\r\n"
    ).encode() + data + (
        f"\r\n--{boundary}\r\n"
        f'Content-Disposition: form-data; name="folder"\r\n\r\n'
        f"{folder}\r\n"
        f"--{boundary}--\r\n"
    ).encode()
    
    url = f"{UPLOAD_API}/upload/{bucket}"
    req = urllib.request.Request(url, data=body, headers={
        "X-API-Key": API_KEY,
        "Content-Type": f"multipart/form-data; boundary={boundary}",
    })
    
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            resp = json.loads(r.read().decode())
            return resp.get("url") or resp.get("path")
    except Exception as e:
        print(f"    ⚠ Upload API ошибка: {e}")
        return None


# =====================================================
# Главный процесс
# =====================================================

def main():
    print("=" * 60)
    print("МИГРАЦИЯ ФАЙЛОВ: Supabase Storage → MinIO")
    print("=" * 60)
    
    total_ok = 0
    total_fail = 0
    url_mapping = {}  # старый URL → новый URL

    for sb_bucket, minio_bucket in BUCKET_MAP.items():
        print(f"\n▶ Bucket: {sb_bucket} → {minio_bucket}")
        
        files = collect_all_files(sb_bucket)
        print(f"  Найдено файлов: {len(files)}")
        
        for i, path in enumerate(files):
            local_path = f"{DOWNLOAD_DIR}/{sb_bucket}/{path}"
            
            # Пропускаем если уже скачан
            if os.path.exists(local_path) and os.path.getsize(local_path) > 0:
                ok = True
            else:
                ok = download_file(sb_bucket, path, local_path)
            
            if ok:
                # Загружаем в MinIO
                new_url = upload_via_api(local_path, minio_bucket, path)
                if new_url:
                    old_url = f"{SUPABASE_URL}/storage/v1/object/public/{sb_bucket}/{path}"
                    url_mapping[old_url] = f"/s3/{minio_bucket}/{path}"
                    total_ok += 1
                    if (i + 1) % 20 == 0:
                        print(f"  [{i+1}/{len(files)}] ✅ {path[:60]}")
                else:
                    total_fail += 1
            else:
                total_fail += 1
    
    print(f"\n✅ Успешно: {total_ok}")
    print(f"❌ Ошибок:  {total_fail}")
    
    # Сохраняем маппинг URL
    mapping_path = f"{DOWNLOAD_DIR}/url_mapping.json"
    with open(mapping_path, "w") as f:
        json.dump(url_mapping, f, indent=2, ensure_ascii=False)
    print(f"\n✅ URL маппинг сохранён: {mapping_path}")
    
    # Обновляем URL в БД
    if url_mapping:
        print("\n▶ Обновление URL в БД...")
        update_db_urls(url_mapping)


def update_db_urls(mapping):
    """Заменяет старые Supabase URL на MinIO URL в БД"""
    # Общий паттерн Supabase URL
    old_base = f"{SUPABASE_URL}/storage/v1/object/public/"
    new_base = "/s3/"
    
    sql = f"""
UPDATE cons SET
  meta_image = REPLACE(meta_image, '{old_base}', '{new_base}'),
  avatar_url = REPLACE(avatar_url, '{old_base}', '{new_base}'),
  logo_url   = REPLACE(logo_url,   '{old_base}', '{new_base}'),
  photos_folder = REPLACE(photos_folder, '{old_base}', '{new_base}')
WHERE meta_image LIKE '%supabase.co%'
   OR avatar_url LIKE '%supabase.co%'
   OR logo_url   LIKE '%supabase.co%'
   OR photos_folder LIKE '%supabase.co%';

UPDATE con_photos SET
  image_url     = REPLACE(image_url,     '{old_base}', '{new_base}'),
  thumbnail_url = REPLACE(thumbnail_url, '{old_base}', '{new_base}')
WHERE image_url LIKE '%supabase.co%'
   OR thumbnail_url LIKE '%supabase.co%';

UPDATE arts SET
  image_url     = REPLACE(image_url,     '{old_base}', '{new_base}'),
  thumbnail_url = REPLACE(thumbnail_url, '{old_base}', '{new_base}')
WHERE image_url LIKE '%supabase.co%'
   OR thumbnail_url LIKE '%supabase.co%';

UPDATE persons SET
  avatar_url = REPLACE(avatar_url, '{old_base}', '{new_base}')
WHERE avatar_url LIKE '%supabase.co%';

UPDATE fursonas SET
  avatar_url = REPLACE(avatar_url, '{old_base}', '{new_base}')
WHERE avatar_url LIKE '%supabase.co%';

SELECT 'URLs updated' AS status;
"""
    result = subprocess.run(
        ["docker", "exec", "-i", "foxtaffy-db", "psql", "-U", "foxtaffy", "-d", "foxtaffy"],
        input=sql.encode(), capture_output=True
    )
    print(result.stdout.decode(errors="replace").strip().splitlines()[-1])


if __name__ == "__main__":
    main()
