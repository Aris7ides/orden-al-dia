import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { tenantId } = await requireUser(event)

  const tags = await prisma.tag.findMany({
    where: {
      tenantId,
      deletedAt: null
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return tags
})