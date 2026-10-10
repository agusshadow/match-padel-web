import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ClubAdminCourt, CourtWarning } from '@match-padel/types'
import { Notice, PageHeader, StatusBadge, formatMoney } from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { useCurrentClub } from '@/shared/club-context'
import { SURFACE_LABELS } from '../lib/time'
import { inputClass } from '../lib/styles'
import { useClubCourts, useCreateCourt, useUpdateCourt } from '../hooks/useCourts'
import { PrimaryButton } from './ui'

const SURFACES = ['indoor', 'outdoor', 'panoramic'] as const

const schema = z.object({
  name: z.string().trim().min(1, 'Requerido').max(80, 'Máximo 80 caracteres'),
  surface: z.enum(SURFACES),
  is_indoor: z.boolean(),
  price_per_hour: z
    .string()
    .trim()
    .refine((v) => v !== '' && !Number.isNaN(Number(v)) && Number(v) > 0 && Number(v) <= 10_000_000, {
      message: 'Un precio mayor a 0',
    }),
  is_active: z.boolean(),
})
type FormValues = z.infer<typeof schema>

const NEW_COURT: FormValues = { name: '', surface: 'indoor', is_indoor: true, price_per_hour: '', is_active: true }

function toFormValues(court: ClubAdminCourt): FormValues {
  return {
    name: court.name,
    surface: court.surface,
    is_indoor: court.is_indoor,
    price_per_hour: String(court.price_per_hour),
    is_active: court.is_active,
  }
}

function CourtForm({
  initial,
  submitLabel,
  pending,
  error,
  onSubmit,
  onCancel,
}: {
  initial: FormValues
  submitLabel: string
  pending: boolean
  error: unknown
  onSubmit: (values: FormValues) => void
  onCancel: () => void
}) {
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: initial })
  const { errors } = form.formState
  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50"
    >
      {error != null && <Notice>{getErrorMessage(error)}</Notice>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="court-name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input id="court-name" className={inputClass} placeholder="Cancha 1" {...form.register('name')} />
          {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="court-surface" className="block text-sm font-medium text-gray-700 mb-1">
            Superficie
          </label>
          <select id="court-surface" className={inputClass} {...form.register('surface')}>
            {SURFACES.map((s) => (
              <option key={s} value={s}>
                {SURFACE_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="court-price" className="block text-sm font-medium text-gray-700 mb-1">
            Precio base por hora ($)
          </label>
          <input id="court-price" inputMode="decimal" className={inputClass} {...form.register('price_per_hour')} />
          {errors.price_per_hour ? (
            <p className="text-red-600 text-xs mt-1">{errors.price_per_hour.message}</p>
          ) : (
            <p className="text-gray-400 text-xs mt-1">Se cobra cuando ninguna franja de precios aplica.</p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-700">
        <label className="flex items-center gap-2">
          <input type="checkbox" {...form.register('is_indoor')} /> Techada
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...form.register('is_active')} /> Activa (se puede reservar)
        </label>
      </div>
      <div className="flex gap-2 items-center">
        <PrimaryButton type="submit" disabled={pending}>
          {pending ? 'Guardando...' : submitLabel}
        </PrimaryButton>
        <button type="button" onClick={onCancel} className="px-3 py-2 text-sm text-gray-600 hover:underline">
          Cancelar
        </button>
      </div>
    </form>
  )
}

function toBody(v: FormValues) {
  return { ...v, price_per_hour: Number(v.price_per_hour) }
}

export function CourtsPage() {
  const club = useCurrentClub()
  const courts = useClubCourts(club.clubId)
  const create = useCreateCourt(club.clubId)
  const update = useUpdateCourt(club.clubId)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [warning, setWarning] = useState<{ courtName: string; warning: CourtWarning } | null>(null)

  const list = courts.data ?? []

  const toggleActive = (court: ClubAdminCourt) => {
    setWarning(null)
    update.mutate(
      { id: court.id, body: { is_active: !court.is_active } },
      {
        onSuccess: (result) => {
          if (result.warning) setWarning({ courtName: court.name, warning: result.warning })
        },
      },
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Canchas"
        subtitle="Horarios, precios y excepciones de cada cancha"
        actions={
          <Link
            to={`/${club.clubId}/courts/exceptions`}
            className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50"
          >
            Excepciones del club
          </Link>
        }
      />

      {courts.isError && <Notice>{getErrorMessage(courts.error)}</Notice>}
      {update.isError && editingId === null && <Notice>{getErrorMessage(update.error)}</Notice>}
      {warning && (
        <Notice tone="warning">
          <strong>{warning.courtName}</strong> quedó inactiva, pero tiene{' '}
          {warning.warning.future_reservations}{' '}
          {warning.warning.future_reservations === 1 ? 'reserva futura' : 'reservas futuras'}. No se cancelaron: ya no
          se ofrecen turnos nuevos y las existentes siguen vigentes.
        </Notice>
      )}

      {courts.isLoading ? (
        <p className="text-sm text-gray-400">Cargando canchas...</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-gray-500">Todavía no cargaste canchas.</p>
      ) : (
        <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg bg-white">
          {list.map((court) =>
            editingId === court.id ? (
              <li key={court.id} className="p-3">
                <CourtForm
                  initial={toFormValues(court)}
                  submitLabel="Guardar cancha"
                  pending={update.isPending}
                  error={update.isError ? update.error : null}
                  onCancel={() => setEditingId(null)}
                  onSubmit={(v) => {
                    setWarning(null)
                    update.mutate(
                      { id: court.id, body: toBody(v) },
                      {
                        onSuccess: (result) => {
                          setEditingId(null)
                          if (result.warning) setWarning({ courtName: court.name, warning: result.warning })
                        },
                      },
                    )
                  }}
                />
              </li>
            ) : (
              <li key={court.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <Link
                    to={`/${club.clubId}/courts/${court.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-green-700 hover:underline"
                  >
                    {court.name}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {SURFACE_LABELS[court.surface]}
                    {court.is_indoor ? ' · Techada' : ''} · Base {formatMoney(court.price_per_hour)} / hora
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge label={court.is_active ? 'Activa' : 'Inactiva'} tone={court.is_active ? 'green' : 'gray'} />
                  <Link to={`/${club.clubId}/courts/${court.id}`} className="text-xs text-green-700 underline">
                    Horarios y precios
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      update.reset()
                      setEditingId(court.id)
                    }}
                    className="text-xs text-gray-600 underline"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    disabled={update.isPending}
                    onClick={() => toggleActive(court)}
                    className="text-xs text-gray-600 underline disabled:opacity-50"
                  >
                    {court.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}

      {adding ? (
        <CourtForm
          initial={NEW_COURT}
          submitLabel="Agregar cancha"
          pending={create.isPending}
          error={create.isError ? create.error : null}
          onCancel={() => setAdding(false)}
          onSubmit={(v) => create.mutate(toBody(v), { onSuccess: () => setAdding(false) })}
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            create.reset()
            setAdding(true)
          }}
          className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50"
        >
          + Agregar cancha
        </button>
      )}
    </div>
  )
}
