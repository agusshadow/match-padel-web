import { useEffect, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { usersApi, type UsersQuery } from '../api/users.api'

export function useUsers(query: UsersQuery) {
  return useQuery({
    queryKey: ['platform', 'users', query],
    queryFn: () => usersApi.list(query),
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
