import type {
  ApiResponse,
  ClubTeam,
  InvitableRole,
  TeamInvitation,
  TeamInvitationCreate,
  TeamInvitationSent,
  TeamMember,
} from '@match-padel/types'
import { api } from '@/lib/axios'

const base = (clubId: string) => `/club-admin/${clubId}/team`

export const teamApi = {
  get: (clubId: string) => api.get<ApiResponse<ClubTeam>>(base(clubId)).then((r) => r.data.data),

  invite: (clubId: string, body: TeamInvitationCreate) =>
    api.post<ApiResponse<TeamInvitationSent>>(`${base(clubId)}/invitations`, body).then((r) => r.data.data),

  resend: (clubId: string, invitationId: string) =>
    api
      .post<ApiResponse<TeamInvitationSent>>(`${base(clubId)}/invitations/${invitationId}/resend`)
      .then((r) => r.data.data),

  revoke: (clubId: string, invitationId: string) =>
    api.delete<ApiResponse<TeamInvitation>>(`${base(clubId)}/invitations/${invitationId}`).then((r) => r.data.data),

  changeRole: (clubId: string, userId: string, role: InvitableRole) =>
    api.patch<ApiResponse<TeamMember>>(`${base(clubId)}/members/${userId}`, { role }).then((r) => r.data.data),

  removeMember: (clubId: string, userId: string) =>
    api.delete<ApiResponse<{ user_id: string }>>(`${base(clubId)}/members/${userId}`).then((r) => r.data.data),
}
