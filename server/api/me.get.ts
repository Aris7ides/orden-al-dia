import { requireUser } from '~~/server/utils/auth'
import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const { userId, tenantId, role } = await requireUser(event)

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId }
  })

  return {
    userId,
    tenantId,
    tenantName: tenant?.name,
    currency: tenant?.currency ?? 'EUR',
    role
  }
})