import type { USState } from "@/types"

export const US_STATES: readonly USState[] = [
  { code: "AL", name: "Alabama", slug: "alabama", agentCount: 10974 },
  { code: "AK", name: "Alaska", slug: "alaska", agentCount: 1430 },
  { code: "AZ", name: "Arizona", slug: "arizona", agentCount: 18242 },
  { code: "AR", name: "Arkansas", slug: "arkansas", agentCount: 10911 },
  { code: "CA", name: "California", slug: "california", agentCount: 84478 },
  { code: "CO", name: "Colorado", slug: "colorado", agentCount: 25008 },
  { code: "CT", name: "Connecticut", slug: "connecticut", agentCount: 17785 },
  { code: "DE", name: "Delaware", slug: "delaware", agentCount: 6656 },
  { code: "FL", name: "Florida", slug: "florida", agentCount: 167814 },
  { code: "GA", name: "Georgia", slug: "georgia", agentCount: 25067 },
  { code: "HI", name: "Hawaii", slug: "hawaii", agentCount: 8649 },
  { code: "ID", name: "Idaho", slug: "idaho", agentCount: 10235 },
  { code: "IL", name: "Illinois", slug: "illinois", agentCount: 20479 },
  { code: "IN", name: "Indiana", slug: "indiana", agentCount: 13741 },
  { code: "IA", name: "Iowa", slug: "iowa", agentCount: 9556 },
  { code: "KS", name: "Kansas", slug: "kansas", agentCount: 12072 },
  { code: "KY", name: "Kentucky", slug: "kentucky", agentCount: 11460 },
  { code: "LA", name: "Louisiana", slug: "louisiana", agentCount: 10970 },
  { code: "ME", name: "Maine", slug: "maine", agentCount: 10226 },
  { code: "MD", name: "Maryland", slug: "maryland", agentCount: 12302 },
  { code: "MA", name: "Massachusetts", slug: "massachusetts", agentCount: 20720 },
  { code: "MI", name: "Michigan", slug: "michigan", agentCount: 19266 },
  { code: "MN", name: "Minnesota", slug: "minnesota", agentCount: 15154 },
  { code: "MS", name: "Mississippi", slug: "mississippi", agentCount: 9090 },
  { code: "MO", name: "Missouri", slug: "missouri", agentCount: 14654 },
  { code: "MT", name: "Montana", slug: "montana", agentCount: 6619 },
  { code: "NE", name: "Nebraska", slug: "nebraska", agentCount: 6379 },
  { code: "NV", name: "Nevada", slug: "nevada", agentCount: 14867 },
  { code: "NH", name: "New Hampshire", slug: "new-hampshire", agentCount: 10409 },
  { code: "NJ", name: "New Jersey", slug: "new-jersey", agentCount: 33786 },
  { code: "NM", name: "New Mexico", slug: "new-mexico", agentCount: 8875 },
  { code: "NY", name: "New York", slug: "new-york", agentCount: 26597 },
  { code: "NC", name: "North Carolina", slug: "north-carolina", agentCount: 19059 },
  { code: "ND", name: "North Dakota", slug: "north-dakota", agentCount: 623 },
  { code: "OH", name: "Ohio", slug: "ohio", agentCount: 13503 },
  { code: "OK", name: "Oklahoma", slug: "oklahoma", agentCount: 12513 },
  { code: "OR", name: "Oregon", slug: "oregon", agentCount: 12539 },
  { code: "PA", name: "Pennsylvania", slug: "pennsylvania", agentCount: 18182 },
  { code: "RI", name: "Rhode Island", slug: "rhode-island", agentCount: 5796 },
  { code: "SC", name: "South Carolina", slug: "south-carolina", agentCount: 11035 },
  { code: "SD", name: "South Dakota", slug: "south-dakota", agentCount: 2148 },
  { code: "TN", name: "Tennessee", slug: "tennessee", agentCount: 14874 },
  { code: "TX", name: "Texas", slug: "texas", agentCount: 43167 },
  { code: "UT", name: "Utah", slug: "utah", agentCount: 11645 },
  { code: "VT", name: "Vermont", slug: "vermont", agentCount: 2879 },
  { code: "VA", name: "Virginia", slug: "virginia", agentCount: 15346 },
  { code: "WA", name: "Washington", slug: "washington", agentCount: 11922 },
  { code: "WV", name: "West Virginia", slug: "west-virginia", agentCount: 5449 },
  { code: "WI", name: "Wisconsin", slug: "wisconsin", agentCount: 11622 },
  { code: "WY", name: "Wyoming", slug: "wyoming", agentCount: 2036 },
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
  if (count >= 1000) {
    return `${Math.round(count / 1000).toLocaleString()}K+`
  }
  return `${count.toLocaleString()}+`
}

export const VALID_STATE_CODES = new Set(US_STATES.map((s) => s.code))
