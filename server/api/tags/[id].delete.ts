import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/auth'
import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  const { tenantId } = await requireUser(event)
  const id = event.context.params?.id

  if (!id) {
    throw createError({ statusCode: 400 })
  }

  await prisma.tag.updateMany({
    where: {
      id,
      tenantId
    },
    data: {
      deletedAt: new Date()
    }
  })

  return { success: true }
})