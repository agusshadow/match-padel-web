import type { CourtSurface } from '@match-padel/types'

/** Display order of `day_of_week` (0 = Sunday ... 6 = Saturday): the week starts on Monday. */
export const DAY_ORDER: readonly number[] = [1, 2, 3, 4, 5, 6, 0]

export const DAY_NAMES: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
}

export const DAY_SHORT: Record<number, string> = {
  0: 'Dom',
  1: 'Lun',
  2: 'Mar',
  3: 'Mié',
  4: 'Jue',
  5: 'Vie',
  6: 'Sáb',
}

export const SURFACE_LABELS: Record<CourtSurface, string> = {
  indoor: 'Interior',
  outdoor: 'Exterior',
  panoramic: 'Panorámica',
}

/** Half-hour grid used by the time selectors; `24:00` is only valid as a closing time. */
export const OPEN_TIMES: string[] = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, '0')
  return `${h}:${i % 2 === 0 ? '00' : '30'}`
})
export const CLOSE_TIMES: string[] = [...OPEN_TIMES.slice(1), '24:00']

/** Keeps a value that is not on the grid (e.g. `08:15` set elsewhere) selectable. */
export function withValue(options: string[], value: string): string[] {
  return options.includes(value) ? options : [...options, value].sort()
}

/** `HH:MM` (or `24:00`) to minutes since midnight. */
export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd
}

/** Today's date (`YYYY-MM-DD`) in the club's timezone, which is what the API compares dates against. */
export function clubToday(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

/** `2026-10-12` to `12/10/2026` without going through a timezone-shifting `Date`. */
export function formatIsoDate(date: string): string {
  const [y, m, d] = date.split('-')
  return `${d}/${m}/${y}`
}

export function daysLabel(days: number[]): string {
  const sorted = DAY_ORDER.filter((d) => days.includes(d))
  if (sorted.length === 7) return 'Todos los días'
  return sorted.map((d) => DAY_SHORT[d]).join(', ')
}
