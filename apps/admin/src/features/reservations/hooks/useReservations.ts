import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ReservationStatus } from '@match-padel/types'
import { reservationsApi, type ReservationsQuery } from '../api/reservations.api'

export function useClubReservations(clubId: string, query: ReservationsQuery) {
  return useQuery({
    queryKey: ['club-admin', clubId, 'reservations', query],
    queryFn: () => reservationsApi.list(clubId, query),
    placeholderData: keepPreviousData,
  })
}

export function useUpdateReservationStatus(clubId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Exclude<ReservationStatus, 'pending'> }) =>
      reservationsApi.updateStatus(clubId, id, status),
    onSuccess: () => {
      // The list and the dashboard counters both change.
      queryClient.invalidateQueries({ queryKey: ['club-admin', clubId, 'reservations'] })
      queryClient.invalidateQueries({ queryKey: ['club-admin', clubId, 'summary'] })
    },
  })
}
