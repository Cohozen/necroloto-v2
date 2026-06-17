#!/usr/bin/env bash
# Clone prod DATA into the local Supabase Postgres (dev convenience).
#
# Schema is owned by Prisma migrations, so this only copies *data*:
#   1. dump data-only from prod (excluding _prisma_migrations)
#   2. load it into the local container with FK checks deferred
#
# Prereqs: local stack up (`supabase start`), prod DIRECT_URL in
# apps/api/.env.production.local, Colima/Docker running.
#
# Storage FILES (images) are NOT copied — only DB rows. The storage.objects
# rows will reference files that don't exist locally.
#
# Usage:  apps/api/scripts/clone-prod-to-local.sh
set -euo pipefail

cd "$(dirname "$0")/.."

DUMP=/tmp/necroloto-data.sql
DB_CONTAINER=supabase_db_api
LOCAL_PSQL="docker exec -i ${DB_CONTAINER} psql -U postgres -d postgres"

PROD_DIRECT_URL=$(grep '^DIRECT_URL=' .env.production.local | cut -d'"' -f2)
if [[ -z "${PROD_DIRECT_URL}" ]]; then
  echo "❌ DIRECT_URL not found in apps/api/.env.production.local" >&2
  exit 1
fi

echo "→ Dumping prod data (host: $(echo "${PROD_DIRECT_URL}" | sed -E 's#.*@([^/]+)/.*#\1#'))"
supabase db dump --db-url "${PROD_DIRECT_URL}" --data-only --use-copy \
  -x public._prisma_migrations -f "${DUMP}"

echo "→ Loading into local (${DB_CONTAINER})"
# session_replication_role=replica defers FK/trigger checks so row order is moot.
# Storage-internal tables may error on permissions; harmless, hence no ON_ERROR_STOP.
{ echo "SET session_replication_role = replica;"; cat "${DUMP}"; } | ${LOCAL_PSQL}

echo "→ Row counts:"
${LOCAL_PSQL} -c "SELECT 'User' t, count(*) FROM \"User\"
  UNION ALL SELECT 'Celebrity', count(*) FROM \"Celebrity\"
  UNION ALL SELECT 'Bet', count(*) FROM \"Bet\"
  UNION ALL SELECT 'Circle', count(*) FROM \"Circle\";"

echo "✅ Done. Dump left at ${DUMP} (contains real user data — do not commit)."
