import type { USState } from "@/types"

export const US_STATES: readonly USState[] = [
  { code: "AL", name: "Alabama", slug: "alabama", agentCount: 12127 },
  { code: "AK", name: "Alaska", slug: "alaska", agentCount: 1934 },
  { code: "AZ", name: "Arizona", slug: "arizona", agentCount: 19419 },
  { code: "AR", name: "Arkansas", slug: "arkansas", agentCount: 11506 },
  { code: "CA", name: "California", slug: "california", agentCount: 89725 },
  { code: "CO", name: "Colorado", slug: "colorado", agentCount: 26089 },
  { code: "CT", name: "Connecticut", slug: "connecticut", agentCount: 17912 },
  { code: "DE", name: "Delaware", slug: "delaware", agentCount: 7056 },
  { code: "FL", name: "Florida", slug: "florida", agentCount: 174446 },
  { code: "GA", name: "Georgia", slug: "georgia", agentCount: 27898 },
  { code: "HI", name: "Hawaii", slug: "hawaii", agentCount: 9163 },
  { code: "ID", name: "Idaho", slug: "idaho", agentCount: 10617 },
  { code: "IL", name: "Illinois", slug: "illinois", agentCount: 22289 },
  { code: "IN", name: "Indiana", slug: "indiana", agentCount: 14787 },
  { code: "IA", name: "Iowa", slug: "iowa", agentCount: 10271 },
  { code: "KS", name: "Kansas", slug: "kansas", agentCount: 12729 },
  { code: "KY", name: "Kentucky", slug: "kentucky", agentCount: 12747 },
  { code: "LA", name: "Louisiana", slug: "louisiana", agentCount: 11731 },
  { code: "ME", name: "Maine", slug: "maine", agentCount: 10303 },
  { code: "MD", name: "Maryland", slug: "maryland", agentCount: 12775 },
  { code: "MA", name: "Massachusetts", slug: "massachusetts", agentCount: 21554 },
  { code: "MI", name: "Michigan", slug: "michigan", agentCount: 62958 },
  { code: "MN", name: "Minnesota", slug: "minnesota", agentCount: 15670 },
  { code: "MS", name: "Mississippi", slug: "mississippi", agentCount: 9639 },
  { code: "MO", name: "Missouri", slug: "missouri", agentCount: 16059 },
  { code: "MT", name: "Montana", slug: "montana", agentCount: 6697 },
  { code: "NE", name: "Nebraska", slug: "nebraska", agentCount: 6396 },
  { code: "NV", name: "Nevada", slug: "nevada", agentCount: 14962 },
  { code: "NH", name: "New Hampshire", slug: "new-hampshire", agentCount: 10457 },
  { code: "NJ", name: "New Jersey", slug: "new-jersey", agentCount: 34293 },
  { code: "NM", name: "New Mexico", slug: "new-mexico", agentCount: 9200 },
  { code: "NY", name: "New York", slug: "new-york", agentCount: 28383 },
  { code: "NC", name: "North Carolina", slug: "north-carolina", agentCount: 27637 },
  { code: "ND", name: "North Dakota", slug: "north-dakota", agentCount: 1216 },
  { code: "OH", name: "Ohio", slug: "ohio", agentCount: 19897 },
  { code: "OK", name: "Oklahoma", slug: "oklahoma", agentCount: 13165 },
  { code: "OR", name: "Oregon", slug: "oregon", agentCount: 13400 },
  { code: "PA", name: "Pennsylvania", slug: "pennsylvania", agentCount: 19707 },
  { code: "RI", name: "Rhode Island", slug: "rhode-island", agentCount: 5807 },
  { code: "SC", name: "South Carolina", slug: "south-carolina", agentCount: 17053 },
  { code: "SD", name: "South Dakota", slug: "south-dakota", agentCount: 2533 },
  { code: "TN", name: "Tennessee", slug: "tennessee", agentCount: 16327 },
  { code: "TX", name: "Texas", slug: "texas", agentCount: 47298 },
  { code: "UT", name: "Utah", slug: "utah", agentCount: 12198 },
  { code: "VT", name: "Vermont", slug: "vermont", agentCount: 2882 },
  { code: "VA", name: "Virginia", slug: "virginia", agentCount: 56012 },
  { code: "WA", name: "Washington", slug: "washington", agentCount: 12148 },
  { code: "WV", name: "West Virginia", slug: "west-virginia", agentCount: 5435 },
  { code: "WI", name: "Wisconsin", slug: "wisconsin", agentCount: 11657 },
  { code: "WY", name: "Wyoming", slug: "wyoming", agentCount: 2053 },
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
