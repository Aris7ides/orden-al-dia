import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/auth'
import { getQuery } from 'h3'

function sumarHorasEventos(events: { startTime: Date; endTime: Date; isFixedPrice: number | null }[]) {
  return events
    .filter(e => !e.isFixedPrice)
    .reduce((sum, e) => sum + (e.endTime.getTime() - e.startTime.getTime()) / 3_600_000, 0)
}

export default defineEventHandler(async (event) => {
  const { tenantId } = await requireUser(event)
  const { mes } = getQuery(event) // formato YYYY-MM, opcional

  // Todos los eventos del tenant (para histórico)
  const todos = await prisma.event.findMany({
    where: { tenantId },
    select: {
      tagId: true,
      startTime: true,
      endTime: true,
      totalAmount: true,
      isFixedPrice: true,
      tag: { select: { id: true, name: true, color: true } }
    }
  })

  // Filtrado por mes si se indica
  let filtrados = todos
  if (mes && typeof mes === 'string' && /^\d{4}-\d{2}$/.test(mes)) {
    const [year, month] = mes.split('-').map(Number)
    filtrados = todos.filter(e => {
      return e.startTime.getFullYear() === year && e.startTime.getMonth() + 1 === month
    })
  }

  // ── Totales periodo ────────────────────────────────────────────────────────
  const periodo = {
    totalGenerado: filtrados.reduce((sum, e) => sum + (e.totalAmount ?? 0), 0),
    totalHoras: sumarHorasEventos(filtrados)
  }

  // ── Totales históricos ─────────────────────────────────────────────────────
  const historico = {
    totalGenerado: todos.reduce((sum, e) => sum + (e.totalAmount ?? 0), 0),
    totalHoras: sumarHorasEventos(todos)
  }

  // ── Desglose por etiqueta (periodo) ───────────────────────────────────────
  const mapaEtiquetas = new Map<string, {
    tagId: string | null
    nombre: string
    color: string | null
    monto: number
    horas: number
    numEventos: number
  }>()

  for (const e of filtrados) {
    const key = e.tagId ?? '__sin__'
    if (!mapaEtiquetas.has(key)) {
      mapaEtiquetas.set(key, {
        tagId: e.tagId,
        nombre: e.tag?.name ?? 'Sin etiqueta',
        color: e.tag?.color ?? null,
        monto: 0,
        horas: 0,
        numEventos: 0
      })
    }
    const entry = mapaEtiquetas.get(key)!
    entry.monto += e.totalAmount ?? 0
    entry.numEventos++
    if (!e.isFixedPrice) {
      entry.horas += (e.endTime.getTime() - e.startTime.getTime()) / 3_600_000
    }
  }

  const desglosePorEtiqueta = Array.from(mapaEtiquetas.values())
    .sort((a, b) => b.monto - a.monto)

  return { periodo, historico, desglosePorEtiqueta }
})
