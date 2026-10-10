import type { ApiResponse, ClubAdminTournament } from '@match-padel/types'
import { api } from '@/lib/axios'

export const tournamentsApi = {
  list: (clubId: string) =>
    api.get<ApiResponse<ClubAdminTournament[]>>(`/club-admin/${clubId}/tournaments`).then((r) => r.data.data),
}
