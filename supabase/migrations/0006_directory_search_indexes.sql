-- Indexes powering the public agent directory search (name + state).
-- Without these, `name ILIKE '%q%'` sequentially scans ~1M rows and a state
-- browse sorts 100k+ rows; with them every query path stays in the tens of ms.
--
-- NOTE: on production these were created with CREATE INDEX CONCURRENTLY (no write
-- lock on usagentleads.leads). They are written here without CONCURRENTLY so the
-- migration can run inside a transaction; IF NOT EXISTS makes re-runs a no-op.

-- Trigram matching for ILIKE, plus scalar columns inside a GIN index.
create extension if not exists pg_trgm;
create extension if not exists btree_gin;

-- Pure state browse ordered by name: WHERE state = ? ORDER BY name, id LIMIT n.
-- Serves rows already in order so LIMIT stops after one page.
create index if not exists idx_leads_state_name_id
  on usagentleads.leads (state, name, id);

-- Global name search: WHERE name ILIKE '%q%' (no state).
create index if not exists idx_leads_name_trgm
  on usagentleads.leads using gin (name gin_trgm_ops);

-- State + name search: WHERE state = ? AND name ILIKE '%q%'. The combined GIN
-- index filters both predicates at once so common substrings within a large
-- state (e.g. "%jose%" in California) return in ~20ms instead of seconds.
create index if not exists idx_leads_state_name_trgm
  on usagentleads.leads using gin (state, name gin_trgm_ops);
