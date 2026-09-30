import { api } from '../../../lib/axios'
import type { Tables } from '../../../../../../packages/types/src/supabase'

type Match = Tables<'matches'>
type User = Tables<'users'>

export interface MatchPlayer {
  id: string
  team: number
  user_id: string
  joined_at: string
  users: Pick<User, 'id' | 'username' | 'full_name' | 'avatar_url' | 'elo'>
}

export interface MatchWithPlayers extends Match {
  match_players: MatchPlayer[]
}

export interface CreateMatchPayload {
  type: 'friendly' | 'ranked' | 'tournament'
  is_ranked: boolean
  court_id: string
  start_time: string
  end_time: string
}

// Card #57: a match's court is split 4 ways — creating or joining a match no
// longer hands back the match itself, just a MercadoPago checkout link for
// the caller's 1/4 share. The caller only becomes a match_players row once
// the webhook confirms that payment.
export interface CheckoutPreference {
  preference_id: string
  init_point: string
  sandbox_init_point: string
}

export interface CreateMatchResponse {
  match: Match
  payment: CheckoutPreference
}

export interface ScorePayload {
  score_team1: number[]
  score_team2: number[]
}

export const matchService = {
  getMyMatches: (params?: { status?: string; type?: string; page?: number }) =>
    api
      .get<{ success: boolean; data: MatchWithPlayers[] }>('/matches', { params })
      .then((r) => r.data.data),

  getMatch: (id: string) =>
    api
      .get<{ success: boolean; data: MatchWithPlayers }>(`/matches/${id}`)
      .then((r) => r.data.data),

  createMatch: (payload: CreateMatchPayload) =>
    api
      .post<{ success: boolean; data: CreateMatchResponse }>('/matches', payload)
      .then((r) => r.data.data),

  joinByLobbyUrl: (lobbyUrl: string) =>
    api
      .post<{ success: boolean; data: CheckoutPreference }>(`/matches/join/${lobbyUrl}`)
      .then((r) => r.data.data),

  submitScore: (id: string, score: ScorePayload) =>
    api
      .put<{ success: boolean; data: Match }>(`/matches/${id}/score`, score)
      .then((r) => r.data.data),

  cancelMatch: (id: string) =>
    api
      .delete<{ success: boolean; data: Match }>(`/matches/${id}`)
      .then((r) => r.data.data),
}
