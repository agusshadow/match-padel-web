import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ClubAdminClubUpdate } from '@match-padel/types'
import { clubApi } from '../api/club.api'

export function useClub(clubId: string) {
  return useQuery({
    queryKey: ['club-admin', clubId, 'club'],
    queryFn: () => clubApi.get(clubId),
  })
}

export function useUpdateClub(clubId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: ClubAdminClubUpdate) => clubApi.update(clubId, body),
    onSuccess: (club) => {
      queryClient.setQueryData(['club-admin', clubId, 'club'], club)
      // The club name is also in the access list used by the selector.
      queryClient.invalidateQueries({ queryKey: ['me-access'] })
    },
  })
}
