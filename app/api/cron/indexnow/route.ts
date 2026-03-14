import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { US_STATES } from "@/lib/utils/states"

const INDEXNOW_KEY = "7fbaca863ddc4349af9cfe94534dc665"
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

  const body = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
    urlList,
  }

  const response = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    return NextResponse.json(
      { error: "IndexNow submission failed", status: response.status },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    urlsSubmitted: urlList.length,
  })
}
