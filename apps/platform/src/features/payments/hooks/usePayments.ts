import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { paymentsApi, type PaymentsQuery } from '../api/payments.api'

export function usePayments(query: PaymentsQuery) {
  return useQuery({
    queryKey: ['platform', 'payments', query],
    queryFn: () => paymentsApi.list(query),
    placeholderData: keepPreviousData,
  })
}

export function usePaymentClubOptions() {
  return useQuery({
    queryKey: ['platform', 'payments', 'club-options'],
    queryFn: paymentsApi.listClubs,
  })
}
