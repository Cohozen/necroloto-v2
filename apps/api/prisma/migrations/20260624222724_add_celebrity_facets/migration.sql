-- Facettes Wikidata pour filtrer le catalogue (draft + admin) : nationalité (P27)
-- et genre (P21). Additif (colonnes nullable) → déploiement prod sûr. Rempli par
-- l'enrichissement Wikidata (re-run du bulk-enrich pour les fiches existantes).
ALTER TABLE "public"."Celebrity" ADD COLUMN "nationality" TEXT;
ALTER TABLE "public"."Celebrity" ADD COLUMN "gender" TEXT;
