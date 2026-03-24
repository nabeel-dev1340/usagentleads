-- =============================================
-- 1. Update subscriptions plan CHECK constraint
--    to allow 'pro_api' alongside 'pro_monthly'
-- =============================================
ALTER TABLE usagentleads.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_check;

ALTER TABLE usagentleads.subscriptions
  ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('pro_monthly', 'pro_api'));

-- =============================================
-- 2. API Keys table
-- =============================================
CREATE TABLE usagentleads.api_keys (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name            text NOT NULL DEFAULT 'Default'
                  CHECK (char_length(name) >= 1 AND char_length(name) <= 50),
  key_prefix      text NOT NULL,
  key_hash        text NOT NULL UNIQUE,
  last_used_at    timestamptz,
  expires_at      timestamptz,
  revoked_at      timestamptz,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_usagentleads_api_keys_user_id ON usagentleads.api_keys(user_id);
CREATE INDEX idx_usagentleads_api_keys_key_hash ON usagentleads.api_keys(key_hash);

ALTER TABLE usagentleads.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own API keys"
  ON usagentleads.api_keys FOR SELECT
  USING (auth.uid() = user_id);

-- =============================================
-- 3. API Usage Logs table
-- =============================================
CREATE TABLE usagentleads.api_usage_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id      uuid REFERENCES usagentleads.api_keys(id) ON DELETE SET NULL,
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  endpoint        text NOT NULL,
  status_code     integer NOT NULL CHECK (status_code >= 100 AND status_code < 600),
  ip_address      text,
  user_agent      text,
  response_time_ms integer,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_usagentleads_api_usage_user_id ON usagentleads.api_usage_logs(user_id);
CREATE INDEX idx_usagentleads_api_usage_created_at ON usagentleads.api_usage_logs(created_at);
CREATE INDEX idx_usagentleads_api_usage_quota ON usagentleads.api_usage_logs(user_id, created_at, status_code);

ALTER TABLE usagentleads.api_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own API usage logs"
  ON usagentleads.api_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

-- =============================================
-- 4. Grants: service_role full, authenticated SELECT only, anon nothing
-- =============================================
GRANT USAGE ON SCHEMA usagentleads TO service_role;
GRANT ALL ON usagentleads.api_keys TO service_role;
GRANT ALL ON usagentleads.api_usage_logs TO service_role;

GRANT SELECT ON usagentleads.api_keys TO authenticated;
GRANT SELECT ON usagentleads.api_usage_logs TO authenticated;

REVOKE ALL ON usagentleads.api_keys FROM anon;
REVOKE ALL ON usagentleads.api_usage_logs FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES ON usagentleads.api_keys FROM authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES ON usagentleads.api_usage_logs FROM authenticated;
