import { useEffect, useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ClubCollectionModeUpdate, ClubCommissionUpdate, PlatformClubCreate } from '@match-padel/types'
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

/** Suspends (`reason` required) or reactivates (`note` optional) an approved/suspended club. */
export function useClubLifecycle() {
  const queryClient = useQueryClient()
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: CLUBS_QUERY_KEY })
    queryClient.invalidateQueries({ queryKey: ['platform', 'requests'] })
    queryClient.invalidateQueries({ queryKey: ['platform', 'summary'] })
    queryClient.invalidateQueries({ queryKey: ['platform', 'audit-log'] })
  }
  return useMutation({
    mutationFn: ({ action, id, text }: { action: 'suspend' | 'unsuspend'; id: string; text: string | undefined }) =>
      action === 'suspend' ? clubsApi.suspend(id, text ?? '') : clubsApi.unsuspend(id, text),
    onSuccess: refresh,
    // 409: the status changed meanwhile; reload so the list shows the current one.
    onError: refresh,
  })
}

/** Commission and collection mode of a club (superadmin). Refreshes the list and the audit log. */
export function useClubCharging() {
  const queryClient = useQueryClient()
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: CLUBS_QUERY_KEY })
    queryClient.invalidateQueries({ queryKey: ['platform', 'audit-log'] })
  }
  return useMutation({
    mutationFn: (
      input:
        | { kind: 'commission'; id: string; body: ClubCommissionUpdate }
        | { kind: 'collection-mode'; id: string; body: ClubCollectionModeUpdate },
    ) =>
      input.kind === 'commission'
        ? clubsApi.setCommission(input.id, input.body)
        : clubsApi.setCollectionMode(input.id, input.body),
    onSuccess: refresh,
  })
}
