import { clubInstant, clubParts, hhmmToMinutes, minutesToHhmm } from '@/lib/club-time'

/**
 * `<input type="datetime-local">` values are wall-clock times in the CLUB's timezone, never the
 * browser's: the API stores instants and the players read them in the club's zone.
 */
export function isoToInput(iso: string | null | undefined): string {
  if (!iso) return ''
  const { date, minutes } = clubParts(iso)
  return `${date}T${minutesToHhmm(minutes)}`
}

/** `''` when empty or malformed. */
export function inputToIso(value: string): string | null {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(value.trim())
  if (!m) return null
  return clubInstant(m[1], hhmmToMinutes(m[2])).toISOString()
}
