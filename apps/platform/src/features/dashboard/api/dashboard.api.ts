import type { ApiResponse, PlatformSummary } from '@match-padel/types'
import { api } from '@/lib/axios'

export const dashboardApi = {
  getSummary: () => api.get<ApiResponse<PlatformSummary>>('/platform/summary').then((r) => r.data.data),
}
