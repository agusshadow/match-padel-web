import type { ApiResponse, MeAccess } from '@match-padel/types'
import { api } from '@/lib/axios'

export const authApi = {
  getAccess: () => api.get<ApiResponse<MeAccess>>('/me/access').then((r) => r.data.data),
}
