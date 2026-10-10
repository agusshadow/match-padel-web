import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ClubRefundPolicy, RefundPolicyValues } from '@match-padel/types'
import { Notice, PageHeader } from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { useCurrentClub } from '@/shared/club-context'
import { canManageClub } from '@/shared/permissions'
import { useRefundPolicy, useUpdateRefundPolicy } from '../hooks/useRefundPolicy'
import {
  FIELD_LABELS,
  describePolicy,
  formatHours,
  formatPercent,
  limitMessage,
  policyBelowMinimum,
  violationsOf,
} from '../lib/policy'

const schema = z.object({
  hours_before_start: z
    .string()
    .trim()
    .regex(/^\d+$/, 'Ingresá un número entero de horas')
    .refine((v) => Number(v) <= 720, 'Máximo 720 horas'),
  late_refund_percent: z
    .string()
    .trim()
    .regex(/^\d+([.,]\d{1,2})?$/, 'Ingresá un porcentaje con hasta 2 decimales')
    .refine((v) => Number(v.replace(',', '.')) <= 100, 'Máximo 100%'),
})

type FormValues = z.infer<typeof schema>

const toForm = (p: RefundPolicyValues): FormValues => ({
  hours_before_start: String(p.hours_before_start),
  late_refund_percent: String(p.late_refund_percent),
})

const toPolicy = (v: FormValues): RefundPolicyValues => ({
  hours_before_start: Number(v.hours_before_start),
  late_refund_percent: Number(v.late_refund_percent.replace(',', '.')),
})

/** Live values for the preview: `null` while the inputs are not valid numbers yet. */
function previewOf(v: FormValues): RefundPolicyValues | null {
  const parsed = schema.safeParse(v)
  return parsed.success ? toPolicy(parsed.data) : null
}

const inputClass =
  'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-600'

function Policy({ policy }: { policy: RefundPolicyValues }) {
  return (
    <p className="text-sm text-gray-700">
      Al menos <strong>{formatHours(policy.hours_before_start)}</strong> antes del turno: 100%. Con menos anticipación:{' '}
      <strong>{formatPercent(policy.late_refund_percent)}</strong>. Una vez empezado: 0%.
    </p>
  )
}

function PolicyForm({ clubId, data, canEdit }: { clubId: string; data: ClubRefundPolicy; canEdit: boolean }) {
  const update = useUpdateRefundPolicy(clubId)
  // The limits the last 409 reported (they may be newer than the ones we loaded).
  const [serverLimits, setServerLimits] = useState<ClubRefundPolicy['limits'] | null>(null)
  const limits = serverLimits ?? data.limits

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toForm(data) })

  useEffect(() => {
    reset(toForm(data))
  }, [data, reset])

  const flagViolations = (policy: RefundPolicyValues, lim: ClubRefundPolicy['limits'], fields = violationsOf(policy, lim)) => {
    fields.forEach((field) => setError(field, { type: 'limit', message: limitMessage(field, lim) }))
    return fields.length > 0
  }

  const onSubmit = handleSubmit((values) => {
    const policy = toPolicy(values)
    setServerLimits(null)
    // Same rule as the API: do not send what the platform will refuse.
    if (flagViolations(policy, data.limits)) return
    update.mutate(policy, {
      onError: (error) => {
        const below = policyBelowMinimum(error)
        if (!below) return
        setServerLimits(below.limits)
        flagViolations(policy, below.limits, below.violations)
      },
    })
  })

  const values = watch()
  const preview = previewOf(values)
  const unsavedViolations = preview ? violationsOf(preview, limits) : []
  const belowMinimum = update.error ? policyBelowMinimum(update.error) : null

  return (
    <div className="space-y-6">
      {data.clamped && (
        <Notice tone="warning">
          La plataforma cambió sus límites y la política guardada ya no los cumple. Hoy a los jugadores se les aplica:{' '}
          <strong>{describePolicy(data.effective)}</strong> Guardá una política dentro de los límites para que vuelva a
          regir la del club.
        </Notice>
      )}

      {update.isError && !belowMinimum && <Notice>{getErrorMessage(update.error)}</Notice>}
      {belowMinimum && (
        <Notice>
          La política queda fuera de los límites de la plataforma. Corregí{' '}
          {belowMinimum.violations.map((f) => FIELD_LABELS[f].toLowerCase()).join(' y ')}.
        </Notice>
      )}
      {update.isSuccess && !isDirty && <Notice tone="info">Política guardada. Rige para las cancelaciones desde ahora.</Notice>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <form
          onSubmit={onSubmit}
          className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 space-y-5"
          noValidate
        >
          <div>
            <label htmlFor="rp-hours" className="block text-sm font-medium text-gray-700 mb-1">
              {FIELD_LABELS.hours_before_start}
            </label>
            <div className="flex items-center gap-2">
              <input
                id="rp-hours"
                inputMode="numeric"
                disabled={!canEdit || update.isPending}
                aria-invalid={!!errors.hours_before_start}
                className={`${inputClass} max-w-[8rem] ${errors.hours_before_start ? 'border-red-400 ring-1 ring-red-300' : 'border-gray-300'}`}
                {...register('hours_before_start', { onChange: () => clearErrors() })}
              />
              <span className="text-sm text-gray-500">horas antes del inicio</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Cancelando con esta anticipación o más, el jugador recibe el 100%. Máximo de la plataforma:{' '}
              {formatHours(limits.max_hours_before_start)}.
            </p>
            {errors.hours_before_start && (
              <p role="alert" className="text-xs text-red-600 mt-1">
                {errors.hours_before_start.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="rp-percent" className="block text-sm font-medium text-gray-700 mb-1">
              {FIELD_LABELS.late_refund_percent}
            </label>
            <div className="flex items-center gap-2">
              <input
                id="rp-percent"
                inputMode="decimal"
                disabled={!canEdit || update.isPending}
                aria-invalid={!!errors.late_refund_percent}
                className={`${inputClass} max-w-[8rem] ${errors.late_refund_percent ? 'border-red-400 ring-1 ring-red-300' : 'border-gray-300'}`}
                {...register('late_refund_percent', { onChange: () => clearErrors() })}
              />
              <span className="text-sm text-gray-500">% de lo pagado</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Lo que se devuelve en dinero si cancela con menos anticipación. Mínimo de la plataforma:{' '}
              {formatPercent(limits.min_late_refund_percent)}.
            </p>
            {errors.late_refund_percent && (
              <p role="alert" className="text-xs text-red-600 mt-1">
                {errors.late_refund_percent.message}
              </p>
            )}
          </div>

          {canEdit ? (
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={update.isPending || !isDirty}
                className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {update.isPending ? 'Guardando...' : 'Guardar política'}
              </button>
              {isDirty && !update.isPending && (
                <button
                  type="button"
                  onClick={() => {
                    reset(toForm(data))
                    update.reset()
                  }}
                  className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Descartar
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-500">Solo el dueño y los administradores pueden cambiar la política.</p>
          )}
        </form>

        <aside className="bg-white rounded-xl border border-gray-200 p-5 space-y-4" aria-label="Vista previa">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Cómo la ven los jugadores</h2>
            {preview ? (
              <p className="text-sm text-gray-700">{describePolicy(preview)}</p>
            ) : (
              <p className="text-sm text-gray-400">Completá los dos valores para ver la vista previa.</p>
            )}
            {unsavedViolations.length > 0 && (
              <p className="text-xs text-red-600 mt-2">Esta política está fuera de los límites de la plataforma.</p>
            )}
          </div>
          <div className="border-t border-gray-100 pt-3">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Vigente hoy</h2>
            <Policy policy={data.effective} />
          </div>
          <div className="border-t border-gray-100 pt-3 text-xs text-gray-500 space-y-1">
            <h2 className="text-sm font-semibold text-gray-900">Límites de la plataforma</h2>
            <p>Anticipación máxima: {formatHours(limits.max_hours_before_start)}.</p>
            <p>Devolución mínima fuera de plazo: {formatPercent(limits.min_late_refund_percent)}.</p>
          </div>
        </aside>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 text-sm text-gray-600 space-y-1">
        <p>La política rige para las cancelaciones que hacen los jugadores desde la app (partidos y reservas).</p>
        <p>
          Cuando el club cancela una reserva, el jugador siempre recibe el 100%. Si una devolución no se puede completar
          (por ejemplo, la cuenta de Mercado Pago está vencida o sin saldo), la cancelación se hace igual y el
          dueño recibe un aviso para resolverla.
        </p>
      </div>
    </div>
  )
}

/** Refund policy of the club (`/:clubId/refund-policy`): owner and administrators edit it, reception reads it. */
export function RefundPolicyPage() {
  const club = useCurrentClub()
  const canEdit = canManageClub(club.role)
  const { data, isLoading, error, refetch } = useRefundPolicy(club.clubId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Política de cancelación"
        subtitle={
          canEdit
            ? 'Cuánto se devuelve a los jugadores cuando cancelan, dentro de los límites de la plataforma'
            : 'Solo lectura'
        }
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
      {isLoading && <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-40" />}
      {data && <PolicyForm clubId={club.clubId} data={data} canEdit={canEdit} />}
    </div>
  )
}
