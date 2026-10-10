import type { ApiResponse, ClubAdminMatch, Paginated } from '@match-padel/types'
import { api } from '@/lib/axios'

export const matchesApi = {
  list: (clubId: string, page: number, limit: number): Promise<Paginated<ClubAdminMatch>> =>
    api
      .get<ApiResponse<ClubAdminMatch[]>>(`/club-admin/${clubId}/matches`, { params: { page, limit } })
      .then((r) => ({
        items: r.data.data,
        meta: r.data.meta ?? { total: r.data.data.length, page, limit, totalPages: 1 },
      })),
}
