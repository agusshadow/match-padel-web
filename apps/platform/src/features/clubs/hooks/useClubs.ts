import { useEffect, useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { PlatformClubCreate } from '@match-padel/types'
import { clubsApi, type ClubsQuery } from '../api/clubs.api'

export const CLUBS_QUERY_KEY = ['platform', 'clubs'] as const

export function useClubs(query: ClubsQuery) {
  return useQuery({
    queryKey: [...CLUBS_QUERY_KEY, query],
    queryFn: () => clubsApi.list(query),
    placeholderData: keepPreviousData,
  })
}

export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])
  return debounced
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
