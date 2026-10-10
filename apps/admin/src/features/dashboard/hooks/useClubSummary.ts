import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/dashboard.api'

export function useClubSummary(clubId: string) {
  return useQuery({
    queryKey: ['club-admin', clubId, 'summary'],
    queryFn: () => dashboardApi.getSummary(clubId),
  })
}
