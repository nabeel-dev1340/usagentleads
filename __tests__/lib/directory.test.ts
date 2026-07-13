import { describe, it, expect, vi, beforeEach } from "vitest"

// Verifies the security-critical behavior of searchDirectory:
//  - unfiltered dumps are refused,
//  - invalid state codes are rejected (allow-list),
//  - pagination depth is capped,
//  - the sanitized query and resolved state actually reach the DB query,
//  - contact fields are masked and raw values never appear in output.

type QueryResult = { data: unknown; error: unknown }

function makeRecordingClient(result: QueryResult) {
  const calls: Array<[string, unknown[]]> = []
  const handler: ProxyHandler<Record<string, unknown>> = {
    get(_target, prop) {
      if (prop === "then") {
        // Make the builder awaitable, resolving to the controlled result.
        return (resolve: (v: QueryResult) => void) => resolve(result)
      }
      if (typeof prop === "symbol") return undefined
      return (...args: unknown[]) => {
        calls.push([String(prop), args])
        return proxy
      }
    },
  }
  const proxy: Record<string, unknown> = new Proxy({}, handler)
  const client = { schema: () => ({ from: () => proxy }) }
  return { client, calls }
}

function loadWithResult(result: QueryResult) {
  const { client, calls } = makeRecordingClient(result)
  vi.doMock("@/lib/supabase/server", () => ({
    createServiceClient: vi.fn(() => client),
    createClient: vi.fn(),
  }))
  return { calls }
}

async function importSearch() {
  const mod = await import("@/lib/queries/directory")
  return mod
}

function rows(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: `id-${i}`,
    name: `Agent ${i}`,
    state: "California",
    email: `agent${i}@brokerage.com`,
    phone: "(818) 441-1871",
  }))
}

describe("searchDirectory security", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it("refuses an unfiltered dump (no state, no query)", async () => {
    loadWithResult({ data: rows(26), error: null })
    const { searchDirectory } = await importSearch()
    const res = await searchDirectory({})
    expect(res.rows).toHaveLength(0)
    expect(res.hasMore).toBe(false)
  })

  it("rejects an invalid state code via the allow-list", async () => {
    loadWithResult({ data: rows(26), error: null })
    const { searchDirectory } = await importSearch()
    const res = await searchDirectory({ state: "ZZ" })
    expect(res.rows).toHaveLength(0)
    expect(res.stateName).toBeNull()
  })

  it("refuses a single-letter query when no state is given", async () => {
    loadWithResult({ data: rows(26), error: null })
    const { searchDirectory } = await importSearch()
    const res = await searchDirectory({ q: "a" })
    expect(res.rows).toHaveLength(0)
  })

  it("refuses a 2-char global query (needs 3 letters without a state)", async () => {
    loadWithResult({ data: rows(26), error: null })
    const { searchDirectory } = await importSearch()
    const res = await searchDirectory({ q: "ab" })
    expect(res.rows).toHaveLength(0)
    expect(res.query).toBe("")
  })

  it("allows a 2-char query when scoped to a state", async () => {
    const { calls } = loadWithResult({ data: rows(3), error: null })
    const { searchDirectory } = await importSearch()
    const res = await searchDirectory({ state: "CA", q: "jo" })
    expect(res.query).toBe("jo")
    const ilikeCall = calls.find((c) => c[0] === "ilike")
    expect(ilikeCall?.[1]).toEqual(["name", "%jo%"])
  })

  it("orders a pure state browse by name (served by the composite index)", async () => {
    const { calls } = loadWithResult({ data: rows(5), error: null })
    const { searchDirectory } = await importSearch()
    await searchDirectory({ state: "CA" })
    expect(calls.some((c) => c[0] === "order")).toBe(true)
  })

  it("leaves a global name search unordered so the scan can stop after one page", async () => {
    const { calls } = loadWithResult({ data: rows(5), error: null })
    const { searchDirectory } = await importSearch()
    await searchDirectory({ q: "smith" })
    expect(calls.some((c) => c[0] === "order")).toBe(false)
    expect(calls.some((c) => c[0] === "ilike")).toBe(true)
  })

  it("leaves a state+name search unordered (avoids sorting a huge match set)", async () => {
    const { calls } = loadWithResult({ data: rows(5), error: null })
    const { searchDirectory } = await importSearch()
    await searchDirectory({ state: "CA", q: "jose" })
    expect(calls.some((c) => c[0] === "order")).toBe(false)
    expect(calls.some((c) => c[0] === "eq")).toBe(true)
    expect(calls.some((c) => c[0] === "ilike")).toBe(true)
  })

  it("resolves a valid state code to its name and applies it to the query", async () => {
    const { calls } = loadWithResult({ data: rows(5), error: null })
    const { searchDirectory } = await importSearch()
    const res = await searchDirectory({ state: "ca" })
    expect(res.stateName).toBe("California")
    const eqCall = calls.find((c) => c[0] === "eq")
    expect(eqCall?.[1]).toEqual(["state", "California"])
  })

  it("caps pagination depth at DIRECTORY_MAX_PAGE", async () => {
    const { calls } = loadWithResult({ data: rows(5), error: null })
    const { searchDirectory, DIRECTORY_MAX_PAGE, DIRECTORY_PAGE_SIZE } = await importSearch()
    const res = await searchDirectory({ state: "CA", page: 99999 })
    expect(res.page).toBe(DIRECTORY_MAX_PAGE)
    // range(from, to) must reflect the clamped page, never page 99999.
    const rangeCall = calls.find((c) => c[0] === "range")
    const expectedFrom = (DIRECTORY_MAX_PAGE - 1) * DIRECTORY_PAGE_SIZE
    expect(rangeCall?.[1][0]).toBe(expectedFrom)
  })

  it("clamps non-positive / non-numeric pages to 1", async () => {
    loadWithResult({ data: rows(5), error: null })
    const { searchDirectory } = await importSearch()
    expect((await searchDirectory({ state: "CA", page: 0 })).page).toBe(1)
    expect((await searchDirectory({ state: "CA", page: -5 })).page).toBe(1)
    expect((await searchDirectory({ state: "CA", page: "abc" })).page).toBe(1)
  })

  it("sanitizes the query (strips PostgREST/SQL metacharacters) before it reaches ilike", async () => {
    const { calls } = loadWithResult({ data: rows(5), error: null })
    const { searchDirectory } = await importSearch()
    const res = await searchDirectory({ state: "CA", q: "O'Brien, (1); DROP" })
    // Commas, quotes, parens, semicolons removed; letters/spaces kept.
    expect(res.query).toBe("OBrien 1 DROP")
    const ilikeCall = calls.find((c) => c[0] === "ilike")
    expect(ilikeCall?.[1]).toEqual(["name", "%OBrien 1 DROP%"])
  })

  it("uses the +1 fetch trick to detect a next page and trims to page size", async () => {
    loadWithResult({ data: rows(26), error: null })
    const { searchDirectory, DIRECTORY_PAGE_SIZE } = await importSearch()
    const res = await searchDirectory({ state: "CA" })
    expect(res.rows).toHaveLength(DIRECTORY_PAGE_SIZE)
    expect(res.hasMore).toBe(true)
  })

  it("masks email and phone and never emits raw contact values", async () => {
    loadWithResult({
      data: [
        { id: "1", name: "Jane Doe", state: "California", email: "jane@kw.com", phone: "(818) 441-1871" },
        { id: "2", name: "No Contact", state: "California", email: null, phone: null },
      ],
      error: null,
    })
    const { searchDirectory } = await importSearch()
    const res = await searchDirectory({ state: "CA" })
    const serialized = JSON.stringify(res)

    expect(serialized).not.toContain("jane@kw.com")
    expect(serialized).not.toContain("441-1871")
    expect(serialized).not.toContain("kw.com")

    expect(res.rows[0].emailMasked).toBe("j••••@••••••")
    expect(res.rows[0].phoneMasked).toBe("(818) •••-••••")
    expect(res.rows[0].hasEmail).toBe(true)
    expect(res.rows[0].hasPhone).toBe(true)

    expect(res.rows[1].emailMasked).toBeNull()
    expect(res.rows[1].hasEmail).toBe(false)
    expect(res.rows[1].hasPhone).toBe(false)
  })

  it("fails closed (empty, no throw) on a DB error", async () => {
    loadWithResult({ data: null, error: { message: "boom" } })
    const { searchDirectory } = await importSearch()
    const res = await searchDirectory({ state: "CA" })
    expect(res.rows).toHaveLength(0)
    expect(res.hasMore).toBe(false)
  })
})
