import { useRef, useState } from 'react'
import type { CalendarDay, CalendarReservation, CourtBlock } from '@match-padel/types'
import { formatMoney, personName } from '@match-padel/ui'
import { formatClubTime, minutesToHhmm } from '@/lib/club-time'
import {
  GRID_STEP_MINUTES,
  PX_PER_MINUTE,
  closedPlacements,
  layoutOverlaps,
  placeSpan,
  snapMinutes,
  type MinuteRange,
  type Span,
} from '../lib/layout'
import { PAYMENT_LABELS, RESERVATION_BLOCK_CLASSES, matchLabel } from '../lib/labels'

export interface GridColumn {
  key: string
  title: string
  subtitle?: string
  courtId: string
  /** Start instant (ms) of the club-local day this column shows. */
  dayStartMs: number
  day: CalendarDay | null
  reservations: CalendarReservation[]
  blocks: CourtBlock[]
  isToday: boolean
  inactive?: boolean
}

export interface DragSelection {
  courtId: string
  startMs: number
  endMs: number
}

type GridItem =
  | { kind: 'reservation'; id: string; span: Span; reservation: CalendarReservation }
  | { kind: 'block'; id: string; span: Span; block: CourtBlock }

const HEADER_HEIGHT = 56
const MIN_ITEM_PX = 20

function spanOf(startIso: string, endIso: string): Span {
  return { startMs: new Date(startIso).getTime(), endMs: new Date(endIso).getTime() }
}

export function CalendarGrid({
  columns,
  range,
  nowMs,
  selectedKey,
  onSelectReservation,
  onSelectBlock,
  onDragCreate,
}: {
  columns: GridColumn[]
  range: MinuteRange
  nowMs: number
  /** `reservation:<id>` or `block:<id>` of the open item. */
  selectedKey: string | null
  onSelectReservation: (id: string) => void
  onSelectBlock: (id: string) => void
  /** Present only for roles that can create blocks; enables click-drag on empty cells. */
  onDragCreate?: (selection: DragSelection) => void
}) {
  const totalMinutes = range.end - range.start
  const bodyHeight = totalMinutes * PX_PER_MINUTE
  const hours: number[] = []
  for (let m = Math.ceil(range.start / 60) * 60; m < range.end; m += 60) hours.push(m)
  const halfLines: number[] = []
  for (let m = Math.ceil(range.start / GRID_STEP_MINUTES) * GRID_STEP_MINUTES; m < range.end; m += GRID_STEP_MINUTES) {
    halfLines.push(m)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-auto max-h-[calc(100vh-15rem)] min-h-[320px]">
      <div className="flex min-w-max">
        <div className="sticky left-0 z-20 bg-white border-r border-gray-200 w-14 shrink-0">
          <div className="sticky top-0 z-30 bg-white border-b border-gray-200" style={{ height: HEADER_HEIGHT }} />
          <div className="relative" style={{ height: bodyHeight }}>
            {hours.map((m) => (
              <span
                key={m}
                className={`absolute right-2 text-[11px] text-gray-400 tabular-nums ${
                  m === range.start ? 'translate-y-0.5' : '-translate-y-1/2'
                }`}
                style={{ top: (m - range.start) * PX_PER_MINUTE }}
              >
                {minutesToHhmm(m)}
              </span>
            ))}
          </div>
        </div>

        {columns.map((column) => (
          <GridColumnView
            key={column.key}
            column={column}
            range={range}
            bodyHeight={bodyHeight}
            halfLines={halfLines}
            nowMs={nowMs}
            selectedKey={selectedKey}
            onSelectReservation={onSelectReservation}
            onSelectBlock={onSelectBlock}
            onDragCreate={onDragCreate}
          />
        ))}
      </div>
    </div>
  )
}

function GridColumnView({
  column,
  range,
  bodyHeight,
  halfLines,
  nowMs,
  selectedKey,
  onSelectReservation,
  onSelectBlock,
  onDragCreate,
}: {
  column: GridColumn
  range: MinuteRange
  bodyHeight: number
  halfLines: number[]
  nowMs: number
  selectedKey: string | null
  onSelectReservation: (id: string) => void
  onSelectBlock: (id: string) => void
  onDragCreate?: (selection: DragSelection) => void
}) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<{ anchor: number; current: number } | null>(null)

  const closed = closedPlacements(column.day?.open_hours ?? [], column.dayStartMs, range)
  const wholeDayClosed = column.day?.closed ?? false

  const items: GridItem[] = [
    ...column.reservations.map(
      (reservation): GridItem => ({
        kind: 'reservation',
        id: reservation.id,
        span: spanOf(reservation.start_time, reservation.end_time),
        reservation,
      }),
    ),
    ...column.blocks.map(
      (block): GridItem => ({ kind: 'block', id: block.id, span: spanOf(block.start_time, block.end_time), block }),
    ),
  ]
  const laidOut = layoutOverlaps(items, (i) => i.span)

  const nowMinutes = (nowMs - column.dayStartMs) / 60_000
  const showNow = column.isToday && nowMinutes >= range.start && nowMinutes <= range.end

  /** Minutes from the day start under the pointer, snapped to the grid. */
  const minuteAt = (clientY: number, mode: 'floor' | 'ceil'): number => {
    const rect = bodyRef.current?.getBoundingClientRect()
    const y = rect ? clientY - rect.top : 0
    const raw = range.start + y / PX_PER_MINUTE
    return Math.min(range.end, Math.max(range.start, snapMinutes(raw, mode)))
  }

  const finishDrag = () => {
    if (!drag || !onDragCreate) return setDrag(null)
    const startMin = Math.min(drag.anchor, drag.current)
    const endMin = Math.max(Math.max(drag.anchor, drag.current), startMin + GRID_STEP_MINUTES)
    setDrag(null)
    onDragCreate({
      courtId: column.courtId,
      startMs: column.dayStartMs + startMin * 60_000,
      endMs: column.dayStartMs + endMin * 60_000,
    })
  }

  const selection = drag
    ? {
        top: (Math.min(drag.anchor, drag.current) - range.start) * PX_PER_MINUTE,
        height:
          Math.max(Math.abs(drag.current - drag.anchor), GRID_STEP_MINUTES) * PX_PER_MINUTE,
      }
    : null

  return (
    <div className="flex-1 min-w-[168px] border-r border-gray-100 last:border-r-0">
      <div
        className={`sticky top-0 z-10 border-b border-gray-200 px-2 flex flex-col justify-center text-center ${
          column.isToday ? 'bg-green-50' : 'bg-white'
        }`}
        style={{ height: HEADER_HEIGHT }}
      >
        <p className={`text-sm font-semibold truncate ${column.isToday ? 'text-green-700' : 'text-gray-900'}`}>
          {column.title}
        </p>
        {column.subtitle && <p className="text-xs text-gray-400 truncate">{column.subtitle}</p>}
        {column.inactive && <p className="text-[11px] text-red-500">Cancha inactiva</p>}
      </div>

      <div
        ref={bodyRef}
        data-testid="calendar-column"
        className={`relative select-none ${onDragCreate ? 'cursor-crosshair' : ''}`}
        style={{ height: bodyHeight }}
        onPointerDown={(e) => {
          if (!onDragCreate || e.button !== 0 || e.target !== e.currentTarget) return
          e.currentTarget.setPointerCapture(e.pointerId)
          const at = minuteAt(e.clientY, 'floor')
          setDrag({ anchor: at, current: at })
        }}
        onPointerMove={(e) => {
          if (!drag) return
          setDrag({ anchor: drag.anchor, current: minuteAt(e.clientY, 'ceil') })
        }}
        onPointerUp={finishDrag}
        onPointerCancel={() => setDrag(null)}
      >
        {halfLines.map((m) => (
          <div
            key={m}
            className={`absolute inset-x-0 border-t pointer-events-none ${
              m % 60 === 0 ? 'border-gray-200' : 'border-dashed border-gray-100'
            }`}
            style={{ top: (m - range.start) * PX_PER_MINUTE }}
          />
        ))}

        {wholeDayClosed ? (
          <div
            className="absolute inset-0 bg-gray-100/90 pointer-events-none flex items-start justify-center p-2"
            title={column.day?.closed_reason ?? 'Cerrado'}
          >
            <span className="text-xs text-gray-500 bg-white/80 rounded px-2 py-0.5">
              Cerrado{column.day?.closed_reason ? `: ${column.day.closed_reason}` : ''}
            </span>
          </div>
        ) : (
          closed.map((c, i) => (
            <div
              key={i}
              className="absolute inset-x-0 bg-gray-100/90 pointer-events-none"
              style={{ top: c.top * PX_PER_MINUTE, height: c.height * PX_PER_MINUTE }}
              aria-hidden="true"
            />
          ))
        )}

        {laidOut.map(({ item, column: col, columns }) => {
          const placement = placeSpan(item.span, column.dayStartMs, range)
          if (!placement) return null
          const height = Math.max(placement.height * PX_PER_MINUTE, MIN_ITEM_PX)
          const style: React.CSSProperties = {
            top: placement.top * PX_PER_MINUTE,
            height,
            left: `calc(${(col / columns) * 100}% + 2px)`,
            width: `calc(${100 / columns}% - 4px)`,
          }
          return item.kind === 'reservation' ? (
            <ReservationBlock
              key={`r-${item.id}`}
              reservation={item.reservation}
              style={style}
              compact={height < 56}
              selected={selectedKey === `reservation:${item.id}`}
              onClick={() => onSelectReservation(item.id)}
            />
          ) : (
            <BlockItem
              key={`b-${item.id}`}
              block={item.block}
              style={style}
              compact={height < 40}
              selected={selectedKey === `block:${item.id}`}
              onClick={() => onSelectBlock(item.id)}
            />
          )
        })}

        {selection && (
          <div
            className="absolute inset-x-1 rounded bg-green-500/20 border border-green-500 pointer-events-none"
            style={selection}
          />
        )}

        {showNow && (
          <div
            className="absolute inset-x-0 z-[5] pointer-events-none flex items-center"
            style={{ top: (nowMinutes - range.start) * PX_PER_MINUTE }}
            aria-label="Hora actual"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
            <span className="flex-1 border-t-2 border-red-500" />
          </div>
        )}
      </div>
    </div>
  )
}

function ReservationBlock({
  reservation,
  style,
  compact,
  selected,
  onClick,
}: {
  reservation: CalendarReservation
  style: React.CSSProperties
  compact: boolean
  selected: boolean
  onClick: () => void
}) {
  const name = personName(reservation.user)
  const time = `${formatClubTime(reservation.start_time)} - ${formatClubTime(reservation.end_time)}`
  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute z-[2] text-left rounded-md border-l-4 border px-1.5 py-1 overflow-hidden text-xs leading-tight hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-green-600 ${
        RESERVATION_BLOCK_CLASSES[reservation.status]
      } ${selected ? 'ring-2 ring-green-600 shadow-md' : ''}`}
      style={style}
      title={`${name} · ${time}`}
    >
      {compact ? (
        <p className="truncate">
          <span className="font-semibold">{name}</span> · {time}
        </p>
      ) : (
        <>
          <p className="font-semibold truncate">{name}</p>
          <p className="truncate opacity-80">{time}</p>
          <p className="truncate">
            {formatMoney(reservation.total_price)} · {PAYMENT_LABELS[reservation.payment.status]}
          </p>
          {reservation.match && (
            <p className="truncate">
              {matchLabel(reservation.match)}
              {reservation.players_count !== null ? ` · ${reservation.players_count}/4 jugadores` : ''}
            </p>
          )}
        </>
      )}
    </button>
  )
}

function BlockItem({
  block,
  style,
  compact,
  selected,
  onClick,
}: {
  block: CourtBlock
  style: React.CSSProperties
  compact: boolean
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute z-[2] text-left rounded-md border border-gray-400 px-1.5 py-1 overflow-hidden text-xs leading-tight text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600 ${
        selected ? 'ring-2 ring-green-600 shadow-md' : ''
      }`}
      style={{
        ...style,
        backgroundImage:
          'repeating-linear-gradient(45deg, rgba(107,114,128,0.25) 0, rgba(107,114,128,0.25) 6px, rgba(255,255,255,0.7) 6px, rgba(255,255,255,0.7) 12px)',
      }}
      title={block.reason ?? 'Bloqueo'}
    >
      <p className="font-semibold truncate bg-white/70 rounded px-0.5 inline-block max-w-full">
        Bloqueo{compact ? '' : ` · ${formatClubTime(block.start_time)} - ${formatClubTime(block.end_time)}`}
      </p>
      {!compact && block.reason && (
        <p className="truncate mt-0.5 bg-white/70 rounded px-0.5 inline-block max-w-full">{block.reason}</p>
      )}
    </button>
  )
}
