// Shared helpers for the lead-ingestion scripts (scripts/ingest/*.mjs).
//
// Normalized lead shape: { name, state, email, phone } — the only four fields
// we ingest. `state` must be a full state name from the valid list in
// infra/leads-db/db/01-schema.sql (refresh_states() DELETEs anything else).
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
  const args = { dryRun: false, limit: Infinity, csv: null, batch: 1000 }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === "--dry-run") args.dryRun = true
    else if (a === "--limit") args.limit = Number(argv[++i])
    else if (a === "--csv") args.csv = argv[++i]
    else if (a === "--batch") args.batch = Number(argv[++i])
    else {
      console.error(`unknown argument: ${a}`)
      console.error("usage: node <script> [--dry-run] [--limit N] [--csv out.csv] [--batch N]")
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
 * Upsert normalized leads. Returns { unique, dupesInFile, inserted, alreadyKnown }.
 * With dryRun no network calls are made.
 */
export async function upsertLeads(leads, { dryRun = false, batch = 1000 } = {}) {
  const seen = new Set()
  const rows = []
  for (const l of leads) {
    if (!seen.has(l.email)) {
      seen.add(l.email)
      rows.push({ name: l.name, state: l.state, email: l.email, phone: l.phone ?? null })
    }
  }
  const dupesInFile = leads.length - rows.length

  if (dryRun) {
    console.log(`\n[dry-run] would upsert ${rows.length} unique leads (${dupesInFile} in-file duplicates dropped)`)
    console.log("[dry-run] sample:", JSON.stringify(rows.slice(0, 5), null, 2))
    return { unique: rows.length, dupesInFile, inserted: 0, alreadyKnown: 0 }
  }

  loadEnv()
  const url = process.env.LEADS_REST_URL
  const key = process.env.LEADS_REST_KEY
  if (!url || !key) {
    throw new Error("LEADS_REST_URL / LEADS_REST_KEY are not set (see infra/leads-db/README.md)")
  }
  const endpoint = `${url.replace(/\/$/, "")}/rest/v1/leads?on_conflict=email&select=id`

  let inserted = 0
  for (let i = 0; i < rows.length; i += batch) {
    const chunk = rows.slice(i, i + batch)
    const returned = await postBatch(endpoint, key, chunk)
    inserted += returned.length
    process.stdout.write(`\r  upserted ${Math.min(i + batch, rows.length)}/${rows.length} — new rows: ${inserted}`)
  }
  process.stdout.write("\n")
  return { unique: rows.length, dupesInFile, inserted, alreadyKnown: rows.length - inserted }
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
