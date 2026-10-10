import { useMemo, useState } from 'react'
import { WEEKDAYS, type ClubAdminClub, type OpeningHours, type OpeningInterval, type Weekday } from '@match-padel/types'
import { Link } from 'react-router-dom'
import { Notice } from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { useCurrentClub } from '@/shared/club-context'
import { WEEKDAY_LABELS } from '../constants'
import { useSaveClub } from '../hooks/useOnboarding'
import { SaveBar, inputClass } from './fields'

const MAX_INTERVALS_PER_DAY = 4

// Half-hour grid; `24:00` is only valid as a closing time.
const TIMES = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, '0')
  return `${h}:${i % 2 === 0 ? '00' : '30'}`
})

function withValue(options: string[], value: string): string[] {
  return options.includes(value) ? options : [...options, value].sort()
}

function normalize(hours: OpeningHours): Record<Weekday, OpeningInterval[]> {
  return Object.fromEntries(WEEKDAYS.map((d) => [d, (hours[d] ?? []).map((i) => ({ ...i }))])) as Record<
    Weekday,
    OpeningInterval[]
  >
}

/** Problems that would make the API answer 400, so they are shown before saving. */
function validate(hours: Record<Weekday, OpeningInterval[]>): string | null {
  for (const day of WEEKDAYS) {
    const sorted = [...hours[day]].sort((a, b) => a.open.localeCompare(b.open))
    for (let i = 0; i < sorted.length; i++) {
      const { open, close } = sorted[i]
      if (open >= close) return `${WEEKDAY_LABELS[day]}: la apertura tiene que ser anterior al cierre.`
      if (i > 0 && sorted[i - 1].close > open) return `${WEEKDAY_LABELS[day]}: los rangos no pueden superponerse.`
    }
  }
  return null
}

interface Props {
  clubId: string
  club: ClubAdminClub
  editable: boolean
  onSaved: () => void
}

export function ScheduleStep({ clubId, club, editable, onSaved }: Props) {
  const save = useSaveClub(clubId)
  const currentClub = useCurrentClub()
  const initial = useMemo(() => normalize(club.opening_hours ?? {}), [club.opening_hours])
  const [hours, setHours] = useState(initial)
  const [problem, setProblem] = useState<string | null>(null)

  const setDay = (day: Weekday, intervals: OpeningInterval[]) => {
    setHours((prev) => ({ ...prev, [day]: intervals }))
    setProblem(null)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const invalid = validate(hours)
    if (invalid) {
      setProblem(invalid)
      return
    }
    save.mutate({ opening_hours: hours }, { onSuccess: onSaved })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {save.isError && <Notice>{getErrorMessage(save.error)}</Notice>}
      {problem && <Notice>{problem}</Notice>}
      <p className="text-sm text-gray-500">
        Cargá el horario semanal del club. Un día sin rangos queda cerrado; podés agregar varios rangos (por ejemplo,
        mañana y tarde). Es el horario general del club: las canchas sin horario propio lo usan, con turnos de 60
        minutos.
      </p>
      <Notice tone="info">
        {currentClub.status === 'approved' ? (
          <>
            El horario detallado de cada cancha (turnos de 30 a 120 minutos, varios rangos por día) y sus precios por
            franja horaria y día se editan en{' '}
            <Link to={`/${clubId}/courts`} className="underline font-medium">
              Canchas
            </Link>
            .
          </>
        ) : (
          <>
            Cuando el club esté aprobado vas a poder cargar el horario detallado de cada cancha y sus precios por
            franja horaria y día desde la sección Canchas.
          </>
        )}
      </Notice>
      <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg bg-white">
        {WEEKDAYS.map((day) => (
          <li key={day} className="px-4 py-3 flex flex-col sm:flex-row sm:items-start gap-3">
            <div className="sm:w-28 pt-2 text-sm font-medium text-gray-800">{WEEKDAY_LABELS[day]}</div>
            <div className="flex-1 space-y-2">
              {hours[day].length === 0 && <p className="pt-2 text-sm text-gray-400">Cerrado</p>}
              {hours[day].map((interval, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    aria-label={`${WEEKDAY_LABELS[day]}: apertura`}
                    disabled={!editable}
                    value={interval.open}
                    onChange={(e) =>
                      setDay(day, hours[day].map((it, i) => (i === index ? { ...it, open: e.target.value } : it)))
                    }
                    className={`${inputClass} w-28`}
                  >
                    {withValue(TIMES, interval.open).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-400 text-sm">a</span>
                  <select
                    aria-label={`${WEEKDAY_LABELS[day]}: cierre`}
                    disabled={!editable}
                    value={interval.close}
                    onChange={(e) =>
                      setDay(day, hours[day].map((it, i) => (i === index ? { ...it, close: e.target.value } : it)))
                    }
                    className={`${inputClass} w-28`}
                  >
                    {withValue([...TIMES.slice(1), '24:00'], interval.close).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {editable && (
                    <button
                      type="button"
                      onClick={() => setDay(day, hours[day].filter((_, i) => i !== index))}
                      className="text-xs text-red-600 underline"
                    >
                      Quitar
                    </button>
                  )}
                </div>
              ))}
              {editable && (
                <div className="flex gap-4">
                  {hours[day].length < MAX_INTERVALS_PER_DAY && (
                    <button
                      type="button"
                      onClick={() => setDay(day, [...hours[day], { open: '09:00', close: '23:00' }])}
                      className="text-xs text-green-700 underline"
                    >
                      + Agregar rango
                    </button>
                  )}
                  {hours[day].length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const copy = hours[day]
                        setHours(
                          Object.fromEntries(WEEKDAYS.map((d) => [d, copy.map((i) => ({ ...i }))])) as Record<
                            Weekday,
                            OpeningInterval[]
                          >,
                        )
                        setProblem(null)
                      }}
                      className="text-xs text-gray-500 underline"
                    >
                      Copiar a todos los días
                    </button>
                  )}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
      <SaveBar editable={editable} saving={save.isPending} saved={save.isSuccess} />
    </form>
  )
}
