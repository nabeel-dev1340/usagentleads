-- Schema for the moved table. Runs once at first boot, AFTER 00-roles.sh.
-- Only the essential constraints (PK + unique email) are defined here; the eight
-- secondary indexes are built in post-load/indexes.sql AFTER the data COPY, which
-- is dramatically faster than maintaining them row-by-row during the load.

CREATE TABLE IF NOT EXISTS usagentleads.leads (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email             text UNIQUE,                         -- -> leads_email_key
  name              text,
  email1_sent_at    timestamptz,
  email2_sent_at    timestamptz,
  email3_sent_at    timestamptz,
  email4_sent_at    timestamptz,
  email5_sent_at    timestamptz,
  email6_sent_at    timestamptz,
  email_status      text DEFAULT 'PENDING',
  email_error       text,
  email_message_id  text,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),
  replied           boolean NOT NULL DEFAULT false,
  state             text,
  phone             text
);

-- Data-hygiene + per-state aggregation. Replaces the old Supabase
-- usagentleads.update_state_counts() RPC: it runs the same cleanup on leads, but
-- instead of writing a state_count table (which stays on Supabase) it RETURNS the
-- aggregates so the app's cron can upsert them back into Supabase.
CREATE OR REPLACE FUNCTION usagentleads.refresh_states()
RETURNS TABLE(state text, count int, total_emails int, total_phones int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'usagentleads'
SET statement_timeout TO '120s'
AS $fn$
#variable_conflict use_column
DECLARE
  valid_states text[] := ARRAY[
    'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
    'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
    'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
    'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada',
    'New Hampshire','New Jersey','New Mexico','New York','North Carolina',
    'North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
    'South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
    'Virginia','Washington','West Virginia','Wisconsin','Wyoming',
    'District of Columbia'
  ];
BEGIN
  -- Normalize known DC variants
  UPDATE leads
    SET state = 'District of Columbia'
    WHERE lower(trim(state)) IN ('washington dc','washington d.c.','dc','d.c.','wash dc','district of columbia')
      AND state <> 'District of Columbia';

  -- Trim stray whitespace
  UPDATE leads SET state = trim(state) WHERE state <> trim(state);

  -- Drop rows with invalid / non-US states
  DELETE FROM leads WHERE state IS NULL OR state <> ALL(valid_states);

  -- Return per-state aggregates for the app to upsert into Supabase state_count
  RETURN QUERY
    SELECT l.state, count(*)::int, count(l.email)::int, count(l.phone)::int
    FROM leads l
    WHERE l.state IS NOT NULL
    GROUP BY l.state;
END
$fn$;

-- Privileges: the service role does everything; anon gets nothing (denied).
GRANT SELECT, INSERT, UPDATE, DELETE ON usagentleads.leads TO leads_service;
GRANT EXECUTE ON FUNCTION usagentleads.refresh_states() TO leads_service;
