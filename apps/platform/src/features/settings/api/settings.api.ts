import type { ApiResponse, PlatformRefundLimits, PlatformRefundLimitsUpdate } from '@match-padel/types'
import { api } from '@/lib/axios'

const path = '/platform/settings/refund-policy'

export const settingsApi = {
  /** `GET /platform/settings/refund-policy` (superadmin). */
  getRefundLimits: () => api.get<ApiResponse<PlatformRefundLimits>>(path).then((r) => r.data.data),

  /** `PUT /platform/settings/refund-policy` (superadmin). Never rewrites a club's stored policy. */
  putRefundLimits: (body: PlatformRefundLimitsUpdate) =>
    api.put<ApiResponse<PlatformRefundLimits>>(path, body).then((r) => r.data.data),
}
