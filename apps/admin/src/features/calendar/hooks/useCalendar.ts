import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CourtBlocksCreate, ReservationMove, ReservationStatus } from '@match-padel/types'
import { calendarApi, type CalendarQuery } from '../api/calendar.api'

const REFRESH_MS = 60_000

export function useClubCalendar(clubId: string, query: CalendarQuery) {
  return useQuery({
    queryKey: ['club-admin', clubId, 'calendar', query],
    queryFn: () => calendarApi.get(clubId, query),
    placeholderData: keepPreviousData,
    refetchInterval: REFRESH_MS,
  })
}

/** Everything that depends on a reservation or a block: the calendar, the list and the dashboard counters. */
function useInvalidateClubData(clubId: string) {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['club-admin', clubId, 'calendar'] }),
      queryClient.invalidateQueries({ queryKey: ['club-admin', clubId, 'reservations'] }),
      queryClient.invalidateQueries({ queryKey: ['club-admin', clubId, 'summary'] }),
    ])
}

export function useMoveReservation(clubId: string) {
  const invalidate = useInvalidateClubData(clubId)
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ReservationMove }) => calendarApi.move(clubId, id, body),
    onSuccess: invalidate,
  })
}

export function useCancelReservation(clubId: string) {
  const invalidate = useInvalidateClubData(clubId)
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => calendarApi.cancel(clubId, id, reason),
    onSuccess: invalidate,
  })
}

export function useReservationStatus(clubId: string) {
  const invalidate = useInvalidateClubData(clubId)
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Extract<ReservationStatus, 'confirmed' | 'completed'> }) =>
      calendarApi.updateStatus(clubId, id, status),
    onSuccess: invalidate,
  })
}

export function useCreateBlocks(clubId: string) {
  const invalidate = useInvalidateClubData(clubId)
  return useMutation({
    mutationFn: (body: CourtBlocksCreate) => calendarApi.createBlocks(clubId, body),
    onSuccess: invalidate,
  })
}

export function useDeleteBlock(clubId: string) {
  const invalidate = useInvalidateClubData(clubId)
  return useMutation({
    mutationFn: (id: string) => calendarApi.deleteBlock(clubId, id),
    onSuccess: invalidate,
  })
}
