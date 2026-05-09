import { getSupabaseClient } from '~/utils/supabase.client'

export default defineNuxtRouteMiddleware(async (to) => {
  // En modo desarrollo no se requiere autenticación
  if (import.meta.dev) return

  const supabase = getSupabaseClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user && to.path !== '/login') {
    return navigateTo('/login')
  }
})