import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/dashboard.api'

export function usePlatformSummary() {
  return useQuery({
    queryKey: ['platform', 'summary'],
    queryFn: dashboardApi.getSummary,
  })
}
