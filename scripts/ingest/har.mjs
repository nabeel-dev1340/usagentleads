// HAR.com (Houston Association of REALTORS) agent profiles -> usagentleads.leads
//
// HAR publishes every profile URL in gzipped sitemaps at sitemap.har.com. Agent
// profiles are `/{name-slug}/agent_{id}`; the same files also list
// `affiliate_member_*` (vendors) and other profile types, which we skip.
//
// **Phone-only source.** HAR never exposes agent emails — contact is via an
// on-site form — so these rows rely on the email-or-phone rule and are deduped
// by phone (see upsertLeads). Sampling showed phone numbers are per-agent direct
// lines, not shared office numbers, so phone is a usable key here.
//
// Note the profile HTML also contains HAR's own `privacy@har.com` boilerplate;
// only the JSON-LD node is trusted for contact data.

import { gunzipSync } from "node:zlib"
import { cleanEmail, cleanPhone, parseArgs, printSummary, stateName, titleCase, upsertLeads, writeCsv } from "./lib.mjs"

const SITEMAP_INDEX = "https://sitemap.har.com/sitemap.xml"
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

// HAR 403s bare UA strings; a full browser-ish header set gets 200s.
const HEADERS = {
  "User-Agent": UA,
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Upgrade-Insecure-Requests": "1",
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// HAR sits behind PerimeterX. A concurrency-8 crawl tripped it and got the IP
// blocked within ~500 requests, so this defaults to a slow, sequential-ish
// crawl. Raise it only if you enjoy being banned.
const PAGE_DELAY_MS = Number(process.env.HAR_PAGE_DELAY_MS ?? 800)
const FLUSH_EVERY = Number(process.env.HAR_FLUSH_EVERY ?? 2000)

async function getBuffer(url, attempt = 1) {
  try {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(60_000) })
    if (res.ok) return Buffer.from(await res.arrayBuffer())
    if (res.status === 404 || res.status === 410) return null
  } catch {
    /* retry */
  }
  if (attempt >= 4) return null
  await sleep(1500 * attempt)
  return getBuffer(url, attempt + 1)
}

async function getText(url, attempt = 1) {
  const buf = await getBuffer(url, attempt)
  return buf ? buf.toString("utf8") : null
}

const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])

async function agentUrls() {
  const index = await getText(SITEMAP_INDEX)
  if (!index) throw new Error("could not fetch the HAR sitemap index")

  const profileSitemaps = locs(index).filter((u) => /\/profiles_\d+\.xml\.gz$/.test(u))
  const urls = []
  for (const sm of profileSitemaps) {
    const gz = await getBuffer(sm)
    if (!gz) {
      console.warn(`  ! could not fetch ${sm}`)
      continue
    }
    // One of the profiles_* files is legitimately empty upstream.
    const xml = gunzipSync(gz).toString("utf8")
    const found = locs(xml).filter((u) => /\/agent_[^/]+$/.test(u))
    console.log(`  ${sm.split("/").pop()}: ${found.length} agent urls`)
    urls.push(...found)
  }
  return [...new Set(urls)]
}

const isAgentNode = (node) => {
  const t = node?.["@type"]
  const types = Array.isArray(t) ? t : [t]
  return types.includes("RealEstateAgent") || types.includes("Person")
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

  const name = titleCase(agent.name)
  const state = stateName(agent.address?.addressRegion) ?? "Texas"
  const phone = cleanPhone(agent.telephone)
  const email = cleanEmail(agent.email) // effectively always null here
  if (!name || !state) return null
  if (!email && !phone) return null
  return { name, state, email, phone }
}

/**
 * Crawl with a fixed-size worker pool, upserting in chunks as we go.
 *
 * This is a 64k-URL crawl that has to run slowly, so buffering everything until
 * the end would mean an interruption loses the entire run. `onFlush` is handed
 * each batch as it fills.
 */
async function crawl(urls, concurrency, flushEvery, onFlush) {
  let batch = []
  let kept = 0
  let done = 0
  let failed = 0
  let noData = 0
  let cursor = 0
  let flushing = null

  const maybeFlush = async (force = false) => {
    if (batch.length < flushEvery && !force) return
    const chunk = batch
    batch = []
    await (flushing = onFlush(chunk))
  }

  const worker = async () => {
    while (cursor < urls.length) {
      const url = urls[cursor++]
      const html = await getText(url)
      if (!html) failed++
      else {
        const lead = parseProfile(html)
        if (lead) {
          batch.push(lead)
          kept++
        } else noData++
      }
      if (++done % 500 === 0) {
        process.stdout.write(`\r  crawled ${done}/${urls.length} — kept ${kept}, no-data ${noData}, failed ${failed}\n`)
      }
      if (flushing) await flushing
      await maybeFlush()
      await sleep(PAGE_DELAY_MS)
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker))
  await maybeFlush(true)
  process.stdout.write(`\r  crawled ${done}/${urls.length} — kept ${kept}, no-data ${noData}, failed ${failed}\n`)
  return { kept, failed, noData }
}

async function main() {
  const args = parseArgs()
  console.log("HAR.com — agent profile sitemap crawl (phone-only source)")
  console.log(`  pacing: ${args.concurrency} workers, ${PAGE_DELAY_MS}ms between requests\n`)

  let urls = await agentUrls()
  console.log(`  total unique agent URLs: ${urls.length}`)
  if (Number.isFinite(args.limit)) urls = urls.slice(0, args.limit)

  const csvRows = []
  const totals = { unique: 0, dupesInFile: 0, skippedNoContact: 0, inserted: 0, alreadyKnown: 0 }

  const { kept, failed, noData } = await crawl(urls, args.concurrency, FLUSH_EVERY, async (chunk) => {
    if (args.csv) csvRows.push(...chunk)
    const s = await upsertLeads(chunk, { dryRun: args.dryRun, batch: args.batch })
    for (const k of Object.keys(totals)) totals[k] += s[k] ?? 0
    console.log(`  flushed ${chunk.length} — inserted ${s.inserted}, already known ${s.alreadyKnown}`)
  })

  if (args.csv) writeCsv(args.csv, csvRows)

  printSummary("HAR.com", {
    "profiles fetched": urls.length,
    "fetch failures": failed,
    "no usable contact": noData,
    "agents collected": kept,
    ...totals,
  })
}

await main()
