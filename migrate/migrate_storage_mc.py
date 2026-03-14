#!/usr/bin/env python3
"""
Скачивает все файлы из Supabase Storage (бакет gallery) и загружает в MinIO.
Затем обновляет URL в PostgreSQL.
"""
import urllib.request
import urllib.parse
import json
import subprocess
import os
import time
from pathlib import Path

SUPABASE_URL = "https://plugjsubjcfblzkabjia.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsdWdqc3ViamNmYmx6a2FiamlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDM0Mzg1NSwiZXhwIjoyMDY1OTE5ODU1fQ.jh-um9xqFiuRydPzRHRGj9hTFJXyGIHCOflk6NbXFBc"

DOWNLOAD_DIR = Path("/var/www/FoxTaffy/migrate/files")
DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)

MINIO_ALIAS = "minio"

# =====================================================
# Обход дерева файлов в Supabase Storage
# =====================================================

def storage_list(bucket, prefix=""):
    url = f"{SUPABASE_URL}/storage/v1/object/list/{bucket}"
    data = json.dumps({
        "limit": 1000, "offset": 0,
        "prefix": prefix,
        "sortBy": {"column": "name", "order": "asc"}
    }).encode()
    req = urllib.request.Request(url, data=data, headers={
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json",
    })
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read())


def collect_files(bucket, prefix=""):
    """Рекурсивно собирает все пути файлов в бакете"""
    all_files = []
    items = storage_list(bucket, prefix)
    for item in items:
        if item.get("id") is None:
            # папка
            sub_prefix = (prefix + item["name"] + "/") if prefix else (item["name"] + "/")
            all_files.extend(collect_files(bucket, sub_prefix))
        else:
            # файл
            path = (prefix + item["name"]) if prefix else item["name"]
            all_files.append(path)
    return all_files


# =====================================================
# Скачать файл из Supabase Storage
# =====================================================

def download_file(bucket, path, local_path):
    if local_path.exists() and local_path.stat().st_size > 0:
        return True  # уже скачан

    encoded_path = urllib.parse.quote(path, safe="/")
    url = f"{SUPABASE_URL}/storage/v1/object/{bucket}/{encoded_path}"
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {SERVICE_KEY}",
    })
    try:
        local_path.parent.mkdir(parents=True, exist_ok=True)
        with urllib.request.urlopen(req, timeout=30) as r:
            local_path.write_bytes(r.read())
        return True
    except Exception as e:
        print(f"  ✗ {path}: {e}")
        return False


# =====================================================
# Загрузить файл в MinIO через mc
# =====================================================

def upload_file(local_path, minio_bucket, minio_path):
    target = f"{MINIO_ALIAS}/{minio_bucket}/{minio_path}"
    result = subprocess.run(
        ["mc", "cp", "--quiet", str(local_path), target],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"  ✗ upload {minio_path}: {result.stderr.strip()}")
        return False
    return True


# =====================================================
# Обновить URL в PostgreSQL
# =====================================================

def update_db_urls(old_base, new_base):
    sql = f"""
UPDATE con_photos SET
  image_url     = replace(image_url,     '{old_base}', '{new_base}'),
  thumbnail_url = replace(thumbnail_url, '{old_base}', '{new_base}')
WHERE image_url LIKE '%supabase.co%'
   OR thumbnail_url LIKE '%supabase.co%';

UPDATE arts SET
  image_url     = replace(image_url,     '{old_base}', '{new_base}'),
  thumbnail_url = replace(thumbnail_url, '{old_base}', '{new_base}')
WHERE image_url LIKE '%supabase.co%'
   OR thumbnail_url LIKE '%supabase.co%';

UPDATE cons SET
  meta_image    = replace(meta_image,    '{old_base}', '{new_base}'),
  avatar_url    = replace(avatar_url,    '{old_base}', '{new_base}'),
  logo_url      = replace(logo_url,      '{old_base}', '{new_base}')
WHERE meta_image LIKE '%supabase.co%'
   OR avatar_url LIKE '%supabase.co%'
   OR logo_url   LIKE '%supabase.co%';

UPDATE persons SET
  avatar_url = replace(avatar_url, '{old_base}', '{new_base}')
WHERE avatar_url LIKE '%supabase.co%';

UPDATE fursonas SET
  avatar_url = replace(avatar_url, '{old_base}', '{new_base}')
WHERE avatar_url LIKE '%supabase.co%';
"""
    result = subprocess.run(
        ["docker", "exec", "-i", "foxtaffy-db", "psql", "-U", "foxtaffy", "-d", "foxtaffy"],
        input=sql.encode(), capture_output=True
    )
    output = result.stdout.decode(errors="replace")
    for line in output.splitlines():
        if line.strip():
            print(f"  DB: {line.strip()}")


# =====================================================
# Главный процесс
# =====================================================

def main():
    print("=" * 60)
    print("МИГРАЦИЯ: Supabase Storage → MinIO")
    print("=" * 60)

    # Мигрируем только бакет gallery (там все файлы)
    for sb_bucket, minio_bucket in [("gallery", "gallery"), ("Convent", "convent")]:
        print(f"\n▶ Сканируем {sb_bucket}...")
        try:
            files = collect_files(sb_bucket)
        except Exception as e:
            print(f"  ⚠ Ошибка сканирования: {e}")
            continue

        print(f"  Найдено файлов: {len(files)}")
        if not files:
            continue

        ok = 0
        fail = 0
        for i, path in enumerate(files):
            local_path = DOWNLOAD_DIR / sb_bucket / path
            # Скачиваем
            if download_file(sb_bucket, path, local_path):
                # Загружаем в MinIO
                if upload_file(local_path, minio_bucket, path):
                    ok += 1
                    if (i + 1) % 50 == 0 or i == 0:
                        size = local_path.stat().st_size
                        print(f"  [{i+1}/{len(files)}] ✓ {path[:55]}  ({size//1024}KB)")
                else:
                    fail += 1
            else:
                fail += 1

        print(f"\n  ✅ Загружено: {ok}  ❌ Ошибок: {fail}")

    # Обновляем URL в БД
    print("\n▶ Обновляем URL в PostgreSQL...")
    old_base = f"{SUPABASE_URL}/storage/v1/object/public/"
    new_base = "https://foxtaffy.gay/s3/"
    update_db_urls(old_base, new_base)
    print("  ✓ Готово")

    print("\n✅ Миграция файлов завершена!")
    print(f"   Файлы: {DOWNLOAD_DIR}")
    print(f"   MinIO:  http://localhost:9101")


if __name__ == "__main__":
    main()
