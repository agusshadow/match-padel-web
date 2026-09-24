import { useMutation } from '@tanstack/react-query'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser)
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email ?? '',
          full_name: data.user.user_metadata?.full_name,
          username: data.user.user_metadata?.username,
        })
      }
    },
  })
}

export function useRegister() {
  const setUser = useAuthStore((s) => s.setUser)
  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email ?? '',
          full_name: data.user.user_metadata?.full_name,
          username: data.user.user_metadata?.username,
        })
      }
    },
  })
}
