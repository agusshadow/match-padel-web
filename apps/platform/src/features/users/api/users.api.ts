import type { ApiResponse, Paginated, PlatformUser } from '@match-padel/types'
import { api } from '@/lib/axios'

export interface UsersQuery {
  search: string
  page: number
  limit: number
}

export const usersApi = {
  list: ({ search, page, limit }: UsersQuery): Promise<Paginated<PlatformUser>> =>
    api
      .get<ApiResponse<PlatformUser[]>>('/platform/users', {
        params: { search: search || undefined, page, limit },
      })
      .then((r) => ({
        items: r.data.data,
        meta: r.data.meta ?? { total: r.data.data.length, page, limit, totalPages: 1 },
      })),
}
