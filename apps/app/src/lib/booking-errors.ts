import axios from 'axios'
import type { TFunction } from 'i18next'

/** Machine code of an API error body (`{ error: CODE, message }`), if any. */
export function getApiErrorCode(error: unknown): string | undefined {
  if (!axios.isAxiosError<{ error?: unknown }>(error)) return undefined
  const code = error.response?.data?.error
  return typeof code === 'string' ? code : undefined
}

/**
 * 409 of `POST /reservations`, `POST /matches` and `POST /payments/preference` when the club collects on
 * its own Mercado Pago account and has no usable link (card #75).
 */
export const CLUB_PAYMENTS_NOT_ENABLED = 'CLUB_PAYMENTS_NOT_ENABLED'

/** 409 codes the API answers when the requested range does not fit the court's schedule (card #70). */
const SCHEDULE_CODES = ['OUTSIDE_SCHEDULE', 'COURT_CLOSED', CLUB_PAYMENTS_NOT_ENABLED] as const

/**
 * Message for a failed reservation or match creation: a translated text for the schedule codes,
 * the API's own message for anything else, then `fallbackKey`.
 */
export function bookingErrorMessage(error: unknown, t: TFunction, fallbackKey = 'common.error'): string {
  const code = getApiErrorCode(error)
  // Translated texts first: the API's own message for these codes is Spanish only.
  if (code && (SCHEDULE_CODES as readonly string[]).includes(code)) return t(`reservations.errors.${code}`)
  if (axios.isAxiosError<{ message?: string }>(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message !== '') return message
  }
  return t(fallbackKey)
}

/** Message for a failed start of a payment: the translated text for a club that cannot charge, else `fallbackKey`. */
export function paymentErrorMessage(error: unknown, t: TFunction, fallbackKey = 'reservations.paymentStartError'): string {
  if (getApiErrorCode(error) === CLUB_PAYMENTS_NOT_ENABLED) return t(`reservations.errors.${CLUB_PAYMENTS_NOT_ENABLED}`)
  return t(fallbackKey)
}
