import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tournamentService, CreateTournamentPayload } from '../services/tournamentService'

export function useTournaments(status?: string) {
  return useQuery({
    queryKey: ['tournaments', status],
    queryFn: () => tournamentService.list(status ? { status } : undefined),
    staleTime: 30_000,
  })
}

export function useTournament(id: string | undefined) {
  return useQuery({
    queryKey: ['tournaments', id],
    queryFn: () => tournamentService.getById(id!),
    enabled: !!id,
    staleTime: 30_000,
  })
}

export function useCreateTournament() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTournamentPayload) => tournamentService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] })
    },
  })
}

export function useRegisterTeam(tournamentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { partner_id: string; team_name?: string }) =>
      tournamentService.registerTeam(tournamentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments', tournamentId] })
    },
  })
}

export function useWithdrawTeam(tournamentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => tournamentService.withdrawTeam(tournamentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments', tournamentId] })
    },
  })
}

export function useStartTournament(tournamentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => tournamentService.startTournament(tournamentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments', tournamentId] })
      queryClient.invalidateQueries({ queryKey: ['tournaments'] })
    },
  })
}
