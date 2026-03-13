"use client"

import { Search, X } from "lucide-react"
import { US_STATES } from "@/lib/utils/states"

interface SearchFilterBarProps {
  search: string
  state: string
  onSearchChange: (value: string) => void
  onStateChange: (value: string) => void
  onClear: () => void
}

export function SearchFilterBar({
  search,
  state,
  onSearchChange,
  onStateChange,
  onClear,
}: SearchFilterBarProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[220px] max-w-[380px]">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          className="input pl-10"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search agents"
        />
      </div>

      <select
        className="input w-auto min-w-[160px]"
        value={state}
        onChange={(e) => onStateChange(e.target.value)}
        aria-label="Filter by state"
      >
        <option value="">All States</option>
        {US_STATES.map((s) => (
          <option key={s.code} value={s.code}>
            {s.name}
          </option>
        ))}
      </select>

      {(search || state) && (
        <button onClick={onClear} className="btn-ghost" aria-label="Clear filters">
          <X size={14} />
          Clear
        </button>
      )}
    </div>
  )
}
