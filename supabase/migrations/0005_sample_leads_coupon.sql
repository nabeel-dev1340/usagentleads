-- Per-lead dynamic discount: the day-6 drip mints a unique, single-use Lemon
-- Squeezy code with a real expiry and records it on the lead.
alter table usagentleads.sample_leads
  add column if not exists coupon_code text,
  add column if not exists coupon_expires_at timestamptz;
