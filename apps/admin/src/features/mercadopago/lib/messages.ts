import type { MpAccountStatus, MpCallbackFailureReason, MpErrorCode } from '@match-padel/types'
import type { StatusTone } from '@match-padel/ui'
import { getErrorCode, getErrorMessage, getErrorStatus } from '@/lib/errors'

export const NOT_CONFIGURED_MESSAGE =
  'La conexión con Mercado Pago aún no está disponible. Contactá al equipo de Match Padel.'

/** Banner text for each `reason` the API puts in the return URL. */
export const CALLBACK_REASON_MESSAGES: Record<MpCallbackFailureReason, string> = {
  access_denied:
    'Cancelaste la autorización en Mercado Pago, así que la cuenta no quedó vinculada. Podés volver a intentarlo cuando quieras.',
  invalid_request: 'Mercado Pago devolvió una respuesta incompleta. Volvé a iniciar la vinculación desde esta pantalla.',
  invalid_state: 'El enlace de vinculación no es válido. Iniciá la vinculación de nuevo desde esta pantalla.',
  state_expired: 'La vinculación tardó más de 10 minutos y venció. Volvé a iniciarla desde esta pantalla.',
  state_used:
    'Ese enlace de vinculación ya se usó. Si la cuenta no figura como vinculada, volvé a iniciar la vinculación.',
  club_not_available:
    'El club no está disponible para vincular una cuenta: tiene que estar aprobado y activo en la plataforma.',
  not_owner: 'Solo el dueño del club puede vincular la cuenta de Mercado Pago.',
  exchange_failed:
    'Mercado Pago no confirmó la autorización y la cuenta no quedó vinculada. Probá de nuevo; si se repite, contactá al equipo de Match Padel.',
  storage_failed:
    'Autorizaste la cuenta pero no pudimos guardar la vinculación. Probá de nuevo en unos minutos; si se repite, contactá al equipo de Match Padel.',
}

export const CALLBACK_GENERIC_ERROR =
  'No pudimos completar la vinculación con Mercado Pago. Probá de nuevo; si se repite, contactá al equipo de Match Padel.'

export function isCallbackReason(value: string | null): value is MpCallbackFailureReason {
  return value !== null && value in CALLBACK_REASON_MESSAGES
}

export const ACCOUNT_STATUS_LABELS: Record<MpAccountStatus | 'none', string> = {
  none: 'Sin vincular',
  connected: 'Conectada',
  expiring: 'Por vencer',
  expired: 'Vencida',
  revoked: 'Revocada',
  error: 'Con error',
}

export const ACCOUNT_STATUS_TONES: Record<MpAccountStatus | 'none', StatusTone> = {
  none: 'gray',
  connected: 'green',
  expiring: 'yellow',
  expired: 'red',
  revoked: 'red',
  error: 'orange',
}

/** True when the API answered 503 `MP_NOT_CONFIGURED` (the environment has no Mercado Pago application). */
export function isNotConfigured(error: unknown): boolean {
  const code = getErrorCode(error) as MpErrorCode | undefined
  return code === 'MP_NOT_CONFIGURED'
}

/** Spanish message for a failed status / connect / disconnect request. */
export function mercadoPagoErrorMessage(error: unknown): string {
  if (isNotConfigured(error)) return NOT_CONFIGURED_MESSAGE
  const status = getErrorStatus(error)
  if (status === 409) return 'El club tiene que estar aprobado para vincular una cuenta de Mercado Pago.'
  if (status === 403) return 'Solo el dueño del club puede gestionar la cuenta de Mercado Pago.'
  if (status === 404) return 'No encontramos el club.'
  if (status === 429) return 'Demasiados intentos seguidos. Esperá un momento y volvé a probar.'
  return getErrorMessage(error, 'No pudimos completar la acción. Intentá de nuevo.')
}
