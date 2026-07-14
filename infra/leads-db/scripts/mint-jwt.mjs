// Mints the long-lived PostgREST access token the app uses as LEADS_REST_KEY.
// The token's `role` claim is "leads_service", so requests bearing it run with
// full read/write access to usagentleads.leads. No `exp` claim -> never expires
// (rotate by changing PGRST_JWT_SECRET and re-minting).
//
// Usage:  PGRST_JWT_SECRET=... node scripts/mint-jwt.mjs
import crypto from "node:crypto";

const secret = process.env.PGRST_JWT_SECRET;
if (!secret || secret.length < 32) {
  console.error("Set PGRST_JWT_SECRET (>= 32 chars) — same value as in your .env");
  process.exit(1);
}

const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");
const signingInput = `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url({ role: "leads_service" })}`;
const signature = crypto.createHmac("sha256", secret).update(signingInput).digest("base64url");

console.log(`${signingInput}.${signature}`);
