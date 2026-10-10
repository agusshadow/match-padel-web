import { useQuery } from '@tanstack/react-query'
import { matchesApi } from '../api/matches.api'

export function useClubMatches(clubId: string) {
  return useQuery({
    queryKey: ['club-admin', clubId, 'matches'],
    queryFn: () => matchesApi.list(clubId),
  })
}
