import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ClubRefundPolicyUpdate } from '@match-padel/types'
import { refundPolicyApi } from '../api/refund-policy.api'

export const refundPolicyKey = (clubId: string) => ['club-admin', clubId, 'refund-policy'] as const

export function useRefundPolicy(clubId: string) {
  return useQuery({ queryKey: refundPolicyKey(clubId), queryFn: () => refundPolicyApi.get(clubId) })
}

export function useUpdateRefundPolicy(clubId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: ClubRefundPolicyUpdate) => refundPolicyApi.update(clubId, body),
    onSuccess: (data) => queryClient.setQueryData(refundPolicyKey(clubId), data),
  })
}
