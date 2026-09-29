import { useQuery } from '@tanstack/react-query'
import { achievementsService } from '../services/achievementsService'

export function useAchievementsCatalog() {
  return useQuery({
    queryKey: ['achievements', 'catalog'],
    queryFn: () => achievementsService.getCatalog(),
    staleTime: 1000 * 60 * 10, // catalog rarely changes
  })
}

export function useMyAchievements() {
  return useQuery({
    queryKey: ['achievements', 'me'],
    queryFn: () => achievementsService.getMine(),
  })
}
