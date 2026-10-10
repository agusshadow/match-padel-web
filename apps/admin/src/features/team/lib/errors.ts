import type { TeamErrorCode } from '@match-padel/types'
import { getErrorCode, getErrorMessage, getErrorStatus } from '@/lib/errors'

const MESSAGES: Partial<Record<TeamErrorCode, string>> = {
  ALREADY_MEMBER: 'Esa persona ya forma parte del equipo del club.',
  INVITATION_ALREADY_PENDING: 'Ya hay una invitación pendiente para ese email. Podés reenviarla desde la lista.',
  INVITATION_LIMIT:
    'Llegaste al máximo de 50 invitaciones pendientes. Revocá alguna antes de invitar a más personas.',
  INVITATION_ALREADY_ACCEPTED:
    'Esa invitación ya fue aceptada. Para cambiarle el rol o quitarla del equipo, hacelo desde Miembros.',
  INVITATION_REVOKED: 'Esa invitación fue revocada. Creá una invitación nueva.',
  CANNOT_MODIFY_OWNER: 'El dueño del club no se puede cambiar ni quitar del equipo.',
  CANNOT_MODIFY_SELF: 'No podés modificar tu propia membresía.',
}

/** Spanish message for a team error, by API code first and by status after; falls back to the API's message. */
export function teamErrorMessage(error: unknown): string {
  const code = getErrorCode(error) as TeamErrorCode | undefined
  if (code && MESSAGES[code]) return MESSAGES[code] as string
  const status = getErrorStatus(error)
  if (status === 404) return 'Ya no existe: el equipo cambió mientras mirabas la pantalla. Actualizamos la lista.'
  if (status === 403) return 'No tenés permiso para gestionar el equipo de este club.'
  if (status === 409) return 'El equipo cambió mientras hacías esto. Actualizamos la lista, probá de nuevo.'
  if (status === 429) return 'Demasiados intentos seguidos. Esperá un momento y volvé a probar.'
  return getErrorMessage(error, 'No pudimos completar la acción. Intentá de nuevo.')
}
