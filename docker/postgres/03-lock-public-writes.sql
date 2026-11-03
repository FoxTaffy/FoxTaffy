-- Закрывает запись для анонимного ключа.
-- Админка пишет через /upload/admin/db/* с service_role, а он обходит RLS,
-- поэтому INSERT/UPDATE/DELETE-политик для роли public быть не должно:
-- иначе любой, у кого есть anon-ключ из бандла, меняет и удаляет данные напрямую.
-- Идемпотентно: можно запускать повторно (в т.ч. на облачном проекте Supabase).
DO $$
DECLARE
  p record;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND cmd IN ('INSERT', 'UPDATE', 'DELETE', 'ALL')
      AND tablename IN (
        'persons', 'fursonas', 'tags', 'arts', 'art_collaborators', 'art_fursonas', 'art_tags',
        'cons', 'con_links', 'con_features', 'con_photos', 'con_purchases'
      )
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', p.policyname, p.schemaname, p.tablename);
  END LOOP;
END $$;
