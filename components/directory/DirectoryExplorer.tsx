"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Search, Lock, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import type { DirectoryRow, DirectoryResult } from "@/lib/queries/directory"
import { DIRECTORY_MAX_PAGE } from "@/lib/utils/directory-limits"
import { US_STATES } from "@/lib/utils/states"
import { BuyStateButton } from "@/components/checkout/BuyStateButton"
import { CustomSelect } from "@/components/ui/CustomSelect"

// Static list — "All states" first, then every state by name.
const STATE_OPTIONS = [
  { value: "", label: "All states" },
  ...US_STATES.map((s) => ({ value: s.code, label: s.name })),
]

interface DirectoryExplorerProps {
  /** Server-rendered first page so the list is crawlable and paints instantly. */
  initialResult: DirectoryResult
  /** State code the page is scoped to ("" = all states, chooser shown). */
  initialStateCode?: string
  initialQuery?: string
  /** When true, the state is fixed by the page and the chooser is hidden. */
  lockState?: boolean
  /** Live total for the scoped state, used in the unlock CTA copy. */
  stateAgentCount?: number
}

export function DirectoryExplorer({
  initialResult,
  initialStateCode = "",
  initialQuery = "",
  lockState = false,
  stateAgentCount,
}: DirectoryExplorerProps) {
  const [stateCode, setStateCode] = useState(initialStateCode)
  const [input, setInput] = useState(initialQuery)
  const [rows, setRows] = useState<DirectoryRow[]>(initialResult.rows)
  const [page, setPage] = useState(initialResult.page)
  const [hasMore, setHasMore] = useState(initialResult.hasMore)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [hasSearched, setHasSearched] = useState(
    Boolean(initialStateCode) || initialQuery.length >= 2
  )

  // Ignore stale responses if the user changes filters mid-flight.
  const requestId = useRef(0)
  // Cancel the previous in-flight request so rapid typing never stacks
  // concurrent queries on the server.
  const abortRef = useRef<AbortController | null>(null)
  // Skip the very first effect run — the initial result is already server-rendered.
  const mounted = useRef(false)

  const fetchResults = useCallback(
    async (nextState: string, nextQuery: string, nextPage: number) => {
      const trimmed = nextQuery.trim()
      // Mirror the server's minimum-filter rule to avoid a pointless request:
      // a global (no-state) name search needs 3 characters, 2 within a state.
      const minLen = nextState ? 2 : 3
      if (!nextState && trimmed.length < minLen) {
        setRows([])
        setHasMore(false)
        setHasSearched(false)
        setError(false)
        return
      }
      const id = ++requestId.current
      // Abort any request still in flight before starting a new one.
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setLoading(true)
      setError(false)
      try {
        const params = new URLSearchParams()
        if (nextState) params.set("state", nextState)
        if (trimmed.length >= 2) params.set("q", trimmed)
        params.set("page", String(nextPage))
        const res = await fetch(`/api/directory?${params.toString()}`, {
          signal: controller.signal,
        })
        const data: DirectoryResult = await res.json()
        if (id !== requestId.current) return // superseded
        if (!res.ok) {
          setError(true)
          setRows([])
          setHasMore(false)
        } else {
          setRows(data.rows)
          setHasMore(data.hasMore)
          setHasSearched(true)
        }
      } catch (err) {
        // A superseded request was aborted on purpose — ignore it.
        if ((err as Error)?.name === "AbortError") return
        if (id !== requestId.current) return
        setError(true)
        setRows([])
        setHasMore(false)
      } finally {
        if (id === requestId.current) setLoading(false)
      }
    },
    []
  )

  // Debounced search on name input; resets to page 1.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    const handle = setTimeout(() => {
      setPage(1)
      fetchResults(stateCode, input, 1)
    }, 350)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, stateCode])

  const goToPage = (nextPage: number) => {
    const clamped = Math.min(Math.max(1, nextPage), DIRECTORY_MAX_PAGE)
    setPage(clamped)
    fetchResults(stateCode, input, clamped)
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const selectedState = US_STATES.find((s) => s.code === stateCode)
  const atPageCap = page >= DIRECTORY_MAX_PAGE

  return (
    <div className="card overflow-hidden">
      {/* Controls */}
      <div className="border-b border-border bg-subtle p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={100}
              placeholder="Search by agent name…"
              aria-label="Search real estate agents by name"
              className="w-full rounded-lg border border-border bg-white py-2.5 pl-9 pr-3 text-[15px] text-ink outline-none transition-colors focus:border-accent"
            />
          </div>
          {!lockState && (
            <CustomSelect
              value={stateCode}
              onChange={setStateCode}
              options={STATE_OPTIONS}
              placeholder="All states"
              aria-label="Filter by state"
              className="w-full sm:w-52"
            />
          )}
        </div>
        {!lockState && !stateCode && input.trim().length < 3 && (
          <p className="mt-2.5 text-[13px] text-tertiary">
            Type at least 3 letters of an agent&apos;s name, or pick a state, to search.
          </p>
        )}
      </div>

      {/* Results */}
      <div className="relative">
        <table className="data-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>State</th>
              <th>Email</th>
              <th className="hidden sm:table-cell">Phone</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="cell-name">{row.name}</td>
                <td className="text-tertiary">{row.state}</td>
                <td className="cell-email">
                  {row.hasEmail ? (
                    <span className="inline-flex items-center gap-1.5 text-tertiary">
                      <Lock size={12} className="text-muted" />
                      <span className="select-none font-mono">{row.emailMasked}</span>
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className="cell-phone hidden sm:table-cell">
                  {row.hasPhone ? (
                    <span className="inline-flex items-center gap-1.5 text-tertiary">
                      <Lock size={12} className="text-muted" />
                      <span className="select-none font-mono">{row.phoneMasked}</span>
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
          </div>
        )}

        {/* Empty / prompt states */}
        {!loading && rows.length === 0 && (
          <div className="px-5 py-14 text-center">
            {error ? (
              <p className="text-[14px] text-tertiary">
                Something went wrong. Please try again in a moment.
              </p>
            ) : hasSearched ? (
              <p className="text-[14px] text-tertiary">
                No agents found{selectedState ? ` in ${selectedState.name}` : ""}
                {input.trim() ? ` matching “${input.trim()}”` : ""}.
              </p>
            ) : (
              <p className="text-[14px] text-tertiary">
                Search by agent name or choose a state to browse the directory.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {rows.length > 0 && (
        <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-5">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1 || loading}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 text-[13px] font-medium text-body transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="text-[13px] font-mono text-tertiary">Page {page}</span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={!hasMore || atPageCap || loading}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 text-[13px] font-medium text-body transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Unlock CTA — the conversion bridge from browsing to buying. */}
      <div className="border-t border-accent-mid bg-accent-light px-5 py-5">
        {selectedState ? (
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5">
              <Lock size={16} className="mt-0.5 shrink-0 text-accent" />
              <p className="text-[14px] text-ink">
                Emails and phone numbers are hidden. Unlock all{" "}
                <span className="font-mono font-semibold text-accent">
                  {(stateAgentCount ?? selectedState.agentCount).toLocaleString()}
                </span>{" "}
                verified {selectedState.name} agent contacts as a CSV.
              </p>
            </div>
            <BuyStateButton
              stateCode={selectedState.code}
              stateName={selectedState.name}
              className="w-full shrink-0 sm:w-auto"
            />
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5">
              <Lock size={16} className="mt-0.5 shrink-0 text-accent" />
              <p className="text-[14px] text-ink">
                Contact details are hidden in the free directory. Pick a state to
                download its full, unmasked agent list.
              </p>
            </div>
            <Link
              href="/states"
              className="btn-primary shrink-0 justify-center px-5 py-2.5 text-[14px]"
            >
              Browse state lists
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
