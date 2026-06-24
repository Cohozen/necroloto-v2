-- Bloque l'accès anon/authenticated (Data API PostgREST + GraphQL) sur toutes les tables
-- publiques (Supabase security advisor: rls_disabled_in_public).
-- Aucune policy ajoutée volontairement : l'app accède en tant que rôle owner (postgres) via
-- Prisma, qui contourne RLS. RLS sans policy = "deny all" pour anon/authenticated, donc seul
-- le chemin Data API (qu'on n'utilise pas) est fermé ; Prisma/NestJS n'est pas impacté.
-- Pas de FORCE ROW LEVEL SECURITY : on veut justement que le owner continue de contourner RLS.
ALTER TABLE "public"."User"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Celebrity"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Bet"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."CelebritiesOnBet"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Circle"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Membership"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Season"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."SyncJob"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Notification"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."PushSubscription"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
