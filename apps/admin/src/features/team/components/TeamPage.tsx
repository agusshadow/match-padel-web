import { useState } from 'react'
import type { TeamInvitation, TeamInvitationSent, TeamMember } from '@match-padel/types'
import { Notice, PageHeader, StatusBadge, formatDate, personName } from '@match-padel/ui'
import type { StatusTone } from '@match-padel/ui'
import { useAccess } from '@/features/auth'
import { getErrorMessage } from '@/lib/errors'
import { useCurrentClub } from '@/shared/club-context'
import { CLUB_ROLE_LABELS } from '@/shared/permissions'
import { useClubTeam, useResendInvitation } from '../hooks/useTeam'
import { teamErrorMessage } from '../lib/errors'
import { InviteDialog } from './InviteDialog'
import { ChangeRoleDialog, RemoveMemberDialog, RevokeInvitationDialog } from './MemberDialogs'

type Feedback = { tone: 'success' | 'warning'; text: string }

const ROLE_TONES: Record<TeamMember['role'], StatusTone> = { owner: 'purple', admin: 'blue', staff: 'gray' }

const th = 'text-left px-4 py-3 font-medium text-gray-600'

function sentFeedback(invitation: TeamInvitationSent, verb: 'creada' | 'reenviada'): Feedback {
  if (invitation.email_sent) {
    return { tone: 'success', text: `Invitación ${verb}: enviamos el email a ${invitation.email}.` }
  }
  return {
    tone: 'warning',
    text: `La invitación para ${invitation.email} quedó ${verb}, pero el email no se pudo entregar. Probá con "Reenviar" en un rato o avisale a la persona por otro medio.`,
  }
}

/** Team of the club (`/:clubId/team`): the owner manages it, administrators only read it. */
export function TeamPage() {
  const club = useCurrentClub()
  const { data: access } = useAccess(true)
  const team = useClubTeam(club.clubId)
  const resend = useResendInvitation(club.clubId)

  // The API only lets the owner (and a superadmin) write; administrators get a read-only list.
  const canWrite = club.role === 'owner' || club.role === 'superadmin'
  const myUserId = access?.user.id

  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [inviting, setInviting] = useState(false)
  const [roleTarget, setRoleTarget] = useState<TeamMember | null>(null)
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<TeamInvitation | null>(null)

  const members = team.data?.members ?? []
  const invitations = team.data?.invitations ?? []
  const done = (text: string) => setFeedback({ tone: 'success', text })

  const onResend = (invitation: TeamInvitation) => {
    setFeedback(null)
    resend.mutate(invitation.id, {
      onSuccess: (sent) => setFeedback(sentFeedback(sent, 'reenviada')),
      onError: (error) => setFeedback({ tone: 'warning', text: teamErrorMessage(error) }),
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipo"
        subtitle={
          canWrite
            ? 'Quiénes pueden entrar al panel de este club y con qué rol.'
            : 'Quiénes pueden entrar al panel de este club. Solo el dueño puede modificar el equipo.'
        }
        actions={
          canWrite ? (
            <button
              onClick={() => {
                setFeedback(null)
                setInviting(true)
              }}
              className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700"
            >
              Invitar persona
            </button>
          ) : undefined
        }
      />

      {feedback && <Notice tone={feedback.tone}>{feedback.text}</Notice>}
      {team.isError && <Notice>{getErrorMessage(team.error)}</Notice>}

      <section aria-labelledby="team-members" className="space-y-2">
        <h2 id="team-members" className="text-sm font-semibold text-gray-700">
          Miembros ({members.length})
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {team.isLoading ? (
            <div className="p-8 text-center text-gray-400">Cargando...</div>
          ) : members.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Sin miembros</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className={th}>Nombre</th>
                    <th className={th}>Email</th>
                    <th className={th}>Rol</th>
                    <th className={th}>Desde</th>
                    {canWrite && <th className="px-4 py-3"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {members.map((m) => {
                    const isSelf = m.user_id === myUserId
                    const editable = canWrite && m.role !== 'owner' && !isSelf
                    return (
                      <tr key={m.user_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">
                            {personName(m)}
                            {isSelf && <span className="ml-2 text-xs font-normal text-gray-400">(vos)</span>}
                          </p>
                          {m.username && <p className="text-xs text-gray-400">@{m.username}</p>}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{m.email ?? '-'}</td>
                        <td className="px-4 py-3">
                          <StatusBadge label={CLUB_ROLE_LABELS[m.role]} tone={ROLE_TONES[m.role]} />
                        </td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(m.created_at)}</td>
                        {canWrite && (
                          <td className="px-4 py-3">
                            {editable && (
                              <div className="flex gap-1 justify-end">
                                <button
                                  onClick={() => {
                                    setFeedback(null)
                                    setRoleTarget(m)
                                  }}
                                  className="text-xs px-2 py-1 rounded text-green-700 hover:bg-green-50"
                                >
                                  Cambiar rol
                                </button>
                                <button
                                  onClick={() => {
                                    setFeedback(null)
                                    setRemoveTarget(m)
                                  }}
                                  className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                                >
                                  Quitar
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="team-invitations" className="space-y-2">
        <h2 id="team-invitations" className="text-sm font-semibold text-gray-700">
          Invitaciones ({invitations.length})
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {team.isLoading ? (
            <div className="p-8 text-center text-gray-400">Cargando...</div>
          ) : invitations.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No hay invitaciones pendientes ni vencidas</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className={th}>Email</th>
                    <th className={th}>Rol</th>
                    <th className={th}>Estado</th>
                    <th className={th}>Enviada</th>
                    <th className={th}>Vence</th>
                    {canWrite && <th className="px-4 py-3"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invitations.map((inv) => {
                    const expired = inv.status === 'expired'
                    const resending = resend.isPending && resend.variables === inv.id
                    return (
                      <tr key={inv.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{inv.email}</td>
                        <td className="px-4 py-3 text-gray-600">{CLUB_ROLE_LABELS[inv.role]}</td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            label={expired ? 'Vencida' : 'Pendiente'}
                            tone={expired ? 'orange' : 'yellow'}
                          />
                        </td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(inv.created_at)}</td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(inv.expires_at)}</td>
                        {canWrite && (
                          <td className="px-4 py-3">
                            <div className="flex gap-1 justify-end">
                              <button
                                disabled={resend.isPending}
                                onClick={() => onResend(inv)}
                                className="text-xs px-2 py-1 rounded text-green-700 hover:bg-green-50 disabled:opacity-50"
                              >
                                {resending ? 'Reenviando...' : 'Reenviar'}
                              </button>
                              <button
                                onClick={() => {
                                  setFeedback(null)
                                  setRevokeTarget(inv)
                                }}
                                className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                              >
                                Revocar
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Las invitaciones vencen a los 7 días. Al reenviar una, el enlace anterior deja de funcionar.
        </p>
      </section>

      {inviting && (
        <InviteDialog
          clubId={club.clubId}
          onClose={() => setInviting(false)}
          onSent={(invitation) => setFeedback(sentFeedback(invitation, 'creada'))}
        />
      )}
      {roleTarget && (
        <ChangeRoleDialog clubId={club.clubId} member={roleTarget} onClose={() => setRoleTarget(null)} onDone={done} />
      )}
      {removeTarget && (
        <RemoveMemberDialog
          clubId={club.clubId}
          member={removeTarget}
          onClose={() => setRemoveTarget(null)}
          onDone={done}
        />
      )}
      {revokeTarget && (
        <RevokeInvitationDialog
          clubId={club.clubId}
          invitation={revokeTarget}
          onClose={() => setRevokeTarget(null)}
          onDone={done}
        />
      )}
    </div>
  )
}
