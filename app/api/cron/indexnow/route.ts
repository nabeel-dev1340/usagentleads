import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { US_STATES } from "@/lib/utils/states"

const INDEXNOW_KEY = process.env.INDEXNOW_KEY!
const HOST = "usagentleads.com"
const BASE_URL = `https://${HOST}`

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

  const urlList = [
    BASE_URL,
    `${BASE_URL}/pricing`,
    `${BASE_URL}/states`,
    `${BASE_URL}/contact`,
    ...US_STATES.map((state) => `${BASE_URL}/states/${state.slug}`),
  ]

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
  const keyLocation = `${BASE_URL}/${INDEXNOW_KEY}.txt`
  const results: { url: string; status: number }[] = []
  const failed: string[] = []

  for (const url of urlList) {
    const response = await fetch(
      `https://api.indexnow.org/IndexNow?url=${encodeURIComponent(url)}&key=${INDEXNOW_KEY}&keyLocation=${encodeURIComponent(keyLocation)}`,
      { method: "GET" }
    )

    results.push({ url, status: response.status })
    if (!response.ok) {
      failed.push(url)
    }

    await delay(2000)
  }

  return NextResponse.json({
    success: failed.length === 0,
    urlsSubmitted: urlList.length,
    urlsFailed: failed.length,
    results,
  })
}
