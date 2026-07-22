import { timingSafeCompare } from "./security"

/**
 * Bearer-token auth for the /api/cron/* jobs.
 *
 * Fails CLOSED when CRON_SECRET is unset. The previous inline checks built the
 * expected header as `Bearer ${process.env.CRON_SECRET}`, which on a deploy
 * missing the env var becomes the guessable literal "Bearer undefined" — anyone
 * could then trigger CSV regeneration or fire the whole nurture drip.
 *
 * Comparison is constant-time and never throws (see timingSafeCompare).
 */
export function isAuthorizedCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error("CRON_SECRET is not set — refusing cron request")
    return false
  }

  const authHeader = request.headers.get("authorization")
  if (!authHeader) return false

  return timingSafeCompare(authHeader, `Bearer ${secret}`)
}
