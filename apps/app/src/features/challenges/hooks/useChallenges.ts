import { useQuery } from '@tanstack/react-query'
import { challengesService } from '../services/challengesService'

export function useMyChallenges() {
  return useQuery({
    queryKey: ['challenges', 'me'],
    queryFn: () => challengesService.getMine(),
  })
}
