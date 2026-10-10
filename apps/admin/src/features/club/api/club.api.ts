import type { ApiResponse, ClubAdminClub, ClubAdminClubUpdate } from '@match-padel/types'
import { api } from '@/lib/axios'

export const clubApi = {
  get: (clubId: string) =>
    api.get<ApiResponse<ClubAdminClub>>(`/club-admin/${clubId}`).then((r) => r.data.data),

  update: (clubId: string, body: ClubAdminClubUpdate) =>
    api.patch<ApiResponse<ClubAdminClub>>(`/club-admin/${clubId}`, body).then((r) => r.data.data),
}
