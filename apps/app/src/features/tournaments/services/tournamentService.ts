import { api } from '../../../lib/axios'
import type {
  TournamentFormat,
  TournamentMatchStage,
  TournamentMatchStatus,
  TournamentRegistrationResult,
  TournamentWithdrawResult,
} from '../../../../../../packages/types/src/api'

/** Confirmed registration as the public detail lists it. */
export interface TournamentTeam {
  id: string
  name: string | null
  seed?: number | null
  status?: string
  registered_at: string
  player1: { id: string; username: string; full_name: string; elo: number }
  player2: { id: string; username: string; full_name: string; elo: number }
}

/** Match of the public detail: sides are `null` until decided (byes, later rounds). */
export interface TournamentMatch {
  id: string
  stage: TournamentMatchStage
  round: number
  position: number
  status: TournamentMatchStatus
  scheduled_at: string | null
  /** Games per set; americano: a single entry. */
  score_team1: number[] | null
  score_team2: number[] | null
  /** Americano: ids of the two players of each side. */
  team1_players: string[] | null
  team2_players: string[] | null
  team1: { id: string; name: string | null } | null
  team2: { id: string; name: string | null } | null
  winner_team: { id: string; name: string | null } | null
}

export interface Tournament {
  id: string
  name: string
  description: string | null
  format: TournamentFormat
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  max_teams: number
  entry_fee: number | null
  prize_pool: number | null
  rules: Record<string, unknown> | null
  start_date: string
  end_date: string | null
  registration_deadline?: string | null
  cancel_reason?: string | null
  created_at: string
  updated_at?: string
  teams_count?: number
  club?: { id?: string; name: string; city: string; address?: string } | null
  tournament_teams?: TournamentTeam[]
  tournament_matches?: TournamentMatch[]
}

export const tournamentService = {
  list: (params?: { status?: string; page?: number; limit?: number }) =>
    api
      .get<{ success: boolean; data: Tournament[]; meta: { total: number } }>('/tournaments', { params })
      .then((r) => r.data),

  getById: (id: string) =>
    api.get<{ success: boolean; data: Tournament }>(`/tournaments/${id}`).then((r) => r.data.data),

  /**
   * Register my pair. With an entry fee the answer carries `payment` (Checkout Pro preference) and the
   * team stays `pending_payment` until the webhook confirms it.
   */
  registerTeam: (tournamentId: string, payload: { partner_id: string; team_name?: string }) =>
    api
      .post<{ success: boolean; data: TournamentRegistrationResult }>(`/tournaments/${tournamentId}/teams`, payload)
      .then((r) => r.data.data),

  /** Withdraw my pair while the tournament is open; `refund` follows the club's policy (null when nothing was paid). */
  withdrawTeam: (tournamentId: string) =>
    api
      .delete<{ success: boolean; data: TournamentWithdrawResult }>(`/tournaments/${tournamentId}/teams/me`)
      .then((r) => r.data.data),
}
