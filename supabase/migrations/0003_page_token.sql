-- Add page_token column to purchases table for secure purchase-success page lookup
-- The page_token is generated at checkout and embedded in the redirect URL,
-- so only the buyer who completes checkout can look up their purchase.

ALTER TABLE usagentleads.purchases
  ADD COLUMN IF NOT EXISTS page_token uuid;

CREATE INDEX IF NOT EXISTS idx_usagentleads_purchases_page_token
  ON usagentleads.purchases(page_token)
  WHERE page_token IS NOT NULL;
