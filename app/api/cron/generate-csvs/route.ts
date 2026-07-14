import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { gzipSync } from "zlib"
import { createServiceClient } from "@/lib/supabase/server"
import { createLeadsClient } from "@/lib/supabase/leads"
import { US_STATES } from "@/lib/utils/states"
import { cleanName, isValidName } from "@/lib/utils/clean-name"

const STATE_NAME_TO_CODE = new Map(
  US_STATES.map((s) => [s.name, s.code])
)
const STATE_CODE_TO_NAME = new Map(
  US_STATES.map((s) => [s.code, s.name])
)

// Handle edge cases — DC isn't in US_STATES but exists in leads
STATE_NAME_TO_CODE.set("Washington Dc", "DC")
STATE_NAME_TO_CODE.set("District of Columbia", "DC")
STATE_CODE_TO_NAME.set("DC", "District of Columbia")

const CSV_HEADERS = ["name", "email", "phone", "state"] as const

function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"'
        i++ // skip escaped quote
      } else if (char === '"') {
        inQuotes = false
      } else {
        current += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ",") {
      fields.push(current)
      current = ""
    } else {
      current += char
    }
  }
  fields.push(current)
  return fields
}

function escapeCSV(value: string | null): string {
  if (!value) return ""
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function buildCSV(rows: { name: string | null; email: string; phone: string | null; state: string | null }[]): string {
  const lines = [CSV_HEADERS.join(",")]
  for (const row of rows) {
    lines.push(
      CSV_HEADERS.map((h) => escapeCSV(row[h])).join(",")
    )
  }
  return lines.join("\n")
}

/**
 * Modes (all require CRON_SECRET auth):
 *   No params        → returns list of state codes to process
 *   ?state=AL        → generates CSV for one state, uploads to storage
 *   ?combine=true    → reads all state CSVs from storage, merges into full CSV
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const expected = `Bearer ${process.env.CRON_SECRET}`

  if (
    !authHeader ||
    authHeader.length !== expected.length ||
    !crypto.timingSafeEqual(
      Buffer.from(authHeader),
      Buffer.from(expected)
    )
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const stateCode = request.nextUrl.searchParams.get("state")
  const combine = request.nextUrl.searchParams.get("combine")

  try {
    const supabase = createServiceClient() // Supabase: Storage + state_count
    const leads = createLeadsClient()      // self-hosted: the leads table

    // ?combine=true → merge all state CSVs into a single CSV (memory-efficient)
    if (combine === "true") {
      const { data: files, error: listError } = await supabase.storage
        .from("agent-csvs")
        .list("states", { limit: 100 })

      if (listError) throw listError

      const csvFiles = (files || []).filter((f) => f.name.endsWith(".csv"))

      // Stream-concatenate CSVs without parsing rows into memory
      const chunks: string[] = [CSV_HEADERS.join(",")]
      let totalRows = 0

      for (const file of csvFiles) {
        const { data, error } = await supabase.storage
          .from("agent-csvs")
          .download(`states/${file.name}`)

        if (error) throw new Error(`Failed to download ${file.name}: ${error.message}`)

        const text = await data.text()
        // Find first newline to skip header, append the rest
        const firstNewline = text.indexOf("\n")
        if (firstNewline === -1) continue
        const body = text.slice(firstNewline + 1).trimEnd()
        if (!body) continue
        chunks.push(body)
        // Count rows by counting newlines + 1
        let count = 1
        for (let i = 0; i < body.length; i++) {
          if (body[i] === "\n") count++
        }
        totalRows += count
      }

      const combinedCSV = chunks.join("\n")
      const compressed = gzipSync(Buffer.from(combinedCSV, "utf-8"))

      const { error: uploadError } = await supabase.storage
        .from("agent-csvs")
        .upload("full/usa_agents_full.csv.gz", compressed, {
          contentType: "application/gzip",
          upsert: true,
        })

      if (uploadError) throw uploadError

      return NextResponse.json({
        success: true,
        files: csvFiles.length,
        totalRows,
        compressedBytes: compressed.length,
      })
    }

    // No state param → return list of state codes to process
    if (!stateCode) {
      const { data, error } = await supabase
        .schema("usagentleads")
        .from("state_count")
        .select("state")

      if (error) throw error

      const codes = (data || [])
        .map((r) => STATE_NAME_TO_CODE.get(r.state as string))
        .filter(Boolean)

      return NextResponse.json({ states: codes })
    }

    // Resolve state name from code
    const code = stateCode.toUpperCase()
    const stateName = STATE_CODE_TO_NAME.get(code)
    if (!stateName) {
      return NextResponse.json({ error: `Unknown state code: ${code}` }, { status: 400 })
    }

    // Also match "Washington Dc" variant for DC
    const stateNames = code === "DC"
      ? [stateName, "Washington Dc", "District of Columbia"]
      : [stateName]

    // Fetch all leads for this state, paginating in chunks of 1000
    const allRows: { name: string | null; email: string; phone: string | null; state: string | null }[] = []
    const PAGE_SIZE = 1000

    for (const name of stateNames) {
      let offset = 0
      while (true) {
        const { data, error } = await leads
          .schema("usagentleads")
          .from("leads")
          .select("name, email, phone, state")
          .eq("state", name)
          .not("name", "is", null)
          .neq("name", "")
          .filter("name", "match", "[a-zA-Z]{2,}")
          .range(offset, offset + PAGE_SIZE - 1)

        if (error) throw new Error(`Failed to fetch leads for ${name}: ${error.message}`)
        if (!data || data.length === 0) break

        // Clean zero-width chars and re-validate names
        for (const row of data) {
          row.name = cleanName(row.name)
          if (isValidName(row.name)) {
            allRows.push(row)
          }
        }
        if (data.length < PAGE_SIZE) break
        offset += PAGE_SIZE
      }
    }

    if (allRows.length === 0) {
      return NextResponse.json({ state: code, rows: 0, skipped: true })
    }

    // Generate and upload CSV
    const csv = buildCSV(allRows)
    const { error: uploadError } = await supabase.storage
      .from("agent-csvs")
      .upload(`states/${code}.csv`, csv, {
        contentType: "text/csv",
        upsert: true,
      })

    if (uploadError) throw uploadError

    return NextResponse.json({ state: code, rows: allRows.length, success: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`Cron generate-csvs error (${stateCode}):`, error)
    return NextResponse.json(
      { error: `Failed to generate CSV for ${stateCode}`, detail: msg },
      { status: 500 }
    )
  }
}
