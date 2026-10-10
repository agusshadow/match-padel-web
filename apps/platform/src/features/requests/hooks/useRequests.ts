import { useEffect, useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ClubAdminClub } from '@match-padel/types'
import { getErrorStatus } from '@/lib/errors'
import type { LifecycleAction } from '@/shared/permissions'
import { requestsApi, type RequestsQuery } from '../api/requests.api'

export const REQUESTS_QUERY_KEY = ['platform', 'requests'] as const

export function useRequests(query: RequestsQuery) {
  return useQuery({
    queryKey: [...REQUESTS_QUERY_KEY, 'list', query],
    queryFn: () => requestsApi.list(query),
    placeholderData: keepPreviousData,
  })
}

/** Number of applications waiting for review (`meta.total` of a one-row page). Used by the sidebar badge. */
export function usePendingApplicationsCount(enabled = true) {
  return useQuery({
    queryKey: [...REQUESTS_QUERY_KEY, 'pending-count'],
    queryFn: () => requestsApi.list({ status: 'pending', search: '', page: 1, limit: 1 }),
    select: (data) => data.meta.total,
    enabled,
    refetchInterval: 60_000,
  })
}

/**
 * Application detail. Document URLs are signed and expire (`documents_expires_in` seconds), so
 * the query refreshes itself a minute before that while the tab is visible.
 */
export function useApplication(clubId: string | undefined) {
  return useQuery({
    queryKey: [...REQUESTS_QUERY_KEY, 'detail', clubId],
    queryFn: () => requestsApi.detail(clubId as string),
    enabled: !!clubId,
    retry: (count, error) => {
      const status = getErrorStatus(error)
      return status !== 404 && status !== 403 && count < 2
    },
    refetchInterval: (query) => {
      const ttl = query.state.data?.documents_expires_in ?? 600
      return Math.max(30, ttl - 60) * 1000
    },
  })
}

/** Runs a review or lifecycle action and refreshes every list and the detail afterwards. */
export function useApplicationAction() {
  const queryClient = useQueryClient()
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: REQUESTS_QUERY_KEY })
    queryClient.invalidateQueries({ queryKey: ['platform', 'clubs'] })
    queryClient.invalidateQueries({ queryKey: ['platform', 'summary'] })
    queryClient.invalidateQueries({ queryKey: ['platform', 'audit-log'] })
  }
  return useMutation<ClubAdminClub, unknown, { action: LifecycleAction; clubId: string; text: string | undefined }>({
    mutationFn: ({ action, clubId, text }) => requestsApi.act(action, clubId, text),
    onSuccess: refresh,
    // 409: the status changed meanwhile; reload so the screen shows the current one.
    onError: refresh,
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
