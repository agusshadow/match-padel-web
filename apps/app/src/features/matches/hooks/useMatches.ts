import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { matchService, CreateMatchPayload, ScorePayload } from '../services/matchService'

export function useMyMatches(status?: string) {
  return useQuery({
    queryKey: ['matches', 'my', status],
    queryFn: () => matchService.getMyMatches(status ? { status } : undefined),
  })
}

export function useMatch(id: string | undefined) {
  return useQuery({
    queryKey: ['matches', id],
    queryFn: () => matchService.getMatch(id!),
    enabled: !!id,
  })
}

export function useCreateMatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateMatchPayload) => matchService.createMatch(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches', 'my'] })
    },
  })
}

export function useJoinMatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (lobbyUrl: string) => matchService.joinByLobbyUrl(lobbyUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches', 'my'] })
    },
  })
}

export function useSubmitScore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, score }: { id: string; score: ScorePayload }) =>
      matchService.submitScore(id, score),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matches', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['matches', 'my'] })
    },
  })
}

export function useAcceptScore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => matchService.acceptScore(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['matches', id] })
      queryClient.invalidateQueries({ queryKey: ['matches', 'my'] })
    },
  })
}

export function useCancelMatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => matchService.cancelMatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches', 'my'] })
    },
  })
}
