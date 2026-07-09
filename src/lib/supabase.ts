import { createClient } from '@supabase/supabase-js'

// Publishable (anon) key + project URL are safe to ship in client code —
// access is governed by the Row-Level Security policies in supabase/schema.sql.
// Values come from .env (VITE_SUPABASE_*); the fallbacks keep the app working
// if the env file is missing during local preview.
const url =
  import.meta.env.VITE_SUPABASE_URL || 'https://qltyaomfkjvwbesbkxgi.supabase.co'
const anonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_lSRwH4TaF7a2dKW-ZxZv-w_ip1qQwuY'

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})
