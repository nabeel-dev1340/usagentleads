"use client"

import { useCallback, useEffect, useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { AgentTable } from "@/components/dashboard/AgentTable"
import { SearchFilterBar } from "@/components/dashboard/SearchFilterBar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Search } from "lucide-react"
import type { Agent } from "@/types"

export default function DashboardPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [state, setState] = useState("")

  const fetchAgents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (state && state !== "all") params.set("state", state)
      if (search) params.set("search", search)
      params.set("page", String(page))

      const res = await fetch(`/api/agents?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setAgents(data.data)
        setCount(data.count)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error("Failed to fetch agents:", error)
    } finally {
      setLoading(false)
    }
  }, [state, search, page])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleStateSelect = (stateCode: string) => {
    setState(stateCode)
    setPage(1)
  }

  const handleClear = () => {
    setSearch("")
    setState("")
    setPage(1)
  }

  const perPage = 25
  const start = (page - 1) * perPage + 1
  const end = Math.min(page * perPage, count)

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <DashboardSidebar activeState={state} onStateSelect={handleStateSelect} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-page">
        <div className="p-8 max-sm:p-4">
          {/* Mobile sidebar trigger */}
          <div className="mb-4 flex items-center gap-3 lg:hidden">
            <Sheet>
              <SheetTrigger render={<button className="btn-ghost p-2" />}>
                  <Menu size={20} />
                  <span className="sr-only">Open sidebar</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <DashboardSidebar
                  activeState={state}
                  onStateSelect={handleStateSelect}
                />
              </SheetContent>
            </Sheet>
            <h1 className="text-[20px] font-semibold text-ink">Agent Database</h1>
          </div>

          {/* Page header (desktop) */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-[24px] font-semibold text-ink tracking-[-0.01em]">
              Agent Database
            </h1>
            <p className="text-[14px] text-tertiary mt-1">
              Browse and search all 500,847 verified US real estate agents
            </p>
          </div>

          {/* Search/filter bar */}
          <div className="mb-5">
            <div className="flex items-center gap-3 flex-wrap">
              <SearchFilterBar
                search={search}
                state={state}
                onSearchChange={setSearch}
                onStateChange={handleStateSelect}
                onClear={handleClear}
              />
              <p className="font-mono text-[14px] text-tertiary ml-auto">
                <span className="text-ink font-medium">{start}–{end}</span> of{" "}
                <span className="text-ink font-medium">{count.toLocaleString()}</span> agents
              </p>
            </div>
          </div>

          <AgentTable
            agents={agents}
            count={count}
            page={page}
            totalPages={totalPages}
            loading={loading}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  )
}
