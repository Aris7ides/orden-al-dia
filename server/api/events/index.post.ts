import { prisma } from "~~/server/utils/prisma" 

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const {
    tenantId,
    tagId,
    title,
    startTime,
    endTime,
    hourlyRate,
    createdBy
  } = body

  // 🧠 1. Validación básica
  if (!tenantId || !title || !startTime || !endTime) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields'
    })
  }

  // 🧠 2. Calcular horas
  const start = new Date(startTime)
  const end = new Date(endTime)

  const diffMs = end.getTime() - start.getTime()
  const hours = diffMs / (1000 * 60 * 60)

  if (hours <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid time range'
    })
  }

  // 🧠 3. Calcular ingreso
  const rate = hourlyRate ?? 0
  const totalAmount = rate * hours

  // 🧠 4. Crear evento
  const eventCreated = await prisma.event.create({
    data: {
      tenantId,
      tagId,
      title,
      startTime: start,
      endTime: end,
      hourlyRate: rate,
      totalAmount,
      createdBy
    }
  })

  return eventCreated
})