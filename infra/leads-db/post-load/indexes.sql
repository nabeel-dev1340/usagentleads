-- The eight secondary indexes on usagentleads.leads, byte-for-byte matching what
-- Supabase had. Run by scripts/migrate-leads.sh AFTER the data is COPYed in.
-- (leads_pkey and leads_email_key already exist from the table definition.)

CREATE INDEX IF NOT EXISTS idx_leads_email
  ON usagentleads.leads USING btree (email);

CREATE INDEX IF NOT EXISTS idx_leads_state
  ON usagentleads.leads USING btree (state);

CREATE INDEX IF NOT EXISTS idx_leads_state_name_id
  ON usagentleads.leads USING btree (state, name, id);

CREATE INDEX IF NOT EXISTS idx_leads_state_name_trgm
  ON usagentleads.leads USING gin (state, name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_leads_name_trgm
  ON usagentleads.leads USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_leads_first_time
  ON usagentleads.leads USING btree (created_at) WHERE email1_sent_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS leads_phone_only_key
  ON usagentleads.leads USING btree (phone) WHERE email IS NULL;

CREATE INDEX IF NOT EXISTS idx_leads_followup
  ON usagentleads.leads USING btree (email1_sent_at) WHERE email1_sent_at IS NOT NULL;

ANALYZE usagentleads.leads;
