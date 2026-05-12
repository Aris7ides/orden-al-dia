import { getSupabaseClient } from '~/utils/supabase.client'

export default defineNuxtRouteMiddleware(async (to) => {
  // La sesión de Supabase vive en localStorage (solo navegador).
  // En SSR el servidor no tiene acceso, así que omitimos la comprobación.
  if (!import.meta.client) return

  const supabase = getSupabaseClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user && to.path !== '/login') {
    return navigateTo('/login')
  }
})