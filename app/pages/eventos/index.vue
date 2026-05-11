<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { $api } = useNuxtApp()
const toast = useToast()

type Tag = { id: string; name: string; color: string | null }
type Evento = {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  hourlyRate: number | null
  totalAmount: number | null
  tagId: string | null
  tag: Tag | null
}

// ── Mes actual ────────────────────────────────────────────
const hoy = new Date()
const mesActual = ref({ year: hoy.getFullYear(), month: hoy.getMonth() }) // 0-indexed

const mesLabel = computed(() => {
  const d = new Date(mesActual.value.year, mesActual.value.month, 1)
  return d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
})

function mesAnterior() {
  if (mesActual.value.month === 0) {
    mesActual.value = { year: mesActual.value.year - 1, month: 11 }
  } else {
    mesActual.value = { year: mesActual.value.year, month: mesActual.value.month - 1 }
  }
}

function mesSiguiente() {
  if (mesActual.value.month === 11) {
    mesActual.value = { year: mesActual.value.year + 1, month: 0 }
  } else {
    mesActual.value = { year: mesActual.value.year, month: mesActual.value.month + 1 }
  }
}

const rangoMes = computed(() => {
  const { year, month } = mesActual.value
  const from = new Date(year, month, 1).toISOString()
  const to = new Date(year, month + 1, 1).toISOString()
  return { from, to }
})

// ── Datos ─────────────────────────────────────────────────
const eventos = ref<Evento[]>([])
const tags = ref<Tag[]>([])
const loading = ref(false)

async function cargarDatos() {
  loading.value = true
  try {
    const { from, to } = rangoMes.value
    ;[eventos.value, tags.value] = await Promise.all([
      $api<Evento[]>('/events', { query: { from, to } }),
      $api<Tag[]>('/tags')
    ])
  } catch {
    toast.add({ title: 'Error al cargar eventos', color: 'error' })
  } finally {
    loading.value = false
  }
}

watch(mesActual, cargarDatos, { deep: true })
onMounted(cargarDatos)

// ── Totales ───────────────────────────────────────────────
const totalMes = computed(() =>
  eventos.value.reduce((acc, e) => acc + (e.totalAmount ?? 0), 0)
)

// ── Helpers ───────────────────────────────────────────────
function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  })
}

function formatMonto(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })
}

function toDatetimeLocal(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ── Modal crear / editar ───────────────────────────────────
const modalOpen = ref(false)
const editando = ref<Evento | null>(null)
const formLoading = ref(false)

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
  tags.value.map(t => ({ label: t.name, value: t.id, color: t.color }))
)

function abrirCrear() {
  editando.value = null
  const ahora = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const base = `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}T${pad(ahora.getHours())}:00`
  formState.title = ''
  formState.tagId = null
  formState.startTime = base
  formState.endTime = base
  formState.hourlyRate = null
  formState.description = ''
  modalOpen.value = true
}

function abrirEditar(e: Evento) {
  editando.value = e
  formState.title = e.title
  formState.tagId = e.tagId
  formState.startTime = toDatetimeLocal(e.startTime)
  formState.endTime = toDatetimeLocal(e.endTime)
  formState.hourlyRate = e.hourlyRate
  formState.description = e.description ?? ''
  modalOpen.value = true
}

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  formLoading.value = true
  try {
    const body = {
      ...payload.data,
      startTime: new Date(payload.data.startTime).toISOString(),
      endTime: new Date(payload.data.endTime).toISOString()
    }

    if (editando.value) {
      await $api('/events', { method: 'PUT', body: { id: editando.value.id, ...body } })
      toast.add({ title: 'Evento actualizado', color: 'success' })
    } else {
      await $api('/events', { method: 'POST', body })
      toast.add({ title: 'Evento creado', color: 'success' })
    }
    modalOpen.value = false
    await cargarDatos()
  } catch {
    toast.add({ title: 'Error al guardar', color: 'error' })
  } finally {
    formLoading.value = false
  }
}

// ── Modal eliminar ─────────────────────────────────────────
const deleteModalOpen = ref(false)
const eliminando = ref<Evento | null>(null)

function abrirEliminar(e: Evento) {
  eliminando.value = e
  deleteModalOpen.value = true
}

async function confirmarEliminar() {
  if (!eliminando.value) return
  formLoading.value = true
  try {
    await $api(`/events`, { method: 'DELETE', query: { id: eliminando.value.id } })
    toast.add({ title: 'Evento eliminado', color: 'success' })
    deleteModalOpen.value = false
    await cargarDatos()
  } catch {
    toast.add({ title: 'Error al eliminar', color: 'error' })
  } finally {
    formLoading.value = false
  }
}
</script>

<template>
  <div class="p-4 max-w-2xl mx-auto">
    <!-- Encabezado -->
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-semibold capitalize">{{ mesLabel }}</h1>
      <UButton icon="i-lucide-plus" @click="abrirCrear">Nuevo evento</UButton>
    </div>

    <!-- Navegación de mes -->
    <div class="flex items-center justify-between mb-6">
      <UButton icon="i-lucide-chevron-left" variant="ghost" color="neutral" @click="mesAnterior" />
      <span v-if="totalMes > 0" class="text-sm text-zinc-400">
        Total: <span class="text-white font-semibold">{{ formatMonto(totalMes) }}</span>
      </span>
      <span v-else class="text-sm text-zinc-500">Sin ingresos registrados</span>
      <UButton icon="i-lucide-chevron-right" variant="ghost" color="neutral" @click="mesSiguiente" />
    </div>

    <!-- Cargando -->
    <div v-if="loading" class="space-y-3">
      <USkeleton v-for="i in 4" :key="i" class="h-20 w-full rounded-lg" />
    </div>

    <!-- Sin eventos -->
    <div v-else-if="eventos.length === 0" class="text-center py-16 text-zinc-400">
      <UIcon name="i-lucide-calendar-x" class="w-12 h-12 mx-auto mb-3 opacity-40" />
      <p>No hay eventos este mes.</p>
      <UButton variant="ghost" color="neutral" class="mt-3" @click="abrirCrear">
        Crear el primero
      </UButton>
    </div>

    <!-- Listado -->
    <ul v-else class="space-y-2">
      <li
        v-for="e in eventos"
        :key="e.id"
        class="flex items-start justify-between gap-3 p-4 rounded-lg border border-zinc-700 bg-zinc-900"
      >
        <div class="flex items-start gap-3 min-w-0">
          <span
            v-if="e.tag"
            class="mt-1 w-3 h-3 rounded-full shrink-0 border border-white/10"
            :style="{ backgroundColor: e.tag.color ?? '#7c3aed' }"
          />
          <UIcon v-else name="i-lucide-calendar" class="mt-1 w-3 h-3 shrink-0 text-zinc-500" />
          <div class="min-w-0">
            <p class="font-medium truncate">{{ e.title }}</p>
            <p v-if="e.tag" class="text-xs text-zinc-400">{{ e.tag.name }}</p>
            <p class="text-xs text-zinc-500 mt-0.5">
              {{ formatFecha(e.startTime) }} → {{ formatFecha(e.endTime) }}
            </p>
            <p v-if="e.description" class="text-xs text-zinc-500 truncate mt-0.5">{{ e.description }}</p>
          </div>
        </div>
        <div class="flex flex-col items-end gap-1 shrink-0">
          <span v-if="e.totalAmount" class="text-sm font-semibold text-emerald-400">
            {{ formatMonto(e.totalAmount) }}
          </span>
          <div class="flex gap-1">
            <UButton icon="i-lucide-pencil" variant="ghost" color="neutral" size="sm" @click="abrirEditar(e)" />
            <UButton icon="i-lucide-trash-2" variant="ghost" color="error" size="sm" @click="abrirEliminar(e)" />
          </div>
        </div>
      </li>
    </ul>

    <!-- Modal crear / editar -->
    <UModal
      v-model:open="modalOpen"
      :title="editando ? 'Editar evento' : 'Nuevo evento'"
    >
      <template #body>
        <UForm :schema="schema" :state="formState" class="space-y-4" @submit="onSubmit">
          <UFormField name="title" label="Título" required>
            <UInput v-model="formState.title" placeholder="Ej: Reunión cliente" class="w-full" autofocus />
          </UFormField>

          <UFormField name="tagId" label="Etiqueta">
            <USelect
              v-model="formState.tagId"
              :options="tagOptions"
              value-key="value"
              label-key="label"
              placeholder="Sin etiqueta"
              class="w-full"
            />
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
              placeholder="Ej: 5000"
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
            <UButton variant="ghost" color="neutral" type="button" @click="modalOpen = false">Cancelar</UButton>
            <UButton type="submit" :loading="formLoading">
              {{ editando ? 'Guardar cambios' : 'Crear evento' }}
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <!-- Modal confirmar eliminación -->
    <UModal v-model:open="deleteModalOpen" title="Eliminar evento">
      <template #body>
        <p class="text-sm text-zinc-300">
          ¿Estás seguro de que querés eliminar
          <strong class="text-white">{{ eliminando?.title }}</strong>?
          Esta acción no se puede deshacer.
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton variant="ghost" color="neutral" @click="deleteModalOpen = false">Cancelar</UButton>
          <UButton color="error" :loading="formLoading" @click="confirmarEliminar">Eliminar</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

