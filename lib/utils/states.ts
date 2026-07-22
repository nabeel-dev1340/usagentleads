import type { USState } from "@/types"

export const US_STATES: readonly USState[] = [
  { code: "AL", name: "Alabama", slug: "alabama", agentCount: 13019 },
  { code: "AK", name: "Alaska", slug: "alaska", agentCount: 2165 },
  { code: "AZ", name: "Arizona", slug: "arizona", agentCount: 22152 },
  { code: "AR", name: "Arkansas", slug: "arkansas", agentCount: 11866 },
  { code: "CA", name: "California", slug: "california", agentCount: 109705 },
  { code: "CO", name: "Colorado", slug: "colorado", agentCount: 28253 },
  { code: "CT", name: "Connecticut", slug: "connecticut", agentCount: 20114 },
  { code: "DE", name: "Delaware", slug: "delaware", agentCount: 7562 },
  { code: "FL", name: "Florida", slug: "florida", agentCount: 187149 },
  { code: "GA", name: "Georgia", slug: "georgia", agentCount: 33018 },
  { code: "HI", name: "Hawaii", slug: "hawaii", agentCount: 9921 },
  { code: "ID", name: "Idaho", slug: "idaho", agentCount: 11262 },
  { code: "IL", name: "Illinois", slug: "illinois", agentCount: 27261 },
  { code: "IN", name: "Indiana", slug: "indiana", agentCount: 16169 },
  { code: "IA", name: "Iowa", slug: "iowa", agentCount: 10555 },
  { code: "KS", name: "Kansas", slug: "kansas", agentCount: 13303 },
  { code: "KY", name: "Kentucky", slug: "kentucky", agentCount: 13229 },
  { code: "LA", name: "Louisiana", slug: "louisiana", agentCount: 13395 },
  { code: "ME", name: "Maine", slug: "maine", agentCount: 10517 },
  { code: "MD", name: "Maryland", slug: "maryland", agentCount: 15388 },
  { code: "MA", name: "Massachusetts", slug: "massachusetts", agentCount: 25429 },
  { code: "MI", name: "Michigan", slug: "michigan", agentCount: 64420 },
  { code: "MN", name: "Minnesota", slug: "minnesota", agentCount: 16259 },
  { code: "MS", name: "Mississippi", slug: "mississippi", agentCount: 9759 },
  { code: "MO", name: "Missouri", slug: "missouri", agentCount: 17285 },
  { code: "MT", name: "Montana", slug: "montana", agentCount: 6974 },
  { code: "NE", name: "Nebraska", slug: "nebraska", agentCount: 7071 },
  { code: "NV", name: "Nevada", slug: "nevada", agentCount: 16222 },
  { code: "NH", name: "New Hampshire", slug: "new-hampshire", agentCount: 11028 },
  { code: "NJ", name: "New Jersey", slug: "new-jersey", agentCount: 39568 },
  { code: "NM", name: "New Mexico", slug: "new-mexico", agentCount: 9676 },
  { code: "NY", name: "New York", slug: "new-york", agentCount: 38179 },
  { code: "NC", name: "North Carolina", slug: "north-carolina", agentCount: 30988 },
  { code: "ND", name: "North Dakota", slug: "north-dakota", agentCount: 1464 },
  { code: "OH", name: "Ohio", slug: "ohio", agentCount: 22332 },
  { code: "OK", name: "Oklahoma", slug: "oklahoma", agentCount: 13521 },
  { code: "OR", name: "Oregon", slug: "oregon", agentCount: 14261 },
  { code: "PA", name: "Pennsylvania", slug: "pennsylvania", agentCount: 25248 },
  { code: "RI", name: "Rhode Island", slug: "rhode-island", agentCount: 6253 },
  { code: "SC", name: "South Carolina", slug: "south-carolina", agentCount: 18703 },
  { code: "SD", name: "South Dakota", slug: "south-dakota", agentCount: 2642 },
  { code: "TN", name: "Tennessee", slug: "tennessee", agentCount: 19433 },
  { code: "TX", name: "Texas", slug: "texas", agentCount: 56057 },
  { code: "UT", name: "Utah", slug: "utah", agentCount: 13826 },
  { code: "VT", name: "Vermont", slug: "vermont", agentCount: 2984 },
  { code: "VA", name: "Virginia", slug: "virginia", agentCount: 58487 },
  { code: "WA", name: "Washington", slug: "washington", agentCount: 15157 },
  { code: "WV", name: "West Virginia", slug: "west-virginia", agentCount: 5624 },
  { code: "WI", name: "Wisconsin", slug: "wisconsin", agentCount: 12652 },
  { code: "WY", name: "Wyoming", slug: "wyoming", agentCount: 2209 },
] as const

export const TOTAL_AGENTS = US_STATES.reduce((sum, s) => sum + s.agentCount, 0)
export const CURRENT_YEAR = new Date().getFullYear()

export function getStateBySlug(slug: string): USState | undefined {
  return US_STATES.find((s) => s.slug === slug)
}

export function getStateByCode(code: string): USState | undefined {
  return US_STATES.find((s) => s.code === code.toUpperCase())
}

export function formatAgentCount(count: number): string {
  if (count >= 1_000_000) {
    return `${Math.floor(count / 1_000_000)}M+`
  }
  if (count >= 1000) {
    return `${Math.round(count / 1000).toLocaleString()}K+`
  }
  return `${count.toLocaleString()}+`
}

export const VALID_STATE_CODES = new Set(US_STATES.map((s) => s.code))
