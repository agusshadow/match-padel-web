import { useEffect, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { requestsApi, type RequestsQuery } from '../api/requests.api'

export function useRequests(query: RequestsQuery) {
  return useQuery({
    queryKey: ['platform', 'requests', query],
    queryFn: () => requestsApi.list(query),
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
