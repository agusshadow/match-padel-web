import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { InvitableRole, TeamInvitationCreate } from '@match-padel/types'
import { teamApi } from '../api/team.api'

const teamKey = (clubId: string) => ['club-admin', clubId, 'team'] as const

export function useClubTeam(clubId: string) {
  return useQuery({ queryKey: teamKey(clubId), queryFn: () => teamApi.get(clubId) })
}

/** Every write refreshes the list (also on error: a 409 usually means it changed meanwhile). */
function useTeamMutation<TVars, TData>(clubId: string, fn: (vars: TVars) => Promise<TData>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSettled: () => queryClient.invalidateQueries({ queryKey: teamKey(clubId) }),
  })
}

export function useInvite(clubId: string) {
  return useTeamMutation(clubId, (body: TeamInvitationCreate) => teamApi.invite(clubId, body))
}

export function useResendInvitation(clubId: string) {
  return useTeamMutation(clubId, (id: string) => teamApi.resend(clubId, id))
}

export function useRevokeInvitation(clubId: string) {
  return useTeamMutation(clubId, (id: string) => teamApi.revoke(clubId, id))
}

export function useChangeMemberRole(clubId: string) {
  return useTeamMutation(clubId, ({ userId, role }: { userId: string; role: InvitableRole }) =>
    teamApi.changeRole(clubId, userId, role),
  )
}

export function useRemoveMember(clubId: string) {
  return useTeamMutation(clubId, (userId: string) => teamApi.removeMember(clubId, userId))
}
