import type { ApiResponse, InvitationAccepted, InvitationPreview } from '@match-padel/types'
import { api } from '@/lib/axios'

export const invitationsApi = {
  /** Public, no session needed. The API answers 404 `INVITATION_INVALID` for unknown, revoked and used tokens. */
  preview: (token: string) =>
    api
      .get<ApiResponse<InvitationPreview>>('/invitations/preview', { params: { token } })
      .then((r) => r.data.data),

  accept: (token: string) =>
    api.post<ApiResponse<InvitationAccepted>>('/me/invitations/accept', { token }).then((r) => r.data.data),
}
