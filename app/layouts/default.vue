<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const open = ref(false)

const items: NavigationMenuItem[] = [
  {
    label: 'Inicio',
    icon: 'i-lucide-house',
    to: '/'
  },
]
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <UHeader toggle-side="left" :ui="{ container: 'px-4!' }">
      <template #toggle>
        <UButton
          icon="i-lucide-panel-left"
          color="neutral"
          variant="ghost"
          aria-label="Toggle sidebar"
          @click="open = !open"
        />
      </template>
      <template #title>
        Orden al Día
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
            'absolute top-(--ui-header-height) bottom-0 h-[calc(100%-var(--ui-header-height))]'
        }"
      >
        <UNavigationMenu
          :items="items"
          orientation="vertical"
          :ui="{ link: 'p-1.5 overflow-hidden' }"
        />
      </USidebar>

      <div class="flex-1 overflow-y-auto p-2 sm:p-4">
        <UMain>
          <slot />
        </UMain>
      </div>
    </div>
  </div>
</template>
