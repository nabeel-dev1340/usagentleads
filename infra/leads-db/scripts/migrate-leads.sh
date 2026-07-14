#!/usr/bin/env bash
# One-shot data migration: copy usagentleads.leads from Supabase into the VPS
# Postgres, then build the secondary indexes. Safe to re-run (it truncates the
# VPS copy first). Uses dockerized pg16 clients so the host needs nothing but
# Docker.
#
# Prereqs:
#   - `docker compose up -d` already run in infra/leads-db (db is healthy)
#   - SUPABASE_DB_URL set to Supabase's *Session pooler* connection string
#     (Dashboard > Project Settings > Database > Connection string > "Session"
#     mode, port 5432 — the pooler is IPv4-reachable from a typical VPS; the
#     "Direct connection" is IPv6-only). Include the password.
#
# Usage:
#   cd infra/leads-db
#   SUPABASE_DB_URL='postgresql://postgres.<ref>:<pw>@aws-0-<region>.pooler.supabase.com:5432/postgres' \
#     ./scripts/migrate-leads.sh
set -euo pipefail

: "${SUPABASE_DB_URL:?Set SUPABASE_DB_URL to the Supabase Session pooler connection string}"

cd "$(dirname "$0")/.."   # -> infra/leads-db

echo "==> Sanity: VPS table exists and current row count"
docker compose exec -T db psql -U postgres -d leads \
  -c "SELECT count(*) AS vps_rows_before FROM usagentleads.leads;"

echo "==> Truncating VPS copy (fresh load)"
docker compose exec -T db psql -v ON_ERROR_STOP=1 -U postgres -d leads \
  -c "TRUNCATE usagentleads.leads;"

echo "==> Streaming data from Supabase -> VPS (this is the ~165 MB part)"
# pg_dump (source) piped straight into pg_restore (dest). --disable-triggers keeps
# the load fast; data-only because the schema already exists on the VPS.
docker run --rm -i postgres:16 \
  pg_dump "$SUPABASE_DB_URL" \
    --data-only --no-owner --no-privileges -Fc \
    --table='usagentleads.leads' \
  | docker compose exec -T db \
      pg_restore --data-only --no-owner --disable-triggers -U postgres -d leads

echo "==> Building secondary indexes (post-load/indexes.sql)"
docker compose exec -T db psql -v ON_ERROR_STOP=1 -U postgres -d leads \
  < post-load/indexes.sql

echo "==> Verify: row count on the VPS"
docker compose exec -T db psql -U postgres -d leads \
  -c "SELECT count(*) AS vps_rows_after FROM usagentleads.leads;"

echo "Done. Compare vps_rows_after with Supabase's count before cutting over."
