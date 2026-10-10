import type { ApiResponse, PlatformClub, PlatformClubCreate } from '@match-padel/types'
import { api } from '@/lib/axios'

export const clubsApi = {
  list: () => api.get<ApiResponse<PlatformClub[]>>('/platform/clubs').then((r) => r.data.data),

  create: (body: PlatformClubCreate) =>
    api.post<ApiResponse<PlatformClub>>('/platform/clubs', body).then((r) => r.data.data),

  setActive: (id: string, isActive: boolean) =>
    api
      .patch<ApiResponse<PlatformClub>>(`/platform/clubs/${id}/active`, { isActive })
      .then((r) => r.data.data),
}
