import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ClubAdminClub } from '@match-padel/types'
import { Notice } from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { useSaveClub } from '../hooks/useOnboarding'
import { SaveBar, TextField, optionalNumberText } from './fields'

const schema = z.object({
  address: z.string().trim().min(2, 'Mínimo 2 caracteres').max(200),
  city: z.string().trim().min(2, 'Mínimo 2 caracteres').max(100),
  lat: z.string().trim().refine(optionalNumberText(-90, 90), { message: 'Un número entre -90 y 90' }),
  lng: z.string().trim().refine(optionalNumberText(-180, 180), { message: 'Un número entre -180 y 180' }),
})
type FormValues = z.infer<typeof schema>

interface Props {
  clubId: string
  club: ClubAdminClub
  editable: boolean
  onSaved: () => void
}

export function LocationStep({ clubId, club, editable, onSaved }: Props) {
  const save = useSaveClub(clubId)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      address: club.address,
      city: club.city,
      lat: club.lat === null ? '' : String(club.lat),
      lng: club.lng === null ? '' : String(club.lng),
    },
  })
  const { errors } = form.formState

  const onSubmit = form.handleSubmit((v) =>
    save.mutate(
      {
        address: v.address,
        city: v.city,
        lat: v.lat === '' ? null : Number(v.lat),
        lng: v.lng === '' ? null : Number(v.lng),
      },
      { onSuccess: onSaved },
    ),
  )

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {save.isError && <Notice>{getErrorMessage(save.error)}</Notice>}
      <fieldset disabled={!editable} className="space-y-4">
        <TextField id="loc-address" label="Dirección" registration={form.register('address')} error={errors.address} />
        <TextField id="loc-city" label="Ciudad" registration={form.register('city')} error={errors.city} />
        <div className="grid grid-cols-2 gap-4">
          <TextField
            id="loc-lat"
            label="Latitud"
            inputMode="decimal"
            placeholder="-34.6037"
            registration={form.register('lat')}
            error={errors.lat}
          />
          <TextField
            id="loc-lng"
            label="Longitud"
            inputMode="decimal"
            placeholder="-58.3816"
            registration={form.register('lng')}
            error={errors.lng}
          />
        </div>
        <p className="text-xs text-gray-400">
          Las coordenadas son obligatorias para que los jugadores te encuentren en el mapa. Podés copiarlas desde
          Google Maps: clic derecho sobre el lugar y elegir los números que aparecen arriba.
        </p>
      </fieldset>
      <SaveBar editable={editable} saving={save.isPending} saved={save.isSuccess} />
    </form>
  )
}
