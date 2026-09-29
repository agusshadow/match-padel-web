import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { profileService, UpdateProfilePayload } from '../services/profileService'
import { useAuthStore } from '../../auth/store/auth.store'

export function useMyProfile() {
  const { isAuthenticated } = useAuthStore()
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => profileService.getMe(),
    enabled: isAuthenticated,
  })
}

export function useMyStats() {
  const { isAuthenticated } = useAuthStore()
  return useQuery({
    queryKey: ['profile', 'me', 'stats'],
    queryFn: () => profileService.getMyStats(),
    enabled: isAuthenticated,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { setUser } = useAuthStore()

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileService.updateMe(payload),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
      // Also update the auth store with the latest data
      setUser(updatedUser)
    },
  })
}

export function useMyEloHistory() {
  const { isAuthenticated } = useAuthStore()
  return useQuery({
    queryKey: ['profile', 'me', 'elo-history'],
    queryFn: () => profileService.getMyEloHistory(),
    enabled: isAuthenticated,
  })
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()
  const { setUser } = useAuthStore()

  return useMutation({
    mutationFn: (file: File) => profileService.uploadAvatar(file),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
      setUser(updatedUser)
    },
  })
}

export function usePublicProfile(username: string | undefined) {
  return useQuery({
    queryKey: ['profile', username],
    queryFn: () => profileService.getUserByUsername(username!),
    enabled: !!username,
  })
}
