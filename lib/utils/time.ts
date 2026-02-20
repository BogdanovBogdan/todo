/**
 * Parse "01:30", "1:30" → seconds.
 * Returns null if input is empty or unrecognised.
 */
export function parseEstimate(input: string): number | null {
  const s = input.trim()
  if (!s) return null

  const m = s.match(/^(\d{1,2}):(\d{2})$/)
  if (m) return (parseInt(m[1]) * 60 + parseInt(m[2])) * 60

  return null
}

/** Format seconds to "01:30" */
export function formatEstimate(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
}
