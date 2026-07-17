// Virginia — DPOR Real Estate Board regulant lists.
//
// Source (verified 2026-07-17): free public downloads on
//   https://www.dpor.virginia.gov/RegulantLists
// Board 0225 = Real Estate. We take the *active* files only:
//   0225s_act.txt  salespersons (~43k rows)
//   0225a_act.txt  associate brokers
//   0225p_act.txt  principal brokers
//   0225o_act.txt  business entities (skipped automatically — no INDIVIDUAL NAME)
// Format: tab-delimited, one header row. Relevant columns: INDIVIDUAL NAME
// (first-name-first), EMAILADDRESS, LICENSE RANK. Email is included; phone is
// not published. Names are UPPERCASE and get title-cased.
//
// Usage: node scripts/ingest/virginia.mjs [--dry-run] [--limit N] [--csv out.csv]

import { cleanEmail, parseArgs, printSummary, titleCase, upsertLeads, writeCsv } from "./lib.mjs"

const BASE = "https://www.dpor.virginia.gov/sites/default/files/Records%20and%20Documents/Regulant%20List/"
const FILES = ["0225s_act.txt", "0225a_act.txt", "0225p_act.txt", "0225o_act.txt"]
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

async function fetchList(file) {
  const res = await fetch(BASE + file, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(300_000),
  })
  if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`)
  // DPOR serves windows-1252-ish text; latin1 avoids mangling accented names
  return Buffer.from(await res.arrayBuffer()).toString("latin1")
}

function parseList(text, file) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  const header = lines[0].split("\t").map((h) => h.trim().toUpperCase())
  const nameCol = header.indexOf("INDIVIDUAL NAME")
  const emailCol = header.indexOf("EMAILADDRESS")
  if (nameCol === -1 || emailCol === -1) {
    throw new Error(`${file}: expected INDIVIDUAL NAME + EMAILADDRESS columns, got: ${header.join(", ")}`)
  }

  const leads = []
  const skipped = { notIndividual: 0, noEmail: 0 }
  for (const line of lines.slice(1)) {
    const cols = line.split("\t")
    const name = titleCase(cols[nameCol])
    if (!name) {
      skipped.notIndividual++
      continue
    }
    const email = cleanEmail(cols[emailCol])
    if (!email) {
      skipped.noEmail++
      continue
    }
    leads.push({ name, state: "Virginia", email, phone: null }) // phone not published by DPOR
  }
  return { leads, skipped }
}

const args = parseArgs()
const all = []
const totals = { notIndividual: 0, noEmail: 0 }
for (const file of FILES) {
  process.stdout.write(`downloading ${file}… `)
  const text = await fetchList(file)
  const { leads, skipped } = parseList(text, file)
  console.log(`${leads.length} leads (${skipped.notIndividual} firms, ${skipped.noEmail} without email)`)
  all.push(...leads)
  totals.notIndividual += skipped.notIndividual
  totals.noEmail += skipped.noEmail
}

const capped = all.slice(0, args.limit)
if (args.csv) writeCsv(args.csv, capped)
const stats = await upsertLeads(capped, args)
printSummary("Virginia (DPOR regulant lists)", {
  "rows parsed": capped.length,
  "skipped (business entity, no personal name)": totals.notIndividual,
  "skipped (missing/invalid email)": totals.noEmail,
  ...stats,
})
