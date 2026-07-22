// Shared helpers for the lead-ingestion scripts (scripts/ingest/*.mjs).
//
// Normalized lead shape: { name, state, email, phone } — the only four fields
// we ingest. `state` must be a full state name from the valid list in
// infra/leads-db/db/01-schema.sql (refresh_states() DELETEs anything else).
// A lead is worth keeping if it has an email **or** a phone; only rows with
// neither are dropped.
//
// Upserts go to the self-hosted PostgREST in front of the VPS Postgres (see
// infra/leads-db/README.md): POST /rest/v1/leads?on_conflict=email with
// Prefer: resolution=ignore-duplicates. Existing rows carry email-campaign
// state (email1_sent_at…email6_sent_at, replied, …) and must never be
// overwritten — ignore-duplicates guarantees only brand-new emails insert.

import { existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..")

export function loadEnv() {
  for (const f of [".env.local", ".env"]) {
    const p = path.join(ROOT, f)
    if (!existsSync(p)) continue
    for (const line of readFileSync(p, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
      }
    }
  }
}

export function parseArgs(argv = process.argv.slice(2)) {
  const args = { dryRun: false, limit: Infinity, csv: null, batch: 1000, concurrency: 6 }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === "--dry-run") args.dryRun = true
    else if (a === "--limit") args.limit = Number(argv[++i])
    else if (a === "--csv") args.csv = argv[++i]
    else if (a === "--batch") args.batch = Number(argv[++i])
    else if (a === "--concurrency") args.concurrency = Number(argv[++i])
    else {
      console.error(`unknown argument: ${a}`)
      console.error(
        "usage: node <script> [--dry-run] [--limit N] [--csv out.csv] [--batch N] [--concurrency N]"
      )
      process.exit(2)
    }
  }
  return args
}

const EMAIL_RE = /^[a-z0-9._%+'-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/
const JUNK_EMAIL = /noemail|nomail|none@|@none\.|no@no|donotemail|test@test/

export function cleanEmail(raw) {
  const e = String(raw ?? "").trim().toLowerCase()
  if (!e || e.length > 254 || !EMAIL_RE.test(e) || JUNK_EMAIL.test(e)) return null
  return e
}

export function titleCase(raw) {
  const s = String(raw ?? "").replace(/\s+/g, " ").trim()
  if (!s) return null
  return s.toLowerCase().replace(/(^|[\s\-'.])([a-z])/g, (_, b, c) => b + c.toUpperCase())
}

// Brokerage sources give two-letter states; the table wants full names.
const STATE_NAMES = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan",
  MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
  NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota",
  OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
  TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
}

/** Two-letter code (or already-full name) -> full state name, else null. */
export function stateName(raw) {
  const s = String(raw ?? "").trim()
  if (!s) return null
  const upper = s.toUpperCase()
  if (STATE_NAMES[upper]) return STATE_NAMES[upper]
  const full = Object.values(STATE_NAMES).find((n) => n.toLowerCase() === s.toLowerCase())
  return full ?? null
}

/**
 * Circuit breaker for crawlers.
 *
 * When a site starts blocking us, every remaining request is both useless and
 * abusive — the @properties run burned 3,876 requests against a server that was
 * already returning 403, and HAR's PerimeterX ban happened the same way. Trip
 * after N consecutive failures and stop, rather than grinding to the end.
 *
 *   const guard = createFailureGuard({ label: "@properties" })
 *   ... guard.tripped -> stop; guard.ok() on success; guard.fail() on failure
 */
export function createFailureGuard({ threshold = 40, label = "source" } = {}) {
  let consecutive = 0
  let tripped = false
  return {
    get tripped() {
      return tripped
    },
    get consecutive() {
      return consecutive
    },
    ok() {
      consecutive = 0
    },
    fail() {
      consecutive++
      if (!tripped && consecutive >= threshold) {
        tripped = true
        console.error(
          `\n  ! ${label}: ${consecutive} consecutive failures — aborting.\n` +
            `    Almost certainly rate-limited or IP-blocked. Re-run later with lower --concurrency;\n` +
            `    the upsert is idempotent so nothing already collected is lost.`
        )
      }
      return tripped
    },
  }
}

export function cleanPhone(raw) {
  const digits = String(raw ?? "").replace(/\D/g, "")
  if (digits.length === 10) return digits
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1)
  return null
}

async function postBatch(endpoint, key, rows, attempt = 1) {
  let res
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "Content-Profile": "usagentleads",
        Prefer: "resolution=ignore-duplicates,return=representation",
      },
      body: JSON.stringify(rows),
      signal: AbortSignal.timeout(120_000),
    })
  } catch (err) {
    if (attempt >= 4) throw err
    await new Promise((r) => setTimeout(r, attempt * 3000))
    return postBatch(endpoint, key, rows, attempt + 1)
  }
  if (res.status >= 500 && attempt < 4) {
    await new Promise((r) => setTimeout(r, attempt * 3000))
    return postBatch(endpoint, key, rows, attempt + 1)
  }
  if (!res.ok) {
    throw new Error(`PostgREST ${res.status}: ${(await res.text()).slice(0, 500)}`)
  }
  return res.json()
}

/**
 * Look up which of `phones` already exist in the table, so phone-only rows can
 * be filtered before insert. `email` is the only UNIQUE column, and Postgres
 * treats NULL emails as distinct — without this check every phone-only row
 * would re-insert on each run instead of being ignored as a duplicate.
 */
async function existingPhones(url, key, phones, chunk = 400) {
  const found = new Set()
  const base = `${url.replace(/\/$/, "")}/rest/v1/leads`
  for (let i = 0; i < phones.length; i += chunk) {
    const slice = phones.slice(i, i + chunk)
    const res = await fetch(`${base}?select=phone&phone=in.(${slice.join(",")})`, {
      headers: {
        Authorization: `Bearer ${key}`,
        "Accept-Profile": "usagentleads",
      },
      signal: AbortSignal.timeout(120_000),
    })
    if (!res.ok) throw new Error(`PostgREST ${res.status}: ${(await res.text()).slice(0, 300)}`)
    for (const r of await res.json()) found.add(r.phone)
    process.stdout.write(`\r  checking existing phones ${Math.min(i + chunk, phones.length)}/${phones.length}`)
  }
  if (phones.length) process.stdout.write("\n")
  return found
}

/**
 * Upsert normalized leads. A row is kept when it has an email **or** a phone;
 * only rows with neither are skipped.
 *
 * Rows with an email go through the `on_conflict=email` upsert as before.
 * Phone-only rows have no unique key to conflict on, so they are de-duplicated
 * against the table by phone first and then plain-inserted.
 *
 * Returns { unique, dupesInFile, skippedNoContact, inserted, alreadyKnown }.
 * With dryRun no network calls are made.
 */
export async function upsertLeads(leads, { dryRun = false, batch = 1000 } = {}) {
  const seenEmail = new Set()
  const seenPhone = new Set()
  const emailRows = []
  const phoneRows = []
  let skippedNoContact = 0

  for (const l of leads) {
    const email = l.email || null
    const phone = l.phone || null
    const row = { name: l.name, state: l.state, email, phone }
    if (email) {
      if (seenEmail.has(email)) continue
      seenEmail.add(email)
      emailRows.push(row)
    } else if (phone) {
      // Two agents can share an office line, but we cannot tell them apart
      // without an email, so one phone == one lead.
      if (seenPhone.has(phone)) continue
      seenPhone.add(phone)
      phoneRows.push(row)
    } else {
      skippedNoContact++
    }
  }

  const rows = [...emailRows, ...phoneRows]
  const dupesInFile = leads.length - rows.length - skippedNoContact

  if (dryRun) {
    console.log(
      `\n[dry-run] would upsert ${rows.length} unique leads ` +
        `(${emailRows.length} with email, ${phoneRows.length} phone-only, ` +
        `${dupesInFile} in-file duplicates dropped, ${skippedNoContact} skipped with no email or phone)`
    )
    console.log("[dry-run] sample:", JSON.stringify(rows.slice(0, 5), null, 2))
    return { unique: rows.length, dupesInFile, skippedNoContact, inserted: 0, alreadyKnown: 0 }
  }

  loadEnv()
  const url = process.env.LEADS_REST_URL
  const key = process.env.LEADS_REST_KEY
  if (!url || !key) {
    throw new Error("LEADS_REST_URL / LEADS_REST_KEY are not set (see infra/leads-db/README.md)")
  }

  let inserted = 0

  const emailEndpoint = `${url.replace(/\/$/, "")}/rest/v1/leads?on_conflict=email&select=id`
  for (let i = 0; i < emailRows.length; i += batch) {
    const chunk = emailRows.slice(i, i + batch)
    const returned = await postBatch(emailEndpoint, key, chunk)
    inserted += returned.length
    process.stdout.write(
      `\r  upserted ${Math.min(i + batch, emailRows.length)}/${emailRows.length} with-email — new rows: ${inserted}`
    )
  }
  if (emailRows.length) process.stdout.write("\n")

  if (phoneRows.length) {
    const known = await existingPhones(url, key, phoneRows.map((r) => r.phone))
    const fresh = phoneRows.filter((r) => !known.has(r.phone))
    console.log(`  phone-only: ${fresh.length} new, ${phoneRows.length - fresh.length} already in table`)

    const phoneEndpoint = `${url.replace(/\/$/, "")}/rest/v1/leads?select=id`
    for (let i = 0; i < fresh.length; i += batch) {
      const chunk = fresh.slice(i, i + batch)
      const returned = await postBatch(phoneEndpoint, key, chunk)
      inserted += returned.length
      process.stdout.write(`\r  inserted ${Math.min(i + batch, fresh.length)}/${fresh.length} phone-only`)
    }
    if (fresh.length) process.stdout.write("\n")
  }

  return { unique: rows.length, dupesInFile, skippedNoContact, inserted, alreadyKnown: rows.length - inserted }
}

export function writeCsv(file, rows) {
  const esc = (v) => {
    const s = String(v ?? "")
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = ["name,state,email,phone"]
  for (const r of rows) lines.push([r.name, r.state, r.email, r.phone].map(esc).join(","))
  writeFileSync(file, lines.join("\n") + "\n")
  console.log(`wrote ${rows.length} rows to ${file}`)
}

export function printSummary(source, stats) {
  console.log(`\n=== ${source} summary ===`)
  for (const [k, v] of Object.entries(stats)) console.log(`  ${k}: ${v}`)
  console.log(
    "\nNext steps after a live run:\n" +
      "  1. GET /api/cron/update-state-counts (with CRON_SECRET) so Supabase state_count reflects the new rows\n" +
      "  2. GET /api/cron/generate-csvs to rebuild the state CSV exports"
  )
}
