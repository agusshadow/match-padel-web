import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ClubAdminClub } from '@match-padel/types'
import { Notice } from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { useSaveClub } from '../hooks/useOnboarding'
import { SaveBar, TextField, orNull } from './fields'

const schema = z.object({
  phone: z.string().trim().max(40, 'Máximo 40 caracteres'),
  email: z
    .string()
    .trim()
    .max(200)
    .refine((v) => v === '' || z.string().email().safeParse(v).success, { message: 'Email inválido' }),
  logo_url: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === '' || z.string().url().safeParse(v).success, { message: 'URL inválida' }),
})
type FormValues = z.infer<typeof schema>

interface Props {
  clubId: string
  club: ClubAdminClub
  editable: boolean
  onSaved: () => void
}

export function ContactStep({ clubId, club, editable, onSaved }: Props) {
  const save = useSaveClub(clubId)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: club.phone ?? '', email: club.email ?? '', logo_url: club.logo_url ?? '' },
  })
  const { errors } = form.formState

  const onSubmit = form.handleSubmit((v) =>
    save.mutate(
      { phone: orNull(v.phone), email: orNull(v.email), logo_url: orNull(v.logo_url) },
      { onSuccess: onSaved },
    ),
  )

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {save.isError && <Notice>{getErrorMessage(save.error)}</Notice>}
      <fieldset disabled={!editable} className="space-y-4">
        <TextField
          id="contact-phone"
          label="Teléfono"
          type="tel"
          registration={form.register('phone')}
          error={errors.phone}
        />
        <TextField
          id="contact-email"
          label="Email de contacto"
          type="email"
          registration={form.register('email')}
          error={errors.email}
        />
        <TextField
          id="contact-logo"
          label="URL del logo (opcional)"
          registration={form.register('logo_url')}
          error={errors.logo_url}
          placeholder="https://..."
        />
      </fieldset>
      <SaveBar editable={editable} saving={save.isPending} saved={save.isSuccess} />
    </form>
  )
}
