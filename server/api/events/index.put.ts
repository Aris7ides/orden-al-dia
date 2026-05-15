import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/auth'
import { readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const { tenantId } = await requireUser(event)
  const body = await readBody(event)
  const { id, title, tagId, startTime, endTime, hourlyRate, description, isFixedPrice } = body

  if (!id || !title || !startTime || !endTime) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  const start = new Date(startTime)
  const end = new Date(endTime)
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)

  if (hours <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid time range' })
  }

  const rate = hourlyRate ?? 0
  const totalAmount = isFixedPrice ? rate : rate * hours

  const updated = await prisma.event.updateMany({
    where: { id, tenantId },
    data: {
      title,
      tagId: tagId ?? null,
      startTime: start,
      endTime: end,
      hourlyRate: rate,
      totalAmount,
      description: description ?? null,
      isFixedPrice: isFixedPrice ? 1 : 0
    }
  })

  return updated
})