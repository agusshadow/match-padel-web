import type { BlockConflict, CalendarErrorCode } from '@match-padel/types'
import { getErrorCode, getErrorDetails, getErrorMessage } from '@/lib/errors'

const MESSAGES: Record<Exclude<CalendarErrorCode, 'BLOCK_CONFLICTS'>, string> = {
  CANNOT_MOVE: 'Solo se pueden mover reservas pendientes o confirmadas que todavía no terminaron.',
  COURT_INACTIVE: 'La cancha elegida está desactivada. Elegí otra o reactivala desde Canchas.',
  OUTSIDE_SCHEDULE:
    'Ese horario no coincide con los turnos de la cancha: tiene que estar dentro de su horario y ser un turno completo.',
  COURT_CLOSED: 'La cancha está cerrada en ese día u horario por una excepción del club.',
  COURT_BLOCKED: 'La cancha está bloqueada en ese horario.',
  SLOT_TAKEN: 'Ese horario ya está ocupado por otra reserva en la cancha elegida.',
  CANNOT_CANCEL: 'La reserva ya está cancelada o completada, no se puede cancelar.',
  MATCH_COMPLETED: 'No se puede cancelar: el partido de esta reserva ya se jugó y tiene resultado.',
}

/** Spanish message for a move, cancel or status error; falls back to the API's message. */
export function calendarErrorMessage(error: unknown): string {
  const code = getErrorCode(error)
  if (code && code in MESSAGES) return MESSAGES[code as keyof typeof MESSAGES]
  if (code === 'BLOCK_CONFLICTS') return 'El bloqueo se superpone con reservas u otros bloqueos.'
  return getErrorMessage(error)
}

/** `details.conflicts` of a 409 `BLOCK_CONFLICTS`, or `null` when the error is something else. */
export function blockConflictsOf(error: unknown): BlockConflict[] | null {
  if (getErrorCode(error) !== 'BLOCK_CONFLICTS') return null
  const details = getErrorDetails(error)
  if (details && typeof details === 'object' && 'conflicts' in details && Array.isArray(details.conflicts)) {
    return details.conflicts as BlockConflict[]
  }
  return []
}
