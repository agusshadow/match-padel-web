import axios from 'axios'
import type { TFunction } from 'i18next'

/** Machine code of an API error body (`{ error: CODE, message }`), if any. */
export function getApiErrorCode(error: unknown): string | undefined {
  if (!axios.isAxiosError<{ error?: unknown }>(error)) return undefined
  const code = error.response?.data?.error
  return typeof code === 'string' ? code : undefined
}

/** 409 codes the API answers when the requested range does not fit the court's schedule (card #70). */
const SCHEDULE_CODES = ['OUTSIDE_SCHEDULE', 'COURT_CLOSED'] as const

/**
 * Message for a failed reservation or match creation: a translated text for the schedule codes,
 * the API's own message for anything else, then `fallbackKey`.
 */
export function bookingErrorMessage(error: unknown, t: TFunction, fallbackKey = 'common.error'): string {
  const code = getApiErrorCode(error)
  if (code && (SCHEDULE_CODES as readonly string[]).includes(code)) return t(`reservations.errors.${code}`)
  if (axios.isAxiosError<{ message?: string }>(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message !== '') return message
  }
  return t(fallbackKey)
}
