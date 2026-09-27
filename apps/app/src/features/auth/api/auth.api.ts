import { api } from '../../../lib/axios'
import type { Tables } from '../../../../../packages/types/src/supabase'
import type { ApiResponse } from '../../../../../packages/types/src/api'

// TODO(#45): packages/types/src/supabase.ts wasn't regenerated after the
// first_name/last_name/skill_level/preferred_hand migration. Remove this
// intersection once it is, and use Tables<'users'> directly again.
type User = Tables<'users'> &
  Pick<RegisterPayload, 'first_name' | 'last_name' | 'skill_level' | 'preferred_hand'>

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  first_name: string
  last_name: string
  username: string
  skill_level: 'beginner' | 'intermediate' | 'advanced'
  preferred_hand: 'drive' | 'backhand'
  phone?: string
}

export interface AuthResponse {
  user: User
  access_token: string
  refresh_token: string
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', payload).then((r) => r.data.data),

  login: (payload: LoginPayload) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', payload).then((r) => r.data.data),

  logout: () => api.post('/auth/logout').then((r) => r.data),

  me: () => api.get<ApiResponse<User>>('/auth/me').then((r) => r.data.data),
}
