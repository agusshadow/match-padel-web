import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Session } from '@supabase/supabase-js'
import type { MeAccess } from '@match-padel/types'
import { supabase } from '@/lib/supabase'
import { authApi, type RegisterOwnerPayload } from '../api/auth.api'

export const ACCESS_QUERY_KEY = ['me-access'] as const

/** Supabase session (auth only). `loading` is true until the stored session was read. */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => subscription.unsubscribe()
  }, [])

  return { session, loading }
}

/** Club memberships of the signed-in user (`GET /me/access`). */
export function useAccess(enabled: boolean) {
  return useQuery<MeAccess>({
    queryKey: ACCESS_QUERY_KEY,
    queryFn: authApi.getAccess,
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })
}

/** Thrown by sign-in when the account exists but its email was never confirmed. */
export class EmailNotConfirmedError extends Error {
  constructor(public readonly email: string) {
    super('Confirmá tu email para iniciar sesión')
    this.name = 'EmailNotConfirmedError'
  }
}

export function useSignIn() {
  const queryClient = useQueryClient()
  return async ({ email, password }: { email: string; password: string }): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.code === 'email_not_confirmed') throw new EmailNotConfirmedError(email)
      throw new Error('Email o contraseña incorrectos')
    }

    // Any signed-in user may use the panel: one without clubs lands on "start your application".
    try {
      await queryClient.fetchQuery({
        queryKey: ACCESS_QUERY_KEY,
        queryFn: authApi.getAccess,
        staleTime: 0,
      })
    } catch {
      await supabase.auth.signOut()
      throw new Error('No pudimos verificar tus permisos. Intentá de nuevo en unos minutos.')
    }
  }
}

export function useSignOut() {
  const queryClient = useQueryClient()
  return async () => {
    await supabase.auth.signOut()
    queryClient.clear()
  }
}

/** Registration step 1: `POST /auth/register` (the API sends the email code). */
export function useRegisterOwner() {
  return useMutation({ mutationFn: (body: RegisterOwnerPayload) => authApi.register(body) })
}

/** Registration step 2: confirms the email with the code and opens the session (Supabase, anon key). */
export function useVerifyEmail() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ email, code }: { email: string; code: string }) => {
      const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'signup' })
      if (error) throw new Error('El código es incorrecto o venció. Pedí uno nuevo.')
      await queryClient.invalidateQueries({ queryKey: ACCESS_QUERY_KEY })
    },
  })
}

export function useResendCode() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      if (error) throw new Error('No pudimos reenviar el código. Probá de nuevo en un minuto.')
    },
  })
}
