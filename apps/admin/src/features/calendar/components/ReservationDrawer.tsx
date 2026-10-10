import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import type { CalendarCourt, CalendarReservation } from '@match-padel/types'
import { Notice, StatusBadge, formatMoney, personName } from '@match-padel/ui'
import {
  clubInstant,
  clubParts,
  clubToday,
  formatClubTime,
  formatDayLong,
  hhmmToMinutes,
  minutesToHhmm,
} from '@/lib/club-time'
import { RESERVATION_STATUS_LABELS, RESERVATION_STATUS_TONES } from '@/shared/permissions'
import { calendarErrorMessage } from '../lib/errors'
import { PAYMENT_LABELS, PAYMENT_TONES, durationLabel, matchLabel } from '../lib/labels'
import { useMoveReservation, useReservationStatus } from '../hooks/useCalendar'

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500'

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-gray-100 text-sm">
      <dt className="text-gray-500 shrink-0">{label}</dt>
      <dd className="text-gray-900 text-right">{children}</dd>
    </div>
  )
}

export function ReservationDrawer({
  clubId,
  reservation,
  court,
  courts,
  canChangeStatus,
  onClose,
  onCancel,
  onMoved,
}: {
  clubId: string
  reservation: CalendarReservation
  court: CalendarCourt['court']
  courts: CalendarCourt['court'][]
  /** Confirm / complete are owner, admin and superadmin only (reception only moves and cancels). */
  canChangeStatus: boolean
  onClose: () => void
  /** Opens the cancel confirmation (owned by the page, so its refund summary outlives the reservation). */
  onCancel: () => void
  /** Called after a successful move with the new club-local date, so the calendar can follow it. */
  onMoved: (date: string) => void
}) {
  const [moving, setMoving] = useState(false)
  const status = useReservationStatus(clubId)

  const startMs = new Date(reservation.start_time).getTime()
  const endMs = new Date(reservation.end_time).getTime()
  const durationMinutes = Math.round((endMs - startMs) / 60_000)
  const { date } = clubParts(startMs)
  const ended = endMs <= Date.now()
  const open = reservation.status === 'pending' || reservation.status === 'confirmed'
  const canMove = open && !ended
  const canCancel = open
  const { payment } = reservation

  return (
    <>
      <aside
        className="fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-white border-l border-gray-200 shadow-xl flex flex-col"
        aria-label="Detalle de la reserva"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Reserva</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="flex gap-2 flex-wrap">
            <StatusBadge
              label={RESERVATION_STATUS_LABELS[reservation.status]}
              tone={RESERVATION_STATUS_TONES[reservation.status]}
            />
            <StatusBadge label={PAYMENT_LABELS[payment.status]} tone={PAYMENT_TONES[payment.status]} />
            {reservation.match && (
              <StatusBadge label={matchLabel(reservation.match)} tone={reservation.match.is_ranked ? 'purple' : 'blue'} />
            )}
          </div>

          <dl>
            <Row label="Jugador">
              <span className="font-medium">{personName(reservation.user)}</span>
              {reservation.user?.username && <span className="block text-xs text-gray-400">@{reservation.user.username}</span>}
            </Row>
            <Row label="Cancha">{court.name}</Row>
            <Row label="Día">{formatDayLong(date)}</Row>
            <Row label="Horario">
              {formatClubTime(startMs)} - {formatClubTime(endMs)} ({durationLabel(durationMinutes)})
            </Row>
            <Row label="Precio">{formatMoney(reservation.total_price)}</Row>
            <Row label="Pagado">
              {formatMoney(payment.paid_amount)}
              {payment.status === 'partial' && (
                <span className="block text-xs text-gray-400">
                  faltan {formatMoney(Math.max(0, reservation.total_price - payment.paid_amount))}
                </span>
              )}
            </Row>
            {reservation.match && (
              <>
                <Row label="Partido">
                  {matchLabel(reservation.match)} ·{' '}
                  {reservation.match.status === 'waiting'
                    ? 'esperando jugadores'
                    : reservation.match.status === 'in_progress'
                      ? 'en juego'
                      : reservation.match.status === 'completed'
                        ? 'finalizado'
                        : 'cancelado'}
                </Row>
                <Row label="Jugadores">{reservation.players_count ?? 0} de 4</Row>
              </>
            )}
            <Row label="ID de reserva">
              <span className="font-mono text-xs break-all">{reservation.id}</span>
            </Row>
          </dl>

          {status.error && <Notice>{calendarErrorMessage(status.error)}</Notice>}

          {moving && canMove && (
            <MoveForm
              clubId={clubId}
              reservation={reservation}
              court={court}
              courts={courts}
              durationMinutes={durationMinutes}
              onCancel={() => setMoving(false)}
              onMoved={(newDate) => {
                setMoving(false)
                onMoved(newDate)
              }}
            />
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-100 space-y-2">
          {!open && <p className="text-xs text-gray-500">Esta reserva ya no admite cambios.</p>}
          {open && !canMove && (
            <p className="text-xs text-gray-500">La reserva ya terminó: solo se puede cancelar o completar.</p>
          )}
          <div className="flex flex-wrap gap-2">
            {canChangeStatus && reservation.status === 'pending' && (
              <button
                type="button"
                disabled={status.isPending}
                onClick={() => status.mutate({ id: reservation.id, status: 'confirmed' })}
                className="px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Confirmar
              </button>
            )}
            {canChangeStatus && reservation.status === 'confirmed' && (
              <button
                type="button"
                disabled={status.isPending}
                onClick={() => status.mutate({ id: reservation.id, status: 'completed' })}
                className="px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Completar
              </button>
            )}
            {canMove && !moving && (
              <button
                type="button"
                onClick={() => setMoving(true)}
                className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mover
              </button>
            )}
            {canCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </aside>

    </>
  )
}

function MoveForm({
  clubId,
  reservation,
  court,
  courts,
  durationMinutes,
  onCancel,
  onMoved,
}: {
  clubId: string
  reservation: CalendarReservation
  court: CalendarCourt['court']
  courts: CalendarCourt['court'][]
  durationMinutes: number
  onCancel: () => void
  onMoved: (date: string) => void
}) {
  const move = useMoveReservation(clubId)
  const original = useMemo(() => clubParts(reservation.start_time), [reservation.start_time])
  const [courtId, setCourtId] = useState(court.id)
  const [date, setDate] = useState(original.date)
  const [time, setTime] = useState(minutesToHhmm(original.minutes))

  const startMinutes = /^\d{2}:\d{2}$/.test(time) ? hhmmToMinutes(time) : null
  const start = startMinutes === null || !date ? null : clubInstant(date, startMinutes)
  // The duration is fixed by the API: the end is always the original length after the new start.
  const end = start ? new Date(start.getTime() + durationMinutes * 60_000) : null
  const unchanged = courtId === court.id && date === original.date && startMinutes === original.minutes
  const inPast = start !== null && start.getTime() <= Date.now()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!start || !end || unchanged) return
    move.mutate(
      {
        id: reservation.id,
        body: {
          ...(courtId !== court.id ? { court_id: courtId } : {}),
          start_time: start.toISOString(),
          end_time: end.toISOString(),
        },
      },
      { onSuccess: () => onMoved(date) },
    )
  }

  return (
    <form onSubmit={submit} className="border border-gray-200 rounded-lg p-3 space-y-3 bg-gray-50">
      <p className="text-sm font-semibold text-gray-900">Mover reserva</p>
      <div>
        <label htmlFor="move-court" className="block text-xs font-medium text-gray-600 mb-1">
          Cancha
        </label>
        <select id="move-court" value={courtId} onChange={(e) => setCourtId(e.target.value)} className={inputClass}>
          {courts.map((c) => (
            <option key={c.id} value={c.id} disabled={!c.is_active && c.id !== court.id}>
              {c.name}
              {c.is_active ? '' : ' (inactiva)'}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="move-date" className="block text-xs font-medium text-gray-600 mb-1">
            Fecha
          </label>
          <input
            id="move-date"
            type="date"
            value={date}
            min={clubToday()}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="move-time" className="block text-xs font-medium text-gray-600 mb-1">
            Inicio
          </label>
          <input
            id="move-time"
            type="time"
            step={900}
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      <p className="text-xs text-gray-600">
        Duración fija: {durationLabel(durationMinutes)}
        {end && <> · termina a las {formatClubTime(end)}</>}. El precio y el estado no cambian.
      </p>
      {inPast && <Notice tone="warning">El nuevo inicio tiene que ser a futuro.</Notice>}
      {move.error && <Notice>{calendarErrorMessage(move.error)}</Notice>}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={move.isPending}
          className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50"
        >
          Descartar
        </button>
        <button
          type="submit"
          disabled={move.isPending || unchanged || !start || inPast}
          className="px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {move.isPending ? 'Moviendo...' : 'Mover'}
        </button>
      </div>
    </form>
  )
}
