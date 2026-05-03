<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

definePageMeta({
  layout: 'blank'
})
</script>

<template>
  <UApp>

    <UError 
        :clear="{
            label: 'Volver al inicio',
            color: 'neutral',
            size: 'xl',
            icon: 'i-lucide-arrow-left',
            class: 'rounded-full'
        }"
        :error="{
            statusCode: 404,
            statusMessage: 'Página no encontrada',
            message: 'La página que estás buscando no existe.'
        }"
    />

  </UApp>
</template>
