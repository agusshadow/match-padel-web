import { useState } from 'react'
import type { InvitableRole, TeamInvitation, TeamMember } from '@match-padel/types'
import { Notice, personName } from '@match-padel/ui'
import { Dialog } from '@/shared/components/Dialog'
import { CLUB_ROLE_LABELS } from '@/shared/permissions'
import { useChangeMemberRole, useRemoveMember, useRevokeInvitation } from '../hooks/useTeam'
import { teamErrorMessage } from '../lib/errors'
import { inputClass } from '../lib/styles'

const ROLES: InvitableRole[] = ['admin', 'staff']

function DialogActions({
  busy,
  confirmLabel,
  busyLabel,
  danger = false,
  disabled = false,
  onCancel,
}: {
  busy: boolean
  confirmLabel: string
  busyLabel: string
  danger?: boolean
  disabled?: boolean
  onCancel: () => void
}) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button
        type="button"
        onClick={onCancel}
        disabled={busy}
        className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={busy || disabled}
        className={`px-4 py-2 text-white text-sm font-semibold rounded-lg disabled:opacity-50 ${
          danger ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {busy ? busyLabel : confirmLabel}
      </button>
    </div>
  )
}

export function ChangeRoleDialog({
  clubId,
  member,
  onClose,
  onDone,
}: {
  clubId: string
  member: TeamMember
  onClose: () => void
  onDone: (message: string) => void
}) {
  const change = useChangeMemberRole(clubId)
  const current: InvitableRole = member.role === 'admin' ? 'admin' : 'staff'
  const [role, setRole] = useState<InvitableRole>(current)
  const name = personName(member)

  return (
    <Dialog title="Cambiar rol" onClose={onClose} busy={change.isPending}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          change.mutate(
            { userId: member.user_id, role },
            {
              onSuccess: () => {
                onDone(`${name} ahora es ${CLUB_ROLE_LABELS[role]}.`)
                onClose()
              },
            },
          )
        }}
      >
        {change.isError && <Notice>{teamErrorMessage(change.error)}</Notice>}
        <p className="text-sm text-gray-600">
          Rol de <strong>{name}</strong> en el club. El cambio aplica en cuanto la persona recargue el panel.
        </p>
        <select
          aria-label="Rol"
          value={role}
          onChange={(e) => setRole(e.target.value as InvitableRole)}
          className={inputClass}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {CLUB_ROLE_LABELS[r]}
            </option>
          ))}
        </select>
        <DialogActions
          busy={change.isPending}
          busyLabel="Guardando..."
          confirmLabel="Guardar"
          disabled={role === current}
          onCancel={onClose}
        />
      </form>
    </Dialog>
  )
}

export function RemoveMemberDialog({
  clubId,
  member,
  onClose,
  onDone,
}: {
  clubId: string
  member: TeamMember
  onClose: () => void
  onDone: (message: string) => void
}) {
  const remove = useRemoveMember(clubId)
  const name = personName(member)

  return (
    <Dialog title="Quitar del equipo" onClose={onClose} busy={remove.isPending}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          remove.mutate(member.user_id, {
            onSuccess: () => {
              onDone(`${name} ya no forma parte del equipo.`)
              onClose()
            },
          })
        }}
      >
        {remove.isError && <Notice>{teamErrorMessage(remove.error)}</Notice>}
        <p className="text-sm text-gray-600">
          <strong>{name}</strong> ({CLUB_ROLE_LABELS[member.role]}) va a perder el acceso al panel de este club. Su
          cuenta de jugador no se toca. Si más adelante querés que vuelva, tenés que invitarla de nuevo.
        </p>
        <DialogActions
          busy={remove.isPending}
          busyLabel="Quitando..."
          confirmLabel="Quitar del equipo"
          danger
          onCancel={onClose}
        />
      </form>
    </Dialog>
  )
}

export function RevokeInvitationDialog({
  clubId,
  invitation,
  onClose,
  onDone,
}: {
  clubId: string
  invitation: TeamInvitation
  onClose: () => void
  onDone: (message: string) => void
}) {
  const revoke = useRevokeInvitation(clubId)

  return (
    <Dialog title="Revocar invitación" onClose={onClose} busy={revoke.isPending}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          revoke.mutate(invitation.id, {
            onSuccess: () => {
              onDone(`Revocaste la invitación de ${invitation.email}.`)
              onClose()
            },
          })
        }}
      >
        {revoke.isError && <Notice>{teamErrorMessage(revoke.error)}</Notice>}
        <p className="text-sm text-gray-600">
          El enlace enviado a <strong>{invitation.email}</strong> deja de funcionar. Podés invitar a la persona de
          nuevo cuando quieras.
        </p>
        <DialogActions
          busy={revoke.isPending}
          busyLabel="Revocando..."
          confirmLabel="Revocar invitación"
          danger
          onCancel={onClose}
        />
      </form>
    </Dialog>
  )
}
