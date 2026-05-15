import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/auth'
import { readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const { tenantId, userId } = await requireUser(event)
  const body = await readBody(event)

  const {
    tagId,
    title,
    startTime,
    endTime,
    hourlyRate,
    description,
    isFixedPrice
  } = body

  if (!title || !startTime || !endTime) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields'
    })
  }

  const start = new Date(startTime)
  const end = new Date(endTime)
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)

  if (hours < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid time range'
    })
  }

  const rate = hourlyRate ?? 0
  const totalAmount = isFixedPrice ? rate : rate * hours

  const eventCreated = await prisma.event.create({
    data: {
      tenantId,
      tagId: tagId ?? null,
      title,
      description: description ?? null,
      startTime: start,
      endTime: end,
      hourlyRate: rate,
      totalAmount,
      isFixedPrice: isFixedPrice ? 1 : 0,
      createdBy: userId
    }
  })

  return eventCreated
})