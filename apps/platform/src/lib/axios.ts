import axios from 'axios'
import { supabase } from './supabase'

// VITE_API_URL already includes /api/v1.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession()
  if (data.session?.access_token) {
    config.headers.Authorization = `Bearer ${data.session.access_token}`
  }
  return config
})

// An expired or rejected token ends the session; the route guard then sends the user to /login.
api.interceptors.response.use(
  (res) => res,
  async (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      await supabase.auth.signOut()
    }
    return Promise.reject(error)
  },
)
