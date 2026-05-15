<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import esLocale from '@fullcalendar/core/locales/es'
import type { Tag } from '~/types'

const { $api } = useNuxtApp()
const toast = useToast()

type Evento = {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  hourlyRate: number | null
  totalAmount: number | null
  tag: Tag | null
}

// ── Eventos del calendario ────────────────────────────────
const eventosRaw = ref<Evento[]>([])

async function cargarEventos(from: string, to: string) {
  try {
    eventosRaw.value = await $api<Evento[]>('/events', { query: { from, to } })
  } catch {
    toast.add({ title: 'Error al cargar eventos', color: 'error' })
  }
}

// ── Modal detalle ─────────────────────────────────────────
const modalOpen = ref(false)
const eventoSeleccionado = ref<Evento | null>(null)
const deleteModalOpen = ref(false)
const deleting = ref(false)

function abrirDetalle(evento: Evento) {
  eventoSeleccionado.value = evento
  modalOpen.value = true
}

function pedirEliminar() {
  deleteModalOpen.value = true
}

async function confirmarEliminar() {
  if (!eventoSeleccionado.value) return
  deleting.value = true
  try {
    await $api('/events', { method: 'DELETE', query: { id: eventoSeleccionado.value.id } })
    toast.add({ title: 'Evento eliminado', color: 'success' })
    deleteModalOpen.value = false
    modalOpen.value = false
    // Refrescar la vista actual del calendario
    calendarKey.value++
  } catch {
    toast.add({ title: 'Error al eliminar', color: 'error' })
  } finally {
    deleting.value = false
  }
}

// ── Helpers ───────────────────────────────────────────────
const calendarKey = ref(0)

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString('es-ES', {
    weekday: 'long', day: '2-digit', month: 'long',
    hour: '2-digit', minute: '2-digit'
  })
}

function formatMonto(n: number) {
  return n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })
}

function duracionHoras(start: string, end: string) {
  const h = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60)
  return h % 1 === 0 ? `${h}h` : `${h.toFixed(1)}h`
}

// ── Calendario ────────────────────────────────────────────
const isMobile = ref(false)
const calendarHeight = ref(600)

function updateHeight() {
  const headerEl = document.querySelector('header')
  const headerH = headerEl?.offsetHeight ?? 64
  const verticalPadding = window.innerWidth < 640 ? 16 : 32
  calendarHeight.value = window.innerHeight - headerH - verticalPadding
}

onMounted(() => {
  const mq = window.matchMedia('(max-width: 768px)')
  isMobile.value = mq.matches
  mq.addEventListener('change', (e) => {
    isMobile.value = e.matches
    updateHeight()
  })
  updateHeight()
  window.addEventListener('resize', updateHeight)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateHeight)
})

const calendarOptions = computed(() => ({
  plugins: [interactionPlugin, timeGridPlugin, dayGridPlugin, listPlugin],
  locale: esLocale,
  initialView: 'dayGridMonth',

  headerToolbar: isMobile.value
    ? { left: 'prev,next', center: 'title', right: 'today' }
    : { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' },

  footerToolbar: isMobile.value
    ? { center: 'dayGridMonth,timeGridDay,listWeek' }
    : undefined,

  buttonText: { today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día', list: 'Lista' },

  nowIndicator: true,
  selectable: true,
  editable: false,
  selectMirror: true,
  dayMaxEvents: true,
  height: calendarHeight.value,
  expandRows: true,
  slotMinTime: '06:00:00',
  slotMaxTime: '22:00:00',

  // Cargar eventos al cambiar de mes/semana
  datesSet(info: { start: Date; end: Date }) {
    cargarEventos(info.start.toISOString(), info.end.toISOString())
  },

  events: eventosRaw.value.map(e => ({
    id: e.id,
    title: e.title,
    start: e.startTime,
    end: e.endTime,
    backgroundColor: e.tag?.color ?? '#7c3aed',
    borderColor: e.tag?.color ?? '#7c3aed',
    extendedProps: e
  })),

  eventClick(info: any) {
    abrirDetalle(info.event.extendedProps as Evento)
  }
}))

// Refrescar eventos en el mapa cuando cambian los datos
watch(eventosRaw, () => { calendarKey.value++ })
</script>

<template>
  <ClientOnly>
    <div class="sm:rounded-xl sm:shadow overflow-hidden sm:ring ring-primary-700 dark:ring-primary-400">
      <FullCalendar :key="calendarKey" :options="calendarOptions" />
    </div>

    <!-- Modal detalle de evento -->
    <UModal v-model:open="modalOpen" :title="eventoSeleccionado?.title ?? ''">
      <template #body>
        <div v-if="eventoSeleccionado" class="space-y-3 text-sm">
          <!-- Etiqueta -->
          <div v-if="eventoSeleccionado.tag" class="flex items-center gap-2">
            <span
              class="w-3 h-3 rounded-full border border-white/10"
              :style="{ backgroundColor: eventoSeleccionado.tag.color ?? '#7c3aed' }"
            />
            <span class="text-zinc-300">{{ eventoSeleccionado.tag.name }}</span>
          </div>

          <!-- Fechas -->
          <div class="flex flex-col gap-1 text-zinc-400">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-calendar" class="w-4 h-4 shrink-0" />
              <span class="capitalize">{{ formatFecha(eventoSeleccionado.startTime) }}</span>
            </div>
            <div class="flex items-center gap-2 pl-6 text-zinc-500">
              <span>hasta {{ new Date(eventoSeleccionado.endTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) }}</span>
              <span class="text-zinc-600">·</span>
              <span>{{ duracionHoras(eventoSeleccionado.startTime, eventoSeleccionado.endTime) }}</span>
            </div>
          </div>

          <!-- Monto -->
          <div v-if="eventoSeleccionado.totalAmount" class="flex items-center gap-2">
            <UIcon name="i-lucide-banknote" class="w-4 h-4 text-emerald-400" />
            <span class="text-emerald-400 font-semibold">
              {{ formatMonto(eventoSeleccionado.totalAmount) }}
            </span>
            <span v-if="eventoSeleccionado.hourlyRate" class="text-zinc-500 text-xs">
              ({{ formatMonto(eventoSeleccionado.hourlyRate) }}/h)
            </span>
          </div>

          <!-- Descripción -->
          <p v-if="eventoSeleccionado.description" class="text-zinc-400 border-t border-zinc-700 pt-3">
            {{ eventoSeleccionado.description }}
          </p>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-between w-full">
          <UButton color="error" variant="ghost" icon="i-lucide-trash-2" @click="pedirEliminar">
            Eliminar
          </UButton>
          <UButton variant="ghost" color="neutral" @click="modalOpen = false">Cerrar</UButton>
        </div>
      </template>
    </UModal>

    <!-- Modal confirmar eliminación -->
    <UModal v-model:open="deleteModalOpen" title="Eliminar evento">
      <template #body>
        <p class="text-sm text-zinc-300">
          ¿Estás seguro de que querés eliminar
          <strong class="text-white">{{ eventoSeleccionado?.title }}</strong>?
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
  </ClientOnly>
</template>
