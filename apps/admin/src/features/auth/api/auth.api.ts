import type { ApiResponse, MeAccess } from '@match-padel/types'
import { api } from '@/lib/axios'

/** Body of `POST /auth/register`. A club owner has no playing profile, so skill and hand are omitted. */
export interface RegisterOwnerPayload {
  email: string
  password: string
  first_name: string
  last_name: string
  username: string
  phone?: string
}

export const authApi = {
  getAccess: () => api.get<ApiResponse<MeAccess>>('/me/access').then((r) => r.data.data),

  /** Creates the (unconfirmed) account and sends the email code; there is no session until it is verified. */
  register: (body: RegisterOwnerPayload) =>
    api.post<ApiResponse<{ email_verification_required: boolean }>>('/auth/register', body).then((r) => r.data.data),
}
