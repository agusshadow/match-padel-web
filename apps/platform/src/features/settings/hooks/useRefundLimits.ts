import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { PlatformRefundLimitsUpdate } from '@match-padel/types'
import { settingsApi } from '../api/settings.api'

export const REFUND_LIMITS_KEY = ['platform', 'settings', 'refund-policy'] as const

export function useRefundLimits() {
  return useQuery({ queryKey: REFUND_LIMITS_KEY, queryFn: settingsApi.getRefundLimits })
}

export function useUpdateRefundLimits() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: PlatformRefundLimitsUpdate) => settingsApi.putRefundLimits(body),
    onSuccess: (data) => queryClient.setQueryData(REFUND_LIMITS_KEY, data),
  })
}
