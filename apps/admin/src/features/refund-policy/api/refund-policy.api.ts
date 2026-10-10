import type { ApiResponse, ClubRefundPolicy, ClubRefundPolicyUpdate } from '@match-padel/types'
import { api } from '@/lib/axios'

const path = (clubId: string) => `/club-admin/${clubId}/refund-policy`

export const refundPolicyApi = {
  /** `GET /club-admin/:clubId/refund-policy` (owner, administrator, reception, superadmin). */
  get: (clubId: string) => api.get<ApiResponse<ClubRefundPolicy>>(path(clubId)).then((r) => r.data.data),

  /** `PUT /club-admin/:clubId/refund-policy` (owner, administrator, superadmin); 409 `POLICY_BELOW_PLATFORM_MINIMUM` outside the limits. */
  update: (clubId: string, body: ClubRefundPolicyUpdate) =>
    api.put<ApiResponse<ClubRefundPolicy>>(path(clubId), body).then((r) => r.data.data),
}
