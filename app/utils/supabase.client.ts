import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  useRuntimeConfig().public.supabaseUrl,
  useRuntimeConfig().public.supabaseAnonKey
)