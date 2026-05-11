import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/auth'
import { getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const { tenantId } = await requireUser(event)
  const { id } = getQuery(event)

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  await prisma.event.deleteMany({
    where: { id: id as string, tenantId }
  })

  return { success: true }
})