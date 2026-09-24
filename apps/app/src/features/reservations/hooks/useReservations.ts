import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reservationService } from '../services/reservationService'
import type { CreateReservationPayload, GetReservationsParams } from '../services/reservationService'

export const RESERVATIONS_KEY = 'reservations'

export function useMyReservations(params?: GetReservationsParams) {
  return useQuery({
    queryKey: [RESERVATIONS_KEY, 'my', params],
    queryFn: () => reservationService.getMyReservations(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useReservationById(id: string) {
  return useQuery({
    queryKey: [RESERVATIONS_KEY, 'detail', id],
    queryFn: () => reservationService.getReservationById(id),
    enabled: !!id,
  })
}

export function useAvailableSlots(courtId: string | null, date: string | null) {
  return useQuery({
    queryKey: ['slots', courtId, date],
    queryFn: () => reservationService.getAvailableSlots(courtId!, date!),
    enabled: !!courtId && !!date,
    staleTime: 1000 * 30, // 30 seconds — slots change often
  })
}

export function useCreateReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateReservationPayload) =>
      reservationService.createReservation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RESERVATIONS_KEY] })
    },
  })
}

export function useCancelReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => reservationService.cancelReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RESERVATIONS_KEY] })
    },
  })
}

export function useCreatePaymentPreference() {
  return useMutation({
    mutationFn: (reservationId: string) =>
      reservationService.createPaymentPreference(reservationId),
  })
}
