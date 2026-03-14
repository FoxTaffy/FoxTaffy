#!/bin/bash
# ================================================
# FOXTAFFY — PostgreSQL first-run init script
# ================================================
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE ROLE anon NOLOGIN;
    CREATE ROLE service_role NOLOGIN;
    CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD '${PGRST_DB_PASS}';
    GRANT anon TO authenticator;
    GRANT service_role TO authenticator;

    GRANT USAGE ON SCHEMA public TO anon, service_role;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, service_role;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public
        GRANT ALL ON TABLES TO anon, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public
        GRANT ALL ON SEQUENCES TO anon, service_role;
EOSQL

echo "✅ FoxTaffy roles created"
