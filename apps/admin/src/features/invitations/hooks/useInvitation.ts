import { useMutation, useQuery } from '@tanstack/react-query'
import { invitationsApi } from '../api/invitations.api'

export function useInvitationPreview(token: string | null) {
  return useQuery({
    queryKey: ['invitation-preview', token],
    queryFn: () => invitationsApi.preview(token as string),
    enabled: !!token,
    retry: false,
    staleTime: 1000 * 60,
  })
}

export function useAcceptInvitation() {
  return useMutation({ mutationFn: (token: string) => invitationsApi.accept(token) })
}
