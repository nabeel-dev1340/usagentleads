// @properties / Christie's International agent profiles -> usagentleads.leads
//
// Agent profile URLs come from the `agent_profiles_*_sitemap.xml` files listed
// in the sitemap index at resources.atproperties.com. Profiles are plain
// server-rendered HTML, so no browser is needed.
//
// Fields come from two places:
//   * name / phone / state — the JSON-LD `RealEstateAgent` node.
//   * email — NOT in the JSON-LD. It only appears inside the "Refer Me"
//     mailto body, as `Email: <address>` followed by `Phone: <number>`.
//     That body is built for this specific agent, so it is unambiguous.

import { cleanEmail, cleanPhone, parseArgs, printSummary, stateName, titleCase, upsertLeads, writeCsv } from "./lib.mjs"

const SITEMAP_INDEX = "https://resources.atproperties.com/sitemaps/atp/sitemap_index.xml"
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getText(url, attempt = 1) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(30_000),
    })
    if (res.ok) return await res.text()
    if (res.status === 404 || res.status === 410) return null
  } catch {
    /* retry */
  }
  if (attempt >= 4) return null
  await sleep(1500 * attempt)
  return getText(url, attempt + 1)
}

const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])

async function agentUrls() {
  const index = await getText(SITEMAP_INDEX)
  if (!index) throw new Error("could not fetch the @properties sitemap index")

  const sitemaps = [...new Set(locs(index).filter((u) => u.includes("agent_profiles")))]
  const urls = []
  for (const sm of sitemaps) {
    const body = await getText(sm)
    if (!body) {
      console.warn(`  ! could not fetch ${sm}`)
      continue
    }
    const found = locs(body)
    console.log(`  ${sm.split("/").pop()}: ${found.length}`)
    urls.push(...found)
  }
  return [...new Set(urls)]
}

const isAgentNode = (node) => {
  const t = node?.["@type"]
  return (Array.isArray(t) ? t : [t]).includes("RealEstateAgent")
}

function parseProfile(html) {
  let agent = null
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const json = JSON.parse(m[1])
      for (const node of json["@graph"] ?? (Array.isArray(json) ? json : [json])) {
        if (isAgentNode(node)) {
          agent = node
          break
        }
      }
    } catch {
      /* skip malformed blocks */
    }
    if (agent) break
  }
  if (!agent) return null

  // The referral mailto body carries this agent's own address.
  const referral = html.match(/Email:\s*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/)

  const name = titleCase(agent.name)
  const state = stateName(agent.address?.addressRegion)
  const email = cleanEmail(referral?.[1])
  const phone = cleanPhone(agent.telephone)
  if (!name || !state) return null
  if (!email && !phone) return null
  return { name, state, email, phone }
}

async function crawl(urls, concurrency) {
  const leads = []
  let done = 0
  let failed = 0
  let noData = 0
  let cursor = 0

  const worker = async () => {
    while (cursor < urls.length) {
      const html = await getText(urls[cursor++])
      if (!html) failed++
      else {
        const lead = parseProfile(html)
        if (lead) leads.push(lead)
        else noData++
      }
      if (++done % 250 === 0) {
        process.stdout.write(`\r  crawled ${done}/${urls.length} — kept ${leads.length}, no-data ${noData}, failed ${failed}`)
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker))
  process.stdout.write(`\r  crawled ${done}/${urls.length} — kept ${leads.length}, no-data ${noData}, failed ${failed}\n`)
  return { leads, failed, noData }
}

async function main() {
  const args = parseArgs()
  console.log("@properties / Christie's — agent profile sitemap crawl\n")

  let urls = await agentUrls()
  console.log(`  total unique agent URLs: ${urls.length}`)
  if (Number.isFinite(args.limit)) urls = urls.slice(0, args.limit)

  const { leads, failed, noData } = await crawl(urls, args.concurrency)

  if (args.csv) writeCsv(args.csv, leads)

  const stats = await upsertLeads(leads, { dryRun: args.dryRun, batch: args.batch })
  printSummary("@properties", {
    "profiles fetched": urls.length,
    "fetch failures": failed,
    "no usable contact": noData,
    "agents collected": leads.length,
    "with email": leads.filter((l) => l.email).length,
    "with phone": leads.filter((l) => l.phone).length,
    ...stats,
  })
}

await main()
