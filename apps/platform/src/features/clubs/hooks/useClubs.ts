import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { PlatformClubCreate } from '@match-padel/types'
import { clubsApi } from '../api/clubs.api'

export const CLUBS_QUERY_KEY = ['platform', 'clubs'] as const

export function useClubs() {
  return useQuery({ queryKey: CLUBS_QUERY_KEY, queryFn: clubsApi.list })
}

export function useCreateClub() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: PlatformClubCreate) => clubsApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLUBS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['platform', 'summary'] })
    },
  })
}

export function useSetClubActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => clubsApi.setActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLUBS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['platform', 'summary'] })
    },
  })
}
