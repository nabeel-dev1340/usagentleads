#!/bin/bash
# Runs once, at first container boot (Postgres initdb). Creates the extensions,
# schema and the three PostgREST roles:
#   - authenticator : LOGIN role PostgREST connects as (NOINHERIT)
#   - leads_service : privileged role the app's JWT maps to (read/write leads)
#   - leads_anon    : zero-privilege role for unauthenticated requests (denied)
set -e

psql -v ON_ERROR_STOP=1 \
  -v authpw="$AUTHENTICATOR_PASSWORD" \
  --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<'EOSQL'
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;   -- required by the (state, name) GIN index

CREATE SCHEMA IF NOT EXISTS usagentleads;

DO $do$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'leads_anon') THEN
    CREATE ROLE leads_anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'leads_service') THEN
    CREATE ROLE leads_service NOLOGIN;
  END IF;
END
$do$;

-- Create the LOGIN role with the password passed via psql var (never via shell).
SELECT 'CREATE ROLE authenticator LOGIN NOINHERIT PASSWORD ' || quote_literal(:'authpw')
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticator')
\gexec

GRANT leads_anon    TO authenticator;
GRANT leads_service TO authenticator;
GRANT USAGE ON SCHEMA usagentleads TO leads_anon, leads_service;
EOSQL
