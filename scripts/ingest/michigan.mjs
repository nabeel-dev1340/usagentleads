// Michigan — LARA "FOIA-Real Estate Brokers/Salesperson List".
//
// Source (verified 2026-07-17): the self-serve FOIA report on LARA's
// "License Lists and Reports" page, hosted on Accela Citizen Access:
//   https://aca-prod.accela.com/MILARA/Report/ReportParameter.aspx?module=Licenses&reportID=32411&reportType=LINK_REPORT_LIST
// The report is generated on demand (~1 min server-side) and returns
// BPL_EXT_LicPubList_REC_MUL_SSRS.xlsx (~63k rows) with columns:
//   Last Name, First Name, Middle Name, Suffix, Facility Name, Profession,
//   Type, Specialities, License No, Status, Issue Date, Expiration,
//   Addr 1-3, Addr City, State, Zip, County, Email
// Email is included; phone is not published. Rows without a personal name are
// firms/branch offices and are skipped — we ingest individuals only.
//
// Flow: GET the parameter page (session cookie + ASP.NET hidden fields) →
// POST the form back → GET ShowReport.aspx, which streams the xlsx.
//
// Usage: node scripts/ingest/michigan.mjs [--dry-run] [--limit N] [--csv out.csv]

import ExcelJS from "exceljs"
import { cleanEmail, parseArgs, printSummary, titleCase, upsertLeads, writeCsv } from "./lib.mjs"

const BASE = "https://aca-prod.accela.com/MILARA/Report/"
const QUERY = "?module=Licenses&reportID=32411&reportType=LINK_REPORT_LIST"
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"

class CookieJar {
  #map = new Map()
  absorb(res) {
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const [kv] = c.split(";")
      const i = kv.indexOf("=")
      if (i > 0) this.#map.set(kv.slice(0, i).trim(), kv.slice(i + 1))
    }
  }
  header() {
    return [...this.#map].map(([k, v]) => `${k}=${v}`).join("; ")
  }
}

async function fetchReportXlsx() {
  const jar = new CookieJar()
  const paramUrl = BASE + "ReportParameter.aspx" + QUERY

  console.log("1/3 opening report parameter page…")
  const page = await fetch(paramUrl, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(120_000),
  })
  jar.absorb(page)
  const html = await page.text()

  const fields = new URLSearchParams()
  for (const m of html.matchAll(/<input[^>]+>/g)) {
    const name = m[0].match(/name="([^"]*)"/)?.[1]
    const value = m[0].match(/value="([^"]*)"/)?.[1] ?? ""
    if (name) fields.set(name, value)
  }
  if (!fields.has("__VIEWSTATE")) throw new Error("no __VIEWSTATE on parameter page — Accela layout changed?")

  console.log("2/3 submitting report request…")
  const post = await fetch(paramUrl, {
    method: "POST",
    headers: {
      "User-Agent": UA,
      Cookie: jar.header(),
      Referer: paramUrl,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: fields.toString(),
    signal: AbortSignal.timeout(300_000),
  })
  jar.absorb(post)
  await post.text()

  console.log("3/3 downloading generated report (takes ~1 min to build server-side)…")
  const report = await fetch(BASE + "ShowReport.aspx" + QUERY, {
    headers: { "User-Agent": UA, Cookie: jar.header(), Referer: paramUrl },
    signal: AbortSignal.timeout(900_000),
  })
  const type = report.headers.get("content-type") ?? ""
  if (!report.ok || !type.includes("spreadsheetml")) {
    throw new Error(`expected xlsx, got HTTP ${report.status} ${type} — report generation likely failed, retry later`)
  }
  return Buffer.from(await report.arrayBuffer())
}

function parseRows(worksheet) {
  let headerRow = 0
  const headers = {}
  worksheet.eachRow((row, n) => {
    if (headerRow) return
    const vals = (row.values ?? []).map((v) => String(v ?? "").trim())
    if (vals.includes("Email")) {
      headerRow = n
      vals.forEach((h, i) => h && (headers[h] = i))
    }
  })
  if (!headerRow) throw new Error("header row with 'Email' column not found")

  const cellText = (row, col) => {
    const v = row.values?.[col]
    if (v == null) return ""
    if (typeof v === "object") return String(v.text ?? v.result ?? "").trim()
    return String(v).trim()
  }

  const leads = []
  const skipped = { notActive: 0, noEmail: 0, notIndividual: 0 }
  worksheet.eachRow((row, n) => {
    if (n <= headerRow) return
    if (cellText(row, headers["Status"]) !== "Active") return void skipped.notActive++
    const first = titleCase(cellText(row, headers["First Name"]))
    const last = titleCase(cellText(row, headers["Last Name"]))
    if (!first && !last) return void skipped.notIndividual++
    const email = cleanEmail(cellText(row, headers["Email"]))
    if (!email) return void skipped.noEmail++
    leads.push({
      name: [first, last].filter(Boolean).join(" "),
      state: "Michigan",
      email,
      phone: null, // not published by LARA
    })
  })
  return { leads, skipped }
}

const args = parseArgs()
const buffer = await fetchReportXlsx()
console.log(`downloaded ${(buffer.length / 1e6).toFixed(1)} MB xlsx`)

const wb = new ExcelJS.Workbook()
await wb.xlsx.load(buffer)
const { leads, skipped } = parseRows(wb.worksheets[0])
const capped = leads.slice(0, args.limit)

if (args.csv) writeCsv(args.csv, capped)
const stats = await upsertLeads(capped, args)
printSummary("Michigan (LARA FOIA real estate list)", {
  "rows parsed": capped.length,
  "skipped (not Active)": skipped.notActive,
  "skipped (firm/branch, no personal name)": skipped.notIndividual,
  "skipped (missing/invalid email)": skipped.noEmail,
  ...stats,
})
