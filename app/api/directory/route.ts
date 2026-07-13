import { NextRequest, NextResponse } from "next/server"
import { rateLimit } from "@/lib/utils/rateLimit"
import { searchDirectory } from "@/lib/queries/directory"

// Never statically cached — results depend on query params, and we want the
// rate limiter to run on every hit.
export const dynamic = "force-dynamic"

/**
 * Public agent-directory search. Unauthenticated by design (it's the free tool),
 * so the protections live in the query layer + here:
 *  - per-IP rate limit to blunt scraping,
 *  - validated/sanitized params (handled in searchDirectory),
 *  - masked contact fields only,
 *  - X-Robots-Tag: noindex so the JSON itself never enters the index.
 */
export async function GET(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

  // 30 requests / minute / IP. Generous for real browsing, hostile to scrapers
  // (a scraper is capped at ~750 masked rows per minute, all useless).
  // Fail OPEN if the limiter backend is unreachable: results are already masked
  // and pagination-capped, so keeping the free tool available beats hard-failing
  // during a transient Redis outage.
  let overLimit = false
  try {
    const { success } = await rateLimit(`directory:${ip}`, 30, 60_000)
    overLimit = !success
  } catch (err) {
    console.error("Directory rate limiter unavailable, failing open:", err)
  }
  if (overLimit) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "X-Robots-Tag": "noindex" } }
    )
  }

  const { searchParams } = new URL(request.url)
  const state = searchParams.get("state")
  const q = searchParams.get("q")
  const page = searchParams.get("page")

  try {
    const result = await searchDirectory({ state, q, page })
    return NextResponse.json(result, {
      headers: {
        "X-Robots-Tag": "noindex",
        // Shared-cache window absorbs repeated/popular identical queries at the
        // CDN so they never touch the DB; stale-while-revalidate keeps responses
        // instant while a fresh copy is fetched in the background.
        "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
      },
    })
  } catch (error) {
    console.error("Directory API error:", error)
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500, headers: { "X-Robots-Tag": "noindex" } }
    )
  }
}
