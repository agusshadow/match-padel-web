import { useState } from 'react'
import { SLOT_MINUTES_OPTIONS, type CourtSchedule, type CourtScheduleInterval, type SlotMinutes } from '@match-padel/types'
import { Notice } from '@match-padel/ui'
import { CLOSE_TIMES, DAY_NAMES, DAY_ORDER, DAY_SHORT, OPEN_TIMES, overlaps, toMinutes, withValue } from '../lib/time'
import { inputClass } from '../lib/styles'
import { useCourtSchedule, useReplaceSchedule } from '../hooks/useCourts'
import { ErrorNotice, ProblemNotice } from './ProblemList'
import { PrimaryButton, TimeSelect } from './ui'

const MAX_INTERVALS = 28

interface Row {
  open_time: string
  close_time: string
  slot_minutes: SlotMinutes
}
type Week = Record<number, Row[]>

function toWeek(intervals: CourtScheduleInterval[]): Week {
  const week: Week = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
  for (const iv of intervals) {
    week[iv.day_of_week].push({ open_time: iv.open_time, close_time: iv.close_time, slot_minutes: iv.slot_minutes })
  }
  for (const day of DAY_ORDER) week[day].sort((a, b) => a.open_time.localeCompare(b.open_time))
  return week
}

function toIntervals(week: Week): CourtScheduleInterval[] {
  return DAY_ORDER.flatMap((day) => week[day].map((r) => ({ day_of_week: day, ...r })))
}

/** Mirrors the API checks (open < close, at least one whole slot, no overlaps) so they show before saving. */
function validate(week: Week): string[] {
  const problems: string[] = []
  const total = DAY_ORDER.reduce((n, d) => n + week[d].length, 0)
  if (total > MAX_INTERVALS) problems.push(`Máximo ${MAX_INTERVALS} rangos en la semana.`)
  for (const day of DAY_ORDER) {
    const rows = [...week[day]].sort((a, b) => toMinutes(a.open_time) - toMinutes(b.open_time))
    rows.forEach((r, i) => {
      const open = toMinutes(r.open_time)
      const close = toMinutes(r.close_time)
      const label = `${DAY_NAMES[day]} ${r.open_time}-${r.close_time}`
      if (open >= close) problems.push(`${label}: la apertura tiene que ser anterior al cierre.`)
      else if (close - open < r.slot_minutes) {
        problems.push(`${label}: el rango es más corto que un turno de ${r.slot_minutes} minutos.`)
      }
      if (i > 0) {
        const prev = rows[i - 1]
        if (overlaps(toMinutes(prev.open_time), toMinutes(prev.close_time), open, close)) {
          problems.push(`${DAY_NAMES[day]}: ${prev.open_time}-${prev.close_time} se superpone con ${r.open_time}-${r.close_time}.`)
        }
      }
    })
  }
  return problems
}

const SOURCE_COPY: Record<CourtSchedule['source'], string> = {
  court: 'Esta cancha tiene su propio horario semanal.',
  club: 'Esta cancha todavía usa el horario general del club (turnos de 60 minutos). Al guardar, pasa a tener su propio horario.',
  none: 'Esta cancha no tiene horario cargado: los jugadores no ven turnos hasta que cargues al menos un rango.',
}

function ScheduleEditor({
  clubId,
  courtId,
  schedule,
  editable,
}: {
  clubId: string
  courtId: string
  schedule: CourtSchedule
  editable: boolean
}) {
  const save = useReplaceSchedule(clubId, courtId)
  const [week, setWeek] = useState<Week>(() => toWeek(schedule.intervals))
  const [problems, setProblems] = useState<string[]>([])
  const [copyFrom, setCopyFrom] = useState<number | null>(null)
  const [copyTo, setCopyTo] = useState<number[]>([])

  const change = (next: Week) => {
    setWeek(next)
    setProblems([])
    save.reset()
  }
  const setDay = (day: number, rows: Row[]) => change({ ...week, [day]: rows })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const invalid = validate(week)
    const total = DAY_ORDER.reduce((n, d) => n + week[d].length, 0)
    if (total === 0) invalid.push('Cargá al menos un rango. Para dejar de ofrecer la cancha, desactivala desde la lista.')
    setProblems(invalid)
    if (invalid.length === 0) save.mutate({ intervals: toIntervals(week) })
  }

  const applyCopy = () => {
    if (copyFrom === null) return
    const rows = week[copyFrom]
    const next = { ...week }
    for (const day of copyTo) next[day] = rows.map((r) => ({ ...r }))
    change(next)
    setCopyFrom(null)
    setCopyTo([])
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Notice tone={schedule.source === 'court' ? 'info' : 'warning'}>{SOURCE_COPY[schedule.source]}</Notice>
      {save.isError && <ErrorNotice error={save.error} />}
      <ProblemNotice problems={problems} />
      <p className="text-sm text-gray-500">
        Cada rango se divide en turnos de la duración elegida, desde la hora de apertura. Un día sin rangos queda
        cerrado. Si el club abre pasada la medianoche, cerrá el día a las 24:00 y abrí el siguiente a las 00:00.
      </p>

      <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg bg-white">
        {DAY_ORDER.map((day) => (
          <li key={day} className="px-4 py-3 flex flex-col sm:flex-row sm:items-start gap-3">
            <div className="sm:w-28 pt-2 text-sm font-medium text-gray-800">{DAY_NAMES[day]}</div>
            <div className="flex-1 space-y-2">
              {week[day].length === 0 && <p className="pt-2 text-sm text-gray-400">Cerrado</p>}
              {week[day].map((row, index) => {
                const patch = (p: Partial<Row>) =>
                  setDay(day, week[day].map((r, i) => (i === index ? { ...r, ...p } : r)))
                return (
                  <div key={index} className="flex flex-wrap items-center gap-2">
                    <TimeSelect
                      label={`${DAY_NAMES[day]}: apertura`}
                      disabled={!editable}
                      value={row.open_time}
                      options={withValue(OPEN_TIMES, row.open_time)}
                      onChange={(v) => patch({ open_time: v })}
                    />
                    <span className="text-gray-400 text-sm">a</span>
                    <TimeSelect
                      label={`${DAY_NAMES[day]}: cierre`}
                      disabled={!editable}
                      value={row.close_time}
                      options={withValue(CLOSE_TIMES, row.close_time)}
                      onChange={(v) => patch({ close_time: v })}
                    />
                    <select
                      aria-label={`${DAY_NAMES[day]}: duración del turno`}
                      disabled={!editable}
                      value={row.slot_minutes}
                      onChange={(e) => patch({ slot_minutes: Number(e.target.value) as SlotMinutes })}
                      className={`${inputClass} w-36`}
                    >
                      {SLOT_MINUTES_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          Turnos de {m} min
                        </option>
                      ))}
                    </select>
                    {editable && (
                      <button
                        type="button"
                        onClick={() => setDay(day, week[day].filter((_, i) => i !== index))}
                        className="text-xs text-red-600 underline"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                )
              })}
              {editable && (
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      const last = week[day][week[day].length - 1]
                      setDay(day, [
                        ...week[day],
                        last
                          ? { open_time: last.close_time === '24:00' ? '00:00' : last.close_time, close_time: '24:00', slot_minutes: last.slot_minutes }
                          : { open_time: '08:00', close_time: '23:00', slot_minutes: 90 },
                      ])
                    }}
                    className="text-xs text-green-700 underline"
                  >
                    + Agregar rango
                  </button>
                  {week[day].length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setCopyFrom(copyFrom === day ? null : day)
                        setCopyTo([])
                      }}
                      className="text-xs text-gray-500 underline"
                    >
                      Copiar a otros días
                    </button>
                  )}
                </div>
              )}
              {copyFrom === day && (
                <div className="flex flex-wrap items-center gap-3 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm">
                  <span className="text-gray-600">Copiar {DAY_NAMES[day].toLowerCase()} a:</span>
                  {DAY_ORDER.filter((d) => d !== day).map((d) => (
                    <label key={d} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={copyTo.includes(d)}
                        onChange={(e) => setCopyTo(e.target.checked ? [...copyTo, d] : copyTo.filter((x) => x !== d))}
                      />
                      {DAY_SHORT[d]}
                    </label>
                  ))}
                  <button
                    type="button"
                    disabled={copyTo.length === 0}
                    onClick={applyCopy}
                    className="text-xs font-semibold text-green-700 underline disabled:opacity-40"
                  >
                    Aplicar
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {editable && (
        <div className="flex items-center gap-3">
          <PrimaryButton type="submit" disabled={save.isPending}>
            {save.isPending ? 'Guardando...' : 'Guardar horario'}
          </PrimaryButton>
          {save.isSuccess && !save.isPending && <span className="text-xs text-green-700">Horario guardado</span>}
        </div>
      )}
    </form>
  )
}

export function ScheduleTab({ clubId, courtId, editable }: { clubId: string; courtId: string; editable: boolean }) {
  const schedule = useCourtSchedule(clubId, courtId)
  if (schedule.isLoading) return <p className="text-sm text-gray-400">Cargando horario...</p>
  if (schedule.isError) return <ErrorNotice error={schedule.error} />
  if (!schedule.data) return null
  return (
    <ScheduleEditor
      key={courtId}
      clubId={clubId}
      courtId={courtId}
      schedule={schedule.data}
      editable={editable}
    />
  )
}
