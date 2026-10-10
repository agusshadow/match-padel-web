import { useState } from 'react'
import {
  SLOT_MINUTES_OPTIONS,
  type ClubAdminCourt,
  type ScheduleException,
  type ScheduleExceptionCreate,
  type ScheduleExceptionWarning,
  type SlotMinutes,
} from '@match-padel/types'
import { Notice, StatusBadge } from '@match-padel/ui'
import { CLOSE_TIMES, OPEN_TIMES, clubToday, formatIsoDate, toMinutes } from '../lib/time'
import { inputClass } from '../lib/styles'
import { useCreateException, useDeleteException, useExceptions } from '../hooks/useCourts'
import { ErrorNotice, ProblemNotice } from './ProblemList'
import { PrimaryButton, TimeSelect } from './ui'

const MAX_RANGE_DAYS = 92
const CLUB_SCOPE = ''

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000) + 1
}

function ExceptionForm({
  clubId,
  courts,
  fixedCourtId,
}: {
  clubId: string
  courts: ClubAdminCourt[]
  /** Set in a court's tab: the scope is that court. Undefined in the club page, where it can be chosen. */
  fixedCourtId?: string
}) {
  const create = useCreateException(clubId)
  const [scope, setScope] = useState<string>(fixedCourtId ?? CLUB_SCOPE)
  const [date, setDate] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [closed, setClosed] = useState(true)
  const [open, setOpen] = useState('10:00')
  const [close, setClose] = useState('18:00')
  const [slot, setSlot] = useState<SlotMinutes | ''>('')
  const [reason, setReason] = useState('')
  const [problems, setProblems] = useState<string[]>([])
  const [warning, setWarning] = useState<ScheduleExceptionWarning | null>(null)
  const [done, setDone] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const invalid: string[] = []
    if (date === '') invalid.push('Elegí la fecha.')
    else if (date < clubToday()) invalid.push('No se pueden cargar excepciones en fechas pasadas.')
    if (dateTo !== '' && date !== '') {
      if (dateTo < date) invalid.push('La fecha final no puede ser anterior a la inicial.')
      else if (daysBetween(date, dateTo) > MAX_RANGE_DAYS) invalid.push(`Un rango admite hasta ${MAX_RANGE_DAYS} días.`)
    }
    if (!closed && toMinutes(open) >= toMinutes(close)) invalid.push('La apertura tiene que ser anterior al cierre.')
    setProblems(invalid)
    setWarning(null)
    setDone(false)
    if (invalid.length > 0) return

    const body: ScheduleExceptionCreate = {
      date,
      ...(dateTo !== '' ? { date_to: dateTo } : {}),
      court_id: scope === CLUB_SCOPE ? null : scope,
      closed,
      ...(closed
        ? {}
        : { open_time: open, close_time: close, ...(slot !== '' ? { slot_minutes: slot } : {}) }),
      reason: reason.trim() === '' ? null : reason.trim(),
    }
    create.mutate(body, {
      onSuccess: (result) => {
        setWarning(result.warning)
        setDone(true)
        setDate('')
        setDateTo('')
        setReason('')
      },
    })
  }

  return (
    <form onSubmit={submit} className="border border-gray-200 rounded-lg bg-gray-50 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">Nueva excepción</h3>
      {create.isError && <ErrorNotice error={create.error} />}
      <ProblemNotice problems={problems} />
      {warning && (
        <Notice tone="warning">
          Hay {warning.affected_reservations}{' '}
          {warning.affected_reservations === 1 ? 'reserva' : 'reservas'} pendientes o confirmadas en esas fechas. No se
          cancelaron: contactá a los jugadores o cancelalas desde Reservas.
        </Notice>
      )}
      {done && !warning && !create.isPending && <Notice tone="success">Excepción guardada.</Notice>}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {fixedCourtId === undefined && (
          <div className="sm:col-span-2">
            <label htmlFor="exc-scope" className="block text-xs font-medium text-gray-600 mb-1">
              Aplica a
            </label>
            <select id="exc-scope" value={scope} onChange={(e) => setScope(e.target.value)} className={inputClass}>
              <option value={CLUB_SCOPE}>Todo el club</option>
              {courts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="exc-date" className="block text-xs font-medium text-gray-600 mb-1">
            Fecha
          </label>
          <input
            id="exc-date"
            type="date"
            min={clubToday()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="exc-date-to" className="block text-xs font-medium text-gray-600 mb-1">
            Hasta (opcional)
          </label>
          <input
            id="exc-date-to"
            type="date"
            min={date || clubToday()}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-700">
        <label className="flex items-center gap-2">
          <input type="radio" name="exc-kind" checked={closed} onChange={() => setClosed(true)} /> Cerrado todo el día
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="exc-kind" checked={!closed} onChange={() => setClosed(false)} /> Horario especial
        </label>
      </div>
      {!closed && (
        <div className="flex flex-wrap items-center gap-2">
          <TimeSelect label="Apertura" value={open} options={OPEN_TIMES} onChange={setOpen} />
          <span className="text-gray-400 text-sm">a</span>
          <TimeSelect label="Cierre" value={close} options={CLOSE_TIMES} onChange={setClose} />
          <select
            aria-label="Duración del turno"
            value={slot}
            onChange={(e) => setSlot(e.target.value === '' ? '' : (Number(e.target.value) as SlotMinutes))}
            className={`${inputClass} w-48`}
          >
            <option value="">Duración habitual del turno</option>
            {SLOT_MINUTES_OPTIONS.map((m) => (
              <option key={m} value={m}>
                Turnos de {m} min
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="exc-reason" className="block text-xs font-medium text-gray-600 mb-1">
          Motivo (opcional)
        </label>
        <input
          id="exc-reason"
          value={reason}
          maxLength={200}
          placeholder="Feriado, torneo interno, mantenimiento..."
          onChange={(e) => setReason(e.target.value)}
          className={inputClass}
        />
      </div>
      <p className="text-xs text-gray-500">
        Reemplaza cualquier excepción ya cargada para el mismo alcance y fechas. Cerrar un día nunca cancela reservas.
      </p>
      <PrimaryButton type="submit" disabled={create.isPending}>
        {create.isPending ? 'Guardando...' : 'Guardar excepción'}
      </PrimaryButton>
    </form>
  )
}

function describe(e: ScheduleException): string {
  if (e.closed) return 'Cerrado todo el día'
  const slot = e.slot_minutes ? ` · turnos de ${e.slot_minutes} min` : ''
  return `Horario especial ${e.open_time}-${e.close_time}${slot}`
}

/**
 * Exceptions of the club (whole club or one court). In a court's tab `courtId` is that court:
 * it lists its own exceptions plus the club-wide ones, which also apply to it.
 */
export function ExceptionsPanel({
  clubId,
  courts,
  courtId,
  editable,
}: {
  clubId: string
  courts: ClubAdminCourt[]
  courtId?: string
  editable: boolean
}) {
  const exceptions = useExceptions(clubId)
  const remove = useDeleteException(clubId)
  const courtName = (id: string | null) => (id === null ? 'Todo el club' : (courts.find((c) => c.id === id)?.name ?? 'Cancha'))

  const rows = (exceptions.data ?? []).filter((e) => courtId === undefined || e.court_id === courtId || e.court_id === null)

  return (
    <div className="space-y-5">
      {editable && <ExceptionForm clubId={clubId} courts={courts} fixedCourtId={courtId} />}
      {exceptions.isError && <ErrorNotice error={exceptions.error} />}
      {remove.isError && <ErrorNotice error={remove.error} />}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Próximas excepciones</h3>
        {exceptions.isLoading ? (
          <p className="text-sm text-gray-400">Cargando...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-500">No hay excepciones cargadas desde hoy.</p>
        ) : (
          <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg bg-white">
            {rows.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatIsoDate(e.date)} <span className="text-gray-500 font-normal">· {courtName(e.court_id)}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {describe(e)}
                    {e.reason ? ` · ${e.reason}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge label={e.closed ? 'Cerrado' : 'Especial'} tone={e.closed ? 'red' : 'yellow'} />
                  {editable && (
                    <button
                      type="button"
                      disabled={remove.isPending}
                      onClick={() => {
                        if (window.confirm(`¿Quitar la excepción del ${formatIsoDate(e.date)}?`)) remove.mutate(e.id)
                      }}
                      className="text-xs text-red-600 underline disabled:opacity-50"
                    >
                      Quitar
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
