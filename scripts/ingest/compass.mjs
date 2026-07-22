// Compass agent profiles -> usagentleads.leads
//
// Compass publishes every agent profile URL in a sitemap declared in its own
// robots.txt (~35k URLs), and each profile is server-rendered with a JSON-LD
// @graph. The agent node is typed ["Person","RealEstateAgent"] and carries
// name, email and address.addressRegion.
//
// Two gotchas: `@type` is an array (not a string), and the JSON-LD escapes
// slashes as /. Phone is *not* in the JSON-LD — it is only on the
// `tel:` anchor tagged data-tn="agent-phone-link" / "profile-phone".
//
// Note the emails are uniformly first.last@compass.com — deliverable, but
// brokerage-routed rather than personal.

import { cleanEmail, cleanPhone, parseArgs, printSummary, stateName, titleCase, upsertLeads, writeCsv } from "./lib.mjs"

const SITEMAP_INDEX = "https://www.compass.com/sitemaps/agent-pages/index.xml"
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getText(url, attempt = 1) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,application/xml;q=0.9" },
      signal: AbortSignal.timeout(30_000),
    })
    if (res.ok) return await res.text()
    if (res.status === 404 || res.status === 410) return null
  } catch {
    /* fall through to retry */
  }
  if (attempt >= 4) return null
  await sleep(1500 * attempt)
  return getText(url, attempt + 1)
}

const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])

async function agentUrls() {
  const index = await getText(SITEMAP_INDEX)
  if (!index) throw new Error("could not fetch the Compass sitemap index")
  const urls = []
  for (const sm of locs(index)) {
    const body = await getText(sm)
    if (body) urls.push(...locs(body))
  }
  return urls
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
      const nodes = json["@graph"] ?? (Array.isArray(json) ? json : [json])
      for (const node of nodes) {
        if (isAgentNode(node)) {
          agent = node
          break
        }
      }
    } catch {
      /* a non-JSON or partial block is not fatal — try the next one */
    }
    if (agent) break
  }
  if (!agent) return null

  // The agent's own number, not the office/related-agent ones also on the page.
  const tel = html.match(/<a[^>]*href="tel:([^"]+)"[^>]*data-tn="(?:agent-phone-link|profile-phone)"/)

  const name = titleCase(agent.name)
  const state = stateName(agent.address?.addressRegion)
  const email = cleanEmail(agent.email)
  const phone = cleanPhone(tel?.[1])
  if (!name || !state) return null
  if (!email && !phone) return null
  return { name, state, email, phone }
}

/** Fetch+parse `urls` with a fixed-size worker pool. */
async function crawl(urls, concurrency) {
  const leads = []
  let done = 0
  let failed = 0
  let noData = 0
  let cursor = 0

  const worker = async () => {
    while (cursor < urls.length) {
      const url = urls[cursor++]
      const html = await getText(url)
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
  console.log("Compass — agent profile sitemap crawl\n")

  let urls = await agentUrls()
  console.log(`  sitemap: ${urls.length} agent URLs`)
  if (Number.isFinite(args.limit)) urls = urls.slice(0, args.limit)

  const { leads, failed, noData } = await crawl(urls, args.concurrency)

  if (args.csv) writeCsv(args.csv, leads)

  const stats = await upsertLeads(leads, { dryRun: args.dryRun, batch: args.batch })
  printSummary("Compass", {
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
