<script setup lang="ts">
const { $api } = useNuxtApp()
const { user } = useAuth()
const { color, appTitle, colores, applyColor, applyTitle } = usePreferences()

const titleDraft = ref(appTitle.value)

function guardarTitulo() {
  applyTitle(titleDraft.value.trim() || 'ORDEN AL DÍA')
  titleDraft.value = appTitle.value
}

const { data, pending } = await useAsyncData('me', () => $api<{
  userId: string
  tenantId: string
  tenantName: string
  currency: string
  role: string
}>('/me'))
</script>

<template>
  <div class="p-4 max-w-lg mx-auto">
    <h1 class="text-xl font-semibold mb-6">Configuración</h1>

    <div v-if="pending" class="space-y-3">
      <USkeleton v-for="i in 4" :key="i" class="h-12 w-full rounded-lg" />
    </div>

    <div v-else class="space-y-6">
      <!-- Cuenta -->
      <section>
        <h2 class="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Cuenta</h2>
        <div class="space-y-3">
          <div class="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3">
            <p class="text-xs text-zinc-500 mb-0.5">Email</p>
            <p class="text-sm text-zinc-200">{{ user?.email ?? '—' }}</p>
          </div>
          <div class="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3">
            <p class="text-xs text-zinc-500 mb-0.5">Rol</p>
            <p class="text-sm text-zinc-200 capitalize">{{ data?.role ?? '—' }}</p>
          </div>
        </div>
      </section>

      <!-- Organización -->
      <section>
        <h2 class="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Organización</h2>
        <div class="space-y-3">
          <div class="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3">
            <p class="text-xs text-zinc-500 mb-0.5">Nombre del tenant</p>
            <p class="text-sm text-zinc-200">{{ data?.tenantName ?? '—' }}</p>
          </div>
          <div class="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3">
            <p class="text-xs text-zinc-500 mb-0.5">Moneda</p>
            <div class="flex items-center gap-2 mt-0.5">
              <UIcon name="i-lucide-coins" class="w-4 h-4 text-zinc-400" />
              <p class="text-sm text-zinc-200">{{ data?.currency ?? '—' }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Apariencia -->
      <section>
        <h2 class="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Apariencia</h2>
        <div class="space-y-3">
          <!-- Título de la app -->
          <div class="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3">
            <p class="text-xs text-zinc-500 mb-2">Título de la aplicación</p>
            <div class="flex gap-2">
              <UInput
                v-model="titleDraft"
                class="flex-1"
                placeholder="ORDEN AL DÍA"
                @keydown.enter="guardarTitulo"
              />
              <UButton
                icon="i-lucide-check"
                color="primary"
                variant="soft"
                :disabled="titleDraft.trim() === appTitle"
                @click="guardarTitulo"
              />
            </div>
          </div>

          <!-- Color primario -->
          <div class="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3">
            <p class="text-xs text-zinc-500 mb-2">Color principal</p>
            <USelect
              :model-value="color"
              :items="colores"
              class="w-full"
              @update:model-value="applyColor"
            >
              <template #leading>
                <span
                  class="w-3 h-3 rounded-full ml-0.5 shrink-0"
                  :style="{ backgroundColor: `var(--color-${color}-500, #7c3aed)` }"
                />
              </template>
            </USelect>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>


