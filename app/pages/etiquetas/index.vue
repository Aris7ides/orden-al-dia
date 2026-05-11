<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { $api } = useNuxtApp()
const toast = useToast()

type Tag = {
  id: string
  name: string
  color: string | null
  defaultRate: number | null
  createdAt: string
}

const tags = ref<Tag[]>([])
const loading = ref(false)
const modalOpen = ref(false)
const deleteModalOpen = ref(false)
const editingTag = ref<Tag | null>(null)
const deletingTag = ref<Tag | null>(null)
const formLoading = ref(false)

const schema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  color: z.string().optional(),
  defaultRate: z.number({ coerce: true }).positive('Debe ser mayor a 0').optional().nullable()
})

type Schema = z.output<typeof schema>

const formState = reactive({
  name: '',
  color: '#7c3aed',
  defaultRate: null as number | null
})

async function loadTags() {
  loading.value = true
  try {
    tags.value = await $api<Tag[]>('/tags')
  } catch {
    toast.add({ title: 'Error al cargar etiquetas', color: 'error' })
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingTag.value = null
  formState.name = ''
  formState.color = '#7c3aed'
  formState.defaultRate = null
  modalOpen.value = true
}

function openEdit(tag: Tag) {
  editingTag.value = tag
  formState.name = tag.name
  formState.color = tag.color ?? '#7c3aed'
  formState.defaultRate = tag.defaultRate
  modalOpen.value = true
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  formLoading.value = true
  try {
    if (editingTag.value) {
      await $api(`/tags/${editingTag.value.id}`, { method: 'PUT', body: event.data })
      toast.add({ title: 'Etiqueta actualizada', color: 'success' })
    } else {
      await $api('/tags', { method: 'POST', body: event.data })
      toast.add({ title: 'Etiqueta creada', color: 'success' })
    }
    modalOpen.value = false
    await loadTags()
  } catch {
    toast.add({ title: 'Error al guardar', color: 'error' })
  } finally {
    formLoading.value = false
  }
}

function openDelete(tag: Tag) {
  deletingTag.value = tag
  deleteModalOpen.value = true
}

async function confirmDelete() {
  if (!deletingTag.value) return
  formLoading.value = true
  try {
    await $api(`/tags/${deletingTag.value.id}`, { method: 'DELETE' })
    toast.add({ title: 'Etiqueta eliminada', color: 'success' })
    deleteModalOpen.value = false
    await loadTags()
  } catch {
    toast.add({ title: 'Error al eliminar', color: 'error' })
  } finally {
    formLoading.value = false
  }
}

onMounted(loadTags)
</script>

<template>
  <div class="p-4 max-w-2xl mx-auto">
    <!-- Encabezado -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-semibold">Etiquetas</h1>
      <UButton icon="i-lucide-plus" @click="openCreate">
        Nueva etiqueta
      </UButton>
    </div>

    <!-- Cargando -->
    <div v-if="loading" class="space-y-3">
      <USkeleton v-for="i in 4" :key="i" class="h-16 w-full rounded-lg" />
    </div>

    <!-- Sin etiquetas -->
    <div v-else-if="tags.length === 0" class="text-center py-16 text-zinc-400">
      <UIcon name="i-lucide-tag" class="w-12 h-12 mx-auto mb-3 opacity-40" />
      <p>Todavía no hay etiquetas.</p>
      <UButton variant="ghost" color="neutral" class="mt-3" @click="openCreate">
        Crear la primera
      </UButton>
    </div>

    <!-- Listado -->
    <ul v-else class="space-y-2">
      <li
        v-for="tag in tags"
        :key="tag.id"
        class="flex items-center justify-between gap-3 p-4 rounded-lg border border-zinc-700 bg-zinc-900"
      >
        <div class="flex items-center gap-3 min-w-0">
          <span
            class="w-4 h-4 rounded-full shrink-0 border border-white/10"
            :style="{ backgroundColor: tag.color ?? '#7c3aed' }"
          />
          <div class="min-w-0">
            <p class="font-medium truncate">{{ tag.name }}</p>
            <p v-if="tag.defaultRate" class="text-xs text-zinc-400">
              {{ tag.defaultRate.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }) }}/h
            </p>
          </div>
        </div>
        <div class="flex gap-1 shrink-0">
          <UButton
            icon="i-lucide-pencil"
            variant="ghost"
            color="neutral"
            size="sm"
            aria-label="Editar"
            @click="openEdit(tag)"
          />
          <UButton
            icon="i-lucide-trash-2"
            variant="ghost"
            color="error"
            size="sm"
            aria-label="Eliminar"
            @click="openDelete(tag)"
          />
        </div>
      </li>
    </ul>

    <!-- Modal crear / editar -->
    <UModal
      v-model:open="modalOpen"
      :title="editingTag ? 'Editar etiqueta' : 'Nueva etiqueta'"
    >
      <template #body>
        <UForm :schema="schema" :state="formState" class="space-y-4" @submit="onSubmit">
          <UFormField name="name" label="Nombre" required>
            <UInput
              v-model="formState.name"
              placeholder="Ej: Desarrollo"
              class="w-full"
              autofocus
            />
          </UFormField>

          <UFormField name="color" label="Color">
            <div class="flex items-center gap-3">
              <input
                v-model="formState.color"
                type="color"
                class="w-10 h-10 rounded cursor-pointer border border-zinc-600 bg-transparent p-0.5"
              />
              <span class="text-sm text-zinc-400 font-mono">{{ formState.color }}</span>
            </div>
          </UFormField>

          <UFormField name="defaultRate" label="Tarifa por hora (opcional)">
            <UInput
              v-model.number="formState.defaultRate"
              type="number"
              min="0"
              step="any"
              placeholder="Ej: 5000"
              class="w-full"
            >
              <template #trailing>
                <span class="text-zinc-400 text-sm">/h</span>
              </template>
            </UInput>
          </UFormField>

          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="ghost" color="neutral" type="button" @click="modalOpen = false">
              Cancelar
            </UButton>
            <UButton type="submit" :loading="formLoading">
              {{ editingTag ? 'Guardar cambios' : 'Crear etiqueta' }}
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <!-- Modal confirmar eliminación -->
    <UModal v-model:open="deleteModalOpen" title="Eliminar etiqueta">
      <template #body>
        <p class="text-sm text-zinc-300">
          ¿Estás seguro de que querés eliminar la etiqueta
          <strong class="text-white">{{ deletingTag?.name }}</strong>?
          Esta acción no se puede deshacer.
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton variant="ghost" color="neutral" @click="deleteModalOpen = false">
            Cancelar
          </UButton>
          <UButton color="error" :loading="formLoading" @click="confirmDelete">
            Eliminar
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

