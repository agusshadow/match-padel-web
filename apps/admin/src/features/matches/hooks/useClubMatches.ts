import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { matchesApi } from '../api/matches.api'

export function useClubMatches(clubId: string, page: number, limit: number) {
  return useQuery({
    queryKey: ['club-admin', clubId, 'matches', page, limit],
    queryFn: () => matchesApi.list(clubId, page, limit),
    placeholderData: keepPreviousData,
  })
}
