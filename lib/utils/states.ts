import type { USState } from "@/types"

export const US_STATES: readonly USState[] = [
  { code: "AL", name: "Alabama", slug: "alabama", agentCount: 18400 },
  { code: "AK", name: "Alaska", slug: "alaska", agentCount: 3200 },
  { code: "AZ", name: "Arizona", slug: "arizona", agentCount: 61000 },
  { code: "AR", name: "Arkansas", slug: "arkansas", agentCount: 11200 },
  { code: "CA", name: "California", slug: "california", agentCount: 481000 },
  { code: "CO", name: "Colorado", slug: "colorado", agentCount: 47000 },
  { code: "CT", name: "Connecticut", slug: "connecticut", agentCount: 18000 },
  { code: "DE", name: "Delaware", slug: "delaware", agentCount: 4800 },
  { code: "FL", name: "Florida", slug: "florida", agentCount: 327000 },
  { code: "GA", name: "Georgia", slug: "georgia", agentCount: 62000 },
  { code: "HI", name: "Hawaii", slug: "hawaii", agentCount: 8200 },
  { code: "ID", name: "Idaho", slug: "idaho", agentCount: 11000 },
  { code: "IL", name: "Illinois", slug: "illinois", agentCount: 54000 },
  { code: "IN", name: "Indiana", slug: "indiana", agentCount: 27000 },
  { code: "IA", name: "Iowa", slug: "iowa", agentCount: 12000 },
  { code: "KS", name: "Kansas", slug: "kansas", agentCount: 11000 },
  { code: "KY", name: "Kentucky", slug: "kentucky", agentCount: 18000 },
  { code: "LA", name: "Louisiana", slug: "louisiana", agentCount: 19000 },
  { code: "ME", name: "Maine", slug: "maine", agentCount: 6200 },
  { code: "MD", name: "Maryland", slug: "maryland", agentCount: 31000 },
  { code: "MA", name: "Massachusetts", slug: "massachusetts", agentCount: 27000 },
  { code: "MI", name: "Michigan", slug: "michigan", agentCount: 38000 },
  { code: "MN", name: "Minnesota", slug: "minnesota", agentCount: 26000 },
  { code: "MS", name: "Mississippi", slug: "mississippi", agentCount: 9800 },
  { code: "MO", name: "Missouri", slug: "missouri", agentCount: 26000 },
  { code: "MT", name: "Montana", slug: "montana", agentCount: 6000 },
  { code: "NE", name: "Nebraska", slug: "nebraska", agentCount: 9000 },
  { code: "NV", name: "Nevada", slug: "nevada", agentCount: 31000 },
  { code: "NH", name: "New Hampshire", slug: "new-hampshire", agentCount: 5800 },
  { code: "NJ", name: "New Jersey", slug: "new-jersey", agentCount: 51000 },
  { code: "NM", name: "New Mexico", slug: "new-mexico", agentCount: 9200 },
  { code: "NY", name: "New York", slug: "new-york", agentCount: 71000 },
  { code: "NC", name: "North Carolina", slug: "north-carolina", agentCount: 55000 },
  { code: "ND", name: "North Dakota", slug: "north-dakota", agentCount: 3100 },
  { code: "OH", name: "Ohio", slug: "ohio", agentCount: 46000 },
  { code: "OK", name: "Oklahoma", slug: "oklahoma", agentCount: 18000 },
  { code: "OR", name: "Oregon", slug: "oregon", agentCount: 24000 },
  { code: "PA", name: "Pennsylvania", slug: "pennsylvania", agentCount: 47000 },
  { code: "RI", name: "Rhode Island", slug: "rhode-island", agentCount: 5100 },
  { code: "SC", name: "South Carolina", slug: "south-carolina", agentCount: 31000 },
  { code: "SD", name: "South Dakota", slug: "south-dakota", agentCount: 3600 },
  { code: "TN", name: "Tennessee", slug: "tennessee", agentCount: 38000 },
  { code: "TX", name: "Texas", slug: "texas", agentCount: 232000 },
  { code: "UT", name: "Utah", slug: "utah", agentCount: 22000 },
  { code: "VT", name: "Vermont", slug: "vermont", agentCount: 3200 },
  { code: "VA", name: "Virginia", slug: "virginia", agentCount: 42000 },
  { code: "WA", name: "Washington", slug: "washington", agentCount: 44000 },
  { code: "WV", name: "West Virginia", slug: "west-virginia", agentCount: 5400 },
  { code: "WI", name: "Wisconsin", slug: "wisconsin", agentCount: 21000 },
  { code: "WY", name: "Wyoming", slug: "wyoming", agentCount: 2800 },
] as const

export const TOTAL_AGENTS = US_STATES.reduce((sum, s) => sum + s.agentCount, 0)

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
