import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { InvitableRole, TeamInvitationSent } from '@match-padel/types'
import { Notice } from '@match-padel/ui'
import { Dialog } from '@/shared/components/Dialog'
import { CLUB_ROLE_LABELS } from '@/shared/permissions'
import { useInvite } from '../hooks/useTeam'
import { teamErrorMessage } from '../lib/errors'
import { inputClass } from '../lib/styles'

const ROLES: InvitableRole[] = ['admin', 'staff']

const ROLE_HELP: Record<InvitableRole, string> = {
  admin: 'Gestiona canchas, horarios, precios, calendario, reservas y torneos. No gestiona el equipo.',
  staff: 'Ve el calendario y las reservas, y puede moverlas o cancelarlas. No confirma ni cambia precios.',
}

const schema = z.object({
  email: z.string().trim().min(1, 'Requerido').email('Email inválido').max(254, 'Email demasiado largo'),
  role: z.enum(['admin', 'staff']),
})
type FormValues = z.infer<typeof schema>

export function InviteDialog({
  clubId,
  onClose,
  onSent,
}: {
  clubId: string
  onClose: () => void
  onSent: (invitation: TeamInvitationSent) => void
}) {
  const invite = useInvite(clubId)
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '', role: 'staff' } })
  const role = form.watch('role')

  const submit = form.handleSubmit((values) => {
    invite.mutate(values, {
      onSuccess: (invitation) => {
        onSent(invitation)
        onClose()
      },
    })
  })

  return (
    <Dialog title="Invitar persona" onClose={onClose} busy={invite.isPending}>
      <form onSubmit={submit} noValidate className="space-y-4">
        {invite.isError && <Notice>{teamErrorMessage(invite.error)}</Notice>}
        <div>
          <label htmlFor="invite-email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="invite-email"
            type="email"
            autoComplete="off"
            placeholder="persona@ejemplo.com"
            className={inputClass}
            {...form.register('email')}
          />
          {form.formState.errors.email && (
            <p className="text-red-600 text-xs mt-1">{form.formState.errors.email.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            La persona tiene que crear su cuenta o iniciar sesión con este mismo email para aceptar.
          </p>
        </div>
        <div>
          <label htmlFor="invite-role" className="block text-sm font-medium text-gray-700 mb-1">
            Rol
          </label>
          <select id="invite-role" className={inputClass} {...form.register('role')}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {CLUB_ROLE_LABELS[r]}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">{ROLE_HELP[role]}</p>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={invite.isPending}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={invite.isPending}
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {invite.isPending ? 'Enviando...' : 'Enviar invitación'}
          </button>
        </div>
      </form>
    </Dialog>
  )
}
