import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { tournamentsApi } from '../api/tournaments.api'

export function useClubTournaments(clubId: string, page: number, limit: number) {
  return useQuery({
    queryKey: ['club-admin', clubId, 'tournaments', page, limit],
    queryFn: () => tournamentsApi.list(clubId, page, limit),
    placeholderData: keepPreviousData,
  })
}
