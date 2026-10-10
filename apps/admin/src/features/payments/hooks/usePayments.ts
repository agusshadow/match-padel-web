import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { paymentsApi, type PaymentsQuery } from '../api/payments.api'

export function useClubPayments(clubId: string, query: PaymentsQuery) {
  return useQuery({
    queryKey: ['club-admin', clubId, 'payments', query],
    queryFn: () => paymentsApi.list(clubId, query),
    placeholderData: keepPreviousData,
    // 403 (not the owner) will not fix itself within a retry.
    retry: false,
  })
}
