import { useMemo, useState } from 'react'
import type { BlockConflict, CalendarCourt } from '@match-padel/types'
import { Notice, personName } from '@match-padel/ui'
import { clubInstant, clubParts, formatClubDateTime, hhmmToMinutes, minutesToHhmm } from '@/lib/club-time'
import { blockConflictsOf, calendarErrorMessage } from '../lib/errors'
import { RESERVATION_STATUS_LABELS } from '@/shared/permissions'
import { useCreateBlocks } from '../hooks/useCalendar'
import { Dialog } from '@/shared/components/Dialog'

const REASON_MAX = 200
const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500'

export interface BlockDraft {
  courtIds: string[]
  /** Club-local `YYYY-MM-DD` and `HH:MM`. */
  startDate: string
  startTime: string
  endDate: string
  endTime: string
}

/** A draft from two instants (a click-drag on the grid) or from a day (the toolbar button). */
export function draftFrom(courtIds: string[], startMs: number, endMs: number): BlockDraft {
  const s = clubParts(startMs)
  const e = clubParts(endMs)
  // The inputs take a real date and time, so a block ending at midnight reads as the next day at 00:00.
  return {
    courtIds,
    startDate: s.date,
    startTime: minutesToHhmm(s.minutes),
    endDate: e.date,
    endTime: minutesToHhmm(e.minutes),
  }
}

export function BlockDialog({
  clubId,
  courts,
  initial,
  onClose,
  onCreated,
}: {
  clubId: string
  courts: CalendarCourt['court'][]
  initial: BlockDraft
  onClose: () => void
  onCreated: (count: number) => void
}) {
  const create = useCreateBlocks(clubId)
  const [draft, setDraft] = useState(initial)
  const [reason, setReason] = useState('')
  const courtNames = useMemo(() => new Map(courts.map((c) => [c.id, c.name])), [courts])

  const start = /^\d{2}:\d{2}$/.test(draft.startTime) && draft.startDate
    ? clubInstant(draft.startDate, hhmmToMinutes(draft.startTime))
    : null
  const end = /^\d{2}:\d{2}$/.test(draft.endTime) && draft.endDate
    ? clubInstant(draft.endDate, hhmmToMinutes(draft.endTime))
    : null
  const rangeError =
    !start || !end
      ? 'Completá fecha y hora de inicio y de fin.'
      : end <= start
        ? 'El fin tiene que ser posterior al inicio.'
        : end.getTime() <= Date.now()
          ? 'El bloqueo tiene que terminar a futuro.'
          : null
  const canSubmit = draft.courtIds.length > 0 && !rangeError && !create.isPending

  const conflicts = blockConflictsOf(create.error)

  const toggleCourt = (id: string) =>
    setDraft((d) => ({
      ...d,
      courtIds: d.courtIds.includes(id) ? d.courtIds.filter((c) => c !== id) : [...d.courtIds, id],
    }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !start || !end) return
    create.mutate(
      {
        court_ids: draft.courtIds,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        reason: reason.trim() || null,
      },
      { onSuccess: (blocks) => onCreated(blocks.length) },
    )
  }

  return (
    <Dialog title="Nuevo bloqueo" onClose={onClose} busy={create.isPending} wide>
      <form onSubmit={submit} className="space-y-4">
        <fieldset>
          <legend className="text-sm font-medium text-gray-700 mb-2">Canchas</legend>
          <div className="grid grid-cols-2 gap-2">
            {courts.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-2 text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={draft.courtIds.includes(c.id)}
                  onChange={() => toggleCourt(c.id)}
                  className="rounded text-green-600"
                />
                <span className="truncate">{c.name}</span>
              </label>
            ))}
          </div>
          {draft.courtIds.length === 0 && <p className="text-xs text-red-600 mt-1">Elegí al menos una cancha.</p>}
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="block-start-date" className="block text-sm font-medium text-gray-700 mb-1">
              Desde (fecha)
            </label>
            <input
              id="block-start-date"
              type="date"
              value={draft.startDate}
              onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="block-start-time" className="block text-sm font-medium text-gray-700 mb-1">
              Desde (hora)
            </label>
            <input
              id="block-start-time"
              type="time"
              step={900}
              value={draft.startTime}
              onChange={(e) => setDraft({ ...draft, startTime: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="block-end-date" className="block text-sm font-medium text-gray-700 mb-1">
              Hasta (fecha)
            </label>
            <input
              id="block-end-date"
              type="date"
              value={draft.endDate}
              onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="block-end-time" className="block text-sm font-medium text-gray-700 mb-1">
              Hasta (hora)
            </label>
            <input
              id="block-end-time"
              type="time"
              step={900}
              value={draft.endTime}
              onChange={(e) => setDraft({ ...draft, endTime: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
        {rangeError && <p className="text-xs text-red-600">{rangeError}</p>}

        <div>
          <label htmlFor="block-reason" className="block text-sm font-medium text-gray-700 mb-1">
            Motivo (opcional)
          </label>
          <input
            id="block-reason"
            type="text"
            value={reason}
            maxLength={REASON_MAX}
            placeholder="Mantenimiento, clases, evento privado..."
            onChange={(e) => setReason(e.target.value)}
            className={inputClass}
          />
          <p className="text-xs text-gray-400 mt-1">
            Los jugadores no ven el motivo: solo ven que el horario no está disponible.
          </p>
        </div>

        {create.error && conflicts === null && <Notice>{calendarErrorMessage(create.error)}</Notice>}
        {conflicts !== null && <ConflictList conflicts={conflicts} courtNames={courtNames} />}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={create.isPending}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {create.isPending ? 'Creando...' : 'Crear bloqueo'}
          </button>
        </div>
      </form>
    </Dialog>
  )
}

function ConflictList({
  conflicts,
  courtNames,
}: {
  conflicts: BlockConflict[]
  courtNames: Map<string, string>
}) {
  return (
    <Notice tone="error">
      <p className="font-medium">No se creó ningún bloqueo: se superpone con lo siguiente.</p>
      <p className="mt-1">Mové o cancelá esas reservas desde el calendario y volvé a intentar.</p>
      {conflicts.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm">
          {conflicts.map((c) => (
            <li key={`${c.type}-${c.id}`} className="bg-white/60 rounded px-2 py-1">
              <span className="font-medium">
                {c.type === 'reservation' ? `Reserva de ${personName(c.user)}` : 'Bloqueo existente'}
              </span>{' '}
              · {courtNames.get(c.court_id) ?? 'Cancha'} · {formatClubDateTime(c.start_time)} a{' '}
              {formatClubDateTime(c.end_time)}
              {c.type === 'reservation' && <> · {RESERVATION_STATUS_LABELS[c.status]}</>}
              {c.type === 'block' && c.reason && <> · {c.reason}</>}
            </li>
          ))}
        </ul>
      )}
    </Notice>
  )
}
