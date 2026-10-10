import type { ApiResponse, ClubAdminClub, MyClubCreate } from '@match-padel/types'
import { api } from '@/lib/axios'

export const myClubsApi = {
  /** `POST /me/clubs`: creates a club in `draft` owned by the caller (201, or 200 for an identical draft). */
  create: (body: MyClubCreate) => api.post<ApiResponse<ClubAdminClub>>('/me/clubs', body).then((r) => r.data.data),
}
