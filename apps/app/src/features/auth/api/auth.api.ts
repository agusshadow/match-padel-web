import { api } from '../../../lib/axios'
import type { Tables } from '../../../../../packages/types/src/supabase'
import type { ApiResponse } from '../../../../../packages/types/src/api'

type User = Tables<'users'>

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  full_name: string
  username: string
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
