import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ClubAdminCourt } from '@match-padel/types'
import { Notice, StatusBadge, formatMoney } from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { useCurrentClub } from '@/shared/club-context'
import { SURFACE_LABELS } from '../constants'
import { useCourts, useCreateCourt, useDeleteCourt, useUpdateCourt } from '../hooks/useOnboarding'
import { TextField, inputClass } from './fields'

const SURFACES = ['indoor', 'outdoor', 'panoramic'] as const

const schema = z.object({
  name: z.string().trim().min(1, 'Requerido').max(80),
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
  onCancel?: () => void
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
        <TextField id="court-name" label="Nombre" registration={form.register('name')} error={errors.name} placeholder="Cancha 1" />
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
        <TextField
          id="court-price"
          label="Precio por hora ($)"
          inputMode="decimal"
          registration={form.register('price_per_hour')}
          error={errors.price_per_hour}
        />
      </div>
      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-700">
        <label className="flex items-center gap-2">
          <input type="checkbox" {...form.register('is_indoor')} /> Techada
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...form.register('is_active')} /> Activa (se puede reservar)
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {pending ? 'Guardando...' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-3 py-2 text-sm text-gray-600 hover:underline">
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

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

function toBody(v: FormValues) {
  return { ...v, price_per_hour: Number(v.price_per_hour) }
}

export function CourtsStep({ clubId, editable, onContinue }: { clubId: string; editable: boolean; onContinue: () => void }) {
  const courts = useCourts(clubId)
  const currentClub = useCurrentClub()
  const create = useCreateCourt(clubId)
  const update = useUpdateCourt(clubId)
  const remove = useDeleteCourt(clubId)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const list = courts.data ?? []

  return (
    <div className="space-y-4">
      <Notice tone="info">
        El precio por hora de la cancha es su precio base.{' '}
        {currentClub.status === 'approved' ? (
          <>
            Los horarios por cancha y los precios por franja horaria y día se editan en{' '}
            <Link to={`/${clubId}/courts`} className="underline font-medium">
              Canchas
            </Link>
            .
          </>
        ) : (
          <>Una vez aprobado el club, los horarios por cancha y los precios por franja se editan desde la sección Canchas.</>
        )}
      </Notice>
      {courts.isError && <Notice>{getErrorMessage(courts.error)}</Notice>}
      {remove.isError && <Notice>{getErrorMessage(remove.error)}</Notice>}
      {update.isError && editingId === null && <Notice>{getErrorMessage(update.error)}</Notice>}

      {courts.isLoading ? (
        <p className="text-sm text-gray-400">Cargando canchas...</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-gray-500">Todavía no cargaste canchas. Necesitás al menos una activa con precio.</p>
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
                  onSubmit={(v) =>
                    update.mutate({ id: court.id, body: toBody(v) }, { onSuccess: () => setEditingId(null) })
                  }
                />
              </li>
            ) : (
              <li key={court.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{court.name}</p>
                  <p className="text-xs text-gray-500">
                    {SURFACE_LABELS[court.surface]}
                    {court.is_indoor ? ' · Techada' : ''} · {formatMoney(court.price_per_hour)} / hora
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge label={court.is_active ? 'Activa' : 'Inactiva'} tone={court.is_active ? 'green' : 'gray'} />
                  {editable && (
                    <>
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
                        onClick={() =>
                          update.mutate({ id: court.id, body: { is_active: !court.is_active } })
                        }
                        className="text-xs text-gray-600 underline disabled:opacity-50"
                      >
                        {court.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        type="button"
                        disabled={remove.isPending}
                        onClick={() => {
                          if (window.confirm(`¿Eliminar "${court.name}"?`)) remove.mutate(court.id)
                        }}
                        className="text-xs text-red-600 underline disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </li>
            ),
          )}
        </ul>
      )}

      {editable &&
        (adding ? (
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
        ))}

      <div className="pt-2">
        <button
          type="button"
          onClick={onContinue}
          className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}
