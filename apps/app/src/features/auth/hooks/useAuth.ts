import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { authApi, type CompleteProfilePayload, type LoginPayload, type RegisterPayload } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import { supabase } from '../../../lib/supabase'
import { isProfileIncomplete } from '../lib/isProfileIncomplete'
import { useEffect } from 'react'

export function useAuthInit() {
  const { setUser, setLoading, logout } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setLoading(false)
        return
      }
      authApi.me()
        .then(setUser)
        .catch((err) => {
          // Card #27 (R18): a network error (offline, DNS, timeout — no
          // response at all) is not the same as an invalid/expired session.
          // Logging the user out here used to make "opened the app offline"
          // indistinguishable from "got signed out" — keep whatever session
          // state was already persisted and let the OfflineBanner explain it
          // instead.
          if (axios.isAxiosError(err) && !err.response) return
          logout()
        })
        .finally(() => setLoading(false))
    })

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
    onSuccess: async (data) => {
      // Sync tokens with the Supabase JS client so getSession() returns a valid session.
      // Without this, ProtectedRoute's useAuthInit calls getSession() → null → logout.
      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      })
      setUser(data.user)
      // A user who registered but closed the app before finishing/skipping
      // onboarding still sees it on their next login, not just right after
      // registering.
      navigate(data.user.onboarding_completed_at ? '/' : '/onboarding')
    },
    onError: (error: any, variables) => {
      // Unconfirmed account trying to log in — send them to finish
      // verification instead of showing a misleading "wrong password".
      // Note: this API's error envelope is flat ({ error: 'CODE', message })
      // rather than the target { error: { code, message } } shape — see
      // match-padel-api's CLAUDE.md "Real state vs. target" table.
      if (error?.response?.data?.error === 'EMAIL_NOT_CONFIRMED') {
        navigate(`/verify-email?email=${encodeURIComponent(variables.email)}`)
      }
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (_data, variables) => {
      // No session yet — the account stays unconfirmed until the code from
      // the "Confirm signup" email is verified (see useVerifyEmail below).
      navigate(`/verify-email?email=${encodeURIComponent(variables.email)}`)
    },
  })
}

export function useVerifyEmail() {
  const { setUser } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async ({ email, code }: { email: string; code: string }) => {
      // Confirms the email and mints a session in one step, directly against
      // Supabase (anon key) — no backend endpoint involved. supabase-js
      // persists the resulting session on this client automatically, which
      // is what the axios interceptor reads on the next request.
      const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'signup' })
      if (error) throw error
      return authApi.me()
    },
    onSuccess: (user) => {
      setUser(user)
      if (isProfileIncomplete(user)) {
        navigate('/complete-profile')
      } else {
        navigate(user.onboarding_completed_at ? '/' : '/onboarding')
      }
    },
  })
}

export function useResendVerificationCode() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      if (error) throw error
    },
  })
}

export function useCompleteProfile() {
  const { setUser } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: CompleteProfilePayload) => authApi.completeProfile(payload),
    onSuccess: (user) => {
      setUser(user)
      navigate(user.onboarding_completed_at ? '/' : '/onboarding')
    },
  })
}

export function useLogout() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      // Card #29 (R20): this used to only clear the local Zustand state, leaving
      // the Supabase JS session (set in useLogin via setSession) valid in
      // storage — reloading the page would silently restore it. Revoke the
      // real session too, and don't let a failed API call skip that.
      try {
        await authApi.logout()
      } finally {
        await supabase.auth.signOut()
      }
    },
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
