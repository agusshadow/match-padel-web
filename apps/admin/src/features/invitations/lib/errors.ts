import type { TeamErrorCode } from '@match-padel/types'
import { getErrorCode, getErrorMessage, getErrorStatus } from '@/lib/errors'

export type AcceptFailure =
  | { kind: 'invalid'; message: string }
  | { kind: 'expired'; message: string }
  | { kind: 'email_mismatch'; message: string }
  | { kind: 'email_not_confirmed'; message: string }
  | { kind: 'other'; message: string }

const CODES: Partial<Record<TeamErrorCode, AcceptFailure>> = {
  INVITATION_INVALID: {
    kind: 'invalid',
    message: 'Esta invitación ya no es válida: pudo haber sido revocada o usada por otra persona. Pedile al dueño del club que te envíe una nueva.',
  },
  INVITATION_EMAIL_MISMATCH: {
    kind: 'email_mismatch',
    message: 'La invitación se envió a otra dirección de email que la de tu cuenta.',
  },
  EMAIL_NOT_CONFIRMED: {
    kind: 'email_not_confirmed',
    message: 'Todavía no confirmaste tu email. Confirmalo con el código que te enviamos y volvé a aceptar.',
  },
  INVITATION_EXPIRED: {
    kind: 'expired',
    message: 'La invitación venció. Pedile al dueño del club que te la reenvíe.',
  },
}

/** Classifies an error of `POST /me/invitations/accept` (or of the preview) into a state the page can render. */
export function classifyInvitationError(error: unknown): AcceptFailure {
  const code = getErrorCode(error) as TeamErrorCode | undefined
  if (code && CODES[code]) return CODES[code] as AcceptFailure
  if (getErrorStatus(error) === 429) {
    return { kind: 'other', message: 'Demasiados intentos seguidos. Esperá un momento y volvé a probar.' }
  }
  return { kind: 'other', message: getErrorMessage(error, 'No pudimos procesar la invitación. Intentá de nuevo.') }
}

/** `maria.lopez@gmail.com` -> `m***@gmail.com`, the same masking the API uses for `email_hint`. */
export function maskEmail(email: string): string {
  const at = email.lastIndexOf('@')
  if (at <= 0) return '***'
  return `${email.slice(0, 1)}***@${email.slice(at + 1)}`
}
