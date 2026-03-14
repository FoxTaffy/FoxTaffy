-- ================================================
-- FOXTAFFY.GAY — PostgreSQL Init
-- Выполняется при первом старте контейнера
-- ================================================

-- Роль для PostgREST анонимного доступа
CREATE ROLE anon NOLOGIN;

-- Роль для PostgREST (под этим пользователем подключается)
CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD '${PGRST_DB_PASS}';
GRANT anon TO authenticator;

-- Роль для полного доступа (service_role JWT)
CREATE ROLE service_role NOLOGIN;
GRANT service_role TO authenticator;

-- Права на схему
GRANT USAGE ON SCHEMA public TO anon, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, service_role;
