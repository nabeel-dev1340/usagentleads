"use client"

import { SearchX } from "lucide-react"
import type { Agent } from "@/types"

interface AgentTableProps {
  agents: Agent[]
  count: number
  page: number
  totalPages: number
  loading: boolean
  onPageChange: (page: number) => void
}

export function AgentTable({
  agents,
  count,
  page,
  totalPages,
  loading,
  onPageChange,
}: AgentTableProps) {
  if (loading) {
    return (
      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th className="hidden sm:table-cell">Phone</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, i) => (
              <tr key={i}>
                <td><div className="h-4 rounded-md bg-subtle animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} /></td>
                <td><div className="h-4 rounded-md bg-subtle animate-pulse" style={{ width: `${50 + Math.random() * 30}%` }} /></td>
                <td className="hidden sm:table-cell"><div className="h-4 rounded-md bg-subtle animate-pulse" style={{ width: `${40 + Math.random() * 30}%` }} /></td>
                <td><div className="h-4 rounded-md bg-subtle animate-pulse w-10" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (agents.length === 0) {
    return (
      <div className="text-center py-24 px-8">
        <div className="w-14 h-14 rounded-2xl bg-subtle border border-border flex items-center justify-center mx-auto mb-5">
          <SearchX size={24} className="text-muted" />
        </div>
        <p className="text-[16px] font-medium text-ink mb-1">No agents found</p>
        <p className="text-[14px] text-muted">
          Try a different name, email, or state filter
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th className="hidden sm:table-cell">Phone</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.id}>
                <td className="cell-name">{agent.full_name}</td>
                <td className="cell-email">{agent.email ?? "—"}</td>
                <td className="cell-phone hidden sm:table-cell">{agent.phone ?? "—"}</td>
                <td>
                  {agent.state
                    ? <span className="badge-state">{agent.state}</span>
                    : <span className="text-muted font-mono text-[12px]">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="btn-ghost disabled:opacity-40 disabled:pointer-events-none"
          >
            &larr; Previous
          </button>
          <span className="font-mono text-[14px] text-tertiary">
            Page <span className="text-ink">{page}</span> of <span className="text-ink">{totalPages.toLocaleString()}</span>
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="btn-ghost disabled:opacity-40 disabled:pointer-events-none"
          >
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  )
}
