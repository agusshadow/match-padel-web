import axios from 'axios'
import type { TFunction } from 'i18next'
import { getApiErrorCode } from '../../../lib/booking-errors'

/** Codes of the player routes `POST /tournaments/:id/teams` and `DELETE .../teams/me` that have a translated text. */
const CODES = [
  'CLUB_PAYMENTS_NOT_ENABLED',
  'LEVEL_NOT_ALLOWED',
  'REGISTRATION_CLOSED',
  'TOURNAMENT_FULL',
  'TOURNAMENT_NOT_OPEN',
  'TOURNAMENT_ALREADY_STARTED',
  'TOURNAMENT_CANCELLED',
  'TOURNAMENT_COMPLETED',
  'INVALID_PARTNER',
  'CONFLICT',
  'NOT_REGISTERED',
] as const

/** Translated message for a failed registration or withdrawal; the API's own message, then `fallbackKey`, otherwise. */
export function tournamentErrorMessage(error: unknown, t: TFunction, fallbackKey = 'tournaments.registerError'): string {
  const code = getApiErrorCode(error)
  if (code && (CODES as readonly string[]).includes(code)) return t(`tournaments.errors.${code}`)
  if (axios.isAxiosError<{ message?: string }>(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message !== '') return message
  }
  return t(fallbackKey)
}
