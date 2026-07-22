// Backfills emails onto EXISTING email-less rows, instead of inserting new ones.
//
// Every other script here is insert-only (`on_conflict=email` +
// ignore-duplicates), which is right for new contacts but useless for the
// ~70k Florida rows that have a name and phone but no email: the DBPR licensee
// extracts simply have no email column, even though §455.275(1) requires
// licensees to give DBPR one. A public-records request to DBPR yields that
// file; this script applies it.
//
//   node scripts/ingest/enrich.mjs <file.csv> [--state Florida] [--dry-run]
//
// Matching is deliberately conservative — a wrong match silently attaches a
// stranger's email to a lead:
//   1. name + state, only when exactly ONE email-less row has that name
//   2. phone, only when exactly ONE email-less row has that phone
// Ambiguous matches are counted and skipped, never guessed.
//
// Existing emails are never overwritten (only `email IS NULL` rows are
// candidates), and any address already present elsewhere in the table is
// skipped so the UNIQUE index cannot reject a whole batch.

import { readFileSync } from "node:fs"
import { cleanEmail, cleanPhone, loadEnv, parseArgs, printSummary, stateName, titleCase } from "./lib.mjs"

const PULL_PAGE = 25000

const normName = (s) =>
  String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .replace(/\s+/g, " ")

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
    } else if (c === '"') quoted = true
    else if (c === ",") {
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

/** Page a table read. `order=id` is required — without a stable sort, offset
 *  paging against Postgres silently repeats and skips rows. */
async function pull(base, key, query, label) {
  const out = []
  for (let offset = 0; ; offset += PULL_PAGE) {
    const url = `${base}/rest/v1/leads?${query}&order=id.asc&limit=${PULL_PAGE}&offset=${offset}`
    let batch = null
    for (let attempt = 1; attempt <= 4 && !batch; attempt++) {
      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${key}`, "Accept-Profile": "usagentleads" },
          signal: AbortSignal.timeout(180_000),
        })
        if (res.ok) batch = await res.json()
        else if (attempt === 4) throw new Error(`PostgREST ${res.status}: ${(await res.text()).slice(0, 200)}`)
      } catch (err) {
        if (attempt === 4) throw err
        await new Promise((r) => setTimeout(r, 2000 * attempt))
      }
    }
    if (!batch.length) break
    out.push(...batch)
    process.stdout.write(`\r  ${label}: ${out.length}`)
    if (batch.length < PULL_PAGE) break
  }
  process.stdout.write("\n")
  return out
}

async function patchBatch(base, key, rows, attempt = 1) {
  // on_conflict=id + merge-duplicates turns the insert into an UPDATE of just
  // the columns present in the payload, i.e. email only.
  const res = await fetch(`${base}/rest/v1/leads?on_conflict=id&select=id`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "Content-Profile": "usagentleads",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(rows),
    signal: AbortSignal.timeout(120_000),
  })
  if (res.ok) return (await res.json()).length
  if (res.status >= 500 && attempt < 4) {
    await new Promise((r) => setTimeout(r, 3000 * attempt))
    return patchBatch(base, key, rows, attempt + 1)
  }
  throw new Error(`PostgREST ${res.status}: ${(await res.text()).slice(0, 300)}`)
}

async function main() {
  const file = process.argv[2]
  if (!file || file.startsWith("--")) {
    console.error("usage: node scripts/ingest/enrich.mjs <file.csv> [--state Florida] [--dry-run] [--batch N]")
    process.exit(2)
  }
  const rest = process.argv.slice(3)
  let stateFilter = null
  const stateIdx = rest.indexOf("--state")
  if (stateIdx !== -1) {
    stateFilter = stateName(rest[stateIdx + 1])
    rest.splice(stateIdx, 2)
    if (!stateFilter) {
      console.error("--state must be a valid US state name")
      process.exit(2)
    }
  }
  const args = parseArgs(rest)

  // --- read the incoming file -------------------------------------------
  const raw = parseCsv(readFileSync(file, "utf8"))
  const header = raw.shift()?.map((h) => h.trim().toLowerCase()) ?? []
  for (const req of ["name", "state", "email"]) {
    if (!header.includes(req)) {
      console.error(`CSV is missing a "${req}" column (found: ${header.join(", ")})`)
      process.exit(2)
    }
  }
  const idx = Object.fromEntries(header.map((h, i) => [h, i]))

  const incoming = []
  for (const r of raw) {
    const name = titleCase(r[idx.name])
    const state = stateName(r[idx.state])
    const email = cleanEmail(r[idx.email])
    const phone = idx.phone !== undefined ? cleanPhone(r[idx.phone]) : null
    if (!name || !state || !email) continue
    if (stateFilter && state !== stateFilter) continue
    incoming.push({ name, state, email, phone })
  }
  console.log(`read ${raw.length} rows from ${file} — ${incoming.length} usable with an email`)
  if (!incoming.length) return

  loadEnv()
  const base = process.env.LEADS_REST_URL?.replace(/\/$/, "")
  const key = process.env.LEADS_REST_KEY
  if (!base || !key) throw new Error("LEADS_REST_URL / LEADS_REST_KEY are not set")

  const states = [...new Set(incoming.map((r) => r.state))]
  const stateQuery = states.length === 1 ? `state=eq.${encodeURIComponent(states[0])}` : `state=in.(${states.map((s) => `"${s}"`).join(",")})`

  // --- candidates: rows in those states that still lack an email ---------
  const candidates = await pull(base, key, `select=id,name,phone&email=is.null&${stateQuery}`, "email-less rows")

  const byName = new Map()
  const byPhone = new Map()
  for (const row of candidates) {
    const n = normName(row.name)
    if (n) {
      if (!byName.has(n)) byName.set(n, [])
      byName.get(n).push(row.id)
    }
    if (row.phone) {
      if (!byPhone.has(row.phone)) byPhone.set(row.phone, [])
      byPhone.get(row.phone).push(row.id)
    }
  }

  // --- every address already in the table, so we never trip UNIQUE -------
  const existing = await pull(base, key, "select=email&email=not.is.null", "existing emails")
  const taken = new Set(existing.map((r) => String(r.email).toLowerCase()))

  // --- match --------------------------------------------------------------
  const updates = new Map() // id -> email
  const usedEmails = new Set()
  let matchedName = 0
  let matchedPhone = 0
  let ambiguous = 0
  let noMatch = 0
  let alreadyTaken = 0

  for (const rec of incoming) {
    if (taken.has(rec.email) || usedEmails.has(rec.email)) {
      alreadyTaken++
      continue
    }
    let ids = byName.get(normName(rec.name))
    let via = "name"
    if (!ids?.length && rec.phone) {
      ids = byPhone.get(rec.phone)
      via = "phone"
    }
    if (!ids?.length) {
      noMatch++
      continue
    }
    // Only act when the match is unambiguous.
    const free = ids.filter((id) => !updates.has(id))
    if (free.length !== 1) {
      ambiguous++
      continue
    }
    updates.set(free[0], rec.email)
    usedEmails.add(rec.email)
    if (via === "name") matchedName++
    else matchedPhone++
  }

  const payload = [...updates.entries()].map(([id, email]) => ({ id, email }))
  console.log(
    `\nmatched ${payload.length} rows (${matchedName} by name, ${matchedPhone} by phone) — ` +
      `${ambiguous} ambiguous, ${noMatch} no match, ${alreadyTaken} email already in table`
  )

  let updated = 0
  if (args.dryRun) {
    console.log("[dry-run] sample:", JSON.stringify(payload.slice(0, 5), null, 2))
  } else {
    for (let i = 0; i < payload.length; i += args.batch) {
      const chunk = payload.slice(i, i + args.batch)
      updated += await patchBatch(base, key, chunk)
      process.stdout.write(`\r  updated ${Math.min(i + args.batch, payload.length)}/${payload.length}`)
    }
    if (payload.length) process.stdout.write("\n")
  }

  printSummary(`Email enrichment (${file})`, {
    "rows in file": raw.length,
    "usable with email": incoming.length,
    "email-less candidates in table": candidates.length,
    "matched by name": matchedName,
    "matched by phone": matchedPhone,
    ambiguous,
    "no match": noMatch,
    "email already in table": alreadyTaken,
    "rows updated": updated,
  })
}

await main()
