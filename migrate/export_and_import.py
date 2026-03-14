#!/usr/bin/env python3
"""
Экспорт всех данных из Supabase → импорт в локальную PostgreSQL
"""
import urllib.request
import json
import subprocess
import os
import sys

SUPABASE_URL = "https://plugjsubjcfblzkabjia.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsdWdqc3ViamNmYmx6a2FiamlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDM0Mzg1NSwiZXhwIjoyMDY1OTE5ODU1fQ.jh-um9xqFiuRydPzRHRGj9hTFJXyGIHCOflk6NbXFBc"

LOCAL_DB = "postgresql://foxtaffy:2O7JUsEbAKxbn6hD8g6HfJ6itC_16QXj@localhost:5433/foxtaffy"

TABLES = [
    "persons",
    "fursonas",
    "tags",
    "arts",
    "art_collaborators",
    "art_fursonas",
    "art_tags",
    "cons",
    "con_links",
    "con_features",
    "con_photos",
    "con_purchases",
]

EXPORT_DIR = "/var/www/FoxTaffy/migrate/data"
os.makedirs(EXPORT_DIR, exist_ok=True)


def fetch_table(table):
    """Скачивает все строки таблицы через Supabase REST API (с пагинацией)"""
    all_rows = []
    offset = 0
    limit = 1000
    while True:
        url = f"{SUPABASE_URL}/rest/v1/{table}?select=*&limit={limit}&offset={offset}"
        req = urllib.request.Request(url, headers={
            "Authorization": f"Bearer {SERVICE_KEY}",
            "apikey": SERVICE_KEY,
            "Range-Unit": "items",
        })
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                rows = json.loads(resp.read().decode())
                if not rows:
                    break
                all_rows.extend(rows)
                print(f"  [{table}] offset={offset} → +{len(rows)} строк")
                if len(rows) < limit:
                    break
                offset += limit
        except Exception as e:
            print(f"  [{table}] ОШИБКА: {e}")
            break
    return all_rows


def escape_val(v):
    """Конвертирует Python значение в SQL литерал"""
    if v is None:
        return "NULL"
    if isinstance(v, bool):
        return "TRUE" if v else "FALSE"
    if isinstance(v, (int, float)):
        return str(v)
    if isinstance(v, (list, dict)):
        j = json.dumps(v, ensure_ascii=False).replace("'", "''")
        return f"'{j}'::jsonb"
    # строка
    s = str(v).replace("'", "''")
    return f"'{s}'"


def rows_to_sql(table, rows):
    if not rows:
        return ""
    cols = list(rows[0].keys())
    quoted_cols = ", ".join(f'"{c}"' for c in cols)
    lines = [f"-- {table}: {len(rows)} строк"]
    lines.append(f"INSERT INTO {table} ({quoted_cols}) VALUES")
    values_list = []
    for row in rows:
        vals = ", ".join(escape_val(row[c]) for c in cols)
        values_list.append(f"  ({vals})")
    lines.append(",\n".join(values_list))
    lines.append("ON CONFLICT DO NOTHING;")
    lines.append("")
    return "\n".join(lines)


def main():
    print("=" * 60)
    print("ЭКСПОРТ из Supabase → Локальная PostgreSQL")
    print("=" * 60)

    # 1. Экспорт всех таблиц
    all_data = {}
    for table in TABLES:
        print(f"\n▶ Экспорт: {table}")
        rows = fetch_table(table)
        all_data[table] = rows
        # Сохраняем JSON
        json_path = f"{EXPORT_DIR}/{table}.json"
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(rows, f, ensure_ascii=False, indent=2)
        print(f"  ✅ {len(rows)} строк → {json_path}")

    # 2. Генерируем SQL файл (каждая таблица в отдельной транзакции)
    sql_path = f"{EXPORT_DIR}/import_all.sql"
    with open(sql_path, "w", encoding="utf-8") as f:
        f.write("-- Автогенерированный импорт из Supabase\n")
        f.write("SET client_min_messages = WARNING;\n\n")
        for table in TABLES:
            rows = all_data[table]
            if rows:
                f.write(f"BEGIN; -- {table}\n")
                f.write(rows_to_sql(table, rows))
                f.write("COMMIT;\n\n")
        f.write("SELECT 'Import done!' AS status;\n")
    print(f"\n✅ SQL файл: {sql_path}")

    # 3. Импорт в локальную PostgreSQL
    print("\n▶ Импорт в локальную БД...")
    result = subprocess.run(
        ["docker", "exec", "-i", "foxtaffy-db",
         "psql", "-U", "foxtaffy", "-d", "foxtaffy"],
        input=open(sql_path, "rb").read(),
        capture_output=True
    )
    stdout = result.stdout.decode(errors="replace")
    stderr = result.stderr.decode(errors="replace")

    # Показываем только ошибки и финальный статус
    errors = [l for l in stderr.splitlines() if "ERROR" in l or "error" in l.lower()]
    if errors:
        print("⚠️  Ошибки при импорте:")
        for e in errors:
            print(f"  {e}")
    else:
        print("✅ Импорт завершён без ошибок")

    # Последние строки вывода
    for line in stdout.splitlines()[-5:]:
        if line.strip():
            print(f"  {line}")

    # 4. Проверка
    print("\n▶ Проверка количества записей:")
    check_sql = "SELECT tablename, (xpath('/row/c/text()', query_to_xml('SELECT count(*) AS c FROM ' || tablename, false, true, '')))[1]::text::int AS cnt FROM pg_tables WHERE schemaname='public' AND tablename IN ('cons','arts','persons','con_photos','con_purchases') ORDER BY tablename;"
    result2 = subprocess.run(
        ["docker", "exec", "-i", "foxtaffy-db",
         "psql", "-U", "foxtaffy", "-d", "foxtaffy", "-c", check_sql],
        capture_output=True, text=True
    )
    print(result2.stdout)

    print("\n🎉 Готово!")


if __name__ == "__main__":
    main()
