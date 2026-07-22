// Upserts a normalized `name,state,email,phone` CSV into usagentleads.leads.
//
// Exists for sources that cannot be a plain fetch script — currently `bhhs.py`,
// which needs a real browser to get past Cloudflare and so harvests to CSV.
// Keeping the upsert here means the dedup rules (email key, phone-only path,
// email-or-phone requirement) have exactly one implementation in lib.mjs.
//
//   node scripts/ingest/import-csv.mjs /tmp/bhhs.csv --dry-run
//   LEADS_REST_URL=… LEADS_REST_KEY=… node scripts/ingest/import-csv.mjs /tmp/bhhs.csv

import { readFileSync } from "node:fs"
import { cleanEmail, cleanPhone, parseArgs, printSummary, stateName, titleCase, upsertLeads } from "./lib.mjs"

/** Minimal RFC4180 reader — handles quoted fields, embedded commas and "" escapes. */
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ""
  let quoted = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else quoted = false
      } else field += c
    } else if (c === '"') {
      quoted = true
    } else if (c === ",") {
      row.push(field)
      field = ""
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++
      row.push(field)
      field = ""
      if (row.some((v) => v !== "")) rows.push(row)
      row = []
    } else field += c
  }
  row.push(field)
  if (row.some((v) => v !== "")) rows.push(row)
  return rows
}

const file = process.argv[2]
if (!file || file.startsWith("--")) {
  console.error("usage: node scripts/ingest/import-csv.mjs <file.csv> [--dry-run] [--batch N]")
  process.exit(2)
}
const args = parseArgs(process.argv.slice(3))

const rows = parseCsv(readFileSync(file, "utf8"))
const header = rows.shift()?.map((h) => h.trim().toLowerCase()) ?? []
for (const required of ["name", "state", "email", "phone"]) {
  if (!header.includes(required)) {
    console.error(`CSV is missing a "${required}" column (found: ${header.join(", ")})`)
    process.exit(2)
  }
}
const idx = Object.fromEntries(header.map((h, i) => [h, i]))

let malformed = 0
const leads = []
for (const r of rows) {
  const name = titleCase(r[idx.name])
  const state = stateName(r[idx.state])
  const email = cleanEmail(r[idx.email])
  const phone = cleanPhone(r[idx.phone])
  if (!name || !state || (!email && !phone)) {
    malformed++
    continue
  }
  leads.push({ name, state, email, phone })
}

console.log(`read ${rows.length} rows from ${file} — ${leads.length} usable, ${malformed} unusable`)
if (Number.isFinite(args.limit)) leads.length = Math.min(leads.length, args.limit)

const stats = await upsertLeads(leads, { dryRun: args.dryRun, batch: args.batch })
printSummary(`CSV import (${file})`, {
  "rows in file": rows.length,
  "unusable (no name/state or no contact)": malformed,
  "with email": leads.filter((l) => l.email).length,
  "with phone": leads.filter((l) => l.phone).length,
  ...stats,
})
