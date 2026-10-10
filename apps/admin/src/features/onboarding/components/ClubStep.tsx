import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ClubAdminClub } from '@match-padel/types'
import { Notice } from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { useSaveClub } from '../hooks/useOnboarding'
import { SaveBar, TextField, inputClass, orNull } from './fields'

const optionalMin2 = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((v) => v === '' || v.length >= 2, { message: 'Mínimo 2 caracteres' })

const schema = z.object({
  name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(120),
  description: z.string().trim().max(2000, 'Máximo 2000 caracteres'),
  legal_name: optionalMin2(200),
  tax_id: optionalMin2(40),
})
type FormValues = z.infer<typeof schema>

interface Props {
  clubId: string
  club: ClubAdminClub
  editable: boolean
  onSaved: () => void
}

export function ClubStep({ clubId, club, editable, onSaved }: Props) {
  const save = useSaveClub(clubId)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: club.name,
      description: club.description ?? '',
      legal_name: club.legal_name ?? '',
      tax_id: club.tax_id ?? '',
    },
  })
  const { errors } = form.formState

  const onSubmit = form.handleSubmit((v) =>
    save.mutate(
      { name: v.name, description: orNull(v.description), legal_name: orNull(v.legal_name), tax_id: orNull(v.tax_id) },
      { onSuccess: onSaved },
    ),
  )

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {save.isError && <Notice>{getErrorMessage(save.error)}</Notice>}
      <fieldset disabled={!editable} className="space-y-4">
        <TextField id="club-name" label="Nombre del club" registration={form.register('name')} error={errors.name} />
        <div>
          <label htmlFor="club-description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            id="club-description"
            rows={4}
            className={inputClass}
            placeholder="Contá en pocas líneas qué ofrece tu club"
            {...form.register('description')}
          />
          {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description.message}</p>}
        </div>
        <TextField
          id="club-legal-name"
          label="Razón social"
          registration={form.register('legal_name')}
          error={errors.legal_name}
          hint="Nombre legal de la persona o sociedad titular. Es obligatorio para enviar la solicitud."
        />
        <TextField
          id="club-tax-id"
          label="CUIT / identificación fiscal"
          registration={form.register('tax_id')}
          error={errors.tax_id}
          placeholder="30-12345678-9"
        />
      </fieldset>
      <SaveBar editable={editable} saving={save.isPending} saved={save.isSuccess} />
    </form>
  )
}
