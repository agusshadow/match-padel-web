import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Session } from '@supabase/supabase-js'
import type { MeAccess } from '@match-padel/types'
import { supabase } from '@/lib/supabase'
import { authApi } from '../api/auth.api'

export const ACCESS_QUERY_KEY = ['me-access'] as const

export const NO_ACCESS_MESSAGE =
  'Tu cuenta no tiene acceso al panel de la plataforma. Este panel es solo para el equipo de Match Padel.'

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

/** Platform role of the signed-in user (`GET /me/access`). */
export function useAccess(enabled: boolean) {
  return useQuery<MeAccess>({
    queryKey: ACCESS_QUERY_KEY,
    queryFn: authApi.getAccess,
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })
}

/** Only platform staff (superadmin or reviewer) may use this panel. */
export function hasPlatformAccess(access: MeAccess): boolean {
  return access.platformRole !== null
}

export function useSignIn() {
  const queryClient = useQueryClient()
  return async ({ email, password }: { email: string; password: string }): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error('Email o contraseña incorrectos')

    let access: MeAccess
    try {
      access = await queryClient.fetchQuery({
        queryKey: ACCESS_QUERY_KEY,
        queryFn: authApi.getAccess,
        staleTime: 0,
      })
    } catch {
      await supabase.auth.signOut()
      throw new Error('No pudimos verificar tus permisos. Intentá de nuevo en unos minutos.')
    }

    if (!hasPlatformAccess(access)) {
      await supabase.auth.signOut()
      queryClient.clear()
      throw new Error(NO_ACCESS_MESSAGE)
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
