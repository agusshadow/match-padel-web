import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Auth only (sign in/out, session, JWT). All data goes through the API (see lib/axios.ts).
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
