<script setup lang="ts">
const { $api } = useNuxtApp()

// ── Período ───────────────────────────────────────────────────────────────────
const HISTORICO = '__historico__'
const periodoSeleccionado = ref(new Date().toISOString().slice(0, 7))

const opcionesPeriodo = computed(() => {
  const opciones: { label: string; value: string }[] = [
    { label: 'Histórico completo', value: HISTORICO }
  ]
  const now = new Date()
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    opciones.push({ label: label.charAt(0).toUpperCase() + label.slice(1), value: val })
  }
  return opciones
})

const modoHistorico = computed(() => periodoSeleccionado.value === HISTORICO)

// ── Tipo de respuesta ─────────────────────────────────────────────────────────
interface ResumenResponse {
  periodo: { totalGenerado: number; totalHoras: number }
  historico: { totalGenerado: number; totalHoras: number }
  desglosePorEtiqueta: {
    tagId: string | null
    nombre: string
    color: string | null
    monto: number
    horas: number
    numEventos: number
  }[]
}

// ── Datos ─────────────────────────────────────────────────────────────────────
const datos = ref<ResumenResponse | null>(null)
const cargando = ref(true)

async function cargarDatos() {
  cargando.value = true
  try {
    const query = modoHistorico.value ? {} : { mes: periodoSeleccionado.value }
    datos.value = await $api<ResumenResponse>('/resumen', { query })
  } finally {
    cargando.value = false
  }
}

onMounted(cargarDatos)
watch(periodoSeleccionado, cargarDatos)

// ── Accesores cómodos ─────────────────────────────────────────────────────────
const totalGenerado = computed(() => datos.value?.periodo.totalGenerado ?? 0)
const totalHoras = computed(() => datos.value?.periodo.totalHoras ?? 0)
const totalGeneradoHistorico = computed(() => datos.value?.historico.totalGenerado ?? 0)
const totalHorasHistorico = computed(() => datos.value?.historico.totalHoras ?? 0)
const desglosePorEtiqueta = computed(() => datos.value?.desglosePorEtiqueta ?? [])

// ── Formato ───────────────────────────────────────────────────────────────────
function fmtMonto(n: number) {
  return n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })
}

function fmtHoras(h: number) {
  const rounded = Math.round(h * 10) / 10
  return rounded % 1 === 0 ? `${rounded}h` : `${rounded.toFixed(1)}h`
}

const labelPeriodo = computed(() =>
  opcionesPeriodo.value.find(o => o.value === periodoSeleccionado.value)?.label ?? periodoSeleccionado.value
)
</script>

<template>
  <div class="p-4 space-y-6 max-w-2xl mx-auto">

    <!-- Selector de período -->
    <div class="flex items-center gap-3">
      <UIcon name="i-lucide-calendar" class="text-primary shrink-0" />
      <USelect
        v-model="periodoSeleccionado"
        :options="opcionesPeriodo"
        class="flex-1"
        size="md"
      />
    </div>

    <!-- KPIs principales -->
    <div class="grid grid-cols-2 gap-3">

      <!-- Total generado -->
      <UCard :ui="{ body: 'p-4' }">
        <div class="flex flex-col gap-1">
          <span class="text-xs text-muted uppercase tracking-wide flex items-center gap-1">
            <UIcon name="i-lucide-circle-dollar-sign" class="size-3.5" />
            Ingresos
          </span>
          <template v-if="cargando">
            <USkeleton class="h-8 w-24 mt-1" />
          </template>
          <template v-else>
            <span class="text-2xl font-bold text-primary">{{ fmtMonto(totalGenerado) }}</span>
            <span v-if="!modoHistorico" class="text-xs text-muted">
              Total histórico: {{ fmtMonto(totalGeneradoHistorico) }}
            </span>
          </template>
        </div>
      </UCard>

      <!-- Total horas -->
      <UCard :ui="{ body: 'p-4' }">
        <div class="flex flex-col gap-1">
          <span class="text-xs text-muted uppercase tracking-wide flex items-center gap-1">
            <UIcon name="i-lucide-clock" class="size-3.5" />
            Horas trabajadas
          </span>
          <template v-if="cargando">
            <USkeleton class="h-8 w-16 mt-1" />
          </template>
          <template v-else>
            <span class="text-2xl font-bold text-primary">{{ fmtHoras(totalHoras) }}</span>
            <span v-if="!modoHistorico" class="text-xs text-muted">
              Total histórico: {{ fmtHoras(totalHorasHistorico) }}
            </span>
          </template>
        </div>
      </UCard>

    </div>

    <!-- Desglose por etiqueta -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-tags" class="text-primary" />
          <span class="font-semibold text-sm">Desglose por etiqueta</span>
          <UBadge v-if="!cargando" :label="String(desglosePorEtiqueta.length)" color="neutral" variant="soft" size="sm" class="ml-auto" />
        </div>
      </template>

      <template v-if="cargando">
        <div class="space-y-3">
          <USkeleton v-for="i in 4" :key="i" class="h-12 w-full rounded-lg" />
        </div>
      </template>

      <template v-else-if="desglosePorEtiqueta.length === 0">
        <div class="py-8 text-center text-muted text-sm">
          <UIcon name="i-lucide-inbox" class="size-8 mb-2 mx-auto opacity-40" />
          <p>Sin eventos en {{ labelPeriodo.toLowerCase() }}</p>
        </div>
      </template>

      <template v-else>
        <ul class="divide-y divide-default">
          <li
            v-for="fila in desglosePorEtiqueta"
            :key="fila.nombre"
            class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <!-- Color dot -->
            <span
              class="size-2.5 rounded-full shrink-0"
              :style="fila.color ? `background-color: ${fila.color}` : ''"
              :class="!fila.color ? 'bg-muted' : ''"
            />
            <!-- Nombre + eventos -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ fila.nombre }}</p>
              <p class="text-xs text-muted">{{ fila.numEventos }} evento{{ fila.numEventos !== 1 ? 's' : '' }}</p>
            </div>
            <!-- Stats -->
            <div class="text-right shrink-0">
              <p class="text-sm font-semibold text-primary">{{ fmtMonto(fila.monto) }}</p>
              <p class="text-xs text-muted">{{ fmtHoras(fila.horas) }}</p>
            </div>
          </li>
        </ul>
      </template>
    </UCard>

  </div>
</template>

