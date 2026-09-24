import { api } from '../../../lib/axios'

export interface TournamentTeam {
  id: string
  name: string | null
  registered_at: string
  player1: { id: string; username: string; full_name: string; elo: number }
  player2: { id: string; username: string; full_name: string; elo: number }
}

export interface TournamentMatch {
  id: string
  round: number
  status: string
  scheduled_at: string | null
  score_team1: number | null
  score_team2: number | null
  team1: { id: string; name: string | null }
  team2: { id: string; name: string | null }
  winner_team: { id: string; name: string | null } | null
}

export interface Tournament {
  id: string
  name: string
  description: string | null
  format: 'round_robin' | 'single_elimination' | 'double_elimination' | 'americano'
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  max_teams: number
  entry_fee: number | null
  prize_pool: number | null
  rules: Record<string, unknown> | null
  start_date: string
  end_date: string | null
  created_at: string
  updated_at?: string
  created_by?: string
  teams_count?: number
  club?: { id?: string; name: string; city: string; address?: string } | null
  creator?: { id?: string; username: string; full_name: string } | null
  tournament_teams?: TournamentTeam[]
  tournament_matches?: TournamentMatch[]
}

export interface CreateTournamentPayload {
  name: string
  description?: string
  club_id?: string
  format: 'round_robin' | 'single_elimination' | 'double_elimination' | 'americano'
  max_teams: number
  entry_fee?: number
  prize_pool?: number
  rules?: Record<string, unknown>
  start_date: string
  end_date?: string
}

export const tournamentService = {
  list: (params?: { status?: string; page?: number; limit?: number }) =>
    api
      .get<{ success: boolean; data: Tournament[]; meta: { total: number } }>('/tournaments', { params })
      .then((r) => r.data),

  getById: (id: string) =>
    api
      .get<{ success: boolean; data: Tournament }>(`/tournaments/${id}`)
      .then((r) => r.data.data),

  create: (payload: CreateTournamentPayload) =>
    api
      .post<{ success: boolean; data: Tournament }>('/tournaments', payload)
      .then((r) => r.data.data),

  registerTeam: (tournamentId: string, payload: { partner_id: string; team_name?: string }) =>
    api
      .post<{ success: boolean; data: TournamentTeam }>(`/tournaments/${tournamentId}/teams`, payload)
      .then((r) => r.data.data),

  withdrawTeam: (tournamentId: string) =>
    api
      .delete<{ success: boolean; data: { success: boolean } }>(`/tournaments/${tournamentId}/teams/me`)
      .then((r) => r.data),

  startTournament: (tournamentId: string) =>
    api
      .post<{ success: boolean; data: Tournament }>(`/tournaments/${tournamentId}/start`)
      .then((r) => r.data.data),
}
