import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    const config = useRuntimeConfig()
    _client = createClient(
      config.public.supabaseUrl as string,
      config.public.supabaseAnonKey as string
    )
  }
  return _client
}

// Alias para compatibilidad
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseClient() as unknown as Record<string | symbol, unknown>)[prop]
  }
})