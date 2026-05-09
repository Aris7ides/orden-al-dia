import { supabase } from '~/utils/supabase.client'

export default defineNuxtRouteMiddleware(async (to) => {
  const { data } = await supabase.auth.getUser()

  if (!data.user && to.path !== '/login') {
    return navigateTo('/login')
  }
})