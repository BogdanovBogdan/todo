/** Format a UTC Date in the given IANA timezone */
export function formatInTz(
  date: Date,
  tz: string,
  opts: Omit<Intl.DateTimeFormatOptions, "timeZone"> = {}
): string {
  return new Intl.DateTimeFormat("ru-RU", { timeZone: tz, ...opts }).format(date)
}

/** Convert a UTC timestamp to a local YYYY-MM-DD string in the given timezone */
export function toLocalDateStr(date: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

/** Convert a YYYY-MM-DD string to a local Date (local noon) safe for DayPicker */
export function dateStrToLocal(str: string): Date {
  const [y, m, d] = str.split("-").map(Number)
  return new Date(y, m - 1, d, 12, 0, 0)
}

/** Convert a DayPicker-returned local Date back to YYYY-MM-DD */
export function localDateToStr(date: Date): string {
  return new Intl.DateTimeFormat("en-CA").format(date)
}

/**
 * Get UTC timestamp for local midnight on localDateStr in the given timezone.
 * Uses UTC noon as a stable reference to compute the UTC offset, then applies it.
 */
function getLocalMidnightUTC(localDateStr: string, tz: string): Date {
  const [y, m, d] = localDateStr.split("-").map(Number)
  const utcNoon = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
  const localAtNoon = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(utcNoon)
  const [datePart, timePart] = localAtNoon.split(", ")
  const [lh, lm] = timePart.split(":").map(Number)
  let offsetMinutes = lh * 60 + lm - 12 * 60
  if (datePart !== localDateStr) {
    offsetMinutes += (datePart > localDateStr ? 1 : -1) * 24 * 60
  }
  return new Date(Date.UTC(y, m - 1, d) - offsetMinutes * 60 * 1000)
}

/** UTC start/end timestamps for a local calendar day in the given timezone */
export function getDayBoundsUTC(
  localDateStr: string,
  tz: string
): { start: Date; end: Date } {
  const [y, m, d] = localDateStr.split("-").map(Number)
  const nextDate = new Date(y, m - 1, d + 1)
  const nextDateStr = new Intl.DateTimeFormat("en-CA").format(nextDate)
  return {
    start: getLocalMidnightUTC(localDateStr, tz),
    end: getLocalMidnightUTC(nextDateStr, tz),
  }
}
