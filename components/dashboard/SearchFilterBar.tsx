"use client"

import { Search, X } from "lucide-react"
import { US_STATES } from "@/lib/utils/states"
import { CustomSelect } from "@/components/ui/CustomSelect"

interface SearchFilterBarProps {
  search: string
  state: string
  onSearchChange: (value: string) => void
  onStateChange: (value: string) => void
  onClear: () => void
}

const stateOptions = [
  { value: "", label: "All States" },
  ...US_STATES.map((s) => ({ value: s.code, label: s.name })),
]

export function SearchFilterBar({
  search,
  state,
  onSearchChange,
  onStateChange,
  onClear,
}: SearchFilterBarProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full">
      <div className="relative flex-1 min-w-0 sm:min-w-50 sm:max-w-95">
        <Search size={15} className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          className="input pl-9 sm:pl-10"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search agents"
        />
      </div>

      <CustomSelect
        value={state}
        options={stateOptions}
        onChange={onStateChange}
        placeholder="All States"
        aria-label="Filter by state"
        className="w-full sm:w-auto"
        minWidth={0}
      />

      {(search || state) && (
        <button onClick={onClear} className="btn-ghost text-[13px] sm:text-[14px]" aria-label="Clear filters">
          <X size={15} />
          Clear
        </button>
      )}
    </div>
  )
}
