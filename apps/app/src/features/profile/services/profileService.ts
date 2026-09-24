import { api } from '../../../lib/axios'
import type { Tables } from '../../../../../packages/types/src/supabase'

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

  getUserByUsername: (username: string) =>
    api
      .get<{ success: boolean; data: PublicUser }>(`/users/${username}`)
      .then((r) => r.data.data),
}
