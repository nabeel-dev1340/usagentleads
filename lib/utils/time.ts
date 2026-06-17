/** Render a coarse, human-friendly relative time like "today", "3 days ago", "2 weeks ago". */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ""

  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000))
  const day = 86400

  if (seconds < day) return "today"

  const days = Math.floor(seconds / day)
  if (days === 1) return "yesterday"
  if (days < 7) return `${days} days ago`

  const weeks = Math.floor(days / 7)
  if (weeks === 1) return "1 week ago"
  if (days < 30) return `${weeks} weeks ago`

  const months = Math.floor(days / 30)
  if (months === 1) return "1 month ago"
  return `${months} months ago`
}
