import type { ApiResponse, ClubStatus, Paginated, PlatformClub, PlatformClubCreate } from '@match-padel/types'
import { api } from '@/lib/axios'

export interface ClubsQuery {
  search: string
  status: ClubStatus | ''
  page: number
  limit: number
}

export const clubsApi = {
  list: ({ search, status, page, limit }: ClubsQuery): Promise<Paginated<PlatformClub>> =>
    api
      .get<ApiResponse<PlatformClub[]>>('/platform/clubs', {
        params: { search: search || undefined, status: status || undefined, page, limit },
      })
      .then((r) => ({
        items: r.data.data,
        meta: r.data.meta ?? { total: r.data.data.length, page, limit, totalPages: 1 },
      })),

  create: (body: PlatformClubCreate) =>
    api.post<ApiResponse<PlatformClub>>('/platform/clubs', body).then((r) => r.data.data),

  setActive: (id: string, isActive: boolean) =>
    api
      .patch<ApiResponse<PlatformClub>>(`/platform/clubs/${id}/active`, { isActive })
      .then((r) => r.data.data),
}
