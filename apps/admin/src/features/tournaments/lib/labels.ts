import type { TournamentFormat, TournamentMatchStage, TournamentStatus, TournamentTeamStatus } from '@match-padel/types'
import type { StatusTone } from '@match-padel/ui'
import { getErrorCode, getErrorDetails, getErrorMessage, getErrorProblems } from '@/lib/errors'

export const STATUS: Record<TournamentStatus, { label: string; tone: StatusTone }> = {
  draft: { label: 'Borrador', tone: 'gray' },
  open: { label: 'Abierto', tone: 'green' },
  in_progress: { label: 'En curso', tone: 'blue' },
  completed: { label: 'Finalizado', tone: 'purple' },
  cancelled: { label: 'Cancelado', tone: 'red' },
}

export const STATUS_FILTERS: Array<{ value: TournamentStatus | ''; label: string }> = [
  { value: '', label: 'Todos' },
  { value: 'draft', label: 'Borradores' },
  { value: 'open', label: 'Abiertos' },
  { value: 'in_progress', label: 'En curso' },
  { value: 'completed', label: 'Finalizados' },
  { value: 'cancelled', label: 'Cancelados' },
]

export const TEAM_STATUS: Record<TournamentTeamStatus, { label: string; tone: StatusTone }> = {
  pending_payment: { label: 'Pago pendiente', tone: 'yellow' },
  confirmed: { label: 'Confirmada', tone: 'green' },
}

export const FORMAT_INFO: Record<
  TournamentFormat,
  { label: string; summary: string; detail: string; sizeUnit: 'parejas' | 'jugadores' }
> = {
  round_robin: {
    label: 'Todos contra todos',
    summary: 'Cada pareja juega contra todas las demás, una vez.',
    detail:
      'Se arma una tabla: 3 puntos por victoria. Termina cuando se juegan todos los partidos y gana quien más puntos suma. Ideal para pocas parejas (4 a 8) y para que todos jueguen la misma cantidad de partidos.',
    sizeUnit: 'parejas',
  },
  single_elimination: {
    label: 'Eliminación simple',
    summary: 'Llave de partidos: el que pierde queda afuera.',
    detail:
      'Se arma una llave con los mejores cabezas de serie separados. Si la cantidad de parejas no completa la llave, las mejores pasan la primera ronda sin jugar (bye). Es el formato más corto: una pareja juega como mucho log2(parejas) partidos.',
    sizeUnit: 'parejas',
  },
  double_elimination: {
    label: 'Doble eliminación',
    summary: 'Hay que perder dos veces para quedar afuera.',
    detail:
      'Hay una llave de ganadores y otra de perdedores: quien pierde en la primera cae a la segunda y sigue compitiendo. Los campeones de cada llave juegan una única gran final (sin revancha). Se juegan más partidos que en eliminación simple. Necesita al menos 3 parejas.',
    sizeUnit: 'parejas',
  },
  americano: {
    label: 'Americano',
    summary: 'Individual: cada ronda cambia de compañero.',
    detail:
      'Los jugadores se inscriben de a dos, pero se juega de a cuatro por cancha y cada jugador rota de compañero en cada ronda. Cada partido suma puntos individuales y gana quien más acumula. Se dimensiona por cantidad de jugadores (par).',
    sizeUnit: 'jugadores',
  },
}

export const STAGE_LABELS: Record<TournamentMatchStage, string> = {
  group: 'Todos contra todos',
  main: 'Llave',
  winners: 'Ganadores',
  losers: 'Perdedores',
  grand_final: 'Gran final',
  americano: 'Americano',
}

/** Messages of the codes of the club tournament routes; `null` means "use the API message". */
const ERROR_TEXT: Record<string, string> = {
  CLUB_NOT_APPROVED: 'El club tiene que estar aprobado y activo para gestionar torneos.',
  CLUB_PAYMENTS_NOT_ENABLED:
    'El club todavía no puede cobrar online: para un torneo con inscripción paga necesita la cuenta de Mercado Pago vinculada.',
  TOURNAMENT_HAS_REGISTRATIONS:
    'Ya hay inscripciones: el formato, el tamaño, la inscripción y los límites de nivel ya no se pueden cambiar.',
  INVALID_STATUS: 'El torneo cambió de estado mientras trabajabas. Recargá la pantalla.',
  INVALID_DATES: 'Las fechas ya pasaron o no son consistentes. Revisalas antes de publicar.',
  NOT_ENOUGH_TEAMS: 'Todavía no hay suficientes inscripciones confirmadas para empezar.',
  MATCH_NOT_READY: 'Este partido todavía no tiene sus dos equipos definidos.',
  WINNER_REQUIRED: 'El marcador está empatado: indicá quién pasa.',
  WINNER_MISMATCH: 'El ganador elegido contradice el marcador.',
}

export function tournamentErrorCode(error: unknown): string | undefined {
  return getErrorCode(error)
}

/** Text for a failed tournament request: translated for known codes, API message otherwise. */
export function tournamentErrorMessage(error: unknown): string {
  const code = getErrorCode(error)
  if (code === 'NOT_ENOUGH_TEAMS') {
    const d = getErrorDetails(error) as { minimum?: number; confirmed?: number } | undefined
    if (d && typeof d.minimum === 'number' && typeof d.confirmed === 'number') {
      return `Hacen falta al menos ${d.minimum} inscripciones confirmadas para empezar y hay ${d.confirmed}.`
    }
  }
  if (code && ERROR_TEXT[code]) return ERROR_TEXT[code]
  const problems = getErrorProblems(error)
  const message = getErrorMessage(error)
  return problems.length > 0 ? `${message}: ${problems.join(' · ')}` : message
}

/** Match ids of a 409 `RESULT_LOCKED` (`details.match_ids`). */
export function lockedMatchIds(error: unknown): string[] | null {
  if (getErrorCode(error) !== 'RESULT_LOCKED') return null
  const d = getErrorDetails(error)
  if (d && typeof d === 'object' && 'match_ids' in d && Array.isArray(d.match_ids)) {
    return d.match_ids.filter((x): x is string => typeof x === 'string')
  }
  return []
}
