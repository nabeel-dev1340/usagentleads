# Lead ingestion

Pulls real-estate agent contacts from **official state licensing bulk data**
(public records published for download by the state agencies themselves — no
ToS-violating scraping of Zillow/realtor.com/etc.) and upserts them into the
self-hosted `usagentleads.leads` table on the VPS (see `infra/leads-db/README.md`).

Only four fields are ingested: **name, state, email, phone**.

- A row is kept when it has an **email or a phone**; only rows with neither are
  skipped.
- `email` is the dedup key (`on_conflict=email` + `resolution=ignore-duplicates`),
  so **existing rows are never modified** — their campaign history
  (`email1_sent_at`…, `replied`, `email_status`) stays intact.
- **Phone-only rows** have no unique key to conflict on (`email` is the only
  UNIQUE column, and Postgres treats NULLs as distinct, so they would re-insert
  on every run). `upsertLeads()` therefore checks them against the table by
  phone first and inserts only the ones not already present.
- `state` is the **licensing** state (full name, matching the valid list in
  `infra/leads-db/db/01-schema.sql`), not the mailing address state.

## Runbook

```bash
# 1. Preview — no DB writes, prints counts + sample (optionally dump a CSV to QA)
npm run ingest:mi -- --dry-run --csv /tmp/mi-preview.csv
npm run ingest:va -- --dry-run
npm run ingest:anywhere -- --dry-run --limit 600 --csv /tmp/anywhere-preview.csv
npm run ingest:compass -- --dry-run --limit 120

# 2. Live run — needs the VPS PostgREST credentials in the environment
#    (same LEADS_REST_URL / LEADS_REST_KEY the Vercel app uses)
LEADS_REST_URL=… LEADS_REST_KEY=… npm run ingest:mi
LEADS_REST_URL=… LEADS_REST_KEY=… npm run ingest:va
LEADS_REST_URL=… LEADS_REST_KEY=… npm run ingest:anywhere
LEADS_REST_URL=… LEADS_REST_KEY=… npm run ingest:compass -- --concurrency 8

# 3. Afterwards, refresh derived data:
#    - GET /api/cron/update-state-counts   (CRON_SECRET) → Supabase state_count
#    - GET /api/cron/generate-csvs         (CRON_SECRET) → state CSV exports
```

Flags: `--dry-run`, `--limit N` (cap rows, for testing), `--csv out.csv`
(dump normalized rows), `--batch N` (upsert batch size, default 1000),
`--concurrency N` (crawler workers, default 6 — `compass.mjs` only).

**Running on the VPS:** `anywhere.mjs` and `compass.mjs` need **no npm
packages** — only Node 20+ builtins and global `fetch` — so the `scripts/ingest`
folder plus the two env vars is enough. (`michigan.mjs` is the exception; it
needs `exceljs`.) `loadEnv()` looks for `.env.local`/`.env` two levels up from
`scripts/ingest/`, so outside a full checkout pass the credentials inline.
Compass is a ~35k-page crawl — run it under `nohup`/`tmux`; it is idempotent, so
a re-run after an interruption just re-upserts.

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

### Round-2 research (2026-07-17, via US VPS for geo-blocked sites)

Checked the next tier of states for bulk files with emails — none have free
scriptable downloads:

- **Oklahoma / South Carolina / Maine / Tennessee / Oregon / Massachusetts**:
  lookup-only portals; bulk data requires a records/data request to the agency.
- **Missouri**: moved to a Salesforce portal (MO PRO); no direct files.
- **New Hampshire**: publishes a real-estate roster xlsx on
  [oplc.nh.gov](https://www.oplc.nh.gov/list-oplc-licensees-and-their-license-types)
  but Akamai 403s all non-browser fetches — manual browser download works
  (email presence unverified; small state).
- **Vermont / Rhode Island**: eLicense portals have "roster download" exports,
  but VT's documented fields exclude email; both tiny.
- **Pennsylvania**: PALS has no public bulk-with-email; competitors sell 62k+
  PA agent emails, sourced via **Right-to-Know requests** to the Dept. of State.

## Brokerage / directory sources (2026-07-22)

State licensing files are tapped out, so this round looked at **brokerage and
directory sites** instead. Excluded by prior coverage: KW, Coldwell Banker,
Redfin, Zillow/Trulia, realtor.com, ForeclosureListingUSA, RE/MAX.

### Verified — implemented and run (2026-07-22)

| Source | Script | Volume | Fields | Access |
| --- | --- | --- | --- | --- |
| **Anywhere Real Estate API** (Century 21, ERA, Better Homes & Gardens, Sotheby's Int'l, Corcoran) | `anywhere.mjs` | 83,779 collected | name, **email**, businessPhone + cellPhone, state | plain JSON, no browser |
| **Compass** | `compass.mjs` | 31,648 of 35,215 pages | name, **email**, state (JSON-LD), phone (`tel:` link) | static HTML, plain curl |

First live run took the table from **1,050,046 → 1,140,099 rows (+90,053)**:
Compass +25,790, Anywhere +41,480 (first pass) and +22,783 (second pass after
the page-size fix below). Post-run totals: 1,053,845 rows with an email,
1,043,650 with a phone.

#### Two operational gotchas

**1. The Anywhere API 403s datacenter IPs.** CloudFront rejects the Hetzner/
RackNerd ranges outright — no header set gets around it — so `anywhere.mjs` has
to run from a residential connection. `compass.mjs` is unaffected and is the one
to run on a VPS (it is also the long crawl).

**2. `numPerPage` is capped by an upstream gRPC message limit.** Large pages
fail with `HTTP 400 … "grpc: received message larger than max"`. It is
**deterministic, not throttling** — retrying never helps, and a failed page 1
silently costs a whole brand+state. Brands with bulkier records (Sotheby's,
Better Homes, Corcoran) blow the limit first: PA/SIR works at `numPerPage=200`
and fails at 250. `anywhere.mjs` now probes `500 → 200 → 100 → 50` per
brand+state, keeps the winning size for that combo's pagination, and does not
retry deterministic 4xx. That took failures from 35 pages to 2 and the harvest
from 57,183 to 83,779.

> Watch the log for `fell back to numPerPage=` (expected, ~35 combos) and
> `gave up` (investigate). A re-run is always safe — the upsert is idempotent.

**Anywhere** — one endpoint and one static key serve every brand:

```
GET https://www.century21.com/api/agents
      ?brandCode=C21            # C21 | ERA | BHG | SIR | COR  (CB excluded)
      &placeMasterId=<state id> # from /api/places?brand=C21&canonicalUrl=/state/tx
      &page=1&numPerPage=500
      &considerDisplayOptions=true
      &locationTypes=officePhysicalLocations,areasServedLocations
      &searchContext=new&sortKey=lastName
      &selectFields=agentMasterId,basicPersonInfo,companyOfficeAssociation,preferences,canonicalURL,licenses,starRating
Header: x-api-key: svbyT7C7Hw7d8D7GxJsi
```

State-level `placeMasterId`s mean the whole network is **50 states × 5 brands**,
not 30k city pages. `canonicalUrl` (`/ca/twain-harte/agents/…`) carries the
state. Pagination runs clean to the end; `numPerPage=500` works. The API
rate-limits under concurrency — retry with backoff (`lib.mjs` already does this
for upserts; the fetch side needs its own).

Measured on a 1,000-row sample across CA/NY/FL/TX/IL/NJ and all five brands:
**100% email**, 72–99% phone, 999/1000 emails unique, 43% personal free-mail
(gmail/yahoo — real agent addresses, not just brokerage aliases), 129 domains.

Per-state totals are weighted toward our thinnest states: CA 10,736 · FL 9,361 ·
NY 7,367 · NJ 6,331 · TX 5,251 · GA 4,228. Brand split: C21 38,799 ·
SIR 21,806 · ERA 11,428 · BHG 10,262 · COR 4,498.

**Compass** — `https://www.compass.com/sitemaps/agent-pages/index.xml` lists
35,215 profile URLs; each page embeds a JSON-LD `@graph` whose
`["Person","RealEstateAgent"]` node has `name`, `email`, and
`address.addressRegion`. Note `@type` is an **array** and the payload is
`/`-escaped. Phone is only in the `tel:` href, not the JSON-LD. Sampled 25
spread across the sitemap: **92% email + state**. Emails are uniformly
`first.last@compass.com` — deliverable but brokerage-routed, so lower intent
value than the Anywhere mix. robots.txt disallows `/agent/` (singular); the
profile pages are `/agents/` and the sitemap is explicitly declared.

### BHHS — implemented (2026-07-22), +28,411 rows

**Berkshire Hathaway HomeServices**, `bhhs.py` + `import-csv.mjs`. The site is
entirely behind Cloudflare, but its agent search calls a Solr servlet that
returns everything we need:

```
/bin/bhhs/solrAgentSearchServlet?state=TX&resultSize=100&sortType=3&page=N
```

OData-shaped: `@odata.count` plus a `value[]` of records with `MemberFullName`,
`MemberEmail`, `MemberMobilePhone`, `MemberOfficePhone`,
`MemberStateOrProvince`. An unfiltered call reports **41,408** agents; harvesting
by state yielded **40,105 rows (96% email, 100% phone)**, of which 28,411 were
new.

Because plain curl gets a Cloudflare 403, `bhhs.py` drives pydoll and calls the
servlet **from inside the cleared page**, so the request inherits the clearance
cookies. It writes a `name,state,email,phone` CSV; `import-csv.mjs` does the
upsert, keeping the dedup rules in `lib.mjs` rather than reimplementing them in
Python.

```bash
python3 scripts/ingest/bhhs.py --out /tmp/bhhs.csv          # ~25 min, headful
LEADS_REST_URL=… LEADS_REST_KEY=… node scripts/ingest/import-csv.mjs /tmp/bhhs.csv
```

`resultSize` is capped near 100 server-side. Pages return slightly fewer rows
than requested (undisplayed members), so paging stops on an **empty** page, not
a short one. The page load event never fires (third-party trackers), so the
navigation timeout is caught and ignored.

### HAR.com — blocked by PerimeterX, adapter ready

`har.mjs` is written and verified (64,719 agent URLs from the gzipped
`profiles_*` sitemaps; sampling gave name + phone on ~78% of profiles, all TX,
and **phones are per-agent direct lines — 31/31 unique**, so phone works as a
dedup key). It is **phone-only**: HAR exposes no agent emails at all.

**It is not ingested yet.** A concurrency-8 run tripped HAR's PerimeterX bot
protection after ~500 requests (`px-captcha`, "Access to this page has been
denied") and got the IP blocked — a real browser via pydoll is blocked too, so
it is IP-level, not headers. Also note HAR **403s datacenter IPs** for profile
pages even when the sitemaps fetch fine, so the VPS is not an escape hatch.

If retried: the defaults are now 1 worker at `HAR_PAGE_DELAY_MS=800`
(≈14 h for the full set) and the crawl **upserts every 2,000 rows**
(`HAR_FLUSH_EVERY`) so an interruption or a fresh ban does not throw away the
whole run — the first attempt lost all 113 collected rows exactly this way.

> Caveat worth weighing before spending a day on it: with no email, these rows
> can only be deduped by phone. An agent already in the table under an email row
> with a different or NULL phone will be inserted a second time.

### Florida's 71k missing emails — `enrich.mjs`

Florida sits at **62% email coverage** against 95–99% for every other large
state: 187,149 rows, 116,114 with an email, **71,035 without**. That single gap
is ~80% of all email-less rows in the table. The cause is the source: DBPR's
public licensee extracts carry name/address/license/status and **no email
column**, even though §455.275(1) FS requires licensees to give DBPR one.

Measured (2026-07-22) against the live table:

| | rows |
| --- | --- |
| FL rows with no email | 71,035 |
| …name matches an emailed FL row | 3,928 (3,859 unique) |
| …phone matches an emailed FL row | 1,160 |
| **needs an external source** | **~69,875** |

So internal fixes cover ~5%. The unlock is a **public-records request to DBPR**
(emails are public record in Florida; the Ch. 119 exemptions cover protected
professions, not licensees). Request portal: `fldbpr.mycusthelp.com`, Division
of Real Estate, 400 W Robinson St N801, Orlando FL 32801, 850.487.1395.

`enrich.mjs` applies whatever comes back:

```bash
node scripts/ingest/enrich.mjs dbpr-emails.csv --state Florida --dry-run
LEADS_REST_URL=… LEADS_REST_KEY=… node scripts/ingest/enrich.mjs dbpr-emails.csv --state Florida
```

Unlike every other script here it **updates existing rows** rather than
inserting (`on_conflict=id` + `resolution=merge-duplicates`, so only the `email`
column is written). Matching is intentionally conservative — a wrong match
attaches a stranger's email to a lead — so it only acts when exactly one
email-less row matches, first by name+state, then by phone; ambiguous matches
are counted and skipped. Rows that already have an email are never touched, and
any address already present elsewhere is skipped so the UNIQUE index cannot
reject a batch.

> The ~3,900 name-matching rows are **not** an enrichment opportunity: that
> email already exists on the other row, so it cannot be copied. They are
> probably the same person ingested twice (a DBPR name-only row plus a brokerage
> row). Fixing those is deletion, not enrichment, and name alone is too weak to
> do it safely — `maria gonzalez|florida` alone spans 42 rows.

### Hard — browser-gated

- **eXp Realty** (~70k US agents): Cloudflare + a GraphQL API at
  `agentdir-api.expproptech.com/graphql` that requires a **fresh reCAPTCHA v3
  token per search**, 12 results/page. Only drivable in-browser (pydoll headful
  gets past Cloudflare; headless does not). Poor rows-per-minute for the size.
- **HomeSmart** (~24k), **Howard Hanna** (~13k), **LPT**, **Long & Foster**,
  **John L. Scott**, **Baird & Warner**: Cloudflare interstitial. pydoll headful
  renders them; each still needs its own list→profile crawl.
- **Crye-Leike** (~3.2k): custom proof-of-work gate; renders under pydoll, but
  office agent lists showed no emails. Low value for the effort.
- **BHHS / HomeServices of America** (~50k): AEM site, no agent sitemap, agent
  paths not yet located. Biggest unclaimed prize after eXp — worth another look.

### Phone-only (needs a pipeline change first)

- **HAR.com** (Houston Association of REALTORS, ~42k TX members): profile pages
  at `/{name-slug}/agent_{id}` expose name + `telephone` via JSON-LD, and
  `sitemap.har.com/sitemap.xml` has 4 `profiles_` sitemaps. **No email** —
  contact is form-only. Blocked for plain curl UAs; a full browser header set
  gets 200s.

This is the largest phone-only pool found. `upsertLeads()` now accepts
phone-only rows (see the phone-dedup note at the top), so HAR is unblocked —
it just needs an adapter and a browser-ish header set to get 200s.

### Paths to grow further (in order of value)

1. **Anywhere API, then Compass** (see above) — ~122k rows with emails, no
   records requests and no browser. Highest value per hour of work by a wide
   margin; build `anywhere.mjs` first.
2. **Records requests** (free/cheap, slower): PA Right-to-Know, MA, TN, SC, OK,
   OR, MO, WA public-records requests for licensee name + email. This is how
   list vendors build their coverage. Biggest single win: **Florida DBPR** —
   licensee emails are public record under Ch. 455 but excluded from the web
   extracts; a records request for the email file could fill the ~71k FL rows
   that have no email today (needs an UPDATE path, not the insert-only upsert).
3. **Re-run MI/VA monthly** — both scripts are idempotent; each run picks up
   newly licensed agents.
4. **Cheap paid lists**: Alabama AREC [List Request](https://arec.alabama.gov/apps/listrequest)
   ($10/list, "address information" — confirm email with arec@arec.alabama.gov before buying);
   **North Carolina NCREC** [data subscription / roster orders](https://www.ncrec.gov/orderform)
   (~100k licensees; our NC coverage is thin); **Georgia GREC** licensee files
   (~100k licensees).
5. **ARELLO national licensee DB**: license-verification data only, no emails —
   not useful for contacts.

## Adding a new source

Write a `<state>.mjs` that produces `{ name, state, email, phone }` objects and
hand them to `upsertLeads()` from `lib.mjs` — validation, in-file dedup,
batching, retries, and the ignore-duplicates upsert are all handled there.
Verify the source actually contains emails before writing the adapter.
