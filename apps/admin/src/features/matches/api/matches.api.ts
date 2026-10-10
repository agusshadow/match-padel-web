import type { ApiResponse, ClubAdminMatch } from '@match-padel/types'
import { api } from '@/lib/axios'

export const matchesApi = {
  list: (clubId: string) =>
    api.get<ApiResponse<ClubAdminMatch[]>>(`/club-admin/${clubId}/matches`).then((r) => r.data.data),
}
