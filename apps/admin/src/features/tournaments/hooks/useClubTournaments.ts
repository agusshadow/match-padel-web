import { useQuery } from '@tanstack/react-query'
import { tournamentsApi } from '../api/tournaments.api'

export function useClubTournaments(clubId: string) {
  return useQuery({
    queryKey: ['club-admin', clubId, 'tournaments'],
    queryFn: () => tournamentsApi.list(clubId),
  })
}
