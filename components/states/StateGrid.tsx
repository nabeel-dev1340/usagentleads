"use client"

import { useState } from "react"
import { StateCard } from "./StateCard"
import { US_STATES } from "@/lib/utils/states"
import { Search } from "lucide-react"

interface StateGridProps {
  countMap: Record<string, number>
}

export function StateGrid({ countMap }: StateGridProps) {
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<"largest" | "alpha">("largest")

  const statesWithCounts = US_STATES.map((s) => ({
    ...s,
    agentCount: countMap[s.name] ?? s.agentCount,
  }))

  const filtered = statesWithCounts.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "largest") return b.agentCount - a.agentCount
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="mt-8 sm:mt-10">
      <div className="mb-5 flex flex-col gap-4 border-y border-border py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-mono text-[13px] uppercase tracking-wider text-muted">
            {filtered.length} of {US_STATES.length} states
          </p>
          <p className="mt-1 text-[14px] text-tertiary">
            Same fields, same price, same delivery for every state.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <label className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search states"
              className="h-11 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-[14px] text-ink outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/15"
            />
          </label>
          <div className="flex w-full items-center gap-1 rounded-lg border border-border bg-white p-1 md:w-auto">
            {(["Most Agents", "Alphabetical"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setSort(opt === "Most Agents" ? "largest" : "alpha")}
                className={`min-h-9 flex-1 rounded-md px-3 text-[13px] font-medium transition-all duration-150 md:flex-none ${
                  (opt === "Most Agents" && sort === "largest") || (opt === "Alphabetical" && sort === "alpha")
                    ? "bg-accent text-white shadow-sm"
                    : "text-tertiary hover:bg-subtle hover:text-body"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sorted.map((state, i) => (
          <StateCard key={state.code} state={state} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-white px-5 py-12 text-center">
          <p className="text-[15px] font-medium text-ink">No states found</p>
          <p className="mt-1 text-[14px] text-muted">
            Try a state name or two-letter code instead of &quot;{search}&quot;.
          </p>
        </div>
      )}
    </div>
  )
}
