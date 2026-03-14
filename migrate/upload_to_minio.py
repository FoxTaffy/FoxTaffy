#!/usr/bin/env python3
"""
FOXTAFFY MIGRATION — Загрузка файлов в MinIO
"""
import argparse
import os
import mimetypes
import boto3
from botocore.exceptions import ClientError

BUCKET_MAP = {
    'convent': 'convent',
    'gallery': 'gallery',
}

def upload_directory(s3, source_dir: str, bucket: str, public_url: str) -> tuple[int, int]:
    ok = failed = 0
    for root, _, files in os.walk(source_dir):
        for filename in files:
            local_path = os.path.join(root, filename)
            # Относительный путь внутри bucket
            rel_path = os.path.relpath(local_path, source_dir)
            s3_key = rel_path.replace('\\', '/')

            mime_type, _ = mimetypes.guess_type(filename)
            mime_type = mime_type or 'application/octet-stream'

            try:
                s3.upload_file(
                    local_path,
                    bucket,
                    s3_key,
                    ExtraArgs={
                        'ContentType': mime_type,
                        'CacheControl': 'max-age=31536000',
                    }
                )
                print(f"  ✅ {s3_key}")
                ok += 1
            except Exception as e:
                print(f"  ❌ {s3_key}: {e}")
                failed += 1

    return ok, failed

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--minio-endpoint', required=True)
    parser.add_argument('--minio-key',      required=True)
    parser.add_argument('--minio-secret',   required=True)
    parser.add_argument('--source',         required=True, help='Папка с файлами (содержит convent/ и gallery/)')
    args = parser.parse_args()

    s3 = boto3.client('s3',
        endpoint_url=args.minio_endpoint,
        aws_access_key_id=args.minio_key,
        aws_secret_access_key=args.minio_secret,
        region_name='us-east-1',
    )

    total_ok = total_fail = 0

    for local_bucket, minio_bucket in BUCKET_MAP.items():
        source_dir = os.path.join(args.source, local_bucket)
        if not os.path.isdir(source_dir):
            print(f"\n⚠️  Папка {source_dir} не найдена, пропуск")
            continue

        file_count = sum(len(files) for _, _, files in os.walk(source_dir))
        print(f"\n📂 {local_bucket} → {minio_bucket}  ({file_count} файлов)")

        ok, fail = upload_directory(s3, source_dir, minio_bucket, '')
        total_ok += ok
        total_fail += fail
        print(f"   ✅ Загружено: {ok}, ❌ Ошибок: {fail}")

    print(f"\n{'='*50}")
    print(f"📊 Итого: {total_ok} файлов загружено, {total_fail} ошибок")

if __name__ == '__main__':
    main()
