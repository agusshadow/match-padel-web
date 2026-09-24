import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi, type LoginPayload, type RegisterPayload } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import { supabase } from '../../../lib/supabase'
import { useEffect } from 'react'

export function useAuthInit() {
  const { setUser, setLoading, logout } = useAuthStore()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setLoading(false)
        return
      }
      // Fetch profile
      authApi.me()
        .then(setUser)
        .catch(() => logout())
        .finally(() => setLoading(false))
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        logout()
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setLoading, logout])
}

export function useLogin() {
  const { setUser } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      setUser(data.user)
      navigate('/')
    },
  })
}

export function useRegister() {
  const { setUser } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (data) => {
      setUser(data.user)
      navigate('/')
    },
  })
}

export function useLogout() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logout()
      navigate('/auth')
    },
  })
}

export function useMe() {
  const { isAuthenticated } = useAuthStore()
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.me(),
    enabled: isAuthenticated,
  })
}
