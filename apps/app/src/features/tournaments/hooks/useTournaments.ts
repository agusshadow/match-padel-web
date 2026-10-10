import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tournamentService } from '../services/tournamentService'

export function useTournaments(status?: string) {
  return useQuery({
    queryKey: ['tournaments', status],
    queryFn: () => tournamentService.list(status ? { status } : undefined),
    staleTime: 30_000,
  })
}

/**
 * `pollMs`: refetch interval while a payment is being confirmed by the webhook (the returning
 * player may arrive before it ran).
 */
export function useTournament(id: string | undefined, options: { pollMs?: number | false } = {}) {
  return useQuery({
    queryKey: ['tournaments', id],
    queryFn: () => tournamentService.getById(id!),
    enabled: !!id,
    staleTime: 30_000,
    refetchInterval: options.pollMs || false,
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
      queryClient.invalidateQueries({ queryKey: ['tournaments'] })
    },
  })
}
