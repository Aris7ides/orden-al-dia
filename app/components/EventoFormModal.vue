<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Evento, Tag } from '~/types'
import { toDatetimeLocal } from '~/helpers'

const props = defineProps<{
  open: boolean
  editando?: Evento | null
  tags: Tag[]
  // Fecha inicial para crear (desde el calendario)
  fechaInicial?: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'guardado': []
}>()

const { $api } = useNuxtApp()
const toast = useToast()
const loading = ref(false)

const schema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  tagId: z.string().optional().nullable(),
  startTime: z.string().min(1, 'Fecha inicio obligatoria'),
  endTime: z.string().min(1, 'Fecha fin obligatoria'),
  hourlyRate: z.coerce.number().positive().optional().nullable(),
  description: z.string().optional().nullable()
})

type Schema = z.output<typeof schema>

const formState = reactive({
  title: '',
  tagId: null as string | null,
  startTime: '',
  endTime: '',
  hourlyRate: null as number | null,
  description: ''
})

const tagOptions = computed(() =>
  props.tags.map(t => ({ label: t.name, value: t.id }))
)

// Cuando se abre el modal, inicializar el formulario
watch(() => props.open, (val) => {
  if (!val) return

  if (props.editando) {
    formState.title = props.editando.title
    formState.tagId = props.editando.tagId
    formState.startTime = toDatetimeLocal(props.editando.startTime)
    formState.endTime = toDatetimeLocal(props.editando.endTime)
    formState.hourlyRate = props.editando.hourlyRate
    formState.description = props.editando.description ?? ''
  } else {
    const base = props.fechaInicial ?? (() => {
      const ahora = new Date()
      const pad = (n: number) => String(n).padStart(2, '0')
      return `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}T${pad(ahora.getHours())}:00`
    })()
    formState.title = ''
    formState.tagId = null
    formState.startTime = base
    formState.endTime = base
    formState.hourlyRate = null
    formState.description = ''
  }
})

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    const body = {
      ...payload.data,
      startTime: new Date(payload.data.startTime).toISOString(),
      endTime: new Date(payload.data.endTime).toISOString()
    }

    if (props.editando) {
      await $api('/events', { method: 'PUT', body: { id: props.editando.id, ...body } })
      toast.add({ title: 'Evento actualizado', color: 'success' })
    } else {
      await $api('/events', { method: 'POST', body })
      toast.add({ title: 'Evento creado', color: 'success' })
    }

    emit('update:open', false)
    emit('guardado')
  } catch {
    toast.add({ title: 'Error al guardar', color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal
    :open="open"
    :title="editando ? 'Editar evento' : 'Nuevo evento'"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <UForm :schema="schema" :state="formState" class="space-y-4" @submit="onSubmit">
        <UFormField name="tagId" label="Etiqueta">
          <USelect
            v-model="formState.tagId!"
            :items="tagOptions"
            placeholder="Sin etiqueta"
            class="w-full"
            :autofocus="!editando"
          />
        </UFormField>

        <UFormField name="title" label="Título" required>
          <UInput v-model="formState.title" placeholder="Ej: Reunión cliente" class="w-full" />
        </UFormField>

        <div class="grid grid-cols-2 gap-3">
          <UFormField name="startTime" label="Inicio" required>
            <UInput v-model="formState.startTime" type="datetime-local" class="w-full" />
          </UFormField>
          <UFormField name="endTime" label="Fin" required>
            <UInput v-model="formState.endTime" type="datetime-local" class="w-full" />
          </UFormField>
        </div>

        <UFormField name="hourlyRate" label="Tarifa por hora (opcional)">
          <UInput
            v-model.number="formState.hourlyRate"
            type="number"
            min="0"
            step="any"
            placeholder="Ej: 15"
            class="w-full"
          >
            <template #trailing>
              <span class="text-zinc-400 text-sm">/h</span>
            </template>
          </UInput>
        </UFormField>

        <UFormField name="description" label="Descripción (opcional)">
          <UTextarea v-model="formState.description" placeholder="Notas del evento..." class="w-full" />
        </UFormField>

        <div class="flex justify-end gap-2 pt-2">
          <UButton variant="ghost" color="neutral" type="button" @click="emit('update:open', false)">
            Cancelar
          </UButton>
          <UButton type="submit" :loading="loading">
            {{ editando ? 'Guardar cambios' : 'Crear evento' }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
