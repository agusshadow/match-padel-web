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
