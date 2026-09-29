import { api } from '../../../lib/axios'
import type { Tables } from '../../../../../../packages/types/src/supabase'

type User = Tables<'users'>

export interface UserStats {
  total_matches: number
  wins: number
  losses: number
  elo: number
  win_rate: number
}

export interface UpdateProfilePayload {
  full_name?: string
  phone?: string
  avatar_url?: string
}

type PublicUser = Pick<User, 'id' | 'username' | 'full_name' | 'avatar_url' | 'elo' | 'created_at' | 'role'>

export interface EloHistoryEntry {
  id: string
  match_id: string
  elo_before: number
  elo_after: number
  delta: number
  created_at: string
}

export const profileService = {
  getMe: () =>
    api
      .get<{ success: boolean; data: User }>('/users/me')
      .then((r) => r.data.data),

  getMyStats: () =>
    api
      .get<{ success: boolean; data: UserStats }>('/users/me/stats')
      .then((r) => r.data.data),

  updateMe: (payload: UpdateProfilePayload) =>
    api
      .put<{ success: boolean; data: User }>('/users/me', payload)
      .then((r) => r.data.data),

  // Card #53: axios sets the multipart boundary itself when the body is a
  // FormData instance — never set Content-Type manually here.
  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return api
      .post<{ success: boolean; data: User }>('/users/me/avatar', formData)
      .then((r) => r.data.data)
  },

  getMyEloHistory: () =>
    api
      .get<{ success: boolean; data: EloHistoryEntry[] }>('/users/me/elo-history')
      .then((r) => r.data.data),

  getUserByUsername: (username: string) =>
    api
      .get<{ success: boolean; data: PublicUser }>(`/users/${username}`)
      .then((r) => r.data.data),
}
