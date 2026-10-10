import type { ApiResponse, ClubAdminSummary } from '@match-padel/types'
import { api } from '@/lib/axios'

export const dashboardApi = {
  getSummary: (clubId: string) =>
    api.get<ApiResponse<ClubAdminSummary>>(`/club-admin/${clubId}/summary`).then((r) => r.data.data),
}
