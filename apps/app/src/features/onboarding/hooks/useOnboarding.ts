import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { onboardingApi } from '../api/onboarding.api'
import { useAuthStore } from '../../auth/store/auth.store'

export function useCompleteOnboarding() {
  const { setUser } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => onboardingApi.complete(),
    onSuccess: (user) => {
      setUser(user)
      navigate('/')
    },
  })
}
