import { supabase } from '@/lib/supabase'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends LoginCredentials {
  full_name: string
  username: string
}

export const authService = {
  async login({ email, password }: LoginCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async register({ email, password, full_name, username }: RegisterCredentials) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name, username } },
    })
    if (error) throw error
    return data
  },

  async getSession() {
    const { data } = await supabase.auth.getSession()
    return data.session
  },
}
