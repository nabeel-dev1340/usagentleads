"use client"

import { useState } from "react"
import { StateCard } from "./StateCard"
import { US_STATES } from "@/lib/utils/states"
import { Search } from "lucide-react"

export function StateGrid() {
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<"largest" | "alpha">("largest")

  const filtered = US_STATES.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "largest") return b.agentCount - a.agentCount
    return a.name.localeCompare(b.name)
  })

  return (
    <div>
      {/* Sort bar */}
      <div className="mt-8 mb-6 flex items-center justify-between flex-wrap gap-4">
        <p className="text-[14px] font-mono text-tertiary">
          {filtered.length} states available
        </p>
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-[14px] text-tertiary mr-2">Sort:</span>
          {(["Most Agents", "Alphabetical"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setSort(opt === "Most Agents" ? "largest" : "alpha")}
              className={`text-[14px] px-3 py-1.5 rounded-md transition-all duration-150 ${
                (opt === "Most Agents" && sort === "largest") || (opt === "Alphabetical" && sort === "alpha")
                  ? "bg-accent text-white font-medium"
                  : "text-tertiary hover:text-body hover:bg-subtle"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {sorted.map((state, i) => (
          <StateCard key={state.code} state={state} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-16 text-center text-[15px] text-muted">
          No states found matching &quot;{search}&quot;
        </p>
      )}
    </div>
  )
}
