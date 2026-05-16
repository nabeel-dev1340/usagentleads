"use client"

import { useRouter } from "next/navigation"
import { useState, useId, useRef } from "react"
import { US_STATES } from "@/lib/utils/states"
import type { USState } from "@/types"

type Coord = { col: number; row: number }

const HEX_COORDS: Record<string, Coord> = {
  ME: { col: 11, row: 0 },
  VT: { col: 9, row: 1 }, NH: { col: 10, row: 1 },
  WA: { col: 1, row: 2 }, ID: { col: 2, row: 2 }, MT: { col: 3, row: 2 }, ND: { col: 4, row: 2 }, MN: { col: 5, row: 2 }, WI: { col: 6, row: 2 }, MI: { col: 7, row: 2 }, NY: { col: 10, row: 2 }, MA: { col: 11, row: 2 },
  OR: { col: 1, row: 3 }, UT: { col: 2, row: 3 }, WY: { col: 3, row: 3 }, SD: { col: 4, row: 3 }, IA: { col: 5, row: 3 }, IL: { col: 6, row: 3 }, IN: { col: 7, row: 3 }, OH: { col: 8, row: 3 }, PA: { col: 9, row: 3 }, NJ: { col: 10, row: 3 }, CT: { col: 11, row: 3 }, RI: { col: 12, row: 3 },
  CA: { col: 1, row: 4 }, NV: { col: 2, row: 4 }, CO: { col: 3, row: 4 }, NE: { col: 4, row: 4 }, MO: { col: 5, row: 4 }, KY: { col: 6, row: 4 }, WV: { col: 7, row: 4 }, VA: { col: 8, row: 4 }, MD: { col: 9, row: 4 }, DE: { col: 10, row: 4 },
  AZ: { col: 2, row: 5 }, NM: { col: 3, row: 5 }, KS: { col: 4, row: 5 }, AR: { col: 5, row: 5 }, TN: { col: 6, row: 5 }, NC: { col: 7, row: 5 }, SC: { col: 8, row: 5 },
  TX: { col: 4, row: 6 }, OK: { col: 5, row: 6 }, LA: { col: 6, row: 6 }, MS: { col: 7, row: 6 }, AL: { col: 8, row: 6 }, GA: { col: 9, row: 6 },
  AK: { col: 0, row: 7 }, HI: { col: 1, row: 7 }, FL: { col: 10, row: 7 },
}

const BUCKETS = [
  { max: 6_000, fill: "#DBEAFE", text: "#1E3A8A", label: "< 6K" },
  { max: 10_000, fill: "#93C5FD", text: "#1E3A8A", label: "6–10K" },
  { max: 15_000, fill: "#3B82F6", text: "#FFFFFF", label: "10–15K" },
  { max: 30_000, fill: "#1D4ED8", text: "#FFFFFF", label: "15–30K" },
  { max: Infinity, fill: "#1E3A8A", text: "#FFFFFF", label: "30K+" },
] as const

function bucketFor(count: number) {
  return BUCKETS.find((b) => count < b.max) ?? BUCKETS[BUCKETS.length - 1]
}

const HEX_R = 22
const COL_STEP = HEX_R * Math.sqrt(3)
const ROW_STEP = HEX_R * 1.5
const PAD_X = 14
const PAD_Y = 14

const MAX_COL = 12
const MAX_ROW = 7
const VIEW_W = PAD_X * 2 + COL_STEP * (MAX_COL + 1.5)
const VIEW_H = PAD_Y * 2 + ROW_STEP * MAX_ROW + HEX_R * 2

function hexPath(cx: number, cy: number, r: number) {
  const dx = (r * Math.sqrt(3)) / 2
  const dy = r / 2
  return `M${cx},${cy - r} L${cx + dx},${cy - dy} L${cx + dx},${cy + dy} L${cx},${cy + r} L${cx - dx},${cy + dy} L${cx - dx},${cy - dy} Z`
}

type Positioned = USState & { x: number; y: number }

const TOOLTIP_W = 152
const TOOLTIP_H = 54
const CURSOR_OFFSET = 16

export function StateDensityMap({ countMap }: { countMap?: Record<string, number> }) {
  const tooltipId = useId()
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<Positioned | null>(null)
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null)

  function handleMove(e: React.MouseEvent) {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    setPointer({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  function handleLeave() {
    setHover(null)
    setPointer(null)
  }

  let tooltipStyle: React.CSSProperties | undefined
  if (pointer && cardRef.current) {
    const cardW = cardRef.current.clientWidth
    const cardH = cardRef.current.clientHeight
    let left = pointer.x + CURSOR_OFFSET
    let top = pointer.y - TOOLTIP_H - 10
    if (left + TOOLTIP_W > cardW - 4) left = pointer.x - TOOLTIP_W - CURSOR_OFFSET
    if (left < 4) left = 4
    if (top < 4) top = pointer.y + CURSOR_OFFSET
    if (top + TOOLTIP_H > cardH - 4) top = cardH - TOOLTIP_H - 4
    tooltipStyle = { left, top, width: TOOLTIP_W }
  }

  const states: Positioned[] = US_STATES.map((s) => {
    const coord = HEX_COORDS[s.code]
    const offset = coord.row % 2 === 1 ? COL_STEP / 2 : 0
    const x = PAD_X + offset + coord.col * COL_STEP + HEX_R
    const y = PAD_Y + coord.row * ROW_STEP + HEX_R
    const live = countMap?.[s.name]
    return {
      ...s,
      agentCount: live ?? s.agentCount,
      x,
      y,
    }
  })

  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <div
        ref={cardRef}
        className="relative rounded-2xl border border-border bg-white p-4 shadow-xl sm:p-5"
        onMouseLeave={handleLeave}
        onMouseMove={handleMove}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-tertiary sm:text-[12px]">
            Coverage · All 50 states
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-2.5 py-0.5 text-[11px] font-semibold text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Verified
          </span>
        </div>

        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          role="img"
          aria-labelledby={`${tooltipId}-title`}
          className="block h-auto w-full"
        >
          <title id={`${tooltipId}-title`}>
            US real estate agent contact density by state
          </title>
          {states.map((s) => {
            const b = bucketFor(s.agentCount)
            const isHover = hover?.code === s.code
            const href = `/states/${s.slug}`
            return (
              <a
                key={s.code}
                href={href}
                aria-label={`${s.name} — ${s.agentCount.toLocaleString()} real estate agent contacts`}
                className="cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-accent"
                onMouseEnter={() => setHover(s)}
                onFocus={() => setHover(s)}
                onBlur={() => setHover(null)}
                onClick={(e) => {
                  e.preventDefault()
                  router.push(href)
                }}
              >
                <path
                  d={hexPath(s.x, s.y, HEX_R - 1.5)}
                  fill={b.fill}
                  stroke={isHover ? "#0F1623" : "rgba(255,255,255,0.85)"}
                  strokeWidth={isHover ? 2 : 1.2}
                  style={{
                    transition: "stroke 120ms ease, transform 120ms ease",
                    transformOrigin: `${s.x}px ${s.y}px`,
                    transform: isHover ? "scale(1.06)" : "scale(1)",
                  }}
                />
                <text
                  x={s.x}
                  y={s.y + 3.5}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={600}
                  fontFamily="var(--font-jetbrains-mono), ui-monospace, monospace"
                  fill={b.text}
                  pointerEvents="none"
                >
                  {s.code}
                </text>
              </a>
            )
          })}
        </svg>

        {/* Tooltip — follows cursor when hovering; centers near top for keyboard focus */}
        {hover && (
          <div
            role="status"
            aria-live="polite"
            style={tooltipStyle}
            className={
              tooltipStyle
                ? "pointer-events-none absolute z-20 rounded-lg border border-ink/40 bg-ink/95 px-3 py-2 text-white shadow-xl backdrop-blur-sm"
                : "pointer-events-none absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-lg border border-ink/40 bg-ink/95 px-3 py-2 text-center text-white shadow-xl backdrop-blur-sm"
            }
          >
            <p className="truncate text-[12px] font-medium leading-none text-white/70">
              {hover.name}
            </p>
            <p className="mt-1.5 font-mono text-[15px] font-semibold leading-none">
              {hover.agentCount.toLocaleString()}
              <span className="ml-1 text-[11px] font-normal text-white/60">contacts</span>
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted sm:text-[12px]">
            Contacts per state
          </span>
          <div className="flex items-center gap-1.5">
            {BUCKETS.map((b) => (
              <div key={b.label} className="flex items-center gap-1">
                <span
                  className="inline-block h-3 w-3 rounded-[3px]"
                  style={{ backgroundColor: b.fill }}
                  aria-hidden
                />
                <span className="text-[10px] font-mono text-tertiary sm:text-[11px]">
                  {b.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-[12px] text-muted sm:text-[13px]">
        Hover or tap any state to see its contact count · Click to view sample
      </p>
    </div>
  )
}
