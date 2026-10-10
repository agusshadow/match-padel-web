import { useState } from 'react'
import type { CourtPreview } from '@match-padel/types'
import { Notice, formatMoney } from '@match-padel/ui'
import { DAY_NAMES, clubToday } from '../lib/time'
import { inputClass } from '../lib/styles'
import { usePreview } from '../hooks/useCourts'
import { ErrorNotice } from './ProblemList'

const SOURCE_LABELS: Record<CourtPreview['source'], string> = {
  court_exception: 'Excepción de esta cancha',
  club_exception: 'Excepción del club',
  court_schedule: 'Horario semanal de la cancha',
  club_hours: 'Horario general del club',
  none: 'Sin horario',
}

export function PreviewTab({ clubId, courtId }: { clubId: string; courtId: string }) {
  const [date, setDate] = useState(clubToday)
  const preview = usePreview(clubId, courtId, date)
  const data = preview.data

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="preview-date" className="block text-xs font-medium text-gray-600 mb-1">
            Fecha
          </label>
          <input
            id="preview-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`${inputClass} w-44`}
          />
        </div>
        {data && (
          <p className="text-sm text-gray-500 pb-2">
            {DAY_NAMES[data.day_of_week]} · {SOURCE_LABELS[data.source]}
          </p>
        )}
      </div>
      <p className="text-sm text-gray-500">
        Es lo que ve un jugador ese día, antes de descontar reservas. Los cambios sin guardar no aparecen acá.
      </p>

      {preview.isError && <ErrorNotice error={preview.error} />}
      {preview.isLoading && <p className="text-sm text-gray-400">Cargando vista previa...</p>}

      {data?.closed && (
        <Notice tone="warning">
          La cancha está cerrada ese día
          {data.closed_reason ? `: ${data.closed_reason}` : data.source === 'none' ? ' (no tiene horario cargado)' : ''}.
        </Notice>
      )}

      {data && !data.closed && (
        <div className="border border-gray-200 rounded-lg bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Turno</th>
                <th className="px-4 py-2 font-medium">Duración</th>
                <th className="px-4 py-2 font-medium">Precio por hora</th>
                <th className="px-4 py-2 font-medium">Precio del turno</th>
                <th className="px-4 py-2 font-medium">Franja aplicada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.slots.map((s) => (
                <tr key={s.start_time}>
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {s.start} - {s.end}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{s.slot_minutes} min</td>
                  <td className="px-4 py-2 text-gray-600">{formatMoney(s.price_per_hour)}</td>
                  <td className="px-4 py-2 font-semibold text-gray-900">{formatMoney(s.price)}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {s.rule_name ?? `Precio base (${formatMoney(data.base_price_per_hour)})`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
