/**
 * Club-local time helpers. The calendar, the move form and the block form must read and write
 * wall-clock times in the club's timezone, never the browser's, so every conversion goes through
 * `Intl` with an explicit `timeZone`. Pure functions, no state.
 */

/** Same zone the API uses for the calendar (`GET /calendar` answers it as `timezone`). */
export const CLUB_TIMEZONE = 'America/Argentina/Buenos_Aires'

const partsFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: CLUB_TIMEZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

export interface ClubParts {
  /** `YYYY-MM-DD` in the club timezone. */
  date: string
  /** Minutes since club-local midnight. */
  minutes: number
}

type Instant = Date | string | number

function toMs(value: Instant): number {
  return value instanceof Date ? value.getTime() : typeof value === 'number' ? value : new Date(value).getTime()
}

function wallClock(ms: number): { y: number; mo: number; d: number; h: number; mi: number; s: number } {
  const out: Record<string, number> = {}
  for (const p of partsFormat.formatToParts(new Date(ms))) {
    if (p.type !== 'literal') out[p.type] = Number(p.value)
  }
  return { y: out.year, mo: out.month, d: out.day, h: out.hour % 24, mi: out.minute, s: out.second }
}

/** Offset of the club timezone from UTC at an instant, in milliseconds (`-3 h` for Buenos Aires). */
export function clubOffsetMs(value: Instant): number {
  const ms = toMs(value)
  const w = wallClock(ms)
  return Date.UTC(w.y, w.mo - 1, w.d, w.h, w.mi, w.s) - Math.floor(ms / 1000) * 1000
}

/** The club-local date and minutes since midnight of an instant. */
export function clubParts(value: Instant): ClubParts {
  const w = wallClock(toMs(value))
  const date = `${String(w.y).padStart(4, '0')}-${String(w.mo).padStart(2, '0')}-${String(w.d).padStart(2, '0')}`
  return { date, minutes: w.h * 60 + w.mi }
}

/** The instant of a club-local wall-clock time (`minutes` may be 1440 for the end of the day). */
export function clubInstant(date: string, minutes: number): Date {
  const [y, m, d] = date.split('-').map(Number)
  const naive = Date.UTC(y, m - 1, d, 0, minutes)
  const first = naive - clubOffsetMs(naive)
  return new Date(naive - clubOffsetMs(first))
}

/** `HH:MM` or `24:00` to minutes since midnight. */
export function hhmmToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function minutesToHhmm(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

/** Adds whole days to a `YYYY-MM-DD` date without going through a timezone-shifting `Date`. */
export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

/** 0 = Sunday ... 6 = Saturday. */
export function dayOfWeek(date: string): number {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

/** The Monday of the week containing `date`. */
export function mondayOf(date: string): string {
  return addDays(date, -((dayOfWeek(date) + 6) % 7))
}

/** Today's date (`YYYY-MM-DD`) in the club timezone. */
export function clubToday(now: Instant = Date.now()): string {
  return clubParts(now).date
}

export function isIsoDate(value: string | null | undefined): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
}

/** `14:30`, club-local. */
export function formatClubTime(value: Instant): string {
  return minutesToHhmm(clubParts(value).minutes)
}

/** `12/10 14:30`, club-local. */
export function formatClubDateTime(value: Instant): string {
  const { date, minutes } = clubParts(value)
  return `${date.slice(8, 10)}/${date.slice(5, 7)} ${minutesToHhmm(minutes)}`
}

const DAY_SHORT = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
const MONTH_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const DAY_LONG = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MONTH_LONG = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

/** `lun 12 oct` */
export function formatDayShort(date: string): string {
  return `${DAY_SHORT[dayOfWeek(date)]} ${Number(date.slice(8, 10))} ${MONTH_SHORT[Number(date.slice(5, 7)) - 1]}`
}

/** `lunes 12 de octubre de 2026` */
export function formatDayLong(date: string): string {
  return `${DAY_LONG[dayOfWeek(date)]} ${Number(date.slice(8, 10))} de ${MONTH_LONG[Number(date.slice(5, 7)) - 1]} de ${date.slice(0, 4)}`
}
