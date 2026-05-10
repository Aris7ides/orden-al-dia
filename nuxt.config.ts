// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY
    }
  },
  
  debug: false,
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@vite-pwa/nuxt'
  ],
  css: ['~/assets/css/main.css'],
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'OrdenAlDía',
      short_name: 'OrdenAlDía',
      description: 'Agenda y control mensual de horas e ingresos',
      theme_color: '#111827',
      background_color: '#111827',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      lang: 'es',
      icons: [
        {
          src: '/logo-ordenaldia-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/logo-ordenaldia-512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: '/logo-ordenaldia-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    },
  }
})