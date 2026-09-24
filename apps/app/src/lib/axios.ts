import axios from 'axios'
import { supabase } from './supabase'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1',
  timeout: 10_000,
})

// Attach Bearer token to every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

// Handle 401 — refresh or redirect to /auth
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const { error: refreshError } = await supabase.auth.refreshSession()
      if (refreshError) {
        await supabase.auth.signOut()
        window.location.href = '/auth'
      }
    }
    return Promise.reject(error)
  },
)
