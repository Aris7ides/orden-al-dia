<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const open = ref(false)
const { logout } = useAuth()

const items: NavigationMenuItem[] = [
  {
    label: 'Inicio',
    icon: 'i-lucide-house',
    to: '/'
  },
  {
    label: 'Eventos',
    icon: 'i-lucide-calendar-days',
    to: '/eventos'
  },
  {
    label: 'Etiquetas',
    icon: 'i-lucide-tags',
    to: '/etiquetas'
  },
  {
    label: 'Resumen',
    icon: 'i-lucide-chart-column',
    to: '/resumen'
  },
  {
    label: 'Configuracion',
    icon: 'i-lucide-settings',
    to: '/configuracion'
  },
]
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <UHeader toggle-side="left" :ui="{ root: 'border-primary-700 bg-primary-100 dark:border-primary-400 dark:bg-primary-950', container: 'px-4!' }">
      <template #toggle>
        <UButton
          icon="i-lucide-menu"
          color="neutral"
          variant="ghost"
          aria-label="Toggle sidebar"
          @click="open = !open"
        />
      </template>
      <template #title>
          <div class="p-1 rounded-lg bg-primary-100 ring ring-primary-700 dark:bg-primary-950 dark:ring-primary-400">
          <span class="font-extrabold text-lg text-primary">ORDEN AL DÍA</span>
        </div>
      </template>
      <template #right>
        <UColorModeButton />
      </template>
    </UHeader>

    <div class="flex flex-1 min-h-0 overflow-hidden">
      <USidebar
        v-model:open="open"
        collapsible="icon"
        mode="drawer"
        variant="floating"
        :ui="{
          gap: 'h-[calc(100%-var(--ui-header-height))]',
          container:
            'absolute top-(--ui-header-height) bottom-0 h-[calc(100%-var(--ui-header-height))]',
          inner: 'ring-primary-700! dark:ring-primary-400!',
          body: 'bg-primary-100 dark:bg-primary-950',
          footer: 'border-t border-t-primary-700 bg-primary-100 dark:border-t-primary-400 dark:bg-primary-950',
        }"
      >
        <UNavigationMenu
          :items="items"
          orientation="vertical"
          :ui="{ link: 'p-1.5 overflow-hidden' }"
        />
        <template #footer>
          <UButton
            label="Cerrar sesión"
            icon="i-lucide-log-out"
            color="neutral"
            variant="ghost"
            block
            class="justify-start"
            @click="logout"
          />
        </template>
      </USidebar>

      <div class="flex-1 overflow-y-auto p-2 sm:p-4">
        <UMain>
          <slot />
        </UMain>
      </div>
    </div>
  </div>
</template>
