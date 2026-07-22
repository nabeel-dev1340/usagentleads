// Anywhere Real Estate agent directory -> usagentleads.leads
//
// One JSON endpoint and one static key serve every Anywhere consumer brand.
// Coldwell Banker (brandCode CB) is deliberately excluded — already covered.
//
//   GET /api/places?brand=C21&canonicalUrl=/state/tx   -> state placeMasterId
//   GET /api/agents?brandCode=…&placeMasterId=…&page=… -> agents w/ contacts
//
// Enumerating by *state* placeMasterId (rather than the ~30k city pages in the
// agent sitemap) makes the whole network 50 states x 5 brands. Agents serving
// several cities are returned once per state, and upsertLeads() dedups anyway.
//
// Fields: fullName, email, businessPhone, cellPhone, and canonicalUrl
// (/ca/twain-harte/agents/…) which is where `state` comes from.

import { cleanEmail, cleanPhone, parseArgs, printSummary, stateName, titleCase, upsertLeads, writeCsv } from "./lib.mjs"

const API_KEY = "svbyT7C7Hw7d8D7GxJsi"
const HOST = "https://www.century21.com"
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

const BRANDS = [
  ["C21", "Century 21"],
  ["ERA", "ERA"],
  ["BHG", "Better Homes and Gardens"],
  ["SIR", "Sotheby's International Realty"],
  ["COR", "Corcoran"],
]

const STATE_CODES =
  "al ak az ar ca co ct de dc fl ga hi id il in ia ks ky la me md ma mi mn ms mo mt ne nv nh nj nm ny nc nd oh ok or pa ri sc sd tn tx ut vt va wa wv wi wy".split(
    " "
  )

// Page sizes to try, largest first. The backend serializes results over gRPC
// and 400s with `grpc: received message larger than max` when a page exceeds
// its message limit — which happens for brands with bulkier records (Sotheby's,
// Better Homes, Corcoran) in dense states. It is deterministic, not throttling,
// so the only fix is a smaller page.
const PAGE_SIZES = [500, 200, 100, 50]
const SELECT_FIELDS =
  "agentMasterId,basicPersonInfo,companyOfficeAssociation,preferences,canonicalURL,licenses,starRating"

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Pacing between pages. The API throttles under sustained use, and a page-1
// give-up costs a whole brand+state, so this is deliberately conservative and
// tunable from the environment for recovery passes.
const PAGE_DELAY_MS = Number(process.env.ANYWHERE_PAGE_DELAY_MS ?? 250)
const MAX_ATTEMPTS = Number(process.env.ANYWHERE_MAX_ATTEMPTS ?? 6)

// Remembers why the last give-up happened, so the caller can log a real cause
// instead of an anonymous failure.
let lastFailure = "unknown"
let lastStatus = 0

async function getJson(url, attempt = 1) {
  try {
    const res = await fetch(url, {
      headers: { "x-api-key": API_KEY, "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(45_000),
    })
    lastStatus = res.status
    if (res.ok) {
      const json = await res.json()
      if (json?.data) return json
      lastFailure = "200 but no data field"
    } else {
      lastFailure = `HTTP ${res.status}`
      // 4xx other than 429 is deterministic — retrying just burns time.
      if (res.status >= 400 && res.status < 500 && res.status !== 429) return null
    }
  } catch (err) {
    lastStatus = 0
    lastFailure = err.name === "TimeoutError" ? "timeout" : `${err.name}: ${err.message.slice(0, 60)}`
  }
  if (attempt >= MAX_ATTEMPTS) return null
  // Exponential with jitter — a fixed ramp keeps colliding with the same window.
  await sleep(1500 * 2 ** (attempt - 1) + Math.random() * 500)
  return getJson(url, attempt + 1)
}

async function statePlaceId(code) {
  const json = await getJson(
    `${HOST}/api/places?brand=C21&canonicalUrl=${encodeURIComponent(`/state/${code}`)}`
  )
  return json?.data?.results?.[0]?.placeMasterId ?? null
}

function agentsUrl(brand, placeId, page, pageSize) {
  const qs = new URLSearchParams({
    brandCode: brand,
    page: String(page),
    numPerPage: String(pageSize),
    considerDisplayOptions: "true",
    placeMasterId: placeId,
    locationTypes: "officePhysicalLocations,areasServedLocations",
    searchContext: "new",
    sortKey: "lastName",
    selectFields: SELECT_FIELDS,
  })
  return `${HOST}/api/agents?${qs}`
}

/** canonicalUrl looks like /ca/twain-harte/agents/jane-doe/aid-P00…  */
function stateFromCanonical(canonicalUrl) {
  const m = String(canonicalUrl ?? "").match(/^\/([a-z]{2})\//i)
  return m ? stateName(m[1]) : null
}

function normalize(raw, fallbackState) {
  const name = titleCase(raw.fullName)
  const state = stateFromCanonical(raw.canonicalUrl) ?? fallbackState
  const email = cleanEmail(raw.email)
  const phone = cleanPhone(raw.cellPhone) ?? cleanPhone(raw.businessPhone)
  if (!name || !state) return null
  if (!email && !phone) return null
  return { name, state, email, phone }
}

async function collect(limit) {
  const leads = []
  const perBrand = Object.fromEntries(BRANDS.map(([code]) => [code, 0]))
  let noPlace = 0
  let failedPages = 0

  for (const code of STATE_CODES) {
    const placeId = await statePlaceId(code)
    if (!placeId) {
      console.warn(`  ${code.toUpperCase()}: no placeMasterId, skipped`)
      noPlace++
      continue
    }
    const fallbackState = stateName(code)
    let stateTotal = 0

    for (const [brand] of BRANDS) {
      // Settle on a page size this brand+state can actually serialize, then
      // keep it for every page so the offsets stay consistent.
      let pageSize = null
      let firstPage = null
      for (const candidate of PAGE_SIZES) {
        firstPage = await getJson(agentsUrl(brand, placeId, 1, candidate))
        if (firstPage) {
          pageSize = candidate
          break
        }
        if (lastStatus !== 400) break // not a payload-size problem
        await sleep(PAGE_DELAY_MS)
      }

      if (!firstPage) {
        failedPages++
        console.warn(`  ! ${code.toUpperCase()}/${brand} page 1 failed (last: ${lastFailure}) — brand skipped`)
        continue
      }
      if (pageSize !== PAGE_SIZES[0]) {
        console.log(`    ${code.toUpperCase()}/${brand}: fell back to numPerPage=${pageSize}`)
      }

      for (let page = 1; ; page++) {
        const json = page === 1 ? firstPage : await getJson(agentsUrl(brand, placeId, page, pageSize))
        // A give-up must not look like "no more pages", or we would silently
        // drop the rest of this brand/state.
        if (!json) {
          failedPages++
          console.warn(
            `  ! ${code.toUpperCase()}/${brand} page ${page} gave up (last: ${lastFailure}) — partial`
          )
          break
        }
        const results = json.data?.results ?? []
        if (!results.length) break

        for (const raw of results) {
          const lead = normalize(raw, fallbackState)
          if (lead) {
            leads.push(lead)
            perBrand[brand]++
            stateTotal++
          }
        }
        if (results.length < pageSize) break
        if (leads.length >= limit) break
        await sleep(PAGE_DELAY_MS)
      }
      if (leads.length >= limit) break
      await sleep(PAGE_DELAY_MS)
    }

    console.log(`  ${code.toUpperCase()}: ${stateTotal} agents (running total ${leads.length})`)
    if (leads.length >= limit) break
  }

  return { leads: leads.slice(0, limit), perBrand, noPlace, failedPages }
}

async function main() {
  const args = parseArgs()
  console.log("Anywhere Real Estate — Century 21 / ERA / Better Homes / Sotheby's / Corcoran")
  console.log(`Enumerating ${STATE_CODES.length} states x ${BRANDS.length} brands…\n`)

  const { leads, perBrand, noPlace, failedPages } = await collect(args.limit)

  console.log("\nper brand:")
  for (const [code, label] of BRANDS) console.log(`  ${label}: ${perBrand[code]}`)

  if (args.csv) writeCsv(args.csv, leads)

  const stats = await upsertLeads(leads, { dryRun: args.dryRun, batch: args.batch })
  printSummary("Anywhere Real Estate", {
    "states without a place id": noPlace,
    "pages lost to fetch failures": failedPages,
    "agents collected": leads.length,
    "with email": leads.filter((l) => l.email).length,
    "with phone": leads.filter((l) => l.phone).length,
    ...stats,
  })
}

await main()
