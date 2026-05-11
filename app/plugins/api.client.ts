export default defineNuxtPlugin(() => {
  const supabase = getSupabaseClient()

  const api = $fetch.create({
    baseURL: '/api',
    async onRequest({ options }) {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token

      if (token) {
        const headers = new Headers(options.headers as HeadersInit)
        headers.set('Authorization', `Bearer ${token}`)
        options.headers = headers
      }
    }
  })

  return {
    provide: {
      api
    }
  }
})