import { getSupabaseClient } from '~/utils/supabase.client'

export default defineNuxtRouteMiddleware(async (to) => {
  const supabase = getSupabaseClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user && to.path !== '/login') {
    return navigateTo('/login')
  }
})