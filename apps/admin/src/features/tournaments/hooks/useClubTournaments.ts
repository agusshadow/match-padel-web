import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  ClubTournamentCreate,
  ClubTournamentStart,
  ClubTournamentUpdate,
  TournamentResultInput,
  TournamentStatus,
} from '@match-padel/types'
import { tournamentsApi } from '../api/tournaments.api'

/** Prefix of every tournament query of a club: invalidating it refreshes lists and details. */
const root = (clubId: string) => ['club-admin', clubId, 'tournaments'] as const
const detailKey = (clubId: string, id: string) => [...root(clubId), 'detail', id] as const

export function useClubTournaments(
  clubId: string,
  params: { page: number; limit: number; status?: TournamentStatus },
) {
  return useQuery({
    queryKey: [...root(clubId), 'list', params],
    queryFn: () => tournamentsApi.list(clubId, params),
    placeholderData: keepPreviousData,
  })
}

export function useClubTournament(clubId: string, id: string | undefined) {
  return useQuery({
    queryKey: detailKey(clubId, id ?? ''),
    queryFn: () => tournamentsApi.get(clubId, id as string),
    enabled: !!id,
  })
}

function useRefresh(clubId: string) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: root(clubId) })
}

export function useCreateTournament(clubId: string) {
  const refresh = useRefresh(clubId)
  return useMutation({
    mutationFn: (body: ClubTournamentCreate) => tournamentsApi.create(clubId, body),
    onSuccess: refresh,
  })
}

export function useUpdateTournament(clubId: string, id: string) {
  const refresh = useRefresh(clubId)
  return useMutation({
    mutationFn: (body: ClubTournamentUpdate) => tournamentsApi.update(clubId, id, body),
    onSuccess: refresh,
  })
}

export function usePublishTournament(clubId: string, id: string) {
  const refresh = useRefresh(clubId)
  return useMutation({ mutationFn: () => tournamentsApi.publish(clubId, id), onSuccess: refresh })
}

export function useCancelTournament(clubId: string, id: string) {
  const refresh = useRefresh(clubId)
  return useMutation({
    mutationFn: (reason?: string) => tournamentsApi.cancel(clubId, id, reason),
    onSuccess: refresh,
  })
}

export function useStartTournament(clubId: string, id: string) {
  const refresh = useRefresh(clubId)
  return useMutation({
    mutationFn: (body: ClubTournamentStart) => tournamentsApi.start(clubId, id, body),
    onSuccess: refresh,
  })
}

export function useRecordResult(clubId: string, id: string) {
  const refresh = useRefresh(clubId)
  return useMutation({
    mutationFn: ({ matchId, body }: { matchId: string; body: TournamentResultInput }) =>
      tournamentsApi.recordResult(clubId, id, matchId, body),
    onSuccess: refresh,
  })
}
