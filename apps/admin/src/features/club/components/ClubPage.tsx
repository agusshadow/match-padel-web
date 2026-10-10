import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ClubAdminClub, ClubAdminClubUpdate } from '@match-padel/types'
import { Notice, PageHeader } from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { useCurrentClub } from '@/shared/club-context'
import { canManageClub } from '@/shared/permissions'
import { useClub, useUpdateClub } from '../hooks/useClub'

const optionalNumber = (min: number, max: number) =>
  z
    .string()
    .trim()
    .refine((v) => v === '' || (!Number.isNaN(Number(v)) && Number(v) >= min && Number(v) <= max), {
      message: `Debe ser un número entre ${min} y ${max}`,
    })

const schema = z.object({
  name: z.string().trim().min(1, 'Requerido').max(120),
  description: z.string().trim().max(1000),
  address: z.string().trim().min(1, 'Requerido').max(200),
  city: z.string().trim().min(1, 'Requerido').max(100),
  phone: z.string().trim().max(40),
  email: z.string().trim().max(120).refine((v) => v === '' || z.string().email().safeParse(v).success, {
    message: 'Email inválido',
  }),
  logo_url: z.string().trim().refine((v) => v === '' || z.string().url().safeParse(v).success, {
    message: 'URL inválida',
  }),
  cover_url: z.string().trim().refine((v) => v === '' || z.string().url().safeParse(v).success, {
    message: 'URL inválida',
  }),
  lat: optionalNumber(-90, 90),
  lng: optionalNumber(-180, 180),
})

type FormValues = z.infer<typeof schema>

function toFormValues(club: ClubAdminClub): FormValues {
  return {
    name: club.name,
    description: club.description ?? '',
    address: club.address,
    city: club.city,
    phone: club.phone ?? '',
    email: club.email ?? '',
    logo_url: club.logo_url ?? '',
    cover_url: club.cover_url ?? '',
    lat: club.lat === null ? '' : String(club.lat),
    lng: club.lng === null ? '' : String(club.lng),
  }
}

function toPayload(v: FormValues): ClubAdminClubUpdate {
  const orNull = (s: string) => (s === '' ? null : s)
  return {
    name: v.name,
    address: v.address,
    city: v.city,
    description: orNull(v.description),
    phone: orNull(v.phone),
    email: orNull(v.email),
    logo_url: orNull(v.logo_url),
    cover_url: orNull(v.cover_url),
    lat: v.lat === '' ? null : Number(v.lat),
    lng: v.lng === '' ? null : Number(v.lng),
  }
}

const FIELDS: Array<{ name: keyof FormValues; label: string; type?: 'textarea'; wide?: boolean }> = [
  { name: 'name', label: 'Nombre' },
  { name: 'city', label: 'Ciudad' },
  { name: 'address', label: 'Dirección', wide: true },
  { name: 'description', label: 'Descripción', type: 'textarea', wide: true },
  { name: 'phone', label: 'Teléfono' },
  { name: 'email', label: 'Email de contacto' },
  { name: 'logo_url', label: 'URL del logo', wide: true },
  { name: 'cover_url', label: 'URL de la portada', wide: true },
  { name: 'lat', label: 'Latitud' },
  { name: 'lng', label: 'Longitud' },
]

export function ClubPage() {
  const current = useCurrentClub()
  const canEdit = canManageClub(current.role)
  const { data: club, isLoading, error } = useClub(current.clubId)
  const update = useUpdateClub(current.clubId)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (club) reset(toFormValues(club))
  }, [club, reset])

  const onSubmit = handleSubmit((values) => update.mutate(toPayload(values)))

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-600'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Datos del club"
        subtitle={canEdit ? 'Esta información la ven los jugadores en la app' : 'Solo lectura'}
      />

      {error && <Notice>{getErrorMessage(error)}</Notice>}
      {update.error && <Notice>{getErrorMessage(update.error)}</Notice>}
      {update.isSuccess && !isDirty && <Notice tone="info">Cambios guardados.</Notice>}

      {isLoading ? (
        <div className="p-8 text-center text-gray-400">Cargando...</div>
      ) : (
        club && (
          <form onSubmit={onSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FIELDS.map((f) => (
                <div key={f.name} className={f.wide ? 'sm:col-span-2' : undefined}>
                  <label htmlFor={`club-${f.name}`} className="block text-sm font-medium text-gray-700 mb-1">
                    {f.label}
                  </label>
                  {f.type === 'textarea' ? (
                    <textarea
                      id={`club-${f.name}`}
                      rows={3}
                      disabled={!canEdit}
                      className={`${inputClass} resize-none`}
                      {...register(f.name)}
                    />
                  ) : (
                    <input id={`club-${f.name}`} disabled={!canEdit} className={inputClass} {...register(f.name)} />
                  )}
                  {errors[f.name] && <p className="text-xs text-red-600 mt-1">{errors[f.name]?.message}</p>}
                </div>
              ))}
            </div>

            {canEdit && (
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={!isDirty || update.isPending}
                  onClick={() => reset(toFormValues(club))}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Descartar
                </button>
                <button
                  type="submit"
                  disabled={!isDirty || update.isPending}
                  className="px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {update.isPending ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            )}
          </form>
        )
      )}
    </div>
  )
}
