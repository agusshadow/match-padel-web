import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { MyClubCreate } from '@match-padel/types'
import { myClubsApi } from '../api/my-clubs.api'

export function useCreateMyClub() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: MyClubCreate) => myClubsApi.create(body),
    // The new club must show up in the access list (selector, guards) before navigating to it.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me-access'] }),
  })
}
