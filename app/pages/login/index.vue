<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'blank'
})

const toast = useToast()
const { loadUser } = useAuth()
const loading = ref(false)
const errorMessage = ref<string | null>(null)

const fields = [{
  name: 'email',
  type: 'email' as const,
  label: 'Correo electrónico',
  placeholder: 'tu@correo.com',
  required: true
}, {
  name: 'password',
  label: 'Contraseña',
  type: 'password' as const,
  placeholder: '••••••••',
  required: true
}]

const providers = [{
  label: 'Google',
  icon: 'i-simple-icons-google',
  onClick: async () => {
    const { getSupabaseClient } = await import('~/utils/supabase.client')
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    })
    if (error) {
      toast.add({
        title: 'Error con Google',
        description: error.message,
        color: 'error'
      })
    }
  }
}]

const schema = z.object({
  email: z.email('Correo electrónico inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres')
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  loading.value = true
  errorMessage.value = null

  const { getSupabaseClient } = await import('~/utils/supabase.client')
  const supabase = getSupabaseClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: payload.data.email,
    password: payload.data.password
  })

  loading.value = false

  if (error) {
    const mensajes: Record<string, string> = {
      'Invalid login credentials': 'Credenciales incorrectas. Revisá tu correo y contraseña.',
      'Email not confirmed': 'Tu correo aún no fue confirmado. Revisá tu bandeja de entrada.',
      'Too many requests': 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.'
    }
    errorMessage.value = mensajes[error.message] ?? 'Error al iniciar sesión. Intentá de nuevo.'
    return
  }

  await loadUser()
  await navigateTo('/')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        title="Iniciar sesión"
        description="Ingresá tus credenciales para acceder a tu cuenta."
        icon="i-lucide-calendar-check"
        :fields="fields"
        :providers="providers"
        :loading="loading"
        submit-label="Entrar"
        @submit="onSubmit"
      >
        <template v-if="errorMessage" #description>
          <p class="text-sm text-red-500 mt-1">{{ errorMessage }}</p>
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>

