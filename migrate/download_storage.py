#!/usr/bin/env python3
"""
FOXTAFFY MIGRATION — Скачивание файлов из Supabase Storage
Использование: python3 download_storage.py --url ... --key ... --out /path
"""
import argparse
import os
import sys
import time
import urllib.request
import urllib.error
import json

def list_files(base_url: str, service_key: str, bucket: str, prefix: str = '', limit: int = 1000) -> list:
    """Листинг файлов в Supabase Storage bucket"""
    url = f"{base_url}/storage/v1/object/list/{bucket}"
    data = json.dumps({
        "limit": limit,
        "prefix": prefix,
        "sortBy": {"column": "name", "order": "asc"}
    }).encode()
    req = urllib.request.Request(url, data=data, method='POST')
    req.add_header('Authorization', f'Bearer {service_key}')
    req.add_header('Content-Type', 'application/json')
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read())
    except Exception as e:
        print(f"  ⚠️  Ошибка листинга {bucket}/{prefix}: {e}")
        return []

def download_file(base_url: str, service_key: str, bucket: str, path: str, dest: str) -> bool:
    """Скачивает файл из Supabase Storage"""
    url = f"{base_url}/storage/v1/object/{bucket}/{path}"
    req = urllib.request.Request(url)
    req.add_header('Authorization', f'Bearer {service_key}')
    try:
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with urllib.request.urlopen(req, timeout=60) as r:
            with open(dest, 'wb') as f:
                f.write(r.read())
        return True
    except Exception as e:
        print(f"  ❌ Ошибка скачивания {path}: {e}")
        return False

def walk_bucket(base_url: str, service_key: str, bucket: str, prefix: str, out_dir: str) -> tuple[int, int]:
    """Рекурсивно скачивает все файлы из bucket"""
    items = list_files(base_url, service_key, bucket, prefix)
    ok = failed = 0

    for item in items:
        name = item.get('name', '')
        if not name:
            continue

        full_path = f"{prefix}{name}" if prefix else name
        item_id = item.get('id')

        if item_id is None:
            # Это папка — рекурсия
            sub_ok, sub_fail = walk_bucket(base_url, service_key, bucket, f"{full_path}/", out_dir)
            ok += sub_ok; failed += sub_fail
        else:
            # Это файл
            dest = os.path.join(out_dir, full_path)
            if os.path.exists(dest):
                print(f"  ⏩ Пропуск (уже скачан): {full_path}")
                ok += 1
                continue

            print(f"  ⬇️  {full_path}")
            if download_file(base_url, service_key, bucket, full_path, dest):
                ok += 1
            else:
                failed += 1
            time.sleep(0.05)  # небольшая пауза чтобы не перегружать API

    return ok, failed

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--url',  required=True, help='Supabase project URL')
    parser.add_argument('--key',  required=True, help='service_role key')
    parser.add_argument('--out',  required=True, help='Output directory')
    args = parser.parse_args()

    base_url = args.url.rstrip('/')
    buckets = [
        ('Convent', os.path.join(args.out, 'convent')),
        ('gallery', os.path.join(args.out, 'gallery')),
    ]

    total_ok = total_fail = 0
    for bucket_name, out_dir in buckets:
        print(f"\n📂 Бакет: {bucket_name}")
        os.makedirs(out_dir, exist_ok=True)
        ok, fail = walk_bucket(base_url, args.key, bucket_name, '', out_dir)
        total_ok += ok; total_fail += fail
        print(f"   ✅ Скачано: {ok}, ❌ Ошибок: {fail}")

    print(f"\n{'='*50}")
    print(f"📊 Итого: {total_ok} файлов, {total_fail} ошибок")

    if total_fail > 0:
        sys.exit(1)

if __name__ == '__main__':
    main()
