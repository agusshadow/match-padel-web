import type { ApiResponse, ClubAdminTournament, Paginated } from '@match-padel/types'
import { api } from '@/lib/axios'

export const tournamentsApi = {
  list: (clubId: string, page: number, limit: number): Promise<Paginated<ClubAdminTournament>> =>
    api
      .get<ApiResponse<ClubAdminTournament[]>>(`/club-admin/${clubId}/tournaments`, { params: { page, limit } })
      .then((r) => ({
        items: r.data.data,
        meta: r.data.meta ?? { total: r.data.data.length, page, limit, totalPages: 1 },
      })),
}
