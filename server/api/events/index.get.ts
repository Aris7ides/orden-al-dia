import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/auth'
import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const { tenantId } = await requireUser(event)
  const { from, to } = getQuery(event)

  const where: Record<string, unknown> = { tenantId }

  if (from || to) {
    where.startTime = {
      ...(from ? { gte: new Date(from as string) } : {}),
      ...(to ? { lt: new Date(to as string) } : {})
    }
  }

  const events = await prisma.event.findMany({
    where,
    include: { tag: true },
    orderBy: { startTime: 'asc' }
  })

  return events
})