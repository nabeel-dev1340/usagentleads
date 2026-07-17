# Lead ingestion

Pulls real-estate agent contacts from **official state licensing bulk data**
(public records published for download by the state agencies themselves — no
ToS-violating scraping of Zillow/realtor.com/etc.) and upserts them into the
self-hosted `usagentleads.leads` table on the VPS (see `infra/leads-db/README.md`).

Only four fields are ingested: **name, state, email, phone**.

- `email` is the dedup key (`on_conflict=email` + `resolution=ignore-duplicates`),
  so **existing rows are never modified** — their campaign history
  (`email1_sent_at`…, `replied`, `email_status`) stays intact. Rows without a
  valid email are skipped entirely.
- `state` is the **licensing** state (full name, matching the valid list in
  `infra/leads-db/db/01-schema.sql`), not the mailing address state.

## Runbook

```bash
# 1. Preview — no DB writes, prints counts + sample (optionally dump a CSV to QA)
npm run ingest:mi -- --dry-run --csv /tmp/mi-preview.csv
npm run ingest:va -- --dry-run

# 2. Live run — needs the VPS PostgREST credentials in the environment
#    (same LEADS_REST_URL / LEADS_REST_KEY the Vercel app uses)
LEADS_REST_URL=… LEADS_REST_KEY=… npm run ingest:mi
LEADS_REST_URL=… LEADS_REST_KEY=… npm run ingest:va

# 3. Afterwards, refresh derived data:
#    - GET /api/cron/update-state-counts   (CRON_SECRET) → Supabase state_count
#    - GET /api/cron/generate-csvs         (CRON_SECRET) → state CSV exports
```

Flags: `--dry-run`, `--limit N` (cap rows, for testing), `--csv out.csv`
(dump normalized rows), `--batch N` (upsert batch size, default 1000).

## Verified sources (2026-07-17)

| State | Script | Source | Rows w/ email | Phone? |
| --- | --- | --- | --- | --- |
| Michigan | `michigan.mjs` | LARA "FOIA-Real Estate Brokers/Salesperson List" — self-serve report on [License Lists and Reports](https://www.michigan.gov/lara/bureau-list/bpl/license-lists-and-reports), generated on demand via Accela (`reportID=32411`), returns xlsx | ~52k active individuals | no |
| Virginia | `virginia.mjs` | DPOR [Regulant Lists](https://www.dpor.virginia.gov/RegulantLists) — free tab-delimited `.txt` per license type; board 0225 = Real Estate (`0225s/a/p/o_act.txt`) | ~49.5k active individuals | no |

Neither state publishes phone numbers in these files; `phone` is inserted as
NULL and can be enriched later.

## Dead ends — don't re-research these

Checked 2026-07-17; most states have removed contact info from public files:

- **Texas TREC**: all contact fields (email/phone/address) *withheld under
  SB 510* since 2021 — both the legacy `trecfile.txt` and the
  [data.texas.gov datasets](https://data.texas.gov/dataset/Broker-and-Sales-Agent-License-Holder-Information/s7ft-44qi/about_data) have license data only.
- **Florida DBPR**: [licensee extracts](https://www2.myfloridalicense.com/real-estate-commission/public-records/)
  have name/address/status but **no email column** (this is why 71k of our FL
  rows lack emails).
- **Ohio**: the daily REPL database file
  (`dam.assets.ohio.gov/raw/upload/com.ohio.gov/REPL/LPI/repl_LicenseLookUpwithAffiliations.xlsx`,
  96k rows) has no email/phone columns.
- **Iowa**: emails confidential by statute (Iowa Code §10A.508).
- **Alaska**: bulk CSV exists but sits behind DataDome bot protection — manual
  browser download works if ever needed.
- **CO / CT / WA / NY open-data portals**: license datasets exist but contain
  no email or phone columns.
- **Montana**: downloadable list exists but excludes phone; tiny population.

### Paid fallbacks (if more volume is ever needed)

- **North Carolina NCREC** — [data subscription / roster orders](https://www.ncrec.gov/orderform)
  (~100k licensees; our NC coverage is thin).
- **Georgia GREC** — sells licensee data files (~100k licensees).

## Adding a new source

Write a `<state>.mjs` that produces `{ name, state, email, phone }` objects and
hand them to `upsertLeads()` from `lib.mjs` — validation, in-file dedup,
batching, retries, and the ignore-duplicates upsert are all handled there.
Verify the source actually contains emails before writing the adapter.
