import { supabase } from '~/utils/supabase.client'

export const useAuth = () => {
  const user = useState('user', () => null)

  const loadUser = async () => {
    const { data } = await supabase.auth.getUser()
    user.value = data.user
  }

  return {
    user,
    loadUser
  }
}