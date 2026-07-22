// Rewrites the `agentCount` values in lib/utils/states.ts from the live
// Supabase `state_count` table.
//
// Those constants are the site's static source of truth: TOTAL_AGENTS is
// summed from them, and it backs the headline counts plus the fallback in
// lib/utils/agent-count.ts when the DB is unreachable. They go stale after
// every ingest, so run this once the ingest crons have refreshed state_count:
//
//   GET /api/cron/update-state-counts   (refresh state_count first)
//   node scripts/sync-state-counts.mjs [--dry-run]
//
// Needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.

import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createClient } from "@supabase/supabase-js"
import { loadEnv } from "./ingest/lib.mjs"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const STATES_FILE = path.join(ROOT, "lib", "utils", "states.ts")
const dryRun = process.argv.includes("--dry-run")

loadEnv()
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set")

const supabase = createClient(url, key)
const { data, error } = await supabase.schema("usagentleads").from("state_count").select("state,count")
if (error) throw new Error(`Supabase: ${error.message}`)

const counts = new Map(data.map((r) => [r.state, r.count]))
console.log(`state_count rows: ${counts.size}, total ${[...counts.values()].reduce((a, b) => a + b, 0).toLocaleString()}`)

const src = readFileSync(STATES_FILE, "utf8")
let changed = 0
let missing = 0
let oldTotal = 0
let newTotal = 0

const out = src.replace(
  /\{ code: "([A-Z]{2})", name: "([^"]+)", slug: "([^"]+)", agentCount: (\d+) \}/g,
  (full, code, name, slug, old) => {
    const oldN = Number(old)
    oldTotal += oldN
    const next = counts.get(name)
    if (next === undefined) {
      missing++
      newTotal += oldN
      console.warn(`  ! no state_count row for "${name}" — left at ${oldN}`)
      return full
    }
    newTotal += next
    if (next !== oldN) {
      changed++
      console.log(`  ${code} ${String(oldN).padStart(7)} -> ${String(next).padStart(7)}  (${next - oldN >= 0 ? "+" : ""}${next - oldN})`)
    }
    return `{ code: "${code}", name: "${name}", slug: "${slug}", agentCount: ${next} }`
  },
)

console.log(`\n${changed} states changed, ${missing} missing`)
console.log(`TOTAL_AGENTS ${oldTotal.toLocaleString()} -> ${newTotal.toLocaleString()}`)

if (dryRun) {
  console.log("\n[dry-run] states.ts not written")
} else {
  writeFileSync(STATES_FILE, out)
  console.log(`\nwrote ${STATES_FILE}`)
}
