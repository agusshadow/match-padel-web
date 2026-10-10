import type { ApiResponse, ClubStatus, Paginated, PlatformClub } from '@match-padel/types'
import { api } from '@/lib/axios'

export interface RequestsQuery {
  status: ClubStatus
  search: string
  page: number
  limit: number
}

export const requestsApi = {
  /** `GET /platform/clubs?status=` (reviewers and superadmins). */
  list: ({ status, search, page, limit }: RequestsQuery): Promise<Paginated<PlatformClub>> =>
    api
      .get<ApiResponse<PlatformClub[]>>('/platform/clubs', {
        params: { status, search: search || undefined, page, limit },
      })
      .then((r) => ({
        items: r.data.data,
        meta: r.data.meta ?? { total: r.data.data.length, page, limit, totalPages: 1 },
      })),
}
