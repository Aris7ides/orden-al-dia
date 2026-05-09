import type { User } from '@supabase/supabase-js'
import { getSupabaseClient } from '~/utils/supabase.client'

export const useAuth = () => {
  const user = useState<User | null>('user', () => null)

  const loadUser = async () => {
    if (!import.meta.client) return

    const supabase = getSupabaseClient()
    const { data } = await supabase.auth.getUser()

    user.value = data.user
  }

  const logout = async () => {
    if (!import.meta.client) return

    const supabase = getSupabaseClient()

    await supabase.auth.signOut()
    user.value = null

    await navigateTo('/login')
  }

  return {
    user,
    loadUser,
    logout
  }
}