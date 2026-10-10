import { useEffect, useState } from 'react'
import type { PlatformRefundLimits } from '@match-padel/types'
import { Notice, PageHeader, formatDateTime } from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { useRefundLimits, useUpdateRefundLimits } from '../hooks/useRefundLimits'

const inputClass =
  'w-full max-w-[8rem] px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500'

function formatPercent(value: number): string {
  return `${Number(value.toFixed(2))}%`
}

type Parsed = { hours: number | null; percent: number | null; hoursError: string | null; percentError: string | null }

function parse(hours: string, percent: string): Parsed {
  const h = hours.trim()
  const p = percent.trim().replace(',', '.')
  let hoursError: string | null = null
  let percentError: string | null = null
  if (!/^\d+$/.test(h)) hoursError = 'Ingresá un número entero de horas'
  else if (Number(h) > 720) hoursError = 'Máximo 720 horas'
  if (!/^\d+(\.\d{1,2})?$/.test(p)) percentError = 'Ingresá un porcentaje con hasta 2 decimales'
  else if (Number(p) > 100) percentError = 'Máximo 100%'
  return {
    hours: hoursError ? null : Number(h),
    percent: percentError ? null : Number(p),
    hoursError,
    percentError,
  }
}

function LimitsForm({ data }: { data: PlatformRefundLimits }) {
  const update = useUpdateRefundLimits()
  const [hours, setHours] = useState(String(data.max_hours_before_start))
  const [percent, setPercent] = useState(String(data.min_late_refund_percent))
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    setHours(String(data.max_hours_before_start))
    setPercent(String(data.min_late_refund_percent))
  }, [data])

  const parsed = parse(hours, percent)
  const valid = parsed.hours !== null && parsed.percent !== null
  const dirty = valid && (parsed.hours !== data.max_hours_before_start || parsed.percent !== data.min_late_refund_percent)

  const save = () => {
    if (parsed.hours === null || parsed.percent === null) return
    update.mutate(
      { max_hours_before_start: parsed.hours, min_late_refund_percent: parsed.percent },
      { onSuccess: () => setConfirming(false) },
    )
  }

  return (
    <div className="space-y-6">
      {update.isError && <Notice>{getErrorMessage(update.error)}</Notice>}
      {update.isSuccess && !dirty && (
        <Notice tone="info">
          Límites guardados.{' '}
          {data.clubs_clamped > 0
            ? `${data.clubs_clamped} ${data.clubs_clamped === 1 ? 'club tiene' : 'clubes tienen'} una política fuera de los nuevos límites y se les aplica la política ajustada.`
            : 'Ningún club quedó fuera de los límites.'}
        </Notice>
      )}

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          if (dirty) setConfirming(true)
        }}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 max-w-2xl"
      >
        <div>
          <label htmlFor="max-hours" className="block text-sm font-medium text-gray-700 mb-1">
            Anticipación máxima que puede exigir un club
          </label>
          <div className="flex items-center gap-2">
            <input
              id="max-hours"
              inputMode="numeric"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              aria-invalid={!!parsed.hoursError}
              className={`${inputClass} ${parsed.hoursError ? 'border-red-400' : 'border-gray-300'}`}
            />
            <span className="text-sm text-gray-500">horas (0 a 720)</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Un club no puede pedir más anticipación que esta para devolver el 100%.
          </p>
          {parsed.hoursError && <p role="alert" className="text-xs text-red-600 mt-1">{parsed.hoursError}</p>}
        </div>

        <div>
          <label htmlFor="min-percent" className="block text-sm font-medium text-gray-700 mb-1">
            Devolución mínima fuera de plazo
          </label>
          <div className="flex items-center gap-2">
            <input
              id="min-percent"
              inputMode="decimal"
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
              aria-invalid={!!parsed.percentError}
              className={`${inputClass} ${parsed.percentError ? 'border-red-400' : 'border-gray-300'}`}
            />
            <span className="text-sm text-gray-500">% de lo pagado (0 a 100)</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Lo mínimo que un club tiene que devolver, en dinero, cuando el jugador cancela con menos anticipación.
          </p>
          {parsed.percentError && <p role="alert" className="text-xs text-red-600 mt-1">{parsed.percentError}</p>}
        </div>

        {confirming && parsed.hours !== null && parsed.percent !== null ? (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 space-y-3 text-sm text-yellow-900">
            <p>
              Vas a fijar el máximo en <strong>{parsed.hours} h</strong> y la devolución mínima en{' '}
              <strong>{formatPercent(parsed.percent)}</strong> para <strong>todos los clubes</strong>. Las políticas ya
              guardadas no se modifican: las que queden fuera de los límites se ajustan al momento de devolver.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={save}
                disabled={update.isPending}
                className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {update.isPending ? 'Guardando...' : 'Confirmar'}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={update.isPending}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="submit"
            disabled={!dirty}
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Guardar límites
          </button>
        )}
      </form>

      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-2 text-sm text-gray-600 max-w-2xl">
        <p>
          <strong className="text-gray-900">
            {data.clubs_clamped} {data.clubs_clamped === 1 ? 'club' : 'clubes'}
          </strong>{' '}
          con una política guardada fuera de los límites actuales.
        </p>
        <p>
          Cambiar los límites <strong>no reescribe</strong> la política que guardó cada club: si queda fuera de los
          límites, se ajusta al momento de evaluar la devolución (el jugador ve y recibe la política ajustada) y el club
          ve el aviso en su panel hasta que la corrija.
        </p>
        <p className="text-xs text-gray-500">
          {data.updated_at
            ? `Última modificación: ${formatDateTime(data.updated_at)}`
            : 'Valores por defecto: todavía no se modificaron.'}
        </p>
      </section>
    </div>
  )
}

/** Platform limits of the clubs' refund policies (`/settings/refund-policy`, superadmin only). */
export function RefundPolicyLimitsPage() {
  const { data, isLoading, error, refetch } = useRefundLimits()
  return (
    <div className="space-y-6">
      <PageHeader
        title="Política de devoluciones"
        subtitle="Límites que cada club tiene que respetar al definir su política de cancelación"
      />
      {error && (
        <div className="space-y-3">
          <Notice>{getErrorMessage(error)}</Notice>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Reintentar
          </button>
        </div>
      )}
      {isLoading && <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-40 max-w-2xl" />}
      {data && <LimitsForm data={data} />}
    </div>
  )
}
