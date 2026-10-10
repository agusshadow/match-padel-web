/**
 * Pure geometry of the calendar grid: where a time span sits in a column, which parts of a day
 * are closed and how overlapping items share a column. Everything works in minutes relative to the
 * start of a club-local day and in absolute epoch milliseconds, so it never depends on the browser
 * timezone. Callers pass the day's start instant from `clubInstant(date, 0)`.
 */
import type { CalendarOpenWindow } from '@match-padel/types'

export const MS_PER_MINUTE = 60_000
export const GRID_STEP_MINUTES = 30
/** Vertical size of one minute in the grid, in px (a 30 minute row is 36 px). */
export const PX_PER_MINUTE = 1.2
/** Range shown when no court is open on the visible days. */
export const FALLBACK_RANGE: MinuteRange = { start: 8 * 60, end: 22 * 60 }

export interface MinuteRange {
  /** Minutes since the day start, inclusive. */
  start: number
  /** Minutes since the day start, exclusive. */
  end: number
}

export interface Span {
  startMs: number
  endMs: number
}

/** Position of a span inside a day column: minutes from the top of the visible range. */
export interface Placement {
  top: number
  height: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Minutes of `ms` relative to a day start (may be negative or above 1440). */
export function minutesFrom(dayStartMs: number, ms: number): number {
  return (ms - dayStartMs) / MS_PER_MINUTE
}

/** Where `span` sits in the column of the day starting at `dayStartMs`; null when it is outside the visible range. */
export function placeSpan(span: Span, dayStartMs: number, range: MinuteRange): Placement | null {
  const start = clamp(minutesFrom(dayStartMs, span.startMs), range.start, range.end)
  const end = clamp(minutesFrom(dayStartMs, span.endMs), range.start, range.end)
  if (end <= start) return null
  return { top: start - range.start, height: end - start }
}

/** Closed stretches of a day inside `range`: whatever is not covered by an open window. */
export function closedPlacements(
  windows: Pick<CalendarOpenWindow, 'start_time' | 'end_time'>[],
  dayStartMs: number,
  range: MinuteRange,
): Placement[] {
  const open = windows
    .map((w) => ({
      start: clamp(minutesFrom(dayStartMs, new Date(w.start_time).getTime()), range.start, range.end),
      end: clamp(minutesFrom(dayStartMs, new Date(w.end_time).getTime()), range.start, range.end),
    }))
    .filter((w) => w.end > w.start)
    .sort((a, b) => a.start - b.start)
  const closed: Placement[] = []
  let cursor = range.start
  for (const w of open) {
    if (w.start > cursor) closed.push({ top: cursor - range.start, height: w.start - cursor })
    cursor = Math.max(cursor, w.end)
  }
  if (cursor < range.end) closed.push({ top: cursor - range.start, height: range.end - cursor })
  return closed
}

/**
 * The hour range a set of days needs: the earliest opening to the latest closing (rounded out to
 * the 30 minute grid), widened to include any item that falls outside the opening hours so
 * nothing is hidden.
 */
export function visibleRange(
  days: Array<{ dayStartMs: number; windows: Pick<CalendarOpenWindow, 'start_time' | 'end_time'>[] }>,
  items: Array<{ dayStartMs: number; span: Span }>,
): MinuteRange {
  let start = Infinity
  let end = -Infinity
  for (const day of days) {
    for (const w of day.windows) {
      start = Math.min(start, minutesFrom(day.dayStartMs, new Date(w.start_time).getTime()))
      end = Math.max(end, minutesFrom(day.dayStartMs, new Date(w.end_time).getTime()))
    }
  }
  if (!Number.isFinite(start)) {
    start = FALLBACK_RANGE.start
    end = FALLBACK_RANGE.end
  }
  for (const item of items) {
    const s = minutesFrom(item.dayStartMs, item.span.startMs)
    const e = minutesFrom(item.dayStartMs, item.span.endMs)
    if (e <= 0 || s >= 1440) continue
    start = Math.min(start, Math.max(0, s))
    end = Math.max(end, Math.min(1440, e))
  }
  start = clamp(Math.floor(start / GRID_STEP_MINUTES) * GRID_STEP_MINUTES, 0, 1440 - 60)
  end = clamp(Math.ceil(end / GRID_STEP_MINUTES) * GRID_STEP_MINUTES, start + 60, 1440)
  return { start, end }
}

export interface Columned<T> {
  item: T
  /** Zero-based column inside its cluster of overlapping items. */
  column: number
  /** Number of columns of the cluster, so each item is `1 / columns` wide. */
  columns: number
}

/**
 * Side-by-side layout of overlapping items (Google Calendar style). Items are grouped in clusters
 * of transitively overlapping spans; inside a cluster each item takes the first free column.
 * Spans that only touch (one ends when the next starts) do not overlap.
 */
export function layoutOverlaps<T>(items: T[], span: (item: T) => Span): Array<Columned<T>> {
  const sorted = [...items].sort((a, b) => {
    const sa = span(a)
    const sb = span(b)
    return sa.startMs - sb.startMs || sb.endMs - sa.endMs
  })
  const result: Array<Columned<T>> = []
  let cluster: Array<{ item: T; column: number }> = []
  let clusterEnd = -Infinity
  let columnEnds: number[] = []

  const flush = () => {
    for (const entry of cluster) result.push({ ...entry, columns: columnEnds.length })
    cluster = []
    columnEnds = []
    clusterEnd = -Infinity
  }

  for (const item of sorted) {
    const s = span(item)
    if (cluster.length > 0 && s.startMs >= clusterEnd) flush()
    let column = columnEnds.findIndex((end) => end <= s.startMs)
    if (column === -1) {
      column = columnEnds.length
      columnEnds.push(s.endMs)
    } else {
      columnEnds[column] = s.endMs
    }
    cluster.push({ item, column })
    clusterEnd = Math.max(clusterEnd, s.endMs)
  }
  flush()
  return result
}

/** Snaps minutes to the 30 minute grid. */
export function snapMinutes(minutes: number, mode: 'floor' | 'round' | 'ceil' = 'round'): number {
  const step = GRID_STEP_MINUTES
  return Math[mode](minutes / step) * step
}
