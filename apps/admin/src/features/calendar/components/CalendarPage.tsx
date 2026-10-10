import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Notice, PageHeader } from '@match-padel/ui'
import {
  addDays,
  clubInstant,
  clubToday,
  formatDayLong,
  formatDayShort,
  isIsoDate,
  mondayOf,
} from '@/lib/club-time'
import { getErrorMessage } from '@/lib/errors'
import { useCurrentClub } from '@/shared/club-context'
import { canManageClub } from '@/shared/permissions'
import { useClubCalendar } from '../hooks/useCalendar'
import { visibleRange, type Span } from '../lib/layout'
import { SURFACE_LABELS } from '../lib/surfaces'
import { BlockDetailDialog } from './BlockDetailDialog'
import { BlockDialog, draftFrom, type BlockDraft } from './BlockDialog'
import { CalendarGrid, type DragSelection, type GridColumn } from './CalendarGrid'
import { CancelDialog } from './CancelDialog'
import { ReservationDrawer } from './ReservationDrawer'
import type { CalendarReservation } from '@match-padel/types'

type View = 'day' | 'week'
type Selected = { kind: 'reservation' | 'block'; id: string } | null

const selectClass =
  'px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500'

function overlapsDay(startIso: string, endIso: string, dayStartMs: number, dayEndMs: number): boolean {
  return new Date(startIso).getTime() < dayEndMs && new Date(endIso).getTime() > dayStartMs
}

export function CalendarPage() {
  const club = useCurrentClub()
  const manager = canManageClub(club.role)
  const [params, setParams] = useSearchParams()

  const [date, setDate] = useState(() => {
    const fromUrl = params.get('date')
    return isIsoDate(fromUrl) ? fromUrl : clubToday()
  })
  const [view, setView] = useState<View>(params.get('view') === 'week' ? 'week' : 'day')
  const [courtFilter, setCourtFilter] = useState<string | null>(params.get('court'))
  const [selected, setSelected] = useState<Selected>(() => {
    const id = params.get('reservation')
    return id ? { kind: 'reservation', id } : null
  })
  const [blockDraft, setBlockDraft] = useState<BlockDraft | null>(null)
  const [cancelTarget, setCancelTarget] = useState<{ reservation: CalendarReservation; courtName: string } | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  // Keep the position in the URL so a reload or a shared link opens the same view.
  useEffect(() => {
    const next = new URLSearchParams({ date, view })
    if (courtFilter) next.set('court', courtFilter)
    setParams(next, { replace: true })
  }, [date, view, courtFilter, setParams])

  const dates = useMemo(() => {
    if (view === 'day') return [date]
    const monday = mondayOf(date)
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
  }, [date, view])

  const from = clubInstant(dates[0], 0).toISOString()
  const to = clubInstant(addDays(dates[dates.length - 1], 1), 0).toISOString()
  // Every court is always fetched (one request, at most 7 days) so the court selector, the move form
  // and the block dialog always know the whole club; the court filter only narrows what is drawn.
  const { data, isLoading, isFetching, error } = useClubCalendar(club.clubId, { from, to })

  const courts = data?.courts ?? []
  const today = clubToday(nowMs)
  const weekCourt = view === 'week' ? (courts.find((c) => c.court.id === courtFilter) ?? courts[0]) : undefined

  const { columns, range } = useMemo(() => {
    const cols: GridColumn[] = []
    if (view === 'day') {
      const dayStartMs = clubInstant(date, 0).getTime()
      for (const c of courts.filter((x) => !courtFilter || x.court.id === courtFilter)) {
        cols.push({
          key: c.court.id,
          title: c.court.name,
          subtitle: SURFACE_LABELS[c.court.surface],
          courtId: c.court.id,
          dayStartMs,
          day: c.days.find((d) => d.date === date) ?? null,
          reservations: c.reservations,
          blocks: c.blocks,
          isToday: date === today,
          inactive: !c.court.is_active,
        })
      }
    } else if (weekCourt) {
      for (const d of dates) {
        const dayStartMs = clubInstant(d, 0).getTime()
        const dayEndMs = clubInstant(addDays(d, 1), 0).getTime()
        cols.push({
          key: d,
          title: formatDayShort(d),
          subtitle: weekCourt.court.name,
          courtId: weekCourt.court.id,
          dayStartMs,
          day: weekCourt.days.find((x) => x.date === d) ?? null,
          reservations: weekCourt.reservations.filter((r) => overlapsDay(r.start_time, r.end_time, dayStartMs, dayEndMs)),
          blocks: weekCourt.blocks.filter((b) => overlapsDay(b.start_time, b.end_time, dayStartMs, dayEndMs)),
          isToday: d === today,
          inactive: !weekCourt.court.is_active,
        })
      }
    }
    const items: Array<{ dayStartMs: number; span: Span }> = []
    for (const col of cols) {
      for (const r of col.reservations) {
        items.push({ dayStartMs: col.dayStartMs, span: { startMs: Date.parse(r.start_time), endMs: Date.parse(r.end_time) } })
      }
      for (const b of col.blocks) {
        items.push({ dayStartMs: col.dayStartMs, span: { startMs: Date.parse(b.start_time), endMs: Date.parse(b.end_time) } })
      }
    }
    const days = cols.map((c) => ({ dayStartMs: c.dayStartMs, windows: c.day?.open_hours ?? [] }))
    return { columns: cols, range: visibleRange(days, items) }
  }, [view, date, dates, courts, courtFilter, weekCourt, today])

  const found = useMemo(() => {
    if (!selected) return null
    for (const c of courts) {
      if (selected.kind === 'reservation') {
        const reservation = c.reservations.find((r) => r.id === selected.id)
        if (reservation) return { kind: 'reservation' as const, reservation, court: c.court }
      } else {
        const block = c.blocks.find((b) => b.id === selected.id)
        if (block) return { kind: 'block' as const, block, court: c.court }
      }
    }
    return null
  }, [selected, courts])

  const step = view === 'week' ? 7 : 1
  const title =
    view === 'day' ? formatDayLong(date) : `${formatDayShort(dates[0])} al ${formatDayShort(dates[dates.length - 1])}`

  const openBlockDialog = (courtIds: string[], startMs?: number) => {
    const start = startMs ?? clubInstant(date, range.start).getTime()
    setBlockDraft(draftFrom(courtIds, start, start + 60 * 60_000))
  }

  const onDragCreate = (s: DragSelection) => setBlockDraft(draftFrom([s.courtId], s.startMs, s.endMs))

  const courtSelectValue = view === 'week' ? (weekCourt?.court.id ?? '') : (courtFilter ?? 'all')

  return (
    <div className="space-y-4">
      <PageHeader
        title="Calendario"
        subtitle="Reservas, partidos y bloqueos por cancha"
        actions={
          manager ? (
            <button
              type="button"
              disabled={courts.length === 0}
              onClick={() => openBlockDialog(courtFilter ? [courtFilter] : [])}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Nuevo bloqueo
            </button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden bg-white">
          <button
            type="button"
            aria-label={view === 'week' ? 'Semana anterior' : 'Día anterior'}
            onClick={() => setDate(addDays(date, -step))}
            className="px-2 py-2 hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDate(clubToday())}
            className="px-3 py-2 text-sm font-medium border-x border-gray-300 hover:bg-gray-50"
          >
            Hoy
          </button>
          <button
            type="button"
            aria-label={view === 'week' ? 'Semana siguiente' : 'Día siguiente'}
            onClick={() => setDate(addDays(date, step))}
            className="px-2 py-2 hover:bg-gray-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <input
          type="date"
          aria-label="Ir a la fecha"
          value={date}
          onChange={(e) => isIsoDate(e.target.value) && setDate(e.target.value)}
          className={selectClass}
        />

        <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden bg-white text-sm">
          {(['day', 'week'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={`px-3 py-2 font-medium ${view === v ? 'bg-green-600 text-white' : 'hover:bg-gray-50 text-gray-600'}`}
            >
              {v === 'day' ? 'Día' : 'Semana'}
            </button>
          ))}
        </div>

        <select
          aria-label="Cancha"
          value={courtSelectValue}
          onChange={(e) => setCourtFilter(e.target.value === 'all' ? null : e.target.value)}
          className={selectClass}
        >
          {view === 'day' && <option value="all">Todas las canchas</option>}
          {courts.map((c) => (
            <option key={c.court.id} value={c.court.id}>
              {c.court.name}
            </option>
          ))}
        </select>

        <p className="text-sm font-medium text-gray-700 capitalize ml-1">{title}</p>
        {isFetching && !isLoading && <span className="text-xs text-gray-400">Actualizando...</span>}
      </div>

      <Legend />

      {flash && (
        <Notice tone="success">
          <div className="flex justify-between gap-4">
            <span>{flash}</span>
            <button type="button" onClick={() => setFlash(null)} className="underline text-xs">
              Cerrar
            </button>
          </div>
        </Notice>
      )}
      {error && <Notice>{getErrorMessage(error)}</Notice>}

      {isLoading ? (
        <div className="p-12 text-center text-gray-400 bg-white rounded-xl border border-gray-200">Cargando...</div>
      ) : columns.length === 0 ? (
        <div className="p-12 text-center text-gray-400 bg-white rounded-xl border border-gray-200">
          El club todavía no tiene canchas.
        </div>
      ) : (
        <CalendarGrid
          columns={columns}
          range={range}
          nowMs={nowMs}
          selectedKey={selected ? `${selected.kind}:${selected.id}` : null}
          onSelectReservation={(id) => setSelected({ kind: 'reservation', id })}
          onSelectBlock={(id) => setSelected({ kind: 'block', id })}
          onDragCreate={manager ? onDragCreate : undefined}
        />
      )}

      {found?.kind === 'reservation' && (
        <ReservationDrawer
          clubId={club.clubId}
          reservation={found.reservation}
          court={found.court}
          courts={courts.map((c) => c.court)}
          canChangeStatus={manager}
          onClose={() => setSelected(null)}
          onCancel={() => {
            setCancelTarget({ reservation: found.reservation, courtName: found.court.name })
            setSelected(null)
          }}
          onMoved={(newDate) => {
            setSelected(null)
            setDate(newDate)
            setFlash(`Reserva movida al ${formatDayLong(newDate)}.`)
          }}
        />
      )}

      {found?.kind === 'block' && (
        <BlockDetailDialog
          clubId={club.clubId}
          block={found.block}
          court={found.court}
          canDelete={manager}
          onClose={() => setSelected(null)}
          onDeleted={() => {
            setSelected(null)
            setFlash('Bloqueo eliminado.')
          }}
        />
      )}

      {cancelTarget && (
        <CancelDialog
          clubId={club.clubId}
          reservation={cancelTarget.reservation}
          courtName={cancelTarget.courtName}
          onClose={() => setCancelTarget(null)}
        />
      )}

      {blockDraft && manager && (
        <BlockDialog
          clubId={club.clubId}
          courts={courts.map((c) => c.court)}
          initial={blockDraft}
          onClose={() => setBlockDraft(null)}
          onCreated={(count) => {
            setBlockDraft(null)
            setFlash(count === 1 ? 'Bloqueo creado.' : `${count} bloqueos creados.`)
          }}
        />
      )}
    </div>
  )
}

function Legend() {
  const chip = 'inline-flex items-center gap-1.5 text-xs text-gray-600'
  return (
    <div className="flex flex-wrap gap-4" aria-label="Referencias">
      <span className={chip}>
        <span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-400" /> Pendiente
      </span>
      <span className={chip}>
        <span className="w-3 h-3 rounded bg-green-100 border border-green-500" /> Confirmada
      </span>
      <span className={chip}>
        <span className="w-3 h-3 rounded bg-slate-200 border border-slate-400" /> Completada
      </span>
      <span className={chip}>
        <span
          className="w-3 h-3 rounded border border-gray-400"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, rgba(107,114,128,0.4) 0, rgba(107,114,128,0.4) 3px, #fff 3px, #fff 6px)',
          }}
        />{' '}
        Bloqueo
      </span>
      <span className={chip}>
        <span className="w-3 h-3 rounded bg-gray-100 border border-gray-200" /> Cerrado
      </span>
    </div>
  )
}
