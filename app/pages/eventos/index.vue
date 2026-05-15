<script setup lang="ts">
import type { Evento, Tag } from '~/types'
import { formatFecha, formatMonto } from '~/helpers'

const { $api } = useNuxtApp()
const toast = useToast()

// ── Mes actual ────────────────────────────────────────────
const hoy = new Date()
const mesActual = ref({ year: hoy.getFullYear(), month: hoy.getMonth() }) // 0-indexed

const mesLabel = computed(() => {
  const d = new Date(mesActual.value.year, mesActual.value.month, 1)
  return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
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

// ── Modal crear / editar ───────────────────────────────────
const modalOpen = ref(false)
const editando = ref<Evento | null>(null)

function abrirCrear() {
  editando.value = null
  modalOpen.value = true
}

function abrirEditar(e: Evento) {
  editando.value = e
  modalOpen.value = true
}

// ── Modal eliminar ─────────────────────────────────────────
const deleteModalOpen = ref(false)
const eliminando = ref<Evento | null>(null)

function abrirEliminar(e: Evento) {
  eliminando.value = e
  deleteModalOpen.value = true
}

const deleting = ref(false)

async function confirmarEliminar() {
  if (!eliminando.value) return
  deleting.value = true
  try {
    await $api(`/events`, { method: 'DELETE', query: { id: eliminando.value.id } })
    toast.add({ title: 'Evento eliminado', color: 'success' })
    deleteModalOpen.value = false
    await cargarDatos()
  } catch {
    toast.add({ title: 'Error al eliminar', color: 'error' })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="h-screen flex flex-col p-4 max-w-2xl mx-auto">
    <!-- Encabezado -->
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-semibold capitalize">{{ mesLabel }}</h1>
      <UButton icon="i-lucide-plus" @click="abrirCrear">Nuevo evento</UButton>
    </div>

    <!-- Navegación de mes -->
    <div class="flex items-center justify-between mb-6">
      <UButton icon="i-lucide-chevron-left" variant="ghost" color="neutral" @click="mesAnterior" />
      <span v-if="totalMes > 0" class="text-sm text-zinc-900 dark:text-zinc-400">
        Total: <span class="dark:text-white font-semibold">{{ formatMonto(totalMes) }}</span>
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
    <div v-else class="flex-1 overflow-y-auto space-y-2 pr-1">
      <ul class="space-y-2">
        <li
          v-for="e in eventos"
          :key="e.id"
          class="flex items-start justify-between gap-3 p-4 rounded-lg border border-primary-700 dark:border-zinc-700 bg-primary-100 dark:bg-zinc-900"
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
    </div>

    <!-- Modal crear / editar -->
    <EventoFormModal
      v-model:open="modalOpen"
      :editando="editando"
      :tags="tags"
      @guardado="cargarDatos"
    />

    <!-- Modal confirmar eliminación -->
    <UModal v-model:open="deleteModalOpen" title="Eliminar evento">
      <template #body>
        <p class="text-sm dark:text-zinc-300">
          ¿Estás seguro de que querés eliminar
          <strong class="dark:text-white">{{ eliminando?.title }}</strong>?
          Esta acción no se puede deshacer.
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton variant="ghost" color="neutral" @click="deleteModalOpen = false">Cancelar</UButton>
          <UButton color="error" :loading="deleting" @click="confirmarEliminar">Eliminar</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>