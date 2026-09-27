import { useQuery } from '@tanstack/react-query'
import { clubService } from '../services/clubService'
import type { GetClubsParams } from '../services/clubService'

export const CLUBS_KEY = 'clubs'

export function useClubes(params?: GetClubsParams) {
  return useQuery({
    queryKey: [CLUBS_KEY, params],
    queryFn: () => clubService.getClubes(params),
    staleTime: 1000 * 60 * 5,
  })
}

export function useClubById(id: string | null) {
  return useQuery({
    queryKey: [CLUBS_KEY, 'detail', id],
    queryFn: () => clubService.getClubById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useClubCourts(clubId: string | null) {
  return useQuery({
    queryKey: [CLUBS_KEY, 'courts', clubId],
    queryFn: () => clubService.getClubCourts(clubId!),
    enabled: !!clubId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useClubAvailability(clubId: string | null, date: string | null) {
  return useQuery({
    queryKey: [CLUBS_KEY, 'availability', clubId, date],
    queryFn: () => clubService.getClubAvailability(clubId!, date!),
    enabled: !!clubId && !!date,
    staleTime: 1000 * 30, // 30 seconds — availability changes often
  })
}
